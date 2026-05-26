/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Calendar, Image as ImageIcon, Heart } from 'lucide-react';
import { Album } from '../types';

interface TravelCardProps {
  album: Album;
  isActive: boolean;
  onClick: () => void;
}

export default function TravelCard({ album, isActive, onClick }: TravelCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex-none w-[170px] md:w-[220px] text-left transition-all duration-300 cursor-pointer ${
        isActive ? 'opacity-100' : 'opacity-85 hover:opacity-100'
      }`}
    >
      {/* iOS Curved aspect-square Image Thumbnail Cover */}
      <div 
        className={`relative aspect-square w-full rounded-2xl overflow-hidden bg-[#0a0a0c] transition-all duration-300 ${
          isActive 
            ? 'ring-2 ring-[#d4af37] shadow-[0_4px_24px_rgba(212,175,55,0.25)]' 
            : 'ring-1 ring-white/10 hover:ring-white/20'
        }`}
      >
        <motion.img
          src={album.coverUrl}
          alt={album.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />

        {/* Dynamic ambient hover state on active */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

        {/* Tiny iOS stylized year pill indicator in corner */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 text-[9px] font-mono font-semibold text-white bg-black/40 backdrop-blur-md rounded-md border border-white/5 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-[#d4af37]" />
            {album.year}
          </span>
        </div>

        {/* Dynamic Golden Heart for special highlight categories */}
        {isActive && (
          <div className="absolute top-2.5 right-2.5">
            <span className="p-1 text-[9px] font-mono text-[#d4af37] bg-black/60 backdrop-blur-md rounded-full border border-white/10 block">
              <Heart className="w-3 h-3 fill-current" />
            </span>
          </div>
        )}
      </div>

      {/* iOS Minimalist Text Beneath Image (No lines/dividers, clean layout) */}
      <div className="pt-2 px-1">
        <h3 className="font-sans text-[14px] font-medium text-white tracking-wide truncate leading-snug">
          {album.name}
        </h3>
        
        <p className="font-sans text-[12px] text-white/45 font-normal mt-0.5 flex items-center gap-1">
          <span>{album.photosCount || 0} mục</span>
          <span>•</span>
          <span className="truncate max-w-[120px]">{album.description || 'Không mô tả'}</span>
        </p>
      </div>
    </motion.button>
  );
}
