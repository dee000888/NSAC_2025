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
    const trashItem = await db.collection("trashitem" as DbCollections)
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return trashItem;
  });

  ipcMain.handle("assignBinToModule" as DbCollections, async (_event, { binId, moduleName }) => {
    const db = await connectDB();
    return await db.collection("smartbin" as DbCollections).updateOne({ binId: binId }, { $set: { moduleName: moduleName } });
  });
  
  ipcMain.handle("getTrashItemsByBin" as DbCollections, async (_event, { binId }) => {
    const db = await connectDB();
    return await db.collection("trashitem" as DbCollections).find({ binId: binId }, { projection: { _id: 0 } }).toArray();
  });
  
}
