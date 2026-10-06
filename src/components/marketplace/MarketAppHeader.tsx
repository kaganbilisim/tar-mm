import React, { useState } from "react";
import { Bell, User, Sparkles, ChevronDown, Check, ShieldCheck, X } from "lucide-react";
import { UserRole } from "../../types";

interface MarketAppHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  userName?: string;
  unreadNotificationsCount?: number;
  onOpenProfile?: () => void;
  onOpenPrivacy?: () => void;
  className?: string;
}

export const MarketAppHeader: React.FC<MarketAppHeaderProps> = ({
  currentRole,
  onRoleChange,
  userName = "Ahmet Kavalcı",
  unreadNotificationsCount = 2,
  onOpenProfile,
  onOpenPrivacy,
  className = "",
}) => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);

  const roleTitles: Record<UserRole, { title: string; desc: string }> = {
    employer: {
      title: "İşveren (Bahçe Sahibi)",
      desc: "Hasat, Alacak & Ürün/İş İlanı Veren",
    },
    crew_leader: {
      title: "Ekip Lideri (Çavuş)",
      desc: "Grup Başvurusu & Ekip Yönetimi",
    },
    worker: {
      title: "Bireysel İşçi",
      desc: "Yevmiyeli Hasat & Budama İşçisi",
    },
    service_provider: {
      title: "Tarım Hizmeti Sağlayıcı",
      desc: "Budama, İlaçlama & Toprak Analizi",
    },
    admin: {
      title: "Yönetici (Admin)",
      desc: "İlan, Başvuru & Sistem Yönetimi",
    },
  };

  return (
    <header
      id="market-header"
      className={`bg-[#071C17]/95 backdrop-blur-md border-b border-[#20C878]/20 sticky top-0 z-40 pt-safe text-[#F5FFF8] transition-all ${className}`}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Emblem + App Name + Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Emblem: Hazelnut & Tea Leaf */}
          <div className="w-10 h-10 rounded-[13px] bg-gradient-to-br from-[#20C878] to-[#124235] p-2 flex items-center justify-center shadow-sm shadow-[#20C878]/25 border border-[#20C878]/40 shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#071C17"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              {/* Stylized leaf & fruit */}
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-[#F5FFF8] tracking-tight leading-tight truncate">
                Karadeniz Tarım Pazarı
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#124235] text-[#20C878] border border-[#20C878]/30">
                Pazar Yeri
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#8BAF9B] truncate leading-tight font-medium">
              Yakınındaki üreticileri keşfet
            </p>
          </div>
        </div>

        {/* Right Controls: Notifications & Profile/Role */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications Button with unread indicator */}
          <button
            type="button"
            onClick={() => setNotifModalOpen(true)}
            className="relative w-10 h-10 rounded-[12px] bg-[#10352B] hover:bg-[#124235] border border-[#20C878]/25 text-[#C7DDD0] hover:text-[#F5FFF8] flex items-center justify-center transition-colors cursor-pointer"
            title="Bildirimler"
            aria-label="Bildirimler"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#F59E0B] ring-2 ring-[#071C17] animate-pulse" />
            )}
          </button>

          {/* Profile / Role Selector Button */}
          <button
            type="button"
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-2 h-10 px-2.5 sm:px-3 rounded-[12px] bg-[#10352B] hover:bg-[#124235] border border-[#20C878]/25 text-[#F5FFF8] text-xs font-bold transition-all cursor-pointer"
            title="Kullanıcı Rolü ve Profil"
          >
            <div className="w-6 h-6 rounded-full bg-[#20C878] text-[#071C17] font-black text-xs flex items-center justify-center shrink-0">
              {userName.charAt(0)}
            </div>
            <span className="hidden md:inline-block truncate max-w-[100px]">
              {roleTitles[currentRole]?.title.split(" ")[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8BAF9B]" />
          </button>
        </div>
      </div>

      {/* Role Selection Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0B241D] border border-[#20C878]/30 rounded-[20px] w-full max-w-sm p-4 sm:p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#20C878]/20">
              <h3 className="font-extrabold text-base text-[#F5FFF8]">
                Aktif Kullanıcı Rolü
              </h3>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#10352B] flex items-center justify-center text-[#8BAF9B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8BAF9B]">
              Uygulamada gerçekleştirmek istediğin faaliyete göre rolünü dilediğin an değiştirebilirsin:
            </p>

            <div className="space-y-2">
              {(Object.keys(roleTitles) as UserRole[]).map((r) => {
                const isSelected = currentRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onRoleChange(r);
                      setRoleModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-[14px] text-left transition-all border flex items-center justify-between ${
                      isSelected
                        ? "bg-[#124235] border-[#20C878] text-[#F5FFF8]"
                        : "bg-[#10352B] border-[#20C878]/15 hover:border-[#20C878]/35 text-[#C7DDD0]"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#F5FFF8]">
                        {roleTitles[r].title}
                      </div>
                      <div className="text-xs text-[#8BAF9B]">
                        {roleTitles[r].desc}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-[#20C878] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {onOpenPrivacy && (
              <div className="pt-2 border-t border-[#20C878]/15">
                <button
                  type="button"
                  onClick={() => {
                    setRoleModalOpen(false);
                    onOpenPrivacy();
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-[#8BAF9B] hover:text-[#20C878]"
                >
                  Gizlilik & Veri Şeffaflığı Politikası
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {notifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0B241D] border border-[#20C878]/30 rounded-[20px] w-full max-w-sm p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#20C878]/20">
              <h3 className="font-extrabold text-base text-[#F5FFF8]">
                Bildirimler
              </h3>
              <button
                type="button"
                onClick={() => setNotifModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#10352B] flex items-center justify-center text-[#8BAF9B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              <div className="p-3 rounded-[12px] bg-[#10352B] border border-[#20C878]/25 text-xs space-y-1">
                <div className="font-bold text-[#F5FFF8] flex items-center justify-between">
                  <span>Yeni Mesaj: Mustafa Çakır</span>
                  <span className="text-[10px] text-[#20C878] font-bold">Yeni</span>
                </div>
                <p className="text-[#8BAF9B]">
                  "Merhaba, 10 çuval fındık için yarın Çarşamba merkezde teslimat yapabiliriz."
                </p>
              </div>

              <div className="p-3 rounded-[12px] bg-[#10352B] border border-[#20C878]/15 text-xs space-y-1">
                <div className="font-bold text-[#F5FFF8]">
                  Fiyat Güncellemesi: ÇAYKUR & TMO
                </div>
                <p className="text-[#8BAF9B]">
                  2026 Sezonu yaş çay ve Giresun kalite fındık referans taban fiyatları sisteme işlendi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotifModalOpen(false)}
              className="w-full py-2.5 rounded-[11px] bg-[#164C3B] hover:bg-[#1B5C48] text-[#F5FFF8] font-bold text-xs"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
