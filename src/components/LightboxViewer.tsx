/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, MapPin, Calendar, Camera, 
  Info, Play, Pause, MessageSquare, Share2, Clipboard, ChevronDown, Sparkles
} from 'lucide-react';
import { Photo } from '../types';
import PhotoComments from './PhotoComments';
import PhotoLikeButton from './PhotoLikeButton';

interface LightboxViewerProps {
  photos: Photo[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function LightboxViewer({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-play slideshow interval (runs every 5 seconds when activated)
  useEffect(() => {
    if (!isPlaying || currentIndex === null) return;

    const interval = setInterval(() => {
      onNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, onNext]);

  // Capture keyboard controls for immersive luxury feel
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onNext, onPrev, onClose]);

  if (currentIndex === null || !photos || photos.length === 0) return null;

  const activePhoto = photos[currentIndex];

  // Copy photo link to clipboard
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(activePhoto.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy photo url:', err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/98 select-none overflow-hidden"
      >
        {/* Ambient Blur background layer - iOS Style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
          <img
            src={activePhoto.thumbnailUrl || activePhoto.url}
            alt="blur-back"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover blur-[140px] scale-150 transition-all duration-1000"
          />
        </div>

        {/* 1. iOS Top Bar */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-30 px-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white text-white/90 backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-white/5"
              title="Đóng chế độ xem"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="text-white/80 font-display font-medium text-xs leading-tight tracking-wide">
                {activePhoto.title}
              </span>
              <span className="text-white/40 font-mono text-[9px] tracking-widest leading-none mt-0.5">
                {activePhoto.type === 'video' ? 'VIDEO' : 'IMAGE'} {currentIndex + 1} OF {photos.length}
              </span>
            </div>
          </div>

          <div className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-[#d4af37]/75 font-semibold hidden sm:block pointer-events-auto">
            ✦ PREMIUM iOS VIEWER
          </div>
        </div>

        {/* 2. Main Media Viewer Canvas */}
        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 z-10 select-none">
          
          {/* Subtle swipe triggers on desktop/hover layout */}
          <button
            onClick={onPrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full border border-white/5 bg-black/40 hover:bg-[#d4af37] text-white hover:text-black backdrop-blur-md transition-all z-20 active:scale-95 cursor-pointer opacity-40 hover:opacity-100 group shadow-lg"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <button
            onClick={onNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full border border-white/5 bg-black/40 hover:bg-[#d4af37] text-white hover:text-black backdrop-blur-md transition-all z-20 active:scale-95 cursor-pointer opacity-40 hover:opacity-100 group shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Interactive photo framing */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activePhoto.id}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-full max-h-[70vh] sm:max-h-[78vh] flex items-center justify-center z-10 px-4"
            >
              {activePhoto.type === 'video' ? (
                <video
                  src={activePhoto.url}
                  controls
                  autoPlay
                  playsInline
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] sm:max-h-[78vh] object-contain rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/10"
                />
              ) : (
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] sm:max-h-[78vh] object-contain rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] border border-white/10"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. Floating iOS Glass Actions Toolbar */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center z-40 px-4">
          <div className="flex items-center gap-3.5 py-2.5 px-5 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl shadow-[0_15px_45px_rgba(0,0,0,0.7)]">
            
            {/* Auto Playback slides */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2.5 rounded-full border transition-all active:scale-90 cursor-pointer flex items-center justify-center ${
                isPlaying
                  ? 'border-[#d4af37]/45 bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
              title={isPlaying ? "Tạm dừng autoplay" : "Tự động trình chiếu (5s)"}
            >
              {isPlaying ? (
                <div className="relative">
                  <Pause className="w-4 h-4 text-[#d4af37]" />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Micro heart button like */}
            <PhotoLikeButton photoId={activePhoto.id} size="md" showCount={true} />

            {/* EXIF Information toggle */}
            <button
              onClick={() => {
                setShowInfo(!showInfo);
                setShowComments(false);
              }}
              className={`p-2.5 rounded-full border transition-all active:scale-90 cursor-pointer flex items-center justify-center ${
                showInfo
                  ? 'border-[#d4af37]/45 bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
              title="Thông tin chi tiết ảnh (EXIF)"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Reaction guestbook drawer toggle */}
            <button
              onClick={() => {
                setShowComments(!showComments);
                setShowInfo(false);
              }}
              className={`p-2.5 rounded-full border transition-all active:scale-90 cursor-pointer flex items-center justify-center ${
                showComments
                  ? 'border-[#d4af37]/45 bg-[#d4af37]/15 text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
              title="Khách ghé thăm bình luận"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Link Copy Direct */}
            <button
              onClick={handleShare}
              className={`p-2.5 rounded-full border transition-all active:scale-90 cursor-pointer flex items-center justify-center ${
                copied
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'border-white/5 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
              title="Tải / Sao chép liên kết ảnh"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Sleek overlay alerts */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 z-50 py-2.5 px-4 rounded-xl bg-emerald-500/90 text-white text-xs font-sans flex items-center gap-2 backdrop-blur-sm border border-emerald-400/30 font-medium shadow-xl"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Đã sao chép liên kết ảnh vào khay nhớ tạm!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Frosted Sidebar Drawers (Information / Technical Data) */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[380px] bg-black/85 border-l border-white/10 z-30 p-6 pt-24 backdrop-blur-2xl shadow-2xl overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#d4af37]">THÔNG TIN CHI TIẾT</span>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 rotate-270" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-medium text-white tracking-tight">
                    {activePhoto.title}
                  </h3>
                  <p className="text-xs font-sans font-light text-white/70 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    {activePhoto.description || 'Khoảnh khắc tuyệt đẹp ghi lịch trình khám phá thế giới của đại gia đình thân yêu.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center text-xs text-white/80 space-x-3.5">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#d4af37]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[80%] text-white/40 tracking-wider">ĐỊA ĐIỂM CHI TIẾT</span>
                      <span className="font-sans font-medium">{activePhoto.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-white/80 space-x-3.5">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#d4af37]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[80%] text-white/40 tracking-wider">NĂM CHỤP KỶ NIỆM</span>
                      <span className="font-sans font-medium">{activePhoto.year}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-white/80 space-x-3.5">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#d4af37]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[80%] text-white/40 tracking-wider">THIẾT BỊ SỬ DỤNG</span>
                      <span className="font-sans font-medium">Leica SL2 Vario f/2.8 & High-end Optics</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-black/40 text-[10px] text-white/40 font-mono space-y-1">
                  <div>FORMAT: HIGH RESOLUTION JPEG</div>
                  <div>Z-AXIS FLOW RATE: CHROMATIC</div>
                  <div>ARCHIVE NO: TF-{activePhoto.id.substring(0,6).toUpperCase()}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6. Frosted Comments Guestbook Drawer */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[380px] bg-black/85 border-l border-white/10 z-30 p-6 pt-24 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#d4af37]">BÌNH LUẬN GIA ĐÌNH</span>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 rotate-270" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0 flex flex-col">
                <PhotoComments photoId={activePhoto.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}
