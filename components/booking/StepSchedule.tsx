'use client';

import { useMultiStepForm } from './MultiStepForm';
import { ValidationMessage, FieldValidationWrapper } from '@/components/ui/ValidationMessage';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { fieldValidators } from '@/lib/validation/schemas';
import { useState, useEffect } from 'react';

export function StepSchedule() {
  const { formData, updateFormData, errors, setFieldError, clearFieldError } = useMultiStepForm();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Real-time validation
  useEffect(() => {
    if (touched.date && formData.date) {
      const error = fieldValidators.date(formData.date);
      if (error) {
        setFieldError('date', error);
      } else {
        clearFieldError('date');
      }
    }
  }, [formData.date, touched.date]);

  useEffect(() => {
    if (touched.time && formData.time) {
      const error = fieldValidators.time(formData.time);
      if (error) {
        setFieldError('time', error);
      } else {
        clearFieldError('time');
      }
    }
  }, [formData.time, touched.time]);

  useEffect(() => {
    if (touched.location_link && formData.location_link) {
      const error = fieldValidators.location_link(formData.location_link);
      if (error) {
        setFieldError('location_link', error);
      } else {
        clearFieldError('location_link');
      }
    }
  }, [formData.location_link, touched.location_link]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ date: e.target.value });
    if (!touched.date) setTouched(prev => ({ ...prev, date: true }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ time: e.target.value });
    if (!touched.time) setTouched(prev => ({ ...prev, time: true }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ location_link: e.target.value });
    if (!touched.location_link) setTouched(prev => ({ ...prev, location_link: true }));
  };

  const dateError = errors[3]?.find(e => e.field === 'date');
  const timeError = errors[3]?.find(e => e.field === 'time');
  const locationError = errors[3]?.find(e => e.field === 'location_link');

  const isOutdoorService = formData.serviceName.toLowerCase().includes('outdoor');

  // Generate time slots (30-minute intervals)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
        <Calendar className="text-primary-600" size={24} />
        <h2>Jadwal & Lokasi</h2>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <FieldValidationWrapper
          error={dateError?.message || null}
          label="Tanggal"
        >
          <input
            required
            type="date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            onBlur={() => setTouched(prev => ({ ...prev, date: true }))}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 transition-all touch-target"
            aria-describedby={dateError ? 'date-error' : undefined}
            aria-invalid={!!dateError}
          />
        </FieldValidationWrapper>

        {/* Time */}
        <FieldValidationWrapper
          error={timeError?.message || null}
          label="Jam (interval 30 menit)"
        >
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
            <select
              required
              name="time"
              value={formData.time}
              onChange={handleTimeChange}
              onBlur={() => setTouched(prev => ({ ...prev, time: true }))}
              className="w-full pl-10 pr-3 p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer touch-target"
              aria-describedby={timeError ? 'time-error' : undefined}
              aria-invalid={!!timeError}
            >
              <option value="">Pilih waktu</option>
              {timeSlots.map(timeValue => (
                <option key={timeValue} value={timeValue}>
                  {timeValue}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">Contoh: 09:00, 09:30, 10:00</p>
        </FieldValidationWrapper>
      </div>

      {/* Location (for outdoor services) */}
      {isOutdoorService && (
        <FieldValidationWrapper
          error={locationError?.message || null}
          label="Lokasi Photoshoot"
        >
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
            <input
              required
              type="url"
              name="location_link"
              value={formData.location_link}
              onChange={handleLocationChange}
              onBlur={() => setTouched(prev => ({ ...prev, location_link: true }))}
              placeholder="Masukkan link Google Maps lokasi"
              className="w-full pl-10 pr-3 p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 touch-target"
              aria-describedby={locationError ? 'location-error' : undefined}
              aria-invalid={!!locationError}
            />
          </div>
        </FieldValidationWrapper>
      )}

      {/* Validation Summary */}
      {(dateError || timeError || locationError) && (
        <div className="space-y-2">
          {dateError && <ValidationMessage message={dateError.message} type="error" />}
          {timeError && <ValidationMessage message={timeError.message} type="error" />}
          {locationError && <ValidationMessage message={locationError.message} type="error" />}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <strong>Petunjuk:</strong> 
        {isOutdoorService 
          ? 'Untuk layanan outdoor, lokasi wajib diisi dengan link Google Maps yang valid.'
          : 'Pilih tanggal dan jam yang sesuai untuk sesi foto Anda.'}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            updateFormData({ date: tomorrow.toISOString().split('T')[0] || '' });
            setTouched(prev => ({ ...prev, date: true }));
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors touch-target"
        >
          Besok
        </button>
        
        <button
          type="button"
          onClick={() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            updateFormData({ date: nextWeek.toISOString().split('T')[0] || '' });
            setTouched(prev => ({ ...prev, date: true }));
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors touch-target"
        >
          1 Minggu Lagi
        </button>

        <button
          type="button"
          onClick={() => {
            updateFormData({ time: '09:00' });
            setTouched(prev => ({ ...prev, time: true }));
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors touch-target"
        >
          Pagi (09:00)
        </button>

        <button
          type="button"
          onClick={() => {
            updateFormData({ time: '14:00' });
            setTouched(prev => ({ ...prev, time: true }));
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors touch-target"
        >
          Siang (14:00)
        </button>
      </div>
    </div>
  );
}