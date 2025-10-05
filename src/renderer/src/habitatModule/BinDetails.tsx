import { useState } from "react";
import { ConsumableItemSchema, TrashItemSchema } from "@renderer/lib/types";
import ConsumableItemsPopup from "./ConsumableItemsPopup";

interface BinDetailsProps {
  selectedBinId: string;
  trashItems: TrashItemSchema[];
  consumableItems: ConsumableItemSchema[];
  onBack: () => void;
  onTrashItemsUpdated: () => void;
  onConsumableItemsUpdated: () => void;
}

export default function BinDetails(props: BinDetailsProps): React.ReactElement {

  const { selectedBinId, trashItems, consumableItems, onBack, onTrashItemsUpdated, onConsumableItemsUpdated } = props;
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Helper function to get consumable item details by codeName
  const getConsumableByCodeName = (codeName: string): ConsumableItemSchema | undefined => {
    return consumableItems.find(item => item.codeName === codeName);
  };

  const handleInsertTrash = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleItemSelect = async (item: ConsumableItemSchema) => {
    setIsPopupOpen(false);

    // Refresh both trash items and consumable items after adding new item
    try {
      console.log(`Item ${item.name} successfully added to bin ${selectedBinId}`);

      // Notify parent components to refresh data
      onTrashItemsUpdated();
      onConsumableItemsUpdated();
    } catch (err) {
      console.error("Failed to refresh items:", err);
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
        <div className="text-white text-sm mb-3">Bin ID: {selectedBinId}</div>
        <div className="grid grid-cols-3 gap-3">
          {trashItems.length === 0 && (
            <div className="text-gray-300">No items in this bin.</div>
          )}
          {trashItems.map((item) => {
            const consumableInfo = getConsumableByCodeName(item.codeName);
            const totalWeight = consumableInfo ? (consumableInfo.weight_kg * item.quantity) : 0;

            return (
              <div key={item.trashId} className="bg-gray-700 p-3 rounded text-white">
                <div className="text-xs text-gray-300 mb-1">ID: {item.trashId}</div>
                <div className="text-sm font-semibold mb-1">{consumableInfo?.name || item.codeName}</div>
                <div className="text-xs">Category: {consumableInfo?.category || 'UNKNOWN'}</div>
                <div className="text-xs">Quantity: {item.quantity}</div>
                <div className="text-xs">Total Weight: {totalWeight.toFixed(2)} kg</div>
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
