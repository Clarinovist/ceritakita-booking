'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useForm } from 'react-hook-form';
import { Testimonial } from '@/types/homepage';
import { Plus, Trash2, Pencil } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TestimonialsTab() {
    const { data: items, isLoading } = useSWR<Testimonial[]>('/api/admin/testimonials', fetcher);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { register, handleSubmit, reset } = useForm<Partial<Testimonial>>();

    const handleEdit = (item: Testimonial) => {
        setEditingItem(item);
        reset(item);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingItem(null);
        reset({ author_name: '', author_title: '', quote: '', display_order: items ? items.length + 1 : 1, is_active: 1 });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
            mutate('/api/admin/testimonials');
        } catch (error) {
            alert('Failed to delete testimonial');
        }
    };

    const onSubmit = async (data: Partial<Testimonial>) => {
        try {
            const url = editingItem ? `/api/admin/testimonials/${editingItem.id}` : '/api/admin/testimonials';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to save');

            mutate('/api/admin/testimonials');
            setIsFormOpen(false);
            reset();
        } catch (error) {
            alert('Failed to save testimonial');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Testimonials</h3>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Testimonial
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title/Event</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items?.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.author_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author_title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.quote}</td>
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
                                    No testimonials found. Create one to get started.
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
                        <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Testimonial' : 'New Testimonial'}</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                                <input {...register('author_name')} className="w-full px-3 py-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title / Event</label>
                                <input {...register('author_title')} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Wisuda S1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                                <textarea {...register('quote')} className="w-full px-3 py-2 border rounded-md" rows={3} required />
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
