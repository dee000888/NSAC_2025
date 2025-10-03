import { MongoClient, Db } from "mongodb";

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let db: Db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    console.log("MongoDB connected");
    db = client.db("NSAC_2025");
  }
  return db;
}
