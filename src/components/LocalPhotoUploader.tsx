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
            whileHover={{ scale: 1.01, translateY: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-[#d4af37] border border-white/10 hover:border-[#d4af37]/45 text-[11px] font-mono tracking-[0.2em] uppercase flex items-center space-x-2.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo album & tải ảnh thủ công</span>
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0b0b0d]/70 backdrop-blur-2xl rounded-2xl p-6 md:p-7 border border-white/10 max-w-xl mx-auto space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2.5">
              <Upload className="w-4 h-4 text-[#d4af37]" />
              <h3 className="font-sans text-[16px] text-white font-medium tracking-wide">Album Mới</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateAlbum} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">Tên Chuyến Đi</label>
                <input
                  required
                  type="text"
                  placeholder="Vd: Nha Trang, Sapa..."
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-white/[0.03] focus:bg-white/[0.06] border border-white/5 focus:border-[#d4af37]/40 text-white text-xs focus:outline-none transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">Năm Thực Hiện</label>
                <input
                  required
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-lg bg-white/[0.03] focus:bg-white/[0.06] border border-white/5 focus:border-[#d4af37]/40 text-white text-xs focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">Mô tả chuyến đi</label>
              <textarea
                placeholder="Ghi chú lại những ký niệm ngọt ngào..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white/[0.03] focus:bg-white/[0.06] border border-white/5 focus:border-[#d4af37]/40 text-white text-xs focus:outline-none transition-all h-16 resize-none font-sans"
              />
            </div>

            {/* Compact Drag & Drop Zone */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/40 block">Hình Ảnh Kỷ Niệm</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border border-dashed rounded-xl py-6 px-4 text-center transition-all cursor-pointer flex items-center justify-center space-x-4 ${
                  isDragging
                    ? 'border-[#d4af37] bg-[#d4af37]/5'
                    : 'border-white/10 bg-white/[0.01] hover:border-[#d4af37]/35 hover:bg-white/[0.02]'
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
                
                <div className="p-2.5 rounded-full bg-white/[0.03] border border-white/10 text-[#d4af37] flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>

                <div className="text-left space-y-0.5">
                  <span className="text-white text-[12px] font-sans font-medium block">
                    Kéo thả ảnh hoặc <span className="text-[#d4af37] underline">Chọn tập tin</span>
                  </span>
                  <span className="text-white/35 text-[9.5px] block font-light">
                    Hỗ trợ định dạng phổ biến. Tải bao nhiêu tùy ý.
                  </span>
                </div>
              </div>
            </div>

            {/* List of uploaded previews */}
            {photos.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block">
                  Sẽ thêm vào album ({photos.length} ảnh)
                </span>
                
                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto pr-1 no-scrollbar">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-white/5 group">
                      <img
                        src={photo.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photo.id);
                        }}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500/40 text-white transition-opacity cursor-pointer text-[10px] font-mono tracking-widest uppercase"
                      >
                        XÓA
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-3.5 border-t border-white/5 flex justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 text-xs font-mono tracking-wider uppercase cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!albumName.trim() || photos.length === 0}
                className="px-5 py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#ffe180] text-black font-semibold text-xs font-mono tracking-wider uppercase transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:scale-100 cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Hoàn tất</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
