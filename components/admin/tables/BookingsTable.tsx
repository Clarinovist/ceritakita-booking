import { Booking } from '@/lib/storage';
import { FilterStatus } from '../types/admin';

interface BookingsTableProps {
    bookings: Booking[];
    filterStatus: FilterStatus;
    setFilterStatus: (status: FilterStatus) => void;
    setSelectedBooking: (booking: Booking) => void;
    handleUpdateStatus: (bookingId: string, status: Booking['status']) => void;
    handleDeleteBooking: (bookingId: string) => void;
    handleOpenCreateBookingModal: () => void;
    calculateFinance: (b: Booking) => { total: number; paid: number; balance: number; isPaidOff: boolean };
}

export const BookingsTable = ({
    bookings,
    filterStatus,
    setFilterStatus,
    setSelectedBooking,
    handleUpdateStatus,
    handleDeleteBooking,
    handleOpenCreateBookingModal,
    calculateFinance
}: BookingsTableProps) => {
    return (
        <div className="bg-white rounded-xl shadow overflow-hidden animate-in fade-in min-h-[500px]">
            <div className="p-4 border-b flex gap-4 items-center bg-gray-50 justify-between">
                <div className="flex gap-4 items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span>📋</span> All Bookings
                    </h3>
                    <div className="flex bg-white border rounded-lg overflow-hidden text-sm">
                        {(['All', 'Active', 'Canceled'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 ${filterStatus === s ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleOpenCreateBookingModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                    <span>➕</span> Create Booking
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Balance</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {bookings.length === 0 && (
                            <tr><td colSpan={8} className="text-center p-8 text-gray-400">No bookings found.</td></tr>
                        )}
                        {bookings.map(b => {
                            const { balance, isPaidOff } = calculateFinance(b);
                            return (
                                <tr key={b.id} className={`hover:bg-gray-50 ${b.status === 'Rescheduled' ? 'bg-orange-50/30' : ''}`}>
                                    <td className="px-4 py-3">{new Date(b.booking.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{new Date(b.booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            {b.customer.name}
                                            {b.status === 'Rescheduled' && (
                                                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-orange-200">
                                                    Reschedule
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{b.customer.whatsapp}</td>
                                    <td className="px-4 py-3">{b.customer.category}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={b.status}
                                            onChange={(e) => handleUpdateStatus(b.id, e.target.value as Booking['status'])}
                                            className={`border-none bg-transparent text-xs font-bold focus:ring-0 cursor-pointer
                                      ${b.status === 'Cancelled' ? 'text-red-600' : b.status === 'Rescheduled' ? 'text-orange-600' : 'text-green-600'}`}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Rescheduled">Rescheduled</option>
                                            <option value="Canceled">Canceled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {isPaidOff ? (
                                            <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">LUNAS</span>
                                        ) : (
                                            <span className="text-red-500 font-medium">Rp {balance.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedBooking(b)} className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50">
                                                Details
                                            </button>
                                            <button onClick={() => handleDeleteBooking(b.id)} className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
