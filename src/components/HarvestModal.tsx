import React, { useState, useEffect, useMemo } from "react";
import {
  HarvestRecord,
  Garden,
  SeasonType,
  FactoryPrice,
  FactoryPaymentOption,
  AppSettings,
  FarmingFocus,
} from "../types";
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Leaf,
  Calendar,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Banknote,
  Clock,
  Info,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface HarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHarvest: (
    harvest: Omit<
      HarvestRecord,
      | "id"
      | "grossAmount"
      | "deductionAmount"
      | "netReceivable"
      | "status"
      | "collectedAmount"
    > & {
      grossAmount?: number;
      deductionAmount?: number;
      netReceivable?: number;
    }
  ) => void;
  gardens: Garden[];
  factories?: FactoryPrice[];
  isDark: boolean;
  settings?: AppSettings;
  farmingFocus?: FarmingFocus;
}

// Fallback factories if list is empty
const DEFAULT_FACTORIES: FactoryPrice[] = [
  {
    id: "f-1",
    factoryName: "ÇAYKUR (Devlet Alımı)",
    crop: "tea",
    basePrice: 35.0,
    supportPayment: 3.5,
    paymentOption: "aylik",
    paymentValues: {
      aylik: "35.00 TL (Ay sonu / 30 gün içinde banka hesabına)",
    },
    customPaymentDetail: "Ay sonu / 30 gün içinde banka hesabına aktarım",
    paymentTerms: "Aylık (30 Gün İçinde)",
    effectiveDate: "2026 Sezonu",
    note: "Kontenjanlı alım, destekleme primi ayrıca ödenir.",
  },
  {
    id: "f-2",
    factoryName: "Doğuş Çay",
    crop: "tea",
    basePrice: 36.5,
    supportPayment: 0,
    paymentOption: "vadeli",
    paymentValues: {
      pesin: "35.50 TL (%60 Kantarda Peşin)",
      vadeli: "37.50 TL (%40 Kalan 45 Gün Vadeli)",
    },
    customPaymentDetail: "Peşin %60, Kalan 45 Gün Vadeli",
    paymentTerms: "Vadeli (Peşin %60 + 45 Gün)",
    effectiveDate: "2026 Sezonu",
    note: "Serbest kota, kantar teslimi.",
  },
  {
    id: "f-3",
    factoryName: "Ofçay (JDE)",
    crop: "tea",
    basePrice: 35.8,
    supportPayment: 0,
    paymentOption: "vadeli",
    paymentValues: {
      aylik: "35.80 TL (30 Gün Vadeli Havale)",
      vadeli: "36.50 TL (60 Gün Vadeli Alım)",
    },
    customPaymentDetail: "30 Gün Vadeli Havale",
    paymentTerms: "Vadeli (30 Gün)",
    effectiveDate: "2026 Sezonu",
    note: "Kaliteli taze 2.5 yaprak alımı.",
  },
  {
    id: "f-4",
    factoryName: "Lipton / Ekoterra",
    crop: "tea",
    basePrice: 37.0,
    supportPayment: 0,
    paymentOption: "haftalik",
    paymentValues: {
      haftalik: "37.00 TL (Her Cuma haftalık teslimat ödemesi)",
    },
    customPaymentDetail: "Her Cuma haftalık teslimat ödemesi",
    paymentTerms: "Haftalık (Her Cuma)",
    effectiveDate: "2026 Sezonu",
    note: "Sürdürülebilir çay tarımı sertifikalı bahçeler.",
  },
  {
    id: "f-5",
    factoryName: "TMO Fındık Taban Fiyatı (Giresun Kalite)",
    crop: "hazelnut",
    basePrice: 195.0,
    supportPayment: 5.0,
    paymentOption: "aylik",
    paymentValues: {
      aylik: "195.00 TL (21 Gün içinde Ziraat Bankası)",
    },
    customPaymentDetail: "21 Gün içinde Ziraat Bankası",
    paymentTerms: "Aylık (21 Gün İçinde)",
    effectiveDate: "2026 Sezonu",
    note: "50 Randıman esasına göre alım yapılır.",
  },
  {
    id: "f-6",
    factoryName: "Ferrero Fındık Alımı",
    crop: "hazelnut",
    basePrice: 205.0,
    supportPayment: 0,
    paymentOption: "haftalik",
    paymentValues: {
      pesin: "198.00 TL (Kantarda Peşin)",
      haftalik: "205.00 TL (Haftalık Havale)",
    },
    customPaymentDetail: "Kantarda teslimden sonra Cuma günü havale",
    paymentTerms: "Haftalık Havale",
    effectiveDate: "2026 Sezonu",
    note: "Net randımanlı sağlam fındık alımı.",
  },
];

