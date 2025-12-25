import Image from 'next/image';
import { XCircle } from 'lucide-react';

interface LightboxProps {
    imageUrl: string | null;
    onClose: () => void;
}

export const Lightbox = ({ imageUrl, onClose }: LightboxProps) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 backdrop-blur-sm transition-all z-10"
                >
                    <XCircle size={32} />
                </button>
                <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt="Portfolio Full View"
                        width={1200}
                        height={800}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        unoptimized
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        </div>
    );
};
