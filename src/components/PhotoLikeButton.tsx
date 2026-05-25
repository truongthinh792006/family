/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface PhotoLikeButtonProps {
  photoId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

// Generate an elegant, persistent client-side Guest ID for instant liking without account sign-in
function getGuestId(): string {
  let guestId = localStorage.getItem('family_archive_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('family_archive_guest_id', guestId);
  }
  return guestId;
}

export default function PhotoLikeButton({ photoId, size = 'md', showCount = true }: PhotoLikeButtonProps) {
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  // Get either the signed-in user's UID or the client-side guest ID
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : getGuestId();

  useEffect(() => {
    if (!photoId) return;

    // 1. Subscribe to the real-time likes in Firestore matching this photoId
    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('photoId', '==', photoId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setLikesCount(snapshot.size);
        
        // Check if current user (with auth uid or guest id) already liked this photo
        let userLiked = false;
        snapshot.forEach((docSnap) => {
          if (docSnap.data().userId === userId) {
            userLiked = true;
          }
        });
        setHasLiked(userLiked);
      },
      (error) => {
        console.error('Failed to subscribe to likes:', error);
        // Fallback local persistence if firestore quota or rules ever act up
        const localLikes = JSON.parse(localStorage.getItem(`local_likes_${photoId}`) || '{}');
        setHasLiked(!!localLikes[userId]);
      }
    );

    return () => unsubscribe();
  }, [photoId, userId]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal or viewer opening when clicked on gallery hover
    if (isLiking || !photoId) return;

    setIsLiking(true);
    const likeDocId = `${userId}_${photoId}`;
    const likeDocRef = doc(db, 'likes', likeDocId);

    try {
      if (hasLiked) {
        // Toggle off (Unlike)
        await deleteDoc(likeDocRef);
        setHasLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        
        // Remove from fallback localStorage
        const localLikes = JSON.parse(localStorage.getItem(`local_likes_${photoId}`) || '{}');
        delete localLikes[userId];
        localStorage.setItem(`local_likes_${photoId}`, JSON.stringify(localLikes));
      } else {
        // Toggle on (Like)
        await setDoc(likeDocRef, {
          photoId: photoId,
          userId: userId,
          userName: currentUser?.displayName || 'Family Guest',
          createdAt: new Date().toISOString()
        });
        setHasLiked(true);
        setLikesCount((prev) => prev + 1);

        // Put in fallback localStorage
        const localLikes = JSON.parse(localStorage.getItem(`local_likes_${photoId}`) || '{}');
        localLikes[userId] = true;
        localStorage.setItem(`local_likes_${photoId}`, JSON.stringify(localLikes));
      }
    } catch (err) {
      console.error('Failed to toggle like on Firestore:', err);
      // Fail-safe toggling purely client-side if offline / permission limits
      setHasLiked(!hasLiked);
      setLikesCount((prev) => hasLiked ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setIsLiking(false);
    }
  };

  const getIconStyles = () => {
    switch (size) {
      case 'sm': return 'w-3.5 h-3.5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4.5 h-4.5';
    }
  };

  const getButtonPadding = () => {
    switch (size) {
      case 'sm': return 'p-1.5 gap-1 text-[10px]';
      case 'lg': return 'p-3 gap-2.5 text-sm';
      default: return 'p-2.5 gap-2 text-xs';
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleLikeToggle}
      whileTap={{ scale: 0.8 }}
      whileHover={{ y: -1 }}
      className={`relative rounded-full border flex items-center justify-center font-mono font-medium tracking-wide transition-all backdrop-blur-md cursor-pointer select-none outline-none ${getButtonPadding()} ${
        hasLiked
          ? 'bg-rose-500/15 border-rose-500/35 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
          : 'bg-black/45 hover:bg-white/10 border-white/10 text-white/50 hover:text-white'
      }`}
      title={hasLiked ? "Bỏ thích" : "Thích ảnh này"}
    >
      <div className="relative flex items-center justify-center">
        <Heart
          className={`${getIconStyles()} transition-transform duration-300 ${
            hasLiked ? 'fill-rose-500 stroke-rose-400 scale-110' : ''
          }`}
        />
        {/* Elegant visual pulse on click */}
        {hasLiked && (
          <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping -z-10 scale-150 opacity-0 pointer-events-none" />
        )}
      </div>

      {showCount && (
        <span className={`${hasLiked ? 'text-rose-400 font-bold' : 'text-white/60 font-medium'}`}>
          {likesCount}
        </span>
      )}
    </motion.button>
  );
}
