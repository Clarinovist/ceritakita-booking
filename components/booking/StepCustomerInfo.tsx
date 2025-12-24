'use client';

import { useMultiStepForm } from './MultiStepForm';
import { ValidationMessage, FieldValidationWrapper } from '@/components/ui/ValidationMessage';
import { User, MessageSquare } from 'lucide-react';
import { fieldValidators } from '@/lib/validation/schemas';
import { useState, useEffect } from 'react';

export function StepCustomerInfo() {
  const { formData, updateFormData, errors, setFieldError, clearFieldError } = useMultiStepForm();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validation
  useEffect(() => {
    if (touched.name && formData.name) {
      const error = fieldValidators.name(formData.name);
      if (error) {
        setFieldError('name', error);
      } else {
        clearFieldError('name');
      }
    }
  }, [formData.name, touched.name]);

  useEffect(() => {
    if (touched.whatsapp && formData.whatsapp) {
      const error = fieldValidators.whatsapp(formData.whatsapp);
      if (error) {
        setFieldError('whatsapp', error);
      } else {
        clearFieldError('whatsapp');
      }
    }
  }, [formData.whatsapp, touched.whatsapp]);

  useEffect(() => {
    if (touched.notes && formData.notes) {
      const error = fieldValidators.notes(formData.notes);
      if (error) {
        setFieldError('notes', error);
      } else {
        clearFieldError('notes');
      }
    }
  }, [formData.notes, touched.notes]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ name: e.target.value });
    if (!touched.name) setTouched(prev => ({ ...prev, name: true }));
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format input: allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    updateFormData({ whatsapp: value });
    if (!touched.whatsapp) setTouched(prev => ({ ...prev, whatsapp: true }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ notes: e.target.value });
    if (!touched.notes) setTouched(prev => ({ ...prev, notes: true }));
  };

  const nameError = errors[4]?.find(e => e.field === 'name');
  const whatsappError = errors[4]?.find(e => e.field === 'whatsapp');
  const notesError = errors[4]?.find(e => e.field === 'notes');

  // Format WhatsApp number for display
  const formatWhatsAppDisplay = (value: string) => {
    if (!value) return '';
    // Add spaces for readability
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
        <User className="text-primary-600" size={24} />
        <h2>Informasi Kontak</h2>
      </div>

      {/* Name */}
      <FieldValidationWrapper
        error={nameError?.message || null}
        label="Nama Lengkap"
      >
        <input
          required
          type="text"
          name="name"
          value={formData.name}
          onChange={handleNameChange}
          onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
          placeholder="Masukkan nama lengkap Anda"
          className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all touch-target"
          aria-describedby={nameError ? 'name-error' : undefined}
          aria-invalid={!!nameError}
          autoComplete="name"
        />
      </FieldValidationWrapper>

      {/* WhatsApp */}
      <FieldValidationWrapper
        error={whatsappError?.message || null}
        label="Nomor WhatsApp"
      >
        <input
          required
          type="tel"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleWhatsappChange}
          onBlur={() => setTouched(prev => ({ ...prev, whatsapp: true }))}
          placeholder="Contoh: 081234567890"
          className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 touch-target font-mono"
          aria-describedby={whatsappError ? 'whatsapp-error' : undefined}
          aria-invalid={!!whatsappError}
          autoComplete="tel"
          inputMode="tel"
        />
        {formData.whatsapp && (
          <p className="text-xs text-gray-500 mt-1">
            Format: {formatWhatsAppDisplay(formData.whatsapp)}
          </p>
        )}
      </FieldValidationWrapper>

      {/* Notes */}
      <FieldValidationWrapper
        error={notesError?.message || null}
        label="Catatan Tambahan (Opsional)"
      >
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleNotesChange}
          onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
          placeholder="Tambahkan catatan atau permintaan khusus..."
          rows={4}
          className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none touch-target"
          aria-describedby={notesError ? 'notes-error' : undefined}
          aria-invalid={!!notesError}
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">Opsional, maksimal 500 karakter</p>
          {formData.notes && (
            <span className="text-xs text-gray-500 font-mono">
              {formData.notes.length}/500
            </span>
          )}
        </div>
      </FieldValidationWrapper>

      {/* Validation Summary */}
      {(nameError || whatsappError || notesError) && (
        <div className="space-y-2">
          {nameError && <ValidationMessage message={nameError.message} type="error" />}
          {whatsappError && <ValidationMessage message={whatsappError.message} type="error" />}
          {notesError && <ValidationMessage message={notesError.message} type="error" />}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <strong>Petunjuk:</strong> Nomor WhatsApp akan digunakan admin untuk menghubungi Anda.
        Pastikan nomor aktif dan dapat dihubungi.
      </div>

      {/* Privacy Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800">
        <strong>Privasi:</strong> Data Anda aman dan hanya digunakan untuk keperluan booking.
        Kami tidak membagikan informasi pihak ketiga.
      </div>
    </div>
  );
}