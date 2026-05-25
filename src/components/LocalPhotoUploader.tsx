/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Plus, Image as ImageIcon, Check, Calendar, MapPin, X, Info } from 'lucide-react';
import { Album, Photo } from '../types';

interface LocalPhotoUploaderProps {
  onAddAlbum: (newAlbum: Album) => void;
}

export default function LocalPhotoUploader({ onAddAlbum }: LocalPhotoUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Url = event.target.result as string;
          const newPhoto: Photo = {
            id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: base64Url,
            title: file.name.split('.')[0] || 'Family Photo',
            location: 'Local Upload',
            year: year,
            description: 'Uploaded directly via browser sandbox.'
          };
          setPhotos((prev) => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim() || photos.length === 0) return;

    const newAlbum: Album = {
      id: `usr-album-${Date.now()}`,
      name: albumName,
      year: Number(year),
      coverUrl: photos[0].url,
      photosCount: photos.length,
      description: description || 'Album du lịch gia đình tải lên trực tiếp thiết bị.',
      // Ensure local coordinates or details are synced inside the photo list
      photos: photos.map(p => ({ ...p, location: albumName, year: Number(year) }))
    };

    onAddAlbum(newAlbum);
    
    // Reset form
    setAlbumName('');
    setYear(new Date().getFullYear());
    setDescription('');
    setPhotos([]);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-[#d4af37] border border-[#d4af37]/30 hover:border-[#d4af37] text-xs font-mono tracking-widest uppercase flex items-center space-x-2.5 transition-all cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Chuyến Đi & Tải Ảnh Thủ Công</span>
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 max-w-2xl mx-auto space-y-6"
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center space-x-2">
              <Upload className="w-4.5 h-4.5 text-[#d4af37]" />
              <h3 className="font-display text-xl text-white font-medium">Tải Ảnh Gia Đình Lên</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleCreateAlbum} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Tên Chuyến Đi (Địa điểm)</label>
                <input
                  required
                  type="text"
                  placeholder="Vd: Nha Trang, Sapa..."
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Năm Thực Hiện</label>
                <input
                  required
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Mô tả chuyến đi</label>
              <textarea
                placeholder="Những kỷ niệm đáng nhớ ghi lại trong suốt chuyến hành trình..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all h-20 resize-none"
              />
            </div>

            {/* Drag & Drop uploader framework */}
            <div className="space-y-2">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Hình Ảnh Kỷ Niệm</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-[#d4af37] bg-[#d4af37]/5'
                    : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="p-3.5 rounded-full bg-white/[0.03] border border-white/15 text-[#d4af37]">
                  <ImageIcon className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-white text-xs font-medium block">
                    Kéo thả ảnh hoặc <span className="text-[#d4af37] underline">Chọn từ máy</span>
                  </span>
                  <span className="text-white/45 text-[10px] block font-mono">
                    Hỗ trợ PNG, JPG, WebP. Tải lên bao nhiêu tùy thích.
                  </span>
                </div>
              </div>
            </div>

            {/* List of uploaded previews */}
            {photos.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block">
                  ĐÃ TẢI LÊN ({photos.length} ẢNH)
                </span>
                
                <div className="grid grid-cols-4 gap-3 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img
                        src={photo.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500/40 text-white transition-opacity cursor-pointer text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-white/5 text-white/70 text-xs font-mono tracking-widest uppercase cursor-pointer"
              >
                HỦY
              </button>
              <button
                type="submit"
                disabled={!albumName.trim() || photos.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs font-mono tracking-widest uppercase transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Hoàn Tất & Xem Album</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
