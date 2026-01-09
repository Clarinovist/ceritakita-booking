'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useForm } from 'react-hook-form';
import { ValueProposition } from '@/types/homepage';
import { Plus, Trash2, Pencil } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ValuePropsTab() {
    const { data: items, isLoading } = useSWR<ValueProposition[]>('/api/admin/value-props', fetcher);
    const [editingItem, setEditingItem] = useState<ValueProposition | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { register, handleSubmit, reset } = useForm<Partial<ValueProposition>>();

    const handleEdit = (item: ValueProposition) => {
        setEditingItem(item);
        reset(item);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        reset({ icon: 'Camera', title: '', description: '', display_order: items ? items.length + 1 : 1, is_active: 1 });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetch(`/api/admin/value-props/${id}`, { method: 'DELETE' });
            mutate('/api/admin/value-props');
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const onSubmit = async (data: Partial<ValueProposition>) => {
        try {
            const url = editingItem ? `/api/admin/value-props/${editingItem.id}` : '/api/admin/value-props';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to save');

            mutate('/api/admin/value-props');
            setIsFormOpen(false);
            reset();
        } catch (error) {
            alert('Failed to save item');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Value Propositions</h3>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Value Prop
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items?.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.icon}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.display_order}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No value propositions found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal/Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Value Prop' : 'New Value Prop'}</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name (Lucide React)</label>
                                <input {...register('icon')} className="w-full px-3 py-2 border rounded-md" placeholder="Camera, Clock, etc." />
                                <p className="text-xs text-gray-500 mt-1">Available: Camera, Clock, CreditCard, MapPin, Award, Heart, Star, Shield, Users, Zap</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input {...register('title')} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea {...register('description')} className="w-full px-3 py-2 border rounded-md" rows={3} required />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input {...register('display_order', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-md" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select {...register('is_active', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded-md">
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
