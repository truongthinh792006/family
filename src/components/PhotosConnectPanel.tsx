/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cloud, CheckCircle, RefreshCw, LogOut, Disc, LayoutGrid, Info, Link2, Globe, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { User } from 'firebase/auth';

interface PhotosConnectPanelProps {
  user: User | null;
  needsAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isConnecting: boolean;
  googleAlbumsCount: number;
  syncSource: 'local' | 'google';
  setSyncSource: (source: 'local' | 'google') => void;
  onRefreshGoogle: () => void;
  onAddSharedAlbum: (album: any) => void;
}

export default function PhotosConnectPanel({
  user,
  needsAuth,
  onLogin,
  onLogout,
  isConnecting,
  googleAlbumsCount,
  syncSource,
  setSyncSource,
  onRefreshGoogle,
  onAddSharedAlbum,
}: PhotosConnectPanelProps) {
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [sharedAlbumUrl, setSharedAlbumUrl] = useState('');
  const [isSyncingShared, setIsSyncingShared] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  const handleSyncSharedAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedAlbumUrl.trim()) return;
    setIsSyncingShared(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      const res = await fetch('/api/fetch-shared-album', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: sharedAlbumUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể đồng bộ album.');
      }

      onAddSharedAlbum(data);
      setSyncSuccess(true);
      setSharedAlbumUrl('');
      // Auto dismiss success tip after 5 seconds
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err: any) {
      setSyncError(err.message || 'Không thể đồng bộ. Hãy chắc chắn link của bạn là link chia sẻ công khai.');
    } finally {
      setIsSyncingShared(false);
    }
  };

  return (
    <div className="w-full glass-panel-light rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
      {/* Absolute Decorative Glow */}
      <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#d4af37]/5 blur-[120px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
        {/* Left Side: Status / Controls info */}
        <div className="space-y-5 max-w-xl flex-1">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${syncSource === 'google' ? 'bg-green-400' : 'bg-[#d4af37]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${syncSource === 'google' ? 'bg-green-500' : 'bg-[#d4af37]'}`}></span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">SYSTEM INTEGRITY STATUS</span>
          </div>

          <h3 className="font-display text-2xl text-white font-medium tracking-tight">
            Google Photos Cloud Integration
          </h3>

          <p className="text-xs text-white/60 leading-relaxed font-sans font-light">
            Đồng bộ hóa ảnh trực tiếp từ Google Photos của bạn. Ngoài việc đăng nhập bằng Google (đang bị chặn xác minh), bạn hoàn toàn có thể <strong>paster link chia sẻ công khai của Album</strong> để lấy ảnh ngay tức khắc mà không cần đăng nhập.
          </p>

          {/* Quick connection / Scrap form */}
          <div className="pt-3 pb-2 space-y-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> LIÊN KẾT NHANH KHÔNG CẦN ĐĂNG NHẬP (KHUYÊN DÙNG)
            </span>

            <form onSubmit={handleSyncSharedAlbum} className="flex gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Link2 className="h-4 w-4 text-white/30" />
                </div>
                <input
                  type="url"
                  required
                  placeholder="Dán link chia sẻ Album (Ví dụ: https://photos.app.goo.gl/xxx)"
                  value={sharedAlbumUrl}
                  onChange={(e) => setSharedAlbumUrl(e.target.value)}
                  disabled={isSyncingShared}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.09] border border-white/5 focus:border-[#d4af37]/45 text-white placeholder-white/20 text-xs focus:outline-none transition-all font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isSyncingShared}
                className="px-5 py-3 rounded-xl bg-[#d4af37] text-black hover:bg-white transition-all font-mono font-bold text-xs tracking-wider uppercase active:scale-[0.98] disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isSyncingShared ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ĐANG ĐỒNG BỘ...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>KẾT NỐI NGAY</span>
                  </>
                )}
              </button>
            </form>

            {syncError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/15 text-[11px] text-red-400 flex items-start gap-2 max-w-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">{syncError}</span>
              </div>
            )}

            {syncSuccess && (
              <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/15 text-[11px] text-green-400 flex items-start gap-2 max-w-lg">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-light leading-relaxed">Kết nối album thành công! Vui lòng cuộn lên danh sách chuyến đi để xem ảnh mới đồng bộ.</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-white/40 leading-relaxed font-sans">
              Cách lấy link chia sẻ: Trong điện thoại/máy tính của bạn, mở <strong>Google Photos</strong> &rarr; Chọn <strong>Album</strong> muốn đưa lên &rarr; Nhấn <strong>Chia Sẻ (Share)</strong> &rarr; Chọn <strong>Tạo liên kết (Create Link)</strong> và dán vào đây.
            </div>
          </div>

          {/* iOS Style Segmented Pill Selector (Nguồn dữ liệu) */}
          <div className="pt-3 border-t border-white/5 space-y-1.5 max-w-[340px]">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block font-semibold">LỰA CHỌN NGUỒN KHAI THÁC LƯU TRỮ</span>
            <div className="relative p-1 rounded-xl bg-white/[0.02] border border-white/5 flex">
              {/* Local Storage Pill Option */}
              <button
                type="button"
                onClick={() => setSyncSource('local')}
                className={`relative flex-1 py-2 rounded-lg text-[11px] font-sans font-semibold tracking-wide transition-colors duration-350 cursor-pointer ${
                  syncSource === 'local' ? 'text-black z-10' : 'text-white/55 hover:text-white'
                }`}
              >
                {syncSource === 'local' && (
                  <motion.div
                    layoutId="activeSourceTab"
                    className="absolute inset-0 bg-[#d4af37] rounded-lg -z-10 shadow-md"
                    transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
                  />
                )}
                <span>Bộ nhớ local ({googleAlbumsCount ? 'Ngoại tuyến' : 'Tự tạo'})</span>
              </button>

              {/* Google Storage Pill Option */}
              <button
                type="button"
                onClick={() => {
                  if (needsAuth || !user) {
                    onLogin();
                  } else {
                    setSyncSource('google');
                  }
                }}
                className={`relative flex-1 py-2 rounded-lg text-[11px] font-sans font-semibold tracking-wide transition-colors duration-350 cursor-pointer ${
                  syncSource === 'google' ? 'text-black z-10' : 'text-white/55 hover:text-white'
                }`}
              >
                {syncSource === 'google' && (
                  <motion.div
                    layoutId="activeSourceTab"
                    className="absolute inset-0 bg-[#d4af37] rounded-lg -z-10 shadow-md"
                    transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
                  />
                )}
                <span>Google Photos Cloud</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Account Actions Card */}
        <div className="flex-none lg:w-[320px] w-full glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
          {isConnecting ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">CONNECTING...</span>
            </div>
          ) : user ? (
            // Connected Auth user details
            <div className="space-y-4">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt="user profile"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-[#d4af37]/60"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-green-500 border border-black">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="flex flex-col max-w-[180px]">
                  <span className="font-display font-medium text-white text-sm truncate">{user.displayName || 'Travel Collector'}</span>
                  <span className="font-mono text-[8.5px] text-white/40 truncate tracking-wide">{user.email}</span>
                </div>
              </div>

              {/* Stats detail / Sync commands */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/40">CLOUD SYNCHRONIZED</span>
                  <span className="text-green-400 font-bold">{googleAlbumsCount} ALBUM(S)</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onRefreshGoogle}
                    className="flex-1 py-2 px-3 rounded-lg border border-white/5 bg-white/[0.03] text-white/80 hover:bg-white/[0.08] font-mono text-[10px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Refresh Albums"
                  >
                    <RefreshCw className="w-3 h-3" /> REFRESH
                  </button>
                  <button
                    onClick={onLogout}
                    className="py-2 px-3 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-mono text-[10px] transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Needs auth Trigger
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#d4af37] block font-semibold">CỔNG LIÊN KẾT GOOGLE OAUTH</span>
                <span className="font-sans text-[11px] text-white/50 block">Nhận đặc quyền đồng bộ hóa toàn bộ kho lưu trữ khi tài khoản được nhà phát triển thêm là tester.</span>
              </div>

              {/* Official Google Sign-In structure */}
              <button
                onClick={onLogin}
                className="w-full py-3 px-4 rounded-xl bg-white text-black hover:bg-[#d4af37] hover:text-black font-mono text-[11px] font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] cursor-pointer"
              >
                <Disc className="w-4 h-4 text-black animate-pulse" />
                <span>Connect Google Photos</span>
              </button>

              {/* Troubleshooting tip for iframe restriction in AI Studio */}
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] leading-relaxed text-white/75 space-y-1">
                <span className="font-mono text-[9px] text-[#d4af37] tracking-wider uppercase block font-semibold">💡 Mẹo Kết Nối Google Photos:</span>
                <p>
                  Vì trang web đang chạy trong khung bảo mật (iframe) của AI Studio, trình duyệt sẽ <strong>chặn các cửa sổ popup đăng nhập</strong>.
                </p>
                <p className="mt-1">
                  Hãy nhấn biểu tượng <strong>"Mở trong tab mới" (Open in a new tab)</strong> ở góc trên bên phải khung preview để đăng nhập trực tiếp một cách an toàn!
                </p>
              </div>

              <button
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="w-full text-center text-[10px] font-mono tracking-widest text-white/30 hover:text-white/50 transition-colors uppercase pt-1"
              >
                Config Details {showConfigHelp ? '▲' : '▼'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Technical Setup Guideline documentation */}
      {showConfigHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-white/15 text-[11px] font-mono text-white/50 space-y-3 leading-relaxed"
        >
          <div className="flex items-start space-x-2 text-[#d4af37]">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">DEVELOPER CONFIGURATION STEPS:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 ml-1 text-white/40">
            <li>Enable the <span className="text-white">Photos Library API</span> inside your Google Cloud Console.</li>
            <li>Configure OAuth credentials redirect URI: <code className="text-[#d4af37] select-all underline">https://ais-dev-4sdwiwk2xxz2melvr2s4nh-115656399951.asia-east1.run.app/auth/callback</code></li>
            <li>Add environment variables <code className="text-white">GOOGLE_CLIENT_ID</code> and <code className="text-white">GOOGLE_CLIENT_SECRET</code> in the settings tab of AI Studio.</li>
          </ol>
        </motion.div>
      )}
    </div>
  );
}
