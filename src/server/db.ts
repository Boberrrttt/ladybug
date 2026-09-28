import { MongoClient, MongoTopologyClosedError, type Collection, type Db, type Document } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoIndexesReady?: Promise<void>;
};

type CachedClient = MongoClient & {
  topology?: { isDestroyed(): boolean };
  s?: { hasBeenClosed?: boolean };
};

function isDeadClient(client: CachedClient) {
  if (client.s?.hasBeenClosed) {
    return true;
  }
  return client.topology?.isDestroyed() === true;
}

function resetMongoClient() {
  globalForMongo.mongoClient = undefined;
  globalForMongo.mongoIndexesReady = undefined;
}

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  const existing = globalForMongo.mongoClient as CachedClient | undefined;
  if (!existing || isDeadClient(existing)) {
    resetMongoClient();
    globalForMongo.mongoClient = new MongoClient(uri);
  }
  return globalForMongo.mongoClient;
}

export function getDb(): Db {
  return getMongoClient().db();
}

export function getCollection<Doc extends Document>(name: string): Collection<Doc> {
  return getDb().collection<Doc>(name);
}

async function syncIndex(collection: Collection, key: string, unique = false) {
  const name = `${key}_1`;
  const current = (await collection.indexes()).find((index) => index.name === name);
  if (current && Boolean(current.unique) !== unique) {
    await collection.dropIndex(name);
  }
  await collection.createIndex({ [key]: 1 }, unique ? { unique: true } : {});
}

export async function ensureIndexes() {
  if (!globalForMongo.mongoIndexesReady) {
    const database = getDb();
    globalForMongo.mongoIndexesReady = Promise.all([
      syncIndex(database.collection("users"), "email", true),
      syncIndex(database.collection("events"), "guestSlug", true),
      syncIndex(database.collection("photos"), "eventId"),
      database.collection("rateLimits").createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 }),
    ])
      .then(() => undefined)
      .catch((caughtError: unknown) => {
        if (caughtError instanceof MongoTopologyClosedError) {
          resetMongoClient();
        } else {
          globalForMongo.mongoIndexesReady = undefined;
        }
        throw caughtError;
      });
  }
  await globalForMongo.mongoIndexesReady;
}
