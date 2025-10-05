import { useState, useEffect } from "react";
import { HabitatModuleEnum } from "@renderer/lib/types";

interface ModuleTransfer {
  sourceName: HabitatModuleEnum;
  targetName: HabitatModuleEnum;
  count: number;
  timestamp: Date;
}

const moduleColors: Record<HabitatModuleEnum, string> = {
  [HabitatModuleEnum.LivingSpaceModule]: "#3B82F6", // blue
  [HabitatModuleEnum.StorageModule]: "#F59E0B", // amber
  [HabitatModuleEnum.SurgicalModule]: "#EF4444", // red
  [HabitatModuleEnum.LabModule]: "#10B981", // green
  [HabitatModuleEnum.RecyclingModule]: "#6366F1", // indigo
  [HabitatModuleEnum.PlantationModule]: "#84CC16", // lime
};

const modulePositions: Record<HabitatModuleEnum, { x: number; y: number }> = {
  [HabitatModuleEnum.LivingSpaceModule]: { x: 150, y: 50 },
  [HabitatModuleEnum.StorageModule]: { x: 50, y: 150 },
  [HabitatModuleEnum.SurgicalModule]: { x: 250, y: 150 },
  [HabitatModuleEnum.LabModule]: { x: 250, y: 250 },
  [HabitatModuleEnum.RecyclingModule]: { x: 150, y: 320 },
  [HabitatModuleEnum.PlantationModule]: { x: 50, y: 250 },
};

export default function TrashTransferVisualization(): React.ReactElement {
  const [transfers, setTransfers] = useState<ModuleTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  // Mock transfers for now - in a real implementation this would come from the database
  useEffect(() => {
    const mockTransfers: ModuleTransfer[] = [
      {
        sourceName: HabitatModuleEnum.LivingSpaceModule,
        targetName: HabitatModuleEnum.RecyclingModule,
        count: 12,
        timestamp: new Date(),
      },
      {
        sourceName: HabitatModuleEnum.StorageModule,
        targetName: HabitatModuleEnum.RecyclingModule,
        count: 8,
        timestamp: new Date(),
      },
      {
        sourceName: HabitatModuleEnum.LabModule,
        targetName: HabitatModuleEnum.RecyclingModule,
        count: 5,
        timestamp: new Date(),
      },
      {
        sourceName: HabitatModuleEnum.PlantationModule,
        targetName: HabitatModuleEnum.RecyclingModule,
        count: 3,
        timestamp: new Date(),
      },
      {
        sourceName: HabitatModuleEnum.SurgicalModule,
        targetName: HabitatModuleEnum.RecyclingModule,
        count: 6,
        timestamp: new Date(),
      },
    ];

    setTransfers(mockTransfers);
    setLoading(false);
  }, []);

  // Calculate transfer statistics
  const totalTransferred = transfers.reduce((sum, transfer) => sum + transfer.count, 0);
  const moduleStats = Object.values(HabitatModuleEnum).reduce((stats, moduleName) => {
    stats[moduleName] = transfers
      .filter(t => t.sourceName === moduleName)
      .reduce((sum, t) => sum + t.count, 0);
    return stats;
  }, {} as Record<string, number>);

  // Sort modules by transfer count
  const sortedModules = Object.entries(moduleStats)
    .filter(([_, count]) => count > 0)
    .sort(([_, countA], [__, countB]) => countB - countA);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Trash Transfer Flow</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          >
            {showAnimation ? "Pause Animation" : "Show Animation"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60 text-gray-400">
          Loading transfer data...
        </div>
      ) : (
        <>
          {/* Visualization */}
          <div className="relative h-80 bg-gray-900 rounded-lg mb-4">
            {/* Modules */}
            {Object.entries(modulePositions).map(([moduleName, position]) => {
              const name = moduleName as HabitatModuleEnum;
              const color = moduleColors[name];
              const transferCount = moduleStats[name] || 0;
              const size = transferCount > 0 ? Math.max(40, Math.min(70, 40 + transferCount * 2)) : 40;

              return (
                <div
                  key={moduleName}
                  className="absolute rounded-full flex items-center justify-center border-2"
                  style={{
                    left: position.x - size / 2,
                    top: position.y - size / 2,
                    width: size,
                    height: size,
                    backgroundColor: `${color}33`, // Add transparency
                    borderColor: color,
                  }}
                >
                  <div className="text-xs text-white text-center font-medium p-1">
                    <div>{name.replace("Module", "")}</div>
                    {transferCount > 0 && <div className="text-white/80">{transferCount}</div>}
                  </div>
                </div>
              );
            })}

            {/* Transfer Lines */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ffffff" />
                </marker>
              </defs>
              {transfers.map((transfer, idx) => {
                const source = modulePositions[transfer.sourceName];
                const target = modulePositions[transfer.targetName];
                const strokeWidth = Math.max(1, Math.min(5, transfer.count / 3));

                // Calculate line with slight curve
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2 - 20; // Curved upward
                const path = `M${source.x},${source.y} Q${midX},${midY} ${target.x},${target.y}`;

                // Animation dot
                const animationDot = showAnimation && (
                  <circle
                    cx="0"
                    cy="0"
                    r="3"
                    fill={moduleColors[transfer.sourceName]}
                  >
                    <animateMotion
                      dur={`${3 + (idx % 3)}s`}
                      repeatCount="indefinite"
                      path={path}
                    />
                  </circle>
                );

                return (
                  <g key={`${transfer.sourceName}-${transfer.targetName}`}>
                    <path
                      d={path}
                      stroke={moduleColors[transfer.sourceName]}
                      strokeOpacity="0.6"
                      strokeWidth={strokeWidth}
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    {animationDot}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stats Panel */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-sm font-medium text-white mb-2">Top Contributors</h3>
              <div className="space-y-2">
                {sortedModules.slice(0, 3).map(([moduleName, count]) => (
                  <div key={moduleName} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: moduleColors[moduleName as HabitatModuleEnum] }}
                      ></div>
                      <span className="text-sm">{moduleName.replace("Module", "")}</span>
                    </div>
                    <span className="text-sm">
                      {count} items ({((count / totalTransferred) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <h3 className="text-sm font-medium text-white mb-2">Total Transfers</h3>
              <div className="text-2xl font-bold mb-1">{totalTransferred}</div>
              <div className="text-sm text-gray-400">Items transferred to Recycling</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
