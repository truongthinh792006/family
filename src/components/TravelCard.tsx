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
  theme?: string;
}

export default function TravelCard({ album, isActive, onClick, theme = 'cinematic' }: TravelCardProps) {
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
        className={`relative aspect-square w-full transition-all duration-300 ${
          theme === 'editorial_warm'
            ? `rounded-2xl overflow-hidden bg-stone-100 ${
                isActive 
                  ? 'ring-2 ring-[#a37a3e] shadow-[0_4px_20px_rgba(163,122,62,0.25)]' 
                  : 'ring-1 ring-stone-200/60 hover:ring-stone-300'
              }`
            : theme === 'retro_mono'
            ? `rounded-none p-2 bg-[#221a15] border ${
                isActive 
                  ? 'border-[#c5a059] ring-2 ring-[#c5a059]/25 shadow-[0_4px_24px_rgba(197,160,89,0.25)]' 
                  : 'border-[#c5a059]/15'
              }`
            : `rounded-2xl overflow-hidden bg-black/40 ${
                isActive 
                  ? 'ring-2 ring-[#d4af37] shadow-[0_4px_24px_rgba(212,175,55,0.25)]' 
                  : 'ring-1 ring-white/10 hover:ring-white/20'
              }`
        }`}
      >
        <motion.img
          src={album.coverUrl}
          alt={album.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            theme === 'retro_mono' ? 'sepia-[0.5] saturate-[0.85] contrast-[1.05]' : ''
          }`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />

        {/* Dynamic ambient hover state on active */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

        {/* Tiny iOS stylized year pill indicator in corner */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold rounded-md border flex items-center gap-1 ${
            theme === 'editorial_warm'
              ? 'text-stone-800 bg-[#FAF9F6]/90 border-stone-200/50'
              : theme === 'retro_mono'
              ? 'text-[#e6d5bf] bg-[#221a15]/80 backdrop-blur-md border-[#c5a059]/25'
              : 'text-white bg-black/40 backdrop-blur-md border-white/5'
          }`}>
            <Calendar className={`w-2.5 h-2.5 ${
              theme === 'editorial_warm' 
                ? 'text-[#a37a3e]' 
                : theme === 'retro_mono'
                ? 'text-[#c5a059]'
                : 'text-[#d4af37]'
            }`} />
            {album.year}
          </span>
        </div>

        {/* Dynamic Golden Heart for special highlight categories */}
        {isActive && (
          <div className="absolute top-2.5 right-2.5">
            <span className={`p-1 text-[9px] font-mono rounded-full border block ${
              theme === 'editorial_warm'
                ? 'text-[#a37a3e] bg-stone-100 border-stone-200'
                : theme === 'retro_mono'
                ? 'text-[#c5a059] bg-[#221a15] border-[#c5a059]/30'
                : 'text-[#d4af37] bg-black/60 backdrop-blur-md border-white/10'
            }`}>
              <Heart className="w-3 h-3 fill-current" />
            </span>
          </div>
        )}
      </div>

      {/* iOS Minimalist Text Beneath Image (No lines/dividers, clean layout) */}
      <div className="pt-2.5 px-1 truncate">
        <h3 className={`font-medium text-[13.5px] tracking-wide truncate leading-snug ${
          theme === 'editorial_warm'
            ? 'font-serif text-stone-800 font-bold'
            : theme === 'retro_mono'
            ? 'font-mono text-[#e6d5bf] uppercase'
            : 'font-sans text-white'
        }`}>
          {album.name}
        </h3>
        
        <p className={`text-[11.5px] font-normal mt-0.5 flex items-center gap-1 leading-none ${
          theme === 'editorial_warm'
            ? 'text-stone-500 font-serif italic'
            : theme === 'retro_mono'
            ? 'font-mono text-[#c5a059]/80 uppercase text-[10px]'
            : 'font-sans text-white/50'
        }`}>
          <span>{album.photosCount || 0} mục</span>
          <span>•</span>
          <span className="truncate max-w-[120px]">{album.description || 'Không mô tả'}</span>
        </p>
      </div>
    </motion.button>
  );
}
