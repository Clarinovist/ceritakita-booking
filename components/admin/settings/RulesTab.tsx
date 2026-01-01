'use client';

import { SystemSettings } from '@/lib/types/settings';
import { Calendar, AlertCircle } from 'lucide-react';

interface RulesTabProps {
  settings: SystemSettings;
  onNumberChange: (key: keyof SystemSettings, value: number) => void;
}

export default function RulesTab({ settings, onNumberChange }: RulesTabProps) {
  const handleMinNoticeChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onNumberChange('min_booking_notice', numValue);
    }
  };

  const handleMaxAheadChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onNumberChange('max_booking_ahead', numValue);
    }
  };

  const validateRules = (): { isValid: boolean; error?: string } => {
    if (settings.min_booking_notice < 0) {
      return { isValid: false, error: 'Minimum notice cannot be negative' };
    }
    if (settings.max_booking_ahead < 0) {
      return { isValid: false, error: 'Maximum advance booking cannot be negative' };
    }
    if (settings.max_booking_ahead < settings.min_booking_notice) {
      return { isValid: false, error: 'Maximum advance booking must be greater than minimum notice' };
    }
    if (settings.max_booking_ahead > 365) {
      return { isValid: false, error: 'Maximum advance booking should not exceed 365 days' };
    }
    return { isValid: true };
  };

  const validation = validateRules();

  // Calculate date ranges for preview
  const getPreviewDates = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + settings.min_booking_notice);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + settings.max_booking_ahead);

    return {
      today: today.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      minDate: minDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      maxDate: maxDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    };
  };

  const preview = getPreviewDates();

  return (
    <div className="space-y-6">
      {/* Booking Rules */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Time Constraints</h3>
        
        {!validation.isValid && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
            <div className="text-sm text-red-700">{validation.error}</div>
          </div>
        )}

        <div className="space-y-4">
          {/* Minimum Booking Notice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Booking Notice (Days)
            </label>
            <input
              type="number"
              min="0"
              value={settings.min_booking_notice}
              onChange={(e) => handleMinNoticeChange(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.min_booking_notice < 0 ? 'border-red-300 bg-red-50' : ''
              }`}
              placeholder="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Prevents same-day bookings. Customers must book at least this many days in advance.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Example: 1 = no same-day bookings, 2 = bookings must be made 2 days ahead
            </p>
          </div>

          {/* Maximum Booking Ahead */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Booking Ahead (Days)
            </label>
            <input
              type="number"
              min="0"
              value={settings.max_booking_ahead}
              onChange={(e) => handleMaxAheadChange(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                settings.max_booking_ahead < 0 || settings.max_booking_ahead < settings.min_booking_notice 
                  ? 'border-red-300 bg-red-50' 
                  : ''
              }`}
              placeholder="90"
            />
            <p className="text-xs text-gray-500 mt-1">
              Limits how far into the future customers can book sessions.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Example: 90 = bookings allowed up to 3 months ahead
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Preview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Window Preview</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-700">Today:</span>
            <span className="text-gray-900">{preview.today}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-green-600" />
            <span className="font-semibold text-gray-700">Earliest Available:</span>
            <span className="text-green-700 font-medium">{preview.minDate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-700">Latest Available:</span>
            <span className="text-blue-700 font-medium">{preview.maxDate}</span>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <strong>Available Window:</strong> {settings.min_booking_notice} to {settings.max_booking_ahead} days from today
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Dates before {preview.minDate} and after {preview.maxDate} will be disabled in the calendar
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Scenarios */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Test Scenarios</h3>
        
        <div className="space-y-3">
          <div className="text-sm bg-blue-50 border border-blue-200 rounded p-3">
            <div className="font-semibold text-blue-900 mb-1">Same-Day Booking Test</div>
            <div className="text-blue-800">
              {settings.min_booking_notice === 0 
                ? '✅ ALLOWED - Customers can book for today' 
                : '❌ BLOCKED - Customers must wait ' + settings.min_booking_notice + ' days'}
            </div>
          </div>

          <div className="text-sm bg-purple-50 border border-purple-200 rounded p-3">
            <div className="font-semibold text-purple-900 mb-1">Far Future Test</div>
            <div className="text-purple-800">
              {settings.max_booking_ahead >= 30 
                ? `✅ ALLOWED - Customers can book ${settings.max_booking_ahead} days ahead` 
                : `⚠️ RESTRICTED - Only ${settings.max_booking_ahead} days allowed`}
            </div>
          </div>

          <div className="text-sm bg-green-50 border border-green-200 rounded p-3">
            <div className="font-semibold text-green-900 mb-1">Business Flexibility</div>
            <div className="text-green-800">
              {settings.min_booking_notice <= 1 && settings.max_booking_ahead >= 60
                ? '✅ GOOD - Balanced flexibility for customers and business'
                : '⚠️ CONSIDER - May be too restrictive or too flexible'}
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Best Practices</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Set minimum notice to 1-2 days to prevent last-minute bookings</li>
          <li>Set maximum advance to 60-90 days for better schedule management</li>
          <li>Consider your preparation time and photographer availability</li>
          <li>Balance customer convenience with business planning needs</li>
        </ul>
      </div>
    </div>
  );
}