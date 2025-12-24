'use client';

import { MultiStepFormProvider, useMultiStepForm } from './MultiStepForm';
import { ProgressIndicator, MobileStepNavigation } from './ProgressIndicator';
import { StepServiceSelection } from './StepServiceSelection';
import { StepAddons } from './StepAddons';
import { StepSchedule } from './StepSchedule';
import { StepCustomerInfo } from './StepCustomerInfo';
import { StepPayment } from './StepPayment';
import { ValidationSummary } from '@/components/ui/ValidationMessage';
import { useEffect } from 'react';

// Step content component
function StepContent() {
  const { currentStep } = useMultiStepForm();

  switch (currentStep) {
    case 1:
      return <StepServiceSelection />;
    case 2:
      return <StepAddons />;
    case 3:
      return <StepSchedule />;
    case 4:
      return <StepCustomerInfo />;
    case 5:
      return <StepPayment />;
    default:
      return null;
  }
}

// Main form wrapper
function MultiStepBookingFormContent() {
  const { 
    currentStep, 
    totalSteps, 
    errors, 
    isSubmitting, 
    nextStep, 
    prevStep, 
    submitForm,
    validateCurrentStep,
    isMobile 
  } = useMultiStepForm();

  const stepLabels = [
    'Layanan',
    'Tambahan',
    'Jadwal',
    'Kontak',
    'Pembayaran'
  ];

  const handleNext = () => {
    if (currentStep === totalSteps) {
      submitForm();
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    prevStep();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === 'ArrowRight' && currentStep < totalSteps) {
        e.preventDefault();
        if (validateCurrentStep()) {
          nextStep();
        }
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, nextStep, prevStep, validateCurrentStep]);

  const currentErrors = errors[currentStep] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 mb-2">
          Booking Sesi Foto
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Proses 5 langkah mudah untuk booking sesi foto Anda bersama Cerita Kita
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <ProgressIndicator 
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
          isLoading={isSubmitting}
        />
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-slide-up">
            <StepContent />
          </div>

          {/* Validation Errors */}
          {currentErrors.length > 0 && (
            <div className="animate-fade-in">
              <ValidationSummary errors={currentErrors} />
            </div>
          )}
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mobile: Show summary only on payment step */}
          {(!isMobile || currentStep === 5) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border-2 border-blue-100 sticky top-4">
              <h3 className="font-black text-lg text-gray-800 mb-4">Ringkasan Sementara</h3>
              
              {/* Dynamic Summary */}
              <div className="space-y-3 text-sm">
                {/* Service */}
                {currentStep >= 1 && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Layanan:</span>
                    <span className="font-bold text-gray-800 text-right">
                      {formDataSummary.serviceName || '-'}
                    </span>
                  </div>
                )}

                {/* Add-ons */}
                {currentStep >= 2 && formDataSummary.addonsCount > 0 && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Tambahan:</span>
                    <span className="font-bold text-gray-800 text-right">
                      {formDataSummary.addonsCount} item
                    </span>
                  </div>
                )}

                {/* Schedule */}
                {currentStep >= 3 && (formDataSummary.date || formDataSummary.time) && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Jadwal:</span>
                    <span className="font-bold text-gray-800 text-right">
                      {formDataSummary.date} {formDataSummary.time}
                    </span>
                  </div>
                )}

                {/* Customer */}
                {currentStep >= 4 && formDataSummary.name && (
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-bold text-gray-800 text-right">
                      {formDataSummary.name}
                    </span>
                  </div>
                )}

                {/* Total */}
                {currentStep >= 1 && formDataSummary.totalPrice > 0 && (
                  <div className="border-t-2 border-blue-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900">Total:</span>
                      <span className="font-black text-primary-600 text-lg">
                        Rp {formDataSummary.totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Tips */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-gray-600">
                  <strong className="text-primary-700">Tips:</strong> {getStepTip(currentStep)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <MobileStepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        isNextDisabled={isSubmitting || currentErrors.length > 0}
      />

      {/* Keyboard Shortcuts Info */}
      <div className="hidden md:block mt-8 text-center text-xs text-gray-500">
        <p>
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">←</kbd> 
          <span className="mx-1">Kembali</span>
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">→</kbd> 
          <span className="mx-1">Lanjut</span>
          <span className="ml-4">Gunakan tombol panah keyboard untuk navigasi</span>
        </p>
      </div>
    </div>
  );
}

// Helper function to get step tips
function getStepTip(step: number): string {
  switch (step) {
    case 1:
      return 'Pilih layanan utama yang sesuai dengan kebutuhan Anda';
    case 2:
      return 'Tambahkan layanan tambahan jika diperlukan (opsional)';
    case 3:
      return 'Pilih tanggal dan jam yang nyaman untuk Anda';
    case 4:
      return 'Pastikan nomor WhatsApp aktif untuk konfirmasi';
    case 5:
      return 'Upload bukti transfer setelah melakukan DP';
    default:
      return 'Lengkapi semua langkah untuk booking yang sukses';
  }
}

// Helper component to access formData for summary
function FormDataSummary() {
  const { formData } = useMultiStepForm();
  return null; // This is just to trigger re-renders
}

// Global summary object
let formDataSummary = {
  serviceName: '',
  addonsCount: 0,
  date: '',
  time: '',
  name: '',
  totalPrice: 0,
};

// Wrapper component that manages the summary state
function SummaryUpdater() {
  const { formData, currentStep } = useMultiStepForm();

  useEffect(() => {
    formDataSummary = {
      serviceName: formData.serviceName,
      addonsCount: formData.addons.length,
      date: formData.date,
      time: formData.time,
      name: formData.name,
      totalPrice: formData.totalPrice,
    };
  }, [formData, currentStep]);

  return null;
}

// Main exported component
export default function MultiStepBookingForm() {
  return (
    <MultiStepFormProvider>
      <SummaryUpdater />
      <MultiStepBookingFormContent />
    </MultiStepFormProvider>
  );
}