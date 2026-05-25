/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit, Sparkles, Image as ImageIcon, Link2, Settings, AlertCircle, Check, HelpCircle } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HERO_SLIDES } from '../data';

interface HeroSlide {
  url: string;
  title: string;
  subtitle: string;
  location: string;
  year: string;
}

interface WebsiteSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
  currentSubtitle: string;
  currentSlides: HeroSlide[];
}

export default function WebsiteSettingsModal({
  isOpen,
  onClose,
  currentTitle,
  currentSubtitle,
  currentSlides,
}: WebsiteSettingsModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [subtitle, setSubtitle] = useState(currentSubtitle);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  
  // Initialize with exactly 3 slides, falling back if empty
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const hasValidSlides = currentSlides && currentSlides.length > 0 && currentSlides.some(s => s && s.url);
    if (hasValidSlides) {
      const merged: HeroSlide[] = [];
      for (let i = 0; i < 3; i++) {
        const saved = currentSlides[i];
        if (saved && saved.url) {
          merged.push({
            url: saved.url || '',
            title: saved.title || '',
            subtitle: saved.subtitle || '',
            location: saved.location || '',
            year: saved.year || '',
          });
        } else {
          const def = HERO_SLIDES[i] || { url: '', title: '', subtitle: '', location: '', year: '' };
          merged.push({
            url: def.url,
            title: def.title,
            subtitle: def.subtitle,
            location: def.location,
            year: def.year,
          });
        }
      }
      return merged;
    }

    return HERO_SLIDES.map((s) => ({
      url: s.url,
      title: s.title,
      subtitle: s.subtitle,
      location: s.location,
      year: s.year,
    }));
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    const updated = [...slides];
    if (!updated[index]) {
      updated[index] = { url: '', title: '', subtitle: '', location: '', year: '' };
    }
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      // Set to Firestore document settings/website
      await setDoc(doc(db, 'settings', 'website'), {
        title: title.trim(),
        subtitle: subtitle.trim(),
        heroSlides: slides,
        lastUpdated: new Date().toISOString(),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save metadata configs:', err);
      setErrorMessage('Không thể lưu cấu hình. Kiểm tra kết nối mạng của bạn.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 35 }}
          className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 space-y-6 dialog-glow no-scrollbar"
        >
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2.5 text-[#d4af37]">
              <Settings className="w-5 h-5" />
              <h3 className="font-display text-xl md:text-2xl text-white font-medium">Cấu Hình Bố Cục Trang Web</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Part 1: Branding and Typography texts */}
            <div className="space-y-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#d4af37] block font-semibold">
                1. TIÊU ĐỀ & CHỮ TRÊN CÙNG (LOGO & MONOGRAM)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Tên Website Chính</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Vd: GIA ĐÌNH HỌ TRƯƠNG"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20 font-bold uppercase"
                  />
                  <span className="text-[9px] text-white/30 block">Hiển thị chữ hoa in đậm ở thanh điều hướng trên cùng.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Slogan / Chữ Phụ</label>
                  <input
                    required
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Vd: KỶ NIỆM VÀNG GIA ĐÌNH"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20 uppercase"
                  />
                  <span className="text-[9px] text-white/30 block">Dòng gợi nhớ nghệ thuật viết chữ nhỏ dưới Tiêu Đề.</span>
                </div>
              </div>
            </div>

            {/* Part 2: Config Slide covers background */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#d4af37] block font-semibold">
                  2. ẢNH BÌA SLIDESHOW CHẠY ĐẦU TRANG
                </span>
                <div className="flex bg-white/[0.03] p-1 rounded-lg border border-white/5">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`px-3 py-1 rounded-md text-[10px] font-mono tracking-widest cursor-pointer transition-all ${
                        activeSlideIndex === idx
                          ? 'bg-[#d4af37] text-black font-semibold'
                          : 'text-white/40 hover:text-white'
                      }`}
                    >
                      BÌA #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editing slide interface container */}
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-white/80 block">
                    Tùy chỉnh thông tin Ảnh Bìa Số {activeSlideIndex + 1}
                  </span>
                  <span className="font-mono text-[9px] text-[#d4af37] tracking-widest uppercase">SLIDE PREVIEW</span>
                </div>

                <div className="space-y-4">
                  {/* Image input url */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Đường Dẫn Liên Kết Ảnh Bìa (URL)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Link2 className="h-4 w-4 text-white/30" />
                      </div>
                      <input
                        required
                        type="url"
                        placeholder="Vd: https://images.unsplash.com/photo-..."
                        value={slides[activeSlideIndex]?.url || ''}
                        onChange={(e) => handleSlideChange(activeSlideIndex, 'url', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] text-white/30">Sử dụng liên kết ảnh tải từ Unsplash, Google Photos hay bất cứ trang web nào.</span>
                      <button
                        type="button"
                        onClick={() => setShowPhotoGuide(!showPhotoGuide)}
                        className="text-[9.5px] font-mono font-medium text-[#d4af37] hover:text-[#f3cd58] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Cách lấy link ảnh?</span>
                      </button>
                    </div>

                    {/* Highly polished, explanatory slide-down info block */}
                    <AnimatePresence>
                      {showPhotoGuide && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2.5 p-4 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/25 text-xs text-white/80 space-y-3 font-sans leading-relaxed">
                            <div className="flex items-center gap-2 border-b border-[#d4af37]/10 pb-2">
                              <Sparkles className="w-4 h-4 text-[#d4af37]" />
                              <strong className="font-semibold text-white uppercase text-[10px] tracking-wider font-mono">Hướng dẫn chuẩn lấy link ảnh Google Photos</strong>
                            </div>
                            
                            <div className="space-y-4 text-[11px] font-light">
                              <div>
                                <span className="font-semibold text-[#d4af37] font-mono mr-1">Cách 1: Sao chép Địa chỉ ảnh trực tiếp (Khuyên dùng)</span>
                                <ol className="list-decimal pl-5 mt-1 space-y-1 text-white/70">
                                  <li>Đăng nhập <strong>Google Photos</strong> trên máy tính hoặc trình duyệt web điện thoại.</li>
                                  <li>Mở tấm ảnh mà bạn muốn lấy làm ảnh bìa lên ở chế độ xem toàn màn hình.</li>
                                  <li><strong>Click chuột phải (hoặc nhấn giữ trên điện thoại)</strong> trực tiếp lên bức ảnh đó.</li>
                                  <li>Chọn dòng <span className="text-[#d4af37] font-medium">"Sao chép địa chỉ hình ảnh"</span> (Copy image address).</li>
                                  <li>Dán (Paste) liên kết đó vào ô "Đường Dẫn Liên Kết Ảnh Bìa" ở trên. Link đúng sẽ bắt đầu bằng <code className="font-mono text-[9.5px] bg-white/5 px-1 py-0.5 rounded text-white font-medium">https://lh3.googleusercontent.com/...</code></li>
                                </ol>
                              </div>

                              <div className="pt-2.5 border-t border-white/5">
                                <span className="font-semibold text-[#d4af37] font-mono mr-1">Cách 2: Sử dụng các dịch vụ lưu trữ miễn phí</span>
                                <p className="mt-1 text-white/70">
                                  Nếu không dùng Google Photos, bạn có thể tải bức ảnh lên các trang web kho lưu trữ ảnh trực tuyến như <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 font-medium hover:text-blue-300">imgbb.com</a> hoặc <a href="https://postimages.org" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 font-medium hover:text-blue-300">postimages.org</a>, sau đó lấy <strong>"Link trực tiếp" (Direct Link)</strong> có đuôi kết thúc bằng <code className="font-mono text-white">.jpg</code>, <code className="font-mono text-white">.jpeg</code> hoặc <code className="font-mono text-white">.png</code>.
                                </p>
                              </div>

                              <div className="p-2 rounded-lg bg-black/45 text-[10px] text-white/50 border border-white/5">
                                <strong>⚠️ Lưu ý quan trọng:</strong> Đường link trình duyệt dạng <code className="font-mono text-white/40">https://photos.google.com/share/...</code> chỉ là trang web xem album chung, KHÔNG phải là link file ảnh gốc <code>&lt;img&gt;</code>. Bạn phải thực hiện "Sao chép địa chỉ hình ảnh" đúng cách như hướng dẫn ở trên thì hệ thống mới hiển thị được ảnh lên background.
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Two columns title / subtitle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Tiêu Đề Lớn Trên Ảnh Bìa</label>
                      <input
                        required
                        type="text"
                        placeholder="Vd: Phú Quốc Sunset Dream"
                        value={slides[activeSlideIndex]?.title || ''}
                        onChange={(e) => handleSlideChange(activeSlideIndex, 'title', e.target.value)}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Lời Nhắc Phụ / Slogan</label>
                      <input
                        required
                        type="text"
                        placeholder="Vd: Khoảnh khắc hoàng hôn lãng mạn"
                        value={slides[activeSlideIndex]?.subtitle || ''}
                        onChange={(e) => handleSlideChange(activeSlideIndex, 'subtitle', e.target.value)}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20"
                      />
                    </div>
                  </div>

                  {/* Two columns Location / Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Vị Trí / Địa Điểm</label>
                      <input
                        required
                        type="text"
                        placeholder="Vd: Bãi Sao, Phú Quốc, Việt Nam"
                        value={slides[activeSlideIndex]?.location || ''}
                        onChange={(e) => handleSlideChange(activeSlideIndex, 'location', e.target.value)}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/50 block">Năm Thực Hiện</label>
                      <input
                        required
                        type="text"
                        placeholder="Vd: 2025"
                        value={slides[activeSlideIndex]?.year || ''}
                        onChange={(e) => handleSlideChange(activeSlideIndex, 'year', e.target.value)}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] focus:bg-white/[0.08] border border-white/5 focus:border-[#d4af37]/50 text-white text-xs focus:outline-none transition-all placeholder-white/20"
                      />
                    </div>
                  </div>

                  {/* Miniature Cover Live Preview */}
                  {slides[activeSlideIndex]?.url && (
                    <div className="aspect-[24/9] w-full rounded-xl overflow-hidden border border-white/10 relative">
                      <img
                        src={slides[activeSlideIndex].url}
                        alt="cover preview"
                        className="w-full h-full object-cover brightness-[0.5]"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                        <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-widest">
                          {slides[activeSlideIndex].subtitle || 'Slogan'}
                        </span>
                        <h4 className="text-white font-display text-sm md:text-lg font-bold">
                          {slides[activeSlideIndex].title || 'Tiêu Đề Trực Quan'}
                        </h4>
                        <span className="text-[9px] font-mono text-white/60">
                          {slides[activeSlideIndex].location} • {slides[activeSlideIndex].year}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form actions and notifications */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-[11px] text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl hover:bg-white/5 text-white/70 text-xs font-mono tracking-widest uppercase cursor-pointer"
              >
                HỦY
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs font-mono tracking-widest uppercase transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-t-2 border-black border-r-2 border-transparent animate-spin rounded-full" />
                    <span>ĐANG ĐỒNG BỘ...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>THÀNH CÔNG!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>LƯU CẤU HÌNH GIA ĐÌNH</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
