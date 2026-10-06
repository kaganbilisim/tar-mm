export type UserRole = "employer" | "crew_leader" | "worker" | "service_provider" | "admin";

export type FarmingFocus = "tea" | "hazelnut" | "both";

export interface UserAccount {
  id: string;
  username: string; // e.g. "kağan"
  password: string; // e.g. "tamer6715"
  fullName: string;
  phone?: string;
  email?: string;
  role: UserRole;
  farmingFocus: FarmingFocus;
  securityQuestion?: string;
  securityAnswer?: string;
  city?: string;
  district?: string;
  createdAt: string;
}

export type SeasonType = "season_1" | "season_2" | "season_3" | "season_4";

export interface HarvestRecord {
  id: string;
  date: string; // YYYY-MM-DD
  year?: number; // e.g., 2026, 2025
  season: SeasonType; // 1. Sezon, 2. Sezon, 3. Sezon, 4. Sezon
  gardenId: string;
  gardenName: string;
  quantityKg: number;
  buyerName: string; // ÇAYKUR, Doğuş, Ofçay, etc.
  unitPriceGross: number; // TL / KG
  grossAmount: number; // quantity * unitPriceGross
  deductionRate: number; // 0.02 (2% borsa/stopaj)
  deductionAmount: number;
  netReceivable: number; // gross - deduction
  collectedAmount: number; // what has been paid so far
  dueDate?: string; // vadeli alacak tarihi
  status: "pending" | "partial" | "completed";
  receiptNote?: string;
  cropType: "tea" | "hazelnut";
  paymentOption?: FactoryPaymentOption;
  paymentTerms?: string;
  paymentDetail?: string;
}

export interface PaymentRecord {
  id: string;
  harvestId?: string;
  date: string;
  amount: number;
  note: string;
  paymentMethod: "bank" | "cash" | "check";
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: "fertilizer" | "pruning" | "labor_crew" | "fuel_tools" | "sacks" | "other";
  title: string;
  amount: number;
  gardenId?: string;
  gardenName?: string;
  note?: string;
}

export interface Garden {
  id: string;
  name: string;
  location: string; // e.g., "Rize / Çayeli - Büyükköy"
  sizeDecares: number; // Dönüm
  cropType: "tea" | "hazelnut";
  bushesCount?: number; // Ocak sayısı
  adaNo?: string; // Ada numarası (ör. 142)
  parselNo?: string; // Parsel numarası (ör. 8)
  latitude?: number; // Enlem (ör. 41.0254)
  longitude?: number; // Boylam (ör. 40.5284)
  googleMapsUrl?: string; // Google Haritalar linki veya koordinat URL'i
  notes?: string;
}

export interface CksLinkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  badge?: string;
  iconType?: "building" | "search" | "check" | "file";
}

export interface AdBannerItem {
  id: string;
  enabled: boolean;
  title: string;
  badge: string;
  description: string;
  buttonText: string;
  linkUrl: string;
  imageUrl?: string;
  bgColor?: "emerald" | "amber" | "blue" | "purple" | "rose" | string;
}

export interface AdBannerConfig {
  enabled: boolean;
  title: string;
  badge: string;
  description: string;
  buttonText: string;
  linkUrl: string;
  imageUrl?: string;
  bgColor?: string; // "emerald" | "amber" | "blue" | "purple"
}

export interface HomeFooterConfig {
  title: string;
  subtitle: string;
  steps: Array<{ title: string; desc: string }>;
  contactNote: string;
}

export type HomeSectionId =
  | "ad_banner"
  | "hero_stats"
  | "quick_actions"
  | "recent_harvests"
  | "agri_advice"
  | "footer_info";