// Akıllı Fiyat Ayrıştırıcı: Ek Ödeme Koşuluna girilen metinden veya değerden birim fiyatı tespit eder
export const parsePriceFromCondition = (
  text: string | undefined | null,
  basePrice: number = 35
): number | null => {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();

  // 1. Baştaki + veya - göreceli fiyat farkları (örn: "+2.00 TL", "+1.5", "-1.00 TL")
  const plusMatch = trimmed.match(/^\+\s*(\d+(?:[.,]\d+)?)/);
  if (plusMatch && plusMatch[1]) {
    const diff = parseFloat(plusMatch[1].replace(",", "."));
    if (!isNaN(diff)) return Number((basePrice + diff).toFixed(2));
  }

  const minusMatch = trimmed.match(/^-\s*(\d+(?:[.,]\d+)?)/);
  if (minusMatch && minusMatch[1]) {
    const diff = parseFloat(minusMatch[1].replace(",", "."));
    if (!isNaN(diff)) return Number(Math.max(0, basePrice - diff).toFixed(2));
  }

  // 2. "TL", "₺", "/KG", "tl", "kg" ibaresiyle biten tutar (örn: "38.50 TL", "38.50 TL/KG", "38,50 ₺")
  const tlMatch = trimmed.match(/(\d+(?:[.,]\d+)?)\s*(?:TL|₺|\/KG|\/kg)/i);
  if (tlMatch && tlMatch[1]) {
    const parsed = parseFloat(tlMatch[1].replace(",", "."));
    if (!isNaN(parsed) && parsed > 0 && parsed < 10000) {
      return Number(parsed.toFixed(2));
    }
  }

  // 3. Metin içindeki herhangi bir sayı (örn: "38.50", "39", "205.00")
  const numMatch = trimmed.match(/(?:^|[^\d.,])(\d+(?:[.,]\d+)?)(?:$|[^\d.,])/);
  if (numMatch && numMatch[1]) {
    const parsed = parseFloat(numMatch[1].replace(",", "."));
    if (!isNaN(parsed) && parsed > 0 && parsed < 10000) {
      return Number(parsed.toFixed(2));
    }
  }

  return null;
};

// Standart Ödeme Koşulları Yapılandırması
export const PAYMENT_OPTION_CONFIGS: {
  key: FactoryPaymentOption;
  title: string;
  icon: any;
  badge: string;
}[] = [
  {
    key: "pesin",
    title: "Peşin Ödeme",
    icon: Zap,
    badge: "Aynı Gün",
  },
  {
    key: "haftalik",
    title: "Haftalık Ödeme",
    icon: Clock,
    badge: "+7 Gün Vade",
  },
  {
    key: "aylik",
    title: "Aylık Ödeme",
    icon: Calendar,
    badge: "+30 Gün Vade",
  },
  {
    key: "vadeli",
    title: "Vadeli Ödeme",
    icon: Banknote,
    badge: "+45 Gün Vade",
  },
  {
    key: "diger",
    title: "Ek Ödeme Koşulu",
    icon: FileText,
    badge: "Özel Fiyat & Şart",
  },
];

// Bir ödeme koşuluna fabrikada veya kullanıcı tarafından değer girilip girilmediğini tespit eden fonksiyon
export const getOptionEnteredValue = (
  optKey: FactoryPaymentOption,
  factory: FactoryPrice | undefined,
  customDetail?: string
): string | undefined => {
  if (optKey === "diger") {
    const fromCustom = customDetail?.trim();
    if (fromCustom) return fromCustom;
    const fromFactoryDiger = factory?.paymentValues?.diger?.trim();
    if (fromFactoryDiger) return fromFactoryDiger;
    if (factory?.paymentOption === "diger" && factory?.customPaymentDetail?.trim()) {
      return factory.customPaymentDetail.trim();
    }
    return undefined;
  }

  if (!factory) return undefined;

  const fromPv = factory.paymentValues?.[optKey]?.trim();
  if (fromPv) return fromPv;

  // Fabrika varsayılanı bu seçenek ise ve özel şart tanımlanmışsa
  if (factory.paymentOption === optKey) {
    const detail = factory.customPaymentDetail?.trim() || factory.paymentTerms?.trim();
    if (detail) return detail;
  }

  return undefined;
};

// Smart Due Date Calculator helper
const calculateDueDate = (
  baseDate: string,
  option?: FactoryPaymentOption | string
): string => {
  if (!baseDate) return "";
  const d = new Date(baseDate);
  if (isNaN(d.getTime())) return baseDate;

  if (option === "pesin") {
    // Same day for cash
    return baseDate;
  } else if (option === "haftalik") {
    d.setDate(d.getDate() + 7);
  } else if (option === "aylik") {
    d.setDate(d.getDate() + 30);
  } else if (option === "vadeli") {
    d.setDate(d.getDate() + 45);
  } else {
    d.setDate(d.getDate() + 30);
  }
  return d.toISOString().split("T")[0];
};

