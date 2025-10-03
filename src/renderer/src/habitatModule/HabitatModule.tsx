import { useContext, useEffect, useState } from "react";
import moduleImage from "../assets/images/(modules)/circular-module_1-Photoroom.png";
import { ResidenceContext } from "@renderer/contexts/ResidenceContext";
import { HabitatModuleType, SmartBin } from "@renderer/lib/types";
import SmartBinItem from "./SmartBinItem";

export default function HabitatModule({ moduleName }: { moduleName: HabitatModuleType }): React.ReactElement {
  
  const residenceContext = useContext(ResidenceContext);

  async function getBinData() {
    try {
      const smartBins: SmartBin[] = await window.electron.ipcRenderer.invoke("getSmartBins", moduleName);
      residenceContext?.setSmartBins(smartBins);
    } catch (err) {
      console.error("Failed to fetch bin data:", err);
    }
  }

  useEffect(() => {
    getBinData();
  }, []);

  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);

  async function handleSelectBin(bin: SmartBin) {
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

        {/* Mock Statistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Module Statistics</h3>
          
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Oxygen Level</span>
              <span className="text-green-400">95.2%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{width: '95.2%'}}></div>
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Temperature</span>
              <span className="text-blue-400">22.3°C</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{width: '74%'}}></div>
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Humidity</span>
              <span className="text-yellow-400">68%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full" style={{width: '68%'}}></div>
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Power Status</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="text-sm text-gray-300">Last updated: 2 min ago</div>
          </div>
        </div>
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
                    <div className="text-xs">Category: {item.category}</div>
                    <div className="text-xs">Weight: {item.weight} kg</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
