import { useContext, useEffect, useState } from "react";
import moduleImage from "../assets/images/(modules)/circular-module_1-Photoroom.png";
import { ResidenceContext } from "@renderer/contexts/ResidenceContext";
import { HabitatModuleType, SmartBin } from "@renderer/lib/types";

export default function HabitatModule({ moduleName }: { moduleName: HabitatModuleType }): React.ReactElement {
  
  const residenceContext = useContext(ResidenceContext);
  const [activeTab, setActiveTab] = useState<"stats" | "second">("stats");

  useEffect(() => {
    async function getBinData() {
      try {
        const smartBins: SmartBin[] = await window.electron.ipcRenderer.invoke("getSmartBins", moduleName);
        residenceContext?.setSmartBins(smartBins);
        alert(smartBins)
      } catch (err) {
        console.error("Failed to fetch bin data:", err);
      }
    }
    getBinData();
  }, [residenceContext, moduleName]);

  if (!residenceContext) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen bg-red-900 flex relative">
      
      {/* Top-left header */}
      <div className="absolute top-4 left-4 flex items-center space-x-3">
        <button
          onClick={() => residenceContext.setSelectedScene("Jezero")}
          className="p-2 bg-white/80 rounded-md hover:bg-white text-black"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-white">{moduleName}</h1>
      </div>

      {/* Left Sidebar with Tabs */}
      <div className="w-1/4 h-full bg-gray-800 text-white p-4 flex flex-col mt-8">
        <div className="flex space-x-4 border-b border-gray-600 mb-4">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-3 py-2 ${
              activeTab === "stats" ? "border-b-2 border-white" : ""
            }`}
          >
            Bin Statistics
          </button>
          <button
            onClick={() => setActiveTab("second")}
            className={`px-3 py-2 ${
              activeTab === "second" ? "border-b-2 border-white" : ""
            }`}
          >
            Second Tab
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "stats" && (
            <div>
              <h2 className="text-lg font-bold mb-2">Bin Statistics</h2>
              <ul className="space-y-2">
                {residenceContext?.smartBins.map((bin) => (
                  <li key={bin.binId}>
                    {bin.binId} - {bin.binType} ({bin.filledPercentage}%)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "second" && (
            <div>
              <h2 className="text-lg font-bold">Coming Soon...</h2>
              <p>
                {residenceContext.smartBins.toString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Habitat Area */}
      <div className="relative flex-1 h-full flex items-center justify-center">
        <img
          src={moduleImage}
          alt="Residence"
          className="h-full absolute right-5 drop-shadow-2xl"
        />

        {/* Large Circular Waste Bin Container */}
        <div className="relative w-96 h-96 rounded-full bg-black/80 flex items-center justify-center shadow-lg">
          {residenceContext?.smartBins.map((bin, i) => {
            const angle = (360 / residenceContext.smartBins.length) * i;
            const radius = 150; // adjust circle size
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);

            return (
              <div
                key={bin.binId}
                className="absolute w-16 h-16 rounded-md flex flex-col items-center justify-center text-[10px] font-bold p-1"
                style={{
                  backgroundColor: ["#86efac","#93c5fd","#fde047","#fca5a5"][i % 4],
                  transform: `translate(${x}px, ${y}px)`
                }}
              >
                <span className="text-[9px]">{bin.binType}</span>
                <span>{bin.filledPercentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
