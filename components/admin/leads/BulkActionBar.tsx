import React from 'react';
import { LeadStatus } from '@/lib/types';
import { LEAD_STATUSES } from '@/lib/types/leads';

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onUpdateStatus: (status: LeadStatus) => void;
    onDelete: () => void;
    onWhatsApp: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
    selectedCount,
    onClearSelection,
    onUpdateStatus,
    onDelete,
    onWhatsApp
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 border-r pr-6">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {selectedCount}
                </span>
                <span className="text-sm font-medium text-gray-700">Selected</span>
                <button
                    onClick={onClearSelection}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                >
                    Clear
                </button>
            </div>

            <div className="flex items-center gap-3">
                {/* Status Update */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Set Status:</span>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                onUpdateStatus(e.target.value as LeadStatus);
                                e.target.value = ''; // Reset select
                            }
                        }}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 py-1.5 px-3"
                        defaultValue=""
                    >
                        <option value="" disabled>Choose...</option>
                        {LEAD_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="w-px h-6 bg-gray-200 mx-2"></div>

                {/* Action Buttons */}
                <button
                    onClick={onWhatsApp}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    title="Open WhatsApp for all selected"
                >
                    <span>💬</span> Broadcast WA
                </button>

                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    );
};
