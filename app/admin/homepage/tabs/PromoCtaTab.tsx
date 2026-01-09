'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import { HomepageContent } from '@/types/homepage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FormValues {
    promo: {
        title: string;
        description: string;
        is_active: string;
    };
    cta: {
        headline: string;
        description: string;
        primary_button: string;
        secondary_button: string;
    };
    footer: {
        tagline: string;
        email: string;
        phone: string;
        address: string;
        instagram: string;
        whatsapp: string;
    };
}

export function PromoCtaTab() {
    const { data: content, isLoading } = useSWR<HomepageContent[]>('/api/admin/homepage/content', fetcher);

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { register, handleSubmit, reset } = useForm<FormValues>();

    useEffect(() => {
        if (content) {
            const formData: any = { promo: {}, cta: {}, footer: {} };
            content.forEach(item => {
                if (['promo', 'cta', 'footer'].includes(item.section)) {
                    formData[item.section][item.content_key] = item.content_value;
                }
            });
            reset(formData);
        }
    }, [content, reset]);

    const onSubmit = async (data: FormValues) => {
        setIsSaving(true);
        setMessage(null);

        const updates: Partial<HomepageContent>[] = [];

        ['promo', 'cta', 'footer'].forEach(sectionKey => {
            const section = sectionKey as 'promo' | 'cta' | 'footer';
            const sectionData = data[section];
            if (sectionData) {
                Object.entries(sectionData).forEach(([key, value]) => {
                    updates.push({ section: section, content_key: key, content_value: value });
                });
            }
        });

        try {
            const res = await fetch('/api/admin/homepage/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error('Failed to update');

            setMessage({ type: 'success', text: 'Changes saved successfully!' });
            mutate('/api/admin/homepage/content');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading content...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {message && (
                <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Promo Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b">Promo Section</h3>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            {...register('promo.is_active')}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            {...register('promo.title')}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Promo Spesial Bulan Ini"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            {...register('promo.description')}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Jangan lewatkan..."
                        />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b">CTA (Bottom) Section</h3>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                        <input
                            {...register('cta.headline')}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Siap Mengabadikan Momen Anda?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            {...register('cta.description')}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            placeholder="Pilih layanan..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                            <input
                                {...register('cta.primary_button')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Mulai Booking"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                            <input
                                {...register('cta.secondary_button')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Konsultasi via WhatsApp"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b">Footer Information</h3>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Tagline</label>
                        <textarea
                            {...register('footer.tagline')}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                {...register('footer.email')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                {...register('footer.phone')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (For Links)</label>
                            <input
                                {...register('footer.whatsapp')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="6281234567890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                            <input
                                {...register('footer.instagram')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                {...register('footer.address')}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
