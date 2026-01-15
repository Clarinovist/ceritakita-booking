'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Booking } from '@/lib/storage';
import { SystemSettings } from '@/lib/types/settings';
import { InvoiceTemplate } from '@/components/admin/invoices/InvoiceTemplate';

export default function InvoicePage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        // Check authentication - ensure user is logged in
        if (!session) {
            redirect('/login');
        }

        // Fetch booking data and settings
        const fetchData = async () => {
            try {
                // Fetch booking
                const bookingRes = await fetch(`/api/bookings/${params.id}`);
                if (!bookingRes.ok) {
                    throw new Error('Booking not found or access denied');
                }
                const bookingData = await bookingRes.json();
                setBooking(bookingData);

                // Fetch settings
                const settingsRes = await fetch('/api/settings');
                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setSettings(settingsData);
                }

                // SECURITY: Log invoice access for audit trail
                console.info('[INVOICE_ACCESS]', {
                    bookingId: params.id,
                    accessedBy: session.user?.email || session.user?.name || 'unknown',
                    accessedAt: new Date().toISOString(),
                    customer: bookingData.customer.name
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load booking');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, status, params.id]);

    // Auto-trigger print when page loads (after data is loaded)
    useEffect(() => {
        if (!loading && booking && !error) {
            // Small delay to ensure everything is rendered before printing
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, booking, error]);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                    <h2 className="text-red-800 font-bold text-lg mb-2">Error Loading Invoice</h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => window.close()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md text-center">
                    <h2 className="text-gray-800 font-bold text-lg mb-2">Invoice Not Found</h2>
                    <p className="text-gray-600">The requested booking could not be found.</p>
                    <button
                        onClick={() => window.close()}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Screen-only Header with Print Button */}
            <div className="print:hidden max-w-[210mm] mx-auto mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoice #{booking.id}</h1>
                    <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
                    >
                        <span>Print / Save PDF</span>
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Render Universal Template */}
            <InvoiceTemplate settings={settings || {} as SystemSettings} data={booking} />

            {/* Screen-only Print Reminder */}
            <div className="print:hidden max-w-[210mm] mx-auto mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center text-sm text-blue-800">
                <strong>Tip:</strong> Use browser print function (Cmd/Ctrl + P) to save as PDF.
            </div>
        </div>
    );
}
