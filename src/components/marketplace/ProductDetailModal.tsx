import React, { useState } from "react";
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Heart,
  Share2,
  ShieldCheck,
  Star,
  Flag,
  Check,
  Sparkles,
} from "lucide-react";
import { AgriProductListing, JobListing } from "../../types";
import { PriceTag } from "./PriceTag";
import { SellerBadge } from "./SellerBadge";
import { PrimaryButton } from "./PrimaryButton";

interface ProductDetailModalProps {
  item: AgriProductListing | JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSendMessage?: (listingId: string, text: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSendMessage,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [reported, setReported] = useState(false);
  const [quickMsg, setQuickMsg] = useState("");
  const [sentMsgSuccess, setSentMsgSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const isProduct = "category" in item;
  const product = isProduct ? (item as AgriProductListing) : null;
  const job = !isProduct ? (item as JobListing) : null;

  const title = item.title;
  const price = isProduct ? product!.price : job!.wageAmount;
  const unit = isProduct
    ? product!.unit
    : job!.paymentType === "daily_wage"
    ? "Günlük Yevmiye"
    : job!.paymentType === "per_donum"
    ? "Dönüm Başı"
    : "Götürü";
  const quantity = isProduct
    ? product!.quantity
    : `${job!.workerCount} Kişilik Ekip • ${job!.estimatedDays} Gün`;
  const location = isProduct
    ? `${product!.locationNeighborhood ? product!.locationNeighborhood + ", " : ""}${product!.locationDistrict} / ${product!.locationCity}`
    : `${job!.locationDistrict} / ${job!.locationCity}`;
  const dateStr = isProduct ? product!.createdAt : job!.createdAt;
  const sellerName = isProduct ? product!.sellerName : job!.employerName;
  const sellerPhone = isProduct ? product!.sellerPhone : job!.employerPhone;
  const verified = isProduct ? product!.verified : true;
  const sellerType = isProduct ? product!.sellerType : "producer";
  const rating = isProduct ? product!.rating : 4.9;
  const description = isProduct ? product!.description : job!.notes;
  const image =
    product?.images?.[0] ||
    (job?.cropType === "hazelnut"
      ? "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=800&q=80"
      : "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80");

  const cleanPhone = (sellerPhone || "05320000000").replace(/\s+/g, "");
  const waPhone = cleanPhone.replace(/[^0-9]/g, "").replace(/^0/, "");

  const handleCall = () => {
    window.open(`tel:${cleanPhone}`, "_self");
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Merhaba ${sellerName}, Karadeniz Tarım Pazarı'ndaki "${title}" ilanınız ile ilgileniyorum. Detayları görüşebilir miyiz?`
    );
    window.open(`https://wa.me/90${waPhone}?text=${msg}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${title} - ${price.toLocaleString("tr-TR")} TL / ${unit} (${location}) - Karadeniz Tarım Pazarı`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsg.trim()) return;
    onSendMessage?.(item.id, quickMsg);
    setSentMsgSuccess(true);
    setQuickMsg("");
    setTimeout(() => setSentMsgSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#0B241D] border-t sm:border border-[#20C878]/30 rounded-t-[24px] sm:rounded-[20px] w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl text-[#F5FFF8] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Floating Controls */}
        <div className="p-3 sm:p-4 border-b border-[#20C878]/20 flex items-center justify-between bg-[#071C17] shrink-0">
          <div className="flex items-center gap-2">
            <SellerBadge verified={verified} type={sellerType} />
            {product?.featured && (
              <span className="text-[10px] font-black text-[#071C17] bg-[#20C878] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Öne Çıkan İlan
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className="w-9 h-9 rounded-full bg-[#10352B] hover:bg-[#164C3B] text-[#8BAF9B] flex items-center justify-center transition-colors"
              title={isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "fill-[#EF5B5B] text-[#EF5B5B]" : ""
                }`}
              />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-[#10352B] hover:bg-[#164C3B] text-[#8BAF9B] hover:text-[#F5FFF8] flex items-center justify-center transition-colors relative"
              title="İlanı Paylaş"
            >
              {copiedShare ? (
                <Check className="w-4 h-4 text-[#20C878]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#10352B] hover:bg-[#164C3B] text-[#8BAF9B] hover:text-[#F5FFF8] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Hero Visual */}
          <div className="relative w-full h-52 sm:h-64 rounded-[16px] overflow-hidden bg-[#164C3B] border border-[#20C878]/25 shadow-inner">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Price Header */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#F5FFF8] leading-tight">
              {title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <PriceTag amount={price} unit={unit} size="lg" />
              <div className="text-right">
                <span className="text-xs font-semibold text-[#8BAF9B] block">
                  Toplam Miktar
                </span>
                <span className="text-sm font-extrabold text-[#F5FFF8]">
                  {quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Info Row */}
          <div className="flex items-center gap-3 text-xs text-[#8BAF9B] p-3 rounded-[12px] bg-[#10352B] border border-[#20C878]/20 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#C7DDD0]">
              <MapPin className="w-4 h-4 text-[#20C878]" />
              <span>{location}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#C7DDD0]">
              <Calendar className="w-4 h-4 text-[#8BAF9B]" />
              <span>Yayın: {dateStr}</span>
            </span>
            {product?.minOrder && (
              <>
                <span>•</span>
                <span className="text-[#8FE3AE] font-bold">
                  Min. Sipariş: {product.minOrder}
                </span>
              </>
            )}
          </div>

          {/* Seller Profile Card */}
          <div className="p-3.5 rounded-[16px] bg-[#10352B] border border-[#20C878]/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#20C878] to-[#124235] text-[#071C17] font-black text-lg flex items-center justify-center border-2 border-[#20C878]/40 shadow-sm">
                {sellerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-[#F5FFF8]">
                    {sellerName}
                  </h3>
                  {verified && (
                    <ShieldCheck className="w-4 h-4 text-[#20C878]" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8BAF9B] mt-0.5">
                  <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rating.toFixed(1)}</span>
                  </span>
                  <span>•</span>
                  <span>{sellerType === "producer" ? "Yerel Bahçe Üreticisi" : "Tarımsal Kooperatif"}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-[#8FE3AE] bg-[#124235] px-2.5 py-1 rounded-full border border-[#20C878]/30 inline-block">
                Hızlı Yanıt
              </span>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider">
              Ürün & İlan Açıklaması
            </h4>
            <div className="p-4 rounded-[14px] bg-[#10352B]/70 border border-[#20C878]/15 text-sm text-[#C7DDD0] leading-[1.6]">
              {description}
            </div>
          </div>

          {/* In-app Message Quick Input */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider">
              Uygulama İçi Mesaj Gönder
            </h4>
            <form onSubmit={handleSendQuickMessage} className="flex gap-2">
              <input
                type="text"
                value={quickMsg}
                onChange={(e) => setQuickMsg(e.target.value)}
                placeholder="Örn: 5 çuval için yarın görüşebilir miyiz?"
                className="flex-1 bg-[#10352B] border border-[#20C878]/30 rounded-[11px] px-3.5 py-2.5 text-xs text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
              />
              <PrimaryButton
                variant="primary"
                size="sm"
                type="submit"
                disabled={!quickMsg.trim()}
              >
                Gönder
              </PrimaryButton>
            </form>
            {sentMsgSuccess && (
              <p className="text-xs font-bold text-[#20C878]">
                Mesajınız satıcıya iletildi. Mesajlar sekmesinden takip edebilirsiniz.
              </p>
            )}
          </div>

          {/* Report Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setReported(true)}
              disabled={reported}
              className="inline-flex items-center gap-1.5 text-xs text-[#638275] hover:text-[#EF5B5B] transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>
                {reported ? "İlan incelenmek üzere bildirildi" : "Bu ilanı şikayet et / bildir"}
              </span>
            </button>
          </div>
        </div>

        {/* Sticky Contact Bottom Bar */}
        <div className="p-3.5 sm:p-4 border-t border-[#20C878]/25 bg-[#071C17] flex items-center gap-2.5 shrink-0">
          <PrimaryButton
            variant="primary"
            onClick={handleWhatsApp}
            icon={<MessageCircle className="w-4 h-4 fill-[#071C17]" />}
            className="flex-1"
          >
            WhatsApp ile Görüş
          </PrimaryButton>

          <PrimaryButton
            variant="secondary"
            onClick={handleCall}
            icon={<Phone className="w-4 h-4 text-[#20C878]" />}
            className="flex-1"
          >
            Telefonla Ara
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
