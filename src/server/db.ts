import { MongoClient, type Collection, type Db, type Document } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoIndexesReady?: Promise<void>;
};

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  if (!globalForMongo.mongoClient) {
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
    ])
      .then(() => undefined)
      .catch((caughtError: unknown) => {
        globalForMongo.mongoIndexesReady = undefined;
        throw caughtError;
      });
  }
  await globalForMongo.mongoIndexesReady;
}
