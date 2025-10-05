import { useMemo, useState } from "react";
import { HabitatModuleEnum, SmartBinSchema } from "@renderer/lib/types";
import { formatItemName, formatCategoryName, formatMobilityType, formatModuleName } from "@renderer/lib/formatUtils";

type SmartBinProps = {
  bin: SmartBinSchema & { filledPercentage: number };
  onClick: (bin: SmartBinSchema) => void;
  onAssigned?: () => void;
}

export default function SmartBinItem(props: SmartBinProps): React.ReactElement {

  const { bin, onClick, onAssigned } = props;

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<HabitatModuleEnum | "">("");
  const [isDumping, setIsDumping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardClass = useMemo(() => {
    // Different styles by bin type
    switch (bin.mobility) {
      case "INDOOR":
        return "bg-gradient-to-br from-gray-700 to-gray-600";
      case "INSTATION":
        return "bg-gradient-to-br from-gray-900 to-gray-700";
      default:
        return "bg-gradient-to-br from-gray-700 to-gray-600";
    }
  }, [bin.mobility]);

  const statusColor = useMemo(() => {
    if (bin.filledPercentage > 90) return "bg-red-500";
    if (bin.filledPercentage > 75) return "bg-yellow-500";
    if (bin.filledPercentage > 50) return "bg-blue-500";
    return "bg-green-500";
  }, [bin.filledPercentage]);

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

  async function handleDump() {

    if (bin.mobility === "INSTATION") return;

    setIsDumping(true);
    try {
      const result = await window.electron.ipcRenderer.invoke("dumpBinToInstation", {
        sourceBinId: bin.binId,
      });

      if (result.success) {
        alert(result.message);
        onAssigned?.(); // Refresh the bin data
      }
    } catch (err) {
      console.error("Failed to dump bin:", err);
      alert("Failed to dump bin. Please try again.");
    } finally {
      setIsDumping(false);
    }
  }

  return (
    <div
      className={`${cardClass} rounded-lg p-4 text-white relative shadow-lg border border-gray-600 ${isHovered ? 'scale-105' : ''} transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status indicator */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusColor} rounded-full shadow-lg border border-gray-800 animate-pulse`}></div>

      {bin.mobility === "INDOOR" && (<>
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded shadow-md flex items-center"
            onClick={() => setIsAssignOpen(true)}
          >
            <span className="mr-1">📋</span> Assign
          </button>
          <button
            className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded shadow-md flex items-center"
            onClick={() => handleDump()}
            disabled={isDumping}
          >
            <span className="mr-1">🗑️</span> Dump
          </button>
        </div>
      </>)}

      <button className="text-left w-full mt-4" onClick={() => onClick(bin)}>
        <div className="flex items-center mb-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${bin.mobility === "INDOOR" ? "bg-blue-600" : "bg-green-600"}`}>
            {bin.mobility === "INDOOR" ? "I" : "S"}
          </div>
          <div className="text-sm font-semibold">{formatMobilityType(bin.mobility)}</div>
        </div>

        <div className="text-xs text-gray-300 mb-3 border-b border-gray-600 pb-2">ID: {bin.binId}</div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-sm">Fill Level:</span>
          <span className={`text-sm font-bold ${bin.filledPercentage > 90 ? "text-red-400" :
            bin.filledPercentage > 75 ? "text-yellow-400" :
              "text-green-400"
            }`}>{bin.filledPercentage}%</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 mt-2 p-0.5">
          <div
            className={`h-2 rounded-full ${statusColor}`}
            style={{
              width: `${bin.filledPercentage}%`,
              transition: 'width 0.5s ease-in-out',
              boxShadow: '0 0 5px rgba(255,255,255,0.5)'
            }}
          ></div>
        </div>
      </button>

      {isAssignOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10 rounded-lg backdrop-blur-sm">
          <div className="bg-gray-800 w-full max-w-sm rounded-lg p-6 border border-blue-500/50 shadow-lg">
            <div className="text-white font-semibold text-lg mb-2">Assign to Module</div>
            <div className="flex items-center space-x-2 text-xs text-gray-300 mb-4 pb-2 border-b border-gray-700">
              <span className="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center">🗑️</span>
              <span>Bin ID: {bin.binId}</span>
            </div>

            <div className="mb-2 text-sm text-gray-300">Select destination module:</div>
            <select
              className="w-full bg-gray-700 text-white p-3 rounded-md mb-4 border border-gray-600 focus:border-blue-500 outline-none shadow-inner"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as HabitatModuleEnum)}
            >
              <option value="">Select a module</option>
              {Object.values(HabitatModuleEnum).map((m) => (
                <option key={m} value={m}>
                  {formatModuleName(m)}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors shadow-md"
                onClick={() => {
                  setIsAssignOpen(false);
                  setSelectedModule("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors shadow-md"
                disabled={!selectedModule}
                onClick={handleAssignConfirm}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indication when bin is being dumped */}
      {isDumping && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <div className="text-sm text-white">Dumping trash...</div>
        </div>
      )}
    </div>
  );
}
