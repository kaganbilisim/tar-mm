import React from "react";
import { PlusCircle, FileText, Heart } from "lucide-react";

interface QuickActionsProps {
  onOpenNewListing: () => void;
  onOpenMyListings: () => void;
  onOpenFavorites: () => void;
  favoriteCount?: number;
  myListingsCount?: number;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenNewListing,
  onOpenMyListings,
  onOpenFavorites,
  favoriteCount = 0,
  myListingsCount = 0,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 ${className}`}>
      {/* 1. Primary Highlight Action: İlan Ver */}
      <button
        type="button"
        onClick={onOpenNewListing}
        className="group relative flex items-center justify-between p-3.5 rounded-[16px] bg-gradient-to-r from-[#20C878] to-[#29D17F] text-[#071C17] shadow-sm shadow-[#20C878]/25 hover:shadow-md hover:shadow-[#20C878]/35 transition-all duration-150 cursor-pointer text-left min-h-[56px] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#071C17]/15 flex items-center justify-center shrink-0">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black leading-tight text-[#071C17] truncate">
              İlan Ver
            </div>
            <div className="text-[11px] font-bold text-[#071C17]/80 truncate">
              Ürün veya hasat ilanı aç
            </div>
          </div>
        </div>
      </button>

      {/* 2. Secondary Action: İlanlarım */}
      <button
        type="button"
        onClick={onOpenMyListings}
        className="group relative flex items-center justify-between p-3.5 rounded-[16px] bg-[#10352B] hover:bg-[#124235] text-[#F5FFF8] border border-[#20C878]/25 hover:border-[#20C878]/45 transition-all duration-150 cursor-pointer text-left min-h-[56px] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#164C3B] flex items-center justify-center shrink-0 text-[#20C878]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight text-[#F5FFF8] truncate">
              İlanlarım
            </div>
            <div className="text-[11px] font-semibold text-[#8BAF9B] truncate">
              {myListingsCount > 0 ? `${myListingsCount} aktif ilan` : "Yayındaki ilanların"}
            </div>
          </div>
        </div>
      </button>

      {/* 3. Third Action: Favorilerim */}
      <button
        type="button"
        onClick={onOpenFavorites}
        className="group relative flex items-center justify-between p-3.5 rounded-[16px] bg-[#10352B] hover:bg-[#124235] text-[#F5FFF8] border border-[#20C878]/25 hover:border-[#20C878]/45 transition-all duration-150 cursor-pointer text-left min-h-[56px] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#164C3B] flex items-center justify-center shrink-0 text-[#F59E0B]">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight text-[#F5FFF8] truncate">
              Favorilerim
            </div>
            <div className="text-[11px] font-semibold text-[#8BAF9B] truncate">
              {favoriteCount > 0 ? `${favoriteCount} kayıtlı ilan` : "Kaydettiğin ürünler"}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};