export const DEFAULT_CKS_LINKS: CksLinkItem[] = [
  {
    id: "cks-1",
    title: "ÇKS Kayıt Yenileme (Tüzel Kişi)",
    url: "https://www.turkiye.gov.tr/tarim-ve-orman-ciftci-kayit-sistemi-kayit-yenileme-basvurusu-tuzel-kisi",
    description: "Şirket ve kooperatif tüzel kişilik ÇKS başvuru ve yıllık vize yenilemesi.",
    badge: "Başvuru",
    iconType: "building",
  },
  {
    id: "cks-2",
    title: "ÇKS Belgesi Sorgulama (Gerçek Kişi)",
    url: "https://www.turkiye.gov.tr/tarim-ve-orman-ciftci-kayit-sistemi-cks-belgesi-sorgulama-gercek-kisi",
    description: "Bireysel çiftçiler için e-Devlet barkodlu ÇKS belgesi görüntüleme ve indirme.",
    badge: "Gerçek Kişi",
    iconType: "search",
  },
  {
    id: "cks-3",
    title: "ÇKS Belgesi Sorgulama (Tüzel Kişi)",
    url: "https://www.turkiye.gov.tr/tarim-ve-orman-ciftci-kayit-sistemi-cks-belgesi-sorgulama-tuzel-kisi",
    description: "Tüzel kişiliklere ait güncel ÇKS belgesi sorgulama ve resmi çıktı alma.",
    badge: "Tüzel Kişi",
    iconType: "file",
  },
  {
    id: "cks-4",
    title: "ÇKS Belgesi Doğrulama",
    url: "https://www.turkiye.gov.tr/tarim-ve-orman-ciftci-kayit-sistemi-cks-belgesi-dogrulama",
    description: "Fabrika, banka ve ziraat odaları için barkodlu ÇKS belgesi geçerlilik teyidi.",
    badge: "Doğrulama",
    iconType: "check",
  },
];

export const DEFAULT_AD_BANNERS: AdBannerItem[] = [
  {
    id: "ad-1",
    enabled: true,
    title: "🌿 2026 Çay & Fındık Sezonu Özel Gübre ve Budama Kampanyası",
    badge: "Özel Fırsat",
    description:
      "Karadeniz Tarım Kredi Kooperatifleri ve ÇAYKUR onaylı 25-5-10 kompoze gübre alımlarında %15 erken sipariş indirimi başladı!",
    buttonText: "Detayları İncele",
    linkUrl: "https://www.tarimorman.gov.tr",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
    bgColor: "emerald",
  },
  {
    id: "ad-2",
    enabled: true,
    title: "🌾 Motorlu Tırpan ve Budama Makası Yetkili Servis İndirimi",
    badge: "Teknik Servis",
    description:
      "Hasat öncesi motorlu tırpanlarda ve çay budama makinelerinde ücretsiz bıçak bileme ve bakım günleri başladı.",
    buttonText: "Kampanyayı İncele",
    linkUrl: "https://www.tarimkredi.org.tr",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
    bgColor: "amber",
  },
  {
    id: "ad-3",
    enabled: true,
    title: "🚜 Ziraat Bankası Üretici Destek Kredisi & Mazot Desteği",
    badge: "Finansman",
    description:
      "2026 hasat dönemi işçilik ve nakliye giderlerine özel 0 faizli 6 ay vadeli Tarım Kart imkânı tüm üreticilere açıldı.",
    buttonText: "Hemen Başvur",
    linkUrl: "https://www.ziraatbank.com.tr",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60",
    bgColor: "blue",
  },
];

export const DEFAULT_AD_BANNER: AdBannerConfig = {
  enabled: true,
  title: "🌿 2026 Çay & Fındık Sezonu Özel Gübre ve Budama Kampanyası",
  badge: "Özel Fırsat",
  description:
    "Karadeniz Tarım Kredi Kooperatifleri ve ÇAYKUR onaylı 25-5-10 kompoze gübre alımlarında %15 erken sipariş indirimi başladı!",
  buttonText: "Detayları İncele",
  linkUrl: "https://www.tarimorman.gov.tr",
  imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
  bgColor: "emerald",
};

export const DEFAULT_HOME_FOOTER: HomeFooterConfig = {
  title: "Başlamak çok kolay",
  subtitle: "İlk kaydınızı birkaç dakikada tamamlayabilirsiniz:",
  steps: [
    { title: "Hasat Ekle", desc: "Kilo ve satış fiyatını yazın." },
    {
      title: "Otomatik Kesinti",
      desc: "Net alacak tutarı %2 borsa kesintisiyle otomatik hesaplansın.",
    },
    {
      title: "Ödeme Al",
      desc: "Ödeme geldiğinde Fabrikadan Ödeme Al'a dokunun.",
    },
  ],
  contactNote:
    "Tarım Cepte AI © 2026 - Karadeniz Çiftçisi ve Üreticisi İçin Geliştirilmiştir.",
};

