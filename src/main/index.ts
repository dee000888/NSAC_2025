import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import fs from 'fs';
import path from 'path';
import registerDbHandlers from "../database/dbHandlers";

function createWindow(): void {

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Initialize database collections with sample data
  initializeCollectionsWithData()
    .then(() => {
      // Register database handlers after initialization
      registerDbHandlers();
      console.log("Database handlers registered");
    })
    .catch(err => {
      console.error("Failed to initialize database:", err);
    });

  // Main window
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Function to initialize database collections with sample data
async function initializeCollectionsWithData(): Promise<void> {
  try {
    const { connectDB } = await import('../database/database');
    const db = await connectDB();
    console.log("Connected to database, checking collections...");

    // Check if manufacturableitem collection exists and has documents
    const manufacturableCount = await db.collection('manufacturableitem').countDocuments();
    if (manufacturableCount === 0) {
      console.log("Initializing manufacturableitem collection");

      try {
        // Read manufacturableItems.json from resources folder
        const resourcePath = path.join(__dirname, '../../resources/manufacturableItems.json');
        const data = fs.readFileSync(resourcePath, 'utf8');
        const items = JSON.parse(data);

        if (items && items.length > 0) {
          console.log(`Inserting ${items.length} manufacturable items`);
          await db.collection('manufacturableitem').insertMany(items);
        }
      } catch (err) {
        console.error("Failed to load manufacturableItems:", err);
      }
    } else {
      console.log(`Found ${manufacturableCount} existing manufacturable items`);
    }

    // Check if trashitem collection exists and has documents
    const trashCount = await db.collection('trashitem').countDocuments();
    if (trashCount === 0) {
      console.log("Initializing trashitem collection with sample data");

      try {
        // Get bins and consumable items to create sample trash
        const bins = await db.collection('smartbin').find({}).toArray();
        const consumableItems = await db.collection('consumableitem').find({}).limit(10).toArray();

        if (bins.length > 0 && consumableItems.length > 0) {
          const sampleTrashItems = [];

          // Create sample trash items for each bin
          for (const bin of bins) {
            // Add 2-5 random trash items to each bin
            const itemCount = Math.floor(Math.random() * 4) + 2;

            for (let i = 0; i < itemCount; i++) {
              // Get random consumable
              const randomItem = consumableItems[Math.floor(Math.random() * consumableItems.length)];

              // Create trash item
              sampleTrashItems.push({
                trashId: `TRASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                binId: bin.binId,
                codeName: randomItem.codeName,
                quantity: Math.floor(Math.random() * 3) + 1 // 1-3 items
              });
            }
          }

          if (sampleTrashItems.length > 0) {
            await db.collection('trashitem').insertMany(sampleTrashItems);
            console.log(`Inserted ${sampleTrashItems.length} sample trash items`);
          }
        }
      } catch (err) {
        console.error("Failed to create sample trash items:", err);
      }
    } else {
      console.log(`Found ${trashCount} existing trash items`);
    }

    // Check if consumableitem collection exists and has documents
    const consumableCount = await db.collection('consumableitem').countDocuments();
    if (consumableCount === 0) {
      console.log("Initializing consumableitem collection");

      try {
        // Read consumableitems.json from resources folder
        const resourcePath = path.join(__dirname, '../../resources/consumableitems.json');
        const data = fs.readFileSync(resourcePath, 'utf8');
        const items = JSON.parse(data);

        if (items && items.length > 0) {
          console.log(`Inserting ${items.length} consumable items`);
          await db.collection('consumableitem').insertMany(items);
        }
      } catch (err) {
        console.error("Failed to load consumableItems:", err);
      }
    } else {
      console.log(`Found ${consumableCount} existing consumable items`);
    }

    // Create recycledmaterial collection with initial materials if it doesn't exist
    const recycledCount = await db.collection('recycledmaterial').countDocuments();
    if (recycledCount === 0) {
      console.log("Initializing recycled materials with sample data");

      // Sample starting materials
      const initialMaterials = {
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
        "ALUMINUM_FOIL": 2.5
      };

      await db.collection('recycledmaterial').insertOne({
        timestamp: new Date(),
        materials: initialMaterials,
        processType: "INITIAL"
      });

      console.log("Created initial recycled materials");
    } else {
      console.log(`Found ${recycledCount} existing recycled material records`);
    }

    // Check if smartbin collection exists and has documents
    const binCount = await db.collection('smartbin').countDocuments();
    if (binCount === 0) {
      console.log("Initializing smartbin collection");

      try {
        // Read smartbins.json from resources folder
        const resourcePath = path.join(__dirname, '../../resources/smartbins.json');
        const data = fs.readFileSync(resourcePath, 'utf8');
        const bins = JSON.parse(data);

        if (bins && bins.length > 0) {
          console.log(`Inserting ${bins.length} smart bins`);
          await db.collection('smartbin').insertMany(bins);
        }
      } catch (err) {
        console.error("Failed to load smart bins:", err);
      }
    } else {
      console.log(`Found ${binCount} existing smart bins`);
    }

    console.log("Database initialization complete");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}
