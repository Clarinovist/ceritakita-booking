'use client';
import { useHomepageData } from '@/hooks/useHomepageData';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function HeroSection() {
    const [scrollY, setScrollY] = useState(0);
    const { data, isLoading } = useHomepageData();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isLoading) {
        return <div className="h-screen bg-olive-900 animate-pulse" />;
    }

    const hero = data?.hero || {};

    return (
        <section className="relative h-screen overflow-hidden">
            {/* Background Image with Parallax */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('${hero.background_image || '/images/hero_photography.png'}')`,
                    transform: `translateY(${scrollY * 0.3}px)`,
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-olive-900/50 via-olive-900/40 to-olive-900/80" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-cream-100 tracking-wide mb-6 animate-slide-up">
                    {hero.tagline || 'Abadikan Setiap Momen Berharga'}
                </h1>
                <p className="font-serif text-lg md:text-xl text-cream-200 max-w-3xl leading-relaxed mb-10 animate-fade-in">
                    {hero.subtagline || 'Dari wisuda hingga pernikahan, dari ulang tahun hingga potret keluarga—kami hadir untuk mengubah momen spesial Anda menjadi kenangan abadi.'}
                </p>

                {/* CTA Button */}
                <Link
                    href="/booking"
                    className="inline-block bg-gold-500 hover:bg-gold-600 text-olive-900 font-medium px-8 py-4 tracking-[0.15em] uppercase text-sm transition-all duration-300 hover:scale-105 animate-fade-in"
                >
                    {hero.cta_text || 'Booking Sekarang'}
                </Link>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce-subtle">
                    <div className="w-6 h-10 border-2 border-cream-300/50 rounded-full flex justify-center pt-2">
                        <div className="w-1 h-3 bg-cream-300/70 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}
