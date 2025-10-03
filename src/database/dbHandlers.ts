import { ipcMain } from "electron";
import { connectDB } from "./database"

type DbCollections = "smartbin" | "trashitem";

export default function registerDbHandlers() {
  
  ipcMain.handle("getSmartBins", async (_event, moduleName) => {
    const db = await connectDB();
    const smartBins = db.collection("smartbin" as DbCollections)
      .find(
        { moduleName: moduleName },
        { projection: { _id: 0 } }
      )
    return smartBins;
  });

  ipcMain.handle("getTrashItems" as DbCollections, async (_event) => {
    const db = await connectDB();
    return db.collection("trashitem" as DbCollections).find({}).toArray();
  });
  
}
