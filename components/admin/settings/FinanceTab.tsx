'use client';

import { SystemSettings } from '@/lib/types/settings';

interface FinanceTabProps {
  settings: SystemSettings;
  onChange: (key: keyof SystemSettings, value: string) => void;
  onToggle: (key: keyof SystemSettings, value: boolean) => void;
  onNumberChange: (key: keyof SystemSettings, value: number) => void;
}

export default function FinanceTab({ settings, onChange, onToggle, onNumberChange }: FinanceTabProps) {
  const validateBankNumber = (number: string): boolean => {
    return /^[0-9]+$/.test(number.replace(/\s/g, ''));
  };

  const handleDepositChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onNumberChange('deposit_amount', numValue);
    }
  };

  const handleTaxRateChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onNumberChange('tax_rate', numValue);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Account Details</h3>
        
        <div className="space-y-4">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.bank_name}
              onChange={(e) => onChange('bank_name', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="BCA"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Bank name for invoice display</p>
          </div>

          {/* Bank Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={settings.bank_number}
              onChange={(e) => onChange('bank_number', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.bank_number && !validateBankNumber(settings.bank_number) 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="1234567890"
              required
            />
            {settings.bank_number && !validateBankNumber(settings.bank_number) && (
              <p className="text-xs text-red-600 mt-1">Only numbers allowed</p>
            )}
          </div>

          {/* Bank Holder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              value={settings.bank_holder}
              onChange={(e) => onChange('bank_holder', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="CERITA KITA"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Rules */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Rules</h3>
        
        <div className="space-y-4">
          {/* Requires Deposit */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Requires Deposit</label>
              <p className="text-xs text-gray-500 mt-1">Require deposit before booking confirmation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requires_deposit}
                onChange={(e) => onToggle('requires_deposit', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Deposit Amount */}
          {settings.requires_deposit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.deposit_amount}
                onChange={(e) => handleDepositChange(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">Percentage of total booking price</p>
            </div>
          )}

          {/* Tax Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.tax_rate}
              onChange={(e) => handleTaxRateChange(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Tax percentage applied to total price</p>
          </div>
        </div>
      </div>

      {/* Invoice Notes */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Footer Notes</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Notes
          </label>
          <textarea
            value={settings.invoice_notes}
            onChange={(e) => onChange('invoice_notes', e.target.value)}
            rows={5}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Terima kasih telah memilih layanan kami. Pembayaran dapat dilakukan sebelum tanggal sesi. Hubungi kami jika ada pertanyaan."
          />
          <p className="text-xs text-gray-500 mt-1">These notes will appear at the bottom of every invoice</p>
        </div>
      </div>

      {/* Finance Preview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
          <div className="border-b pb-2">
            <div className="font-semibold text-gray-700">Bank Transfer To:</div>
            <div className="text-gray-900">{settings.bank_holder}</div>
            <div className="text-gray-600">{settings.bank_name} - {settings.bank_number}</div>
          </div>
          
          {settings.requires_deposit && (
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700">Deposit Required:</div>
              <div className="text-gray-900">{settings.deposit_amount}% of total</div>
            </div>
          )}

          {settings.tax_rate > 0 && (
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700">Tax Rate:</div>
              <div className="text-gray-900">{settings.tax_rate}%</div>
            </div>
          )}

          {settings.invoice_notes && (
            <div>
              <div className="font-semibold text-gray-700 mb-1">Notes:</div>
              <div className="text-gray-600 text-xs whitespace-pre-wrap">{settings.invoice_notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}