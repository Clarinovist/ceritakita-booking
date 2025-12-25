import { ShoppingBag } from 'lucide-react';
import { Addon } from '../types/booking';

interface AddonsSelectionProps {
    availableAddons: Addon[];
    selectedAddons: Map<string, number>;
    toggleAddon: (addonId: string) => void;
    updateAddonQuantity: (addonId: string, quantity: number) => void;
}

export const AddonsSelection = ({
    availableAddons,
    selectedAddons,
    toggleAddon,
    updateAddonQuantity
}: AddonsSelectionProps) => {
    if (availableAddons.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
                <ShoppingBag className="text-blue-600" size={20} />
                <h3>Tambahan (Opsional)</h3>
            </div>
            <div className="space-y-3">
                {availableAddons.map(addon => {
                    const isSelected = selectedAddons.has(addon.id);
                    const quantity = selectedAddons.get(addon.id) || 1;
                    return (
                        <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 transition-colors">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleAddon(addon.id)}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-800">{addon.name}</div>
                                    <div className="text-sm text-green-600 font-bold">+Rp {addon.price.toLocaleString()}</div>
                                </div>
                            </label>
                            {isSelected && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateAddonQuantity(addon.id, quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-bold">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center border rounded-lg hover:bg-gray-100 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
