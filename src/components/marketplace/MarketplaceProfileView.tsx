import React from "react";
import {
  User,
  ShieldCheck,
  FileText,
  Heart,
  Sprout,
  Coins,
  Bot,
  BookOpen,
  Settings,
  ChevronRight,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { UserRole } from "../../types";

interface MarketplaceProfileViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  userName: string;
  userPhone: string;
  onNavigateTab: (tab: string) => void;
  onOpenMyListings: () => void;
  onOpenFavorites: () => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  favoriteCount?: number;
  myListingsCount?: number;
  className?: string;
}

export const MarketplaceProfileView: React.FC<MarketplaceProfileViewProps> = ({
  currentRole,
  onRoleChange,
  userName,
  userPhone,
  onNavigateTab,
  onOpenMyListings,
  onOpenFavorites,
  onOpenPrivacy,
  onOpenSettings,
  favoriteCount = 0,
  myListingsCount = 0,
  className = "",
}) => {
  const roleLabels: Record<UserRole, string> = {
    employer: "İşveren (Bahçe Sahibi)",
    crew_leader: "Ekip Lideri (Çavuş)",
    worker: "Bireysel Hasat İşçisi",
    service_provider: "Tarımsal Hizmet Sağlayıcı",
    admin: "Sistem Yöneticisi",
  };

  return (
    <div className={`space-y-4 max-w-xl mx-auto ${className}`}>
      {/* Profile Header Card */}
      <div className="p-4 sm:p-5 rounded-[18px] bg-gradient-to-br from-[#10352B] to-[#0B241D] border border-[#20C878]/30 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#20C878] to-[#124235] text-[#071C17] font-black text-xl flex items-center justify-center border-2 border-[#20C878]/50 shadow-md">
            {userName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black text-[#F5FFF8]">
                {userName}
              </h2>
              <ShieldCheck className="w-4 h-4 text-[#20C878]" />
            </div>
            <p className="text-xs text-[#8FE3AE] font-semibold">
              {roleLabels[currentRole]}
            </p>
            <p className="text-[11px] text-[#8BAF9B] mt-0.5">
              {userPhone} • Karadeniz Bölgesi
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats: My Listings & Favorites */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenMyListings}
          className="p-3.5 rounded-[16px] bg-[#10352B] hover:bg-[#124235] border border-[#20C878]/25 text-left transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#8BAF9B]">İlanlarım</span>
            <FileText className="w-4 h-4 text-[#20C878]" />
          </div>
          <div className="text-xl font-black text-[#F5FFF8]">{myListingsCount}</div>
          <span className="text-[10px] text-[#8FE3AE]">Yayında olan ilanlar</span>
        </button>

        <button
          type="button"
          onClick={onOpenFavorites}
          className="p-3.5 rounded-[16px] bg-[#10352B] hover:bg-[#124235] border border-[#20C878]/25 text-left transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#8BAF9B]">Favorilerim</span>
            <Heart className="w-4 h-4 text-[#EF5B5B] fill-[#EF5B5B]" />
          </div>
          <div className="text-xl font-black text-[#F5FFF8]">{favoriteCount}</div>
          <span className="text-[10px] text-[#8FE3AE]">Kaydedilen ürünler</span>
        </button>
      </div>

      {/* Üretici Takip Modülleri */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block px-1">
          Bahçe & Üretici Takip Modülleri
        </span>

        <div className="rounded-[16px] bg-[#10352B] border border-[#20C878]/20 overflow-hidden divide-y divide-[#20C878]/15">
          <button
            type="button"
            onClick={() => onNavigateTab("home_overview")}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#124235] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#164C3B] flex items-center justify-center text-[#20C878]">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#F5FFF8]">
                  Hasat & Bahçe Takibi
                </div>
                <div className="text-xs text-[#8BAF9B]">
                  Yaş çay & fındık teslimatları, masraflar ve kantar fişleri
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BAF9B]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("receivables")}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#124235] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#164C3B] flex items-center justify-center text-[#F59E0B]">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#F5FFF8]">
                  Alacak & Tahsilat Takibi
                </div>
                <div className="text-xs text-[#8BAF9B]">
                  ÇAYKUR & özel fabrika alacakları, vadeli ödeme günleri
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BAF9B]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("assistant")}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#124235] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#164C3B] flex items-center justify-center text-[#20C878]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#F5FFF8]">
                  Tarım Cepte AI Asistanı
                </div>
                <div className="text-xs text-[#8BAF9B]">
                  Hastalık, külleme, gübreleme ve budama danışmanı
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BAF9B]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("guide")}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#124235] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#164C3B] flex items-center justify-center text-[#8FE3AE]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#F5FFF8]">
                  Karadeniz Tarım Rehberi
                </div>
                <div className="text-xs text-[#8BAF9B]">
                  Aylık bahçe bakım takvimi ve çavuş rezervasyon zamanları
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BAF9B]" />
          </button>
        </div>
      </div>

      {/* Hesap Ayarları & Gizlilik */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block px-1">
          Uygulama & Güvenlik
        </span>

        <div className="rounded-[16px] bg-[#10352B] border border-[#20C878]/20 overflow-hidden divide-y divide-[#20C878]/15">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#124235] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#8BAF9B]" />
              <span className="font-bold text-sm text-[#F5FFF8]">
                Borsa & Stopaj Kesinti Oranları
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BAF9B]" />
          </button>

          <button
            type="button"
            onClick={onOpenPrivacy}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#124235] transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#20C878]" />
              <span className="font-bold text-sm text-[#F5FFF8]">
                Gizlilik ve Veri Şeffaflığı
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8BAF9B]" />
          </button>
        </div>
      </div>
    </div>
  );
};
