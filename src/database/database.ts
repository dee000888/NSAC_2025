import { MongoClient, Db } from "mongodb";

// const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient("mongodb+srv://NSAC-user:NSAC-user@nsac-2025.ly2dauy.mongodb.net/?retryWrites=true&w=majority&appName=NSAC-2025");

let db: Db;

export async function connectDB() {
  if (!db) {
    await client.connect();
    console.log("MongoDB connected");
    db = client.db("NSAC-2025");
  }
  return db;
}
