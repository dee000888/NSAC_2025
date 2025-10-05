import { ipcMain } from "electron";
import { connectDB } from "./database"
import { HabitatModuleEnum, BinMobilityEnum, TrashItemSchema } from "../renderer/src/lib/types";

type DbCollections = "smartbin" | "trashitem" | "consumableitem" | "manufacturableitem" | "recycledmaterial" | "monthlysummary";

// Initialize database with required collections and sample data if needed
async function ensureCollectionsExist() {
  const db = await connectDB();
  console.log("Checking and initializing collections...");

  // Helper function to load JSON data from resources
  const loadJsonFromResources = (filename: string) => {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, '../../resources/' + filename);
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  };

  try {
    // Check and initialize smartbin collection
    const smartbinCount = await db.collection("smartbin").countDocuments();
    if (smartbinCount === 0) {
      console.log("Initializing smartbin collection");
      const smartbinData = loadJsonFromResources('smartbins.json');
      if (smartbinData && smartbinData.length > 0) {
        await db.collection("smartbin").insertMany(smartbinData);
      }
    }

    // Check and initialize consumableitem collection
    const consumableCount = await db.collection("consumableitem").countDocuments();
    if (consumableCount === 0) {
      console.log("Initializing consumableitem collection");
      const consumableData = loadJsonFromResources('consumableitems.json');
      if (consumableData && consumableData.length > 0) {
        await db.collection("consumableitem").insertMany(consumableData);
      }
    }

    // Check and initialize manufacturableitem collection
    const manufacturableCount = await db.collection("manufacturableitem").countDocuments();
    if (manufacturableCount === 0) {
      console.log("Initializing manufacturableitem collection");
      const manufacturableData = loadJsonFromResources('manufacturableItems.json');
      if (manufacturableData && manufacturableData.length > 0) {
        await db.collection("manufacturableitem").insertMany(manufacturableData);
      }
    }

    // Check and initialize trashitem collection with sample data
    const trashItemCount = await db.collection("trashitem").countDocuments();
    if (trashItemCount === 0) {
      console.log("Initializing trashitem collection with sample data");

      // Create sample trash items for each bin
      const bins = await db.collection("smartbin").find({}).toArray();
      const consumableItems = await db.collection("consumableitem").find({}).toArray();

      if (bins.length > 0 && consumableItems.length > 0) {
        const sampleTrashItems: TrashItemSchema[] = [];

        // Generate 3-5 trash items per bin
        for (const bin of bins) {
          const itemCount = Math.floor(Math.random() * 3) + 3; // 3-5 items

          for (let i = 0; i < itemCount; i++) {
            // Get a random consumable item
            const randomItem = consumableItems[Math.floor(Math.random() * consumableItems.length)];

            // Create a trash item
            sampleTrashItems.push({
              trashId: `TRASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              binId: bin.binId,
              codeName: randomItem.codeName,
              quantity: Math.floor(Math.random() * 3) + 1 // 1-3 quantity
            });
          }
        }

        if (sampleTrashItems.length > 0) {
          await db.collection("trashitem").insertMany(sampleTrashItems);
          console.log(`Added ${sampleTrashItems.length} sample trash items`);
        }
      }
    }

    console.log("Database initialization complete");
  } catch (err) {
    console.error("Error initializing collections:", err);
  }
}

export default function registerDbHandlers() {
  // Ensure collections are initialized
  ensureCollectionsExist();


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

    console.log(`Retrieving trash items for bin ${binId}`);

    // Get trash items for the specified bin
    const items = await db.collection("trashitem" as DbCollections)
      .find({ binId: binId }, { projection: { _id: 0 } })
      .toArray();

    console.log(`Found ${items.length} trash items for bin ${binId}:`, items);

    // If no items are found and the collection is empty, create some sample data
    if (items.length === 0) {
      const totalItemCount = await db.collection("trashitem").countDocuments();

      if (totalItemCount === 0) {
        console.log("No trash items found in database. Initializing with sample data...");
        const consumableItems = await db.collection("consumableitem").find({}).limit(5).toArray();

        if (consumableItems.length > 0) {
          const sampleTrashItems: any[] = [];

          // Create 3 sample trash items
          for (let i = 0; i < 3; i++) {
            const randomItem = consumableItems[Math.floor(Math.random() * consumableItems.length)];

            sampleTrashItems.push({
              trashId: `TRASH-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
              binId: binId,
              codeName: randomItem.codeName,
              quantity: Math.floor(Math.random() * 3) + 1 // 1-3 quantity
            });
          }

          await db.collection("trashitem").insertMany(sampleTrashItems as any[]);
          console.log(`Created ${sampleTrashItems.length} sample trash items for bin ${binId}`);

          // Return the newly created items
          return sampleTrashItems;
        }
      }
    }

    return items;
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

    console.log(`Converting consumable item ${consumableItem.codeName} to trash for bin ${binId}`);

    // No out of stock
    if (consumableItem.quantity <= 0) {
      return { success: false, data: "Out of stock" };
    }

    // Find existing trash items of the same type in the same bin
    const existingTrash = await db.collection("trashitem").findOne({
      codeName: consumableItem.codeName,
      binId: binId
    });

    if (existingTrash) {
      console.log(`Found existing trash item with ID ${existingTrash.trashId}, updating quantity`);
      await db.collection("trashitem").updateOne(
        { trashId: existingTrash.trashId, binId: binId },
        { $set: { quantity: existingTrash.quantity + 1 } });
      return { success: true, data: "Updated existing item", trashId: existingTrash.trashId };
    }

    // Create a new trash item
    const trashId = `TRASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const trashItem = {
      trashId: trashId,
      binId: binId,
      codeName: consumableItem.codeName,
      quantity: 1,
    };

    console.log(`Creating new trash item with ID ${trashId} in bin ${binId}`);

    // Insert trash item
    await db.collection("trashitem").insertOne(trashItem);

    // Find and update the consumable item
    await db.collection("consumableitem").updateOne(
      { codeName: consumableItem.codeName },
      { $set: { quantity: consumableItem.quantity - 1 } });

    return {
      success: true,
      data: "Created new trash item",
      trashId: trashId,
      trashItem: trashItem
    };

  });

  // Get trash items by category
  ipcMain.handle("getTrashItemsByCategory", async (_event, { category }) => {
    const db = await connectDB();

    // Get all consumable items to map code names to categories
    const consumableItems = await db.collection("consumableitem").find({}).toArray();
    const codeNameToCategory = new Map();
    consumableItems.forEach(item => {
      codeNameToCategory.set(item.codeName, item.category);
    });

    // Get all trash items
    const trashItems = await db.collection("trashitem").find({}).toArray();

    // Filter trash items by category
    const filteredItems = trashItems.filter(item => {
      const itemCategory = codeNameToCategory.get(item.codeName);
      return itemCategory === category;
    });

    return filteredItems;
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

    // Check if smartbin collection exists and has instation bin
    const instation = await db.collection("smartbin").findOne({
      moduleName: HabitatModuleEnum.RecyclingModule,
      mobility: BinMobilityEnum.INSTATION
    });

    if (!instation) {
      // If no instation bin is found, add one
      console.log("No instation bin found, adding one to RecyclingModule");
      await db.collection("smartbin").insertOne({
        binId: "bin_13",
        moduleName: HabitatModuleEnum.RecyclingModule,
        mobility: BinMobilityEnum.INSTATION
      });
    }

    // Find an INSTATION bin in the recycling module
    const instationBin = await db.collection("smartbin").findOne({
      moduleName: HabitatModuleEnum.RecyclingModule,
      mobility: BinMobilityEnum.INSTATION
    });

    if (!instationBin) {
      throw new Error("No INSTATION bin found in the recycling module");
    }

    // Get the source bin to check its module
    const sourceBin = await db.collection("smartbin").findOne({ binId: sourceBinId });
    if (!sourceBin) {
      throw new Error("Source bin not found");
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

    // Update filled percentage of source bin
    await db.collection("smartbin").updateOne(
      { binId: sourceBinId },
      { $set: { filledPercentage: 0 } }
    );

    // Calculate new filled percentage for INSTATION bin
    const newInstationTrashCount = await db.collection("trashitem").countDocuments({ binId: instationBin.binId });
    const newFilledPercentage = Math.min(100, newInstationTrashCount * 10); // Assuming 10 items = 100%

    await db.collection("smartbin").updateOne(
      { binId: instationBin.binId },
      { $set: { filledPercentage: newFilledPercentage } }
    );

    // Log this transaction for monthly summary
    // Get current month and year
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    // Get consumable items to map trashItems to categories
    const consumableItems = await db.collection("consumableitem").find({}).toArray();
    const codeNameToCategory = {};
    const codeNameToWeight = {};

    consumableItems.forEach(item => {
      codeNameToCategory[item.codeName] = item.category;
      codeNameToWeight[item.codeName] = item.weight_kg;
    });

    // Count trash items by category
    const trashByCategory = {
      FABRIC: 0,
      PLASTIC: 0,
      GLASS: 0,
      METAL: 0,
      PAPER: 0,
      COMPOSITE: 0
    };

    trashItems.forEach(item => {
      const category = codeNameToCategory[item.codeName];
      if (category && trashByCategory.hasOwnProperty(category)) {
        trashByCategory[category] += item.quantity;
      }
    });

    // Update monthly summary
    // const monthlySummaryKey = `${month}-${year}`;
    const existingSummary = await db.collection("monthlysummary").findOne({ month, year });

    if (existingSummary) {
      // Update existing summary
      const updateData = {};
      Object.keys(trashByCategory).forEach(category => {
        if (trashByCategory[category] > 0) {
          const fieldName = `total${category}Collected`;
          updateData[fieldName] = existingSummary[fieldName] + trashByCategory[category];
        }
      });

      await db.collection("monthlysummary").updateOne(
        { month, year },
        { $set: updateData }
      );
    } else {
      // Create new summary
      const newSummary = {
        month,
        year,
        totalFabricCollected: trashByCategory.FABRIC,
        totalPlasticCollected: trashByCategory.PLASTIC,
        totalGlassCollected: trashByCategory.GLASS,
        totalMetalCollected: trashByCategory.METAL,
        totalPaperCollected: trashByCategory.PAPER,
        totalCompositeCollected: trashByCategory.COMPOSITE,
        totalFabricRecycled: 0,
        totalPlasticRecycled: 0,
        totalGlassRecycled: 0,
        totalMetalRecycled: 0,
        totalPaperRecycled: 0,
        totalCompositeRecycled: 0
      };

      await db.collection("monthlysummary").insertOne(newSummary);
    }

    return {
      success: true,
      message: `Moved ${result.modifiedCount} items to INSTATION bin`,
      movedCount: result.modifiedCount,
      instationBinId: instationBin.binId,
      fromModule: sourceBin.moduleName
    };
  });

  ipcMain.handle("getManufacturableItems", async (_event) => {
    const db = await connectDB();

    try {
      // Check if manufacturableitem collection exists and has documents
      const collections = await db.listCollections({ name: "manufacturableitem" }).toArray();

      if (collections.length === 0 || await db.collection("manufacturableitem").countDocuments() === 0) {
        // If collection doesn't exist or is empty, create it and insert data from resources
        console.log("Initializing manufacturableitem collection with data from resources");

        try {
          // Read the manufacturableItems.json file from resources
          const fs = require('fs');
          const path = require('path');
          const dataPath = path.join(__dirname, '../../resources/manufacturableItems.json');
          const data = fs.readFileSync(dataPath, 'utf8');
          const manufacturableData = JSON.parse(data);

          // Insert into database
          if (manufacturableData && manufacturableData.length > 0) {
            // Clear any existing data
            await db.collection("manufacturableitem").deleteMany({});
            // Insert new data
            await db.collection("manufacturableitem").insertMany(manufacturableData);
            console.log(`Inserted ${manufacturableData.length} manufacturable items`);
          }
        } catch (err) {
          console.error("Failed to initialize manufacturableitem collection:", err);
          if (err instanceof Error) {
            console.error(err.stack);
          } else {
            console.error(err);
          }

          // If there's an error reading the file, create a few sample items
          const sampleItems = [
            {
              "itemName": "Habitat Insulation Panels",
              "manufactureProcess": {
                "process": "COMPRESSION_MOLDING",
                "rawMaterials": {
                  "POLYETHYLENE_FOAM": 1.8,
                  "CELLULOSE_FIBER": 0.7,
                  "ALUMINUM_FOIL": 0.2
                }
              },
              "application": "RENOVATION"
            },
            {
              "itemName": "Decorative Banners",
              "manufactureProcess": {
                "process": "SEWING",
                "rawMaterials": {
                  "POLYESTER": 0.6,
                  "COTTON": 0.2,
                  "INK": 0.03
                }
              },
              "application": "CELEBRATION"
            },
            {
              "itemName": "Carbon Filter Cartridges",
              "manufactureProcess": {
                "process": "COMPRESSION_MOLDING",
                "rawMaterials": {
                  "CARBON": 0.75,
                  "POLYPROPYLENE": 0.25,
                  "NYLON": 0.1
                }
              },
              "application": "DISCOVERY"
            }
          ];

          await db.collection("manufacturableitem").insertMany(sampleItems);
          console.log("Inserted sample manufacturable items");
        }
      }

      // Fetch and return the items
      const manufacturableItems = await db.collection("manufacturableitem" as DbCollections)
        .find({}, { projection: { _id: 0 } })
        .toArray();

      console.log(`Returning ${manufacturableItems.length} manufacturable items`);
      return manufacturableItems;
    } catch (err) {
      console.error("Error in getManufacturableItems:", err);
      return [];
    }
  });

  ipcMain.handle("getMonthlySummary", async (_event) => {
    const db = await connectDB();
    const monthlySummary = await db.collection("monthlysummary")
      .find({}, { projection: { _id: 0 } })
      .sort({ year: 1, month: 1 })
      .toArray();
    return monthlySummary;
  });

  ipcMain.handle("processTrashForRecycling", async (_event, { trashItems, processType }) => {
    const db = await connectDB();

    if (!trashItems || trashItems.length === 0) {
      return { success: false, message: "No trash items provided" };
    }

    // Get all consumable items for lookup
    const consumableItems = await db.collection("consumableitem").find({}).toArray();
    const codeNameMap = {};

    consumableItems.forEach(item => {
      codeNameMap[item.codeName] = item;
    });

    // Track recycled materials
    const recycledMaterials = {};
    const recycledByCategory = {
      FABRIC: 0,
      PLASTIC: 0,
      GLASS: 0,
      METAL: 0,
      PAPER: 0,
      COMPOSITE: 0
    };

    // Process each trash item
    for (const trashItem of trashItems) {
      const consumableInfo = codeNameMap[trashItem.codeName];

      if (!consumableInfo) {
        console.log(`Consumable info not found for ${trashItem.codeName}`);
        continue;
      }

      // Record the category for monthly summary
      if (recycledByCategory.hasOwnProperty(consumableInfo.category)) {
        recycledByCategory[consumableInfo.category] += trashItem.quantity;
      }

      // Process recycling
      if (consumableInfo.recycleProcess && Array.isArray(consumableInfo.recycleProcess)) {
        // Find appropriate recycling process if processType specified
        let processList = consumableInfo.recycleProcess;
        if (processType) {
          processList = processList.filter(p => p.process === processType);
          if (processList.length === 0) {
            processList = [consumableInfo.recycleProcess[0]]; // Fallback to first process
          }
        }

        // Apply recycling processes
        for (const process of processList) {
          if (process.outputMaterials) {
            // Calculate output materials based on item quantity
            const totalWeight = consumableInfo.weight_kg * trashItem.quantity;

            Object.entries(process.outputMaterials).forEach(([material, ratio]) => {
              const outputWeight = totalWeight * Number(ratio);
              recycledMaterials[material] = (recycledMaterials[material] || 0) + outputWeight;
            });
          }
        }
      }

      // Remove the trash item after recycling
      await db.collection("trashitem").deleteOne({ trashId: trashItem.trashId });
    }

    // Save recycled materials to database
    const timestamp = new Date();
    const recycleRecord = {
      timestamp,
      materials: recycledMaterials,
      processType: processType || "MIXED"
    };

    await db.collection("recycledmaterial").insertOne(recycleRecord);

    // Update monthly summary
    const month = timestamp.toLocaleString('default', { month: 'long' });
    const year = timestamp.getFullYear();

    const existingSummary = await db.collection("monthlysummary").findOne({ month, year });

    if (existingSummary) {
      // Update existing summary
      const updateData = {};
      Object.keys(recycledByCategory).forEach(category => {
        if (recycledByCategory[category] > 0) {
          const fieldName = `total${category}Recycled`;
          updateData[fieldName] = existingSummary[fieldName] + recycledByCategory[category];
        }
      });

      await db.collection("monthlysummary").updateOne(
        { month, year },
        { $set: updateData }
      );
    } else {
      // Create new summary with recycling data
      const newSummary = {
        month,
        year,
        totalFabricCollected: 0,
        totalPlasticCollected: 0,
        totalGlassCollected: 0,
        totalMetalCollected: 0,
        totalPaperCollected: 0,
        totalCompositeCollected: 0,
        totalFabricRecycled: recycledByCategory.FABRIC,
        totalPlasticRecycled: recycledByCategory.PLASTIC,
        totalGlassRecycled: recycledByCategory.GLASS,
        totalMetalRecycled: recycledByCategory.METAL,
        totalPaperRecycled: recycledByCategory.PAPER,
        totalCompositeRecycled: recycledByCategory.COMPOSITE
      };

      await db.collection("monthlysummary").insertOne(newSummary);
    }

    return {
      success: true,
      message: `Recycled ${trashItems.length} items successfully`,
      materials: recycledMaterials
    };
  });

  ipcMain.handle("createManufacturedItem", async (_event, { itemName, requiredMaterials }) => {
    const db = await connectDB();

    console.log(`Attempting to manufacture ${itemName} with materials:`, requiredMaterials);

    // Get current available materials
    let availableMaterials = {};

    try {
      // Check if recycledmaterial collection exists
      const collections = await db.listCollections({ name: "recycledmaterial" }).toArray();

      if (collections.length > 0) {
        // Get recycled materials from the database
        const recycledMaterials = await db.collection("recycledmaterial").find({}).toArray();

        // Sum up all available materials
        recycledMaterials.forEach(record => {
          if (record.materials) {
            Object.entries(record.materials).forEach(([material, amount]) => {
              availableMaterials[material] = (availableMaterials[material] || 0) + Number(amount);
            });
          }
        });
      } else {
        // If no recycledmaterial collection exists, initialize it with some starter materials
        console.log("No recycledmaterial collection found, initializing with demo materials");
        availableMaterials = {
          "POLYETHYLENE": 5.0,
          "ALUMINUM": 8.0,
          "CARBON_FIBER": 3.0,
          "POLYESTER": 4.0,
          "COTTON": 3.5,
          "PAPER": 5.0,
          "POLYPROPYLENE": 4.5,
          "NYLON": 3.0,
          "CARBON": 2.0,
          "POLYETHYLENE_FOAM": 3.0,
          "ALUMINUM_FOIL": 2.5,
          "ADHESIVE_RESIDUE": 1.0,
          "FABRIC_BACKING": 1.5,
          "CELLULOSE_FIBER": 2.0,
          "INK": 0.5,
          "NITRILE_RUBBER": 1.0
        };

        // Create the recycledmaterial collection with initial materials
        await db.collection("recycledmaterial").insertOne({
          timestamp: new Date(),
          materials: availableMaterials,
          processType: "INITIAL"
        });
      }
    } catch (err) {
      console.error("Error getting available materials:", err);
      return {
        success: false,
        message: "Error accessing material database",
        error: err instanceof Error ? err.message : String(err)
      };
    }

    console.log("Available materials:", availableMaterials);

    // Check if we have enough materials
    const missingMaterials = {};
    let canManufacture = true;

    Object.entries(requiredMaterials).forEach(([material, amount]) => {
      const required = Number(amount);
      const available = availableMaterials[material] || 0;

      if (available < required) {
        canManufacture = false;
        missingMaterials[material] = required - available;
      }
    });

    if (!canManufacture) {
      return {
        success: false,
        message: "Insufficient materials",
        missingMaterials
      };
    }

    // Consume materials (create new records with reduced amounts)
    const timestamp = new Date();
    const updatedMaterials = { ...availableMaterials };

    Object.entries(requiredMaterials).forEach(([material, amount]) => {
      updatedMaterials[material] -= Number(amount);
    });

    try {
      // Remove old material records
      await db.collection("recycledmaterial").deleteMany({});

      // Create new record with updated amounts
      const newRecord = {
        timestamp,
        materials: updatedMaterials,
        processType: "MANUFACTURING_OUTPUT"
      };

      await db.collection("recycledmaterial").insertOne(newRecord);

      console.log(`Successfully manufactured ${itemName}`);
      console.log("Remaining materials:", updatedMaterials);

      return {
        success: true,
        message: `Successfully manufactured ${itemName}`,
        remainingMaterials: updatedMaterials
      };
    } catch (err) {
      console.error("Error updating materials:", err);
      return {
        success: false,
        message: "Error updating material database",
        error: err instanceof Error ? err.message : String(err)
      };
    }
  });

  ipcMain.handle("getAvailableMaterials", async (_event) => {
    const db = await connectDB();

    try {
      // Check if recycledmaterial collection exists
      const collections = await db.listCollections({ name: "recycledmaterial" }).toArray();

      // Default materials in case there's no data
      let availableMaterials = {};

      if (collections.length > 0) {
        const recycledMaterials = await db.collection("recycledmaterial").find({}).toArray();

        // Sum up all available materials
        recycledMaterials.forEach(record => {
          if (record.materials) {
            Object.entries(record.materials).forEach(([material, amount]) => {
              availableMaterials[material] = (availableMaterials[material] || 0) + Number(amount);
            });
          }
        });
      }

      // If no materials exist or collection is empty, create some sample data
      if (Object.keys(availableMaterials).length === 0) {
        console.log("No recycled materials found, creating sample data");
        availableMaterials = {
          "POLYETHYLENE": 5.0,
          "ALUMINUM": 8.0,
          "CARBON_FIBER": 3.0,
          "POLYESTER": 4.0,
          "COTTON": 3.5,
          "PAPER": 5.0,
          "POLYPROPYLENE": 4.5,
          "NYLON": 3.0,
          "CARBON": 2.0,
          "POLYETHYLENE_FOAM": 3.0,
          "ALUMINUM_FOIL": 2.5,
          "ADHESIVE_RESIDUE": 1.0,
          "FABRIC_BACKING": 1.5,
          "CELLULOSE_FIBER": 2.0,
          "INK": 0.5,
          "NITRILE_RUBBER": 1.0
        };

        // Create recycledmaterial collection if it doesn't exist
        await db.collection("recycledmaterial").insertOne({
          timestamp: new Date(),
          materials: availableMaterials,
          processType: "INITIAL"
        });

        console.log("Created initial recycled materials");
      }

      return availableMaterials;
    } catch (err) {
      console.error("Error getting available materials:", err);
      // Return some default materials in case of error
      return {
        "POLYETHYLENE": 5.0,
        "ALUMINUM": 8.0,
        "POLYESTER": 4.0,
        "COTTON": 3.5,
        "POLYPROPYLENE": 4.5
      };
    }
  });

  ipcMain.handle("getBinFullnessStatus", async (_event) => {
    const db = await connectDB();

    // Get all smart bins
    const bins = await db.collection("smartbin").find({}).toArray();
    const binStatus = {};

    // Get counts of trash items per bin
    for (const bin of bins) {
      const trashCount = await db.collection("trashitem").countDocuments({ binId: bin.binId });
      // Calculate fullness (assuming 10 items = 100% full)
      const fullnessPercentage = Math.min(100, Math.round((trashCount / 10) * 100));

      binStatus[bin.binId] = {
        moduleName: bin.moduleName,
        mobility: bin.mobility,
        trashCount,
        fullnessPercentage
      };
    }

    return binStatus;
  });
}
