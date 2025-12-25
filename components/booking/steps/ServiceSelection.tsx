import { Tag, CheckCircle2 } from 'lucide-react';
import { Service } from '../types/booking';

interface ServiceSelectionProps {
    services: Service[];
    selectedService: Service | null;
    handleServiceSelect: (service: Service) => void;
}

export const ServiceSelection = ({
    services,
    selectedService,
    handleServiceSelect
}: ServiceSelectionProps) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-xl font-bold text-gray-800">
                <Tag className="text-blue-600" size={24} />
                <h2>Pilih Layanan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(s => {
                    const isSelected = selectedService?.id === s.id;
                    return (
                        <div
                            key={s.id}
                            onClick={() => handleServiceSelect(s)}
                            className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md h-full flex flex-col justify-between ${
                                isSelected
                                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                    : 'border-gray-100 bg-white hover:border-blue-200'
                            }`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 text-blue-600">
                                    <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                                </div>
                            )}

                            <div>
                                <h3 className={`font-bold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                                    {s.name}
                                </h3>
                            </div>

                            {s.badgeText && (
                                <div className="mt-3">
                                    <span className="bg-blue-100 text-blue-600 text-[10px] uppercase font-black px-2 py-0.5 rounded-md">
                                        {s.badgeText}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
