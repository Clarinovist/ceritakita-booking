'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  basePrice: number;
  discountValue: number;
  isActive: boolean;
  badgeText?: string;
}

interface PortfolioManagementProps {
  services: Service[];
}

export default function PortfolioManagement({ services }: PortfolioManagementProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedService) {
      fetchPortfolioImages();
    } else {
      setImages([]);
    }
  }, [selectedService]);

  const fetchPortfolioImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio?serviceId=${selectedService}`);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio images', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedService) return;

    setUploading(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('serviceId', selectedService);

      try {
        const res = await fetch('/api/portfolio', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const newImage = await res.json();
          setImages(prev => [...prev, newImage]);
        }
      } catch (error) {
        console.error('Upload failed', error);
      }
    }

    setUploading(false);
    // Reset input
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const res = await fetch('/api/portfolio', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
      }
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
          <ImageIcon size={20} /> Portfolio Management
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Service
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Select a service --</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <>
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="portfolio-upload"
                disabled={uploading}
              />
              <label
                htmlFor="portfolio-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                </span>
                <span className="text-xs text-gray-400">
                  Multiple files supported
                </span>
              </label>
            </div>

            {/* Images Grid */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No portfolio images yet. Upload some to get started!
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group aspect-square overflow-hidden rounded-lg border">
                    <Image
                      src={image.image_url}
                      alt={`Portfolio ${image.id}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}