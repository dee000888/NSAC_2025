import { useState, useEffect } from "react";
import { HabitatModuleEnum, BinMobilityEnum } from "@renderer/lib/types";

interface BinStatusProps {
  className?: string;
}

interface BinStatus {
  moduleName: HabitatModuleEnum;
  mobility: BinMobilityEnum;
  trashCount: number;
  fullnessPercentage: number;
}

export default function BinStatusOverview({ className = "" }: BinStatusProps): React.ReactElement {
  const [binStatus, setBinStatus] = useState<Record<string, BinStatus>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchBinStatus();
  }, []);

  async function fetchBinStatus() {
    try {
      setLoading(true);
      const status = await window.electron.ipcRenderer.invoke("getBinFullnessStatus");
      setBinStatus(status);
    } catch (err) {
      console.error("Failed to fetch bin status:", err);
    } finally {
      setLoading(false);
    }
  }

  // Group bins by module
  const binsByModule = Object.entries(binStatus).reduce((grouped, [binId, status]) => {
    const moduleName = status.moduleName;
    if (!grouped[moduleName]) {
      grouped[moduleName] = [];
    }
    grouped[moduleName].push({ binId, ...status });
    return grouped;
  }, {} as Record<string, Array<{ binId: string } & BinStatus>>);

  // Count bins needing attention (>75% full)
  const needsAttention = Object.values(binStatus).filter(bin => bin.fullnessPercentage > 75).length;

  return (
    <div className={`bg-gray-800 bg-opacity-85 text-white rounded-lg shadow-lg w-80 ${className}`}>
      <div
        className="p-3 cursor-pointer flex justify-between items-center border-b border-gray-700"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-bold">Smart Bin Status</h2>
        <div className="flex items-center">
          {needsAttention > 0 && (
            <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-2">
              {needsAttention} {needsAttention === 1 ? 'bin' : 'bins'} need attention
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fetchBinStatus(); }}
            className="mr-2 p-1 rounded hover:bg-gray-700 text-sm"
            title="Refresh bin status"
          >
            🔄
          </button>
          <span>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-3 text-gray-400">Loading bin status...</div>
          ) : Object.keys(binsByModule).length === 0 ? (
            <div className="text-center py-3 text-gray-400">No bin data available</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(binsByModule).map(([moduleName, bins]) => (
                <div key={moduleName} className="border-b border-gray-700 pb-3 last:border-0">
                  <h3 className="font-medium mb-2">{moduleName}</h3>
                  <div className="space-y-2">
                    {bins.map(bin => (
                      <div key={bin.binId} className="flex items-center">
                        <div className="w-24 text-xs text-gray-400">{bin.binId}</div>
                        <div className="w-16 text-xs text-gray-300">{bin.mobility}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{bin.trashCount} items</span>
                            <span className={
                              bin.fullnessPercentage > 90 ? "text-red-400" :
                                bin.fullnessPercentage > 75 ? "text-yellow-400" :
                                  "text-green-400"
                            }>
                              {bin.fullnessPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${bin.fullnessPercentage > 90 ? "bg-red-500" :
                                  bin.fullnessPercentage > 75 ? "bg-yellow-500" :
                                    "bg-green-500"
                                }`}
                              style={{ width: `${bin.fullnessPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="text-xs text-gray-400 pt-2">
                <div className="flex items-center">
                  <span className="w-3 h-3 inline-block bg-green-500 rounded-full mr-1"></span>
                  <span>Good (0-75%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 inline-block bg-yellow-500 rounded-full mr-1"></span>
                  <span>Attention (76-90%)</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 inline-block bg-red-500 rounded-full mr-1"></span>
                  <span>Critical (91-100%)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
