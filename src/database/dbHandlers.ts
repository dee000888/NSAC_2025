import { ipcMain } from "electron";
import { connectDB } from "./database"

type DbCollections = "smartbin" | "trashitem";

export default function registerDbHandlers() {
  
  ipcMain.handle("getSmartBins", async (_event, moduleName) => {
    const db = await connectDB();
    const smartBins = await db.collection("smartbin" as DbCollections)
      .find(
        { moduleName: moduleName },
        { projection: { _id: 0 } }
      ).toArray();
    return smartBins;
  });

  ipcMain.handle("getTrashItems" as DbCollections, async (_event) => {
    const db = await connectDB();
    return await db.collection("trashitem" as DbCollections).find({}).toArray();
  });

  ipcMain.handle("assignBinToModule" as DbCollections, async (_event, { binId, moduleName }) => {
    const db = await connectDB();
    return await db.collection("smartbin" as DbCollections).updateOne({ binId: binId }, { $set: { moduleName: moduleName } });
  });
  
}
