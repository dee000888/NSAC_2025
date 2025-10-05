import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HabitatModuleEnum, TrashItemSchema, SmartBinSchema, ManufacturableItemSchema, ConsumableItemSchema } from "@renderer/lib/types";

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

interface ManufacturableItemWithAvailability extends ManufacturableItemSchema {
  canManufacture: boolean;
  availableMaterials: { [key: string]: number };
  missingMaterials: { [key: string]: number };
  manufacturableCount: number;
}

export default function RecycleStation(): React.ReactElement {
  const navigate = useNavigate();
  const [allTrashItems, setAllTrashItems] = useState<TrashItemSchema[]>([]);
  const [instationBins, setInstationBins] = useState<SmartBinSchema[]>([]);
  const [summary, setSummary] = useState<TrashSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [manufacturableItems, setManufacturableItems] = useState<ManufacturableItemSchema[]>([]);
  const [consumableItems, setConsumableItems] = useState<ConsumableItemSchema[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<{ [key: string]: number }>({});
  const [manufacturableWithAvailability, setManufacturableWithAvailability] = useState<ManufacturableItemWithAvailability[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (manufacturableItems.length > 0 && Object.keys(availableMaterials).length > 0) {
      calculateManufacturableAvailability(availableMaterials);
    }
  }, [manufacturableItems, availableMaterials]);

  async function fetchAllData() {
    try {
      setLoading(true);
      
      // Get all trash items from recycling module
      const smartBins = await window.electron.ipcRenderer.invoke("getSmartBins", HabitatModuleEnum.RecyclingModule);
      setInstationBins(smartBins);
      
      // Get summary for recycling module
      const trashSummary = await window.electron.ipcRenderer.invoke("getTrashSummaryByModule", HabitatModuleEnum.RecyclingModule);
      setSummary(trashSummary);
      
      // Get all trash items from all bins in recycling module
      const allTrash: TrashItemSchema[] = [];
      for (const bin of smartBins) {
        const trashItems = await window.electron.ipcRenderer.invoke("getTrashItemsByBin", bin.binId);
        allTrash.push(...trashItems);
      }
      setAllTrashItems(allTrash);
      
      // Get manufacturable items and consumable items
      const [manufacturableItemsData, consumableItemsData] = await Promise.all([
        window.electron.ipcRenderer.invoke("getManufacturableItems"),
        window.electron.ipcRenderer.invoke("getConsumableItems")
      ]);
      
      setManufacturableItems(manufacturableItemsData);
      setConsumableItems(consumableItemsData);
      
      // Calculate available materials from trash
      calculateAvailableMaterials(allTrash, consumableItemsData);
      
    } catch (err) {
      console.error("Failed to fetch recycle station data:", err);
    } finally {
      setLoading(false);
    }
  }

  function calculateAvailableMaterials(trashItems: TrashItemSchema[], consumableItems: ConsumableItemSchema[]) {
    const materials: { [key: string]: number } = {};
    
    // Create a map of codeName to consumable item for quick lookup
    const codeNameToItem = new Map();
    consumableItems.forEach(item => {
      codeNameToItem.set(item.codeName, item);
    });
    
    // Process each trash item to get recycled materials
    trashItems.forEach(trashItem => {
      const consumableItem = codeNameToItem.get(trashItem.codeName);
      if (consumableItem && consumableItem.recycleProcess) {
        // Calculate the weight per item
        const weightPerItem = consumableItem.weight_kg / consumableItem.quantity;
        
        // Process each recycling step
        consumableItem.recycleProcess.forEach(process => {
          Object.entries(process.outputMaterials).forEach(([material, outputRatio]) => {
            const materialWeight = trashItem.weight * outputRatio;
            materials[material] = (materials[material] || 0) + materialWeight;
          });
        });
      }
    });
    
    setAvailableMaterials(materials);
  }

  function calculateManufacturableAvailability(availableMaterials: { [key: string]: number }) {
    const manufacturableWithAvailability: ManufacturableItemWithAvailability[] = manufacturableItems.map(item => {
      const requiredMaterials = item.manufactureProcess.rawMaterials;
      const availableMaterialsForItem: { [key: string]: number } = {};
      const missingMaterials: { [key: string]: number } = {};
      let canManufacture = true;
      let manufacturableCount = Infinity;
      
      // Check each required material
      Object.entries(requiredMaterials).forEach(([material, requiredWeight]) => {
        const available = availableMaterials[material] || 0;
        availableMaterialsForItem[material] = available;
        
        if (available < requiredWeight) {
          canManufacture = false;
          missingMaterials[material] = requiredWeight - available;
        } else {
          // Calculate how many items can be made with available materials
          const possibleCount = Math.floor(available / requiredWeight);
          manufacturableCount = Math.min(manufacturableCount, possibleCount);
        }
      });
      
      return {
        ...item,
        canManufacture,
        availableMaterials: availableMaterialsForItem,
        missingMaterials,
        manufacturableCount: canManufacture ? manufacturableCount : 0
      };
    });
    
    setManufacturableWithAvailability(manufacturableWithAvailability);
  }

  async function handleSelectBin(binId: string) {
    try {
      setSelectedBinId(binId);
      const trashItems = await window.electron.ipcRenderer.invoke("getTrashItemsByBin", binId);
      setAllTrashItems(trashItems);
    } catch (err) {
      console.error("Failed to load trash items:", err);
    }
  }

  async function handleDumpToInstation(sourceBinId: string) {
    try {
      const result = await window.electron.ipcRenderer.invoke("dumpBinToInstation", { sourceBinId });
      console.log(result.message);
      // Refresh all data
      fetchAllData();
    } catch (err) {
      console.error("Failed to dump bin to instation:", err);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Recycle Station...</div>
      </div>
    );
  }

  const categories = [
    { name: 'FABRIC', weight: summary?.categoryWeights.FABRIC || 0, color: 'bg-blue-600', displayName: 'Fabric' },
    { name: 'POLYMER', weight: summary?.categoryWeights.POLYMER || 0, color: 'bg-purple-600', displayName: 'Polymer' },
    { name: 'GLASS', weight: summary?.categoryWeights.GLASS || 0, color: 'bg-green-600', displayName: 'Glass' },
    { name: 'METAL', weight: summary?.categoryWeights.METAL || 0, color: 'bg-yellow-600', displayName: 'Metal' },
    { name: 'COMPOSITE', weight: summary?.categoryWeights.COMPOSITE || 0, color: 'bg-gray-600', displayName: 'Composite' },
    { name: 'PAPER', weight: summary?.categoryWeights.PAPER || 0, color: 'bg-blue-500', displayName: 'Paper' }
  ].filter(cat => cat.weight > 0);

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  return (
    <div className="w-full h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 bg-white/20 hover:bg-white/30 rounded text-white"
          >
            ← Back to Jezero
          </button>
          <h1 className="text-3xl font-bold">Recycle Station</h1>
        </div>
        <button
          onClick={fetchAllData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Summary Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recycling Summary</h2>
          
          {summary && (
            <div className="space-y-4">
              <div className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between">
                  <span>Total Bins</span>
                  <span className="text-blue-400">{summary.binCount}</span>
                </div>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span className="text-green-400">{summary.totalItems}</span>
                </div>
              </div>
              
              <div className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between">
                  <span>Total Weight</span>
                  <span className="text-yellow-400">{totalWeight.toFixed(3)} kg</span>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="bg-gray-700 p-3 rounded">
                  <div className="mb-3 font-semibold">Trash by Category</div>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const percentage = totalWeight > 0 ? (category.weight / totalWeight) * 100 : 0;
                      return (
                        <div key={category.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category.displayName}</span>
                            <span>{category.weight.toFixed(3)} kg ({percentage.toFixed(1)}%)</span>
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bins Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recycling Bins</h2>
          
          <div className="space-y-3">
            {instationBins.map((bin) => (
              <div key={bin.binId} className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{bin.binId}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bin.mobility === 'INSTATION' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {bin.mobility}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Fill Level</span>
                  <span>{bin.filledPercentage}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${bin.filledPercentage}%` }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectBin(bin.binId)}
                    className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm"
                  >
                    View Items
                  </button>
                  {bin.mobility !== 'INSTATION' && (
                    <button
                      onClick={() => handleDumpToInstation(bin.binId)}
                      className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                    >
                      Dump to Instation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trash Items Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Trash Items</h2>
            {selectedBinId && (
              <button
                onClick={() => setSelectedBinId(null)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
              >
                Show All
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allTrashItems.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No trash items found</div>
            ) : (
              allTrashItems.map((item) => (
                <div key={item.trashId} className="bg-gray-700 p-3 rounded">
                  <div className="text-xs text-gray-300 mb-1">ID: {item.trashId}</div>
                  <div className="font-semibold mb-1">{item.codeName}</div>
                  <div className="text-sm text-gray-300">Weight: {item.weight} kg</div>
                  <div className="text-xs text-gray-400">Bin: {item.binId}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manufacturable Items Panel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Manufacturable Items</h2>
            <div className="text-sm text-gray-400">
              {manufacturableWithAvailability.filter(item => item.canManufacture).length} / {manufacturableWithAvailability.length} available
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {manufacturableWithAvailability.length === 0 ? (
              <div className="text-gray-400 text-center py-8">Loading manufacturable items...</div>
            ) : (
              manufacturableWithAvailability.map((item) => (
                <div 
                  key={item.itemName} 
                  className={`p-3 rounded border-l-4 ${
                    item.canManufacture 
                      ? 'bg-green-900/30 border-green-500' 
                      : 'bg-red-900/30 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm">{item.itemName}</div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      item.canManufacture ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {item.canManufacture ? `Can make ${item.manufacturableCount}` : 'Cannot make'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-300 mb-2">
                    Process: {item.manufactureProcess.process}
                  </div>
                  
                  <div className="text-xs">
                    <div className="mb-1 font-semibold">Required Materials:</div>
                    {Object.entries(item.manufactureProcess.rawMaterials).map(([material, weight]) => (
                      <div key={material} className="flex justify-between">
                        <span className="text-gray-400">{material}:</span>
                        <span className={`${
                          item.availableMaterials[material] >= weight ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.availableMaterials[material]?.toFixed(2) || 0} / {weight} kg
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {!item.canManufacture && Object.keys(item.missingMaterials).length > 0 && (
                    <div className="text-xs mt-2">
                      <div className="font-semibold text-red-400 mb-1">Missing:</div>
                      {Object.entries(item.missingMaterials).map(([material, amount]) => (
                        <div key={material} className="text-red-300">
                          {material}: {amount.toFixed(2)} kg
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
