'use client';

import { Camera } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * Logo Component for CeritaKita Studio
 * Displays brand identity with camera icon and text
 */
export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSize = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-2 font-bold transition-all hover:opacity-80 ${sizeClasses[size]} ${className}`}
      aria-label="CeritaKita Studio - Beranda"
    >
      <div className="relative flex items-center justify-center">
        {/* Camera Icon with gradient background */}
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg p-1.5 shadow-lg">
          <Camera 
            size={iconSize[size]} 
            className="text-white" 
            strokeWidth={2.5}
            fill="currentColor"
          />
        </div>
        
        {/* Decorative pulse effect on hover */}
        <div className="absolute inset-0 bg-primary-600/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity animate-pulse" />
      </div>

      {showText && (
        <span className="flex flex-col leading-tight">
          <span className="text-gray-900">CeritaKita</span>
          <span className="text-primary-600 text-xs font-semibold tracking-wide">
            STUDIO
          </span>
        </span>
      )}
    </Link>
  );
}

/**
 * Compact Logo for mobile navigation
 */
export function MobileLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg p-1.5 shadow-md">
        <Camera size={18} className="text-white" strokeWidth={2.5} fill="currentColor" />
      </div>
      <span className="font-bold text-sm text-gray-900">CeritaKita</span>
    </div>
  );
}

/**
 * Full Logo with tagline for hero sections
 */
export function HeroLogo() {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-3">
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl p-3 shadow-xl">
          <Camera size={40} className="text-white" strokeWidth={2} fill="currentColor" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-3xl font-black text-gray-900 tracking-tight">CeritaKita</span>
          <span className="text-lg font-semibold text-primary-600 tracking-wide">STUDIO</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto">
        Abadikan momen terbaik Anda dengan profesional
      </p>
    </div>
  );
}