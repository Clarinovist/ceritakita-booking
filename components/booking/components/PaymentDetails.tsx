import Image from 'next/image';

interface PaymentDetailsProps {
    paymentSettings: {
        bank_name: string;
        account_name: string;
        account_number: string;
        qris_image_url?: string;
    } | null;
    copyToClipboard: (text: string) => void;
}

export const PaymentDetails = ({ paymentSettings, copyToClipboard }: PaymentDetailsProps) => {
    if (!paymentSettings) return null;

    return (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-3">
            <h4 className="font-bold text-blue-900 text-sm">Informasi Pembayaran:</h4>
            
            {/* Bank Transfer */}
            <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="font-bold text-gray-800">{paymentSettings.bank_name}</p>
                        <p className="text-sm text-gray-600">{paymentSettings.account_name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(paymentSettings.account_number)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
                    >
                        Copy
                    </button>
                </div>
                <p className="font-mono text-lg font-bold text-blue-800">{paymentSettings.account_number}</p>
            </div>

            {/* QRIS */}
            {paymentSettings.qris_image_url && (
                <div className="bg-white p-3 rounded-lg border border-blue-100 text-center">
                    <p className="text-xs font-bold text-gray-600 mb-2">Atau scan QRIS:</p>
                    <div className="inline-block border-2 border-blue-200 rounded-lg overflow-hidden">
                        <Image
                            src={paymentSettings.qris_image_url}
                            alt="QRIS Payment"
                            width={200}
                            height={200}
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
