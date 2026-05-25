/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { Send, Trash2, MessageCircle, Lock, UserCheck } from 'lucide-react';

interface CommentType {
  id: string;
  photoId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: any;
}

interface PhotoCommentsProps {
  photoId: string;
}

export default function PhotoComments({ photoId }: PhotoCommentsProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    // Query comments matching the current photo id
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('photoId', '==', photoId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CommentType[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            photoId: data.photoId,
            userId: data.userId,
            userName: data.userName,
            userPhoto: data.userPhoto || '',
            text: data.text,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          });
        });

        // Safe Client-Side sorting by createdAt to avoid needing complex Firestore composite indexes
        list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        setComments(list);
        setErrorMessage(null);
      },
      (error) => {
        console.error('Real-time comments fetch issue:', error);
        // Safely capture error using standard error structure
        try {
          handleFirestoreError(error, OperationType.LIST, 'comments');
        } catch (wrappedError: any) {
          setErrorMessage('Database connection premium mode currently active. Sync to view comments.');
        }
      }
    );

    return () => unsubscribe();
  }, [photoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!currentUser) {
      setErrorMessage('Please connect your Google Photos account at the top of the page to post reactions.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const nameForId = comments.length.toString() + '_' + Date.now();

    try {
      await addDoc(collection(db, 'comments'), {
        photoId: photoId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Family Member',
        userPhoto: currentUser.photoURL || '',
        text: inputText.trim(),
        createdAt: serverTimestamp(),
      });
      setInputText('');
    } catch (error) {
      console.error('Post comment error:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, 'comments');
      } catch (errString: any) {
        setErrorMessage('Failed to post. High security permissions check active.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this reaction?')) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error('Delete comment issue:', error);
      try {
        handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
      } catch (err: any) {
        alert('Unauthorized. You can only delete your own family reactions.');
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[160px] pt-4 border-t border-white/5 space-y-4">
      <div className="flex items-center space-x-2 text-[#d4af37]">
        <MessageCircle className="w-4 h-4" />
        <span className="font-mono text-[9px] uppercase tracking-widest font-semibold">REACTION GUESTBOOK ({comments.length})</span>
      </div>

      {errorMessage && (
        <div className="p-2 py-3 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/15 text-white/70 text-[10px] leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* Actual Live stream of posts */}
      <div className="flex-1 overflow-y-auto max-h-[180px] space-y-3.5 pr-1 no-scrollbar">
        {comments.length === 0 ? (
          <div className="h-20 flex flex-col items-center justify-center text-center text-white/30 space-y-1">
            <span className="text-[10px] font-mono tracking-widest uppercase">No comments yet</span>
            <span className="text-[10px] font-sans font-light">Be the first to leave a memory.</span>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 text-xs bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
              <img
                src={comment.userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                alt={comment.userName}
                referrerPolicy="no-referrer"
                className="w-6.5 h-6.5 rounded-full object-cover border border-[#d4af37]/30"
              />
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display font-medium text-white tracking-tight text-[11px] truncate pr-2">
                    {comment.userName}
                  </span>
                  <span className="font-mono text-[8px] text-white/35">
                    {comment.createdAt ? comment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
                <p className="text-white/80 leading-relaxed font-sans font-light break-words text-[11px]">
                  {comment.text}
                </p>
              </div>

              {/* Action details if current owner */}
              {currentUser && comment.userId === currentUser.uid && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Posting interaction form inline */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-white/5 flex gap-2">
        {currentUser ? (
          <>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Leave a sweet memory..."
              disabled={isSubmitting}
              className="flex-1 py-2 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/5 focus:border-[#d4af37]/50 text-white placeholder-white/20 text-xs focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputText.trim()}
              className="p-2.5 rounded-xl bg-[#d4af37] text-black hover:bg-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="w-full p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[10px] text-white/40">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#d4af37]/60" /> Authenticate to join guestbook
            </span>
            <span className="font-mono text-[#d4af37] uppercase text-[8px] tracking-wider animate-pulse">🔒 SECURE</span>
          </div>
        )}
      </form>
    </div>
  );
}
