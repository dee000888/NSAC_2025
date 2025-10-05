import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SmartBinSchema,
  TrashItemSchema,
  ConsumableItemSchema,
  ManufacturableItemSchema,
  TrashCategoryEnum,
  RecycleProcessEnum,
  ManuFactoryApplicationEnum,
} from "@renderer/lib/types";
import TrashTransferVisualization from "./TrashTransferVisualization";
import { HabitatModuleEnum } from "@renderer/lib/types";
import { formatItemName, formatCategoryName, formatCamelCaseToTitleCase, formatApplicationName, formatProcessName, formatRawMaterial } from "@renderer/lib/formatUtils";

interface TrashSummary {
  binCount: number;
  totalItems: number;
  totalWeight: string;
  categoryWeights: {
    [key: string]: number;
  };
}

interface ManufacturableItemWithAvailability extends ManufacturableItemSchema {
  canManufacture: boolean;
  availableMaterials: { [key: string]: number };
  missingMaterials: { [key: string]: number };
  manufacturableCount: number;
}

interface MaterialsCardProps {
  materials: { [key: string]: number };
  title: string;
  showTotal?: boolean;
}

const MaterialsCard = ({ materials, title, showTotal = false }: MaterialsCardProps) => {
  const totalWeight = Object.values(materials).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-3">{title}</h3>

      <div className="space-y-2">
        {Object.entries(materials).map(([material, weight]) => (
          <div key={material} className="flex justify-between">
            <span className="text-gray-300">{formatRawMaterial(material)}</span>
            <span className="text-white font-medium">{weight.toFixed(3)} kg</span>
          </div>
        ))}

        {showTotal && Object.keys(materials).length > 0 && (
          <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
            <span className="text-gray-300 font-medium">Total</span>
            <span className="text-white font-medium">{totalWeight.toFixed(3)} kg</span>
          </div>
        )}

        {Object.keys(materials).length === 0 && (
          <div className="text-gray-400 italic">No materials available</div>
        )}
      </div>
    </div>
  );
};

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
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<TrashCategoryEnum | "ALL">("ALL");
  const [selectedItems, setSelectedItems] = useState<TrashItemSchema[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<RecycleProcessEnum | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ManuFactoryApplicationEnum | "ALL">("ALL");
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recycling' | 'manufacturing' | 'analytics' | 'transfers'>('recycling');

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
        const trashItems = await window.electron.ipcRenderer.invoke("getTrashItemsByBin", { binId: bin.binId });
        allTrash.push(...trashItems);
      }
      setAllTrashItems(allTrash);

      // Get manufacturable items and consumable items
      const [manufacturableItemsData, consumableItemsData, availableMaterialsData, monthlySummaryData] = await Promise.all([
        window.electron.ipcRenderer.invoke("getManufacturableItems"),
        window.electron.ipcRenderer.invoke("getConsumableItems"),
        window.electron.ipcRenderer.invoke("getAvailableMaterials"),
        window.electron.ipcRenderer.invoke("getMonthlySummary")
      ]);

      // Add some sample materials if none exist for demo purposes
      if (Object.keys(availableMaterialsData).length === 0) {
        availableMaterialsData["POLYETHYLENE"] = 2.5;
        availableMaterialsData["ALUMINUM"] = 4.0;
        availableMaterialsData["CARBON_FIBER"] = 1.2;
        availableMaterialsData["POLYESTER"] = 3.0;
        availableMaterialsData["COTTON"] = 1.8;
        availableMaterialsData["PAPER"] = 2.2;
        availableMaterialsData["POLYPROPYLENE"] = 2.8;
        availableMaterialsData["NYLON"] = 1.5;
        availableMaterialsData["CARBON"] = 0.9;
      }

      console.log("Manufacturable items:", manufacturableItemsData);
      setManufacturableItems(manufacturableItemsData);
      setConsumableItems(consumableItemsData);
      setAvailableMaterials(availableMaterialsData);
      setMonthlySummary(monthlySummaryData);

      // Calculate manufacturable availability with the fetched data
      if (manufacturableItemsData && manufacturableItemsData.length > 0 && Object.keys(availableMaterialsData).length > 0) {
        calculateManufacturableAvailability(availableMaterialsData);
      }

    } catch (err) {
      console.error("Failed to fetch recycle station data:", err);
    } finally {
      setLoading(false);
    }
  }

  // This function is used by the fetchAllData method
  function calculateAvailableMaterials(trashItems: TrashItemSchema[], consumableItems: ConsumableItemSchema[]) {
    console.log("Calculating available materials from", trashItems.length, "trash items");
    const materials: { [key: string]: number } = {};

    // Create a map of codeName to consumable item for quick lookup
    const codeNameToItem = new Map<string, ConsumableItemSchema>();
    consumableItems.forEach(item => {
      codeNameToItem.set(item.codeName, item);
    });

    // Process each trash item to get recycled materials
    trashItems.forEach(trashItem => {
      const consumableItem = codeNameToItem.get(trashItem.codeName);
      if (consumableItem && consumableItem.recycleProcess) {
        // Calculate the weight per item
        const weightPerItem = consumableItem.weight_kg;

        // Process each recycling step
        if (Array.isArray(consumableItem.recycleProcess)) {
          consumableItem.recycleProcess.forEach(process => {
            if (process.outputMaterials) {
              Object.entries(process.outputMaterials).forEach(([material, outputRatioValue]) => {
                // Cast the outputRatio to a number to avoid type error
                const outputRatio = Number(outputRatioValue);
                const materialWeight = trashItem.quantity * weightPerItem * outputRatio;
                materials[material] = (materials[material] || 0) + materialWeight;
              });
            }
          });
        } else if (consumableItem.recycleProcess.outputMaterials) {
          // Handle single process case
          Object.entries(consumableItem.recycleProcess.outputMaterials).forEach(([material, outputRatioValue]) => {
            const outputRatio = Number(outputRatioValue);
            const materialWeight = trashItem.quantity * weightPerItem * outputRatio;
            materials[material] = (materials[material] || 0) + materialWeight;
          });
        }
      }
    });

    console.log("Available materials calculated:", materials);
    return materials;
  }

  function calculateManufacturableAvailability(availableMaterials: { [key: string]: number }) {
    if (!manufacturableItems || manufacturableItems.length === 0) {
      console.log("No manufacturable items available");
      return;
    }

    console.log("Calculating availability for", manufacturableItems.length, "items with materials:", availableMaterials);

    const manufacturableWithAvailability: ManufacturableItemWithAvailability[] = manufacturableItems.map(item => {
      const requiredMaterials = item.manufactureProcess.rawMaterials;
      const availableMaterialsForItem: { [key: string]: number } = {};
      const missingMaterials: { [key: string]: number } = {};
      let canManufacture = true;
      let manufacturableCount = Infinity;

      // Check each required material
      Object.entries(requiredMaterials).forEach(([material, requiredWeight]) => {
        // Convert requiredWeight to number if it's not already
        const required = typeof requiredWeight === 'number' ? requiredWeight : Number(requiredWeight);
        const available = availableMaterials[material] || 0;
        availableMaterialsForItem[material] = available;

        if (available < required) {
          canManufacture = false;
          missingMaterials[material] = required - available;
        } else {
          // Calculate how many items can be made with available materials
          const possibleCount = Math.floor(available / required);
          manufacturableCount = Math.min(manufacturableCount, possibleCount);
        }
      });

      // If no materials are found in requiredMaterials, mark as not manufacturable
      if (Object.keys(requiredMaterials).length === 0) {
        canManufacture = false;
      }

      return {
        ...item,
        canManufacture,
        availableMaterials: availableMaterialsForItem,
        missingMaterials,
        manufacturableCount: canManufacture ? manufacturableCount : 0
      };
    });

    console.log("Manufacturable with availability:", manufacturableWithAvailability);
    setManufacturableWithAvailability(manufacturableWithAvailability);
  }

  async function handleSelectBin(binId: string) {
    try {
      setSelectedBinId(binId);
      const trashItems = await window.electron.ipcRenderer.invoke("getTrashItemsByBin", { binId });
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

  async function handleTrashSelection(item: TrashItemSchema) {
    const isSelected = selectedItems.some(i => i.trashId === item.trashId);

    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.trashId !== item.trashId));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  }

  async function handleRecycleSelected() {
    if (selectedItems.length === 0) {
      alert("Please select items to recycle");
      return;
    }

    try {
      const result = await window.electron.ipcRenderer.invoke("processTrashForRecycling", {
        trashItems: selectedItems,
        processType: selectedProcess
      });

      if (result.success) {
        alert(`Successfully recycled ${selectedItems.length} items`);
        setSelectedItems([]);
        fetchAllData();
      } else {
        alert(`Recycling failed: ${result.message}`);
      }
    } catch (err) {
      console.error("Failed to recycle items:", err);
      alert("An error occurred during recycling");
    }
  }

  async function handleManufactureItem(item: ManufacturableItemWithAvailability) {
    if (!item.canManufacture) {
      alert("Cannot manufacture this item due to missing materials");
      return;
    }

    try {
      console.log("Manufacturing item:", item.itemName, "with materials:", item.manufactureProcess.rawMaterials);
      const result = await window.electron.ipcRenderer.invoke("createManufacturedItem", {
        itemName: item.itemName,
        requiredMaterials: item.manufactureProcess.rawMaterials
      });

      if (result.success) {
        alert(`Successfully manufactured ${item.itemName}`);
        fetchAllData();
      } else {
        alert(`Manufacturing failed: ${result.message}`);
        console.error("Manufacturing failure details:", result);
      }
    } catch (err) {
      console.error("Failed to manufacture item:", err);
      alert("An error occurred during manufacturing");
    }
  }

  function getTrashItemsByCategory(category: TrashCategoryEnum | "ALL") {
    if (category === "ALL") {
      return allTrashItems;
    }

    // Create a map of codeName to category
    const codeNameToCategory = new Map<string, string>();
    consumableItems.forEach(item => {
      codeNameToCategory.set(item.codeName, item.category);
    });

    return allTrashItems.filter(item => {
      const itemCategory = codeNameToCategory.get(item.codeName);
      return itemCategory === category;
    });
  }

  function getConsumableItemInfo(codeName: string) {
    return consumableItems.find(item => item.codeName === codeName);
  }

  const filteredTrashItems = getTrashItemsByCategory(selectedCategory);

  const filteredManufacturableItems = selectedApplication === "ALL"
    ? manufacturableWithAvailability
    : manufacturableWithAvailability.filter(item => item.application === selectedApplication);

  const availableProcessTypes = Array.from(
    new Set(
      consumableItems.flatMap(item =>
        Array.isArray(item.recycleProcess)
          ? item.recycleProcess.map(p => p.process)
          : [])
    )
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Header */}
      <header className="bg-gray-800 py-4 px-6 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mars Recycling Facility</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
          >
            Back to Jezero
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'recycling'
              ? 'bg-blue-600 text-white rounded-t-md'
              : 'text-gray-400 hover:text-white'
              }`}
            onClick={() => setActiveTab('recycling')}
          >
            Recycling Center
          </button>
          <button
            className={`px-4 py-2 mr-2 ${activeTab === 'manufacturing'
              ? 'bg-green-600 text-white rounded-t-md'
              : 'text-gray-400 hover:text-white'
              }`}
            onClick={() => setActiveTab('manufacturing')}
          >
            Manufacturing Lab
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'analytics'
              ? 'bg-purple-600 text-white rounded-t-md'
              : 'text-gray-400 hover:text-white'
              }`}
            onClick={() => setActiveTab('analytics')}
          >
            Recycling Analytics
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'transfers'
              ? 'bg-amber-600 text-white rounded-t-md'
              : 'text-gray-400 hover:text-white'
              }`}
            onClick={() => setActiveTab('transfers')}
          >
            Transfer Flow
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            {/* Recycling Center Tab */}
            {activeTab === 'recycling' && (
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Bins & Filters */}
                <div className="col-span-3">
                  <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-bold mb-4">Recycling Bins</h2>
                    <div className="space-y-3">
                      {instationBins.map(bin => (
                        <div
                          key={bin.binId}
                          className={`p-3 rounded-md cursor-pointer transition-all ${selectedBinId === bin.binId
                            ? 'bg-blue-700'
                            : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          onClick={() => handleSelectBin(bin.binId)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{formatCamelCaseToTitleCase(bin.binId)}</div>
                              {/*<div className="text-xs text-gray-300">
                                {bin.mobility} - {bin.moduleName}
                              </div>*/}
                            </div>
                            <div className={`px-2 py-1 text-xs rounded ${bin.mobility === 'INSTATION' ? 'bg-green-600' : 'bg-blue-600'
                              }`}>
                              {bin.mobility}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Filter By Category</h2>
                    <div className="space-y-2">
                      <div
                        className={`p-2 rounded cursor-pointer ${selectedCategory === 'ALL' ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        onClick={() => setSelectedCategory('ALL')}
                      >
                        All Categories
                      </div>
                      {Object.values(TrashCategoryEnum).map(category => (
                        <div
                          key={category}
                          className={`p-2 rounded cursor-pointer ${selectedCategory === category ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          onClick={() => setSelectedCategory(category as TrashCategoryEnum)}
                        >
                          {formatCategoryName(category)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg mt-6">
                    <h2 className="text-xl font-bold mb-4">Recycling Process</h2>
                    <div className="space-y-2">
                      <div
                        className={`p-2 rounded cursor-pointer ${!selectedProcess ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        onClick={() => setSelectedProcess(null)}
                      >
                        Default Process
                      </div>
                      {availableProcessTypes.map(process => (
                        <div
                          key={process}
                          className={`p-2 rounded cursor-pointer ${selectedProcess === process ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          onClick={() => setSelectedProcess(process as RecycleProcessEnum)}
                        >
                          {formatCategoryName(process.replace(/_/g, ' '))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle Column - Trash Items */}
                <div className="col-span-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Trash Items for Recycling</h2>
                      <div className="flex gap-2">
                        <button
                          className={`px-3 py-1 text-sm rounded ${selectedItems.length > 0
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'bg-gray-600 cursor-not-allowed'
                            }`}
                          disabled={selectedItems.length === 0}
                          onClick={handleRecycleSelected}
                        >
                          Recycle Selected ({selectedItems.length})
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
                          onClick={() => setSelectedItems([])}
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredTrashItems.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-gray-400">
                          No trash items found in this bin.
                        </div>
                      ) : (
                        filteredTrashItems.map(item => {
                          const consumableInfo = getConsumableItemInfo(item.codeName);
                          const isSelected = selectedItems.some(i => i.trashId === item.trashId);

                          return (
                            <div
                              key={item.trashId}
                              className={`p-3 rounded-md cursor-pointer transition-all ${isSelected
                                ? 'bg-blue-700 border-2 border-blue-500'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                              onClick={() => handleTrashSelection(item)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <div className="font-medium text-sm">{formatItemName(consumableInfo?.name || item.codeName)}</div>
                                  {/*<div className="text-xs text-gray-300">ID: {item.trashId}</div>*/}
                                </div>
                                <div className={`px-2 py-1 text-xs rounded ${consumableInfo?.category === 'FABRIC' ? 'bg-blue-600' :
                                  consumableInfo?.category === 'POLYMER' ? 'bg-purple-600' :
                                    consumableInfo?.category === 'GLASS' ? 'bg-green-600' :
                                      consumableInfo?.category === 'METAL' ? 'bg-yellow-600' :
                                        consumableInfo?.category === 'PAPER' ? 'bg-amber-600' :
                                          consumableInfo?.category === 'COMPOSITE' ? 'bg-red-600' :
                                            'bg-gray-600'
                                  }`}>
                                  {formatCategoryName(consumableInfo?.category || 'UNKNOWN')}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 text-xs text-gray-300 mt-2">
                                <div>Bin: {item.binId}</div>
                                <div>Code: {item.codeName}</div>
                                <div>Quantity: {item.quantity}</div>
                                <div>Weight: {consumableInfo?.weight_kg.toFixed(2) || '?'} kg</div> 
                              </div>
                              {isSelected && (
                                <div className="mt-2 text-xs text-blue-300">
                                  Selected for recycling ✓
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Debug toggle for testing */}
                    <div className="mt-6 text-right">
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded"
                        onClick={() => setIsDebugMode(!isDebugMode)}
                      >
                        {isDebugMode ? 'Hide Debug Info' : 'Show Debug Info'}
                      </button>

                      {isDebugMode && (
                        <div className="mt-2 p-2 bg-gray-700 rounded text-xs text-left">
                          <div className="font-bold">Available Materials:</div>
                          <pre className="overflow-auto max-h-40 mt-1">
                            {JSON.stringify(availableMaterials, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Summary & Materials */}
                <div className="col-span-3">
                  <MaterialsCard
                    materials={availableMaterials}
                    title="Available Recycled Materials"
                    showTotal={true}
                  />

                  <div className="bg-gray-800 p-4 rounded-lg mt-6">
                    <h2 className="text-xl font-bold mb-4">Recycling Summary</h2>
                    {summary ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Bins:</span>
                          <span>{summary.binCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Items:</span>
                          <span>{summary.totalItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Weight:</span>
                          <span>{summary.totalWeight} kg</span>
                        </div>

                        <h3 className="text-sm font-medium text-gray-300 pt-2 border-t border-gray-700">Weight by Category:</h3>
                        {Object.entries(summary.categoryWeights).map(([category, weight]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-gray-300">{formatCategoryName(category)}:</span>
                            <span>{weight.toFixed(2)} kg</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">No summary data available</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manufacturing Lab Tab */}
            {activeTab === 'manufacturing' && (
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Filters & Materials */}
                <div className="col-span-3">
                  <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="text-xl font-bold mb-4">Filter By Application</h2>
                    <div className="space-y-2">
                      <div
                        className={`p-2 rounded cursor-pointer ${selectedApplication === 'ALL' ? 'bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        onClick={() => setSelectedApplication('ALL')}
                      >
                        All Applications
                      </div>
                      {Object.values(ManuFactoryApplicationEnum).map(app => (
                        <div
                          key={app}
                          className={`p-2 rounded cursor-pointer ${selectedApplication === app ? 'bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          onClick={() => setSelectedApplication(app as ManuFactoryApplicationEnum)}
                        >
                          {formatApplicationName(app)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <MaterialsCard
                    materials={availableMaterials}
                    title="Available Recycled Materials"
                    showTotal={true}
                  />
                </div>

                {/* Middle + Right Columns - Manufacturable Items */}
                <div className="col-span-9">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Manufacturable Items</h2>

                    <div className="grid grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2">
                      {filteredManufacturableItems.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-gray-400">
                          No manufacturable items found with the selected filter.
                        </div>
                      ) : isDebugMode ? (
                        <div className="col-span-2 p-4 bg-gray-700 rounded">
                          <h3 className="text-lg font-bold mb-2">Available Raw Materials:</h3>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {Object.entries(availableMaterials).map(([material, amount]) => (
                              <div key={material} className="flex justify-between">
                                <span>{material}:</span>
                                <span className="font-medium">{amount.toFixed(2)} kg</span>
                              </div>
                            ))}
                          </div>
                          <hr className="border-gray-600 my-4" />
                          <h3 className="text-lg font-bold mb-2">Manufacturable Items Data:</h3>
                          <pre className="text-xs overflow-auto max-h-96 bg-gray-800 p-2 rounded">
                            {JSON.stringify(manufacturableItems, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        filteredManufacturableItems.map(item => (
                          <div
                            key={item.itemName}
                            className={`p-4 rounded-md ${item.canManufacture
                              ? 'bg-gray-700 border-2 border-green-500'
                              : 'bg-gray-700 border border-gray-600'
                              }`}
                            onClick={() => console.log("Selected item:", item)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-lg">{item.itemName}</div>
                                <div className="text-xs text-gray-300">
                                  Process: {typeof item.manufactureProcess.process === 'string' ? formatProcessName(item.manufactureProcess.process.replace(/_/g, ' ')) : formatProcessName(item.manufactureProcess.process)}
                                </div>
                              </div>
                              <div className={`px-2 py-1 text-xs rounded ${item.application === 'RENOVATION' ? 'bg-amber-600' :
                                item.application === 'CELEBRATION' ? 'bg-purple-600' :
                                  item.application === 'DISCOVERY' ? 'bg-blue-600' :
                                    'bg-gray-600'
                                }`}>
                                {formatApplicationName(item.application)}
                              </div>
                            </div>

                            <div className="mt-3 mb-1 text-sm font-medium">Required Materials:</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              {item.manufactureProcess.rawMaterials && Object.entries(item.manufactureProcess.rawMaterials).map(([material, amount]) => {
                                const amountNum = typeof amount === 'number' ? amount : Number(amount);
                                const available = item.availableMaterials && item.availableMaterials[material] ? item.availableMaterials[material] : 0;
                                const isMissing = available < amountNum;

                                return (
                                  <div key={material} className="flex justify-between">
                                    <span>{formatRawMaterial(material)}:</span>
                                    <span className={isMissing ? 'text-red-400' : 'text-green-400'}>
                                      {available.toFixed(2)}/{amountNum.toFixed(2)} kg
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex justify-between items-center mt-4">
                              {item.canManufacture ? (
                                <div className="text-green-400 text-xs font-medium">
                                  Can make up to {item.manufacturableCount} units
                                </div>
                              ) : (
                                <div className="text-red-400 text-xs font-medium">
                                  Missing materials
                                </div>
                              )}

                              <button
                                className={`px-3 py-1 rounded text-sm ${item.canManufacture
                                  ? 'bg-green-600 hover:bg-green-500'
                                  : 'bg-gray-600 cursor-not-allowed'
                                  }`}
                                disabled={!item.canManufacture}
                                onClick={() => handleManufactureItem(item)}
                              >
                                Manufacture
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-12 gap-6">
                {/* Monthly Summary */}
                <div className="col-span-12">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Monthly Recycling Summary</h2>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                          <tr>
                            <th className="px-4 py-3">Period</th>
                            <th className="px-4 py-3">Fabric</th>
                            <th className="px-4 py-3">Plastic</th>
                            <th className="px-4 py-3">Glass</th>
                            <th className="px-4 py-3">Metal</th>
                            <th className="px-4 py-3">Paper</th>
                            <th className="px-4 py-3">Composite</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Recycling Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlySummary.length === 0 ? (
                            <tr className="bg-gray-700 border-b border-gray-600">
                              <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                                No recycling data available yet
                              </td>
                            </tr>
                          ) : (
                            monthlySummary.map((summary, index) => {
                              const totalCollected =
                                summary.totalFabricCollected +
                                summary.totalPlasticCollected +
                                summary.totalGlassCollected +
                                summary.totalMetalCollected +
                                summary.totalPaperCollected +
                                summary.totalCompositeCollected;

                              const totalRecycled =
                                summary.totalFabricRecycled +
                                summary.totalPlasticRecycled +
                                summary.totalGlassRecycled +
                                summary.totalMetalRecycled +
                                summary.totalPaperRecycled +
                                summary.totalCompositeRecycled;

                              const recyclingRate = totalCollected > 0
                                ? (totalRecycled / totalCollected) * 100
                                : 0;

                              return (
                                <tr key={`${summary.month}-${summary.year}`}
                                  className={index % 2 === 0
                                    ? 'bg-gray-800'
                                    : 'bg-gray-700'}>
                                  <td className="px-4 py-3 font-medium">
                                    {summary.month} {summary.year}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>Collected: {summary.totalFabricCollected}</div>
                                    <div className="text-green-400">Recycled: {summary.totalFabricRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>Collected: {summary.totalPlasticCollected}</div>
                                    <div className="text-green-400">Recycled: {summary.totalPlasticRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>Collected: {summary.totalGlassCollected}</div>
                                    <div className="text-green-400">Recycled: {summary.totalGlassRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>Collected: {summary.totalMetalCollected}</div>
                                    <div className="text-green-400">Recycled: {summary.totalMetalRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>Collected: {summary.totalPaperCollected}</div>
                                    <div className="text-green-400">Recycled: {summary.totalPaperRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>Collected: {summary.totalCompositeCollected}</div>
                                    <div className="text-green-400">Recycled: {summary.totalCompositeRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3 font-medium">
                                    <div>Collected: {totalCollected}</div>
                                    <div className="text-green-400">Recycled: {totalRecycled}</div>
                                  </td>
                                  <td className="px-4 py-3 font-medium">
                                    <div className={recyclingRate >= 75
                                      ? 'text-green-400'
                                      : recyclingRate >= 50
                                        ? 'text-yellow-400'
                                        : 'text-red-400'}>
                                      {recyclingRate.toFixed(1)}%
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Efficiency Charts */}
                <div className="col-span-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Recycling Efficiency</h2>

                    <div className="space-y-6">
                      {monthlySummary.length === 0 ? (
                        <div className="text-gray-400 italic text-center py-12">
                          No data available for efficiency charts
                        </div>
                      ) : (
                        <>
                          {/* Visual bar chart for recycling rates by category */}
                          <div>
                            <h3 className="text-lg font-medium mb-3">Current Recycling Rates by Category</h3>

                            {Object.entries(TrashCategoryEnum).map(([_, category]) => {
                              // Get the latest month data
                              const latestMonth = monthlySummary[monthlySummary.length - 1];

                              const collected = latestMonth[`total${category}Collected`] || 0;
                              const recycled = latestMonth[`total${category}Recycled`] || 0;

                              const rate = collected > 0 ? (recycled / collected) * 100 : 0;
                              const rateColor = rate >= 75 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500';

                              return (
                                <div key={category} className="mb-3">
                                  <div className="flex justify-between mb-1">
                                    <span>{formatCategoryName(category)}</span>
                                    <span className={rate >= 75 ? 'text-green-400' : rate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                                      {rate.toFixed(1)}% ({recycled}/{collected})
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div
                                      className={`h-2.5 rounded-full ${rateColor}`}
                                      style={{ width: `${Math.max(2, rate)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Overall recycling trends */}
                          <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-medium mb-3">Overall Recycling Trend</h3>

                            <div className="flex h-40 items-end space-x-2">
                              {monthlySummary.map((summary) => {
                                const totalCollected =
                                  summary.totalFabricCollected +
                                  summary.totalPlasticCollected +
                                  summary.totalGlassCollected +
                                  summary.totalMetalCollected +
                                  summary.totalPaperCollected +
                                  summary.totalCompositeCollected;

                                const totalRecycled =
                                  summary.totalFabricRecycled +
                                  summary.totalPlasticRecycled +
                                  summary.totalGlassRecycled +
                                  summary.totalMetalRecycled +
                                  summary.totalPaperRecycled +
                                  summary.totalCompositeRecycled;

                                const recyclingRate = totalCollected > 0
                                  ? (totalRecycled / totalCollected) * 100
                                  : 0;

                                const barHeight = recyclingRate * 0.4;

                                return (
                                  <div key={`${summary.month}-${summary.year}`} className="flex flex-col items-center flex-1">
                                    <div
                                      className={`w-full ${recyclingRate >= 75
                                        ? 'bg-green-500'
                                        : recyclingRate >= 50
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                        } rounded-t`}
                                      style={{ height: `${Math.max(5, barHeight)}%` }}
                                    ></div>
                                    <div className="text-xs mt-2 text-gray-400 truncate w-full text-center">
                                      {summary.month.substr(0, 3)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {recyclingRate.toFixed(0)}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resource Utilization */}
                <div className="col-span-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Resource Utilization</h2>

                    <div className="space-y-4">
                      <MaterialsCard
                        materials={availableMaterials}
                        title="Current Available Materials"
                        showTotal={true}
                      />

                      <div className="bg-gray-700 p-4 rounded-lg mt-6">
                        <h3 className="text-lg font-medium mb-3">Material Usage Tips</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-300">
                          <li>Prioritize MECHANICAL_SHREDDING for fabric items to maximize material recovery.</li>
                          <li>Glass recycling produces the highest output ratio - collect and process efficiently.</li>
                          <li>Aluminum and other metals should be carefully sorted for highest purity recycling.</li>
                          <li>Composite materials require special processing - separate components when possible.</li>
                          <li>Carbon recovery from CO₂ extraction processes creates valuable raw materials.</li>
                        </ul>
                      </div>

                      <div className="bg-gray-700 p-4 rounded-lg mt-6">
                        <h3 className="text-lg font-medium mb-3">Recycling Recommendations</h3>

                        {monthlySummary.length > 0 ? (
                          <>
                            {/* Determine recommendations based on data */}
                            {(() => {
                              const latestMonth = monthlySummary[monthlySummary.length - 1];
                              const lowestCategory = Object.entries(TrashCategoryEnum)
                                .map(([_, category]) => {
                                  const collected = latestMonth[`total${category}Collected`] || 0;
                                  const recycled = latestMonth[`total${category}Recycled`] || 0;
                                  const rate = collected > 0 ? (recycled / collected) * 100 : 100;
                                  return { category, rate };
                                })
                                .filter(item => item.rate < 80)
                                .sort((a, b) => a.rate - b.rate);

                              if (lowestCategory.length === 0) {
                                return (
                                  <div className="text-green-400">
                                    All materials are being recycled at optimal rates. Excellent work!
                                  </div>
                                );
                              }

                              return (
                                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                  {lowestCategory.slice(0, 3).map(({ category, rate }) => (
                                    <li key={category} className="text-yellow-400">
                                      Improve {formatCategoryName(category)} recycling (currently at {rate.toFixed(1)}%)
                                    </li>
                                  ))}
                                  <li className="pt-2">
                                    Focus on moving more items to the recycling module for processing.
                                  </li>
                                  <li>
                                    Consider scheduling regular recycling sessions to prevent backlog.
                                  </li>
                                </ul>
                              );
                            })()}
                          </>
                        ) : (
                          <div className="text-gray-400 italic">
                            Start recycling items to see personalized recommendations.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Flow Tab */}
            {activeTab === 'transfers' && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                  <TrashTransferVisualization />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
