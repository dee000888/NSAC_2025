import { useContext, useEffect, useState } from "react";
import moduleImage from "../assets/images/(modules)/circular-module_1-Photoroom.png";
import { ResidenceContext } from "@renderer/contexts/ResidenceContext";
import { HabitatModuleEnum, SmartBinSchema, ConsumableItemSchema, TrashItemSchema } from "@renderer/lib/types";
import SmartBinItem from "./SmartBinItem";
import ConsumableItemsPopup from "./ConsumableItemsPopup";
import ModuleStatistics from "./ModuleStatistics";

export default function HabitatModule({ moduleName }: { moduleName: HabitatModuleEnum }): React.ReactElement {
  
  const residenceContext = useContext(ResidenceContext);

  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  async function getBinData() {
    try {
      const smartBins: SmartBinSchema[] = await window.electron.ipcRenderer.invoke("getSmartBins", moduleName);
      residenceContext?.setSmartBins(smartBins);
    } catch (err) {
      console.error("Failed to fetch bin data:", err);
    }
  }

  async function getTrashData() {
    try {
      const trashItems: TrashItemSchema[] = await window.electron.ipcRenderer.invoke("getTrashItems", selectedBinId);
      residenceContext?.setTrashItems(trashItems);
    } catch (err) {
      console.error("Failed to fetch trash data:", err);
    }
  }

  useEffect(() => {
    getBinData();
    getTrashData();
  }, []);

  useEffect(() => {
    getTrashData();
  }, [selectedBinId]);

  

  async function handleSelectBin(bin: SmartBinSchema) {
    try {
      setSelectedBinId(bin.binId);
      const items = await window.electron.ipcRenderer.invoke("getTrashItemsByBin", bin.binId);
      residenceContext?.setTrashItems(items);
    } catch (err) {
      console.error("Failed to load trash items:", err);
    }
  }

  if (!residenceContext) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen bg-red-900 flex relative p-8 gap-2">

      {/* Module Info */}
      <div className="w-1/3 h-full bg-gray-800 text-white p-6 flex flex-col rounded-md">
        
        {/* Module Name */}
        <h2 className="text-2xl font-bold mb-4 flex gap-4">
          <button
            onClick={() => residenceContext.setSelectedScene("Jezero")}
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
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Smart Bins</h2>
            <div className="grid grid-cols-4 gap-4">
              {residenceContext?.smartBins.map((bin) => (
                <SmartBinItem key={bin.binId} bin={bin} onClick={handleSelectBin} onAssigned={getBinData} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Bin Contents</h2>
              <div className="flex gap-3">
                <button
                  className="p-2 px-3 bg-green-600 hover:bg-green-500 rounded text-white"
                  onClick={() => setIsPopupOpen(true)}
                >
                  Insert Trash
                </button>
                <button
                  className="p-2 px-3 bg-white/20 hover:bg-white/30 rounded text-white"
                  onClick={() => {
                    setSelectedBinId(null);
                    residenceContext.setTrashItems([]);
                  }}
                >
                  Back to Bins
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-white text-sm mb-3">Bin ID: {selectedBinId}</div>
              <div className="grid grid-cols-3 gap-3">
                {residenceContext.trashItems.length === 0 && (
                  <div className="text-gray-300">No items in this bin.</div>
                )}
                {residenceContext.trashItems.map((item) => (
                  <div key={item.trashId} className="bg-gray-700 p-3 rounded text-white">
                    <div className="text-xs text-gray-300 mb-1">ID: {item.trashId}</div>
                    <div className="text-sm font-semibold mb-1">{item.codeName}</div>
                    {/*<div className="text-xs">Category: {item.category}</div>*/}
                    <div className="text-xs">Weight: {item.weight} kg</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Consumable Items Popup */}
      <ConsumableItemsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSelectItem={async (item: ConsumableItemSchema) => {
          setIsPopupOpen(false);
          // Refresh trash items after adding new item
          if (selectedBinId) {
            try {
              const items = await window.electron.ipcRenderer.invoke("getTrashItems", selectedBinId);
              residenceContext?.setTrashItems(items);
              console.log(`Item ${item.name} successfully added to bin ${selectedBinId}`);
              
              // Refresh the trash data to update statistics
              getTrashData();
            } catch (err) {
              console.error("Failed to refresh trash items:", err);
            }
          }
        }}
        binId={selectedBinId || ""}
      />
    </div>
  );
}
