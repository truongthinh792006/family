/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Photo, Album } from '../types';
import { MapPin, Calendar, Camera, Eye, Edit2, Play } from 'lucide-react';
import PhotoLikeButton from './PhotoLikeButton';

interface MasonryGalleryProps {
  album: Album;
  onPhotoClick: (index: number) => void;
  onEditAlbum?: () => void;
}

export default function MasonryGallery({ album, onPhotoClick, onEditAlbum }: MasonryGalleryProps) {
  // Simple container animation to stagger childhood arrivals
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="w-full">
      {/* Intro details about this selected journey */}
      <motion.div
        key={album.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12 max-w-4xl"
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#d4af37] block">STORYTELLING ARCHIVE</span>
        <h2 className="font-display text-3xl md:text-5xl text-white font-medium tracking-tight mt-2 mb-4 flex items-center gap-3 flex-wrap">
          <span>{album.name} — {album.year}</span>
          {onEditAlbum && album.id !== 'all' && album.id !== 'empty' && (
            <button
              onClick={onEditAlbum}
              className="p-2 rounded-full border border-white/10 hover:border-[#d4af37]/45 bg-white/[0.03] hover:bg-[#d4af37]/10 text-white/50 hover:text-[#d4af37] transition-all cursor-pointer inline-flex items-center"
              title="Chỉnh sửa thông tin Album"
            >
              <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </h2>
        <p className="text-white/60 leading-relaxed text-sm md:text-base max-w-2xl font-sans font-light">
          {album.description}
        </p>
      </motion.div>

      {/* Masonry Columns via CSS Column system */}
      {album.photos && album.photos.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 w-full"
        >
          {album.photos.map((photo, index) => {
            // Determine a pseudo-height range to introduce natural structural rhythm for masonry
            const isTall = index % 3 === 0;
            const isMedium = index % 3 === 1;

            return (
              <motion.div
                key={photo.id}
                variants={itemVariants}
                className="break-inside-avoid relative group cursor-pointer"
                onClick={() => onPhotoClick(index)}
              >
                {/* iOS Champagne-Gold High-Contrast Accent Border */}
                <div className="rainbow-glow-wrapper rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
                  <div className="rainbow-glow-inner">
                    {/* Visual Image container with different vertical flow rates */}
                    <div 
                      className={`relative w-full overflow-hidden ${
                        isTall 
                          ? 'aspect-[3/4]' 
                          : isMedium 
                            ? 'aspect-[4/5]' 
                            : 'aspect-[3/2]'
                      }`}
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Play overlay for video content */}
                      {photo.type === 'video' && (
                        <div className="absolute top-3 left-3 z-30 p-2 rounded-full bg-black/70 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center backdrop-blur-md shadow-lg transition-transform group-hover:scale-110 pointer-events-none">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}

                      {/* Hover Overlay Buttons and Details */}
                      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PhotoLikeButton photoId={photo.id} size="sm" showCount={true} />
                      </div>

                      {/* High contrast visual overlays on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10" />

                      {/* Custom minimalist center eye trigger */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15 pointer-events-none">
                        <div className="p-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white scale-75 group-hover:scale-100 transition-all duration-300">
                          <Eye className="w-5 h-5 text-[#d4af37]" />
                        </div>
                      </div>

                      {/* Bottom textual elements shown only on group-hover */}
                      <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] mb-1">
                          {photo.location}
                        </span>
                        <h4 className="font-display text-lg text-white font-medium mb-2 truncate">
                          {photo.title}
                        </h4>
                        {photo.description && (
                           <p className="text-xs text-white/60 font-sans font-light line-clamp-1">
                             {photo.description}
                           </p>
                        )}

                        <div className="mt-3.5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3 text-[#d4af37]/65" /> LEICA CHROMATIC
                          </span>
                          <span>{photo.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="w-full py-20 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
          <span className="text-white/30 text-sm font-light font-mono uppercase tracking-widest mb-3">No Photos Loaded</span>
          <p className="text-white/45 text-xs max-w-sm text-center">
            This album hasn&apos;t loaded any photos yet. Please configure or sign in to Google Photos to browse media.
          </p>
        </div>
      )}
    </div>
  );
}
