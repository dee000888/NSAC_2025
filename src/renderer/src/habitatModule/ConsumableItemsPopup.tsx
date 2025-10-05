import { useState, useEffect } from "react";
import { ConsumableItemSchema } from "@renderer/lib/types";
import { formatCategoryName, formatItemName } from "@renderer/lib/formatUtils";

interface ConsumableItemsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: ConsumableItemSchema) => void;
  binId: string;
}

export default function ConsumableItemsPopup({
  isOpen,
  onClose,
  onSelectItem,
  binId
}: ConsumableItemsPopupProps): React.ReactElement {
  const [items, setItems] = useState<ConsumableItemSchema[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConsumableItems();
    }
  }, [isOpen]);

  async function fetchConsumableItems() {
    try {
      setLoading(true);
      console.log("Fetching consumable items...");
      const consumableItems: ConsumableItemSchema[] = await window.electron.ipcRenderer.invoke("getConsumableItems");
      console.log(`Received ${consumableItems.length} consumable items`);
      setItems(consumableItems);
    } catch (err) {
      console.error("Failed to fetch consumable items:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleItemSelect(item: ConsumableItemSchema) {
    if (item.quantity <= 0) {
      alert("This item is out of stock!");
      return;
    }

    try {
      console.log(`Converting ${item.name} to trash for bin ${binId}`);
      const result = await window.electron.ipcRenderer.invoke("convertConsumableToTrash", {
        consumableItem: item,
        binId: binId,
        moduleName: "" // Will be ignored in the conversion logic
      });
      console.log("Conversion result:", result);

      if (result.success) {
        alert(`Successfully added ${item.name} to bin ${binId}`);
        onSelectItem(item);
        // Refresh the items list to show updated quantities
        fetchConsumableItems();
      }
    } catch (err) {
      console.error("Failed to add item to trash:", err);
      alert("Failed to add item to trash. Please try again.");
    }
  }

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg p-6 max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-600">
          <h2 className="text-xl font-bold">Select Item to Insert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Loading or Items Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-400">Loading items...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {items.map((item) => {
                const weightPerItem = item.quantity > 0 ? (item.weight_kg / item.quantity).toFixed(3) : 0;
                const isOutOfStock = item.quantity <= 0;

                return (
                  <div
                    key={item.codeName}
                    className={`bg-gray-700 p-4 rounded-lg cursor-pointer transition-all ${isOutOfStock
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-600 hover:scale-105'
                      }`}
                    onClick={() => !isOutOfStock && handleItemSelect(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{formatItemName(item.name)}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${item.category === 'FABRIC' ? 'bg-blue-600' :
                        item.category === 'POLYMER' ? 'bg-purple-600' :
                          item.category === 'GLASS' ? 'bg-green-600' :
                            item.category === 'METAL' ? 'bg-yellow-600' :
                              item.category === 'PAPER' ? 'bg-blue-500' :
                                'bg-gray-600'
                        }`}>
                        {formatCategoryName(item.category)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-300 mb-2">
                      <div>Code: {item.codeName}</div>
                      <div>Available: {item.quantity} units</div>
                      <div>Individual Weight: {weightPerItem} kg</div>
                      <div>Total Weight: {item.weight_kg.toFixed(3)} kg</div>
                    </div>

                    {isOutOfStock && (
                      <div className="text-xs text-red-400 font-semibold mt-2">
                        Out of Stock
                      </div>
                    )}

                    {!isOutOfStock && (
                      <div className="text-xs text-green-400 font-semibold mt-2">
                        Click to add to bin
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
