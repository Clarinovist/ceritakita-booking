'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useHomepageData } from '@/hooks/useHomepageData';
import { GalleryImage } from '@/types/homepage';

// Number of images to show per category
const IMAGES_PER_CATEGORY = 2;

export function GallerySection() {
    const { data, isLoading } = useHomepageData();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [imageOrientation, setImageOrientation] = useState<'portrait' | 'landscape'>('landscape');
    const carouselRef = useRef<HTMLDivElement>(null);

    // Get featured images: limit to N per category
    const featuredImages = useMemo(() => {
        const allImages = data?.portfolioImages || [];

        // Group by category
        const byCategory: Record<string, GalleryImage[]> = {};
        allImages.forEach(img => {
            const cat = img.service_name || 'Other';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(img);
        });

        // Take first N from each category (sorted by display_order)
        const featured: GalleryImage[] = [];
        Object.values(byCategory).forEach(categoryImages => {
            const sorted = categoryImages.sort((a, b) => a.display_order - b.display_order);
            featured.push(...sorted.slice(0, IMAGES_PER_CATEGORY));
        });

        return featured;
    }, [data?.portfolioImages]);

    // Detect image orientation when active image changes
    useEffect(() => {
        if (featuredImages.length === 0 || !featuredImages[activeIndex]) return;

        const img = new Image();
        img.onload = () => {
            const isPortrait = img.height > img.width;
            setImageOrientation(isPortrait ? 'portrait' : 'landscape');
        };
        img.src = featuredImages[activeIndex].image_url;
    }, [activeIndex, featuredImages]);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (featuredImages.length === 0) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredImages.length, activeIndex]);

    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveIndex((prev) => (prev === 0 ? featuredImages.length - 1 : prev - 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveIndex((prev) => (prev === featuredImages.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleThumbnailClick = (index: number) => {
        if (isTransitioning || index === activeIndex) return;
        setIsTransitioning(true);
        setActiveIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    // Scroll carousel to keep active thumbnail visible
    useEffect(() => {
        if (carouselRef.current) {
            const thumbnailWidth = 88; // w-20 + gap
            const scrollPosition = activeIndex * thumbnailWidth - (carouselRef.current.offsetWidth / 2) + thumbnailWidth / 2;
            carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
    }, [activeIndex]);

    if (isLoading) {
        return <div className="h-[600px] bg-olive-900 animate-pulse" />;
    }

    if (featuredImages.length === 0) return null;

    const activeImage = featuredImages[activeIndex];

    return (
        <section id="gallery" className="bg-olive-900 py-20 lg:py-28 overflow-hidden">
            <div className="max-w-5xl mx-auto px-6">

                {/* Section Header */}
                <div className="text-center mb-10">
                    <p className="text-gold-400 tracking-[0.2em] uppercase text-sm font-medium mb-4">
                        Gallery
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-cream-100 tracking-wide mb-3">
                        Momen yang Kami Abadikan
                    </h2>
                    <p className="text-cream-300/60 text-sm">
                        Koleksi pilihan dari berbagai kategori layanan kami
                    </p>
                </div>

                {/* Main Image Container */}
                <div className="flex justify-center mb-6">
                    <div
                        className={`
                            relative overflow-hidden rounded-lg bg-olive-800 shadow-2xl
                            transition-all duration-500 ease-out
                            ${imageOrientation === 'portrait'
                                ? 'w-full max-w-sm aspect-[3/4]'
                                : 'w-full max-w-2xl aspect-[16/10]'}
                        `}
                    >
                        {/* Main Image */}
                        <img
                            src={activeImage?.image_url}
                            alt={activeImage?.service_name || 'Gallery'}
                            className={`
                                absolute inset-0 w-full h-full object-cover
                                transition-all duration-500 ease-out
                                ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
                            `}
                        />

                        {/* Subtle Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-olive-900/70 via-transparent to-transparent" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="inline-block px-3 py-1.5 bg-gold-400 text-olive-900 text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-lg">
                                {activeImage?.service_name || 'Gallery'}
                            </span>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-olive-900/60 hover:bg-gold-400/20 backdrop-blur-sm flex items-center justify-center text-cream-100 transition-all hover:scale-110 border border-cream-100/20"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-olive-900/60 hover:bg-gold-400/20 backdrop-blur-sm flex items-center justify-center text-cream-100 transition-all hover:scale-110 border border-cream-100/20"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-olive-900/70 backdrop-blur-sm rounded-full text-cream-300/80 text-xs tracking-wider">
                            <span className="text-gold-400 font-semibold">{activeIndex + 1}</span>
                            <span className="mx-1">/</span>
                            <span>{featuredImages.length}</span>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex justify-center">
                    <div
                        ref={carouselRef}
                        className="flex gap-2 overflow-x-auto px-4 py-2 max-w-full"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {featuredImages.map((img, index) => (
                            <button
                                key={img.id}
                                onClick={() => handleThumbnailClick(index)}
                                className={`
                                    flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden 
                                    transition-all duration-300 relative
                                    ${index === activeIndex
                                        ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-olive-900 scale-110'
                                        : 'opacity-40 hover:opacity-70 grayscale-[60%] hover:grayscale-0'}
                                `}
                            >
                                <img
                                    src={img.image_url}
                                    alt={img.service_name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Info */}
                <p className="text-center text-cream-300/50 text-xs mt-4 tracking-wide">
                    Menampilkan {featuredImages.length} foto pilihan dari {Object.keys(
                        (data?.portfolioImages || []).reduce((acc, img) => {
                            acc[img.service_name] = true;
                            return acc;
                        }, {} as Record<string, boolean>)
                    ).length} kategori
                </p>

            </div>
        </section>
    );
}
