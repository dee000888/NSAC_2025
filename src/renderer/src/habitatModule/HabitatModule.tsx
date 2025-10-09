import { useEffect, useState } from "react";
import { SmartBinSchema, ConsumableItemSchema } from "@renderer/lib/types";
import SmartBinItem from "./SmartBinItem";
import BinDetails from "./BinDetails";
import ModuleStatistics from "./ModuleStatistics";
import { useLocation, useNavigate } from "react-router-dom";
import surgicalModuleImage from "../assets/images/(modules)/SurgicalModule.png";
import recyclingModuleImage from "../assets/images/(modules)/RecyclingModule.png";
import labModuleImage from "../assets/images/(modules)/LabModule.png";
import plantationModuleImage from "../assets/images/(modules)/PlantationModule.png";
import livingSpaceModuleImage from "../assets/images/(modules)/LivingSpaceModule.png";
import storageModuleImage from "../assets/images/(modules)/StorageModule.png";

export default function HabitatModule(): React.ReactElement {

  const navigate = useNavigate();
  const location = useLocation();

  const { moduleName } = location.state;

  const [smartBins, setSmartBins] = useState<(SmartBinSchema & { filledPercentage: number })[]>([]);
  const [consumableItems, setConsumableItems] = useState<ConsumableItemSchema[]>([]);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  
  const [moduleImage, setModuleImage] = useState<string | null | undefined>(null);

  async function getBinData() {
    try {
      console.log(`Fetching bins for module: ${moduleName}`);
      const smartBins: (SmartBinSchema & { filledPercentage: number })[] = await window.electron.ipcRenderer.invoke("getSmartBins", moduleName);
      console.log(`Received ${smartBins.length} bins:`, smartBins);
      setSmartBins(smartBins);
    } catch (err) {
      console.error("Failed to fetch bin data:", err);
      alert("Failed to fetch bin data. Please try again.");
    }
  }

  async function getConsumableItems() {
    try {
      console.log("Fetching consumable items");
      const items: ConsumableItemSchema[] = await window.electron.ipcRenderer.invoke("getConsumableItems");
      console.log(`Received ${items.length} consumable items`);
      setConsumableItems(items);
    } catch (err) {
      console.error("Failed to fetch consumable items:", err);
    }
  }

  useEffect(() => {
    getBinData();
    getConsumableItems();
  }, []);

  const handleSelectBin = async (bin: SmartBinSchema) => {
    console.log(`Selected bin: ${bin.binId}, mobility: ${bin.mobility}`);
    setSelectedBinId(bin.binId);
  };

  const handleBackToBins = () => {
    setSelectedBinId(null);
  };


  const handleConsumableItemsUpdated = async () => {
    await getConsumableItems();
  };
  
  function getModuleImage(moduleName: string) {
    switch (moduleName) {
      case "LabModule":
        return labModuleImage;
      case "PlantationModule":
        return plantationModuleImage;
      case "LivingSpaceModule":
        return livingSpaceModuleImage;
      case "StorageModule":
        return storageModuleImage;
      case "RecyclingModule":
        return recyclingModuleImage;
      case "SurgicalModule":
        return surgicalModuleImage;
      case "":
        return "";
    }
  }
  
  useEffect(() => {
    setModuleImage(getModuleImage(moduleName));
  }, [moduleName]);

  return (
    <div className="w-full min-h-screen bg-orange-600 flex relative p-8 gap-2">

      {/* Module Info */}
      <div className="w-1/3  bg-gray-800 text-white p-6 flex flex-col rounded-md">

        {/* Module Name */}
        <h2 className="text-2xl font-bold mb-4 flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-1 pl-2 pr-2 bg-white/80 rounded-md hover:bg-white text-black"
          >
            ←
          </button>
          {moduleName}
        </h2>

        {/* Module Image */}
        <div className="mb-6">
          <img
            src={moduleImage || ""}
            alt={moduleName}
            className="w-36 h-36 object-contain bg-gray-700 rounded-lg p-2"
          />
        </div>

        {/* Module Statistics */}
        <ModuleStatistics moduleName={moduleName} />

      </div>

      {/* Bins Display or Bin Details */}
      <div className="flex-1 min-h-full bg-gray-900 p-6 rounded-md">

        {!selectedBinId ? (
          // All bin
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Smart Bins</h2>
              <button
                onClick={getBinData}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
              >
                🔄 Refresh Bins
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {smartBins.length === 0 ? (
                <div className="col-span-4 text-center py-12 text-gray-400">
                  No bins found in this module. Try refreshing or assigning bins to this module.
                </div>
              ) : (
                smartBins.map((bin) => (
                  <SmartBinItem key={bin.binId} bin={bin} onClick={handleSelectBin} onAssigned={getBinData} />
                ))
              )}
            </div>
          </>
        ) : (
          // Selected bin
          <BinDetails
            selectedBinId={selectedBinId}
            consumableItems={consumableItems}
            onBack={handleBackToBins}
            onConsumableItemsUpdated={handleConsumableItemsUpdated}
          />
        )}
      </div>
    </div>
  );
}
