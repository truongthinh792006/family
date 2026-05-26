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
  theme?: string;
}

export default function MasonryGallery({ album, onPhotoClick, onEditAlbum, theme = 'cinematic' }: MasonryGalleryProps) {
  const isEditorial = theme === 'editorial_warm';
  const isRetro = theme === 'retro_mono';

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
        <span className={`font-mono text-[9px] uppercase tracking-[0.3em] block ${
          isEditorial ? 'text-[#a37a3e]' : isRetro ? 'text-zinc-400' : 'text-[#d4af37]'
        }`}>STORYTELLING ARCHIVE</span>
        <h2 className={`mt-2 mb-4 flex items-center gap-3 flex-wrap ${
          isEditorial
            ? 'font-serif text-stone-800 italic font-bold tracking-normal text-3xl md:text-5xl'
            : isRetro
            ? 'font-mono text-white text-2xl md:text-4xl uppercase tracking-wider font-extrabold'
            : 'font-display text-3xl md:text-5xl text-white font-medium tracking-tight'
        }`}>
          <span>{album.name} — {album.year}</span>
          {onEditAlbum && album.id !== 'all' && album.id !== 'empty' && (
            <button
              onClick={onEditAlbum}
              className={`p-2 border transition-all cursor-pointer inline-flex items-center ${
                isEditorial
                  ? 'border-stone-200 hover:border-[#a37a3e]/45 bg-stone-50 hover:bg-[#a37a3e]/5 text-stone-600 hover:text-[#a37a3e] rounded-xl'
                  : isRetro
                  ? 'border-white/20 hover:border-white bg-black hover:bg-white hover:text-black rounded-none'
                  : 'p-2 rounded-full border border-white/10 hover:border-[#d4af37]/45 bg-white/[0.03] hover:bg-[#d4af37]/10 text-white/50 hover:text-[#d4af37]'
              }`}
              title="Chỉnh sửa thông tin Album"
            >
              <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </h2>
        <p className={`leading-relaxed text-sm md:text-base max-w-2xl ${
          isEditorial ? 'text-stone-500 font-serif italic' : isRetro ? 'text-zinc-400 font-mono' : 'text-white/60 font-sans font-light'
        }`}>
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
                {isEditorial ? (
                  /* Giao diện 2: Elegant Warm Editorial Passe-Partout Art Card */
                  <div className="bg-[#FAF9F6] border border-stone-200/80 p-3 pb-6 shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:border-stone-300 transition-all duration-350 flex flex-col rounded-none">
                    <div 
                      className={`relative w-full overflow-hidden bg-stone-100 ${
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
                        className="w-full h-full object-cover grayscale-[0.10] contrast-[1.05] transition-transform duration-[1200ms] group-hover:scale-103"
                        loading="lazy"
                      />

                      {/* Video indicator */}
                      {photo.type === 'video' && (
                        <div className="absolute top-3 left-3 z-30 p-2 rounded-full bg-[#FAF9F6]/90 border border-stone-200 text-stone-800 flex items-center justify-center shadow-md">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}

                      {/* Small hover indicator */}
                      <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="p-3.5 rounded-full bg-[#FAF9F6]/95 border border-stone-200 text-stone-700 shadow-md">
                          <Eye className="w-4 h-4 text-[#a37a3e]" />
                        </div>
                      </div>
                    </div>

                    {/* Exhibition Catalog Labels displayed physically below the photograph */}
                    <div className="pt-3.5 px-0.5 space-y-1.5 select-none text-left pointer-events-none">
                      <div className="flex items-center justify-between text-[10px] uppercase font-sans tracking-widest text-stone-400">
                        <span>{photo.location || 'Exhibition location'}</span>
                        <span>{photo.year}</span>
                      </div>
                      <h4 className="font-serif font-black text-stone-800 text-sm italic leading-tight">
                        {photo.title}
                      </h4>
                      {photo.description && (
                         <p className="text-[11.5px] text-stone-500 font-serif leading-relaxed line-clamp-2">
                           {photo.description}
                         </p>
                      )}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[9px] font-sans tracking-wider text-stone-400">
                        <span>ARCHIVE CHROMATIC</span>
                        <span>0{index + 1} / 0{album.photos.length}</span>
                      </div>
                    </div>
                  </div>

                ) : isRetro ? (
                  /* Giao diện 3: Stark Retro Monospace Polaroid Film Card but with warm vintage paper styles */
                  <div className="bg-[#221a15]/90 border border-[#c5a059]/20 hover:border-[#c5a059]/60 p-3 pb-5 transition-all duration-300 flex flex-col rounded-none shadow-md hover:shadow-[0_0_20px_rgba(197,160,89,0.15)]">
                    <div 
                      className={`relative w-full overflow-hidden bg-[#1c1410] ${
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
                        className="w-full h-full object-cover grayscale-[0.05] sepia-[0.55] saturate-[0.9] contrast-[1.08] brightness-[0.88] transition-transform duration-[1200ms] group-hover:scale-102"
                        loading="lazy"
                      />

                      {/* Video indicator */}
                      {photo.type === 'video' && (
                        <div className="absolute top-2 left-2 z-30 p-1.5 bg-[#1c1511] border border-[#c5a059]/30 text-[#e6d5bf] flex items-center justify-center font-mono text-[8px]">
                          [VIDEO]
                        </div>
                      )}

                      {/* Center technical view indicators */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="font-mono text-[9px] bg-[#1c1511] text-[#e6d5bf] px-2 py-1 border border-[#c5a059]/40 uppercase">
                          [ VIEW_FRAME ]
                        </span>
                      </div>
                    </div>

                    {/* Stark monospace physical description */}
                    <div className="pt-3 px-0.5 space-y-1 text-left font-mono text-[9.5px] text-[#c5a059]/80 uppercase select-none tracking-wider">
                      <div className="flex items-center justify-between border-b border-[#c5a059]/15 pb-1 text-[8.5px]">
                        <span>LOC: {photo.location || 'UNKNOWN'}</span>
                        <span>YR: {photo.year}</span>
                      </div>
                      <h4 className="text-[#e6d5bf] font-bold tracking-tight truncate pt-0.5">
                        &gt;&gt; {photo.title.toUpperCase()}
                      </h4>
                      {photo.description && (
                        <p className="text-[9px] text-[#eedcc0]/60 normal-case line-clamp-1 leading-snug">
                          {photo.description}
                        </p>
                      )}
                      <div className="pt-1.5 flex items-center justify-between text-[8px] text-[#c5a059]/50 tracking-normal border-t border-dashed border-[#c5a059]/15 mt-1.5">
                        <span>DSC_ID: #{photo.id.substring(0, 6)}</span>
                        <span>SLOT_0{index + 1}</span>
                      </div>
                    </div>
                  </div>

                ) : (
                  /* Giao diện 1: Original Cinematic Dark (Modern Gold luxury border & Hover detail overlays) */
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
                )}
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className={`w-full py-20 flex flex-col items-center justify-center border-dashed border ${
          isEditorial
            ? 'rounded-3xl border-stone-250 bg-stone-100/50'
            : isRetro
            ? 'rounded-none border-white/20 bg-black/20'
            : 'rounded-3xl border-white/10 bg-white/[0.01]'
        }`}>
          <span className={`text-sm font-light font-mono uppercase tracking-widest mb-3 ${
            isEditorial ? 'text-stone-400' : 'text-white/30'
          }`}>No Photos Loaded</span>
          <p className={`text-xs max-w-sm text-center ${
            isEditorial ? 'text-stone-500' : 'text-white/45'
          }`}>
            This album hasn&apos;t loaded any photos yet. Please configure or sign in to Google Photos to browse media.
          </p>
        </div>
      )}
    </div>
  );
}
