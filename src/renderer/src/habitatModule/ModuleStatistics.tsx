import { useState, useEffect } from "react";
import { HabitatModuleEnum } from "@renderer/lib/types";

export default function ModuleStatistics({ moduleName }: { moduleName: HabitatModuleEnum }): React.ReactElement {

  const [summary, setSummary] = useState<{
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
  } | null>(null);

  const [binFillStatus, setBinFillStatus] = useState<{
    critical: number; // >90% full
    warning: number;  // 75-90% full
    ok: number;       // <75% full
  }>({ critical: 0, warning: 0, ok: 0 });

  async function getTrashSummary() {
    try {
      const trashSummary = await window.electron.ipcRenderer.invoke("getTrashSummaryByModule", moduleName);
      setSummary(trashSummary);
    } catch (err) {
      console.error("Failed to fetch trash summary:", err);
    }
  }

  async function getBinStatus() {
    try {
      const status = await window.electron.ipcRenderer.invoke("getBinFullnessStatus");

      // Filter bins for this module only
      const moduleBins = Object.values(status).filter((bin: any) => bin.moduleName === moduleName);

      // Count bins by fullness status
      const binStats = {
        critical: 0,
        warning: 0,
        ok: 0
      };

      moduleBins.forEach(bin => {
        const binStatus = bin as { fullnessPercentage: number };
        if (binStatus.fullnessPercentage > 90) {
          binStats.critical++;
        } else if (binStatus.fullnessPercentage > 75) {
          binStats.warning++;
        } else {
          binStats.ok++;
        }
      });

      setBinFillStatus(binStats);
    } catch (err) {
      console.error("Failed to fetch bin status:", err);
    }
  }

  useEffect(() => {
    getTrashSummary();
    getBinStatus();
  }, [moduleName]);

  const categories = [
    { name: 'FABRIC', weight: summary?.categoryWeights.FABRIC || 0, color: 'bg-blue-600', displayName: 'Fabric' },
    { name: 'POLYMER', weight: summary?.categoryWeights.POLYMER || 0, color: 'bg-purple-600', displayName: 'Polymer' },
    { name: 'GLASS', weight: summary?.categoryWeights.GLASS || 0, color: 'bg-green-600', displayName: 'Glass' },
    { name: 'METAL', weight: summary?.categoryWeights.METAL || 0, color: 'bg-yellow-600', displayName: 'Metal' },
    { name: 'COMPOSITE', weight: summary?.categoryWeights.COMPOSITE || 0, color: 'bg-gray-600', displayName: 'Composite' },
    { name: 'PAPER', weight: summary?.categoryWeights.PAPER || 0, color: 'bg-blue-500', displayName: 'Paper' }
  ];

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  return (
    <div className="flex flex-col h-90">

      <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
        Module Statistics
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">

        {/* Total Bins */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Total Bins</span>
            <span className="text-blue-400">{summary?.binCount || 0}</span>
          </div>
        </div>

        {/* Total Trash Items */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Total Items</span>
            <span className="text-green-400">{summary?.totalItems || 0}</span>
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

          <div className="space-y-2">
            {categories.map((category) => {
              return (
                <div key={category.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.displayName}</span>
                    <span>
                      {category.weight.toFixed(3)} kg (
                      {
                        totalWeight > 0
                          ? ((category.weight / totalWeight) * 100).toFixed(1)
                          : 0
                      }%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${category.color}`}
                      style={{ width: `${totalWeight > 0 ? ((category.weight / totalWeight) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bin Fill Status */}
      <div className="bg-gray-700 p-3 rounded-lg mt-4">
        <div className="mb-3">
          <span className="font-semibold">Bin Status</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-green-400 text-lg font-bold">{binFillStatus.ok}</div>
            <div className="text-xs text-gray-300">Good</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 text-lg font-bold">{binFillStatus.warning}</div>
            <div className="text-xs text-gray-300">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 text-lg font-bold">{binFillStatus.critical}</div>
            <div className="text-xs text-gray-300">Critical</div>
          </div>
        </div>

        {binFillStatus.critical > 0 && (
          <div className="mt-2 text-xs text-red-400">
            {binFillStatus.critical} bin{binFillStatus.critical !== 1 ? 's' : ''} need immediate attention!
          </div>
        )}
      </div>

      {/* Fixed buttons at bottom */}
      <div className="mt-4 flex-shrink-0">
        <button
          onClick={() => {
            getTrashSummary();
            getBinStatus();
          }}
          className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm"
        >
          Refresh Statistics
        </button>
      </div>
    </div>
  );

}