export const HarvestModal: React.FC<HarvestModalProps> = ({
  isOpen,
  onClose,
  onSaveHarvest,
  gardens,
  factories = [],
  isDark,
  settings,
  farmingFocus = "both",
}) => {
  const initialCrop = farmingFocus === "hazelnut" ? "hazelnut" : "tea";
  const [quantityKg, setQuantityKg] = useState<string>("1000");
  const [buyerName, setBuyerName] = useState<string>(
    initialCrop === "hazelnut" ? "TMO Fındık Taban Fiyatı" : "ÇAYKUR (Devlet Alımı)"
  );
  const [unitPriceGross, setUnitPriceGross] = useState<string>(
    initialCrop === "hazelnut" ? "195.00" : "35.00"
  );
  const [cropType, setCropType] = useState<"tea" | "hazelnut">(initialCrop);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [season, setSeason] = useState<SeasonType>("season_1");
  const [gardenId, setGardenId] = useState<string>(gardens[0]?.id || "");
  const [dueDate, setDueDate] = useState<string>("2026-06-30");
  const [receiptNote, setReceiptNote] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanFeedback, setScanFeedback] = useState<string>("");

  const initialDeductionPct =
    settings?.autoApplyDeduction !== false
      ? (settings?.borsaTescilRate ?? 1.0) + (settings?.stopajRate ?? 1.0)
      : 0;
  const [customDeductionPct, setCustomDeductionPct] = useState<string>(
    String(initialDeductionPct)
  );

  useEffect(() => {
    if (isOpen) {
      const pct =
        settings?.autoApplyDeduction !== false
          ? (settings?.borsaTescilRate ?? 1.0) + (settings?.stopajRate ?? 1.0)
          : 0;
      setCustomDeductionPct(String(pct));

      // Lock cropType strictly if user has specific farmingFocus
      if (farmingFocus === "tea") {
        setCropType("tea");
        const teaFactory = allFactories.find((f) => f.crop === "tea");
        if (teaFactory) handleSelectFactory(teaFactory);
      } else if (farmingFocus === "hazelnut") {
        setCropType("hazelnut");
        const hazelnutFactory = allFactories.find((f) => f.crop === "hazelnut");
        if (hazelnutFactory) handleSelectFactory(hazelnutFactory);
      }
    }
  }, [isOpen, settings, farmingFocus]);

  // Ödeme Seçeneği & Koşulları State'leri (Değer girilmemişse undefined)
  const [selectedPaymentOption, setSelectedPaymentOption] =
    useState<FactoryPaymentOption | undefined>("aylik");
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>(
    "35.00 TL (Ay sonu / 30 gün içinde banka hesabına)"
  );
  const [customPaymentDetail, setCustomPaymentDetail] = useState<string>("");

  // Tüm fabrikalar (prop veya varsayılanlar)
  const allFactories = useMemo(() => {
    return factories && factories.length > 0 ? factories : DEFAULT_FACTORIES;
  }, [factories]);

  // Filtrelenmiş Bahçeler (Mahsul tipine göre)
  const filteredGardens = useMemo(() => {
    const matched = gardens.filter((g) => g.cropType === cropType);
    return matched.length > 0 ? matched : gardens;
  }, [gardens, cropType]);

  // Mahsule göre filtrelenmiş fabrikalar
  const cropFactories = useMemo(() => {
    return allFactories.filter((f) => f.crop === cropType);
  }, [allFactories, cropType]);

  // Seçilen Fabrika Objesini Tespit Etme
  const selectedFactory = useMemo(() => {
    const bNameLower = buyerName.toLowerCase().trim();
    if (!bNameLower) return undefined;

    // 1. Exact or near match in cropFactories
    const exact = cropFactories.find((f) => {
      const fNameLower = f.factoryName.toLowerCase().trim();
      return (
        fNameLower === bNameLower ||
        bNameLower.includes(fNameLower) ||
        fNameLower.includes(bNameLower)
      );
    });
    if (exact) return exact;

    // 2. Exact match in allFactories
    return allFactories.find((f) => {
      const fNameLower = f.factoryName.toLowerCase().trim();
      return (
        fNameLower === bNameLower ||
        bNameLower.includes(fNameLower) ||
        fNameLower.includes(bNameLower)
      );
    });
  }, [cropFactories, allFactories, buyerName]);

  // Yalnızca uygulanacak ödeme koşuluna değer girilmiş olan seçenekler
  const availablePaymentOptions = useMemo(() => {
    return PAYMENT_OPTION_CONFIGS.map((cfg) => {
      const enteredVal = getOptionEnteredValue(cfg.key, selectedFactory, customPaymentDetail);
      return {
        ...cfg,
        enteredValue: enteredVal,
      };
    }).filter((item) => !!item.enteredValue && item.enteredValue.trim().length > 0);
  }, [selectedFactory, customPaymentDetail]);

  // Ödeme Seçenekleri & Alım Şartları'na girilen güncel aktif değer / koşul
  const activeEnteredValue = useMemo(() => {
    if (!selectedPaymentOption) return "";
    return (
      getOptionEnteredValue(selectedPaymentOption, selectedFactory, customPaymentDetail) ||
      ""
    );
  }, [selectedPaymentOption, customPaymentDetail, selectedFactory]);

  // Değer girilmemiş ise seçimi sıfırla, değer girilmiş ise uygun koşulu seç
  useEffect(() => {
    if (!isOpen) return;

    if (availablePaymentOptions.length > 0) {
      const isCurrentValid = availablePaymentOptions.some((o) => o.key === selectedPaymentOption);
      if (!isCurrentValid) {
        const preferred =
          availablePaymentOptions.find((o) => o.key === selectedFactory?.paymentOption) ||
          availablePaymentOptions[0];
        setSelectedPaymentOption(preferred.key);
        setSelectedPaymentTerms(preferred.enteredValue || preferred.title);
        const targetPrice = getOptionPrice(preferred.key, selectedFactory, preferred.enteredValue);
        if (targetPrice > 0) {
          setUnitPriceGross(targetPrice.toFixed(2));
        }
        setDueDate(calculateDueDate(date, preferred.key));
      }
    } else {
      // Uygulanacak Ödeme Koşuluna değer girilmemiş ise seçim yapılmasın
      setSelectedPaymentOption(undefined);
      setSelectedPaymentTerms("");
      if (selectedFactory && selectedFactory.basePrice > 0) {
        setUnitPriceGross(selectedFactory.basePrice.toFixed(2));
      }
    }
  }, [isOpen, selectedFactory?.id, buyerName, availablePaymentOptions.length]);

  // Otomatik sezon ve vade tespiti (Tarih değiştiğinde)
  useEffect(() => {
    if (!date) return;
    const parts = date.split("-");
    if (parts.length > 1) {
      const month = parseInt(parts[1], 10);
      if (month <= 6) setSeason("season_1");
      else if (month === 7) setSeason("season_2");
      else if (month === 8 || month === 9) setSeason("season_3");
      else setSeason("season_4");
    }

    // Tarihe göre vadeyi de güncelle
    const calculatedDue = calculateDueDate(date, selectedPaymentOption);
    setDueDate(calculatedDue);
  }, [date, selectedPaymentOption]);

  // Seçilen ödeme seçeneğine göre birim fiyatı tespit etme
  const getOptionPrice = (
    opt: FactoryPaymentOption,
    factory: FactoryPrice | undefined,
    customText?: string
  ): number => {
    // 1. Ek Ödeme Koşulu ("diger") için girilen değeri veya fabrika ek şartını çözümle
    if (opt === "diger") {
      const textToParse = customText !== undefined ? customText : customPaymentDetail;
      if (textToParse) {
        const parsed = parsePriceFromCondition(textToParse, factory?.basePrice);
        if (parsed !== null && parsed > 0) return parsed;
      }
      if (factory?.paymentValues?.diger) {
        const parsed = parsePriceFromCondition(factory.paymentValues.diger, factory?.basePrice);
        if (parsed !== null && parsed > 0) return parsed;
      }
      if (factory?.customPaymentDetail) {
        const parsed = parsePriceFromCondition(factory.customPaymentDetail, factory?.basePrice);
        if (parsed !== null && parsed > 0) return parsed;
      }
      const base = factory?.basePrice || (cropType === "hazelnut" ? 195.0 : 35.0);
      return factory?.crop === "hazelnut" ? base + 5.0 : Number((base + 1.5).toFixed(2));
    }

    if (!factory) {
      return parseFloat(unitPriceGross) || (cropType === "hazelnut" ? 195.0 : 35.0);
    }

    // 2. customText argümanında fiyat varsa (örn: handleSelectPaymentOption veya factory seçimi)
    if (customText) {
      const parsed = parsePriceFromCondition(customText, factory.basePrice);
      if (parsed !== null && parsed > 0) return parsed;
    }

    // 3. Fabrikanın bu seçeneğe özel tanımlanmış paymentValues metninde fiyat var mı? (ör. "36.50 TL (30 Gün Net Hesap)")
    const valStr = factory.paymentValues?.[opt];
    if (valStr) {
      const parsed = parsePriceFromCondition(valStr, factory.basePrice);
      if (parsed !== null && parsed > 0) return parsed;
    }

    // 4. Fabrikanın varsayılan seçeneği ve customPaymentDetail metninde fiyat var mı?
    if (factory.paymentOption === opt && factory.customPaymentDetail) {
      const parsed = parsePriceFromCondition(factory.customPaymentDetail, factory.basePrice);
      if (parsed !== null && parsed > 0) return parsed;
    }

    // 5. Fabrika taban fiyatı ve piyasa koşulları
    const base = factory.basePrice || (cropType === "hazelnut" ? 195.0 : 35.0);
    if (opt === "vadeli") {
      return factory.crop === "hazelnut" ? base + 4.0 : Number((base + 1.0).toFixed(2));
    }
    if (opt === "pesin") {
      return factory.crop === "hazelnut" ? base - 3.0 : Number((base - 0.5).toFixed(2));
    }
    return base;
  };

  // Ürün türü değiştiğinde varsayılan fabrikayı ve fiyatı güncelle
  const handleCropTypeChange = (newCrop: "tea" | "hazelnut") => {
    setCropType(newCrop);
    const firstFactory = allFactories.find((f) => f.crop === newCrop);
    if (firstFactory) {
      handleSelectFactory(firstFactory);
    } else {
      setSelectedPaymentOption(undefined);
      setSelectedPaymentTerms("");
      setCustomPaymentDetail("");
      setUnitPriceGross(newCrop === "hazelnut" ? "195.00" : "35.00");
    }
  };

  // Fabrika seçildiğinde ödeme koşullarını ve ek ödeme şartını yükle
  const handleSelectFactory = (factory: FactoryPrice) => {
    setBuyerName(factory.factoryName);

    const factoryEkKosul = factory.paymentValues?.diger || factory.customPaymentDetail || "";
    setCustomPaymentDetail(factoryEkKosul);

    // Bu fabrikaya değer girilmiş olan ödeme koşulları
    const validOpts = PAYMENT_OPTION_CONFIGS.map((cfg) => {
      const val = getOptionEnteredValue(cfg.key, factory, factoryEkKosul);
      return { ...cfg, enteredValue: val };
    }).filter((item) => !!item.enteredValue && item.enteredValue.trim().length > 0);

    if (validOpts.length > 0) {
      const preferred =
        validOpts.find((o) => o.key === factory.paymentOption) || validOpts[0];
      setSelectedPaymentOption(preferred.key);
      setSelectedPaymentTerms(preferred.enteredValue || preferred.title);
      const targetPrice = getOptionPrice(preferred.key, factory, preferred.enteredValue);
      if (targetPrice > 0) {
        setUnitPriceGross(targetPrice.toFixed(2));
      }
      setDueDate(calculateDueDate(date, preferred.key));
    } else {
      // Uygulanacak Ödeme Koşuluna değer girilmemiş ise: Seçim yapılmasın
      setSelectedPaymentOption(undefined);
      setSelectedPaymentTerms("");
      if (factory.basePrice > 0) {
        setUnitPriceGross(factory.basePrice.toFixed(2));
      }
      setDueDate(calculateDueDate(date, "aylik"));
    }
  };

  // Ödeme Seçeneği tıklandığında koşulu, fiyatı ve net alacağı otomatik güncelle
  const handleSelectPaymentOption = (
    opt: FactoryPaymentOption,
    termLabel: string,
    specificDetail?: string,
    forcedPrice?: number
  ) => {
    setSelectedPaymentOption(opt);
    setSelectedPaymentTerms(termLabel);
    if (specificDetail && opt === "diger") {
      setCustomPaymentDetail(specificDetail);
    }

    // Uygulanacak tutarı ve Net Tahsil Edilecek Alacağı otomatik hesapla
    const targetPrice =
      forcedPrice !== undefined && forcedPrice > 0
        ? forcedPrice
        : getOptionPrice(opt, selectedFactory, specificDetail);

    if (targetPrice > 0) {
      setUnitPriceGross(targetPrice.toFixed(2));
    }

    // Akıllı Vade Tarihi Hesaplama
    const newDue = calculateDueDate(date, opt);
    setDueDate(newDue);
  };

  // Ek Ödeme Koşulu'na girilen değer veya metin değiştiğinde
  // Net Tahsil Edilecek Alacak'ı doğrudan hesaplayıp çalıştır
  const handleCustomPaymentDetailChange = (val: string) => {
    setCustomPaymentDetail(val);

    if (val.trim()) {
      setSelectedPaymentOption("diger");
      setSelectedPaymentTerms(val.trim());

      const parsedPrice = parsePriceFromCondition(val, selectedFactory?.basePrice);
      if (parsedPrice !== null && parsedPrice > 0) {
        setUnitPriceGross(parsedPrice.toFixed(2));
      }
    }
  };

  if (!isOpen) return null;

  const numKg = parseFloat(quantityKg) || 0;
  const numPrice = parseFloat(unitPriceGross) || 0;
  const grossAmount = numKg * numPrice;
  const parsedDeductionPct = parseFloat(customDeductionPct) || 0;
  const deductionRate = Math.max(0, parsedDeductionPct / 100);
  const deductionAmount = grossAmount * deductionRate;
  const netReceivable = grossAmount - deductionAmount;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleSimulateScan = async (sampleIndex?: number) => {
    setIsScanning(true);
    setScanFeedback("Fiş kantar verileri taranıyor...");
    try {
      const res = await fetch("/api/ai/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleType: sampleIndex ?? Math.floor(Math.random() * 4),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuantityKg(String(data.data.quantityKg));
        setBuyerName(data.data.buyerName);
        setUnitPriceGross(String(data.data.unitPrice));
        setScanFeedback(
          `✓ Fiş başarıyla okundu: ${data.data.quantityKg} KG - ${data.data.buyerName}`
        );

        // Fabrika koşullarını eşleştir
        const matched = allFactories.find((f) =>
          f.factoryName.toLowerCase().includes(data.data.buyerName.toLowerCase())
        );
        if (matched) {
          handleSelectFactory(matched);
        }
      }
    } catch (err) {
      setScanFeedback("Fiş tarama tamamlandı (Örnek değerler aktarıldı)");
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanFeedback(""), 4000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numKg <= 0 || !buyerName.trim() || numPrice <= 0) {
      alert("Lütfen miktar, alıcı firma ve birim fiyatı eksiksiz doldurun.");
      return;
    }

    const selectedGarden = gardens.find((g) => g.id === gardenId);
    const parsedYear = date ? parseInt(date.split("-")[0], 10) : 2026;

    onSaveHarvest({
      date,
      year: isNaN(parsedYear) ? 2026 : parsedYear,
      season,
      gardenId,
      gardenName: selectedGarden ? selectedGarden.name : "Genel Çaylık",
      quantityKg: numKg,
      buyerName: buyerName.trim(),
      unitPriceGross: numPrice,
      grossAmount,
      deductionRate,
      deductionAmount,
      netReceivable,
      dueDate,
      receiptNote: receiptNote.trim() || undefined,
      cropType,
      paymentOption: selectedPaymentOption,
      paymentTerms: selectedPaymentTerms?.trim() || undefined,
      paymentDetail: customPaymentDetail?.trim() || undefined,
    });

    onClose();
  };

  return (
    <div
      id="harvest-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="harvest-modal-card"
        className={`w-full max-w-xl rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden ${
          isDark
            ? "bg-[#0f2119] border-emerald-800 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark
              ? "bg-[#0b1a13] border-emerald-800/60"
              : "bg-emerald-50/70 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">Yeni Hasat Kaydı</h3>
              <p className="text-[11px] opacity-75">
                Alıcı fabrikanın ödeme seçenekleri ve şartlarına göre kaydınızı oluşturun.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Crop Switcher */}
          {farmingFocus === "tea" ? (
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200" : "bg-emerald-50 border-emerald-300 text-emerald-950"}`}>
              <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                <Leaf className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span>🍃 Yaş Çay Hasadı Kaydı</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
                Seçiminiz: Sadece Çay (Fındık Devre Dışı)
              </span>
            </div>
          ) : farmingFocus === "hazelnut" ? (
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${isDark ? "bg-amber-500/15 border-amber-500/30" : "bg-amber-50 border-amber-300 text-amber-950"}`}>
              <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-amber-300" : "text-amber-950 font-black"}`}>
                <span className="text-base">🌰</span>
                <span>Fındık Hasadı Kaydı</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-950 border-amber-300"}`}>
                Seçiminiz: Sadece Fındık (Çay Devre Dışı)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1 rounded-xl bg-black/15 border border-emerald-800/30">
              <button
                type="button"
                onClick={() => handleCropTypeChange("tea")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cropType === "tea"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isDark
                    ? "text-emerald-300 hover:bg-emerald-900/40"
                    : "text-emerald-950 font-bold hover:bg-emerald-100"
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Yaş Çay Hasadı</span>
              </button>
              <button
                type="button"
                onClick={() => handleCropTypeChange("hazelnut")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cropType === "hazelnut"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isDark
                    ? "text-emerald-300 hover:bg-emerald-900/40"
                    : "text-emerald-950 font-bold hover:bg-emerald-100"
                }`}
              >
                <span>🌰 Fındık Hasadı</span>
              </button>
            </div>
          )}

          {/* =========================================================================
              FİRMA / ALICI FABRİKA SEÇİMİ
             ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold flex items-center gap-1.5">
                <Building2 className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span>Firma / Alıcı Fabrika</span>
                <span className={isDark ? "text-emerald-400" : "text-emerald-800"}>*</span>
              </label>
              <span className={`text-[10px] ${isDark ? "opacity-70" : "text-emerald-900 font-bold"}`}>
                Fabrikayı yukarıdaki listeden seçin
              </span>
            </div>

            {/* Quick Factory Selector Buttons with terms preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cropFactories.map((fItem) => {
                const isSelected =
                  selectedFactory?.id === fItem.id ||
                  buyerName.toLowerCase().trim() === fItem.factoryName.toLowerCase().trim();

                const defaultOpt = fItem.paymentOption || "aylik";
                const enteredConditionValue =
                  fItem.paymentValues?.[defaultOpt] ||
                  fItem.customPaymentDetail ||
                  fItem.paymentTerms;

                const defaultPrice = getOptionPrice(defaultOpt, fItem, enteredConditionValue);

                return (
                  <button
                    key={fItem.id}
                    type="button"
                    onClick={() => handleSelectFactory(fItem)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400 text-emerald-100 shadow-xs"
                          : "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500 text-emerald-950 font-bold shadow-xs"
                        : isDark
                        ? "bg-[#12281e] border-emerald-900 text-emerald-300/85 hover:bg-[#163326]"
                        : "bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50/70 font-semibold"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs truncate max-w-[170px]">
                        {fItem.factoryName}
                      </span>
                      <span className={`font-black text-xs shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                        {defaultPrice.toFixed(2)} ₺
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold truncate max-w-[210px] ${isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-950 border border-emerald-200"}`}>
                        {enteredConditionValue}
                      </span>
                      {fItem.supportPayment && fItem.supportPayment > 0 ? (
                        <span className={`px-1.5 py-0.5 rounded font-bold ${isDark ? "bg-teal-500/20 text-teal-300" : "bg-teal-100 text-teal-950 border border-teal-200"}`}>
                          +{fItem.supportPayment.toFixed(1)} ₺ Prim
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Seçili Alıcı Göstergesi */}
            {buyerName && (
              <div className="text-[11px] opacity-80 flex items-center gap-1.5 px-1">
                <span>Seçilen Alıcı:</span>
                <span className={`font-bold ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>{buyerName}</span>
              </div>
            )}
          </div>

            {/* Fabrika Notu / Destekleme Uyarısı */}
            {selectedFactory && (selectedFactory.note || (selectedFactory.supportPayment && selectedFactory.supportPayment > 0)) && (
              <div
                className={`p-2.5 rounded-xl text-xs space-y-1 ${
                  isDark ? "bg-black/30 border border-emerald-950" : "bg-white border border-gray-200"
                }`}
              >
                {selectedFactory.note && (
                  <div className="flex items-start gap-1.5 text-[11px] opacity-90">
                    <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Fabrika Alım Koşulu:</strong> {selectedFactory.note}
                    </span>
                  </div>
                )}
                {selectedFactory.supportPayment && selectedFactory.supportPayment > 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-semibold">
                    <Coins className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>
                      Devlet Destekleme Primi: +{selectedFactory.supportPayment.toFixed(2)} TL / KG
                      (Destek ödemesi hesabınıza ayrıca yatırılır)
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* =========================================================================
                UYGULANACAK ÖDEME KOŞULLARI BÖLÜMÜ
                (Uygulanacak Ödeme Koşuluna değer girilmemiş ise gösterilmez, seçim yapılmaz)
               ========================================================================= */}
            {availablePaymentOptions.length > 0 && (
              <div
                id="odeme-kosullari-section"
                className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
                  isDark
                    ? "bg-[#0b1c15] border-emerald-800/80 text-emerald-100"
                    : "bg-emerald-50/70 border-emerald-200 text-gray-900"
                }`}
              >
                {/* Header & Factory Name Banner */}
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                        <span>Ödeme Seçenekleri & Koşulları</span>
                      </h4>
                      <p className={`text-[10px] ${isDark ? "opacity-75" : "text-emerald-900 font-semibold"}`}>
                        {selectedFactory
                          ? `${selectedFactory.factoryName} için tanımlı koşullar`
                          : "Geçerli alım şartları"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seçilebilir Ödeme Koşulları Kartları - SADECE DEĞER GİRİLMİŞ OLANLAR */}
                <div className="space-y-1.5">
                  <label className={`block text-[11px] font-bold ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                    Uygulanacak Ödeme Koşulunu Seçin:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availablePaymentOptions.map((optConfig) => {
                      const isOptionSelected = selectedPaymentOption === optConfig.key;
                      const isFactoryDefault = selectedFactory?.paymentOption === optConfig.key;
                      const specificValue = optConfig.enteredValue!;
                      const OptionIcon = optConfig.icon;
                      const optionPrice = getOptionPrice(optConfig.key, selectedFactory, specificValue);
                      const optionGross = numKg * optionPrice;
                      const optionNet = optionGross * (1 - deductionRate);

                      return (
                        <button
                          key={optConfig.key}
                          type="button"
                          onClick={() => {
                            handleSelectPaymentOption(optConfig.key, specificValue, specificValue, optionPrice);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isOptionSelected
                              ? isDark
                                ? "bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500/70 shadow-sm"
                                : "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500 text-emerald-950 font-bold shadow-sm"
                              : isDark
                              ? "bg-[#142920]/80 border-emerald-900/80 hover:bg-[#193529] text-emerald-200"
                              : "bg-white border-emerald-200 hover:bg-emerald-50/60 text-emerald-950"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5 font-bold text-xs">
                                <OptionIcon className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                                <span className={isDark ? "" : "text-emerald-950 font-black"}>{optConfig.title}</span>
                              </div>
                              {isOptionSelected && (
                                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                              )}
                            </div>

                            {/* Ödeme Koşuluna Girilen Değer */}
                            <div
                              className={`p-2 rounded-lg border my-1 transition-all ${
                                isOptionSelected
                                  ? isDark
                                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-100"
                                    : "bg-emerald-200/70 border-emerald-400 text-emerald-950 font-bold"
                                  : isDark
                                  ? "bg-black/30 border-emerald-900/60 text-emerald-200"
                                  : "bg-emerald-50 border-emerald-200 text-emerald-950"
                              }`}
                            >
                              <span className={`text-[9px] uppercase tracking-wider block font-bold mb-0.5 ${isDark ? "text-emerald-400" : "text-emerald-900"}`}>
                                Girilen Koşul Değeri:
                              </span>
                              <div className="text-xs font-bold leading-snug">
                                {specificValue}
                              </div>
                            </div>

                            {/* Belirtilen Birim Fiyat ve Hesaplanmış Net Alacak */}
                            <div className="mt-2 pt-1.5 border-t border-emerald-800/25 flex items-center justify-between gap-1 text-[11px]">
                              <span className={`font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                                {optionPrice.toFixed(2)} TL / KG
                              </span>
                              {numKg > 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-950 border border-emerald-300"}`}>
                                  Net: {formatCurrency(optionNet)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Badges footer */}
                          <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-emerald-800/30 text-[10px]">
                            <span className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                              {optConfig.badge}
                            </span>
                            {isFactoryDefault && (
                              <span className={`px-1.5 py-0.2 rounded font-bold border ${isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-amber-100 text-amber-950 border-amber-300"}`}>
                                Fabrika Şartı
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {/* Input: Miktar (KG) * */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isDark ? "text-emerald-200" : "text-emerald-950 font-bold"}`}>
              Miktar (KG) <span className={isDark ? "text-emerald-400" : "text-emerald-700 font-bold"}>*</span>
            </label>
            <div className="relative">
              <input
                id="input-harvest-quantity"
                type="number"
                step="any"
                required
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                placeholder="Örn: 1000"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-bold border transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? "bg-[#142920] border-emerald-800/80 text-white placeholder-emerald-800"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold opacity-60">
                KG
              </span>
            </div>
          </div>

          {/* Sezon Seçimi (1. Sezon, 2. Sezon, 3. Sezon, 4. Sezon) */}
          <div>
            <label className={`block text-xs font-semibold mb-1 flex items-center justify-between ${isDark ? "text-emerald-200" : "text-emerald-950 font-bold"}`}>
              <span>
                Hasat Sezonu / Sürüm <span className={isDark ? "text-emerald-400" : "text-emerald-700 font-bold"}>*</span>
              </span>
              <span className="text-[10px] opacity-70">
                Tarihe göre otomatik belirlenir
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "season_1", label: "1. Sezon", period: "Mayıs - Haz" },
                { id: "season_2", label: "2. Sezon", period: "Temmuz" },
                { id: "season_3", label: "3. Sezon", period: "Ağustos - Eyl" },
                { id: "season_4", label: "4. Sezon", period: "Ekim - Kas" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeason(s.id as SeasonType)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    season === s.id
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs font-bold"
                      : isDark
                      ? "bg-[#142920] border-emerald-900 text-emerald-300/80 hover:bg-[#18362a]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] opacity-70">{s.period}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input: Brüt Birim Fiyat (TL) * */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-xs font-semibold ${isDark ? "text-emerald-200" : "text-emerald-950 font-bold"}`}>
                Brüt Birim Fiyat (TL / KG) <span className={isDark ? "text-emerald-400" : "text-emerald-700 font-bold"}>*</span>
              </label>
              {activeEnteredValue ? (
                <span className={`text-[10px] font-semibold truncate max-w-[280px] ${isDark ? "text-teal-300" : "text-teal-950 font-bold"}`}>
                  Alım Şartı Değeri: {activeEnteredValue}
                  {selectedFactory?.supportPayment && selectedFactory.supportPayment > 0
                    ? ` + ${selectedFactory.supportPayment} ₺ Prim`
                    : ""}
                </span>
              ) : selectedFactory?.supportPayment && selectedFactory.supportPayment > 0 ? (
                <span className={`text-[10px] font-semibold ${isDark ? "text-teal-300" : "text-teal-950 font-bold"}`}>
                  Alım Fiyatı: {numPrice.toFixed(2)} ₺ + {selectedFactory.supportPayment} ₺ Prim
                </span>
              ) : null}
            </div>
            <div className="relative">
              <input
                id="input-harvest-price"
                type="number"
                step="0.01"
                required
                value={unitPriceGross}
                onChange={(e) => setUnitPriceGross(e.target.value)}
                placeholder="Örn: 35.00"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-bold border transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? "bg-[#142920] border-emerald-800/80 text-white placeholder-emerald-800"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold opacity-60">
                TL / KG
              </span>
            </div>
          </div>

          {/* Auto Calculation Card */}
          <div
            id="harvest-calc-summary"
            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              isDark
                ? "bg-[#0a1811] border-emerald-800/80 text-emerald-100"
                : "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-emerald-800/30">
              <span className={`flex items-center gap-1.5 ${isDark ? "font-semibold text-emerald-300" : "font-bold text-emerald-950"}`}>
                <CreditCard className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span>Koşul: <strong>{selectedPaymentTerms}</strong></span>
              </span>
              <span className={`font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                {numPrice.toFixed(2)} TL / KG
              </span>
            </div>

            <div className={`flex justify-between items-center ${isDark ? "opacity-85" : "text-emerald-950"}`}>
              <span>Brüt teslim tutarı ({quantityKg || 0} KG x {numPrice.toFixed(2)} ₺):</span>
              <span className="font-bold">{formatCurrency(grossAmount)}</span>
            </div>
            <div className={`flex justify-between items-center ${isDark ? "opacity-85" : "text-emerald-950"}`}>
              <span className="flex items-center gap-1.5">
                <span>Kesinti ({settings?.customDeductionLabel || "Borsa Tescil / Stopaj"}):</span>
                <span className={`font-bold ${isDark ? "text-red-400" : "text-red-700"}`}>%{parsedDeductionPct.toFixed(2)}</span>
              </span>
              <span className={`font-bold ${isDark ? "text-red-400" : "text-red-700"}`}>
                -{formatCurrency(deductionAmount)}
              </span>
            </div>
            <div className={`border-t pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm font-bold ${
              isDark ? "border-emerald-800/40 text-emerald-400" : "border-emerald-300 text-emerald-950"
            }`}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span>Net Tahsil Edilecek Alacak:</span>
              </span>
              <span className={`text-base sm:text-lg font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{formatCurrency(netReceivable)}</span>
            </div>
            <div className={`text-[10px] pt-0.5 font-medium ${isDark ? "text-emerald-300/80" : "text-emerald-900 font-semibold"}`}>
              * Seçilen ödeme koşuluna göre hesaplanan bu net tutar sisteme alacak olarak işlenecektir.
            </div>
          </div>

          {/* Expandable: + Tarih, bahçe, vade ve not ekle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                isDark
                  ? "text-emerald-400 hover:text-emerald-300"
                  : "text-emerald-700 hover:text-emerald-800"
              }`}
            >
              <span>
                {showAdvanced
                  ? "- Detayları gizle (Tarih, Bahçe, Vade)"
                  : "+ Tarih, Bahçe, Vade ve Fiş Detayı Ekle"}
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div
                className={`mt-2 p-3.5 rounded-xl border space-y-3 animate-in fade-in ${
                  isDark
                    ? "bg-[#11241c] border-emerald-900"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium mb-1">Hasat Tarihi</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium mb-1 flex items-center justify-between">
                      <span>Tahsilat / Vade Tarihi</span>
                      <span className={`text-[10px] font-bold ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                        {selectedPaymentOption === "pesin" ? "Peşin" : "Vadeli"}
                      </span>
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border font-semibold ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium mb-1">
                    İlişkili Bahçe / Parsel
                  </label>
                  <select
                    value={gardenId}
                    onChange={(e) => setGardenId(e.target.value)}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                      isDark
                        ? "bg-[#142920] border-emerald-800 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {filteredGardens.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.cropType === "hazelnut" ? "🌰" : "🍃"} {g.name} ({g.sizeDecares} Dönüm - {g.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium mb-1">
                    Fiş No / Not
                  </label>
                  <input
                    type="text"
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    placeholder="Örn: 2. Sürüm Kantar Fişi No: 4892"
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                      isDark
                        ? "bg-[#142920] border-emerald-800 text-white placeholder-gray-500"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* OCR Quick Fill Section (En Alta Taşındı) */}
          <div
            className={`p-3 rounded-xl border space-y-2 ${
              isDark
                ? "bg-[#142d22] border-emerald-700/50"
                : "bg-emerald-50/50 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                <Sparkles className="w-3.5 h-3.5" /> Fişten hızlı doldur
              </span>
              <span className="text-[10px] opacity-75">Kantar & Teslim Fişi</span>
            </div>
            <p className="text-[11px] opacity-75">
              Fişinizin kantar görüntüsünden verileri otomatik aktarın:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleSimulateScan(0)}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#0b1a13] border-emerald-800 hover:bg-emerald-900/70 text-emerald-200"
                    : "bg-white border-emerald-300 hover:bg-emerald-50 text-emerald-950"
                }`}
              >
                <Camera className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span>Fotoğraf Çek</span>
              </button>

              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleSimulateScan(1)}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? "bg-[#0b1a13] border-emerald-800 hover:bg-emerald-900/70 text-emerald-200"
                    : "bg-white border-emerald-300 hover:bg-emerald-50 text-emerald-950"
                }`}
              >
                <Upload className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span>Galeriden Yükle</span>
              </button>
            </div>

            {isScanning && (
              <div className={`text-xs flex items-center gap-1.5 pt-1 animate-pulse font-bold ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                <Sparkles className="w-3 h-3" /> Fiş taranıyor, lütfen bekleyin...
              </div>
            )}
            {scanFeedback && (
              <div className={`text-xs font-bold pt-1 ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                {scanFeedback}
              </div>
            )}
          </div>

          {/* Action Button: Hasadı Kaydet */}
          <button
            id="btn-submit-harvest"
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Leaf className="w-4 h-4" />
            <span>
              Hasadı Kaydet
              {numKg > 0 && numPrice > 0 ? ` (Net: ${formatCurrency(netReceivable)})` : ""}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

