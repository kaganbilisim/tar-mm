import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onOpenFilter: () => void;
  activeFilterCount?: number;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onOpenFilter,
  activeFilterCount = 0,
  placeholder = "Ürün, ilçe veya üretici ara...",
  className = "",
}) => {
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {/* Input Container */}
      <div className="relative flex-1 flex items-center min-h-[48px] bg-[#10352B] border border-[#20C878]/30 rounded-[14px] px-3.5 focus-within:border-[#20C878] focus-within:ring-2 focus-within:ring-[#20C878]/20 transition-all duration-150">
        <Search className="w-5 h-5 text-[#8BAF9B] shrink-0 mr-2.5" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden py-2"
          aria-label="Arama"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1 rounded-full hover:bg-[#164C3B] text-[#8BAF9B] hover:text-[#F5FFF8] transition-colors"
            title="Aramayı Temizle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        type="button"
        onClick={onOpenFilter}
        className={`relative min-h-[48px] min-w-[48px] px-3 rounded-[14px] flex items-center justify-center transition-all duration-150 cursor-pointer border ${
          activeFilterCount > 0
            ? "bg-[#124235] text-[#20C878] border-[#20C878] shadow-sm shadow-[#20C878]/20 font-bold"
            : "bg-[#10352B] text-[#C7DDD0] border-[#20C878]/25 hover:border-[#20C878]/50 hover:bg-[#124235]"
        }`}
        title="Filtrele ve Sırala"
        aria-label="Filtrele ve Sırala"
      >
        <SlidersHorizontal className="w-5 h-5" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#20C878] text-[#071C17] font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#071C17]">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};
