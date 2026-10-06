import React, { useState, useMemo } from "react";
import {
  UserAccount,
  AppSettings,
  HarvestRecord,
  PaymentRecord,
  ExpenseRecord,
  JobListing,
  CrewLeaderProfile,
  WorkerProfile,
  JobApplication,
  ServiceOffer,
  FactoryPrice,
  CksLinkItem,
  DEFAULT_CKS_LINKS,
  AdBannerConfig,
  AdBannerItem,
  DEFAULT_AD_BANNERS,
  HomeFooterConfig,
  HomeSectionId,
  UserRole,
  FarmingFocus,
  AdminUserMessage,
} from "../types";
import {
  Shield,
  Users,
  KeyRound,
  Eye,
  EyeOff,
  Activity,
  ShoppingBag,
  Sliders,
  FileText,
  Megaphone,
  Building2,
  ExternalLink,
  Trash2,
  Edit3,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ArrowUp,
  ArrowDown,
  Download,
  Copy,
  Check,
  Lock,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  RefreshCw,
  CheckSquare,
  Square,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { AdminMessagingSection } from "./AdminMessagingSection";

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  currentUser: UserAccount;
  users: UserAccount[];
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (user: UserAccount) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  harvests: HarvestRecord[];
  onDeleteHarvest: (id: string) => void;
  payments: PaymentRecord[];
  onDeletePayment: (id: string) => void;
  expenses: ExpenseRecord[];
  onDeleteExpense: (id: string) => void;
  jobs: JobListing[];
  onDeleteJob: (id: string) => void;
  onUpdateJobStatus: (id: string, status: JobListing["status"]) => void;
  crews: CrewLeaderProfile[];
  onDeleteCrew: (id: string) => void;
  workers: WorkerProfile[];
  onDeleteWorker: (id: string) => void;
  applications: JobApplication[];
  onDeleteApplication: (id: string) => void;
  services: ServiceOffer[];
  onDeleteService: (id: string) => void;
  factories: FactoryPrice[];
  onAddFactory: (factory: Omit<FactoryPrice, "id">) => void;
  onUpdateFactory: (factory: FactoryPrice) => void;
  onDeleteFactory: (id: string) => void;
  onWipeAllData?: () => void;
  adminMessages?: AdminUserMessage[];
  onSendMessage?: (msg: Omit<AdminUserMessage, "id" | "createdAt">) => void;
  onDeleteMessage?: (id: string) => void;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  isOpen,
  onClose,
  isDark,
  currentUser,
  users,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  settings,
  onUpdateSettings,
  harvests,
  onDeleteHarvest,
  payments,
  onDeletePayment,
  expenses,
  onDeleteExpense,
  jobs,
  onDeleteJob,
  onUpdateJobStatus,
  crews,
  onDeleteCrew,
  workers,
  onDeleteWorker,
  applications,
  onDeleteApplication,
  services,
  onDeleteService,
  factories,
  onAddFactory,
  onUpdateFactory,
  onDeleteFactory,
  onWipeAllData,
  adminMessages = [],
  onSendMessage,
  onDeleteMessage,
}) => {
  const [activeTab, setActiveTab] = useState<
    "members" | "activities" | "marketplace" | "messages" | "home_order" | "home_footer" | "ad_banner" | "factories" | "cks_links"
  >("members");

  // Feedback states
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Global Onay Modalı (Tüm admin silmelerinde onay istensin kuralı)
  const [confirmDeleteState, setConfirmDeleteState] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    itemName: undefined,
    description: "",
    onConfirm: () => {},
  });

  const triggerConfirmDelete = (title: string, itemName: string | undefined, description: string, onConfirm: () => void) => {
    setConfirmDeleteState({
      isOpen: true,
      title,
      itemName,
      description,
      onConfirm: () => {
        onConfirm();
        setConfirmDeleteState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Toplu Seçim State'leri
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);
  const [selectedFactoryIds, setSelectedFactoryIds] = useState<string[]>([]);
  const [selectedCksIds, setSelectedCksIds] = useState<string[]>([]);
  const [selectedBannerIds, setSelectedBannerIds] = useState<string[]>([]);

  // Toplu Silme İşleyicileri
  const handleBulkDeleteMembers = () => {
    if (selectedMemberIds.length === 0) return;
    const count = selectedMemberIds.length;
    triggerConfirmDelete(
      "Seçilen Üyeleri Sil",
      `${count} Üye`,
      `Seçtiğiniz ${count} adet üyeyi sistemden kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      () => {
        selectedMemberIds.forEach((uid) => {
          if (uid !== currentUser.id) onDeleteUser(uid);
        });
        showFeedback(`${count} üye kalıcı olarak silindi.`);
        setSelectedMemberIds([]);
      }
    );
  };

  const handleBulkDeleteActivities = () => {
    if (selectedActivityIds.length === 0) return;
    const count = selectedActivityIds.length;
    triggerConfirmDelete(
      "Seçilen Hareketleri Sil",
      `${count} Hareket Kaydı`,
      `Seçtiğiniz ${count} adet hareket kaydını (hasat, tahsilat, gider) kalıcı olarak silmek istediğinizden emin misiniz?`,
      () => {
        selectedActivityIds.forEach((key) => {
          const [type, id] = key.split(":");
          if (type === "harvest") onDeleteHarvest(id);
          else if (type === "payment") onDeletePayment(id);
          else if (type === "expense") onDeleteExpense(id);
        });
        showFeedback(`${count} hareket kaydı kalıcı olarak silindi.`);
        setSelectedActivityIds([]);
      }
    );
  };

  const handleBulkDeleteMarket = () => {
    if (selectedMarketIds.length === 0) return;
    const count = selectedMarketIds.length;
    triggerConfirmDelete(
      "Seçilen Pazar Kayıtlarını Sil",
      `${count} Pazar Kaydı`,
      `Seçtiğiniz ${count} adet pazar yeri kaydını (ilan, çavuş, işçi, hizmet, başvuru) kalıcı olarak silmek istediğinizden emin misiniz?`,
      () => {
        selectedMarketIds.forEach((key) => {
          const [type, id] = key.split(":");
          if (type === "job") onDeleteJob(id);
          else if (type === "crew") onDeleteCrew(id);
          else if (type === "worker") onDeleteWorker(id);
          else if (type === "service") onDeleteService(id);
          else if (type === "app") onDeleteApplication(id);
        });
        showFeedback(`${count} pazar yeri kaydı başarıyla silindi.`);
        setSelectedMarketIds([]);
      }
    );
  };

  const handleBulkDeleteFactories = () => {
    if (selectedFactoryIds.length === 0) return;
    const count = selectedFactoryIds.length;
    triggerConfirmDelete(
      "Seçilen Fabrikaları Sil",
      `${count} Fabrika Kaydı`,
      `Seçtiğiniz ${count} fabrikayı sistemden kalıcı olarak silmek istediğinizden emin misiniz?`,
      () => {
        selectedFactoryIds.forEach((fid) => onDeleteFactory(fid));
        showFeedback(`${count} fabrika kaydı silindi.`);
        setSelectedFactoryIds([]);
      }
    );
  };

  const handleBulkDeleteCks = () => {
    if (selectedCksIds.length === 0) return;
    const count = selectedCksIds.length;
    triggerConfirmDelete(
      "Seçilen ÇKS Bağlantılarını Sil",
      `${count} e-Devlet ÇKS Bağlantısı`,
      `Seçtiğiniz ${count} e-Devlet ÇKS bağlantısını silmek istediğinizden emin misiniz?`,
      () => {
        const currentLinks = settings.cksLinks && settings.cksLinks.length > 0 ? settings.cksLinks : DEFAULT_CKS_LINKS;
        const updated = currentLinks.filter((l) => !selectedCksIds.includes(l.id));
        onUpdateSettings({ ...settings, cksLinks: updated });
        showFeedback(`${count} ÇKS bağlantısı silindi.`);
        setSelectedCksIds([]);
      }
    );
  };

  const handleBulkDeleteBanners = () => {
    if (selectedBannerIds.length === 0) return;
    const count = selectedBannerIds.length;
    triggerConfirmDelete(
      "Seçilen Bannerları Sil",
      `${count} Reklam & Duyuru Bannerı`,
      `Seçtiğiniz ${count} reklam ve duyuru bannerını kalıcı olarak silmek istediğinizden emin misiniz?`,
      () => {
        const updated = adBannersList.filter((b) => !selectedBannerIds.includes(b.id));
        setAdBannersList(updated);
        onUpdateSettings({ ...settings, adBanners: updated });
        try {
          localStorage.setItem("tarim_cepte_global_ad_banners", JSON.stringify(updated));
        } catch {
          // ignore
        }
        showFeedback(`${count} banner başarıyla silindi.`);
        setSelectedBannerIds([]);
      }
    );
  };

  // 1. ÜYE YÖNETİMİ STATE
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>("all");
  const [memberFocusFilter, setMemberFocusFilter] = useState<string>("all");
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState<{
    fullName: string;
    username: string;
    password: string;
    phone: string;
    email: string;
    role: UserRole;
    farmingFocus: FarmingFocus;
  }>({
    fullName: "",
    username: "",
    password: "",
    phone: "",
    email: "",
    role: "employer",
    farmingFocus: "both",
  });

  // 2. HAREKETLER & DENETİM STATE
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<"all" | "harvest" | "payment" | "expense" | "job">("all");

  // 3. PAZAR YERİ MODERASYON STATE
  const [marketSearch, setMarketSearch] = useState("");
  const [marketType, setMarketType] = useState<"all" | "jobs" | "crews" | "workers" | "applications" | "services">("all");

  // 4. ANA SAYFA SIRALAMA STATE
  const currentSectionsOrder: HomeSectionId[] = settings.homeSectionsOrder || [
    "ad_banner",
    "hero_stats",
    "quick_actions",
    "recent_harvests",
    "agri_advice",
    "footer_info",
  ];

  // 5. ANA SAYFA FOOTER METİNLERİ STATE
  const [footerTitle, setFooterTitle] = useState(settings.homeFooter?.title || "Başlamak çok kolay");
  const [footerSubtitle, setFooterSubtitle] = useState(
    settings.homeFooter?.subtitle || "İlk kaydınızı birkaç dakikada tamamlayabilirsiniz:"
  );
  const [footerStep1, setFooterStep1] = useState(
    settings.homeFooter?.steps?.[0]?.desc || "Kilo ve satış fiyatını yazın."
  );
  const [footerStep2, setFooterStep2] = useState(
    settings.homeFooter?.steps?.[1]?.desc || "Net alacak tutarı %2 borsa kesintisiyle otomatik hesaplansın."
  );
  const [footerStep3, setFooterStep3] = useState(
    settings.homeFooter?.steps?.[2]?.desc || "Ödeme geldiğinde Fabrikadan Ödeme Al'a dokunun."
  );
  const [footerContact, setFooterContact] = useState(
    settings.homeFooter?.contactNote || "Tarım Cepte AI © 2026 - Karadeniz Çiftçisi ve Üreticisi İçin Geliştirilmiştir."
  );

  // 6. REKLAM & DUYURU BANNER ÇOKLU LİSTE STATE
  const initialAdBanners: AdBannerItem[] = useMemo(() => {
    try {
      const globalSaved = localStorage.getItem("tarim_cepte_global_ad_banners");
      if (globalSaved) {
        const parsed = JSON.parse(globalSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    if (settings.adBanners && settings.adBanners.length > 0) {
      return settings.adBanners;
    }
    if (settings.adBanner) {
      return [{
        id: "banner-1",
        enabled: settings.adBanner.enabled,
        title: settings.adBanner.title,
        badge: settings.adBanner.badge,
        description: settings.adBanner.description,
        buttonText: settings.adBanner.buttonText,
        linkUrl: settings.adBanner.linkUrl,
        imageUrl: settings.adBanner.imageUrl || "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
        bgColor: settings.adBanner.bgColor,
      }];
    }
    return DEFAULT_AD_BANNERS;
  }, [settings.adBanners, settings.adBanner]);

  const [adBannersList, setAdBannersList] = useState<AdBannerItem[]>(initialAdBanners);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [isAddingNewBanner, setIsAddingNewBanner] = useState<boolean>(false);
  const [bannerFormData, setBannerFormData] = useState<Omit<AdBannerItem, "id">>({
    enabled: true,
    title: "",
    badge: "Özel Fırsat",
    description: "",
    buttonText: "Detayları İncele",
    linkUrl: "https://www.tarimorman.gov.tr",
    imageUrl: "",
    bgColor: "emerald",
  });

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showFeedback("Görsel boyutu 2MB'den küçük olmalıdır.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setBannerFormData((prev) => ({ ...prev, imageUrl: event.target?.result as string }));
        showFeedback("Banner görseli başarıyla yüklendi.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Global Kalıcı Sıfırlama State
  const [isConfirmingWipeAll, setIsConfirmingWipeAll] = useState(false);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (memberRoleFilter !== "all" && u.role !== memberRoleFilter) return false;
      if (memberFocusFilter !== "all" && u.farmingFocus !== memberFocusFilter) return false;
      if (!q) return true;
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, memberSearch, memberRoleFilter, memberFocusFilter]);

  // 7. FABRİKALAR STATE
  const [editingFactoryId, setEditingFactoryId] = useState<string | null>(null);
  const [isAddingNewFactory, setIsAddingNewFactory] = useState(false);
  const [factoryFormData, setFactoryFormData] = useState<Omit<FactoryPrice, "id">>({
    factoryName: "",
    basePrice: 28.0,
    supportPayment: 2.0,
    crop: "tea",
    isUserAdded: false,
    paymentTerms: "Peşin / Haftalık / Vadeli",
    effectiveDate: "2026 Sezonu",
    paymentValues: {
      pesin: "Teslim günü peşin nakit",
      haftalik: "Her Cuma günü banka hesabına",
      aylik: "Ay sonunu takip eden 15 gün içinde",
      vadeli: "45 gün vadeli",
    },
    note: "",
  });

  // 8. ÇKS LİNKLERİ STATE
  const cksLinks: CksLinkItem[] = settings.cksLinks || [];
  const [isAddingCksLink, setIsAddingCksLink] = useState(false);
  const [editingCksLinkId, setEditingCksLinkId] = useState<string | null>(null);
  const [cksFormData, setCksFormData] = useState<Omit<CksLinkItem, "id">>({
    title: "",
    url: "",
    description: "",
    badge: "e-Devlet",
    iconType: "building",
  });

  // Toggle Password Visibility
  const toggleShowPassword = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Start Edit Member
  const handleStartEditUser = (u: UserAccount) => {
    setEditingUserId(u.id);
    setEditUserForm({
      fullName: u.fullName,
      username: u.username,
      password: u.password,
      phone: u.phone || "",
      email: u.email || "",
      role: u.role,
      farmingFocus: u.farmingFocus,
    });
  };

  // Save Edit Member
  const handleSaveEditUser = (userId: string) => {
    const existing = users.find((u) => u.id === userId);
    if (!existing) return;
    const updated: UserAccount = {
      ...existing,
      fullName: editUserForm.fullName.trim() || existing.fullName,
      username: editUserForm.username.trim().toLowerCase() || existing.username,
      password: editUserForm.password || existing.password,
      phone: editUserForm.phone.trim() || undefined,
      email: editUserForm.email.trim() || undefined,
      role: editUserForm.role,
      farmingFocus: editUserForm.farmingFocus,
    };
    onUpdateUser(updated);
    setEditingUserId(null);
    showFeedback(`"${updated.fullName}" bilgileri ve şifresi başarıyla güncellendi!`);
  };

  // Delete User without window.confirm blocking
  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      showFeedback("Kendi yönetici hesabınızı silemezsiniz.", "error");
      return;
    }
    onDeleteUser(userId);
    setUserToDeleteId(null);
    showFeedback(`"${userName}" kullanıcısı başarıyla silindi.`);
  };

  // Move Home Section Order
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...currentSectionsOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    onUpdateSettings({ ...settings, homeSectionsOrder: newOrder });
    showFeedback("Ana sayfa menü sıralaması güncellendi!");
  };

  // Save Home Footer Config
  const handleSaveFooterConfig = () => {
    const newFooter: HomeFooterConfig = {
      title: footerTitle.trim(),
      subtitle: footerSubtitle.trim(),
      steps: [
        { title: "Hasat Ekle", desc: footerStep1.trim() },
        { title: "Otomatik Kesinti", desc: footerStep2.trim() },
        { title: "Ödeme Al", desc: footerStep3.trim() },
      ],
      contactNote: footerContact.trim(),
    };
    onUpdateSettings({ ...settings, homeFooter: newFooter });
    showFeedback("Ana sayfa tanımlayıcı alt metinleri başarıyla kaydedildi!");
  };

  // Multi-Ad Banner Handlers
  const handleSaveAllBanners = (updatedList: AdBannerItem[]) => {
    setAdBannersList(updatedList);
    const primary = updatedList[0] || {
      enabled: false,
      title: "",
      badge: "",
      description: "",
      buttonText: "",
      linkUrl: "",
      imageUrl: "",
      bgColor: "emerald",
    };
    onUpdateSettings({
      ...settings,
      adBanners: updatedList,
      adBanner: {
        enabled: primary.enabled,
        title: primary.title,
        badge: primary.badge,
        description: primary.description,
        buttonText: primary.buttonText,
        linkUrl: primary.linkUrl,
        imageUrl: primary.imageUrl,
        bgColor: primary.bgColor,
      },
    });
    try {
      localStorage.setItem("tarim_cepte_global_ad_banners", JSON.stringify(updatedList));
      localStorage.setItem("tarim_cepte_global_ad_banner", JSON.stringify({
        ...primary,
        imageUrl: primary.imageUrl,
      }));
    } catch {
      // ignore
    }
    showFeedback("Reklam & Sponsorluk listesi başarıyla kaydedildi!");
  };

  const handleToggleBannerEnabled = (bannerId: string) => {
    const updated = adBannersList.map((b) =>
      b.id === bannerId ? { ...b, enabled: !b.enabled } : b
    );
    handleSaveAllBanners(updated);
  };

  const handleDeleteBanner = (bannerId: string) => {
    const target = adBannersList.find((b) => b.id === bannerId);
    triggerConfirmDelete(
      "Reklam Bannerını Sil",
      target?.title || "Banner",
      `"${target?.title || "Bu banner"}" reklam/duyuru kaydını kalıcı olarak silmek istediğinizden emin misiniz?`,
      () => {
        const updated = adBannersList.filter((b) => b.id !== bannerId);
        handleSaveAllBanners(updated);
        showFeedback("Banner başarıyla silindi.");
      }
    );
  };

  const handleMoveBanner = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= adBannersList.length) return;
    const updated = [...adBannersList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    handleSaveAllBanners(updated);
  };

  const handleSaveBannerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.title.trim()) {
      showFeedback("Lütfen reklam başlığını girin.", "error");
      return;
    }
    let updated: AdBannerItem[];
    if (editingBannerId) {
      updated = adBannersList.map((b) =>
        b.id === editingBannerId ? { ...b, ...bannerFormData } : b
      );
      setEditingBannerId(null);
    } else {
      const newBanner: AdBannerItem = {
        ...bannerFormData,
        id: `ad-${Date.now()}`,
      };
      updated = [...adBannersList, newBanner];
      setIsAddingNewBanner(false);
    }
    handleSaveAllBanners(updated);
  };

  // Save Factory CRUD
  const handleSaveFactory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryFormData.factoryName.trim()) {
      alert("Lütfen fabrika adını girin.");
      return;
    }
    if (editingFactoryId) {
      const existing = factories.find((f) => f.id === editingFactoryId);
      if (existing) {
        onUpdateFactory({ ...existing, ...factoryFormData });
        showFeedback(`"${factoryFormData.factoryName}" güncellendi.`);
      }
      setEditingFactoryId(null);
    } else {
      onAddFactory(factoryFormData);
      showFeedback(`"${factoryFormData.factoryName}" sisteme eklendi.`);
      setIsAddingNewFactory(false);
    }
  };

  // Save CKS Link CRUD
  const handleSaveCksLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cksFormData.title.trim() || !cksFormData.url.trim()) {
      alert("Lütfen başlık ve geçerli link adresini girin.");
      return;
    }
    let updatedList: CksLinkItem[];
    if (editingCksLinkId) {
      updatedList = cksLinks.map((l) =>
        l.id === editingCksLinkId ? { ...l, ...cksFormData } : l
      );
      showFeedback("ÇKS bağlantısı güncellendi.");
      setEditingCksLinkId(null);
    } else {
      const newLink: CksLinkItem = {
        ...cksFormData,
        id: `cks-${Date.now()}`,
      };
      updatedList = [...cksLinks, newLink];
      showFeedback("Yeni ÇKS bağlantısı eklendi.");
      setIsAddingCksLink(false);
    }
    onUpdateSettings({ ...settings, cksLinks: updatedList });
  };

  const handleDeleteCksLink = (linkId: string) => {
    const targetLink = cksLinks.find((l) => l.id === linkId);
    triggerConfirmDelete(
      "e-Devlet ÇKS Bağlantısını Sil",
      targetLink?.title || "ÇKS Bağlantısı",
      `"${targetLink?.title || "e-Devlet ÇKS"}" bağlantısını silmek istediğinizden emin misiniz?`,
      () => {
        const updated = cksLinks.filter((l) => l.id !== linkId);
        onUpdateSettings({ ...settings, cksLinks: updated });
        showFeedback(`"${targetLink?.title || "e-Devlet ÇKS"}" bağlantısı başarıyla silindi.`);
      }
    );
  };

  // Export Activities CSV
  const handleExportCSV = () => {
    let csv = "Tür;Tarih;Açıklama / İsim;Tutar / KG;Detay / Durum\n";
    harvests.forEach((h) => {
      csv += `Hasat;${h.date};${h.buyerName} - ${h.gardenName};${h.quantityKg} KG;${h.netReceivable} TL (${h.status})\n`;
    });
    payments.forEach((p) => {
      csv += `Tahsilat;${p.date};${p.note};${p.amount} TL;${p.paymentMethod}\n`;
    });
    expenses.forEach((e) => {
      csv += `Gider;${e.date};${e.title};${e.amount} TL;${e.category}\n`;
    });
    jobs.forEach((j) => {
      csv += `İş İlanı;${j.startDate};${j.title} (${j.employerName});${j.wageAmount} TL;${j.status}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Tarim_Cepte_Sistem_Raporu_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Sistem raporu CSV olarak indirildi!");
  };

  // Copy Full System Summary to Clipboard
  const handleCopySystemSummary = () => {
    const totalKg = harvests.reduce((acc, h) => acc + h.quantityKg, 0);
    const totalGross = harvests.reduce((acc, h) => acc + h.grossAmount, 0);
    const totalNet = harvests.reduce((acc, h) => acc + h.netReceivable, 0);
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
    const pendingBalance = Math.max(0, totalNet - totalPaid);

    const summary = `=== TARIM CEPTE AI - RESMİ SİSTEM YÖNETİCİ RAPORU ===
Oluşturulma Tarihi: ${new Date().toLocaleString("tr-TR")}
Yönetici: ${currentUser.fullName} (@${currentUser.username})

--- KULLANICI İSTATİSTİKLERİ ---
Kayıtlı Toplam Üye: ${users.length}
Yönetici Sayısı: ${users.filter((u) => u.role === "admin").length}
Çiftçi / İşveren: ${users.filter((u) => u.role === "employer").length}
Çavuş / Ekip Lideri: ${users.filter((u) => u.role === "crew_leader").length}
Bireysel İşçi: ${users.filter((u) => u.role === "worker").length}
Hizmet Sağlayıcı: ${users.filter((u) => u.role === "service_provider").length}

--- FİNANSAL & HASAT METRİKLERİ ---
Toplam Teslim Edilen Hasat: ${totalKg.toLocaleString("tr-TR")} KG
Toplam Brüt Hasılat: ${totalGross.toLocaleString("tr-TR")} TL
Toplam Net Alacak: ${totalNet.toLocaleString("tr-TR")} TL
Tahsil Edilen Tutar: ${totalPaid.toLocaleString("tr-TR")} TL
Kalan Bekleyen Vadeli Bakiye: ${pendingBalance.toLocaleString("tr-TR")} TL
Toplam İşletme Gideri: ${totalExp.toLocaleString("tr-TR")} TL
Tahmini Net Kâr: ${(totalNet - totalExp).toLocaleString("tr-TR")} TL

--- PAZAR YERİ VE İŞGÜCÜ VERİLERİ ---
İlan Sayısı: ${jobs.length} (Aktif: ${jobs.filter((j) => j.status === "active").length})
Kayıtlı Çavuş / Ekip: ${crews.length}
Kayıtlı Bireysel İşçi: ${workers.length}
Toplam İş Başvurusu: ${applications.length}
Tarımsal Hizmet İlanı: ${services.length}
Kayıtlı Fabrika & Tüccar: ${factories.length}
`;
    navigator.clipboard.writeText(summary);
    showFeedback("Sistem özeti panoya kopyalandı!");
  };

  const SECTION_TITLES: Record<HomeSectionId, { title: string; desc: string }> = {
    ad_banner: {
      title: "Reklam, Sponsorluk & Duyuru Banner'ı",
      desc: "Üreticilere duyurulan özel kampanya veya sponsorluk alanı",
    },
    hero_stats: {
      title: "Ana Hasat Özeti & Teslimat İstatistiği",
      desc: "Teslim edilen toplam KG, brüt tutar ve bakiye kartı",
    },
    quick_actions: {
      title: "Hızlı Eylem & İşlem Menüleri",
      desc: "Hasat Ekle, Ödeme Al, Gider Ekle ve Pazar Yeri kısayolları",
    },
    recent_harvests: {
      title: "Son Hasat & Fabrika Teslimatları",
      desc: "Fabrikalara yapılan en son teslimatların detaylı listesi",
    },
    agri_advice: {
      title: "Bölgesel Zirai Tavsiyeler & Takvim",
      desc: "Çay ve fındık bakım takvimi, gübreleme ve budama önerileri",
    },
    footer_info: {
      title: "Tanımlayıcı Açıklama & Başlama Rehberi",
      desc: "Ana sayfanın en altında yer alan bilgilendirici rehber ve adımlar",
    },
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-control-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div
        id="admin-control-modal-card"
        className={`w-full max-w-5xl rounded-3xl shadow-2xl border my-4 transition-all overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? "bg-[#0b1b14] border-amber-500/40 text-emerald-50"
            : "bg-white border-amber-400 text-gray-900"
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? "bg-gradient-to-r from-[#171206] via-[#1a1c11] to-[#0c1f17] border-amber-500/30"
              : "bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-black text-base sm:text-xl tracking-tight flex items-center gap-2 ${isDark ? "text-amber-400" : "text-amber-950"}`}>
                  <span>SİSTEM YÖNETİCİ & DENETİM MERKEZİ</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-amber-200 text-amber-950 border-amber-400"}`}>
                    Admin Bölümü
                  </span>
                </h2>
              </div>
              <p className={`text-xs ${isDark ? "opacity-80" : "text-gray-800 font-semibold"}`}>
                Tüm üye, şifre, menü sıralaması, reklam, fabrika ve e-Devlet link yetkileri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySystemSummary}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${isDark ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30" : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"}`}
              title="Tam Sistem İstatistiklerini Panoya Kopyala"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Raporu Kopyala</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2 text-xs font-bold flex items-center justify-between transition-all shrink-0 ${
              feedbackMsg.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div
          className={`p-2 border-b overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-thin ${
            isDark ? "bg-[#081510] border-emerald-900/60" : "bg-emerald-50/70 border-emerald-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "members"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kayıtlı Üyeler & Şifreler ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("activities")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "activities"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Tüm Hareketler & Raporlama</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("marketplace")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "marketplace"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pazar Yeri Denetimi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "messages"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mesajlaşma & Toplu Duyuru ({adminMessages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("home_order")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "home_order"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ana Sayfa Menü Sıralaması</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("home_footer")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "home_footer"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ana Sayfa Alt Metinleri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ad_banner")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "ad_banner"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Reklam & Sponsorluk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("factories")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "factories"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Fabrikalar & Alım Koşulları</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cks_links")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === "cks_links"
                ? "bg-amber-500 text-black shadow-md"
                : isDark
                ? "text-amber-200 hover:bg-amber-950/40"
                : "text-amber-900 hover:bg-amber-100"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>e-Devlet ÇKS Linkleri</span>
          </button>
        </div>

        {/* Modal Main Content (Scrollable Body) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* =========================================================================
              TAB 1: KAYITLI ÜYELER, ŞİFRELER VE BİLGİLER
             ========================================================================= */}
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Kayıtlı Sistem Üyeleri ve Şifre Yönetimi</span>
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Tüm üyelerin kullanıcı adı, şifresi, iletişim bilgisi ve rollerini filtreleyin, görüntüleyin ve düzenleyin.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Ad, @kullanıcı adı, tel..."
                      className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={memberRoleFilter}
                    onChange={(e) => setMemberRoleFilter(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-amber-300" : "bg-white border-gray-300 text-amber-900"
                    }`}
                  >
                    <option value="all">Tüm Roller</option>
                    <option value="employer">Bahçe Sahibi (İşveren)</option>
                    <option value="crew_leader">Çavuş (Ekip Lideri)</option>
                    <option value="worker">Bireysel İşçi</option>
                    <option value="service_provider">Tarımsal Hizmet</option>
                    <option value="admin">Sistem Yöneticisi</option>
                  </select>

                  {/* Farming Focus Filter */}
                  <select
                    value={memberFocusFilter}
                    onChange={(e) => setMemberFocusFilter(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300 text-emerald-900"
                    }`}
                  >
                    <option value="all">Tüm Ürünler</option>
                    <option value="tea">🌱 Sadece Çay</option>
                    <option value="hazelnut">🌰 Sadece Fındık</option>
                    <option value="both">🌿 Çay & Fındık</option>
                  </select>

                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-black/30 border border-emerald-800 text-emerald-300">
                    {filteredUsers.length} / {users.length} Üye
                  </span>

                  {selectedMemberIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteMembers}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Seçilenleri Sil ({selectedMemberIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Select All Toggle for Members */}
              {filteredUsers.length > 0 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const deletableUsers = filteredUsers.filter((u) => u.id !== currentUser.id);
                      if (deletableUsers.every((u) => selectedMemberIds.includes(u.id))) {
                        setSelectedMemberIds([]);
                      } else {
                        setSelectedMemberIds(deletableUsers.map((u) => u.id));
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    {filteredUsers.filter((u) => u.id !== currentUser.id).every((u) => selectedMemberIds.includes(u.id))
                      ? "Üye Seçimlerini Kaldır"
                      : "Tüm Üyeleri Seç"}
                  </button>
                </div>
              )}

              {/* Members List Table / Cards */}
              <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div
                    className={`p-6 rounded-2xl border text-center ${
                      isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <p className="font-bold opacity-80 text-xs">Aradığınız kriterlere uygun kayıtlı üye bulunamadı.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMemberSearch("");
                        setMemberRoleFilter("all");
                        setMemberFocusFilter("all");
                      }}
                      className="mt-2 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      Filtreleri Temizle
                    </button>
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isEditingThis = editingUserId === u.id;
                    const isPassVisible = visiblePasswords[u.id];
                    const isConfirmingDeleteThis = userToDeleteId === u.id;

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDark
                            ? "bg-[#10241c] border-emerald-900/80 text-emerald-100"
                            : "bg-white border-gray-200 text-gray-900 shadow-xs"
                        }`}
                      >
                        {isEditingThis ? (
                          /* Edit Member Form Inline */
                          <div className="space-y-3">
                            <div className="font-bold text-xs text-amber-400 flex items-center justify-between">
                              <span>Üye Bilgilerini ve Şifresini Düzenle: {u.fullName}</span>
                              <button
                                type="button"
                                onClick={() => setEditingUserId(null)}
                                className="text-gray-400 hover:text-white text-[11px]"
                              >
                                İptal
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80">Ad Soyad</label>
                                <input
                                  type="text"
                                  value={editUserForm.fullName}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, fullName: e.target.value })
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80">Kullanıcı Adı</label>
                                <input
                                  type="text"
                                  value={editUserForm.username}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, username: e.target.value })
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80 text-amber-300">
                                  Üye Şifresi (Açık Metin)
                                </label>
                                <input
                                  type="text"
                                  value={editUserForm.password}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, password: e.target.value })
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                                    isDark
                                      ? "bg-[#142920] border-amber-600 text-amber-300"
                                      : "bg-amber-50 border-amber-300 text-amber-900"
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80">Telefon</label>
                                <input
                                  type="text"
                                  value={editUserForm.phone}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, phone: e.target.value })
                                  }
                                  placeholder="0532..."
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80">E-Posta</label>
                                <input
                                  type="email"
                                  value={editUserForm.email}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, email: e.target.value })
                                  }
                                  placeholder="ornek@mail.com"
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                                  }`}
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80">Sistem Rolü</label>
                                {u.username.toLowerCase() === "kağan" || u.username.toLowerCase() === "kagan" ? (
                                  <div className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold bg-amber-500/10 border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                                    <span>👑 Sistem Tek Yöneticisi (Admin)</span>
                                  </div>
                                ) : (
                                  <select
                                    value={editUserForm.role === "admin" ? "employer" : editUserForm.role}
                                    onChange={(e) =>
                                      setEditUserForm({ ...editUserForm, role: e.target.value as UserRole })
                                    }
                                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                                    }`}
                                  >
                                    <option value="employer">Kullanıcı (Bahçe Sahibi)</option>
                                    <option value="crew_leader">Kullanıcı (Çavuş / Ekip Lideri)</option>
                                    <option value="worker">Kullanıcı (Bireysel İşçi)</option>
                                    <option value="service_provider">Kullanıcı (Tarımsal Hizmet)</option>
                                  </select>
                                )}
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold mb-1 opacity-80">Tarım Odağı</label>
                                <select
                                  value={editUserForm.farmingFocus}
                                  onChange={(e) =>
                                    setEditUserForm({ ...editUserForm, farmingFocus: e.target.value as FarmingFocus })
                                  }
                                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                                  }`}
                                >
                                  <option value="tea">🌱 Sadece Yaş Çay</option>
                                  <option value="hazelnut">🌰 Sadece Fındık</option>
                                  <option value="both">🌿 Hem Çay Hem Fındık</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1 border-t border-emerald-900/30">
                              <button
                                type="button"
                                onClick={() => setEditingUserId(null)}
                                className="px-3 py-1.5 rounded-lg border border-gray-500/30 text-xs font-bold cursor-pointer"
                              >
                                Vazgeç
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditUser(u.id)}
                                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Değişiklikleri Kaydet</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Member Card View */
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3">
                              {u.id !== currentUser.id && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMemberIds((prev) =>
                                      prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                                    )
                                  }
                                  className="text-gray-400 hover:text-amber-400 shrink-0 mt-1 sm:mt-0 cursor-pointer"
                                >
                                  {selectedMemberIds.includes(u.id) ? (
                                    <CheckSquare className="w-4 h-4 text-amber-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              )}

                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-sm shrink-0">
                                {(u.fullName || u.username)[0]?.toUpperCase()}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-sm">{u.fullName || u.username}</span>
                                  <span className="text-[11px] font-mono text-emerald-400">@{u.username}</span>
                                  <span
                                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                      u.role === "admin"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    }`}
                                  >
                                    {u.role === "admin"
                                      ? "YÖNETİCİ"
                                      : u.role === "employer"
                                      ? "İŞVEREN"
                                      : u.role === "crew_leader"
                                      ? "ÇAVUŞ"
                                      : u.role === "worker"
                                      ? "İŞÇİ"
                                      : "HİZMET"}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] opacity-75 mt-0.5">
                                  {u.phone && <span>📞 {u.phone}</span>}
                                  {u.email && <span>✉️ {u.email}</span>}
                                  <span>🌾 {u.farmingFocus === "tea" ? "Çay" : u.farmingFocus === "hazelnut" ? "Fındık" : "Çay & Fındık"}</span>
                                  <span>📅 Kayıt: {u.createdAt || "2026"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Member Password & Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {/* Password Box */}
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/30 border border-emerald-900/40">
                                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                                <span className="font-mono text-xs font-bold text-amber-300">
                                  {isPassVisible ? u.password : "••••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleShowPassword(u.id)}
                                  className="p-1 text-gray-400 hover:text-white cursor-pointer ml-1"
                                  title={isPassVisible ? "Şifreyi Gizle" : "Şifreyi Gör"}
                                >
                                  {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleStartEditUser(u)}
                                className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Üyeyi ve Şifreyi Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Action with Modal Confirmation */}
                              {u.id !== currentUser.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerConfirmDelete(
                                      "Üyeyi Sistemden Sil",
                                      u.fullName || u.username,
                                      `"${u.fullName || u.username}" (@${u.username}) adlı üyeyi sistemden kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
                                      () => handleDeleteUser(u.id, u.fullName || u.username)
                                    );
                                  }}
                                  className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
                                  title="Üyeyi Sistemden Sil (Onay İster)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: TÜM HAREKETLER VE RAPORLAMA (DENETİM GÜNLÜĞÜ)
             ========================================================================= */}
          {activeTab === "activities" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Sistem Genel Hareketleri & Raporlama</span>
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Hasat, tahsilat, gider ve ilan hareketlerini denetleyin, CSV veya panoya aktarın.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV Rapor İndir</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySystemSummary}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Özet Rapor Kopyala</span>
                  </button>
                </div>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-black/25 border border-emerald-900/60">
                  <span className="text-[10px] opacity-75 block">Toplam Hasat Kaydı</span>
                  <span className="text-base font-black text-emerald-400">
                    {harvests.reduce((a, b) => a + b.quantityKg, 0).toLocaleString("tr-TR")} KG
                  </span>
                  <span className="text-[9px] opacity-60 block">{harvests.length} Teslimat</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/25 border border-emerald-900/60">
                  <span className="text-[10px] opacity-75 block">Toplam Net Alacak</span>
                  <span className="text-base font-black text-emerald-400">
                    {harvests.reduce((a, b) => a + b.netReceivable, 0).toLocaleString("tr-TR")} TL
                  </span>
                  <span className="text-[9px] opacity-60 block">%2 borsa düşülmüş</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/25 border border-emerald-900/60">
                  <span className="text-[10px] opacity-75 block">Yapılan Tahsilatlar</span>
                  <span className="text-base font-black text-teal-400">
                    {payments.reduce((a, b) => a + b.amount, 0).toLocaleString("tr-TR")} TL
                  </span>
                  <span className="text-[9px] opacity-60 block">{payments.length} Tahsilat makbuzu</span>
                </div>

                <div className="p-3 rounded-2xl bg-black/25 border border-emerald-900/60">
                  <span className="text-[10px] opacity-75 block">Kayıtlı Masraf & Gider</span>
                  <span className="text-base font-black text-rose-400">
                    {expenses.reduce((a, b) => a + b.amount, 0).toLocaleString("tr-TR")} TL
                  </span>
                  <span className="text-[9px] opacity-60 block">{expenses.length} Kalem harcama</span>
                </div>
              </div>

              {/* Activity Log List */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs opacity-90">Son Hareketler Denetim Çizelgesi</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {harvests.slice(0, 10).map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-xl bg-black/20 border border-emerald-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                          HASAT
                        </span>
                        <div>
                          <span className="font-bold">{h.buyerName}</span>
                          <span className="opacity-70 text-[11px]"> • {h.gardenName} • {h.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-emerald-400">{h.quantityKg.toLocaleString()} KG</span>
                          <span className="block text-[10px] opacity-75">{h.netReceivable.toLocaleString()} TL</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirmDelete(
                              "Hasat Kaydını Sil",
                              `${h.buyerName} - ${h.quantityKg.toLocaleString()} KG`,
                              `Bu hasat teslimat kaydını silmek istediğinizden emin misiniz?`,
                              () => {
                                onDeleteHarvest(h.id);
                                showFeedback("Hasat kaydı yönetici yetkisiyle silindi.");
                              }
                            );
                          }}
                          className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Hasat Kaydını Sil (Onay İster)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {payments.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-black/20 border border-teal-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300">
                          TAHSİLAT
                        </span>
                        <div>
                          <span className="font-bold">{p.note}</span>
                          <span className="opacity-70 text-[11px]"> • {p.date} • {p.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-400">+{p.amount.toLocaleString()} TL</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirmDelete(
                              "Tahsilat Kaydını Sil",
                              `${p.amount.toLocaleString()} TL (${p.note})`,
                              `Bu tahsilat kaydını silmek istediğinizden emin misiniz?`,
                              () => {
                                onDeletePayment(p.id);
                                showFeedback("Tahsilat kaydı silindi.");
                              }
                            );
                          }}
                          className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Tahsilatı Sil (Onay İster)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {expenses.slice(0, 5).map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 rounded-xl bg-black/20 border border-rose-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                          GİDER
                        </span>
                        <div>
                          <span className="font-bold">{e.title}</span>
                          <span className="opacity-70 text-[11px]"> • {e.date} • {e.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-rose-400">-{e.amount.toLocaleString()} TL</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirmDelete(
                              "Gider Kaydını Sil",
                              `${e.title} - ${e.amount.toLocaleString()} TL`,
                              `Bu gider ve masraf kaydını silmek istediğinizden emin misiniz?`,
                              () => {
                                onDeleteExpense(e.id);
                                showFeedback("Gider masraf kaydı silindi.");
                              }
                            );
                          }}
                          className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Gideri Sil (Onay İster)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: PAZAR YERİ TÜM HAREKETLERİ & MODERASYON
             ========================================================================= */}
          {activeTab === "marketplace" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pazar Yeri Tüm Hareketleri & Moderasyon</span>
                  </h3>
                  <p className="text-[11px] opacity-75">
                    İş ilanları, çavuş ekipleri, işçiler, hizmetler ve başvuruların tamamını denetleyin, toplu olarak silin veya yönetin.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedMarketIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteMarket}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Seçilenleri Sil ({selectedMarketIds.length})</span>
                    </button>
                  )}

                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={marketSearch}
                      onChange={(e) => setMarketSearch(e.target.value)}
                      placeholder="Pazar yerinde ara..."
                      className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border ${
                        isDark
                          ? "bg-[#142920] border-emerald-800 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <select
                    value={marketType}
                    onChange={(e) => setMarketType(e.target.value as any)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-amber-300" : "bg-white border-gray-300 text-amber-900"
                    }`}
                  >
                    <option value="all">Tüm Kategoriler</option>
                    <option value="jobs">İş İlanları ({jobs.length})</option>
                    <option value="crews">Çavuş Ekipleri ({crews.length})</option>
                    <option value="workers">İşçiler ({workers.length})</option>
                    <option value="services">Hizmetler ({services.length})</option>
                    <option value="applications">Başvurular ({applications.length})</option>
                  </select>
                </div>
              </div>

              {/* 1. Job Listings Moderation */}
              {(marketType === "all" || marketType === "jobs") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Kayıtlı İş İlanları ({jobs.length})</span>
                    </h4>
                    {jobs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allJobKeys = jobs.map((j) => `job:${j.id}`);
                          const areAllSelected = allJobKeys.every((k) => selectedMarketIds.includes(k));
                          if (areAllSelected) {
                            setSelectedMarketIds((prev) => prev.filter((k) => !allJobKeys.includes(k)));
                          } else {
                            setSelectedMarketIds((prev) => Array.from(new Set([...prev, ...allJobKeys])));
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        {jobs.every((j) => selectedMarketIds.includes(`job:${j.id}`)) ? "İlan Seçimlerini Kaldır" : "Tüm İlanları Seç"}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {jobs.length === 0 ? (
                      <div className="text-[11px] opacity-60 italic py-1">Kayıtlı iş ilanı bulunmuyor.</div>
                    ) : (
                      jobs
                        .filter(
                          (j) =>
                            !marketSearch ||
                            j.title.toLowerCase().includes(marketSearch.toLowerCase()) ||
                            j.employerName.toLowerCase().includes(marketSearch.toLowerCase()) ||
                            j.locationCity.toLowerCase().includes(marketSearch.toLowerCase())
                        )
                        .map((j) => {
                          const key = `job:${j.id}`;
                          const isSelected = selectedMarketIds.includes(key);
                          return (
                            <div
                              key={j.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                                isSelected
                                  ? "bg-amber-950/40 border-amber-500/60"
                                  : "bg-black/25 border-emerald-900/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMarketIds((prev) =>
                                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                                    )
                                  }
                                  className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                                </button>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm truncate">{j.title}</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                        j.status === "active"
                                          ? "bg-emerald-500/20 text-emerald-300"
                                          : j.status === "filled"
                                          ? "bg-purple-500/20 text-purple-300"
                                          : "bg-gray-500/20 text-gray-300"
                                      }`}
                                    >
                                      {j.status === "active" ? "Aktif" : j.status === "filled" ? "Dolu" : "Pasif"}
                                    </span>
                                  </div>
                                  <div className="opacity-75 text-[11px] mt-0.5 truncate">
                                    {j.employerName} • {j.locationCity} / {j.locationDistrict} • {j.workerCount} İşçi • {j.wageAmount} TL • {j.cropType === "tea" ? "🌱 Çay" : "🌰 Fındık"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus = j.status === "active" ? "filled" : "active";
                                    onUpdateJobStatus(j.id, nextStatus);
                                    showFeedback(`İlan durumu "${nextStatus === 'active' ? 'Aktif' : 'Dolu'}" yapıldı.`);
                                  }}
                                  className="px-2 py-1 rounded bg-black/40 hover:bg-black/60 text-[10px] font-bold border border-emerald-800 cursor-pointer"
                                >
                                  {j.status === "active" ? "Dolu Yap" : "Aktif Yap"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerConfirmDelete(
                                      "İlanı Sil",
                                      j.title,
                                      `"${j.title}" başlıklı ilanı ve bu ilana ait tüm başvuruları kalıcı olarak silmek istediğinizden emin misiniz?`,
                                      () => {
                                        onDeleteJob(j.id);
                                        showFeedback(`"${j.title}" ilanı başarıyla silindi.`);
                                      }
                                    );
                                  }}
                                  className="p-1.5 text-red-400 hover:text-red-300 rounded bg-red-950/30 border border-red-900/40 cursor-pointer"
                                  title="İlanı Sil (Onay İster)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* 2. Crew Leaders Moderation */}
              {(marketType === "all" || marketType === "crews") && (
                <div className="space-y-2 pt-2 border-t border-emerald-900/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-teal-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Çavuşlar & Ekipler ({crews.length})</span>
                    </h4>
                    {crews.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allCrewKeys = crews.map((c) => `crew:${c.id}`);
                          const areAllSelected = allCrewKeys.every((k) => selectedMarketIds.includes(k));
                          if (areAllSelected) {
                            setSelectedMarketIds((prev) => prev.filter((k) => !allCrewKeys.includes(k)));
                          } else {
                            setSelectedMarketIds((prev) => Array.from(new Set([...prev, ...allCrewKeys])));
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        {crews.every((c) => selectedMarketIds.includes(`crew:${c.id}`)) ? "Çavuş Seçimlerini Kaldır" : "Tüm Çavuşları Seç"}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {crews.length === 0 ? (
                      <div className="text-[11px] opacity-60 italic py-1">Kayıtlı çavuş ekibi bulunmuyor.</div>
                    ) : (
                      crews
                        .filter(
                          (c) =>
                            !marketSearch ||
                            c.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
                            (c.location || "").toLowerCase().includes(marketSearch.toLowerCase())
                        )
                        .map((c) => {
                          const key = `crew:${c.id}`;
                          const isSelected = selectedMarketIds.includes(key);
                          return (
                            <div
                              key={c.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isSelected ? "bg-amber-950/40 border-amber-500/60" : "bg-black/25 border-teal-900/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMarketIds((prev) =>
                                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                                    )
                                  }
                                  className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                                </button>
                                <div>
                                  <span className="font-bold">{c.name}</span>
                                  <span className="opacity-75 text-[11px]"> • {c.phone} • {c.location} • {c.crewSize} Kişilik Ekip</span>
                                  <span className="block text-[10px] opacity-60">
                                    {c.expectedDailyWagePerPerson ? `${c.expectedDailyWagePerPerson} TL/Kişi/Gün` : ""} {c.availableDates ? `• ${c.availableDates}` : ""}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerConfirmDelete(
                                    "Çavuş Ekibini Sil",
                                    c.name,
                                    `"${c.name}" çavuş ekibini pazar yerinden kalıcı olarak silmek istediğinizden emin misiniz?`,
                                    () => {
                                      onDeleteCrew(c.id);
                                      showFeedback(`"${c.name}" çavuş ekibi silindi.`);
                                    }
                                  );
                                }}
                                className="p-1.5 text-red-400 hover:text-red-300 rounded bg-red-950/30 border border-red-900/40 cursor-pointer"
                                title="Ekibi Sil (Onay İster)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* 3. Individual Workers Moderation */}
              {(marketType === "all" || marketType === "workers") && (
                <div className="space-y-2 pt-2 border-t border-emerald-900/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Bireysel İşçiler ({workers.length})</span>
                    </h4>
                    {workers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allWorkerKeys = workers.map((w) => `worker:${w.id}`);
                          const areAllSelected = allWorkerKeys.every((k) => selectedMarketIds.includes(k));
                          if (areAllSelected) {
                            setSelectedMarketIds((prev) => prev.filter((k) => !allWorkerKeys.includes(k)));
                          } else {
                            setSelectedMarketIds((prev) => Array.from(new Set([...prev, ...allWorkerKeys])));
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        {workers.every((w) => selectedMarketIds.includes(`worker:${w.id}`)) ? "İşçi Seçimlerini Kaldır" : "Tüm İşçileri Seç"}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {workers.length === 0 ? (
                      <div className="text-[11px] opacity-60 italic py-1">Kayıtlı bireysel işçi bulunmuyor.</div>
                    ) : (
                      workers
                        .filter(
                          (w) =>
                            !marketSearch ||
                            w.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
                            (w.location || "").toLowerCase().includes(marketSearch.toLowerCase())
                        )
                        .map((w) => {
                          const key = `worker:${w.id}`;
                          const isSelected = selectedMarketIds.includes(key);
                          return (
                            <div
                              key={w.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isSelected ? "bg-amber-950/40 border-amber-500/60" : "bg-black/25 border-blue-900/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMarketIds((prev) =>
                                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                                    )
                                  }
                                  className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                                </button>
                                <div>
                                  <span className="font-bold">{w.name}</span>
                                  <span className="opacity-75 text-[11px]"> • {w.phone} • {w.location}</span>
                                  <span className="block text-[10px] opacity-60">
                                    {w.expectedDailyWage ? `${w.expectedDailyWage} TL/Gün` : ""} {w.availabilityStatus === "available" ? "✅ Müsait" : "⏳ Meşgul"}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerConfirmDelete(
                                    "İşçi Profilini Sil",
                                    w.name,
                                    `"${w.name}" işçi profilini kalıcı olarak silmek istediğinizden emin misiniz?`,
                                    () => {
                                      onDeleteWorker(w.id);
                                      showFeedback(`"${w.name}" işçi profili silindi.`);
                                    }
                                  );
                                }}
                                className="p-1.5 text-red-400 hover:text-red-300 rounded bg-red-950/30 border border-red-900/40 cursor-pointer"
                                title="İşçiyi Sil (Onay İster)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* 4. Agricultural Services Moderation */}
              {(marketType === "all" || marketType === "services") && (
                <div className="space-y-2 pt-2 border-t border-emerald-900/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tarımsal Hizmetler ({services.length})</span>
                    </h4>
                    {services.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allServiceKeys = services.map((s) => `service:${s.id}`);
                          const areAllSelected = allServiceKeys.every((k) => selectedMarketIds.includes(k));
                          if (areAllSelected) {
                            setSelectedMarketIds((prev) => prev.filter((k) => !allServiceKeys.includes(k)));
                          } else {
                            setSelectedMarketIds((prev) => Array.from(new Set([...prev, ...allServiceKeys])));
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        {services.every((s) => selectedMarketIds.includes(`service:${s.id}`)) ? "Hizmet Seçimlerini Kaldır" : "Tüm Hizmetleri Seç"}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {services.length === 0 ? (
                      <div className="text-[11px] opacity-60 italic py-1">Kayıtlı hizmet teklifi bulunmuyor.</div>
                    ) : (
                      services
                        .filter(
                          (s) =>
                            !marketSearch ||
                            s.title.toLowerCase().includes(marketSearch.toLowerCase()) ||
                            s.providerName.toLowerCase().includes(marketSearch.toLowerCase())
                        )
                        .map((s) => {
                          const key = `service:${s.id}`;
                          const isSelected = selectedMarketIds.includes(key);
                          return (
                            <div
                              key={s.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isSelected ? "bg-amber-950/40 border-amber-500/60" : "bg-black/25 border-purple-900/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMarketIds((prev) =>
                                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                                    )
                                  }
                                  className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                                </button>
                                <div>
                                  <span className="font-bold">{s.title}</span>
                                  <span className="opacity-75 text-[11px]"> • {s.providerName} • {s.providerPhone} • {s.city}</span>
                                  <span className="block text-[10px] opacity-60">
                                    {s.priceAmount ? `${s.priceAmount} TL` : "Fiyat belirtilmedi"}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerConfirmDelete(
                                    "Hizmeti Sil",
                                    s.title,
                                    `"${s.title}" hizmet ilanını kalıcı olarak silmek istediğinizden emin misiniz?`,
                                    () => {
                                      onDeleteService(s.id);
                                      showFeedback(`"${s.title}" hizmet ilanı silindi.`);
                                    }
                                  );
                                }}
                                className="p-1.5 text-red-400 hover:text-red-300 rounded bg-red-950/30 border border-red-900/40 cursor-pointer"
                                title="Hizmeti Sil (Onay İster)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* 5. Job Applications Moderation */}
              {(marketType === "all" || marketType === "applications") && (
                <div className="space-y-2 pt-2 border-t border-emerald-900/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Pazar Yeri Başvuruları ({applications.length})</span>
                    </h4>
                    {applications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allAppKeys = applications.map((a) => `app:${a.id}`);
                          const areAllSelected = allAppKeys.every((k) => selectedMarketIds.includes(k));
                          if (areAllSelected) {
                            setSelectedMarketIds((prev) => prev.filter((k) => !allAppKeys.includes(k)));
                          } else {
                            setSelectedMarketIds((prev) => Array.from(new Set([...prev, ...allAppKeys])));
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        {applications.every((a) => selectedMarketIds.includes(`app:${a.id}`)) ? "Başvuru Seçimlerini Kaldır" : "Tüm Başvuruları Seç"}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {applications.length === 0 ? (
                      <div className="text-[11px] opacity-60 italic py-1">Henüz iş başvurusu bulunmuyor.</div>
                    ) : (
                      applications
                        .filter(
                          (app) =>
                            !marketSearch ||
                            app.applicantName.toLowerCase().includes(marketSearch.toLowerCase()) ||
                            app.jobTitle.toLowerCase().includes(marketSearch.toLowerCase())
                        )
                        .map((app) => {
                          const key = `app:${app.id}`;
                          const isSelected = selectedMarketIds.includes(key);
                          return (
                            <div
                              key={app.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isSelected ? "bg-amber-950/40 border-amber-500/60" : "bg-black/25 border-amber-900/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMarketIds((prev) =>
                                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                                    )
                                  }
                                  className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                                </button>
                                <div>
                                  <span className="font-bold">{app.applicantName}</span>
                                  <span className="opacity-75 text-[11px]"> • {app.applicantPhone} • {app.jobTitle}</span>
                                  <span className="block text-[10px] opacity-60">Durum: {app.status} • Talep: {app.demandedWage} TL</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerConfirmDelete(
                                    "Başvuruyu Sil",
                                    app.applicantName,
                                    `"${app.applicantName}" tarafından yapılan iş başvurusunu kalıcı olarak silmek istediğinizden emin misiniz?`,
                                    () => {
                                      onDeleteApplication(app.id);
                                      showFeedback(`"${app.applicantName}" başvurusu silindi.`);
                                    }
                                  );
                                }}
                                className="p-1.5 text-red-400 hover:text-red-300 rounded bg-red-950/30 border border-red-900/40 cursor-pointer"
                                title="Başvuruyu Sil (Onay İster)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB: MESAJLAŞMA & TOPLU DUYURU (ADMIN -> TÜM KULLANICILAR & ÖZEL YANITLAR)
             ========================================================================= */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <AdminMessagingSection
                currentUser={currentUser}
                users={users}
                messages={adminMessages}
                onSendMessage={onSendMessage || (() => {})}
                onDeleteMessage={onDeleteMessage}
                isDark={isDark}
              />
            </div>
          )}

          {/* =========================================================================
              TAB 4: ANA SAYFADAKİ MENÜLERİN YER DEĞİŞİKLİKLERİ (SIRALAMA)
             ========================================================================= */}
          {activeTab === "home_order" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>Ana Sayfa Menü & Bölüm Sıralaması</span>
                </h3>
                <p className="text-[11px] opacity-75">
                  Ana sayfadaki kartların, menülerin ve özet blokların görünme sırasını yukarı/aşağı taşıyarak değiştirin.
                </p>
              </div>

              <div className="space-y-2">
                {currentSectionsOrder.map((sectionId, idx) => {
                  const info = SECTION_TITLES[sectionId] || { title: sectionId, desc: "" };

                  return (
                    <div
                      key={sectionId}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isDark
                          ? "bg-[#10241c] border-emerald-900/80 text-emerald-100"
                          : "bg-white border-gray-200 text-gray-900 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs">{info.title}</div>
                          <div className="text-[10px] opacity-70">{info.desc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSection(idx, "up")}
                          className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentSectionsOrder.length - 1}
                          onClick={() => handleMoveSection(idx, "down")}
                          className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const defaultOrder: HomeSectionId[] = [
                      "ad_banner",
                      "hero_stats",
                      "quick_actions",
                      "recent_harvests",
                      "agri_advice",
                      "footer_info",
                    ];
                    onUpdateSettings({ ...settings, homeSectionsOrder: defaultOrder });
                    showFeedback("Varsayılan sıralamaya döndürüldü.");
                  }}
                  className="text-[11px] font-bold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Varsayılan Sıralamayı Yükle</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: ANA SAYFA ALT TANIMLAYICI METİNLERİNİ DEĞİŞTİRME
             ========================================================================= */}
          {activeTab === "home_footer" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Ana Sayfa En Alttaki Tanımlayıcı Metinleri Düzenle</span>
                </h3>
                <p className="text-[11px] opacity-75">
                  Ana sayfanın altında yer alan bilgilendirme rehberi, adımlar ve telif metinlerini özelleştirin.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border space-y-3.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-gray-200 shadow-xs"
                }`}
              >
                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">Ana Başlık</label>
                  <input
                    type="text"
                    value={footerTitle}
                    onChange={(e) => setFooterTitle(e.target.value)}
                    placeholder="Örn: Başlamak çok kolay"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">Alt Açıklama Metni</label>
                  <input
                    type="text"
                    value={footerSubtitle}
                    onChange={(e) => setFooterSubtitle(e.target.value)}
                    placeholder="Örn: İlk kaydınızı birkaç dakikada tamamlayabilirsiniz:"
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold opacity-90">Tanımlayıcı 3 Adım</label>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                    <input
                      type="text"
                      value={footerStep1}
                      onChange={(e) => setFooterStep1(e.target.value)}
                      placeholder="1. Adım açıklaması"
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                    <input
                      type="text"
                      value={footerStep2}
                      onChange={(e) => setFooterStep2(e.target.value)}
                      placeholder="2. Adım açıklaması"
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <input
                      type="text"
                      value={footerStep3}
                      onChange={(e) => setFooterStep3(e.target.value)}
                      placeholder="3. Adım açıklaması"
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 opacity-90">En Alt Telif / Not Metni</label>
                  <input
                    type="text"
                    value={footerContact}
                    onChange={(e) => setFooterContact(e.target.value)}
                    placeholder="Tarım Cepte AI © 2026..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveFooterConfig}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Metinleri Kaydet ve Yayınla</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: ANA SAYFAYA REKLAM & SPONSORLUK EKLEME VE DÜZELTME
             ========================================================================= */}
          {activeTab === "ad_banner" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    <span>Ana Sayfa Reklam, Sponsorluk & Duyuru Banner Yönetimi</span>
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Ana sayfada gösterilecek görsel resimli banner veya renk temalı sponsorlukları ekleyin, sıralayın ve yönetin.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedBannerIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteBanners}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Seçilenleri Sil ({selectedBannerIds.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewBanner(true);
                      setEditingBannerId(null);
                      setBannerFormData({
                        enabled: true,
                        title: "",
                        badge: "Özel Fırsat",
                        description: "",
                        buttonText: "Detayları İncele",
                        linkUrl: "https://www.tarimorman.gov.tr",
                        imageUrl: "",
                        bgColor: "emerald",
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Reklam & Sponsorluk Ekle</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit Banner Form */}
              {(isAddingNewBanner || editingBannerId) && (
                <form
                  onSubmit={handleSaveBannerForm}
                  className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in ${
                    isDark ? "bg-[#10241c] border-amber-500/40" : "bg-amber-50/70 border-amber-300 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                    <span className="font-extrabold text-xs text-amber-400">
                      {editingBannerId ? "Reklam / Sponsorluk Banner'ını Düzenle" : "Yeni Reklam & Sponsorluk Banner'ı Ekle"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewBanner(false);
                        setEditingBannerId(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold mb-1 opacity-90">Banner Başlığı *</label>
                      <input
                        type="text"
                        required
                        value={bannerFormData.title}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                        placeholder="Örn: 🌿 2026 Çay & Fındık Sezonu Özel Kampanyası"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-90">Etiket / Rozet Metni</label>
                      <input
                        type="text"
                        value={bannerFormData.badge || ""}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, badge: e.target.value })}
                        placeholder="Örn: Özel Fırsat / Sponsorlu"
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Resim Banner Alanı (Fotoğraf Yükleme / URL Girme) */}
                  <div className={`p-3 rounded-xl border space-y-2 ${isDark ? "bg-black/30 border-emerald-900/60" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Banner Görseli / Resim Ekle (İsteğe Bağlı)</span>
                      </label>
                      {bannerFormData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setBannerFormData({ ...bannerFormData, imageUrl: "" })}
                          className="text-[10px] text-red-400 hover:underline font-bold"
                        >
                          Görseli Kaldır
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] opacity-75 mb-1 font-bold">1. Görsel Bağlantısı (URL)</label>
                        <input
                          type="url"
                          value={bannerFormData.imageUrl || ""}
                          onChange={(e) => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className={`w-full px-3 py-1.5 rounded-xl text-xs border ${
                            isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] opacity-75 mb-1 font-bold">2. Veya Cihazdan Resim Yükle</label>
                        <label className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer text-xs font-bold text-emerald-400">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Fotoğraf Seç & Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Hızlı Hazır Tarım Görsel Şablonları */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] opacity-60">Örnek Şablon:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setBannerFormData({
                            ...bannerFormData,
                            imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=60",
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                      >
                        🌱 Yeşil Çay Bahçesi
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBannerFormData({
                            ...bannerFormData,
                            imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60",
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold border border-amber-500/30"
                      >
                        🌰 Fındık & Doğa
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBannerFormData({
                            ...bannerFormData,
                            imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60",
                          })
                        }
                        className="px-2 py-0.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-[10px] font-bold border border-blue-500/30"
                      >
                        🚜 Tarım Aletleri
                      </button>
                    </div>

                    {/* Canlı Resim Önizleme */}
                    {bannerFormData.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-emerald-500/40 relative h-28 bg-black/40 flex items-center justify-center">
                        <img
                          src={bannerFormData.imageUrl}
                          alt="Banner Önizleme"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                          <span className="text-white font-extrabold text-xs">{bannerFormData.title || "Banner Önizleme"}</span>
                          <span className="text-[10px] text-gray-200 line-clamp-1">{bannerFormData.description || "Açıklama metni"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 opacity-90">Açıklama Metni</label>
                    <textarea
                      rows={2}
                      value={bannerFormData.description}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                      placeholder="Kampanya veya duyuru açıklaması..."
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-90">Buton Metni</label>
                      <input
                        type="text"
                        value={bannerFormData.buttonText}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                        placeholder="Örn: Detayları İncele"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-90">Yönlendirme Linki (URL)</label>
                      <input
                        type="url"
                        value={bannerFormData.linkUrl}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, linkUrl: e.target.value })}
                        placeholder="https://..."
                        className={`w-full px-3 py-2 rounded-xl text-xs border ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1 opacity-90">Renk Teması</label>
                      <select
                        value={bannerFormData.bgColor || "emerald"}
                        onChange={(e) =>
                          setBannerFormData({
                            ...bannerFormData,
                            bgColor: e.target.value as "emerald" | "amber" | "blue" | "purple",
                          })
                        }
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      >
                        <option value="emerald">Zümrüt Yeşili (Tarım)</option>
                        <option value="amber">Kehribar Sarısı (Duyuru)</option>
                        <option value="blue">Okyanus Mavisi (Resmi / Kurumsal)</option>
                        <option value="purple">Mor (Özel Sponsor)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={bannerFormData.enabled}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, enabled: e.target.checked })}
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <span>Banner Hemen Aktif Olarak Yayınlansın</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewBanner(false);
                          setEditingBannerId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-500/30 text-xs font-bold cursor-pointer"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Kaydet</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Banners List Header with Select All */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-emerald-400">
                  Kayıtlı Reklam ve Duyuru Bannerları ({adBannersList.length})
                </span>
                {adBannersList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBannerIds.length === adBannersList.length) {
                        setSelectedBannerIds([]);
                      } else {
                        setSelectedBannerIds(adBannersList.map((b) => b.id));
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    {selectedBannerIds.length === adBannersList.length ? "Banner Seçimlerini Kaldır" : "Tüm Bannerları Seç"}
                  </button>
                )}
              </div>

              {/* Banners List */}
              <div className="space-y-2.5">
                {adBannersList.map((banner, index) => {
                  const isSelected = selectedBannerIds.includes(banner.id);
                  return (
                    <div
                      key={banner.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-950/40 border-amber-500/60"
                          : banner.enabled
                          ? isDark
                            ? "bg-[#10241c] border-emerald-700/60 shadow-sm"
                            : "bg-white border-emerald-300 shadow-xs"
                          : isDark
                          ? "bg-black/25 border-gray-800 opacity-65"
                          : "bg-gray-100 border-gray-300 opacity-65"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBannerIds((prev) =>
                              prev.includes(banner.id)
                                ? prev.filter((id) => id !== banner.id)
                                : [...prev, banner.id]
                            )
                          }
                          className="text-gray-400 hover:text-amber-400 shrink-0 mt-0.5 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                        </button>

                        {/* Thumbnail if image banner */}
                        {banner.imageUrl && (
                          <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-500/40 bg-black/40">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                                banner.bgColor === "amber"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : banner.bgColor === "blue"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : banner.bgColor === "purple"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {banner.badge || "Sponsorlu"}
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm truncate">{banner.title}</span>
                            {banner.imageUrl && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Resimli Banner
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                                banner.enabled
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {banner.enabled ? "YAYINDA (Aktif)" : "PASİF"}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-75 mt-1 line-clamp-2">{banner.description}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] opacity-70">
                            <span>Buton: <strong>{banner.buttonText}</strong></span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">Link: {banner.linkUrl}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBannerEnabled(banner.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                            banner.enabled
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                              : "bg-gray-700/40 border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {banner.enabled ? "Yayından Kaldır" : "Yayına Al"}
                        </button>

                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveBanner(index, "up")}
                          className="p-1.5 rounded-lg border border-gray-700/50 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={index === adBannersList.length - 1}
                          onClick={() => handleMoveBanner(index, "down")}
                          className="p-1.5 rounded-lg border border-gray-700/50 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingBannerId(banner.id);
                            setIsAddingNewBanner(false);
                            setBannerFormData({
                              enabled: banner.enabled,
                              title: banner.title,
                              badge: banner.badge || "Özel Fırsat",
                              description: banner.description,
                              buttonText: banner.buttonText,
                              linkUrl: banner.linkUrl,
                              imageUrl: banner.imageUrl || "",
                              bgColor: banner.bgColor || "emerald",
                            });
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 cursor-pointer"
                          title="Sil (Onay İster)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 7: FABRİKALAR & ALIM KOŞULLARI (TAM YÖNETİCİ YETKİSİ)
             ========================================================================= */}
          {activeTab === "factories" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Fabrikalar & Alım Koşulları Veri Yönetimi</span>
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Bu alana veri girme, düzeltme ve silme yetkisi yalnızca Admin'e aittir. Kullanıcılar değiştiremez.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedFactoryIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteFactories}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Seçilenleri Sil ({selectedFactoryIds.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewFactory(true);
                      setEditingFactoryId(null);
                      setFactoryFormData({
                        factoryName: "",
                        basePrice: 28.0,
                        supportPayment: 2.0,
                        crop: "tea",
                        isUserAdded: false,
                        paymentTerms: "Peşin, Haftalık, Aylık, Vadeli",
                        effectiveDate: "2026 Sezonu",
                        paymentValues: {
                          pesin: "Teslim günü nakit",
                          haftalik: "Her Cuma günü",
                          aylik: "Ay sonunu takip eden 15 gün",
                          vadeli: "45 gün vadeli çek",
                        },
                        note: "",
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Fabrika & Koşul Ekle</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit Factory Form Modal/Card */}
              {(isAddingNewFactory || editingFactoryId) && (
                <form
                  onSubmit={handleSaveFactory}
                  className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in ${
                    isDark ? "bg-[#10241c] border-amber-500/40" : "bg-amber-50/70 border-amber-300 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                    <span className="font-extrabold text-xs text-amber-400">
                      {editingFactoryId ? "Fabrikayı Düzenle" : "Yeni Fabrika ve Alım Koşulu Ekle"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewFactory(false);
                        setEditingFactoryId(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Fabrika / Alıcı Adı *</label>
                      <input
                        type="text"
                        required
                        value={factoryFormData.factoryName}
                        onChange={(e) =>
                          setFactoryFormData({ ...factoryFormData, factoryName: e.target.value })
                        }
                        placeholder="Örn: ÇAYKUR / Doğuş Çay"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Mahsul Türü</label>
                      <select
                        value={factoryFormData.crop}
                        onChange={(e) =>
                          setFactoryFormData({ ...factoryFormData, crop: e.target.value as "tea" | "hazelnut" })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      >
                        <option value="tea">🌱 Yaş Çay</option>
                        <option value="hazelnut">🌰 Fındık</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Taban Fiyat (TL/KG) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={factoryFormData.basePrice}
                        onChange={(e) =>
                          setFactoryFormData({ ...factoryFormData, basePrice: Number(e.target.value) })
                        }
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold text-emerald-400 ${
                          isDark ? "bg-[#142920] border-emerald-800" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Peşin Ödeme Şartı</label>
                      <input
                        type="text"
                        value={factoryFormData.paymentValues?.pesin || ""}
                        onChange={(e) =>
                          setFactoryFormData({
                            ...factoryFormData,
                            paymentValues: { ...factoryFormData.paymentValues, pesin: e.target.value },
                          })
                        }
                        placeholder="Örn: 27.50 TL Peşin"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Haftalık Şart</label>
                      <input
                        type="text"
                        value={factoryFormData.paymentValues?.haftalik || ""}
                        onChange={(e) =>
                          setFactoryFormData({
                            ...factoryFormData,
                            paymentValues: { ...factoryFormData.paymentValues, haftalik: e.target.value },
                          })
                        }
                        placeholder="Örn: Her Cuma günü"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Aylık Şart</label>
                      <input
                        type="text"
                        value={factoryFormData.paymentValues?.aylik || ""}
                        onChange={(e) =>
                          setFactoryFormData({
                            ...factoryFormData,
                            paymentValues: { ...factoryFormData.paymentValues, aylik: e.target.value },
                          })
                        }
                        placeholder="Örn: Ay sonunu takip eden 15 gün"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Vadeli Şart</label>
                      <input
                        type="text"
                        value={factoryFormData.paymentValues?.vadeli || ""}
                        onChange={(e) =>
                          setFactoryFormData({
                            ...factoryFormData,
                            paymentValues: { ...factoryFormData.paymentValues, vadeli: e.target.value },
                          })
                        }
                        placeholder="Örn: 45 gün vadeli"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewFactory(false);
                        setEditingFactoryId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gray-500/30 text-xs font-bold"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Factories List Header with Select All */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-emerald-400">
                  Kayıtlı Fabrikalar ({factories.length})
                </span>
                {factories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFactoryIds.length === factories.length) {
                        setSelectedFactoryIds([]);
                      } else {
                        setSelectedFactoryIds(factories.map((f) => f.id));
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    {selectedFactoryIds.length === factories.length ? "Fabrika Seçimlerini Kaldır" : "Tüm Fabrikaları Seç"}
                  </button>
                )}
              </div>

              {/* Factories List */}
              <div className="space-y-2">
                {factories.map((f) => {
                  const isSelected = selectedFactoryIds.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-950/40 border-amber-500/60"
                          : isDark
                          ? "bg-[#10241c] border-emerald-900/60"
                          : "bg-white border-gray-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedFactoryIds((prev) =>
                              prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                            )
                          }
                          className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm truncate">{f.factoryName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
                              {f.crop === "tea" ? "Yaş Çay" : "Fındık"}
                            </span>
                            {f.isUserAdded && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-500/20 text-blue-300 shrink-0">
                                Özel Fabrika
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] opacity-75 mt-0.5 truncate">
                            Taban: <strong className="text-emerald-400 font-bold">{f.basePrice.toFixed(2)} TL/KG</strong>
                            {f.supportPayment && ` (+${f.supportPayment.toFixed(2)} TL Destekleme)`}
                            {f.paymentValues?.pesin && ` • Peşin: ${f.paymentValues.pesin}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFactoryId(f.id);
                            setIsAddingNewFactory(false);
                            setFactoryFormData({
                              factoryName: f.factoryName,
                              basePrice: f.basePrice,
                              supportPayment: f.supportPayment || 0,
                              crop: f.crop,
                              isUserAdded: f.isUserAdded,
                              paymentTerms: f.paymentTerms || "Peşin",
                              effectiveDate: f.effectiveDate || "2026 Sezonu",
                              paymentValues: f.paymentValues ? { ...f.paymentValues } : {},
                              note: f.note || "",
                            });
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirmDelete(
                              "Fabrika Kaydını Sil",
                              f.factoryName,
                              `"${f.factoryName}" fabrika ve alım koşulu kaydını kalıcı olarak silmek istediğinizden emin misiniz?`,
                              () => {
                                onDeleteFactory(f.id);
                                showFeedback(`"${f.factoryName}" fabrika kaydı başarıyla silindi.`);
                              }
                            );
                          }}
                          className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 cursor-pointer"
                          title="Sil (Onay İster)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 8: e-DEVLET ÇKS MENÜ VE LİNKLERİNİ DEĞİŞTİRME
             ========================================================================= */}
          {activeTab === "cks_links" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>e-Devlet ÇKS İşlemleri Link Yönetimi</span>
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Üretici & Ruhsat ekranında çiftçilere sunulan resmi e-Devlet ÇKS menü linklerini ekleyin, silin veya düzenleyin.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCksIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteCks}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Seçilenleri Sil ({selectedCksIds.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCksLink(true);
                      setEditingCksLinkId(null);
                      setCksFormData({
                        title: "",
                        url: "",
                        description: "",
                        badge: "e-Devlet",
                        iconType: "building",
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni ÇKS Linki Ekle</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit CKS Link Form */}
              {(isAddingCksLink || editingCksLinkId) && (
                <form
                  onSubmit={handleSaveCksLink}
                  className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in ${
                    isDark ? "bg-[#10241c] border-amber-500/40" : "bg-amber-50/70 border-amber-300 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                    <span className="font-extrabold text-xs text-amber-400">
                      {editingCksLinkId ? "ÇKS Bağlantısını Düzenle" : "Yeni e-Devlet ÇKS Linki Ekle"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCksLink(false);
                        setEditingCksLinkId(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Menü Başlığı *</label>
                      <input
                        type="text"
                        required
                        value={cksFormData.title}
                        onChange={(e) => setCksFormData({ ...cksFormData, title: e.target.value })}
                        placeholder="Örn: ÇKS Belgesi Sorgulama"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">e-Devlet Link Adresi (URL) *</label>
                      <input
                        type="url"
                        required
                        value={cksFormData.url}
                        onChange={(e) => setCksFormData({ ...cksFormData, url: e.target.value })}
                        placeholder="https://www.turkiye.gov.tr/..."
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Açıklama Metni</label>
                      <input
                        type="text"
                        value={cksFormData.description}
                        onChange={(e) => setCksFormData({ ...cksFormData, description: e.target.value })}
                        placeholder="Örn: Barkodlu belge indirme işlemi..."
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-90">Rozet Metni</label>
                      <input
                        type="text"
                        value={cksFormData.badge || ""}
                        onChange={(e) => setCksFormData({ ...cksFormData, badge: e.target.value })}
                        placeholder="Örn: Doğrulama / Başvuru"
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCksLink(false);
                        setEditingCksLinkId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gray-500/30 text-xs font-bold"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Links List Header with Select All */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-emerald-400">
                  Kayıtlı e-Devlet ÇKS Linkleri ({cksLinks.length})
                </span>
                {cksLinks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCksIds.length === cksLinks.length) {
                        setSelectedCksIds([]);
                      } else {
                        setSelectedCksIds(cksLinks.map((l) => l.id));
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    {selectedCksIds.length === cksLinks.length ? "Link Seçimlerini Kaldır" : "Tüm Linkleri Seç"}
                  </button>
                )}
              </div>

              {/* Links List */}
              <div className="space-y-2">
                {cksLinks.map((l) => {
                  const isSelected = selectedCksIds.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-950/40 border-amber-500/60"
                          : isDark
                          ? "bg-[#10241c] border-emerald-900/60"
                          : "bg-white border-gray-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCksIds((prev) =>
                              prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id]
                            )
                          }
                          className="text-gray-400 hover:text-amber-400 shrink-0 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs truncate">{l.title}</span>
                            {l.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-500/20 text-red-300 shrink-0">
                                {l.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] opacity-70 truncate mt-0.5">{l.description}</div>
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{l.url}</span>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCksLinkId(l.id);
                            setIsAddingCksLink(false);
                            setCksFormData({
                              title: l.title,
                              url: l.url,
                              description: l.description,
                              badge: l.badge,
                              iconType: l.iconType,
                            });
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCksLink(l.id)}
                          className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 cursor-pointer"
                          title="Sil (Onay İster)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-900/60" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] opacity-75">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Yönetici: <strong>{currentUser.fullName}</strong> (@{currentUser.username})</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-sm transition-colors"
          >
            Yönetim Merkezini Kapat
          </button>
        </div>
      </div>

      {/* Admin Genel Onay Penceresi (Tüm silme işlemlerinde onay kuralı) */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteState.isOpen}
        onClose={() => setConfirmDeleteState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDeleteState.onConfirm}
        title={confirmDeleteState.title}
        itemName={confirmDeleteState.itemName}
        description={confirmDeleteState.description}
        isDark={isDark}
      />
    </div>
  );
};
