// global.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string; // Ensures MONGODB_URI is always treated as a string
  }

  interface Global {
    mongoose: {
      conn: any;
      promise: any;
    };
  }
}
