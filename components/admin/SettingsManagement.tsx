'use client';

import { useEffect, useState } from 'react';
import { SystemSettings } from '@/lib/types/settings';
import { FILE_CONSTRAINTS, UPLOAD_FOLDERS } from '@/lib/constants';

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'Cerita Kita',
    site_logo: '/images/default-logo.png',
    business_phone: '+62 812 3456 7890',
    business_address: 'Jalan Raya No. 123, Jakarta'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof SystemSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type using constants
    if (!FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Use JPG, PNG, GIF, or WEBP' });
      return;
    }

    // Validate file size using constants
    if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
      setMessage({ type: 'error', text: `File too large. Maximum size is ${FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB` });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', UPLOAD_FOLDERS.LOGO);

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await res.json();
      handleInputChange('site_logo', url);
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Save failed');
      }

      const data = await res.json();
      setSettings(data.settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600 mt-1">Manage your website's branding and business information</p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <form onSubmit={handleSave}>
          {/* Site Name */}
          <div className="p-6 border-b">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => handleInputChange('site_name', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cerita Kita"
              required
            />
            <p className="text-xs text-gray-500 mt-1">This appears in the logo and throughout your site</p>
          </div>

          {/* Site Logo */}
          <div className="p-6 border-b">
            <label className="block text-sm font-bold text-gray-700 mb-2">
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
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <input
                  type="text"
                  value={settings.site_logo}
                  onChange={(e) => handleInputChange('site_logo', e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="/images/default-logo.png"
                />
              </div>
              <p className="text-xs text-gray-500">
                Upload an image or enter a URL. Supported formats: JPG, PNG, GIF, WEBP. Max 5MB.
              </p>
            </div>
          </div>

          {/* Business Phone */}
          <div className="p-6 border-b">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Business Phone
            </label>
            <input
              type="text"
              value={settings.business_phone}
              onChange={(e) => handleInputChange('business_phone', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+62 812 3456 7890"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Used for invoices and contact information</p>
          </div>

          {/* Business Address */}
          <div className="p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Business Address
            </label>
            <textarea
              value={settings.business_address}
              onChange={(e) => handleInputChange('business_address', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Jalan Raya No. 123, Jakarta"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Used for invoices and business documentation</p>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                saving 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Preview</h2>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {settings.site_logo && (
            <img 
              src={settings.site_logo} 
              alt="Logo preview" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/default-logo.png';
              }}
            />
          )}
          <div>
            <div className="font-bold text-lg">{settings.site_name}</div>
            <div className="text-sm text-gray-600">{settings.business_phone}</div>
            <div className="text-sm text-gray-500">{settings.business_address}</div>
          </div>
        </div>
      </div>
    </div>
  );
}