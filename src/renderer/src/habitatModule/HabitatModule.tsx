import { useEffect, useState } from "react";
import moduleImage from "../assets/images/(modules)/circular-module_1-Photoroom.png";
import { SmartBinSchema, ConsumableItemSchema, TrashItemSchema } from "@renderer/lib/types";
import SmartBinItem from "./SmartBinItem";
import BinDetails from "./BinDetails";
import ModuleStatistics from "./ModuleStatistics";
import { useLocation, useNavigate } from "react-router-dom";

export default function HabitatModule(): React.ReactElement {

  const navigate = useNavigate();
  const location = useLocation();

  const { moduleName } = location.state;

  const [smartBins, setSmartBins] = useState<(SmartBinSchema & { filledPercentage: number })[]>([]);
  const [consumableItems, setConsumableItems] = useState<ConsumableItemSchema[]>([]);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);

  async function getBinData() {
    try {
      const smartBins: (SmartBinSchema & { filledPercentage: number })[] = await window.electron.ipcRenderer.invoke("getSmartBins", moduleName);
      setSmartBins(smartBins);
    } catch (err) {
      console.error("Failed to fetch bin data:", err);
    }
  }

  async function getConsumableItems() {
    try {
      const items: ConsumableItemSchema[] = await window.electron.ipcRenderer.invoke("getConsumableItems");
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
    setSelectedBinId(bin.binId);
  };

  const handleBackToBins = () => {
    setSelectedBinId(null);
  };


  const handleConsumableItemsUpdated = async () => {
    await getConsumableItems();
  };

  return (
    <div className="w-full min-h-screen bg-red-900 flex relative p-8 gap-2">

      {/* Module Info */}
      <div className="w-1/3 h-full bg-gray-800 text-white p-6 flex flex-col rounded-md">

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
            src={moduleImage}
            alt={moduleName}
            className="w-36 h-36 object-contain bg-gray-700 rounded-lg p-2"
          />
        </div>

        {/* Module Statistics */}
        <ModuleStatistics moduleName={moduleName} />

      </div>

      {/* Bins Display or Bin Details */}
      <div className="flex-1 h-full bg-gray-900 p-6 rounded-md">

        {!selectedBinId ? (
          // All bin
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Smart Bins</h2>
            <div className="grid grid-cols-4 gap-4">
              {smartBins.map((bin) => (
                <SmartBinItem key={bin.binId} bin={bin} onClick={handleSelectBin} onAssigned={getBinData} />
              ))}
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
