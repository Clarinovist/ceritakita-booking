'use client';

import { useEffect, useState } from 'react';
import { SystemSettings } from '@/lib/types/settings';
import { FILE_CONSTRAINTS, UPLOAD_FOLDERS } from '@/lib/constants';
import { testTemplate } from '@/lib/whatsapp-template';

// Import tab components
import GeneralTab from './settings/GeneralTab';
import ContactTab from './settings/ContactTab';
import FinanceTab from './settings/FinanceTab';
import RulesTab from './settings/RulesTab';
import TemplatesTab from './settings/TemplatesTab';

// Tab type definition
type TabType = 'general' | 'contact' | 'finance' | 'rules' | 'templates';

interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'general', label: 'General & SEO', icon: '🏠' },
  { id: 'contact', label: 'Contact & Socials', icon: '📞' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'rules', label: 'Booking Rules', icon: '📅' },
  { id: 'templates', label: 'Templates', icon: '💬' }
];

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings>({
    // General & SEO
    site_name: 'Cerita Kita',
    site_logo: '/images/default-logo.png',
    hero_title: 'Capture Your Special Moments',
    meta_title: 'Cerita Kita - Professional Photography Services',
    meta_description: 'Professional photography services in Jakarta. Book your special moments with Cerita Kita.',
    
    // Contact & Socials
    business_phone: '+62 812 3456 7890',
    business_address: 'Jalan Raya No. 123, Jakarta',
    whatsapp_admin_number: '+62 812 3456 7890',
    business_email: 'info@ceritakita.studio',
    instagram_url: '',
    tiktok_url: '',
    maps_link: '',
    
    // Finance
    bank_name: 'BCA',
    bank_number: '1234567890',
    bank_holder: 'CERITA KITA',
    invoice_notes: 'Terima kasih telah memilih layanan kami. Pembayaran dapat dilakukan sebelum tanggal sesi. Hubungi kami jika ada pertanyaan.',
    requires_deposit: false,
    deposit_amount: 50,
    tax_rate: 0,
    
    // Booking Rules
    min_booking_notice: 1,
    max_booking_ahead: 90,
    
    // Templates
    whatsapp_message_template: 'Halo {{customer_name}}!\n\nBooking Anda untuk {{service}} pada {{date}} pukul {{time}} telah dikonfirmasi.\n\nTotal: Rp {{total_price}}\nID Booking: {{booking_id}}\n\nTerima kasih telah memilih Cerita Kita!'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      
      // Merge with defaults to ensure all fields exist
      setSettings(prev => ({ ...prev, ...data }));
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

  const handleNumberChange = (key: keyof SystemSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: keyof SystemSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (file: File) => {
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

  const handleReset = () => {
    fetchSettings();
    setMessage({ type: 'success', text: 'Settings reset to last saved state' });
    setTimeout(() => setMessage(null), 2000);
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
        <p className="text-gray-600 mt-1">Manage your website configuration across all categories</p>
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

      {/* Tab Navigation */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="border-b">
          <nav className="flex overflow-x-auto" aria-label="Settings tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralTab
              settings={settings}
              onChange={handleInputChange}
              onLogoUpload={handleLogoUpload}
              uploading={uploading}
            />
          )}

          {activeTab === 'contact' && (
            <ContactTab
              settings={settings}
              onChange={handleInputChange}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              settings={settings}
              onChange={handleInputChange}
              onToggle={handleToggle}
              onNumberChange={handleNumberChange}
            />
          )}

          {activeTab === 'rules' && (
            <RulesTab
              settings={settings}
              onNumberChange={handleNumberChange}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab
              settings={settings}
              onChange={handleInputChange}
            />
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="bg-white border rounded-xl p-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            saving 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Global Preview */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Branding</h3>
            <div className="flex items-center gap-3">
              {settings.site_logo && (
                <img 
                  src={settings.site_logo} 
                  alt="Logo" 
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-logo.png';
                  }}
                />
              )}
              <div>
                <div className="font-bold">{settings.site_name}</div>
                <div className="text-xs text-gray-500">{settings.hero_title}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Contact</h3>
            <div className="text-sm space-y-1">
              <div>📞 {settings.business_phone}</div>
              <div>📧 {settings.business_email}</div>
              <div>📍 {settings.business_address}</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Finance</h3>
            <div className="text-sm space-y-1">
              <div>🏦 {settings.bank_name} - {settings.bank_number}</div>
              <div>👤 {settings.bank_holder}</div>
              {settings.requires_deposit && <div>💰 Deposit: {settings.deposit_amount}%</div>}
              {settings.tax_rate > 0 && <div>📊 Tax: {settings.tax_rate}%</div>}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Booking Rules</h3>
            <div className="text-sm space-y-1">
              <div>📅 Min Notice: {settings.min_booking_notice} day(s)</div>
              <div>📅 Max Ahead: {settings.max_booking_ahead} days</div>
              <div className="text-xs text-gray-500 mt-1">
                Window: {settings.min_booking_notice}-{settings.max_booking_ahead} days from today
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}