'use client';

import React, { useState, useEffect } from 'react';
import { Save, Upload, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function PaymentSettingsManagement() {
  const [settings, setSettings] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    qris_image_url: null as string | null
  });
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreview, setQrisPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.qris_image_url) {
          setQrisPreview(data.qris_image_url);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrisFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setQrisPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('bank_name', settings.bank_name);
    formData.append('account_name', settings.account_name);
    formData.append('account_number', settings.account_number);
    
    if (qrisFile) {
      formData.append('qris_file', qrisFile);
    }

    try {
      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Payment settings saved successfully!');
        // Refresh to get updated settings
        fetchSettings();
        setQrisFile(null);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading payment settings...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
          <CreditCard size={20} /> Payment Settings
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              required
              type="text"
              name="bank_name"
              value={settings.bank_name}
              onChange={handleChange}
              placeholder="e.g. BCA, Mandiri, BNI"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              required
              type="text"
              name="account_number"
              value={settings.account_number}
              onChange={handleChange}
              placeholder="e.g. 1234567890"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Account Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              required
              type="text"
              name="account_name"
              value={settings.account_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* QRIS Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            QRIS Image
          </label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="qris-upload"
              />
              <label
                htmlFor="qris-upload"
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors font-semibold w-fit"
              >
                <Upload size={18} />
                {qrisPreview ? 'Change QRIS Image' : 'Upload QRIS Image'}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image, PNG format
              </p>
            </div>

            {/* Preview */}
            {qrisPreview && (
              <div className="w-24 h-24 relative border rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={qrisPreview}
                  alt="QRIS Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}