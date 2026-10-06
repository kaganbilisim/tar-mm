import React from "react";
import {
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  Heart,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AgriProductListing, JobListing } from "../../types";
import { PriceTag } from "./PriceTag";
import { SellerBadge } from "./SellerBadge";

interface ListingCardProps {
  product?: AgriProductListing;
  job?: JobListing;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onViewDetails: (item: AgriProductListing | JobListing) => void;
  onCallSeller?: (phone: string) => void;
  onWhatsAppSeller?: (phone: string, title: string) => void;
  className?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  product,
  job,
  isFavorite = false,
  onToggleFavorite,
  onViewDetails,
  onCallSeller,
  onWhatsAppSeller,
  className = "",
}) => {
  // Normalize fields between AgriProductListing and JobListing
  const isProduct = Boolean(product);
  const id = product ? product.id : job!.id;
  const title = product ? product.title : job!.title;
  const price = product ? product.price : job!.wageAmount;
  const unit = product
    ? product.unit
    : job!.paymentType === "daily_wage"
    ? "Günlük Yevmiye"
    : job!.paymentType === "per_donum"
    ? "Dönüm Başı"
    : "Götürü";
  const quantity = product
    ? product.quantity
    : `${job!.workerCount} Kişilik Ekip • ${job!.estimatedDays} Gün`;
  const location = product
    ? `${product.locationDistrict} / ${product.locationCity}`
    : `${job!.locationDistrict} / ${job!.locationCity}`;
  const dateStr = product ? product.createdAt : job!.createdAt;
  const sellerName = product ? product.sellerName : job!.employerName;
  const sellerPhone = product ? product.sellerPhone : job!.employerPhone;
  const verified = product ? product.verified : true;
  const sellerType = product ? product.sellerType : "producer";
  const image =
    product?.images?.[0] ||
    (job?.cropType === "hazelnut"
      ? "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80"
      : "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80");

  const cleanPhone = (sellerPhone || "05320000000").replace(/\s+/g, "");
  const waPhone = cleanPhone.replace(/[^0-9]/g, "").replace(/^0/, "");

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCallSeller) {
      onCallSeller(cleanPhone);
    } else {
      window.open(`tel:${cleanPhone}`, "_self");
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWhatsAppSeller) {
      onWhatsAppSeller(cleanPhone, title);
    } else {
      const msg = encodeURIComponent(
        `Merhaba ${sellerName}, Karadeniz Tarım Pazarı'ndaki "${title}" ilanınız hakkında görüşmek istiyorum.`
      );
      window.open(`https://wa.me/90${waPhone}?text=${msg}`, "_blank");
    }
  };

  return (
    <article
      onClick={() => onViewDetails(product || job!)}
      className={`group relative bg-[#10352B] hover:bg-[#124235] border border-[#20C878]/20 hover:border-[#20C878]/40 rounded-[16px] p-3.5 sm:p-4.5 transition-all duration-200 cursor-pointer shadow-xs flex flex-col justify-between gap-3 text-left ${className}`}
    >
      {/* Top Section: Visual / Badges / Title / Favorite */}
      <div>
        <div className="flex items-start gap-3">
          {/* Visual Thumbnail */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[13px] overflow-hidden bg-[#164C3B] shrink-0 border border-[#20C878]/25">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {product?.featured && (
              <span className="absolute bottom-1 left-1 bg-[#20C878] text-[#071C17] text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> Öne Çıkan
              </span>
            )}
            {!isProduct && (
              <span className="absolute bottom-1 left-1 bg-[#F59E0B] text-[#071C17] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                İş İlanı
              </span>
            )}
          </div>

          {/* Details & Title */}
          <div className="flex-1 min-w-0">
            {/* Top row: Category/Seller type and Favorite */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <SellerBadge verified={verified} type={sellerType} />
              <button
                type="button"
                onClick={handleFavoriteClick}
                className="w-8 h-8 rounded-full bg-[#164C3B]/80 hover:bg-[#164C3B] flex items-center justify-center text-[#8BAF9B] hover:text-[#EF5B5B] transition-colors shrink-0"
                title={isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                aria-label="Favori"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "fill-[#EF5B5B] text-[#EF5B5B]" : ""
                  }`}
                />
              </button>
            </div>

            {/* Product Title (Natural 2-line wrap, no awkward clipping) */}
            <h3 className="font-extrabold text-[15px] sm:text-[16px] text-[#F5FFF8] leading-snug line-clamp-2 mb-1.5">
              {title}
            </h3>

            {/* Location & Freshness */}
            <div className="flex items-center gap-2.5 text-xs text-[#8BAF9B] flex-wrap">
              <span className="inline-flex items-center gap-1 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#20C878]" />
                <span className="truncate max-w-[150px]">{location}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#8BAF9B]" />
                <span>{dateStr}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mid Row: Price & Quantity Box */}
        <div className="mt-3 pt-3 border-t border-[#20C878]/15 flex items-center justify-between gap-2 flex-wrap bg-[#0B241D]/40 -mx-1 px-3 py-2 rounded-[12px]">
          <div>
            <span className="text-[10px] font-bold text-[#8BAF9B] uppercase tracking-wider block">
              {isProduct ? "Birim Fiyat" : "Ödeme / Ücret"}
            </span>
            <PriceTag amount={price} unit={unit} size="md" />
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#8BAF9B] uppercase tracking-wider block">
              {isProduct ? "Mevcut Miktar" : "Kadro & Süre"}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#F5FFF8]">
              {quantity}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar (Ergonomic Touch Targets min 44px) */}
      <div className="flex items-center gap-2 pt-1">
        {/* Secondary: Details */}
        <button
          type="button"
          onClick={() => onViewDetails(product || job!)}
          className="flex-1 min-h-[44px] px-3 rounded-[11px] bg-[#164C3B] hover:bg-[#1B5C48] text-[#F5FFF8] text-xs font-bold flex items-center justify-center gap-1 border border-[#20C878]/25 transition-colors cursor-pointer"
        >
          <span>Detayları Gör</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8FE3AE]" />
        </button>

        {/* Primary Contact: WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="min-h-[44px] px-3.5 rounded-[11px] bg-[#20C878] hover:bg-[#29D17F] text-[#071C17] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm shadow-[#20C878]/20 transition-all cursor-pointer"
          title="WhatsApp İletişim"
        >
          <MessageCircle className="w-4 h-4 fill-[#071C17]" />
          <span>WhatsApp</span>
        </button>

        {/* Direct Call Button (min 44x44px) */}
        <button
          type="button"
          onClick={handleCall}
          className="min-h-[44px] min-w-[44px] px-3 rounded-[11px] bg-[#10352B] hover:bg-[#164C3B] border border-[#20C878]/30 text-[#20C878] flex items-center justify-center transition-colors cursor-pointer"
          title={`Ara: ${sellerPhone}`}
          aria-label={`Ara: ${sellerPhone}`}
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
