import React from "react";
import { SearchX, RotateCcw } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Aramana uygun ilan bulunamadı",
  description = "Farklı bir arama terimi deneyebilir veya filtreleri temizleyerek tüm ilanları listeleyebilirsin.",
  onClearFilters,
  actionText = "Filtreleri Temizle",
}) => {
  return (
    <div className="bg-[#10352B] border border-[#20C878]/20 rounded-[16px] p-6 sm:p-8 text-center my-4">
      <div className="w-14 h-14 rounded-full bg-[#124235] border border-[#20C878]/30 flex items-center justify-center mx-auto mb-3 text-[#20C878]">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#F5FFF8] mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#8BAF9B] max-w-sm mx-auto leading-relaxed mb-4">
        {description}
      </p>
      {onClearFilters && (
        <PrimaryButton
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          {actionText}
        </PrimaryButton>
      )}
    </div>
  );
};
