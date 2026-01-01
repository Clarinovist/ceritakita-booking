'use client';

import { SystemSettings } from '@/lib/types/settings';

interface ContactTabProps {
  settings: SystemSettings;
  onChange: (key: keyof SystemSettings, value: string) => void;
}

export default function ContactTab({ settings, onChange }: ContactTabProps) {
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid (optional)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateWhatsApp = (phone: string): boolean => {
    // Indonesian format: +62 followed by digits
    return /^\+62[0-9]{9,15}$/.test(phone.replace(/\s/g, ''));
  };

  return (
    <div className="space-y-6">
      {/* Core Contact Info */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Core Contact Information</h3>
        
        <div className="space-y-4">
          {/* Business Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            <input
              type="text"
              value={settings.business_phone}
              onChange={(e) => onChange('business_phone', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+62 812 3456 7890"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Used for invoices and contact information</p>
          </div>

          {/* Business Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={settings.business_address}
              onChange={(e) => onChange('business_address', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Jalan Raya No. 123, Jakarta"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Used for invoices and business documentation</p>
          </div>

          {/* WhatsApp Admin Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Admin Number
            </label>
            <input
              type="text"
              value={settings.whatsapp_admin_number}
              onChange={(e) => onChange('whatsapp_admin_number', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.whatsapp_admin_number && !validateWhatsApp(settings.whatsapp_admin_number) 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="+62 812 3456 7890"
            />
            {settings.whatsapp_admin_number && !validateWhatsApp(settings.whatsapp_admin_number) && (
              <p className="text-xs text-red-600 mt-1">Use Indonesian format: +62 followed by 9-15 digits</p>
            )}
            <p className="text-xs text-gray-500 mt-1">WhatsApp number for booking notifications (Indonesian format)</p>
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>
            <input
              type="email"
              value={settings.business_email}
              onChange={(e) => onChange('business_email', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.business_email && !validateEmail(settings.business_email) 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="info@ceritakita.studio"
              required
            />
            {settings.business_email && !validateEmail(settings.business_email) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Used for invoices and customer contact</p>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media Links</h3>
        
        <div className="space-y-4">
          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              Instagram URL
              <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={settings.instagram_url || ''}
              onChange={(e) => onChange('instagram_url', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.instagram_url && !validateUrl(settings.instagram_url) 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="https://instagram.com/yourusername"
            />
            {settings.instagram_url && !validateUrl(settings.instagram_url) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              TikTok URL
              <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={settings.tiktok_url || ''}
              onChange={(e) => onChange('tiktok_url', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.tiktok_url && !validateUrl(settings.tiktok_url) 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="https://tiktok.com/@yourusername"
            />
            {settings.tiktok_url && !validateUrl(settings.tiktok_url) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
            )}
          </div>

          {/* Google Maps Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              Google Maps Link
              <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={settings.maps_link || ''}
              onChange={(e) => onChange('maps_link', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.maps_link && !validateUrl(settings.maps_link) 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="https://maps.google.com/..."
            />
            {settings.maps_link && !validateUrl(settings.maps_link) && (
              <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Link to your studio location on Google Maps</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Phone:</span>
            <span>{settings.business_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">WhatsApp:</span>
            <span>{settings.whatsapp_admin_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span>
            <span>{settings.business_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Address:</span>
            <span>{settings.business_address}</span>
          </div>
          {settings.instagram_url && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Instagram:</span>
              <span className="text-blue-600">{settings.instagram_url}</span>
            </div>
          )}
          {settings.tiktok_url && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">TikTok:</span>
              <span className="text-blue-600">{settings.tiktok_url}</span>
            </div>
          )}
          {settings.maps_link && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Maps:</span>
              <span className="text-blue-600">{settings.maps_link}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}