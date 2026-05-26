/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Compass, CompassIcon, Info, Image as ImageIcon, Sparkles, LogIn, ChevronRight, Check, Settings, Edit2, Lock, Unlock, Shield, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';

import { LOCAL_ALBUMS } from './data';
import { Album, Photo } from './types';
import { auth, initAuth, googleSignIn, logout, db } from './lib/firebase';
import { fetchGooglePhotosAlbums, fetchAlbumPhotos } from './lib/googlePhotos';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import HeroSlideshow from './components/HeroSlideshow';
import TravelCard from './components/TravelCard';
import MasonryGallery from './components/MasonryGallery';
import LightboxViewer from './components/LightboxViewer';
import PhotosConnectPanel from './components/PhotosConnectPanel';
import LocalPhotoUploader from './components/LocalPhotoUploader';
import WebsiteSettingsModal from './components/WebsiteSettingsModal';
import EditAlbumModal from './components/EditAlbumModal';

export default function App() {
  // Sync core and listings state
  const [syncSource, setSyncSource] = useState<'local' | 'google'>('local');
  const [googleAlbums, setGoogleAlbums] = useState<Album[]>([]);
  const [customLocalAlbums, setCustomLocalAlbums] = useState<Album[]>(() => {
    try {
      const saved = localStorage.getItem('family_custom_local_albums');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeAlbumId, setActiveAlbumId] = useState<string>('phu-quoc-2025');
  const [activePhotos, setActivePhotos] = useState<Photo[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  // Dynamic branding and slider layout states
  const [websiteTitle, setWebsiteTitle] = useState<string>('FAMILY TRUONG');
  const [websiteSubtitle, setWebsiteSubtitle] = useState<string>('FINE ART CHRONICLE');
  const [websiteSlides, setWebsiteSlides] = useState<any[]>([]);
  const [adminPasscode, setAdminPasscode] = useState<string>('truongthinh79');

  // Modals visibility triggers
  const [isWebsiteSettingsOpen, setIsWebsiteSettingsOpen] = useState<boolean>(false);
  const [isEditAlbumOpen, setIsEditAlbumOpen] = useState<boolean>(false);

  // Admin Mode state (Default: Viewer Mode / perfectly clean)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true') {
        localStorage.setItem('is_family_admin_unlocked', 'true');
        return true;
      }
      return localStorage.getItem('is_family_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [passcodePromptOpen, setPasscodePromptOpen] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<boolean>(false);

  // Hidden/deleted default local journeys
  const [deletedDefaultAlbumIds, setDeletedDefaultAlbumIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('family_deleted_default_album_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen to custom deleted default albums in real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'deletedAlbums'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.ids) {
          setDeletedDefaultAlbumIds(data.ids);
          try {
            localStorage.setItem('family_deleted_default_album_ids', JSON.stringify(data.ids));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  // Listen to custom website metadata configuration in real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'website'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.title) setWebsiteTitle(data.title.toUpperCase());
        if (data.subtitle) setWebsiteSubtitle(data.subtitle);
        if (data.heroSlides) setWebsiteSlides(data.heroSlides);
        if (data.passcode) setAdminPasscode(data.passcode);
      }
    });
    return () => unsub();
  }, []);

  // Sync added albums to customLocalAlbums
  const handleAddCustomAlbum = async (newAlbum: Album) => {
    // 1. Update UI and LocalStorage instantly for snappy UX
    const updated = [newAlbum, ...customLocalAlbums.filter(a => a.id !== newAlbum.id)];
    setCustomLocalAlbums(updated);
    try {
      localStorage.setItem('family_custom_local_albums', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
    setSyncSource('local');
    setActiveAlbumId(newAlbum.id);

    // 2. Persist in cloud (Firestore) so it is shared with all family members forever!
    try {
      await setDoc(doc(db, 'customAlbums', newAlbum.id), {
        name: newAlbum.name,
        year: Number(newAlbum.year),
        coverUrl: newAlbum.coverUrl,
        photosCount: Number(newAlbum.photosCount),
        description: newAlbum.description,
        photos: newAlbum.photos,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to sync new album with Firestore database:', error);
    }
  };

  const handleSaveAlbumDetails = async (updatedAlbum: Album) => {
    // 1. Update UI and LocalStorage instantly
    const exists = customLocalAlbums.some((a) => a.id === updatedAlbum.id);
    const finalUpdated = exists
      ? customLocalAlbums.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a))
      : [updatedAlbum, ...customLocalAlbums];

    setCustomLocalAlbums(finalUpdated);
    try {
      localStorage.setItem('family_custom_local_albums', JSON.stringify(finalUpdated));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }

    // 2. Clear Google cache / sync details if active
    if (syncSource === 'google') {
      setGoogleAlbums((prev) =>
        prev.map((a) => (a.id === updatedAlbum.id ? updatedAlbum : a))
      );
    }

    // 3. Persist in cloud (Firestore)
    try {
      await setDoc(doc(db, 'customAlbums', updatedAlbum.id), {
        name: updatedAlbum.name,
        year: Number(updatedAlbum.year),
        coverUrl: updatedAlbum.coverUrl,
        photosCount: Number(updatedAlbum.photosCount),
        description: updatedAlbum.description,
        photos: updatedAlbum.photos,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to sync updated album with Firestore database:', error);
      throw error;
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    // 1. Remove from local customs state & cache
    const updatedCustoms = customLocalAlbums.filter((a) => a.id !== albumId);
    setCustomLocalAlbums(updatedCustoms);
    try {
      localStorage.setItem('family_custom_local_albums', JSON.stringify(updatedCustoms));
    } catch (e) {
      console.error(e);
    }

    // 2. Always attempt to delete from Cloud Firestore customAlbums collection 
    // in case the user edited this default album in the past (which saves it to customAlbums)
    try {
      await deleteDoc(doc(db, 'customAlbums', albumId));
    } catch (err) {
      console.error('Failed to clear edited cloud data for album:', err);
    }

    // 3. Check if it is a default local album to hide it permanently
    const isDefault = LOCAL_ALBUMS.some((a) => a.id === albumId);
    if (isDefault) {
      const updatedDeleted = [...new Set([...deletedDefaultAlbumIds, albumId])];
      setDeletedDefaultAlbumIds(updatedDeleted);
      try {
        localStorage.setItem('family_deleted_default_album_ids', JSON.stringify(updatedDeleted));
        await setDoc(doc(db, 'settings', 'deletedAlbums'), {
          ids: updatedDeleted,
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to sync deleted default albums to cloud:', err);
      }
    }

    // 4. Reset active album selection to all
    setActiveAlbumId('all');
  };

  // Real-time listener for custom albums in firestore
  useEffect(() => {
    const customAlbumsRef = collection(db, 'customAlbums');
    const unsubscribe = onSnapshot(
      customAlbumsRef,
      (snapshot) => {
        const albumsList: Album[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          albumsList.push({
            id: docSnap.id,
            name: data.name,
            year: Number(data.year),
            coverUrl: data.coverUrl,
            photosCount: Number(data.photosCount),
            description: data.description || '',
            photos: data.photos || [],
          });
        });

        // Safe Client-side sorting/merging
        setCustomLocalAlbums((prevLocal) => {
          const dbIds = new Set(albumsList.map((a) => a.id));
          const offlineOnly = prevLocal.filter((a) => !dbIds.has(a.id));
          return [...albumsList, ...offlineOnly];
        });
      },
      (error) => {
        console.error('Real-time custom albums fetch issue:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Lightbox selection state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Initialize auth listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setNeedsAuth(false);
        setIsConnecting(false);
        setSyncSource('google'); // Auto switch to cloud if they are logged in
        loadGooglePhotos(token);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
        setIsConnecting(false);
        setSyncSource('local');
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync logged in email with Admin Mode automatically
  useEffect(() => {
    if (user && user.email === 'truongthinh792026@gmail.com') {
      setIsAdmin(true);
      try {
        localStorage.setItem('is_family_admin_unlocked', 'true');
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  // Sync / Active album calculation
  useEffect(() => {
    const customIds = new Set(customLocalAlbums.map((a) => a.id));
    const filteredDefaults = LOCAL_ALBUMS.filter((a) => !customIds.has(a.id) && !deletedDefaultAlbumIds.includes(a.id));
    const filteredCustoms = customLocalAlbums.filter((a) => !deletedDefaultAlbumIds.includes(a.id));
    const allLocalAlbums = [...filteredCustoms, ...filteredDefaults];
    if (syncSource === 'local') {
      if (activeAlbumId === 'all') {
        // Collect all local photos across all albums
        const allPhotos = allLocalAlbums.flatMap((album) => album.photos);
        setActivePhotos(allPhotos);
      } else {
        const found = allLocalAlbums.find((a) => a.id === activeAlbumId);
        if (found) {
          setActivePhotos(found.photos);
        } else if (allLocalAlbums.length > 0) {
          // Fallback to first
          setActiveAlbumId(allLocalAlbums[0].id);
          setActivePhotos(allLocalAlbums[0].photos);
        }
      }
    } else {
      // Find google album or load photos on demand
      const found = googleAlbums.find((a) => a.id === activeAlbumId);
      if (found) {
        if (found.photos && found.photos.length > 0) {
          setActivePhotos(found.photos);
        } else {
          // Fetch photos for this google album dynamically
          fetchGooglePhotosForAlbum(found.id);
        }
      } else if (googleAlbums.length > 0) {
        // Fallback to first google album
        const first = googleAlbums[0];
        setActiveAlbumId(first.id);
        if (first.photos && first.photos.length > 0) {
          setActivePhotos(first.photos);
        } else {
          fetchGooglePhotosForAlbum(first.id);
        }
      } else {
        setActivePhotos([]);
      }
    }
  }, [syncSource, activeAlbumId, googleAlbums, customLocalAlbums]);

  // Auth Operations
  const handleLogin = async () => {
    setIsConnecting(true);
    setErrorText(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        setSyncSource('google');
        await loadGooglePhotos(result.accessToken);
      }
    } catch (error: any) {
      console.error(error);
      setErrorText(error.message || 'Authentication was cancelled or failed to set up.');
      setSyncSource('local');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    setIsConnecting(true);
    try {
      await logout();
      setUser(null);
      setNeedsAuth(true);
      setGoogleAlbums([]);
      setSyncSource('local');
      setActiveAlbumId('phu-quoc-2025');
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Google data retrievals
  const loadGooglePhotos = async (token: string) => {
    setIsLoaded(false);
    setErrorText(null);
    try {
      const albums = await fetchGooglePhotosAlbums(token);
      setGoogleAlbums(albums);
      if (albums.length > 0) {
        setActiveAlbumId(albums[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText('Failed to pull Google Photos albums. Verify Google account access permissions or credential parameters.');
      setSyncSource('local');
    } finally {
      setIsLoaded(true);
    }
  };

  const fetchGooglePhotosForAlbum = async (albumId: string) => {
    setIsLoaded(false);
    try {
      const token = auth.currentUser ? (await auth.currentUser.getIdToken(true)) : '';
      // Wait, we need the actual Google Access Token (which is cached in our module), not a standard ID Token!
      // Let's get the cached Google access token from firebase service
      const googleToken = await import('./lib/firebase').then(m => m.getAccessToken());
      
      if (!googleToken) {
        throw new Error('No Google Access Token found. Please re-authenticate.');
      }

      const photos = await fetchAlbumPhotos(googleToken, albumId);
      
      setGoogleAlbums((prevAlbums) =>
        prevAlbums.map((album) =>
          album.id === albumId ? { ...album, photos: photos } : album
        )
      );
      setActivePhotos(photos);
    } catch (err: any) {
      console.error(err);
      setErrorText('Failed to synchronize photos for the selected Google Album.');
    } finally {
      setIsLoaded(true);
    }
  };

  const handleRefreshGoogleData = async () => {
    const googleToken = await import('./lib/firebase').then(m => m.getAccessToken());
    if (googleToken) {
      await loadGooglePhotos(googleToken);
    } else {
      handleLogin();
    }
  };

  // Lightbox actions
  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
  };

  const handleNextPhoto = () => {
    if (lightboxIndex === null || activePhotos.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % activePhotos.length);
  };

  const handlePrevPhoto = () => {
    if (lightboxIndex === null || activePhotos.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + activePhotos.length) % activePhotos.length);
  };

  // Render variables
  const renderingCustomIds = new Set(customLocalAlbums.map((a) => a.id));
  const renderingFilteredDefaults = LOCAL_ALBUMS.filter(
    (a) => !renderingCustomIds.has(a.id) && !deletedDefaultAlbumIds.includes(a.id)
  );
  const renderingFilteredCustoms = customLocalAlbums.filter(
    (a) => !deletedDefaultAlbumIds.includes(a.id)
  );
  const albumsToRender = syncSource === 'local' ? [...renderingFilteredCustoms, ...renderingFilteredDefaults] : googleAlbums;
  const activeAlbum = albumsToRender.find((a) => a.id === activeAlbumId);

  return (
    <div className="min-h-screen bg-[#030303] text-[#f5f5f7] font-sans antialiased overflow-x-hidden selection:bg-white/[0.15]">
      {/* 1. Header with Glassmorphic navigation menu */}
      <header className="fixed top-0 inset-x-0 h-20 bg-black/40 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-6 md:px-16 transition-all duration-300">
        <div 
          className={`flex items-center space-x-3.5 ${isAdmin ? 'cursor-pointer' : ''}`} 
          onClick={isAdmin ? () => setIsWebsiteSettingsOpen(true) : undefined} 
          title={isAdmin ? "Nhấn để thiết lập tiêu đề website" : undefined}
        >
          <div className="w-8 h-8 rounded-full border border-[#d4af37]/70 flex items-center justify-center bg-white/[0.02]">
            <Compass className="w-4.5 h-4.5 text-[#d4af37]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-medium text-base tracking-widest text-[#d4af37] uppercase sm:text-lg">
              {websiteTitle}
            </h1>
            <span className="text-[8.5px] font-mono tracking-[0.2em] text-white/45 uppercase">{websiteSubtitle}</span>
          </div>
        </div>

        {/* Navigation Elements */}
        <nav className="hidden md:flex items-center space-x-8 font-mono text-[10px] tracking-widest text-white/50">
          <a href="#hero-slideshow-container" className="hover:text-white transition-colors uppercase">HOME</a>
          <a href="#chuyen-di-noi-bat" className="hover:text-white transition-colors uppercase">JOURNEYS</a>
          {isAdmin && (
            <a href="#metadata-sync" className="hover:text-white transition-colors uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              CLOUD PERSISTENCE
            </a>
          )}
        </nav>

        {/* Header Right Trigger action */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {isAdmin ? (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWebsiteSettingsOpen(true)}
                className="px-3.5 md:px-4.5 py-2 rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] font-sans text-[11px] font-bold tracking-wider uppercase flex items-center space-x-1.5 cursor-pointer transition-all shrink-0 shadow-[0_2px_12px_rgba(212,175,55,0.15)]"
                title="Sửa đổi Giao diện & Tiêu đề"
              >
                <Settings className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>CÀI ĐẶT WEB</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsAdmin(false);
                  localStorage.removeItem('is_family_admin_unlocked');
                  setIsWebsiteSettingsOpen(false);
                }}
                className="p-2 rounded-full border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-500 hover:text-red-400 cursor-pointer transition-all shrink-0 flex items-center justify-center"
                title="Khóa Quyền Admin (Thoát Cấu Hình)"
              >
                <Unlock className="w-4 h-4 text-green-400" />
              </motion.button>

              {user ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSyncSource('google');
                    document.getElementById('metadata-sync')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 md:px-4 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 font-mono text-[9px] tracking-widest uppercase flex items-center space-x-1.5 cursor-pointer hover:bg-green-500/20 shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  <span className="hidden xs:inline">SIGNED IN</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className="px-2.5 md:px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] tracking-widest uppercase flex items-center space-x-1.5 cursor-pointer transition-all shrink-0"
                >
                  <LogIn className="w-3 h-3 text-white/50" />
                  <span className="hidden xs:inline">CONNECT PHOTOS</span>
                </motion.button>
              )}
            </>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setPasscodePromptOpen(true)}
              className="px-4 py-2 rounded-full border border-[#d4af37]/35 bg-[#d4af37]/5 hover:bg-[#d4af37]/15 text-[#d4af37] font-sans text-[11px] font-bold tracking-wider uppercase flex items-center space-x-1.5 cursor-pointer transition-all shadow-[0_4px_15px_rgba(212,175,55,0.1)]"
              title="Đăng nhập để vào Cài đặt Web"
            >
              <Lock className="w-3 h-3" />
              <span>ĐĂNG NHẬP ADMIN (CÀI ĐẶT WEB)</span>
            </motion.button>
          )}
        </div>
      </header>

      {/* 2. Hero Slideshow Container */}
      <section id="hero-slideshow-container" className="w-full relative">
        <HeroSlideshow slides={websiteSlides} />
      </section>

      {/* 2.5 Cinematic Infinite Marquee Ticker */}
      <div className="w-full bg-black/85 border-y border-white/5 py-4.5 overflow-hidden relative z-20 backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[10px] sm:text-xs font-mono tracking-[0.25em] text-white/40 uppercase select-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="flex items-center gap-2">✦ KỶ NIỆM GIA ĐÌNH HẠNH PHÚC</span>
              <span className="text-[#d4af37] flex items-center gap-2">✦ THE TRUONG CLAN CHRONICLES</span>
              <span className="flex items-center gap-2">✦ NHỮNG CUNG ĐƯỜNG HOÀI NIỆM</span>
              <span className="text-[#d4af37] flex items-center gap-2">✦ FAMILY TRAVEL JOURNAL</span>
              <span className="flex items-center gap-2">✦ ĐÀ LẠT SƯƠNG MÙ 2024</span>
              <span className="text-[#d4af37] flex items-center gap-2">✦ NHA TRANG BIỂN XANH</span>
              <span className="flex items-center gap-2">✦ PHÚ QUỐC NẮNG VÀNG</span>
              <span className="text-[#d4af37] flex items-center gap-2">✦ BẢO TÀNG KÝ ỨC VĨNH CỬU</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-20 md:space-y-32">

        {/* Error notification banner if any */}
        {errorText && (
          <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-sans text-xs flex items-center justify-between animate-fade-in relative z-20">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              {errorText}
            </span>
            <button onClick={() => setErrorText(null)} className="font-mono hover:text-white p-1 ml-4 cursor-pointer">×</button>
          </div>
        )}

        {/* 3. "Chuyến đi nổi bật" (Featured Journeys) horizontal scroll list */}
        <section id="chuyen-di-noi-bat" className="space-y-10 scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#d4af37]">DIGITAL TREASURES</span>
              <h2 className="font-display text-3xl md:text-5xl text-white font-medium tracking-tight">
                Chuyến Đi Nổi Bật
              </h2>
            </div>
            
            <p className="text-white/40 text-xs md:text-sm font-sans font-light max-w-sm leading-relaxed">
              Những địa điểm lý tưởng, những cung đường hoài niệm và những bức ảnh thô lưu trữ nguyên vẹn ký ức gia đình.
            </p>
          </div>

          {/* Cards Flex Strip */}
          <div className="relative">
            {/* Horizontal Row scroll wrapper */}
            <div className="flex space-x-6 overflow-x-auto pb-6 pt-2 select-none no-scrollbar snap-x scroll-smooth">
              {albumsToRender.map((album) => (
                <div key={album.id} className="snap-start">
                  <TravelCard
                    album={album}
                    isActive={activeAlbumId === album.id}
                    onClick={() => {
                      setActiveAlbumId(album.id);
                    }}
                  />
                </div>
              ))}

              {/* View All Button inside Horizontal Strip */}
              {syncSource === 'local' && (
                <div className="snap-start flex items-stretch">
                  <motion.button
                    onClick={() => {
                      setActiveAlbumId('all');
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-[240px] rounded-2xl border flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer text-center ${
                      activeAlbumId === 'all'
                        ? 'bg-white/10 border-[#d4af37] text-white'
                        : 'bg-white/[0.01] border-white/5 hover:border-white/15 text-white/50 hover:text-white'
                    }`}
                  >
                    <div className="p-4 rounded-full bg-white/[0.04] mb-4 border border-white/10">
                      <ImageIcon className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <span className="font-display text-lg font-medium tracking-tight mb-2">Xem Tất Cả</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] mb-4 block">18 PHOTOGRAPHS</span>
                    <span className="text-xs text-white/40 font-light font-sans leading-relaxed">
                      Kết hợp tất cả ký ức hành trình vào một lưới khảm duy nhất.
                    </span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Subtle Gradient indicators to make scrolling look premium */}
            <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-[#030303] to-transparent pointer-events-none" />
          </div>

          {/* Local sandbox uploader for quick bypassing of Google Photos APIs verification blocker */}
          {syncSource === 'local' && isAdmin && (
            <div className="pt-4 border-t border-white/5">
              <LocalPhotoUploader onAddAlbum={handleAddCustomAlbum} />
            </div>
          )}
        </section>

        {/* 4. Masonry photos display area */}
        <section id="masonry-gallery-view" className="space-y-6 pt-4">
          <AnimatePresence mode="wait">
            {!isLoaded ? (
              <div key="loader" className="w-full py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full border-t border-[#d4af37]/60 border-r border-transparent animate-spin" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Synchronizing cloud elements...</span>
              </div>
            ) : (
              <div key="loaded-content">
                <MasonryGallery
                  album={
                    activeAlbumId === 'all' && syncSource === 'local'
                      ? {
                          id: 'all',
                          name: 'Tất Cả Ký ỨC',
                          year: 2026,
                          coverUrl: '',
                          photosCount: activePhotos.length,
                          description: 'Lưới hiển thị tóm tắt toàn bộ lưu trữ du hí gia đình qua các năm 2024, 2025 và 2026. Lát cắt chân thực tuyệt đối.',
                          photos: activePhotos
                        }
                      : activeAlbum || {
                          id: 'empty',
                          name: 'No Active Album',
                          year: 2026,
                          coverUrl: '',
                          photosCount: 0,
                          description: '',
                          photos: []
                        }
                  }
                  onPhotoClick={handlePhotoClick}
                  onEditAlbum={isAdmin ? () => setIsEditAlbumOpen(true) : undefined}
                />
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* 5. Photos Connect Panel (Safe authentication / GCP parameters) */}
        {isAdmin && (
          <section id="metadata-sync" className="scroll-mt-28">
            <PhotosConnectPanel
              user={user}
              needsAuth={needsAuth}
              onLogin={handleLogin}
              onLogout={handleLogout}
              isConnecting={isConnecting}
              googleAlbumsCount={googleAlbums.length}
              syncSource={syncSource}
              setSyncSource={setSyncSource}
              onRefreshGoogle={handleRefreshGoogleData}
              onAddSharedAlbum={handleAddCustomAlbum}
            />
          </section>
        )}
      </main>

      {/* 6. High-end "Footer gia đình" (Family Footer) */}
      <footer className="bg-black/80 border-t border-white/5 py-16 px-6 md:px-16 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Logo / details block */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-full border border-[#d4af37]/40 flex items-center justify-center bg-white/[0.01]">
                <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
              </div>
              <span className="font-display font-medium text-sm tracking-widest text-white uppercase">THE TRUONG FAMILY ARCHIVE</span>
            </div>
            
            <p className="text-xs text-white/40 leading-relaxed font-sans font-light">
              Lưu giữ những lát cắt thời gian chân thực và quý báu của gia đình. Đề cao thiết kế tối giản, chất lượng hình ảnh Leica mộc mạc và trải nghiệm lưu truyền số hóa tinh tế.
            </p>
          </div>

          {/* Quick list specs */}
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block">ALBUM ARCHIVES</span>
              <ul className="font-sans text-xs text-white/60 space-y-2 font-light">
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveAlbumId('phu-quoc-2025'); setSyncSource('local'); document.getElementById('chuyen-di-noi-bat')?.scrollIntoView({ behavior: 'smooth' }); }}>Phú Quốc Island (2025)</li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveAlbumId('da-lat-2024'); setSyncSource('local'); document.getElementById('chuyen-di-noi-bat')?.scrollIntoView({ behavior: 'smooth' }); }}>Đà Lạt Highlands (2024)</li>
                <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer" onClick={() => { setActiveAlbumId('singapore-2026'); setSyncSource('local'); document.getElementById('chuyen-di-noi-bat')?.scrollIntoView({ behavior: 'smooth' }); }}>Singapore Cityscape (2026)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block">FAMILY DETAILS</span>
              <ul className="font-sans text-xs text-white/40 space-y-1 font-light leading-relaxed">
                <li><strong className="text-white/60 font-normal">Sáng lập:</strong> Trương Thịnh</li>
                <li><strong className="text-white/60 font-normal">Máy ảnh chính:</strong> Leica M11 & SL2</li>
                <li><strong className="text-white/60 font-normal">Kỷ niệm:</strong> Khởi tạo từ 2024</li>
                <li><strong className="text-white/60 font-normal">Kỹ thuật:</strong> React, Framer Motion</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Floating line bottom credits */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-white/30 tracking-widest gap-4">
          <span>DESIGNED BY APPLE VISUAL INSPIRED ARTISANS</span>
          <div className="flex items-center space-x-4">
            <span>© 2026 THE TRUONG CLAN CHRONICLES. ALL RIGHTS RESERVED.</span>
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                  localStorage.removeItem('is_family_admin_unlocked');
                  setIsWebsiteSettingsOpen(false);
                } else {
                  setPasscodePromptOpen(true);
                }
              }}
              className="hover:text-[#d4af37] transition-all cursor-pointer text-white/40 hover:scale-105 flex items-center gap-1.5 focus:outline-none text-[10px] uppercase font-mono tracking-widest border-l border-white/10 pl-3.5"
              title={isAdmin ? "Khóa quyền quản trị (Thoát Admin)" : "Đăng nhập mật mã để thay đổi giao diện"}
            >
              {isAdmin ? <Unlock className="w-3.2 h-3.2 text-green-400" /> : <Lock className="w-3.2 h-3.2 text-[#d4af37]" />}
              <span>{isAdmin ? "CÀI ĐẶT WEB (ẤN ĐỂ THOÁT)" : "CÀI ĐẶT WEB (ĐĂNG NHẬP)"}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 7. Lightroom cinematic fullscreen lightbox modal */}
      <LightboxViewer
        photos={activePhotos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
      />

      {/* 8. Web parameters brand customization settings */}
      {isWebsiteSettingsOpen && (
        <WebsiteSettingsModal
          isOpen={isWebsiteSettingsOpen}
          onClose={() => setIsWebsiteSettingsOpen(false)}
          currentTitle={websiteTitle}
          currentSubtitle={websiteSubtitle}
          currentSlides={websiteSlides}
          currentPasscode={adminPasscode}
          onLockAdmin={() => {
            setIsAdmin(false);
            localStorage.removeItem('is_family_admin_unlocked');
            setIsWebsiteSettingsOpen(false);
          }}
        />
      )}

      {/* 9. Trip cover photo, title, subtitle & year inline editor */}
      {isEditAlbumOpen && activeAlbum && (
        <EditAlbumModal
          isOpen={isEditAlbumOpen}
          onClose={() => setIsEditAlbumOpen(false)}
          album={activeAlbum}
          onSave={handleSaveAlbumDetails}
          onDelete={handleDeleteAlbum}
        />
      )}

      {/* 10. High-end iOS circular PIN Passcode Modal for Admin Unlock */}
      <AnimatePresence>
        {passcodePromptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
          >
            {/* iOS Styled container */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-full max-w-sm flex flex-col items-center text-center space-y-10"
            >
              <div className="space-y-3.5">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#d4af37]" />
                </div>
                
                <div className="space-y-1.5 animate-fade-in">
                  <h3 className="font-sans font-medium text-lg text-white tracking-widest uppercase">Nhập mật mã</h3>
                  <p className="text-[11px] text-white/40 font-light max-w-xs leading-relaxed px-4">
                    Nhập mật mã mở khóa quyền Admin của gia đình. Mật mã cũ <code className="font-mono bg-white/5 px-1 rounded">123456</code> đã bị thu hồi vì lý do an toàn.
                  </p>
                </div>
              </div>

              {/* iOS Dot Grid representing character entry progress */}
              <div className="flex space-x-5 justify-center">
                {Array.from({ length: Math.max(6, passcodeInput.length) }).map((_, i) => {
                  const isFilled = i < passcodeInput.length;
                  return (
                    <motion.div
                      key={i}
                      animate={isFilled ? { scale: [1, 1.25, 1] } : {}}
                      transition={{ duration: 0.15 }}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                        isFilled
                          ? 'bg-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.73)] border-transparent'
                          : 'border border-white/20 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Invisible touch focus form for physical keyboard users typing seamlessly */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passcodeInput === adminPasscode || passcodeInput === 'truongthinh79') {
                    setIsAdmin(true);
                    try {
                      localStorage.setItem('is_family_admin_unlocked', 'true');
                    } catch {}
                    setPasscodePromptOpen(false);
                    setPasscodeInput('');
                    setPasscodeError(false);
                  } else {
                    setPasscodeError(true);
                    setPasscodeInput('');
                  }
                }}
                className="w-0 h-0 opacity-0 overflow-hidden"
              >
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setPasscodeError(false);
                  }}
                  autoFocus
                />
              </form>

              {passcodeError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-mono text-red-400 uppercase tracking-widest animate-shake"
                >
                  ● Mật mã không chính xác
                </motion.div>
              )}

              {/* iOS Touch Ring Keypad Grid */}
              <div className="grid grid-cols-3 gap-x-8 gap-y-5 w-full max-w-[280px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (passcodeInput.length >= 12) return;
                      setPasscodeInput(prev => prev + num);
                      setPasscodeError(false);
                    }}
                    className="w-16 h-16 rounded-full bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/5 active:scale-95 text-xl font-sans text-white flex items-center justify-center transition-all cursor-pointer shadow-sm select-none"
                  >
                    {num}
                  </button>
                ))}

                {/* Cancel Trigger button inside keypad */}
                <button
                  type="button"
                  onClick={() => {
                    setPasscodePromptOpen(false);
                    setPasscodeInput('');
                    setPasscodeError(false);
                  }}
                  className="w-16 h-16 text-xs font-sans text-white/55 hover:text-white flex items-center justify-center cursor-pointer transition-colors uppercase tracking-wider select-none"
                >
                  Huỷ
                </button>

                {/* 0 Key */}
                <button
                  type="button"
                  onClick={() => {
                    if (passcodeInput.length >= 12) return;
                    setPasscodeInput(prev => prev + '0');
                    setPasscodeError(false);
                  }}
                  className="w-16 h-16 rounded-full bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.15] border border-white/5 active:scale-95 text-xl font-sans text-white flex items-center justify-center transition-all cursor-pointer shadow-sm select-none"
                >
                  0
                </button>

                {/* Backspace Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    setPasscodeInput(prev => prev.slice(0, -1));
                    setPasscodeError(false);
                  }}
                  className="w-16 h-16 text-xs font-sans text-white/55 hover:text-white flex items-center justify-center cursor-pointer transition-colors uppercase tracking-wider select-none"
                >
                  Xóa
                </button>
              </div>

              {/* High precision trigger button layout below digits keypad */}
              <div className="pt-2 w-full max-w-[240px]">
                <button
                  type="button"
                  disabled={passcodeInput.length === 0}
                  onClick={() => {
                    if (passcodeInput === adminPasscode || passcodeInput === 'truongthinh79') {
                      setIsAdmin(true);
                      try {
                        localStorage.setItem('is_family_admin_unlocked', 'true');
                      } catch {}
                      setPasscodePromptOpen(false);
                      setPasscodeInput('');
                      setPasscodeError(false);
                    } else {
                      setPasscodeError(true);
                      setPasscodeInput('');
                    }
                  }}
                  className="w-full py-3.5 rounded-full bg-[#d4af37] disabled:bg-white/5 text-black disabled:text-white/20 hover:bg-white hover:text-black font-semibold text-xs font-mono tracking-widest uppercase transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Xác nhận mật mã
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 11. iOS-styled Golden Floating Action Button (FAB) for Web Settings when Admin is active */}
      {isAdmin && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.05, translateY: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsWebsiteSettingsOpen(true)}
            className="flex items-center space-x-2 px-4.5 py-3 rounded-full bg-black/90 hover:bg-black border border-[#d4af37] text-[#d4af37] shadow-[0_10px_30px_rgba(212,175,55,0.25)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.4)] backdrop-blur-md transition-all cursor-pointer group"
          >
            <div className="p-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] group-hover:rotate-45 transition-transform duration-500">
              <Settings className="w-4 h-4" />
            </div>
            <span className="font-sans text-[11px] font-bold tracking-wider uppercase pr-1">CÀI ĐẶT WEB</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

