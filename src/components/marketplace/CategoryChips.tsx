import React from "react";
import { AgriCategory } from "../../types";

interface CategoryOption {
  id: AgriCategory;
  label: string;
  emoji?: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Tümü", emoji: "🌱" },
  { id: "hazelnut", label: "Fındık", emoji: "🌰" },
  { id: "tea", label: "Çay", emoji: "🍃" },
  { id: "corn", label: "Mısır", emoji: "🌽" },
  { id: "vegetable", label: "Sebze", emoji: "🥬" },
  { id: "fruit", label: "Meyve", emoji: "🍎" },
  { id: "livestock", label: "Hayvancılık", emoji: "🍯" },
  { id: "labor", label: "Hasat & İşçilik", emoji: "👥" },
];

interface CategoryChipsProps {
  selectedCategory: AgriCategory;
  onSelectCategory: (category: AgriCategory) => void;
  className?: string;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth ${className}`}
      role="tablist"
      aria-label="Kategori Seçenekleri"
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectCategory(cat.id)}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              isSelected
                ? "bg-[#20C878] text-[#071C17] border-[#20C878] shadow-sm shadow-[#20C878]/30 font-extrabold"
                : "bg-[#10352B] text-[#C7DDD0] border-[#20C878]/25 hover:border-[#20C878]/50 hover:bg-[#124235] hover:text-[#F5FFF8]"
            }`}
          >
            {cat.emoji && <span className="text-sm leading-none">{cat.emoji}</span>}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
