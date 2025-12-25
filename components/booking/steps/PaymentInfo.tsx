import { MessageSquare, Upload } from 'lucide-react';
import Image from 'next/image';
import { PaymentDetails } from '../components/PaymentDetails';

interface PaymentInfoProps {
    formData: {
        dp_amount: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    proofPreview: string;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    paymentSettings: any;
    copyToClipboard: (text: string) => void;
}

export const PaymentInfo = ({
    formData,
    handleChange,
    proofPreview,
    handleFileChange,
    paymentSettings,
    copyToClipboard
}: PaymentInfoProps) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 font-bold text-gray-800">
                <MessageSquare className="text-blue-600" size={20} />
                <h3>Pembayaran DP</h3>
            </div>
            
            {/* Payment Methods Display */}
            <PaymentDetails
                paymentSettings={paymentSettings}
                copyToClipboard={copyToClipboard}
            />

            <input
                required
                type="number"
                name="dp_amount"
                value={formData.dp_amount}
                onChange={handleChange}
                placeholder="Masukkan Jumlah DP (Rp)"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
            />

            <div className="relative group overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 transition-all hover:bg-white hover:border-blue-300">
                <input
                    required={!proofPreview}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {!proofPreview ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload size={32} strokeWidth={1.5} className="group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm">Klik untuk upload bukti transfer</p>
                        <p className="text-[10px]">JPG, PNG, GIF, WEBP max 5MB</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <Image
                            src={proofPreview}
                            alt="Preview"
                            width={300}
                            height={128}
                            className="h-32 mx-auto rounded-lg object-contain shadow-sm border bg-white"
                            unoptimized
                        />
                        <p className="text-xs text-blue-600 mt-2 font-bold italic">Bukti terpilih (klik untuk ganti)</p>
                    </div>
                )}
            </div>
        </div>
    );
};
