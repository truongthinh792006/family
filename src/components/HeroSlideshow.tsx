/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Camera } from 'lucide-react';
import { HERO_SLIDES } from '../data';

interface HeroSlideshowProps {
  slides?: Array<{
    url: string;
    title: string;
    subtitle: string;
    location: string;
    year: string;
  }>;
  theme?: string;
}

export default function HeroSlideshow({ slides, theme = 'cinematic' }: HeroSlideshowProps) {
  const finalSlides = slides && slides.length > 0 && slides.some((s) => s && s.url)
    ? slides.filter((s) => s && s.url)
    : HERO_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Auto transition every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % finalSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [finalSlides]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % finalSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? finalSlides.length - 1 : prev - 1));
  };

  // 3D hover tilt calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;  // -0.5 to 0.5
    setMousePosition({ x, y });
  };

  const activeSlide = finalSlides[currentIndex] || HERO_SLIDES[0];

  return (
    <div
      id="hero-slideshow-container"
      className={`relative w-full overflow-hidden select-none transition-all duration-500 ${
        theme === 'editorial_warm'
          ? 'h-[90vh] bg-[#FAF9F6]'
          : theme === 'retro_mono'
          ? 'h-[85vh] bg-[#1c1511] border border-[#c5a059]/25 m-4 rounded-3xl w-[calc(100%-2rem)] max-w-7xl mx-auto shadow-2xl'
          : 'h-screen bg-black'
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
    >
      {/* Background Slides with cinematic zoom */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Slow Cinematic Zoom */}
          <motion.img
            src={activeSlide.url}
            alt={activeSlide.title}
            referrerPolicy="no-referrer"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 8, ease: 'linear' }}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              theme === 'editorial_warm'
                ? 'brightness-[0.75] saturate-[0.9]'
                : theme === 'retro_mono'
                ? 'brightness-[0.55] sepia-[0.55] saturate-[0.85] contrast-[1.1]'
                : 'brightness-[0.45] saturate-[0.85]'
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Decorative High-End Vignette Grid */}
      <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-500 ${
        theme === 'editorial_warm'
          ? 'bg-gradient-to-t from-[#FAF9F6] via-transparent to-[#FAF9F6]/20'
          : theme === 'retro_mono'
          ? 'bg-gradient-to-t from-[#1c1511] via-transparent to-[#1c1511]/40'
          : 'bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/40'
      }`} />
      <div className={`absolute inset-0 z-10 pointer-events-none transition-all duration-500 ${
        theme === 'editorial_warm'
          ? 'bg-gradient-to-r from-[#FAF9F6]/10 via-transparent to-[#FAF9F6]/10'
          : 'bg-gradient-to-r from-black/20 via-transparent to-black/20'
      }`} />

      {/* Luxury Minimal Apple-style Header info (Client / Date watermark) */}
      <div className="absolute top-8 left-8 md:left-16 z-20 flex items-center space-x-6">
        <div className="flex flex-col">
          <span className={`font-mono text-[9px] uppercase tracking-[0.25em] ${
            theme === 'editorial_warm' ? 'text-stone-600' : 'text-white/50'
          }`}>ARCHIVE CHRONICLES</span>
          <span className={`text-sm italic font-serif ${
            theme === 'editorial_warm' ? 'text-stone-800' : 'text-white/80'
          }`}>Exhibition Print</span>
        </div>
      </div>

      <div className={`absolute top-8 right-8 md:right-16 z-20 flex items-center space-x-2 font-mono text-[10px] tracking-widest ${
        theme === 'editorial_warm' ? 'text-stone-600' : 'text-white/60'
      }`}>
        <Camera className="w-3 h-3 text-current/50" />
        <span>LEICA ACTIVE M11</span>
      </div>

      {/* Content overlays utilizing 3D hover effects */}
      <div className="absolute inset-0 flex items-center justify-center z-20 px-6">
        <motion.div
          id="hero-card"
          animate={{
            rotateY: isHovered ? mousePosition.x * 12 : 0,
            rotateX: isHovered ? -mousePosition.y * 12 : 0,
            z: isHovered ? 40 : 0
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="max-w-3xl text-center flex flex-col items-center pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Theme-based content background box */}
          <div className={`transition-all duration-500 ${
            theme === 'editorial_warm'
              ? 'bg-[#FAF9F6]/90 backdrop-blur-md border border-stone-200/50 shadow-xl p-8 md:p-12 rounded-3xl text-[#1c1917] flex flex-col items-center max-w-2xl'
              : theme === 'retro_mono'
              ? 'bg-[#1c1511]/90 backdrop-blur-sm border-2 border-[#c5a059]/30 p-8 rounded-none max-w-xl flex flex-col items-center font-mono relative text-[#e6d5bf]'
              : 'flex flex-col items-center'
          }`}>
            
            {/* Tech line indicator for retro mono */}
            {theme === 'retro_mono' && (
              <div className="absolute top-2 left-3 text-[8.5px] text-[#c5a059] tracking-widest font-mono uppercase">
                [ INDEX_SLIDE: 0{currentIndex + 1} / 0{finalSlides.length} ]
              </div>
            )}

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`font-mono text-[10px] md:text-sm uppercase tracking-[0.3em] mb-4 ${
                theme === 'editorial_warm'
                  ? 'text-[#a37a3e]'
                  : theme === 'retro_mono'
                  ? 'text-[#c5a059] border-b border-[#c5a059]/20 pb-1 font-semibold'
                  : 'text-[#d4af37]'
              }`}
            >
              {activeSlide.subtitle}
            </motion.p>

            {/* Large Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`tracking-tight mb-6 transition-all duration-500 ${
                theme === 'editorial_warm'
                  ? 'font-serif text-[#1c1917] italic text-3xl sm:text-5xl md:text-6xl font-bold'
                  : theme === 'retro_mono'
                  ? 'font-mono text-[#e6d5bf] text-2xl sm:text-4xl md:text-5xl uppercase tracking-wider'
                  : 'font-display text-4xl sm:text-6xl md:text-8xl text-white font-medium'
              }`}
              style={{ transform: 'translateZ(20px)' }}
            >
              {activeSlide.title}
            </motion.h1>

            {/* Description Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`flex items-center space-x-6 font-mono text-xs tracking-wider transition-colors duration-500 ${
                theme === 'editorial_warm' ? 'text-stone-600' : 'text-white/70'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 opacity-60" />
                <span>{activeSlide.location}</span>
              </div>
              <div className={`h-4 w-[1px] ${theme === 'editorial_warm' ? 'bg-stone-300' : 'bg-white/20'}`} />
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                <span>{activeSlide.year}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Controls (Arrows & Pagination) */}
      <div className="absolute bottom-12 left-8 md:left-16 z-20 flex items-center space-x-6">
        <button
          onClick={handlePrev}
          className={`p-3 transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
            theme === 'editorial_warm'
              ? 'rounded-full border border-stone-200 bg-white/60 hover:bg-stone-100 text-[#1c1917] shadow-sm'
              : theme === 'retro_mono'
              ? 'rounded-none border-2 border-[#c5a059]/30 bg-[#221a15] hover:border-[#c5a059] text-[#e6d5bf] font-mono text-[9px] px-4 py-2 hover:bg-[#c5a059] hover:text-[#1c1511]'
              : 'rounded-full border border-white/10 bg-white/5 hover:bg-white/20 text-white backdrop-blur-md'
          }`}
          aria-label="Previous slide"
        >
          {theme === 'retro_mono' ? <span>PREV [-]</span> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          onClick={handleNext}
          className={`p-3 transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
            theme === 'editorial_warm'
              ? 'rounded-full border border-stone-200 bg-white/60 hover:bg-stone-100 text-[#1c1917] shadow-sm'
              : theme === 'retro_mono'
              ? 'rounded-none border-2 border-[#c5a059]/30 bg-[#221a15] hover:border-[#c5a059] text-[#e6d5bf] font-mono text-[9px] px-4 py-2 hover:bg-[#c5a059] hover:text-[#1c1511]'
              : 'rounded-full border border-white/10 bg-white/5 hover:bg-white/20 text-white backdrop-blur-md'
          }`}
          aria-label="Next slide"
        >
          {theme === 'retro_mono' ? <span>NEXT [+]</span> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Pagination indicators with dynamic line fills */}
      <div className="absolute bottom-12 right-8 md:right-16 z-20 flex items-center space-x-3">
        {finalSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="group relative py-2"
          >
            <div className={`h-[2px] w-8 overflow-hidden transition-all duration-500 ${
              theme === 'editorial_warm' ? 'bg-stone-200 group-hover:bg-stone-400' : 'bg-white/20 group-hover:bg-white/45'
            }`}>
              {idx === currentIndex && (
                <motion.div
                  layoutId="activeIndicator"
                  className={`h-full ${
                    theme === 'editorial_warm'
                      ? 'bg-[#a37a3e]'
                      : theme === 'retro_mono'
                      ? 'bg-white'
                      : 'bg-[#d4af37]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Elegant Down indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center">
        <span className={`font-mono text-[9px] uppercase tracking-widest mb-2 transition-colors duration-500 ${
          theme === 'editorial_warm' ? 'text-stone-400' : 'text-white/40'
        }`}>SCROLL TO DISCOVER</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-[1px] h-8 ${theme === 'editorial_warm' ? 'bg-stone-300' : 'bg-white/30'}`}
        />
      </div>
    </div>
  );
}
