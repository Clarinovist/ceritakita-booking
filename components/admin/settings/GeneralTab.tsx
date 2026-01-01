'use client';

import { useState, useEffect } from 'react';
import { SystemSettings } from '@/lib/types/settings';
import { FILE_CONSTRAINTS, UPLOAD_FOLDERS } from '@/lib/constants';

interface GeneralTabProps {
  settings: SystemSettings;
  onChange: (key: keyof SystemSettings, value: string) => void;
  onLogoUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function GeneralTab({ settings, onChange, onLogoUpload, uploading }: GeneralTabProps) {
  const [seoPreview, setSeoPreview] = useState({
    title: '',
    description: '',
    url: ''
  });

  useEffect(() => {
    // Generate SEO preview
    setSeoPreview({
      title: settings.meta_title || settings.site_name || 'Cerita Kita',
      description: settings.meta_description || 'Professional photography services in Jakarta',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://ceritakita.studio'
    });
  }, [settings.meta_title, settings.meta_description, settings.site_name]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Use JPG, PNG, GIF, or WEBP');
      return;
    }

    // Validate file size
    if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
      alert(`File too large. Maximum size is ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`);
      return;
    }

    await onLogoUpload(file);
  };

  return (
    <div className="space-y-6">
      {/* Site Branding */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Site Branding</h3>
        
        <div className="space-y-4">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => onChange('site_name', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cerita Kita"
              required
            />
            <p className="text-xs text-gray-500 mt-1">This appears in the logo and throughout your site</p>
          </div>

          {/* Site Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logo
            </label>
            <div className="space-y-3">
              {settings.site_logo && (
                <div className="flex items-center gap-4">
                  <img 
                    src={settings.site_logo} 
                    alt="Current logo" 
                    className="h-16 w-auto object-contain border rounded-lg p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-logo.png';
                    }}
                  />
                  <span className="text-sm text-gray-600 break-all">{settings.site_logo}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                  {uploading ? 'Uploading...' : 'Upload New Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <input
                  type="text"
                  value={settings.site_logo}
                  onChange={(e) => onChange('site_logo', e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="/images/default-logo.png"
                />
              </div>
              <p className="text-xs text-gray-500">
                Upload an image or enter a URL. Supported formats: JPG, PNG, GIF, WEBP. Max 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Hero Section</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Title (H1)
          </label>
          <input
            type="text"
            value={settings.hero_title}
            onChange={(e) => onChange('hero_title', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Capture Your Special Moments"
          />
          <p className="text-xs text-gray-500 mt-1">Main title displayed on the booking page</p>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">SEO Settings</h3>
        
        <div className="space-y-4">
          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={settings.meta_title}
              onChange={(e) => onChange('meta_title', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cerita Kita - Professional Photography Services"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings.meta_title.length}/60 characters - Recommended for search engines
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={settings.meta_description}
              onChange={(e) => onChange('meta_description', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Professional photography services in Jakarta. Book your special moments with Cerita Kita."
              maxLength={160}
            />
            <p className={`text-xs mt-1 ${settings.meta_description.length > 160 ? 'text-red-600' : 'text-gray-500'}`}>
              {settings.meta_description.length}/160 characters - Used for WhatsApp link preview
            </p>
          </div>
        </div>

        {/* SEO Preview */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Preview</h4>
          <div className="space-y-2">
            <div className="text-blue-600 font-semibold text-sm">{seoPreview.title}</div>
            <div className="text-gray-600 text-xs">{seoPreview.url}</div>
            <div className="text-gray-500 text-xs">{seoPreview.description}</div>
          </div>
          <p className="text-xs text-gray-400 mt-2">This is how it appears in search results and WhatsApp</p>
        </div>
      </div>
    </div>
  );
}