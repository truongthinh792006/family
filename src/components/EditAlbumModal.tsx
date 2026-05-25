/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit2, Calendar, MapPin, Eye, Check, AlertCircle, Trash2 } from 'lucide-react';
import { Album } from '../types';

interface EditAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album | undefined;
  onSave: (updatedAlbum: Album) => void;
  onDelete?: (albumId: string) => void;
}

export default function EditAlbumModal({ isOpen, onClose, album, onSave, onDelete }: EditAlbumModalProps) {
  if (!album) return null;

  const [name, setName] = useState(album.name);
  const [year, setYear] = useState(album.year);
  const [description, setDescription] = useState(album.description || '');
  const [coverUrl, setCoverUrl] = useState(album.coverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const updatedAlbum: Album = {
      ...album,
      name: name.trim(),
      year: Number(year),
      description: description.trim(),
      coverUrl: coverUrl.trim(),
    };

    try {
      await onSave(updatedAlbum);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update album specifications:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 35 }}
            className="relative w-full max-w-xl bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 space-y-6"
          >
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2.5 text-[#d4af37]">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-display text-xl md:text-2xl text-white font-medium">Chỉnh Sửa Album Chuyến Đi</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title Name Field */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Tên Chuyến Đi (Địa điểm)</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                {/* Date Year Field */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Năm Thực Hiện</label>
                  <input
                    required
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description Input Text */}
              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Mô Tả Chuyến Đi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all h-20 resize-none leading-relaxed"
                />
              </div>

              {/* Cover photo input URL */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Đường dẫn ảnh đại diện (Cover URL)</label>
                  <input
                    required
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all"
                  />
                </div>

                {/* Quick picker from inside this album's own photos */}
                {album.photos && album.photos.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block">
                      Hoặc Chọn Nhanh Ảnh Có Sẵn Trong Album Làm Bìa:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar p-1 bg-white/[0.01] border border-white/5 rounded-xl">
                      {album.photos.map((item) => {
                        const isSelected = coverUrl === item.url;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setCoverUrl(item.url)}
                            className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
                              isSelected ? 'border-[#d4af37] ring-1 ring-[#d4af37]/40' : 'border-white/5'
                            }`}
                          >
                            <img
                              src={item.url}
                              alt="Select Option"
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-black bg-[#d4af37] rounded-full p-0.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom save action row */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {showConfirmDelete ? (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-white font-medium">Bạn có chắc chắn muốn xóa album này?</strong>
                        <span className="text-[10px] text-white/50">Mọi hình ảnh và kỷ niệm trong album này sẽ bị gỡ bỏ vĩnh viễn khỏi đám mây.</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-3.5 py-1.5 rounded-lg hover:bg-white/5 text-white/70 text-[10px] font-mono tracking-wider uppercase cursor-pointer"
                      >
                        HỦY
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={async () => {
                          if (onDelete && album.id) {
                            setIsDeleting(true);
                            try {
                              await onDelete(album.id);
                              onClose();
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setIsDeleting(false);
                            }
                          }
                        }}
                        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isDeleting ? (
                          <div className="w-3 h-3 border-t-2 border-white border-r-2 border-transparent animate-spin rounded-full" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>XÓA VĨNH VIỄN</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {onDelete && album.id !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(true)}
                        className="px-4 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-mono tracking-widest uppercase transition-all cursor-pointer flex items-center space-x-1.5"
                        title="Xóa Album"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">XÓA ALBUM</span>
                      </button>
                    )}
                    <div className="flex items-center space-x-3 ml-auto">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl hover:bg-white/5 text-white/70 text-xs font-mono tracking-widest uppercase cursor-pointer"
                      >
                        HỦY LƯU
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving || !name.trim() || !coverUrl.trim()}
                        className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs font-mono tracking-widest uppercase transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer flex items-center space-x-1.5"
                      >
                        {isSaving ? (
                          <div className="w-3.5 h-3.5 border-t-2 border-black border-r-2 border-transparent animate-spin rounded-full" />
                        ) : saveSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ĐÃ CẬP NHẬT!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>LƯU THAY ĐỔI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
