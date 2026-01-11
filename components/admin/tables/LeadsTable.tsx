import { formatDate } from '@/utils/dateFormatter';
import { Lead, LeadStatus, LeadSource, Service } from '@/lib/types';
import { getLeadStatusColor, getLeadSourceIcon, LEAD_STATUSES, LEAD_SOURCES } from '@/lib/types/leads';
import { BulkActionBar } from '../leads/BulkActionBar';
import { Pencil, Trash2, ArrowRightLeft, MessageCircle, Phone, Search, X } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  filterStatus: LeadStatus | 'All';
  setFilterStatus: (status: LeadStatus | 'All') => void;
  filterSource: LeadSource | 'All';
  setFilterSource: (source: LeadSource | 'All') => void;
  filterInterest: string | 'All';
  setFilterInterest: (interest: string | 'All') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenModal: (lead?: Lead) => void;
  onDeleteLead: (id: string) => void;
  onConvertToBooking: (lead: Lead) => void;
  onWhatsApp: (whatsapp: string) => void;
  services: Service[]; // Added services prop

  // New props for bulk actions & pagination
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onBulkUpdateStatus?: (status: LeadStatus) => void;
  onBulkDelete?: () => void;
  onBulkWhatsApp?: () => void;

  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export const LeadsTable = ({
  leads,
  filterStatus,
  setFilterStatus,
  filterSource,
  setFilterSource,
  filterInterest,
  setFilterInterest,
  searchQuery,
  setSearchQuery,
  onOpenModal,
  onDeleteLead,
  onConvertToBooking,
  onWhatsApp,
  services, // Destructure services

  selectedIds = new Set(),
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onBulkUpdateStatus,
  onBulkDelete,
  onBulkWhatsApp,

  pagination,
  onPageChange
}: LeadsTableProps) => {

  const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id));
  const someSelected = leads.some(l => selectedIds.has(l.id));

  // Helper to check if string contains only digits (roughly a phone number)
  const isPhoneNumber = (str: string) => /^\+?[\d\s-]+$/.test(str);

  // Helper to check if name is placeholder-like
  const isPlaceholderName = (name: string) => {
    const lower = name.toLowerCase().trim();
    return lower === 'nn' || lower === '-' || lower === '' || lower === 'n/a';
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden animate-in fade-in min-h-[500px] flex flex-col">
      {/* Search and Filters Row */}
      <div className="p-4 border-b flex gap-3 items-center flex-wrap bg-white">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex bg-white border rounded-lg overflow-hidden text-sm">
          {['All', ...LEAD_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as LeadStatus | 'All')}
              className={`px-3 py-1.5 transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Source Filter */}
        <div className="flex bg-white border rounded-lg overflow-hidden text-sm">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as LeadSource | 'All')}
            className="px-3 py-1.5 outline-none hover:bg-gray-50 text-gray-600 bg-transparent cursor-pointer"
          >
            <option value="All">All Sources</option>
            {LEAD_SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Interest Filter */}
        <div className="flex bg-white border rounded-lg overflow-hidden text-sm">
          <select
            value={filterInterest}
            onChange={(e) => setFilterInterest(e.target.value)}
            className="px-3 py-1.5 outline-none hover:bg-gray-50 text-gray-600 bg-transparent cursor-pointer"
          >
            <option value="All">All Interests</option>
            {services.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="w-10 px-4 py-3">
                {onSelectAll && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someSelected && !allSelected;
                      }
                    }}
                    onChange={() => {
                      if (allSelected) {
                        onDeselectAll?.();
                      } else {
                        onSelectAll?.();
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                )}
              </th>
              <th className="px-4 py-3">Lead Info</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Interest</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Next Follow-up</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📭</span>
                    <span>No leads found.</span>
                  </div>
                </td>
              </tr>
            )}
            {leads.map(lead => (
              <tr key={lead.id} className={`hover:bg-gray-50 group transition-colors ${selectedIds.has(lead.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-3">
                  {onToggleSelect && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                </td>
                {/* Lead Info: Name + Contact merged */}
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-0.5">
                    {/* Name row */}
                    <div className="flex items-center gap-2">
                      {!isPlaceholderName(lead.name) && (
                        <span className="font-medium text-gray-900">{lead.name}</span>
                      )}
                      {lead.notes && (
                        <span className="text-gray-300 group-hover:text-gray-500 transition-colors" title={lead.notes}>
                          <MessageCircle size={14} />
                        </span>
                      )}
                    </div>
                    {/* Contact row */}
                    {isPhoneNumber(lead.whatsapp) ? (
                      <button
                        onClick={() => onWhatsApp(lead.whatsapp)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center gap-1 hover:underline w-fit"
                        title="Open WhatsApp"
                      >
                        <Phone size={12} className="fill-current" />
                        {lead.whatsapp}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <MessageCircle size={12} />
                        {lead.whatsapp}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-gray-600 text-xs">
                    <span>{getLeadSourceIcon(lead.source)}</span>
                    {lead.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(lead.interest && lead.interest.length > 0) ? (
                    <div className="flex flex-wrap gap-1">
                      {lead.interest.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200">
                          {item}
                        </span>
                      ))}
                      {lead.interest.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200" title={lead.interest.join(', ')}>
                          +{lead.interest.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getLeadStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDate(lead.created_at)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {lead.next_follow_up ? (
                    <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                      {formatDate(lead.next_follow_up)}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end items-center">
                    {/* Convert to Booking - Only for Won leads without booking */}
                    {lead.status === 'Won' && !lead.booking_id && (
                      <button
                        onClick={() => onConvertToBooking(lead)}
                        className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-50 transition-colors"
                        title="Convert to Booking"
                      >
                        <ArrowRightLeft size={16} />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onOpenModal(lead)}
                      className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                      title="Edit Lead"
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this lead?')) {
                          onDeleteLead(lead.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination & Bulk Actions */}
      {pagination && onPageChange && (
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`px-3 py-1 border rounded text-sm transition-colors ${pagination.page === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              );
            })}
            <span className="px-3 py-1 text-sm font-medium text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && onBulkUpdateStatus && onBulkDelete && onBulkWhatsApp && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onClearSelection={onDeselectAll || (() => { })}
          onUpdateStatus={onBulkUpdateStatus}
          onDelete={onBulkDelete}
          onWhatsApp={onBulkWhatsApp}
        />
      )}
    </div>
  );
};