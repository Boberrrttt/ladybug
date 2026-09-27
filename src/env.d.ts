declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI?: string;
    SESSION_SECRET?: string;
    IMAGEKIT_PRIVATE_KEY?: string;
    IMAGEKIT_URL_ENDPOINT?: string;
  }
}
