import { ipcMain } from "electron";
import { connectDB } from "./database"

type DbCollections = "smartbin" | "trashitem" | "consumableitem";

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

  ipcMain.handle("getTrashItems", async (_event, binId) => {
    const db = await connectDB();
    const trashItem = await db.collection("trashitem" as DbCollections)
      .find(
        { binId: binId },
        { projection: { _id: 0 } }
      )
      .toArray();
    return trashItem;
  });

  ipcMain.handle("assignBinToModule", async (_event, { binId, moduleName }) => {
    const db = await connectDB();
    return await db.collection("smartbin" as DbCollections).updateOne({ binId: binId }, { $set: { moduleName: moduleName } });
  });
  
  ipcMain.handle("getTrashItemsByBin" , async (_event, { binId }) => {
    const db = await connectDB();
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
    // Calculate the weight of one item
    const weightPerItem = consumableItem.weight_kg / consumableItem.quantity;

    // Create trash item
    const trashId = `TRASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trashItem = {
      trashId: trashId,
      binId: binId,
      codeName: consumableItem.codeName,
      weight: weightPerItem
    };

    // Insert trash item
    await db.collection("trashitem").insertOne(trashItem);

    // Update consumable item quantity (decrement by 1) and adjust total weight
    const newQuantity = consumableItem.quantity - 1;
    const newWeight = consumableItem.weight_kg - weightPerItem;

    // Find and update the consumable item
    await db.collection("consumableitem").updateOne(
      { codeName: consumableItem.codeName }, 
      { 
        $set: { 
          quantity: newQuantity,
          weight_kg: newWeight
        }
        }
      );

    const tempBin = await db.collection("smartbin").findOne({binId: binId})

    if (tempBin) {
    await db.collection("smartbin").updateOne(
      { binId: binId }, 
      { 
        $set: { 
          filledPercentage: tempBin?.filledPercentage + 1
        }
        }
      );
    }

    return { success: true, trashItem };
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
    
    // Get consumable items to map codeNames to categories
    const consumableItems = await db.collection("consumableitem").find({}).toArray();
    const codeNameToCategory = new Map();
    consumableItems.forEach(item => {
      codeNameToCategory.set(item.codeName, item.category);
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
      const category = codeNameToCategory.get(item.codeName) || 'UNKNOWN';
      if (categoryWeights.hasOwnProperty(category)) {
        categoryWeights[category] += item.weight;
      }
    });
    
    return {
      binCount: bins.length,
      totalItems: trashItems.length,
      totalWeight: trashItems.reduce((sum, item) => sum + item.weight, 0),
      categoryWeights
    };
  });
  
}
