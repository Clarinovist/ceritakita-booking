import { XCircle, Save } from 'lucide-react';
import { AddonFormData, Addon } from '@/lib/types';

interface AddonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingAddon: Addon | null;
    formData: AddonFormData;
    setFormData: (data: AddonFormData) => void;
}

export const AddonModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingAddon,
    formData,
    setFormData
}: AddonModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold">{editingAddon ? 'Edit Add-on' : 'Add New Add-on'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <XCircle size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Add-on Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Extra Photos"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Price (Rp)</label>
                        <input
                            required
                            type="number"
                            min="0"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    {/* Note: Applicable categories logic can be complex for a simple modal, keeping it simple for now or could add a multi-select if needed. 
                        For now, following the pattern of simple fields. Detailed category selection might need more UI work.
                        Assuming undefined/empty means "All Categories" as per table logic.
                     */}
                    
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="addon_is_active"
                            checked={formData.is_active}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded"
                        />
                        <label htmlFor="addon_is_active" className="text-sm font-bold text-gray-700 cursor-pointer">Add-on is Active</label>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Save size={18} />
                            {editingAddon ? 'Update Add-on' : 'Create Add-on'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
