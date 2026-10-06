import React, { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle2,
  Sparkles,
  Camera,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { AgriProductListing, AgriCategory } from "../../types";
import { PrimaryButton } from "./PrimaryButton";
import { PriceTag } from "./PriceTag";

interface NewListingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (listing: AgriProductListing) => void;
}

const STOCK_IMAGES: Record<string, string[]> = {
  hazelnut: [
    "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1508061252227-0c3373ab2b93?auto=format&fit=crop&w=600&q=80",
  ],
  tea: [
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
  ],
  corn: [
    "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
  ],
  vegetable: [
    "https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?auto=format&fit=crop&w=600&q=80",
  ],
  fruit: [
    "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=600&q=80",
  ],
  livestock: [
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
  ],
};

const CATEGORY_NAMES: Record<string, string> = {
  hazelnut: "Fındık",
  tea: "Çay",
  corn: "Mısır",
  vegetable: "Sebze",
  fruit: "Meyve",
  livestock: "Hayvancılık & Yayla Ürünleri",
};

const CITIES = ["Rize", "Trabzon", "Giresun", "Ordu", "Samsun", "Artvin"];
const DISTRICTS_MAP: Record<string, string[]> = {
  Rize: ["Merkez", "Çayeli", "Pazar", "Ardeşen", "Fındıklı", "İkizdere", "Güneysu"],
  Trabzon: ["Merkez", "Akçaabat", "Of", "Sürmene", "Vakfıkebir", "Araklı"],
  Giresun: ["Merkez", "Bulancak", "Tirebolu", "Görele", "Espiye"],
  Ordu: ["Altınordu", "Ünye", "Fatsa", "Perşembe"],
  Samsun: ["İlkadım", "Çarşamba", "Bafra", "Terme"],
  Artvin: ["Merkez", "Hopa", "Borçka", "Arhavi"],
};

