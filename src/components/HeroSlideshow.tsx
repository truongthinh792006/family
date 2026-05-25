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
}

export default function HeroSlideshow({ slides }: HeroSlideshowProps) {
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
      className="relative w-full h-screen overflow-hidden bg-black select-none"
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
            className="absolute inset-0 w-full h-full object-cover brightness-[0.45] saturate-[0.85]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Decorative High-End Vignette Grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/30 via-transparent to-[#030303]/30 z-10 pointer-events-none" />

      {/* Luxury Minimal Apple-style Header info (Client / Date watermark) */}
      <div className="absolute top-8 left-8 md:left-16 z-20 flex items-center space-x-6">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/50">ARCHIVE</span>
          <span className="font-display italic text-sm text-white/80">The Family Chronicle</span>
        </div>
      </div>

      <div className="absolute top-8 right-8 md:right-16 z-20 flex items-center space-x-2 font-mono text-[10px] tracking-widest text-white/60">
        <Camera className="w-3 h-3 text-white/40" />
        <span>LEICA M11 50MM</span>
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
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[10px] md:text-sm uppercase tracking-[0.3em] text-[#d4af37] mb-4"
          >
            {activeSlide.subtitle}
          </motion.p>

          {/* Large Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-4xl sm:text-6xl md:text-8xl text-white font-medium tracking-tight mb-6"
            style={{ transform: 'translateZ(20px)' }}
          >
            {activeSlide.title}
          </motion.h1>

          {/* Description Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center space-x-6 text-white/70 font-mono text-xs tracking-wider"
          >
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              <span>{activeSlide.location}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span>{activeSlide.year}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Controls (Arrows & Pagination) */}
      <div className="absolute bottom-12 left-8 md:left-16 z-20 flex items-center space-x-6">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
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
            <div className="h-[2px] w-8 bg-white/20 overflow-hidden transition-all group-hover:bg-white/45">
              {idx === currentIndex && (
                <motion.div
                  layoutId="activeIndicator"
                  className="h-full bg-[#d4af37]"
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
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2">SCROLL TO DISCOVER</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-[1px] h-8 bg-white/30"
        />
      </div>
    </div>
  );
}
