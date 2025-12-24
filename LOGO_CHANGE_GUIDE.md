# Logo Change Guide for CeritaKita Studio

This guide explains how to replace the default logo with your own custom logo.

## Current Logo System

The app uses a flexible logo system with three components:

1. **HeroLogo** - Used in the main header (camera icon + text)
2. **Logo** - Standard logo with optional text
3. **MobileLogo** - Compact version for mobile navigation

## Option 1: Quick Logo Replacement (Recommended)

### Step 1: Replace the Camera Icon
The current logo uses a camera icon from Lucide React. To use your own logo:

1. **Prepare your logo image** (PNG or SVG recommended)
2. **Place it in the `public/` folder** (e.g., `public/my-logo.png`)
3. **Update the Logo component** in `components/ui/Logo.tsx`

### Step 2: Modify the Logo Component

Replace the HeroLogo component in `components/ui/Logo.tsx`:

```tsx
export function HeroLogo() {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-3">
        {/* Replace this camera icon with your logo */}
        <div className="rounded-xl p-3 shadow-xl">
          <img 
            src="/my-logo.png" 
            alt="CeritaKita Studio Logo"
            width={40}
            height={40}
            className="object-contain"
          />
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
```

## Option 2: Use SVG Directly

If you have an SVG logo, you can use it directly:

```tsx
export function HeroLogo() {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-3">
        {/* Your SVG Logo */}
        <div className="w-10 h-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Your SVG paths here */}
          </svg>
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
```

## Option 3: Text-Only Logo

If you prefer a text-only logo:

```tsx
export function HeroLogo() {
  return (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
        CERITAKITA STUDIO
      </h1>
      <p className="text-primary-600 text-sm font-semibold tracking-wide mt-1">
        FOTO & VIDEO PROFESIONAL
      </p>
    </div>
  );
}
```

## Option 4: Custom Logo Component

Create a completely custom logo component:

1. **Create a new file** `components/MyCustomLogo.tsx`
2. **Add your custom logo JSX**
3. **Import and use in `app/page.tsx`**

Example:
```tsx
// components/MyCustomLogo.tsx
export function MyCustomLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
        <span className="text-white font-bold text-xl">CK</span>
      </div>
      <span className="text-xl font-bold text-gray-900">CeritaKita</span>
    </div>
  );
}

// app/page.tsx
import { MyCustomLogo } from '@/components/MyCustomLogo';

// Then use <MyCustomLogo /> instead of <HeroLogo />
```

## Updating the Favicon

To change the browser tab icon:

1. **Create your favicon** (32x32 PNG)
2. **Replace** `public/favicon-32x32.png`
3. **Replace** `public/favicon-16x16.png`
4. **Replace** `public/apple-touch-icon.png`

## Updating App Title

To change the app name in browser tabs and SEO:

1. **Open** `app/layout.tsx`
2. **Find** the `metadata` object
3. **Update** these fields:

```tsx
export const metadata: Metadata = {
  title: "Your Studio Name - Booking Sesi Foto",  // Change this
  description: "Deskripsi untuk studio Anda",      // Change this
  applicationName: "Your Studio Name",            // Change this
  // ... rest of metadata
};
```

## Color Customization

To match your brand colors:

1. **Open** `tailwind.config.ts`
2. **Update** the color palette:

```tsx
theme: {
  extend: {
    colors: {
      primary: {
        600: "#FF6B35",  // Your brand color
      },
      // ... other colors
    },
  },
},
```

## Quick Test

After making changes:

1. **Save all files**
2. **Restart the dev server** (if needed)
3. **Clear browser cache**
4. **Refresh the page**

## Files to Modify Summary

- **Logo**: `components/ui/Logo.tsx`
- **Title**: `app/layout.tsx` (metadata)
- **Favicons**: `public/favicon-*.png`
- **Colors**: `tailwind.config.ts`

## Need Help?

If you need assistance with:
- **SVG conversion**: Use online tools like SVGOMG
- **Logo design**: Consider hiring a designer
- **Color matching**: Use tools like Coolors.co
- **Technical issues**: Check the console for errors

The current logo system is designed to be easily customizable while maintaining professional appearance and accessibility standards.