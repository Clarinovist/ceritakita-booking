'use client';

import { useState } from 'react';
import { SystemSettings } from '@/lib/types/settings';
import { testTemplate } from '@/lib/whatsapp-template';

interface TemplatesTabProps {
  settings: SystemSettings;
  onChange: (key: keyof SystemSettings, value: string) => void;
}

export default function TemplatesTab({ settings, onChange }: TemplatesTabProps) {
  const [testResult, setTestResult] = useState<{
    renderedMessage: string;
    whatsappLink: string;
    errors: string[];
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const availableVariables = [
    { key: 'customer_name', description: 'Customer full name' },
    { key: 'service', description: 'Service name booked' },
    { key: 'date', description: 'Session date' },
    { key: 'time', description: 'Session time' },
    { key: 'total_price', description: 'Total booking price' },
    { key: 'booking_id', description: 'Unique booking ID' }
  ];

  const handleTestTemplate = () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = testTemplate(settings.whatsapp_message_template, settings.whatsapp_admin_number);
      setTestResult(result);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        renderedMessage: '',
        whatsappLink: '',
        errors: [error instanceof Error ? error.message : 'Test failed']
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const characterCount = settings.whatsapp_message_template.length;
  const isTooLong = characterCount > 1024;

  return (
    <div className="space-y-6">
      {/* Template Editor */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">WhatsApp Message Template</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Message
          </label>
          <textarea
            value={settings.whatsapp_message_template}
            onChange={(e) => onChange('whatsapp_message_template', e.target.value)}
            rows={8}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm ${
              isTooLong ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder="Halo {{customer_name}}!\n\nBooking Anda untuk {{service}} pada {{date}} pukul {{time}} telah dikonfirmasi.\n\nTotal: Rp {{total_price}}\nID Booking: {{booking_id}}\n\nTerima kasih telah memilih Cerita Kita!"
          />
          
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${isTooLong ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              {characterCount}/1024 characters
              {isTooLong && ' - Too long for WhatsApp!'}
            </p>
            <p className="text-xs text-gray-400">Supports newlines (\n)</p>
          </div>
        </div>

        {/* Available Variables */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Available Variables:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableVariables.map(variable => (
              <div key={variable.key} className="flex items-center gap-2 text-xs bg-gray-50 rounded p-2">
                <code className="text-blue-600 font-mono">{'{{' + variable.key + '}}'}</code>
                <span className="text-gray-600">{variable.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Functionality */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Test Template</h3>
        
        <div className="space-y-4">
          {/* Test Button */}
          <div>
            <button
              type="button"
              onClick={handleTestTemplate}
              disabled={testing || isTooLong}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                testing || isTooLong
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {testing ? 'Testing...' : 'Test Template'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Test your template with sample booking data to see how it will look
            </p>
            {isTooLong && (
              <p className="text-xs text-red-600 mt-1">Cannot test - template exceeds 1024 characters</p>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="space-y-4">
              {/* Errors */}
              {testResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-bold text-red-800 mb-2">Validation Errors:</h3>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {testResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rendered Message */}
              {testResult.renderedMessage && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">Rendered Message:</h3>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(testResult.renderedMessage)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        copied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">
                    {testResult.renderedMessage}
                  </pre>
                </div>
              )}

              {/* WhatsApp Link */}
              {testResult.whatsappLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-blue-800">WhatsApp Link:</h3>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(testResult.whatsappLink)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        copied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <a
                    href={testResult.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 break-all block font-mono"
                  >
                    {testResult.whatsappLink}
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to test in WhatsApp (opens in new tab)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Template Guidelines */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Template Guidelines</h3>
        
        <div className="space-y-3 text-sm">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="font-semibold text-blue-900 mb-1">✅ Best Practices</h4>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>Keep it concise and professional</li>
              <li>Include all essential booking details</li>
              <li>Use proper line breaks for readability</li>
              <li>Include a friendly greeting and closing</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h4 className="font-semibold text-yellow-900 mb-1">⚠️ Limitations</h4>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside">
              <li>Maximum 1024 characters (WhatsApp limit)</li>
              <li>Variables must use exact syntax: {'{{variable_name}}'}</li>
              <li>Test before saving to ensure all variables work</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-3">
            <h4 className="font-semibold text-green-900 mb-1">💡 Example</h4>
            <pre className="text-xs text-green-800 font-mono mt-1 whitespace-pre-wrap">
              {'Halo {{customer_name}}! Booking {{service}} pada {{date}} pukul {{time}} telah dikonfirmasi. Total: Rp {{total_price}}. ID: {{booking_id}}'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}