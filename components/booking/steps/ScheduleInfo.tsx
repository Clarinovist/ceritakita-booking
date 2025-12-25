import { Calendar, MapPin, Clock } from 'lucide-react';

interface ScheduleInfoProps {
    formData: {
        date: string;
        time: string;
        location_link: string;
        category: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ScheduleInfo = ({ formData, handleChange }: ScheduleInfoProps) => {
    const isOutdoor = formData.category.toLowerCase().includes('outdoor');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 font-bold text-gray-800">
                <Calendar className="text-blue-600" size={20} />
                <h3>Jadwal & Sesi</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Tanggal</label>
                    <input
                        required
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium">Jam (interval 30 menit)</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
                        <select
                            required
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="">Pilih waktu</option>
                            {Array.from({ length: 48 }, (_, i) => {
                                const hour = Math.floor(i / 2);
                                const minute = i % 2 === 0 ? '00' : '30';
                                const timeValue = `${hour.toString().padStart(2, '0')}:${minute}`;
                                return (
                                    <option key={timeValue} value={timeValue}>
                                        {timeValue}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <p className="text-xs text-gray-400">Contoh: 09:00, 09:30, 10:00</p>
                </div>
            </div>

            {isOutdoor && (
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <MapPin size={12} /> Lokasi Photoshoot
                    </label>
                    <input
                        required
                        type="url"
                        name="location_link"
                        value={formData.location_link}
                        onChange={handleChange}
                        placeholder="Masukkan link Google Maps lokasi"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
            )}
        </div>
    );
};
