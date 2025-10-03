import { ipcMain } from "electron";
import { connectDB } from "./database"

type Collections = "smartbin" | "trashitem";

export default function registerDbHandlers() {
  
  ipcMain.handle("getSmartBins", async (_event) => {
    const db = await connectDB();
    return db.collection("smartbin" as Collections).find({}).toArray();
  });

  ipcMain.handle("getTrashItems" as Collections, async (_event) => {
    const db = await connectDB();
    return await db.collection("trashitem" as Collections).find({}).toArray();
  });
  
}
