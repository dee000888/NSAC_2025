import { useState, useEffect } from "react";
import { HabitatModuleEnum } from "@renderer/lib/types";

interface ModuleStatisticsProps {
  moduleName: HabitatModuleEnum;
}

interface TrashSummary {
  binCount: number;
  totalItems: number;
  totalWeight: number;
  categoryWeights: {
    FABRIC: number;
    POLYMER: number;
    GLASS: number;
    METAL: number;
    COMPOSITE: number;
    PAPER: number;
  };
}

export default function ModuleStatistics({ moduleName }: ModuleStatisticsProps): React.ReactElement {
  const [summary, setSummary] = useState<TrashSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrashSummary();
  }, [moduleName]);

  async function fetchTrashSummary() {
    try {
      setLoading(true);
      const trashSummary = await window.electron.ipcRenderer.invoke("getTrashSummaryByModule", moduleName);
      setSummary(trashSummary);
    } catch (err) {
      console.error("Failed to fetch trash summary:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Module Statistics</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading trash statistics...</div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Module Statistics</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">No data available</div>
        </div>
      </div>
    );
  }

  const categories = [
    { name: 'FABRIC', weight: summary.categoryWeights.FABRIC, color: 'bg-blue-600', displayName: 'Fabric' },
    { name: 'POLYMER', weight: summary.categoryWeights.POLYMER, color: 'bg-purple-600', displayName: 'Polymer' },
    { name: 'GLASS', weight: summary.categoryWeights.GLASS, color: 'bg-green-600', displayName: 'Glass' },
    { name: 'METAL', weight: summary.categoryWeights.METAL, color: 'bg-yellow-600', displayName: 'Metal' },
    { name: 'COMPOSITE', weight: summary.categoryWeights.COMPOSITE, color: 'bg-gray-600', displayName: 'Composite' },
    { name: 'PAPER', weight: summary.categoryWeights.PAPER, color: 'bg-blue-500', displayName: 'Paper' }
  ].filter(cat => cat.weight > 0); // Only show categories that have trash

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  return (
    <div className="flex flex-col h-80">
      <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
        Module Statistics
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Total Bins */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Total Bins</span>
            <span className="text-blue-400">{summary.binCount}</span>
          </div>
        </div>

        {/* Total Trash Items */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Total Items</span>
            <span className="text-green-400">{summary.totalItems}</span>
          </div>
        </div>

        {/* Total Weight */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Total Weight</span>
            <span className="text-yellow-400">{totalWeight.toFixed(3)} kg</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="mb-3">
            <span className="font-semibold">Trash by Category</span>
          </div>

          {categories.length === 0 ? (
            <div className="text-sm text-gray-300">
              No trash items in this module
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => {
                const percentage =
                  totalWeight > 0
                    ? (category.weight / totalWeight) * 100
                    : 0;

                return (
                  <div key={category.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category.displayName}</span>
                      <span>
                        {category.weight.toFixed(3)} kg (
                        {percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed buttons at bottom */}
      <div className="mt-4 flex-shrink-0">
        <button
          onClick={fetchTrashSummary}
          className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm"
        >
          Refresh Statistics
        </button>
      </div>
    </div>
  );

}