export const DEFAULT_HOME_SECTIONS_ORDER: HomeSectionId[] = [
  "ad_banner",
  "hero_stats",
  "quick_actions",
  "recent_harvests",
  "agri_advice",
  "footer_info",
];

export interface AppSettings {
  // Kesinti (Borsa Tescil / Stopaj) Ayarları
  borsaTescilRate: number; // örn: 1.0 (%)
  stopajRate: number; // örn: 1.0 (%)
  autoApplyDeduction: boolean; // Hasat kayıtlarında otomatik kesinti uygulansın mı?
  customDeductionLabel?: string; // "Borsa Tescil + Stopaj Kesintisi"

  // Üretici & Çiftçi Bilgileri
  farmerName?: string;
  farmerCksNo?: string; // Çiftçi Kayıt Sistemi / Ruhsat No
  teaLicenseNo?: string; // Çaykur Cüzdan / Ruhsat No
  defaultCropType: "tea" | "hazelnut";

  // Finansal & Arayüz
  currencySymbol: string; // "TL"
  autoDueDateDays: number; // Vade günü varsayılanı (örn: 30)

  // Admin Kontrollü Ayarlar
  cksLinks?: CksLinkItem[];
  homeSectionsOrder?: HomeSectionId[];
  adBanner?: AdBannerConfig;
  adBanners?: AdBannerItem[];
  homeFooter?: HomeFooterConfig;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  borsaTescilRate: 1.0,
  stopajRate: 1.0,
  autoApplyDeduction: true,
  customDeductionLabel: "Borsa Tescil / Stopaj Kesintisi",
  farmerName: "Mehmet Çepni",
  farmerCksNo: "CKS-53-2026-882",
  teaLicenseNo: "ÇY-448201",
  defaultCropType: "tea",
  currencySymbol: "TL",
  autoDueDateDays: 30,
  cksLinks: DEFAULT_CKS_LINKS,
  homeSectionsOrder: DEFAULT_HOME_SECTIONS_ORDER,
  adBanner: DEFAULT_AD_BANNER,
  adBanners: DEFAULT_AD_BANNERS,
  homeFooter: DEFAULT_HOME_FOOTER,
};

export interface JobListing {
  id: string;
  employerId?: string; // İlanı oluşturan kullanıcının ID'si
  title: string;
  cropType: "tea" | "hazelnut";
  locationCity: string;
  locationDistrict: string;
  gardenSizeDonum?: number; // Bahçe büyüklüğü (Dönüm)
  workerCount: number; // Kesin işçi sayısı (zorunlu)
  startDate: string;
  estimatedDays: number;
  paymentType: "daily_wage" | "lump_sum" | "per_donum"; // Yevmiye, Götürü veya Dönüm Başı (pazarlık kesinlikle yasak!)
  wageAmount: number; // Kesin tutar (TL)
  hasAccommodation: boolean; // Konaklama sağlanıyor mu?
  hasFood: boolean; // Yemek/Kumanya sağlanıyor mu?
  hasTransportation: boolean; // Ulaşım/Servis sağlanıyor mu?
  employerName: string;
  employerPhone: string;
  phone?: string;
  notes: string;
  status: "active" | "filled" | "completed" | "cancelled" | "inactive";
  createdAt: string;
  createdAtTimestamp?: number; // İlanın oluşturulma/aktif edilme milisaniyesi
  expiresAtTimestamp?: number; // 7 gün sonraki sona erme zamanı
  applicantsCount: number;
}

export type JobPost = JobListing;

export interface CrewMember {
  id: string;
  name: string;
  roleTitle: "Makasçı" | "Motorlu Tırpancı" | "Çuvalcı" | "Teleferikçi" | "Usta";
  phone: string;
  dailyWage?: number;
}

export interface CrewLeaderProfile {
  id: string;
  userId?: string; // İlanı / Ekibi ekleyen kullanıcının ID'si
  name: string;
  phone: string;
  location: string;
  city?: string;
  district?: string;
  crewSize: number; // Ekip büyüklüğü (ör. 12 Kişi)
  specialties: string[];
  experienceYears: number;
  expectedDailyWagePerPerson: number;
  availableDates: string;
  rating: number;
  verified: boolean;
  members?: CrewMember[];
}

