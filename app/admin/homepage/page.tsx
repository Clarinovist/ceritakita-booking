'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeroAboutTab } from './tabs/HeroAboutTab';
import { ServiceCategoriesTab } from './tabs/ServiceCategoriesTab';
import { ValuePropsTab } from './tabs/ValuePropsTab';
import { TestimonialsTab } from './tabs/TestimonialsTab';
import { PromoCtaTab } from './tabs/PromoCtaTab';

export default function AdminHomepage() {
    const [activeTab, setActiveTab] = useState('hero');

    const tabs = [
        { id: 'hero', label: 'Hero & About' },
        { id: 'services', label: 'Layanan' },
        { id: 'value-props', label: 'Keunggulan' },
        { id: 'testimonials', label: 'Testimonials' },
        { id: 'promo', label: 'Promo & CTA' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                            ← Back to Dashboard
                        </Link>
                        <div className="h-6 w-px bg-gray-300" />
                        <h1 className="text-xl font-semibold text-gray-900">
                            Homepage CMS
                        </h1>
                    </div>
                    <Link href="/" target="_blank" className="text-sm text-blue-600 hover:underline">
                        View Homepage ↗
                    </Link>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'hero' && <HeroAboutTab />}
                {activeTab === 'services' && <ServiceCategoriesTab />}
                {activeTab === 'value-props' && <ValuePropsTab />}
                {activeTab === 'testimonials' && <TestimonialsTab />}
                {activeTab === 'promo' && <PromoCtaTab />}
            </div>
        </div>
    );
}
