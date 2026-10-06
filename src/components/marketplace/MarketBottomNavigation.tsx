import React from "react";
import { Home, Compass, Plus, MessageSquare, User } from "lucide-react";

export type MarketNavTab = "home" | "explore" | "new_listing" | "messages" | "profile";

interface MarketBottomNavigationProps {
  activeTab: MarketNavTab;
  onTabChange: (tab: MarketNavTab) => void;
  unreadMessagesCount?: number;
  className?: string;
}

export const MarketBottomNavigation: React.FC<MarketBottomNavigationProps> = ({
  activeTab,
  onTabChange,
  unreadMessagesCount = 0,
  className = "",
}) => {
  return (
    <nav
      id="market-bottom-nav"
      aria-label="Pazar Yeri Alt Gezinme"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#071C17]/95 backdrop-blur-md border-t border-[#20C878]/25 pb-safe text-[#F5FFF8] shadow-lg ${className}`}
    >
      <div className="max-w-md mx-auto px-3 py-1 flex items-center justify-around relative">
        {/* 1. Ana Sayfa */}
        <button
          type="button"
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors cursor-pointer select-none ${
            activeTab === "home" ? "text-[#20C878]" : "text-[#8BAF9B] hover:text-[#C7DDD0]"
          }`}
          aria-label="Ana Sayfa"
        >
          <Home className={`w-5 h-5 ${activeTab === "home" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[11px] font-bold mt-1 tracking-tight">Ana Sayfa</span>
        </button>

        {/* 2. Keşfet */}
        <button
          type="button"
          onClick={() => onTabChange("explore")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors cursor-pointer select-none ${
            activeTab === "explore" ? "text-[#20C878]" : "text-[#8BAF9B] hover:text-[#C7DDD0]"
          }`}
          aria-label="Keşfet"
        >
          <Compass className={`w-5 h-5 ${activeTab === "explore" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[11px] font-bold mt-1 tracking-tight">Keşfet</span>
        </button>

        {/* 3. Center Prominent Action: İlan Ver */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onTabChange("new_listing")}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#20C878] to-[#29D17F] text-[#071C17] flex items-center justify-center shadow-lg shadow-[#20C878]/35 ring-4 ring-[#071C17] active:scale-95 transition-transform cursor-pointer"
            title="Yeni İlan Ver"
            aria-label="Yeni İlan Ver"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
          <span className="text-[10px] font-black text-[#20C878] mt-0.5 tracking-tight">
            İlan Ver
          </span>
        </div>

        {/* 4. Mesajlar */}
        <button
          type="button"
          onClick={() => onTabChange("messages")}
          className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors cursor-pointer select-none ${
            activeTab === "messages" ? "text-[#20C878]" : "text-[#8BAF9B] hover:text-[#C7DDD0]"
          }`}
          aria-label="Mesajlar"
        >
          <div className="relative">
            <MessageSquare
              className={`w-5 h-5 ${activeTab === "messages" ? "stroke-[2.5]" : "stroke-2"}`}
            />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#F59E0B] text-[#071C17] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold mt-1 tracking-tight">Mesajlar</span>
        </button>

        {/* 5. Profil */}
        <button
          type="button"
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 transition-colors cursor-pointer select-none ${
            activeTab === "profile" ? "text-[#20C878]" : "text-[#8BAF9B] hover:text-[#C7DDD0]"
          }`}
          aria-label="Profil"
        >
          <User className={`w-5 h-5 ${activeTab === "profile" ? "stroke-[2.5]" : "stroke-2"}`} />
          <span className="text-[11px] font-bold mt-1 tracking-tight">Profil</span>
        </button>
      </div>
    </nav>
  );
};
