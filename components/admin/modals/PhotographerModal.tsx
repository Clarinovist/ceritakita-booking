import { XCircle, Save } from 'lucide-react';
import { PhotographerFormData, Photographer } from '@/lib/types';

interface PhotographerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingPhotographer: Photographer | null;
    formData: PhotographerFormData;
    setFormData: (data: PhotographerFormData) => void;
}

export const PhotographerModal = ({
    isOpen,
    onClose,
    onSubmit,
    editingPhotographer,
    formData,
    setFormData
}: PhotographerModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold">{editingPhotographer ? 'Edit Photographer' : 'Add New Photographer'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <XCircle size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Photographer Name"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone (Optional)</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="e.g. 0812..."
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Specialty (Optional)</label>
                        <input
                            type="text"
                            value={formData.specialty}
                            onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                            placeholder="e.g. Wedding, Portrait"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="photographer_is_active"
                            checked={formData.is_active}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded"
                        />
                        <label htmlFor="photographer_is_active" className="text-sm font-bold text-gray-700 cursor-pointer">Photographer is Active</label>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Save size={18} />
                            {editingPhotographer ? 'Update Photographer' : 'Create Photographer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
