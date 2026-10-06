import React, { useState, useRef, useEffect } from "react";
import { UserRole, UserAccount, FarmingFocus } from "../types";
import {
  Smartphone,
  Maximize2,
  Moon,
  Sun,
  ShieldCheck,
  Shield,
  Users,
  ChevronDown,
  User,
  UserCheck,
  LogIn,
  LogOut,
  Check,
} from "lucide-react";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenPrivacy: () => void;
  userName: string;
  currentUser?: UserAccount | null;
  farmingFocus?: FarmingFocus;
  onOpenUserSettings?: () => void;
  onOpenAuthModal?: () => void;
  onOpenAdminModal?: () => void;
  onLogout?: () => void;
  onOpenAndroidModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  isDark,
  onToggleTheme,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenPrivacy,
  userName,
  currentUser,
  farmingFocus = "both",
  onOpenUserSettings,
  onOpenAuthModal,
  onOpenAdminModal,
  onLogout,
  onOpenAndroidModal,
}) => {
  const isAdmin = currentUser?.role === "admin";

  return (
    <header
      id="app-header"
      className={`border-b sticky top-0 z-40 transition-colors duration-200 pt-safe backdrop-blur-md w-full max-w-full overflow-x-hidden ${
        isDark
          ? "bg-[#081711]/95 border-emerald-900/40 text-emerald-50"
          : "bg-[#064e3b] text-white border-emerald-700/80 shadow-sm"
      }`}
    >
      <div
        className={`mx-auto px-2.5 sm:px-4 lg:px-6 transition-all duration-300 w-full max-w-full ${
          isMobileFrame ? "max-w-md" : "max-w-5xl"
        }`}
      >
        {/* TOP STATUS & UTILITY CONTROLS BAR (Uygulamanın En Başı) */}
        <div className="flex items-center justify-between py-1 border-b border-white/10 gap-1 text-xs">
          {/* Sol: Kullanıcı Profili & Admin Rozeti */}
          <div className="flex items-center gap-1.5 min-w-0">
            {currentUser ? (
              <button
                id="header-user-profile-button"
                onClick={onOpenUserSettings}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-xl border text-xs transition-all cursor-pointer truncate ${
                  isDark
                    ? "bg-emerald-900/50 hover:bg-emerald-900/80 border-emerald-800/70 text-emerald-100 shadow-2xs"
                    : "bg-emerald-800/70 hover:bg-emerald-800 border-emerald-600/70 text-white shadow-2xs"
                }`}
                title="Kullanıcı Ayarları ve Profil"
              >
                <div className="w-4.5 h-4.5 rounded-lg bg-emerald-500/25 flex items-center justify-center text-emerald-300 font-bold text-[10px] shrink-0">
                  <UserCheck className="w-3 h-3" />
                </div>
                <span className="font-bold text-[11px] truncate max-w-[85px] sm:max-w-[140px]">
                  {currentUser.username === "kağan" ? "👑 kağan" : currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[10px] opacity-80 hidden sm:inline">
                  {farmingFocus === "tea" ? "(🍃 Çay)" : farmingFocus === "hazelnut" ? "(🌰 Fındık)" : "(🌾 Çay & Fındık)"}
                </span>
              </button>
            ) : (
              <button
                id="header-login-button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#032014] font-bold text-xs transition-all cursor-pointer shadow-sm shrink-0"
              >
                <LogIn className="w-3 h-3" />
                <span>Giriş Yap</span>
              </button>
            )}

            {currentUser && isAdmin && (
              <span className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Admin</span>
              </span>
            )}
          </div>

          {/* Sağ: Eylem Butonları & Hızlı Kontroller (Admin Paneli, Çıkış, Çerçeve, Tema, Gizlilik) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Admin Kontrol Butonu */}
            {currentUser?.role === "admin" && onOpenAdminModal && (
              <button
                id="header-admin-modal-btn"
                type="button"
                onClick={onOpenAdminModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all cursor-pointer shadow-xs border border-amber-300/80 shrink-0"
                title="Yönetici Paneli (Tüm Sistem & Üye Yönetimi)"
              >
                <Shield className="w-3 h-3 fill-slate-950 text-slate-950" />
                <span className="hidden sm:inline">Panel</span>
              </button>
            )}

            {/* Oturumu Kapat */}
            {currentUser && onLogout && (
              <button
                id="header-logout-btn"
                type="button"
                onClick={onLogout}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
                  isDark
                    ? "bg-red-950/40 hover:bg-red-900/60 border-red-800/50 text-red-300"
                    : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                }`}
                title="Çıkış Yap"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            )}

            {/* Android Uygulama & APK */}
            {onOpenAndroidModal && (
              <button
                id="header-android-btn"
                type="button"
                onClick={onOpenAndroidModal}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
                  isDark
                    ? "bg-emerald-900/60 hover:bg-emerald-800/80 border-emerald-700 text-emerald-200"
                    : "bg-emerald-800/80 hover:bg-emerald-800 border-emerald-600 text-white"
                }`}
                title="Tarım Cepte Android Uygulamasını Aç / APK İndir"
              >
                <Smartphone className="w-3 h-3 text-emerald-300" />
                <span className="hidden sm:inline">Android</span>
              </button>
            )}

            {/* Frame view toggle */}
            <button
              id="view-toggle-button"
              onClick={onToggleMobileFrame}
              className={`hidden md:flex w-6.5 h-6.5 rounded-xl border items-center justify-center transition-all cursor-pointer shrink-0 ${
                isDark
                  ? "bg-emerald-950/50 border-emerald-800/50 hover:bg-emerald-900/60 text-emerald-300"
                  : "bg-emerald-700/50 border-emerald-600/60 hover:bg-emerald-700 text-white"
              }`}
              title={isMobileFrame ? "Geniş Ekrana Geç" : "Mobil Uygulama Çerçevesine Geç"}
            >
              {isMobileFrame ? <Maximize2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
            </button>

            {/* Tema Değiştir */}
            <button
              id="theme-toggle-button"
              onClick={onToggleTheme}
              className={`w-6.5 h-6.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isDark
                  ? "bg-emerald-950/50 border-emerald-800/50 hover:bg-emerald-900/60 text-amber-300"
                  : "bg-emerald-700/50 border-emerald-600/60 hover:bg-emerald-700 text-amber-200"
              }`}
              title={isDark ? "Açık Yeşil Moduna Geç" : "Koyu Yeşil Moduna Geç"}
            >
              {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>

            {/* Gizlilik */}
            <button
              id="privacy-button"
              onClick={onOpenPrivacy}
              className={`w-6.5 h-6.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isDark
                  ? "bg-emerald-950/50 border-emerald-800/50 hover:bg-emerald-900/60 text-emerald-300"
                  : "bg-emerald-700/50 border-emerald-600/60 hover:bg-emerald-700 text-white"
              }`}
              title="Gizlilik ve Veri Güvenliği"
            >
              <ShieldCheck className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ANA MARKA VE LOGO BÖLÜMÜ (Brand Bar) */}
        <div className="py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-950/30 p-1.5 border border-emerald-300/30 shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full text-[#031d13]"
              >
                <path d="M12 2L9 7l3 2 3-2-3-5z" fill="#ecfdf5" stroke="none" />
                <path d="M7 8l5 3 5-3-2 5-3 2-3-2-2-5z" fill="#a7f3d0" stroke="none" />
                <path d="M6 14l6 3 6-3-2 5-4 2-4-2-2-5z" fill="#34d399" stroke="none" />
                <path d="M12 2v20" stroke="#064e3b" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1 leading-none">
                  Tarım Cepte
                </span>
                <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/25 shrink-0">
                  2026 Sezonu
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] sm:text-[11px] text-emerald-200/85 font-medium leading-none truncate">
                  Çay & Fındık Üretici Portalı
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-xl bg-emerald-950/40 text-emerald-200 border border-emerald-800/40 shadow-xs">
              {farmingFocus === "tea" ? "🍃 Sadece Çay" : farmingFocus === "hazelnut" ? "🌰 Sadece Fındık" : "🌾 Çay & Fındık"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
