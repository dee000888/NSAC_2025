import { useEffect, useState } from "react";
import { ConsumableItemSchema, TrashItemSchema } from "@renderer/lib/types";
import ConsumableItemsPopup from "./ConsumableItemsPopup";
import { formatCategoryName, formatItemName, formatWeight } from "@renderer/lib/formatUtils";

interface BinDetailsProps {
  selectedBinId: string;
  consumableItems: ConsumableItemSchema[];
  onBack: () => void;
  onConsumableItemsUpdated: () => void;
}

export default function BinDetails(props: BinDetailsProps): React.ReactElement {

  const { selectedBinId, consumableItems, onBack, onConsumableItemsUpdated } = props;

  const [trashItems, setTrashItems] = useState<TrashItemSchema[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  async function getTrashItemsForBin(binId: string) {
    setLoading(true);
    setError(null);
    try {
      console.log(`Requesting trash items for bin ${binId}`);
      const items = await window.electron.ipcRenderer.invoke("getTrashItemsByBin", { binId });
      console.log("Fetched trash items:", items);

      setDebugInfo(`Retrieved ${items.length} items for bin ${binId}`);

      if (Array.isArray(items)) {
        setTrashItems(items);
      } else {
        console.error("Received invalid data format for trash items:", items);
        setError("Invalid data format received from the server");
        setTrashItems([]);
      }
    } catch (err) {
      console.error("Failed to load trash items:", err);
      setError("Failed to load trash items. Please try again.");
      setTrashItems([]);
    } finally {
      setLoading(false);
    }
  }

  const handleTrashItemsUpdated = async () => {
    if (selectedBinId) {
      await getTrashItemsForBin(selectedBinId);
    }
  };

  useEffect(() => {
    getTrashItemsForBin(selectedBinId);
    setDebugInfo(`Initial load for bin ${selectedBinId}`);
  }, [selectedBinId]);

  // Helper function to get consumable item details by codeName
  const getConsumableByCodeName = (codeName: string): ConsumableItemSchema | undefined => {
    return consumableItems.find(item => item.codeName === codeName);
  };

  const handleInsertTrash = () => {
    setIsPopupOpen(true);
    setDebugInfo(`Opening trash selection popup for bin ${selectedBinId}`);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setDebugInfo(`Closed trash selection popup for bin ${selectedBinId}`);
  };

  const handleItemSelect = async (item: ConsumableItemSchema) => {
    setIsPopupOpen(false);

    // Refresh both trash items and consumable items after adding new item
    try {
      console.log(`Item ${item.name} successfully added to bin ${selectedBinId}`);

      // Notify parent components to refresh data
      await handleTrashItemsUpdated();
      await onConsumableItemsUpdated();

      // Give the database a moment to update
      setTimeout(() => {
        getTrashItemsForBin(selectedBinId);
      }, 500);

      // Show success notification
      setDebugInfo(`Added item: ${item.name} to bin: ${selectedBinId}`);
    } catch (err) {
      console.error("Failed to refresh items:", err);
      setError("Failed to refresh items after adding a new item.");
    }
  };

  return (
    <>
      {/* Bin Details Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Bin Contents</h2>
        <div className="flex gap-3">
          <button
            className="p-2 px-3 bg-green-600 hover:bg-green-500 rounded text-white"
            onClick={handleInsertTrash}
          >
            Insert Trash
          </button>
          <button
            className="p-2 px-3 bg-white/20 hover:bg-white/30 rounded text-white"
            onClick={onBack}
          >
            Back to Bins
          </button>
        </div>
      </div>

      {/* Bin Contents */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center text-white text-sm mb-3">
          <div>Bin ID: {selectedBinId}</div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
          >
            {showDebug ? 'Hide Debug' : 'Debug'}
          </button>
        </div>

        {showDebug && (
          <div className="bg-gray-900 p-3 mb-3 rounded text-xs text-gray-300 font-mono">
            <div className="font-bold text-blue-400 mb-1">Debug Information:</div>
            <div>{debugInfo || 'No debug info available'}</div>
            <div className="mt-2">Bin ID: {selectedBinId}</div>
            <div>Trash Items Count: {trashItems.length}</div>
            <div>Available Consumables: {consumableItems.length}</div>
            <div className="mt-2 font-bold text-blue-400">Raw Trash Items Data:</div>
            <pre className="overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(trashItems, null, 2)}
            </pre>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-800/50 text-white p-3 mb-3 rounded-lg">
            Error: {error}
            <button
              onClick={() => getTrashItemsForBin(selectedBinId)}
              className="ml-3 bg-blue-600 px-2 py-1 text-xs rounded hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {!loading && trashItems.length === 0 && !error && (
            <div className="text-gray-300">No items in this bin.</div>
          )}
          {trashItems.map((item) => {
            const consumableInfo = getConsumableByCodeName(item.codeName);
            const totalWeight = consumableInfo ? (consumableInfo.weight_kg * item.quantity) : 0;

            return (
              <div key={item.trashId} className="bg-gray-700 hover:bg-gray-600 p-3 rounded text-white transition-colors">
                <div className="text-xs text-gray-300 mb-1">ID: {item.trashId}</div>
                <div className="text-sm font-semibold mb-1">{formatItemName(consumableInfo?.name || item.codeName)}</div>
                <div className="text-xs">Category: {formatCategoryName(consumableInfo?.category || 'UNKNOWN')}</div>
                <div className="text-xs">Quantity: {item.quantity}</div>
                <div className="text-xs">Total Weight: {formatWeight(totalWeight)}</div>
                <div className="text-xs text-blue-400 mt-1">Code: {item.codeName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consumable Items Popup */}
      <ConsumableItemsPopup
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        onSelectItem={handleItemSelect}
        binId={selectedBinId}
      />

    </>
  );
}
