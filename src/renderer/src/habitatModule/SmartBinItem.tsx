import { useMemo, useState } from "react";
import { HabitatModuleType, SmartBin } from "@renderer/lib/types";

export default function SmartBinItem({
  bin,
  onClick,
  onAssigned,
}: {
  bin: SmartBin;
  onClick: (bin: SmartBin) => void;
  onAssigned?: () => void;
}): React.ReactElement {
  
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<HabitatModuleType | "">("");
  
  const cardClass = useMemo(() => {
    // Different gray shades by bin type
    switch (bin.binType) {
      case "INDOOR":
        return "bg-gray-600";
      case "OUTDOOR":
        return "bg-gray-700";
      case "INSTATION":
        return "bg-gray-800";
      default:
        return "bg-gray-600";
    }
  }, [bin.binType]);

  async function handleAssignConfirm() {
    if (!selectedModule) return;
    try {
      await window.electron.ipcRenderer.invoke("assignBinToModule", {
        binId: bin.binId,
        moduleName: selectedModule,
      });
      setIsAssignOpen(false);
      setSelectedModule("");
      onAssigned?.();
    } catch (err) {
      console.error("Failed to assign bin:", err);
    }
  }

  return (
    <div className={`${cardClass} rounded-lg p-4 text-white relative`}>
      
      {bin.binType === "INDOOR" && (
        <button
          className="absolute top-2 right-2 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded"
          onClick={() => setIsAssignOpen(true)}
        >
          Assign
        </button>
      )}

      <button className="text-left w-full" onClick={() => onClick(bin)}>
        <div className="text-sm font-semibold mb-2">{bin.binType}</div>
        <div className="text-xs text-gray-300 mb-2">ID: {bin.binId}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Fill Level:</span>
          <span className="text-sm font-bold">{bin.filledPercentage}%</span>
        </div>
        <div className="w-full bg-gray-500 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full ${
              bin.filledPercentage > 80
                ? "bg-red-500"
                : bin.filledPercentage > 60
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${bin.filledPercentage}%` }}
          ></div>
        </div>
      </button>

      {isAssignOpen && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-sm rounded-lg p-4 border border-white/10">
            <div className="text-white font-semibold mb-2">Assign to Module</div>
            <div className="text-xs text-gray-300 mb-3">Bin ID: {bin.binId}</div>
            <select
              className="w-full bg-gray-800 text-white p-2 rounded mb-3"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as HabitatModuleType)}
            >
              <option value="">Select a module</option>
              {Object.values(HabitatModuleType).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
                onClick={() => {
                  setIsAssignOpen(false);
                  setSelectedModule("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                disabled={!selectedModule}
                onClick={handleAssignConfirm}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