export const NewListingWizardModal: React.FC<NewListingWizardModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form Fields
  const [category, setCategory] = useState<AgriCategory>("hazelnut");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState<string>("");
  const [unit, setUnit] = useState<string>("kg");
  const [quantity, setQuantity] = useState<string>("");
  const [minOrder, setMinOrder] = useState<string>("");

  const [city, setCity] = useState("Rize");
  const [district, setDistrict] = useState("Çayeli");
  const [neighborhood, setNeighborhood] = useState("");

  const [selectedImage, setSelectedImage] = useState<string>(
    STOCK_IMAGES.hazelnut[0]
  );
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [sellerName, setSellerName] = useState("Ahmet Kavalcı");
  const [sellerPhone, setSellerPhone] = useState("0532 411 28 53");
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);
  const [callingHours, setCallingHours] = useState("08:00 - 20:00 arası");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update default image when category changes
  const handleCategoryChange = (cat: AgriCategory) => {
    setCategory(cat);
    if (STOCK_IMAGES[cat] && STOCK_IMAGES[cat].length > 0) {
      setSelectedImage(STOCK_IMAGES[cat][0]);
    }
  };

  if (!isOpen) return null;

  // Validation per step
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!title.trim()) {
        setErrorMessage("Lütfen ilanınız için açıklayıcı bir başlık yazın.");
        return false;
      }
      if (title.length < 5) {
        setErrorMessage("İlan başlığı en az 5 karakter olmalıdır.");
        return false;
      }
      if (!description.trim()) {
        setErrorMessage("Lütfen ürün hakkında kısa bir açıklama ekleyin.");
        return false;
      }
    } else if (step === 2) {
      const numPrice = Number(price);
      if (!price || isNaN(numPrice) || numPrice <= 0) {
        setErrorMessage("Lütfen geçerli ve net bir fiyat girin. 'Görüşülür' kabul edilmez.");
        return false;
      }
      if (!quantity.trim()) {
        setErrorMessage("Lütfen mevcut toplam miktarı belirtin (Örn: 500 kg, 20 çuval).");
        return false;
      }
    } else if (step === 3) {
      if (!city || !district) {
        setErrorMessage("Lütfen il ve ilçe seçiniz.");
        return false;
      }
    } else if (step === 5) {
      if (!sellerName.trim()) {
        setErrorMessage("Lütfen ad ve soyadınızı belirtin.");
        return false;
      }
      if (!sellerPhone.trim() || sellerPhone.length < 10) {
        setErrorMessage("Lütfen geçerli bir telefon numarası girin.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((s) => s + 1);
      }
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinalPublish = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(5)) {
      return;
    }

    const newListing: AgriProductListing = {
      id: `prod-user-${Date.now()}`,
      title: title.trim(),
      category: category as AgriProductListing["category"],
      categoryLabel: CATEGORY_NAMES[category] || "Tarımsal Ürün",
      price: Number(price),
      unit: unit,
      quantity: quantity.trim(),
      locationCity: city,
      locationDistrict: district,
      locationNeighborhood: neighborhood.trim() || undefined,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerType: "producer",
      verified: true,
      rating: 5.0,
      reviewCount: 1,
      images: [selectedImage],
      description: description.trim(),
      harvestYear: 2026,
      createdAt: "Yeni",
      featured: false,
      minOrder: minOrder.trim() || undefined,
    };

    onPublish(newListing);
    onClose();
  };

  const stepTitles = [
    "Ürün Bilgileri",
    "Miktar ve Fiyat",
    "Konum Seçimi",
    "Görsel / Fotoğraf",
    "İletişim Tercihleri",
    "Önizleme & Yayınla",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#0B241D] border-t sm:border border-[#20C878]/30 rounded-t-[24px] sm:rounded-[20px] w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl text-[#F5FFF8] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Step Progress */}
        <div className="p-4 border-b border-[#20C878]/20 bg-[#071C17] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#20C878] uppercase tracking-wider">
              Adım {currentStep} / {totalSteps} • {stepTitles[currentStep - 1]}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#10352B] hover:bg-[#164C3B] text-[#8BAF9B] hover:text-[#F5FFF8] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#10352B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#20C878] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {errorMessage && (
            <div className="p-3 rounded-[12px] bg-[#EF5B5B]/15 border border-[#EF5B5B]/40 text-[#EF5B5B] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Ürün / İlan Bilgileri */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-2">
                  1. Ürün Kategorisi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "hazelnut", label: "Fındık", emoji: "🌰" },
                    { id: "tea", label: "Çay", emoji: "🍃" },
                    { id: "corn", label: "Mısır", emoji: "🌽" },
                    { id: "vegetable", label: "Sebze", emoji: "🥬" },
                    { id: "fruit", label: "Meyve", emoji: "🍎" },
                    { id: "livestock", label: "Hayvancılık", emoji: "🍯" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id as AgriCategory)}
                      className={`p-2.5 rounded-[12px] text-xs font-bold text-center border transition-all ${
                        category === cat.id
                          ? "bg-[#20C878] text-[#071C17] border-[#20C878] font-black"
                          : "bg-[#10352B] text-[#C7DDD0] border-[#20C878]/20 hover:border-[#20C878]/40"
                      }`}
                    >
                      <span className="text-lg block mb-1">{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  2. İlan Başlığı
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Kabuklu Fındık (Yeni Sezon %52 Randımanlı)"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  3. Ürün Açıklaması
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ürünün kalitesi, hasat durumu, teslimat koşulları hakkında detaylı bilgi verin..."
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Miktar ve Fiyat */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-[14px] bg-[#124235] border border-[#20C878]/25 text-xs text-[#8FE3AE] leading-relaxed">
                <span className="font-bold text-[#F5FFF8]">Şeffaf Fiyatlandırma Kuralı:</span> Alıcıların güvenini sağlamak için net bir birim fiyatı belirtilmelidir.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                    Birim Fiyat (TL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2200"
                      className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 pr-10 text-base font-extrabold text-[#F59E0B] focus:outline-hidden focus:border-[#20C878]"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-[#8BAF9B]">
                      TL
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                    Fiyat Birimi
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm font-semibold text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878]"
                  >
                    <option value="kg">kg başına</option>
                    <option value="50 kg">50 kg çuval</option>
                    <option value="ton">Ton başına</option>
                    <option value="bağ">Bağ / Demet</option>
                    <option value="kasa">Kasa</option>
                    <option value="adet">Adet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Toplam Mevcut Miktar
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Örn: 2.500 kg (50 çuval) veya 40 kasa"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Minimum Satış / Sipariş (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="Örn: 1 Çuval (50 kg)"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Konum */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  İl
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setCity(newCity);
                    const dList = DISTRICTS_MAP[newCity] || ["Merkez"];
                    setDistrict(dList[0]);
                  }}
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm font-semibold text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878]"
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
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm font-semibold text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878]"
                >
                  {(DISTRICTS_MAP[city] || ["Merkez"]).map((d) => (
                    <option key={d} value={d} className="bg-[#0B241D] text-[#F5FFF8]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Mahalle / Köy / Mevki (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Örn: Kaptanpaşa Köyü, Yayla Mevkii"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Fotoğraf Seçimi */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-2">
                  Hazır Tarımsal Görsellerden Seçin
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(STOCK_IMAGES[category] || STOCK_IMAGES.hazelnut).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-28 rounded-[12px] overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImage === img
                          ? "border-[#20C878] ring-2 ring-[#20C878]/30 scale-[1.02]"
                          : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt="Örnek görsel"
                        className="w-full h-full object-cover"
                      />
                      {selectedImage === img && (
                        <div className="absolute top-1.5 right-1.5 bg-[#20C878] text-[#071C17] p-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Veya Kendi Görsel Bağlantınızı Ekleyin
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-2.5 text-xs text-[#F5FFF8] placeholder-[#638275] focus:outline-hidden"
                  />
                  <PrimaryButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (customImageUrl) setSelectedImage(customImageUrl);
                    }}
                  >
                    Kullan
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: İletişim Tercihleri */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Adınız ve Soyadınız
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Ahmet Kavalcı"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Telefon Numaranız
                </label>
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="0532 411 28 53"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] focus:outline-hidden focus:border-[#20C878]"
                />
              </div>

              <div className="p-3.5 rounded-[12px] bg-[#10352B] border border-[#20C878]/25 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#F5FFF8]">
                    WhatsApp ile İletişime İzin Ver
                  </div>
                  <div className="text-xs text-[#8BAF9B]">
                    Alıcılar doğrudan WhatsApp mesajı başlatabilir
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowWhatsApp}
                  onChange={(e) => setAllowWhatsApp(e.target.checked)}
                  className="w-5 h-5 rounded-md text-[#20C878] accent-[#20C878] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#8FE3AE] uppercase tracking-wider block mb-1.5">
                  Telefonla Arama Saatleri
                </label>
                <input
                  type="text"
                  value={callingHours}
                  onChange={(e) => setCallingHours(e.target.value)}
                  placeholder="08:00 - 20:00 arası"
                  className="w-full bg-[#10352B] border border-[#20C878]/30 rounded-[12px] p-3 text-sm text-[#F5FFF8] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Önizleme ve Yayınlama */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-[14px] bg-[#124235] border border-[#20C878]/30 text-xs text-[#8FE3AE]">
                Lütfen ilanın yayınlanmadan önceki son halini kontrol edin. Yayınlandıktan sonra tüm Karadeniz Tarım Pazarı alıcılarına açık olacaktır.
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-[16px] bg-[#10352B] border border-[#20C878]/35 space-y-3">
                <div className="flex gap-3">
                  <img
                    src={selectedImage}
                    alt={title}
                    className="w-20 h-20 rounded-[12px] object-cover shrink-0 border border-[#20C878]/25"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#8FE3AE] bg-[#124235] px-2 py-0.5 rounded-full inline-block mb-1">
                      {CATEGORY_NAMES[category]}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#F5FFF8] line-clamp-2">
                      {title}
                    </h4>
                    <p className="text-xs text-[#8BAF9B] mt-0.5">
                      {district}, {city}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#20C878]/15 flex items-center justify-between">
                  <PriceTag amount={Number(price) || 0} unit={unit} size="md" />
                  <span className="text-xs font-bold text-[#F5FFF8]">
                    Miktar: {quantity}
                  </span>
                </div>

                <p className="text-xs text-[#C7DDD0] line-clamp-2 italic">
                  "{description}"
                </p>

                <div className="text-xs text-[#8BAF9B] pt-1">
                  Satıcı: <strong className="text-[#F5FFF8]">{sellerName}</strong> ({sellerPhone})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-[#20C878]/20 bg-[#071C17] flex items-center justify-between gap-3 shrink-0">
          {currentStep > 1 ? (
            <PrimaryButton
              variant="outline"
              onClick={handleBack}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Geri
            </PrimaryButton>
          ) : (
            <PrimaryButton variant="outline" onClick={onClose}>
              Vazgeç
            </PrimaryButton>
          )}

          {currentStep < totalSteps ? (
            <PrimaryButton
              variant="primary"
              onClick={handleNext}
              icon={<ChevronRight className="w-4 h-4 stroke-[3]" />}
            >
              Devam Et
            </PrimaryButton>
          ) : (
            <PrimaryButton
              variant="primary"
              onClick={handleFinalPublish}
              icon={<Sparkles className="w-4 h-4" />}
              className="bg-gradient-to-r from-[#20C878] to-[#29D17F]"
            >
              İlanı Yayınla
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};
