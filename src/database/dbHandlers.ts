import { ipcMain } from "electron";
import { connectDB } from "./database"
import { HabitatModuleEnum } from "../renderer/src/lib/types";

type DbCollections = "smartbin" | "trashitem" | "consumableitem" | "manufacturableitem";

export default function registerDbHandlers() {

  ipcMain.handle("getSmartBins", async (_event, moduleName) => {
    const db = await connectDB();
    const smartBins = await db.collection("smartbin" as DbCollections)
      .find(
        { moduleName: moduleName },
        { projection: { _id: 0 } }
      ).toArray();
    const trashItems = await db.collection("trashitem" as DbCollections)
      .find({})
      .toArray();

    let updatedBins = smartBins.map((bin) => {
      const filledPercentage = trashItems.filter((item) => item.binId === bin.binId).length;
      return { ...bin, filledPercentage };
    });

    return updatedBins;
  });

  ipcMain.handle("getTrashItems", async (_event, binId) => {
    const db = await connectDB();
    const trashItems = await db.collection("trashitem" as DbCollections)
      .find(
        { binId: binId },
        { projection: { _id: 0 } }
      )
      .toArray();
    return trashItems;
  });

  ipcMain.handle("assignBinToModule", async (_event, { binId, moduleName }) => {
    const db = await connectDB();
    return await db.collection("smartbin" as DbCollections).updateOne({ binId: binId }, { $set: { moduleName: moduleName } });
  });

  ipcMain.handle("getTrashItemsByBin", async (_event, { binId }) => {
    const db = await connectDB();
    console.log(await db.collection("trashitem" as DbCollections).find({ binId: binId }, { projection: { _id: 0 } }).toArray())
    return await db.collection("trashitem" as DbCollections).find({ binId: binId }, { projection: { _id: 0 } }).toArray();
  });

  ipcMain.handle("getConsumableItems", async (_event) => {
    const db = await connectDB();
    const consumableItems = await db.collection("consumableitem" as DbCollections)
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return consumableItems;
  });

  ipcMain.handle("convertConsumableToTrash", async (_event, { consumableItem, binId }) => {
    const db = await connectDB();

    // No out of stock
    if (consumableItem.quantity <= 0) {
      return { success: false, data: "Out of stock" };
    }

    // Find existing trash items of the same type
    const existingTrash = await db.collection("trashitem").findOne({ codeName: consumableItem.codeName });

    if (existingTrash) {
      await db.collection("trashitem").updateOne(
        { codeName: consumableItem.codeName }, 
        { $set: { quantity: existingTrash.quantity + 1 } });
      return { success: true, data: "Updated" };
    }

    // Create trash item
    const trashId = `TRASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trashItem = {
      trashId: trashId,
      binId: binId,
      codeName: consumableItem.codeName,
      quantity: 1,
    };

    // Insert trash item
    await db.collection("trashitem").insertOne(trashItem);

    // Find and update the consumable item
    await db.collection("consumableitem").updateOne(
      { codeName: consumableItem.codeName }, 
      { $set: { quantity: consumableItem.quantity - 1 } });

    return { success: true, data: "Updated" };

  });

  ipcMain.handle("getBinCountByModule", async (_event, moduleName) => {
    const db = await connectDB();
    const count = await db.collection("smartbin").countDocuments({ moduleName: moduleName });
    return count;
  });

  ipcMain.handle("getTrashSummaryByModule", async (_event, moduleName) => {
    const db = await connectDB();

    // Get all bins in this module
    const bins = await db.collection("smartbin").find({ moduleName: moduleName }).toArray();
    const binIds = bins.map(bin => bin.binId);

    // Get all trash items in these bins
    const trashItems = await db.collection("trashitem").find({ binId: { $in: binIds } }).toArray();

    // Lookup table: Get consumable items to map codeNames to categories
    const consumableItems = await db.collection("consumableitem").find({}).toArray();
    const codeNameToCategory = new Map();
    consumableItems.forEach(item => {
      codeNameToCategory.set(item.codeName, item.category);
    });
    
    const codeNameToWeight = new Map();
    consumableItems.forEach(item => {
      codeNameToWeight.set(item.codeName, item.weight_kg);
    });

    // Calculate weights by category
    const categoryWeights = {
      FABRIC: 0,
      POLYMER: 0,
      GLASS: 0,
      METAL: 0,
      COMPOSITE: 0,
      PAPER: 0
    };

    trashItems.forEach(item => {
      const category = codeNameToCategory.get(item.codeName);
      if (category && categoryWeights.hasOwnProperty(category)) {
        categoryWeights[category] += codeNameToWeight.get(item.codeName);
      }
    });
    
    return {
      binCount: bins.length,
      totalItems: trashItems.length,
      totalWeight: trashItems.reduce((sum, item) => sum + item.weight_kg, 0).toFixed(3),
      categoryWeights
    };
  });

  ipcMain.handle("dumpBinToInstation", async (_event, { sourceBinId }) => {
    const db = await connectDB();

    // Find an INSTATION bin in the same module
    const instationBin = await db.collection("smartbin").findOne({
      moduleName: HabitatModuleEnum.RecyclingModule,
      mobility: "INSTATION"
    });

    if (!instationBin) {
      throw new Error("No INSTATION bin found in this module");
    }

    // Get all trash items from the source bin
    const trashItems = await db.collection("trashitem").find({ binId: sourceBinId }).toArray();

    if (trashItems.length === 0) {
      return { success: true, message: "No trash items to dump", movedCount: 0 };
    }

    // Move all trash items to the INSTATION bin
    const result = await db.collection("trashitem").updateMany(
      { binId: sourceBinId },
      { $set: { binId: instationBin.binId } }
    );

    // Update filled percentage of both bins
    const sourceBin = await db.collection("smartbin").findOne({ binId: sourceBinId });
    if (sourceBin) {
      await db.collection("smartbin").updateOne(
        { binId: sourceBinId },
        { $set: { filledPercentage: 0 } }
      );
    }

    // Calculate new filled percentage for INSTATION bin
    const newInstationTrashCount = await db.collection("trashitem").countDocuments({ binId: instationBin.binId });
    const newFilledPercentage = Math.min(100, newInstationTrashCount * 10); // Assuming 10 items = 100%

    await db.collection("smartbin").updateOne(
      { binId: instationBin.binId },
      { $set: { filledPercentage: newFilledPercentage } }
    );

    return {
      success: true,
      message: `Moved ${result.modifiedCount} items to INSTATION bin`,
      movedCount: result.modifiedCount,
      instationBinId: instationBin.binId
    };
  });

  ipcMain.handle("getManufacturableItems", async (_event) => {
    const db = await connectDB();
    const manufacturableItems = await db.collection("manufacturableitem" as DbCollections)
      .find({}, { projection: { _id: 0 } })
      .toArray();
    return manufacturableItems;
  });

}
