import React, { useState } from "react";
import { X, Check, RotateCcw } from "lucide-react";
import { AgriCategory } from "../../types";
import { PrimaryButton } from "./PrimaryButton";

export interface FilterState {
  category: AgriCategory;
  city: string;
  district: string;
  minPrice: string;
  maxPrice: string;
  sellerType: "all" | "producer" | "merchant" | "cooperative";
  verifiedOnly: boolean;
  sortBy: "newest" | "price_asc" | "price_desc" | "rating";
}

interface FilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResultsCount?: number;
}

const CITIES = ["Tümü", "Rize", "Trabzon", "Giresun", "Ordu", "Samsun", "Artvin"];

const DISTRICTS_BY_CITY: Record<string, string[]> = {
  Rize: ["Tümü", "Merkez", "Çayeli", "Pazar", "Ardeşen", "Fındıklı", "İkizdere", "Güneysu", "Kalkandere"],
  Trabzon: ["Tümü", "Merkez", "Akçaabat", "Of", "Sürmene", "Vakfıkebir", "Araklı", "Yomra", "Maçka"],
  Giresun: ["Tümü", "Merkez", "Bulancak", "Tirebolu", "Görele", "Espiye", "Keşap"],
  Ordu: ["Tümü", "Altınordu", "Ünye", "Fatsa", "Perşembe", "Gölköy"],
  Samsun: ["Tümü", "İlkadım", "Çarşamba", "Bafra", "Terme", "Tekkeköy"],
  Artvin: ["Tümü", "Merkez", "Hopa", "Borçka", "Arhavi", "Yusufeli"],
};

export const FilterSheetModal: React.FC<FilterSheetModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalResultsCount = 0,
}) => {
  const [draft, setDraft] = useState<FilterState>(filters);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const currentDistricts = DISTRICTS_BY_CITY[draft.city] || ["Tümü"];

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#0B241D] border-t sm:border border-[#20C878]/30 rounded-t-[24px] sm:rounded-[20px] w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl text-[#F5FFF8] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#20C878]/20 flex items-center justify-between shrink-0">
          <div>
            <h2 id="filter-modal-title" className="text-lg font-black text-[#F5FFF8]">
              Filtrele & Sırala
            </h2>
            <p className="text-xs text-[#8BAF9B]">
              Aramayı Karadeniz bölgesine göre özelleştir
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#10352B] hover:bg-[#164C3B] text-[#8BAF9B] hover:text-[#F5FFF8] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">
          {/* 1. Sıralama */}
          <div>
            <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-2">
              Sıralama Ölçütü
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "newest", label: "En Yeni İlanlar" },
                { id: "rating", label: "En Yüksek Puanlı" },
                { id: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
                { id: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
              ].map((sort) => {
                const isSelected = draft.sortBy === sort.id;
                return (
                  <button
                    key={sort.id}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        sortBy: sort.id as FilterState["sortBy"],
                      }))
                    }
                    className={`py-2 px-3 rounded-[11px] text-xs font-bold text-left transition-all border ${
                      isSelected
                        ? "bg-[#20C878] text-[#071C17] border-[#20C878] font-black"
                        : "bg-[#10352B] text-[#C7DDD0] border-[#20C878]/20 hover:border-[#20C878]/40"
                    }`}
                  >
                    {sort.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. İl & İlçe Seçimi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                Şehir / İl
              </label>
              <select
                value={draft.city}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    city: e.target.value,
                    district: "Tümü",
                  }))
                }
                className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-2.5 text-sm font-semibold text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0B241D] text-[#F5FFF8]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                İlçe
              </label>
              <select
                value={draft.district}
                disabled={draft.city === "Tümü"}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, district: e.target.value }))
                }
                className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-2.5 text-sm font-semibold text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878] disabled:opacity-50"
              >
                {currentDistricts.map((d) => (
                  <option key={d} value={d} className="bg-[#0B241D] text-[#F5FFF8]">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Fiyat Aralığı */}
          <div>
            <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
              Fiyat Aralığı (TL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min TL"
                value={draft.minPrice}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, minPrice: e.target.value }))
                }
                className="w-1/2 bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-2.5 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
              />
              <span className="text-[#8BAF9B] font-bold">-</span>
              <input
                type="number"
                placeholder="Maks TL"
                value={draft.maxPrice}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, maxPrice: e.target.value }))
                }
                className="w-1/2 bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-2.5 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
              />
            </div>
          </div>

          {/* 4. Satıcı Tipi */}
          <div>
            <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-2">
              Satıcı Tipi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "all", label: "Tümü" },
                { id: "producer", label: "Üretici" },
                { id: "cooperative", label: "Kooperatif" },
              ].map((type) => {
                const isSelected = draft.sellerType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        sellerType: type.id as FilterState["sellerType"],
                      }))
                    }
                    className={`py-2 px-2.5 rounded-[11px] text-xs font-bold transition-all text-center border ${
                      isSelected
                        ? "bg-[#20C878] text-[#071C17] border-[#20C878] font-black"
                        : "bg-[#10352B] text-[#C7DDD0] border-[#20C878]/20"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Doğrulanmış Üretici Toggle */}
          <div className="pt-2 border-t border-[#20C878]/15">
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-[12px] bg-[#10352B] border border-[#20C878]/25 hover:border-[#20C878]/40 transition-colors">
              <div>
                <div className="font-bold text-sm text-[#F5FFF8]">
                  Sadece Doğrulanmış Üreticiler
                </div>
                <div className="text-xs text-[#8BAF9B]">
                  Kimliği ve bahçe tescili onaylı yerel üreticiler
                </div>
              </div>
              <input
                type="checkbox"
                checked={draft.verifiedOnly}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, verifiedOnly: e.target.checked }))
                }
                className="w-5 h-5 rounded-md text-[#20C878] accent-[#20C878] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#20C878]/20 bg-[#071C17] flex items-center gap-3 shrink-0">
          <PrimaryButton
            variant="outline"
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
            className="flex-1"
          >
            Temizle
          </PrimaryButton>
          <PrimaryButton
            variant="primary"
            onClick={handleApply}
            icon={<Check className="w-4 h-4 stroke-[3]" />}
            className="flex-2"
          >
            {totalResultsCount > 0 ? `${totalResultsCount} İlanı Göster` : "Uygula"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
