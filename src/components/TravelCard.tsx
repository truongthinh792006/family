/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Calendar, Eye, Image as ImageIcon } from 'lucide-react';
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
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex-none w-[280px] md:w-[350px] text-left overflow-hidden rounded-2xl transition-all duration-500 backdrop-blur-md cursor-pointer ${
        isActive 
          ? 'ring-1 ring-[#d4af37]/70 shadow-[0_0_25px_rgba(212,175,55,0.15)] bg-white/[0.04]' 
          : 'ring-1 ring-white/5 bg-white/[0.02] opacity-80 hover:opacity-100 hover:ring-white/15'
      }`}
    >
      {/* Aspect Ratio 4:3 image wrapper */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0c0c0e]">
        <motion.img
          src={album.coverUrl}
          alt={album.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out sm:group-hover:scale-105"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />

        {/* Ambient Gradient on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Left top badge */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <span className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-white bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 text-[#d4af37]" />
            {album.year}
          </span>
        </div>

        {/* Right top badge with photos count */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest text-white bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5">
            <ImageIcon className="w-2.5 h-2.5 text-[#d4af37]" />
            {album.photosCount} Photos
          </span>
        </div>

        {/* Dynamic active ring overlay */}
        {isActive && (
          <div className="absolute inset-0 border border-[#d4af37]/35 rounded-2xl pointer-events-none" />
        )}
      </div>

      {/* Text Details Area */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-xl md:text-2xl text-white font-medium tracking-tight mb-2">
            {album.name}
          </h3>
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
            {album.description}
          </p>
        </div>

        {/* Bottom selector row */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37]">
            {isActive ? 'ACTIVE GALLERY' : 'DISCOVER ALBUM'}
          </span>
          <span className="text-white/40 group-hover:text-white transition-colors duration-200">
            <Eye className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-[#d4af37]' : ''}`} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