export interface WorkerProfile {
  id: string;
  userId?: string; // İlanı / Profili ekleyen kullanıcının ID'si
  name: string;
  phone: string;
  location: string;
  city?: string;
  skills: string[]; // Çay makası, motorlu tırpan, çuval taşıma, teleferik, fındık toplama
  experienceYears: number;
  expectedDailyWage: number; // Kesin yevmiye beklentisi (TL)
  availability: string;
  availabilityStatus?: "available" | "busy"; // Müsait/İşe Açık vs Meşgul/İşe Kapalı
  rating: number;
  reviewCount?: number;
  description?: string;
  references?: string;
}

export interface JobApplication {
  id: string;
  applicantId?: string; // Başvuruyu yapan kullanıcının ID'si
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantPhone: string;
  applicantRole: "crew_leader" | "worker";
  teamSize: number; // 1 for individual, 6-15 for crew
  demandedWage: number; // Kesin TL tutarı
  offerNote: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface ServiceOffer {
  id: string;
  userId?: string; // Hizmeti ekleyen kullanıcının ID'si
  title: string;
  category: "pruning" | "clearing" | "spraying" | "soil_analysis";
  providerName: string;
  providerPhone: string;
  city: string;
  pricingUnit: "donum" | "ocak" | "daily"; // Dönüm Başı, Ocak Başı veya Günlük
  priceAmount: number; // Net TL tutarı
  description: string;
  rating?: number;
}

export interface ServiceProvider {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  location: string;
  services: string[]; // Motorlu budama, İlaçlama, Toprak Analizi, Drenaj
  pricingSummary: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export type AgriCategory = "all" | "hazelnut" | "tea" | "corn" | "vegetable" | "fruit" | "livestock" | "labor";

export interface AgriProductListing {
  id: string;
  title: string;
  category: "hazelnut" | "tea" | "corn" | "vegetable" | "fruit" | "livestock";
  categoryLabel: string;
  price: number;
  unit: string; // "kg", "ton", "kasa", "çuval", "adet"
  quantity: string; // e.g. "50 kg", "1.500 kg", "20 çuval"
  locationCity: string;
  locationDistrict: string;
  locationNeighborhood?: string;
  sellerName: string;
  sellerPhone: string;
  sellerType: "producer" | "merchant" | "cooperative";
  verified: boolean;
  rating: number;
  reviewCount?: number;
  images: string[];
  description: string;
  harvestYear?: number;
  createdAt: string;
  featured?: boolean;
  minOrder?: string;
}

export interface MarketMessage {
  id: string;
  listingId: string;
  listingTitle: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export type FactoryPaymentOption = "pesin" | "haftalik" | "aylik" | "vadeli" | "diger";

export interface FactoryPaymentValues {
  pesin?: string; // Peşin ödeme değeri / fiyatı / şartı
  haftalik?: string; // Haftalık ödeme değeri
  aylik?: string; // Aylık ödeme değeri
  vadeli?: string; // Vadeli ödeme değeri
  diger?: string; // Diğer özel ödeme koşulu değeri
}

export interface FactoryPrice {
  id: string;
  factoryName: string;
  crop: "tea" | "hazelnut";
  basePrice: number;
  supportPayment?: number;
  paymentOption?: FactoryPaymentOption;
  customPaymentDetail?: string; // Peşin, haftalık, aylık, vadeli, diğer detayları
  paymentTerms: string; // "Peşin", "Haftalık Havale", "Aylık", "Vadeli (45 Gün)", vb.
  paymentValues?: FactoryPaymentValues; // Her ödeme seçeneğine ayrı ayrı girilen değerler
  effectiveDate: string;
  note?: string;
  isUserAdded?: boolean;
  userId?: string; // Bu fabrikayı ekleyen kullanıcının ID'si (sadece ekleyen kullanıcı görür)
  createdBy?: string;
}

export interface AdminUserMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  recipientId: string; // specific userId or "admin" or "all"
  recipientName?: string;
  subject?: string;
  content: string;
  timestamp: string;
  createdAt: number;
  read: boolean;
  isBroadcast?: boolean; // true if sent to all users as bulk announcement
}
