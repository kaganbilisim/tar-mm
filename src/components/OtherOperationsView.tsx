import React, { useState, useMemo } from "react";
import { HarvestAnalytics } from "./HarvestAnalytics";
import {
  HarvestRecord,
  ExpenseRecord,
  PaymentRecord,
  Garden,
  FactoryPrice,
  SeasonType,
  FactoryPaymentOption,
  FactoryPaymentValues,
  AppSettings,
  UserAccount,
  FarmingFocus,
  AdminUserMessage,
} from "../types";
import {
  History,
  Receipt,
  Trees,
  Building2,
  BarChart3,
  Users,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  Filter,
  Calendar,
  Layers,
  LayoutList,
  CheckCircle,
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
  Building,
  AlertTriangle,
  Pencil,
  CreditCard,
  X,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  ExternalLink,
  Compass,
  Navigation,
  Percent,
  Settings,
  UserCheck,
  ArrowLeft,
  MessageSquare,
  Smartphone,
  Download,
} from "lucide-react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { HarvestReportsView } from "./HarvestReportsView";
import { EditExpenseModal } from "./EditExpenseModal";
import { EditGardenModal } from "./EditGardenModal";
import { EditHarvestModal } from "./EditHarvestModal";
import { MapLocationPickerModal } from "./MapLocationPickerModal";
import { AdminMessagingSection } from "./AdminMessagingSection";

interface OtherOperationsViewProps {
  harvests: HarvestRecord[];
  expenses: ExpenseRecord[];
  payments?: PaymentRecord[];
  gardens: Garden[];
  factories: FactoryPrice[];
  isDark: boolean;
  currentUser?: UserAccount | null;
  users?: UserAccount[];
  adminMessages?: AdminUserMessage[];
  farmingFocus?: FarmingFocus;
  onOpenUserSettings?: () => void;
  onOpenPrivacy: () => void;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: string, subTab?: string) => void;
  onOpenAdminModal?: () => void;
  onOpenAndroidModal?: () => void;
  onDeleteHarvest: (id: string) => void;
  onUpdateHarvest?: (harvest: HarvestRecord) => void;
  onDeleteExpense: (id: string) => void;
  onDeleteGarden: (id: string) => void;
  onDeleteFactory: (id: string) => void;
  onAddExpense: (expense: Omit<ExpenseRecord, "id">) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onAddGarden: (garden: Omit<Garden, "id">) => void;
  onUpdateGarden?: (garden: Garden) => void;
  onAddFactory: (factory: Omit<FactoryPrice, "id">) => void;
  onUpdateFactory?: (factory: FactoryPrice) => void;
  onSendAdminMessage?: (message: Omit<AdminUserMessage, "id" | "createdAt">) => void;
  onDeleteAdminMessage?: (id: string) => void;
}

const SEASON_LABELS: Record<SeasonType, { title: string; subtitle: string; tag: string }> = {
  season_1: { title: "1. Sezon", subtitle: "1. Sürüm (Mayıs - Haziran)", tag: "Mayıs Hasadı" },
  season_2: { title: "2. Sezon", subtitle: "2. Sürüm (Temmuz)", tag: "Temmuz Hasadı" },
  season_3: { title: "3. Sezon", subtitle: "3. Sürüm (Ağustos - Eylül)", tag: "Güz Hasadı" },
  season_4: { title: "4. Sezon", subtitle: "4. Sürüm & Fındık (Ekim - Kasım)", tag: "Son Sürüm" },
};

export const OtherOperationsView: React.FC<OtherOperationsViewProps> = ({
  harvests,
  expenses,
  payments = [],
  gardens,
  factories,
  isDark,
  currentUser,
  users = [],
  adminMessages = [],
  farmingFocus = "both",
  onOpenUserSettings,
  onOpenPrivacy,
  onOpenSettings,
  onNavigateTab,
  onOpenAdminModal,
  onOpenAndroidModal,
  onDeleteHarvest,
  onUpdateHarvest,
  onDeleteExpense,
  onDeleteGarden,
  onDeleteFactory,
  onAddExpense,
  onUpdateExpense,
  onAddGarden,
  onUpdateGarden,
  onAddFactory,
  onUpdateFactory,
  onSendAdminMessage,
  onDeleteAdminMessage,
}) => {
  const [activeSubView, setActiveSubView] = useState<
    "menu" | "history" | "expenses" | "gardens" | "prices" | "reports" | "messages"
  >("menu");

  // Hasat Düzenleme State'i
  const [editingHarvest, setEditingHarvest] = useState<HarvestRecord | null>(null);

  // Gider Düzenleme State'i
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  // Confirmation Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    title: string;
    itemName?: string;
    description?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    itemName: "",
    description: "",
    onConfirm: () => {},
  });

  // HASAT GEÇMİŞİ FİLTRE DURUMLARI
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterSeason, setFilterSeason] = useState<string>("all");
  const [filterBuyer, setFilterBuyer] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState<string>("");
  const [harvestViewMode, setHarvestViewMode] = useState<"auto" | "flat" | "grouped">("auto");

  // YENİ GİDER FORMU DURUMLARI (Bahçe Seçimi & Açıklama)
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseRecord["category"]>("fertilizer");
  const [expenseGardenId, setExpenseGardenId] = useState<string>("none");
  const [expenseNote, setExpenseNote] = useState<string>("");
  const [filterExpenseGarden, setFilterExpenseGarden] = useState<string>("all");
  const [expandedGardenExpenses, setExpandedGardenExpenses] = useState<Set<string>>(new Set());

  // YENİ BAHÇE FORMU DURUMLARI (Ayrı Buton ile Açılır)
  const [isAddingGarden, setIsAddingGarden] = useState(false);
  const [gardenName, setGardenName] = useState("");
  const [gardenLocation, setGardenLocation] = useState("");
  const [gardenSize, setGardenSize] = useState("");
  const [gardenCropType, setGardenCropType] = useState<"tea" | "hazelnut">("tea");
  const [gardenAdaNo, setGardenAdaNo] = useState("");
  const [gardenParselNo, setGardenParselNo] = useState("");
  const [gardenLatitude, setGardenLatitude] = useState<number | undefined>();
  const [gardenLongitude, setGardenLongitude] = useState<number | undefined>();
  const [gardenGoogleMapsUrl, setGardenGoogleMapsUrl] = useState<string | undefined>();
  const [gardenNotes, setGardenNotes] = useState("");
  const [isGardenMapPickerOpen, setIsGardenMapPickerOpen] = useState(false);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);

  // YENİ FABRİKA FORMU DURUMLARI (Peşin, Haftalık, Aylık, Vadeli, Diğer)
  const [isAddingFactory, setIsAddingFactory] = useState(false);
  const [factoryName, setFactoryName] = useState("");
  const [factoryCrop, setFactoryCrop] = useState<"tea" | "hazelnut">("tea");
  const [factoryBasePrice, setFactoryBasePrice] = useState("");
  const [factorySupportPayment, setFactorySupportPayment] = useState("");
  const [factoryPayPesin, setFactoryPayPesin] = useState("");
  const [factoryPayHaftalik, setFactoryPayHaftalik] = useState("");
  const [factoryPayAylik, setFactoryPayAylik] = useState("");
  const [factoryPayVadeli, setFactoryPayVadeli] = useState("");
  const [factoryPayDiger, setFactoryPayDiger] = useState("");
  const [factoryNote, setFactoryNote] = useState("");

  // FABRİKA DÜZENLEME DURUMLARI
  const [editingFactory, setEditingFactory] = useState<FactoryPrice | null>(null);
  const [editFactoryName, setEditFactoryName] = useState("");
  const [editFactoryCrop, setEditFactoryCrop] = useState<"tea" | "hazelnut">("tea");
  const [editFactoryBasePrice, setEditFactoryBasePrice] = useState("");
  const [editFactorySupportPayment, setEditFactorySupportPayment] = useState("");
  const [editPayPesin, setEditPayPesin] = useState("");
  const [editPayHaftalik, setEditPayHaftalik] = useState("");
  const [editPayAylik, setEditPayAylik] = useState("");
  const [editPayVadeli, setEditPayVadeli] = useState("");
  const [editPayDiger, setEditPayDiger] = useState("");
  const [editFactoryNote, setEditFactoryNote] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatKg = (val: number) => {
    return new Intl.NumberFormat("tr-TR").format(val);
  };

  // Helper to open confirm delete modal
  const triggerConfirmDelete = (
    title: string,
    itemName: string,
    description: string,
    onConfirm: () => void
  ) => {
    setDeleteModalState({
      isOpen: true,
      title,
      itemName,
      description,
      onConfirm,
    });
  };

  // Unique Years in Harvests
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    harvests.forEach((h) => {
      const yr = h.year || (h.date ? parseInt(h.date.split("-")[0], 10) : 2026);
      if (!isNaN(yr)) years.add(yr);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [harvests]);

  // Unique Buyers in Harvests
  const availableBuyers = useMemo(() => {
    const buyers = new Set<string>();
    harvests.forEach((h) => {
      if (h.buyerName) buyers.add(h.buyerName);
    });
    return Array.from(buyers).sort();
  }, [harvests]);

  // Filtered Harvests
  const filteredHarvests = useMemo(() => {
    return harvests.filter((h) => {
      const yr = String(h.year || (h.date ? parseInt(h.date.split("-")[0], 10) : 2026));
      if (filterYear !== "all" && yr !== filterYear) return false;
      if (filterSeason !== "all" && h.season !== filterSeason) return false;
      if (filterBuyer !== "all" && h.buyerName !== filterBuyer) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const matchBuyer = h.buyerName.toLowerCase().includes(q);
        const matchGarden = h.gardenName.toLowerCase().includes(q);
        const matchNote = h.receiptNote?.toLowerCase().includes(q);
        if (!matchBuyer && !matchGarden && !matchNote) return false;
      }
      return true;
    });
  }, [harvests, filterYear, filterSeason, filterBuyer, filterSearch]);

  // Group Filtered Harvests by Year, then by Season
  const groupedHarvests = useMemo(() => {
    const map: Record<string, Record<SeasonType, HarvestRecord[]>> = {};

    filteredHarvests.forEach((h) => {
      const yr = String(h.year || (h.date ? parseInt(h.date.split("-")[0], 10) : 2026));
      if (!map[yr]) {
        map[yr] = {
          season_1: [],
          season_2: [],
          season_3: [],
          season_4: [],
        };
      }
      const s = h.season || "season_1";
      map[yr][s].push(h);
    });

    return map;
  }, [filteredHarvests]);

  // Sezonlara göre istatistikler (Bağlı Olduğu Sezon butonlarında dinamik gösterim için)
  const seasonStats = useMemo(() => {
    const stats: Record<string, { count: number; totalKg: number; totalNet: number }> = {
      all: { count: 0, totalKg: 0, totalNet: 0 },
      season_1: { count: 0, totalKg: 0, totalNet: 0 },
      season_2: { count: 0, totalKg: 0, totalNet: 0 },
      season_3: { count: 0, totalKg: 0, totalNet: 0 },
      season_4: { count: 0, totalKg: 0, totalNet: 0 },
    };

    harvests.forEach((h) => {
      const yr = String(h.year || (h.date ? parseInt(h.date.split("-")[0], 10) : 2026));
      if (filterYear !== "all" && yr !== filterYear) return;
      if (filterBuyer !== "all" && h.buyerName !== filterBuyer) return;
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        const matchBuyer = h.buyerName.toLowerCase().includes(q);
        const matchGarden = h.gardenName.toLowerCase().includes(q);
        const matchNote = h.receiptNote?.toLowerCase().includes(q);
        if (!matchBuyer && !matchGarden && !matchNote) return;
      }

      const s = h.season || "season_1";
      stats.all.count += 1;
      stats.all.totalKg += h.quantityKg;
      stats.all.totalNet += h.netReceivable;

      if (stats[s]) {
        stats[s].count += 1;
        stats[s].totalKg += h.quantityKg;
        stats[s].totalNet += h.netReceivable;
      }
    });

    return stats;
  }, [harvests, filterYear, filterBuyer, filterSearch]);

  // Form Handlers
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || !amt || amt <= 0) return;

    const selGarden = gardens.find((g) => g.id === expenseGardenId);

    onAddExpense({
      date: expenseDate || new Date().toISOString().split("T")[0],
      category: expenseCategory,
      title: expenseTitle.trim(),
      amount: amt,
      gardenId: selGarden ? selGarden.id : undefined,
      gardenName: selGarden ? selGarden.name : undefined,
      note: expenseNote.trim() ? expenseNote.trim() : undefined,
    });
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseNote("");
    setExpenseGardenId("none");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setIsAddingExpense(false);
  };

  const toggleGardenExpenseExpand = (gardenId: string) => {
    setExpandedGardenExpenses((prev) => {
      const next = new Set(prev);
      if (next.has(gardenId)) {
        next.delete(gardenId);
      } else {
        next.add(gardenId);
      }
      return next;
    });
  };

  const handleQuickAddExpenseForGarden = (gardenId: string) => {
    setExpenseGardenId(gardenId);
    setActiveSubView("expenses");
  };

  const handleSaveGarden = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseFloat(gardenSize);
    if (!gardenName.trim() || !gardenLocation.trim()) {
      alert("Lütfen bahçe adını ve konumunu giriniz.");
      return;
    }

    onAddGarden({
      name: gardenName.trim(),
      location: gardenLocation.trim(),
      sizeDecares: size || 5,
      cropType: gardenCropType,
      adaNo: gardenAdaNo.trim() || undefined,
      parselNo: gardenParselNo.trim() || undefined,
      latitude: gardenLatitude,
      longitude: gardenLongitude,
      googleMapsUrl:
        gardenGoogleMapsUrl ||
        (gardenLatitude && gardenLongitude
          ? `https://www.google.com/maps?q=${gardenLatitude},${gardenLongitude}`
          : undefined),
      notes: gardenNotes.trim() || undefined,
    });
    setGardenName("");
    setGardenLocation("");
    setGardenSize("");
    setGardenAdaNo("");
    setGardenParselNo("");
    setGardenLatitude(undefined);
    setGardenLongitude(undefined);
    setGardenGoogleMapsUrl(undefined);
    setGardenNotes("");
    setIsAddingGarden(false);
  };

  // Yalnızca değer girilmiş olan ödeme seçeneklerini döndüren yardımcı fonksiyon
  const getActivePaymentEntries = (f: FactoryPrice) => {
    const list: {
      key: string;
      label: string;
      value: string;
      badge: string;
      dotColor: string;
    }[] = [];

    if (f.paymentValues) {
      if (f.paymentValues.pesin && f.paymentValues.pesin.trim()) {
        list.push({
          key: "pesin",
          label: "Peşin",
          value: f.paymentValues.pesin.trim(),
          badge: isDark
            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
            : "bg-emerald-50 text-emerald-800 border-emerald-200",
          dotColor: "bg-emerald-400",
        });
      }
      if (f.paymentValues.haftalik && f.paymentValues.haftalik.trim()) {
        list.push({
          key: "haftalik",
          label: "Haftalık",
          value: f.paymentValues.haftalik.trim(),
          badge: isDark
            ? "bg-blue-950/60 text-blue-300 border-blue-800/80"
            : "bg-blue-50 text-blue-800 border-blue-200",
          dotColor: "bg-blue-400",
        });
      }
      if (f.paymentValues.aylik && f.paymentValues.aylik.trim()) {
        list.push({
          key: "aylik",
          label: "Aylık",
          value: f.paymentValues.aylik.trim(),
          badge: isDark
            ? "bg-purple-950/60 text-purple-300 border-purple-800/80"
            : "bg-purple-50 text-purple-800 border-purple-200",
          dotColor: "bg-purple-400",
        });
      }
      if (f.paymentValues.vadeli && f.paymentValues.vadeli.trim()) {
        list.push({
          key: "vadeli",
          label: "Vadeli",
          value: f.paymentValues.vadeli.trim(),
          badge: isDark
            ? "bg-amber-950/60 text-amber-300 border-amber-800/80"
            : "bg-amber-50 text-amber-800 border-amber-200",
          dotColor: "bg-amber-400",
        });
      }
      if (f.paymentValues.diger && f.paymentValues.diger.trim()) {
        list.push({
          key: "diger",
          label: "Ek Ödeme Koşulu",
          value: f.paymentValues.diger.trim(),
          badge: isDark
            ? "bg-rose-950/60 text-rose-300 border-rose-800/80"
            : "bg-rose-50 text-rose-800 border-rose-200",
          dotColor: "bg-rose-400",
        });
      }
    }

    // Fallback: daha önce oluşturulup paymentValues olmayan eski fabrikalar için
    if (list.length === 0 && (f.paymentTerms || f.customPaymentDetail)) {
      const term = f.paymentTerms || "Peşin";
      const detail = f.customPaymentDetail || term;
      let label = "Ödeme Şartı";
      let dotColor = "bg-purple-400";
      let badge = isDark
        ? "bg-purple-950/60 text-purple-300 border-purple-800/80"
        : "bg-purple-50 text-purple-800 border-purple-200";

      if (term.toLowerCase().includes("peşin")) {
        label = "Peşin";
        dotColor = "bg-emerald-400";
        badge = isDark
          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/80"
          : "bg-emerald-50 text-emerald-800 border-emerald-200";
      } else if (term.toLowerCase().includes("hafta")) {
        label = "Haftalık";
        dotColor = "bg-blue-400";
        badge = isDark
          ? "bg-blue-950/60 text-blue-300 border-blue-800/80"
          : "bg-blue-50 text-blue-800 border-blue-200";
      } else if (term.toLowerCase().includes("ay")) {
        label = "Aylık";
        dotColor = "bg-purple-400";
        badge = isDark
          ? "bg-purple-950/60 text-purple-300 border-purple-800/80"
          : "bg-purple-50 text-purple-800 border-purple-200";
      } else if (term.toLowerCase().includes("vade")) {
        label = "Vadeli";
        dotColor = "bg-amber-400";
        badge = isDark
          ? "bg-amber-950/60 text-amber-300 border-amber-800/80"
          : "bg-amber-50 text-amber-800 border-amber-200";
      }

      list.push({
        key: "legacy",
        label,
        value: detail,
        badge,
        dotColor,
      });
    }

    return list;
  };

  const handleSaveFactory = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(factoryBasePrice);
    if (!factoryName.trim() || isNaN(price) || price <= 0) {
      alert("Lütfen fabrika adı ve geçerli bir taban fiyat girin.");
      return;
    }

    const support = parseFloat(factorySupportPayment) || 0;

    // Ayrı ayrı girilen ödeme değerlerini topla
    const pv: FactoryPaymentValues = {};
    if (factoryPayPesin.trim()) pv.pesin = factoryPayPesin.trim();
    if (factoryPayHaftalik.trim()) pv.haftalik = factoryPayHaftalik.trim();
    if (factoryPayAylik.trim()) pv.aylik = factoryPayAylik.trim();
    if (factoryPayVadeli.trim()) pv.vadeli = factoryPayVadeli.trim();
    if (factoryPayDiger.trim()) pv.diger = factoryPayDiger.trim();

    const paymentKeys: (keyof FactoryPaymentValues)[] = ["pesin", "haftalik", "aylik", "vadeli", "diger"];
    const activeKeys = paymentKeys.filter((k) => !!pv[k]);
    if (activeKeys.length === 0) {
      alert("Lütfen en az bir ödeme seçeneğine (Peşin, Haftalık, Aylık, Vadeli veya Diğer) değer veya şart giriniz.");
      return;
    }

    const labelMap: Record<keyof FactoryPaymentValues, string> = {
      pesin: "Peşin",
      haftalik: "Haftalık",
      aylik: "Aylık",
      vadeli: "Vadeli",
      diger: "Diğer",
    };
    const terms = activeKeys.map((k) => labelMap[k]).join(", ");
    const primaryOption = (activeKeys[0] || "pesin") as FactoryPaymentOption;

    onAddFactory({
      factoryName: factoryName.trim(),
      crop: factoryCrop,
      basePrice: price,
      supportPayment: support > 0 ? support : undefined,
      paymentOption: primaryOption,
      paymentValues: pv,
      customPaymentDetail: pv[activeKeys[0]],
      paymentTerms: terms,
      effectiveDate: "2026 Sezonu",
      note: factoryNote.trim() || undefined,
      isUserAdded: true,
      userId: currentUser?.id,
      createdBy: currentUser?.fullName || currentUser?.username,
    });

    // Reset Form
    setFactoryName("");
    setFactoryBasePrice("");
    setFactorySupportPayment("");
    setFactoryPayPesin("");
    setFactoryPayHaftalik("");
    setFactoryPayAylik("");
    setFactoryPayVadeli("");
    setFactoryPayDiger("");
    setFactoryNote("");
    setIsAddingFactory(false);
  };

  const handleStartEditFactory = (f: FactoryPrice) => {
    setEditingFactory(f);
    setEditFactoryName(f.factoryName);
    setEditFactoryCrop(f.crop);
    setEditFactoryBasePrice(String(f.basePrice));
    setEditFactorySupportPayment(f.supportPayment ? String(f.supportPayment) : "");

    const pv = f.paymentValues;
    setEditPayPesin(pv?.pesin || (f.paymentOption === "pesin" ? (f.customPaymentDetail || f.paymentTerms) : ""));
    setEditPayHaftalik(pv?.haftalik || (f.paymentOption === "haftalik" ? (f.customPaymentDetail || f.paymentTerms) : ""));
    setEditPayAylik(pv?.aylik || (f.paymentOption === "aylik" ? (f.customPaymentDetail || f.paymentTerms) : ""));
    setEditPayVadeli(pv?.vadeli || (f.paymentOption === "vadeli" ? (f.customPaymentDetail || f.paymentTerms) : ""));
    setEditPayDiger(pv?.diger || (f.paymentOption === "diger" ? (f.customPaymentDetail || f.paymentTerms) : ""));

    setEditFactoryNote(f.note || "");
  };

  const handleCancelEditFactory = () => {
    setEditingFactory(null);
  };

  const handleSaveEditFactory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactory) return;

    const price = parseFloat(editFactoryBasePrice);
    if (!editFactoryName.trim() || isNaN(price) || price <= 0) {
      alert("Lütfen fabrika adı ve geçerli bir taban fiyat giriniz.");
      return;
    }

    const support = parseFloat(editFactorySupportPayment) || 0;

    // Ayrı ayrı girilen ödeme değerlerini topla
    const pv: FactoryPaymentValues = {};
    if (editPayPesin.trim()) pv.pesin = editPayPesin.trim();
    if (editPayHaftalik.trim()) pv.haftalik = editPayHaftalik.trim();
    if (editPayAylik.trim()) pv.aylik = editPayAylik.trim();
    if (editPayVadeli.trim()) pv.vadeli = editPayVadeli.trim();
    if (editPayDiger.trim()) pv.diger = editPayDiger.trim();

    const paymentKeys: (keyof FactoryPaymentValues)[] = ["pesin", "haftalik", "aylik", "vadeli", "diger"];
    const activeKeys = paymentKeys.filter((k) => !!pv[k]);
    if (activeKeys.length === 0) {
      alert("Lütfen en az bir ödeme seçeneğine (Peşin, Haftalık, Aylık, Vadeli veya Diğer) değer veya şart giriniz.");
      return;
    }

    const labelMap: Record<keyof FactoryPaymentValues, string> = {
      pesin: "Peşin",
      haftalik: "Haftalık",
      aylik: "Aylık",
      vadeli: "Vadeli",
      diger: "Diğer",
    };
    const terms = activeKeys.map((k) => labelMap[k]).join(", ");
    const primaryOption = (activeKeys[0] || "pesin") as FactoryPaymentOption;

    const updated: FactoryPrice = {
      ...editingFactory,
      factoryName: editFactoryName.trim(),
      crop: editFactoryCrop,
      basePrice: price,
      supportPayment: support > 0 ? support : undefined,
      paymentOption: primaryOption,
      paymentValues: pv,
      customPaymentDetail: pv[activeKeys[0]],
      paymentTerms: terms,
      note: editFactoryNote.trim() || undefined,
    };

    if (onUpdateFactory) {
      onUpdateFactory(updated);
    }
    setEditingFactory(null);
  };

  return (
    <div id="other-operations-container" className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Tagline */}
      <div className="text-center py-1">
        <h2 className={`text-base md:text-lg font-bold tracking-tight ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>
          Diğer İşlemler
        </h2>
        <p className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-700/80"}`}>
          İhtiyacınız olan bölümü seçin.
        </p>
      </div>

      {activeSubView !== "menu" && (
        <button
          onClick={() => setActiveSubView("menu")}
          className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
            isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"
          }`}
        >
          &larr; Diğer Menüsüne Dön
        </button>
      )}

      {/* Main Menu List */}
      {activeSubView === "menu" && (
        <div className="space-y-2">
          {/* Admin Control Center Card (Only for Admin) */}
          {currentUser?.role === "admin" && onOpenAdminModal && (
            <div
              onClick={onOpenAdminModal}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                isDark
                  ? "bg-gradient-to-r from-amber-950/70 via-amber-900/50 to-amber-950/70 hover:border-amber-500/80 border-amber-500/50 text-amber-100 shadow-lg shadow-black/30"
                  : "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 hover:bg-amber-100 border-amber-400 text-amber-950 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <span>Admin Yönetici Kontrol Merkezi</span>
                    <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-black border border-amber-400/50">
                      Tam Yetki
                    </span>
                  </div>
                  <div className="text-[11px] opacity-80">
                    Üye şifreleri, raporlar, pazar yeri denetimi, fabrika fiyatları, ana sayfa düzeni ve ÇKS linkleri
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </div>
          )}

          {/* Tarım Pazar Yeri & İş Gücü Kartı (Hasat İlanları, Çavuşlar, İşçiler, Hizmetler, Başvurular) */}
          <div
            onClick={() => onNavigateTab?.("marketplace")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-gradient-to-r from-[#0d2a20] to-[#12382c] hover:border-emerald-500/60 border-emerald-500/30 text-emerald-100 shadow-md shadow-black/20"
                : "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:bg-emerald-100/60 border-emerald-300 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-[#06140f] flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Tarım Pazar Yeri & İş Gücü</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/30">
                    Aktif
                  </span>
                </div>
                <div className="text-[11px] opacity-75">
                  Hasat İlanları, Çavuşlar & Ekipler, Bireysel İşçiler, Zirai Hizmetler ve Başvurular
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </div>

          {/* 1. Hasat Özeti */}
          <div
            onClick={() => setActiveSubView("history")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-100"
                : "bg-white hover:bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Hasat Özeti</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                    1, 2, 3 ve 4. Sezon
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  Yıllara ve sezonlara göre ayrılmış hasatlar ({harvests.length} kayıt)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>

          {/* 2. Gider ve Masraf Yönetimi */}
          <div
            onClick={() => setActiveSubView("expenses")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-100"
                : "bg-white hover:bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Gider ve Masraf Yönetimi</div>
                <div className="text-[11px] opacity-70">
                  Masrafları ekleyin ve takip edin ({expenses.length} harcama)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>

          {/* 3. Bahçe ve Parsel Yönetimi */}
          <div
            onClick={() => setActiveSubView("gardens")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-100"
                : "bg-white hover:bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Trees className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Bahçe ve Parsel Yönetimi</div>
                <div className="text-[11px] opacity-70">
                  Bahçelerinizi tanımlayın ve yönetin ({gardens.length} bahçe kayıtlı)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>

          {/* 4. Fabrika Fiyatları & Yeni Fabrika Ekle */}
          <div
            onClick={() => setActiveSubView("prices")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-100"
                : "bg-white hover:bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Fabrika Fiyatları & Yönetimi</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-semibold">
                    Yeni Fabrika Ekle
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  Fabrika fiyatları, peşin/vadeli şartlar ve yeni fabrika tanımlama ({factories.length} fabrika)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>

          {/* 5. Admin / Yönetici İletişim & Mesajlaşma */}
          <div
            onClick={() => setActiveSubView("messages")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-gradient-to-r from-[#10241c] to-[#0e3022] hover:border-amber-500/60 border-amber-800/40 text-emerald-100 shadow-xs"
                : "bg-gradient-to-r from-amber-50/70 to-emerald-50 hover:bg-amber-100/60 border-amber-300/80 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>{currentUser?.role === "admin" ? "Yönetici Mesajlaşma & Toplu Duyuru" : "Admin ile Mesajlaşma & İletişim"}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-500/30">
                    {currentUser?.role === "admin" ? "Toplu & Özel Mesaj" : "Karşılıklı İletişim"}
                  </span>
                </div>
                <div className="text-[11px] opacity-75">
                  {currentUser?.role === "admin"
                    ? "Kullanıcı taleplerini yanıtlayın, özel mesaj yazın veya tüm üyelere toplu duyuru gönderin"
                    : "Yöneticiye (Kağan) doğrudan mesaj iletin, karşılıklı yanıtlaşın ve toplu duyuruları görün"}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </div>

          {/* 6. Raporlar */}
          <div
            onClick={() => setActiveSubView("reports")}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-100"
                : "bg-white hover:bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Raporlar & Analiz</div>
                <div className="text-[11px] opacity-70">
                  Hasat, teslimat ve gelir özetinizi grafiklerle görüntüleyin
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>

          {/* 6. Gelişmiş Ayarlar ve Kesinti Yönetimi */}
          <div
            onClick={onOpenSettings || onOpenPrivacy}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-900/60 text-emerald-100"
                : "bg-white hover:bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Gelişmiş Ayarlar & Kesinti Yönetimi</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-semibold">
                    Borsa / Stopaj
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  Kesinti (Borsa Tescil / Stopaj) manuel oranları, üretici kimliği ve veri güvenliği
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>

          {/* 7. Kullanıcı Hesabı & Profil Ayarları */}
          <div
            id="menu-user-account-settings"
            onClick={onOpenUserSettings}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-[#10241c] hover:bg-[#142f24] border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/20"
                : "bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-300 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>{currentUser ? "Kullanıcı Hesabı & Profil Ayarları" : "Giriş Yap / Üye Ol"}</span>
                  {currentUser ? (
                    currentUser.username === "kağan" ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                        Ana Yönetici (kağan)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                        @{currentUser.username}
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                      Oturum Kapalı
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-75">
                  {currentUser
                    ? "Üretim amacı (Çay / Fındık / Her İkisi), şifre değiştirme ve hesap güvenliği"
                    : "Hesabınıza giriş yapın veya yeni üretici kaydı oluşturun"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                {farmingFocus === "tea" ? "🍃 Sadece Çay" : farmingFocus === "hazelnut" ? "🌰 Sadece Fındık" : "🌾 Çay & Fındık"}
              </span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>

          {/* 8. Android Uygulaması (APK & PWA Kurulumu) */}
          <div
            id="menu-android-app-settings"
            onClick={onOpenAndroidModal}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isDark
                ? "bg-gradient-to-r from-[#10241c] via-[#0d2a1f] to-[#10241c] hover:from-[#143025] hover:to-[#143025] border-emerald-500/40 text-emerald-100 shadow-xs ring-1 ring-emerald-500/20"
                : "bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-300 text-gray-900 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Android Uygulaması (APK / PWA)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-400/30">
                    Telefona Yükle
                  </span>
                </div>
                <div className="text-[11px] opacity-75">
                  Tam ekran Android deneyimi, çevrimdışı çaylık kullanımı ve GPS parsel desteği
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBVIEW: HASAT GEÇMİŞİ (YILLARA VE 1., 2., 3., 4. SEZONLARA BÖLÜNMÜŞ + FİLTRELİ)
         ========================================================================= */}
      {activeSubView === "history" && (
        <div className="space-y-4">
          {/* Başlık ve Genel Sayaç */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Hasat Özeti & Sezon Bölümleri</span>
              </h3>
              <p className="text-[11px] opacity-75">
                Yıllara göre 1., 2., 3. ve 4. sürüm sezon teslimatları
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 w-fit">
              {filteredHarvests.length} Kayıt Gösteriliyor
            </span>
          </div>

          {/* D3.js Aylık Hasat Verimliliği Grafiği */}
          <HarvestAnalytics harvests={harvests} isDark={isDark} />

          {/* =========================================================================
              BAĞLI OLDUĞU SEZON BUTONLARI (1. Sezon, 2. Sezon, 3. Sezon, 4. Sezon, Tümü)
             ========================================================================= */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/70 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Bağlı Olduğu Sezon:</span>
              </span>
              <span className="text-[11px] opacity-70">
                {filterSeason === "all"
                  ? "Tüm Sezonlar Aktif"
                  : `${SEASON_LABELS[filterSeason as SeasonType]?.title} listeleniyor`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Tüm Sezonlar Butonu */}
              <button
                type="button"
                onClick={() => setFilterSeason("all")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterSeason === "all"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400/40"
                    : isDark
                    ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-200 hover:bg-[#142920]"
                    : "bg-white border-gray-200 text-gray-800 hover:bg-emerald-50"
                }`}
              >
                <div className="font-extrabold text-xs flex items-center justify-between">
                  <span>Tüm Sezonlar</span>
                  {filterSeason === "all" && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="text-[10px] opacity-80 mt-1 flex items-center justify-between">
                  <span>{seasonStats.all.count} Teslimat</span>
                  <span className="font-bold">{formatKg(seasonStats.all.totalKg)} KG</span>
                </div>
              </button>

              {/* 1., 2., 3., 4. Sezon Butonları */}
              {(["season_1", "season_2", "season_3", "season_4"] as SeasonType[]).map((sKey) => {
                const info = SEASON_LABELS[sKey];
                const sStat = seasonStats[sKey];
                const isSelected = filterSeason === sKey;

                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => setFilterSeason(isSelected ? "all" : sKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400/40"
                        : isDark
                        ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-200 hover:bg-[#142920]"
                        : "bg-white border-gray-200 text-gray-800 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="font-extrabold text-xs flex items-center justify-between">
                      <span>{info.title}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="text-[10px] opacity-75 truncate">{info.subtitle.split(" (")[0]}</div>
                    <div className="text-[10px] opacity-85 mt-1 flex items-center justify-between">
                      <span>{sStat.count} Teslimat</span>
                      <span className="font-bold text-emerald-300">{formatKg(sStat.totalKg)} KG</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
              FİLTRELEME ÇUBUĞU (Yıl, Alıcı Fabrika, Arama & Alt Alta Sıralama Seçenekleri)
             ========================================================================= */}
          <div
            className={`p-3.5 rounded-2xl border space-y-3 ${
              isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/50 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Hasat Filtreleme Seçenekleri</span>
              </div>

              {/* Liste Düzeni Seçimi (Alt Alta Sıralı Liste / Sezon Bölümleri) */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-emerald-900/40">
                <button
                  type="button"
                  onClick={() => setHarvestViewMode("flat")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    harvestViewMode === "flat" ||
                    (harvestViewMode === "auto" &&
                      (filterYear !== "all" ||
                        filterSeason !== "all" ||
                        filterBuyer !== "all" ||
                        filterSearch.trim() !== ""))
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title="Tüm filtrelenen kayıtları alt alta tarihe göre sırala"
                >
                  <LayoutList className="w-3 h-3" />
                  <span>Alt Alta Sıralı</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHarvestViewMode("grouped")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    harvestViewMode === "grouped"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title="Yıl ve sezon bölümleri halinde göster"
                >
                  <Layers className="w-3 h-3" />
                  <span>Sezon Bölümleri</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Yıl Filtresi */}
              <div>
                <label className="block text-[10px] uppercase font-bold opacity-75 mb-1">
                  Yıl Seçimi
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                >
                  <option value="all">Tüm Yıllar</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={String(yr)}>
                      {yr} Yılı
                    </option>
                  ))}
                </select>
              </div>

              {/* Fabrika / Alıcı Filtresi */}
              <div>
                <label className="block text-[10px] uppercase font-bold opacity-75 mb-1">
                  Alıcı Fabrika
                </label>
                <select
                  value={filterBuyer}
                  onChange={(e) => setFilterBuyer(e.target.value)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                >
                  <option value="all">Tüm Fabrikalar</option>
                  {availableBuyers.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Arama Kutusu */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 opacity-60 text-emerald-400" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Bahçe adı, fiş/kantar notu veya alıcı ara..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white placeholder-emerald-700"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          {/* =========================================================================
              HASAT KAYITLARI GÖRÜNÜMÜ (ALT ALTA SIRALANMIŞ LİSTE VEYA BÖLÜMLER)
             ========================================================================= */}
          {filteredHarvests.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-emerald-800/40 opacity-75 text-xs">
              Seçilen filtrelere uygun hasat kaydı bulunamadı.
            </div>
          ) : harvestViewMode === "flat" ||
            (harvestViewMode === "auto" &&
              (filterYear !== "all" ||
                filterSeason !== "all" ||
                filterBuyer !== "all" ||
                filterSearch.trim() !== "")) ? (
            /* =========================================================================
               ALT ALTA SIRALANMIŞ LİSTE (Hasat Filtreleme veya Sezon Seçiminde)
               ========================================================================= */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs opacity-75">
                <span>
                  {filterSeason !== "all" ? `${SEASON_LABELS[filterSeason as SeasonType]?.title} - ` : ""}
                  Filtrelenen {filteredHarvests.length} kayıt alt alta listeleniyor
                </span>
                <span className="font-bold text-emerald-400">
                  Toplam: {formatKg(filteredHarvests.reduce((acc, h) => acc + h.quantityKg, 0))} KG
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredHarvests
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((h) => {
                    const seasonInfo = SEASON_LABELS[h.season || "season_1"];
                    return (
                      <div
                        key={h.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDark
                            ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-100 hover:border-emerald-700/60"
                            : "bg-white border-gray-200 text-gray-900 shadow-xs hover:border-emerald-300"
                        }`}
                      >
                        {/* Üst Satır: Alıcı Adı, Durum/Sezon Rozeti & GÖRSEL OLARAK İYİLEŞTİRİLMİŞ Düzenle/Sil Butonları */}
                        <div className="flex items-center justify-between gap-2 border-b border-emerald-900/20 pb-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className={`font-black text-sm md:text-base truncate ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                              {h.buyerName}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                h.status === "completed"
                                  ? isDark
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold"
                                  : isDark
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-amber-100 text-amber-950 border border-amber-300 font-bold"
                              }`}
                            >
                              {h.status === "completed" ? "Tahsil Edildi" : "Vadeli Açık"}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-950 border-emerald-300"}`}>
                              {seasonInfo.title}
                            </span>
                          </div>

                          {/* Düzenle ve Sil Butonları - Üst Sağda Temiz ve Belirgin */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingHarvest(h)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                isDark
                                  ? "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80"
                                  : "bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-300"
                              }`}
                              title="Hasat Kaydını Düzenle / Sezon Değiştir"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Düzenle</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                triggerConfirmDelete(
                                  "Hasat Kaydını Sil",
                                  `${h.buyerName} - ${formatKg(h.quantityKg)} KG (${h.date})`,
                                  "Bu hasat teslimat kaydı ve buna bağlı bakiye bilgisi kalıcı olarak silinecektir.",
                                  () => onDeleteHarvest(h.id)
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                isDark
                                  ? "bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/60"
                                  : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold"
                              }`}
                              title="Hasat Kaydını Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Sil</span>
                            </button>
                          </div>
                        </div>

                        {/* Alt Satır: Tarih, KG/Fiyat, Bahçe Bilgisi & Finansal Özet */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="text-[11px] opacity-85 flex items-center gap-2 flex-wrap">
                              <span className="font-semibold flex items-center gap-1">
                                <Calendar className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                                {h.date}
                              </span>
                              <span>•</span>
                              <span className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                                {formatKg(h.quantityKg)} KG
                              </span>
                              <span>@</span>
                              <span className="font-bold">{h.unitPriceGross.toFixed(2)} TL/KG</span>
                            </div>

                            <div className={`text-[10px] flex items-center gap-2 flex-wrap ${isDark ? "opacity-70" : "text-emerald-950 font-semibold"}`}>
                              <span>Bahçe: <strong>{h.gardenName}</strong></span>
                              {h.receiptNote && <span>• Not: "{h.receiptNote}"</span>}
                            </div>
                          </div>

                          {/* Finansal Tutar Alanı */}
                          <div className={`p-2 rounded-xl border text-right shrink-0 ${
                            isDark ? "bg-[#07130e] border-emerald-950" : "bg-emerald-50 border-emerald-300 text-emerald-950"
                          }`}>
                            <div className={`text-[10px] ${isDark ? "opacity-70" : "text-emerald-900 font-medium"}`}>
                              Brüt: {formatCurrency(h.grossAmount || h.quantityKg * h.unitPriceGross)}
                            </div>
                            {h.deductionAmount > 0 && (
                              <div className={`text-[10px] font-bold ${isDark ? "text-red-400" : "text-red-700"}`}>
                                Kesinti: -{formatCurrency(h.deductionAmount)}
                              </div>
                            )}
                            <div className={`font-black text-sm pt-0.5 ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                              Net: {formatCurrency(h.netReceivable)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* =========================================================================
               YILLARA VE SEZONLARA GÖRE GRUPLANMIŞ BÖLÜMLER
               ========================================================================= */
            <div className="space-y-6">
              {Object.keys(groupedHarvests)
                .sort((a, b) => Number(b) - Number(a))
                .map((yearKey) => {
                  const seasonsObj = groupedHarvests[yearKey];
                  const totalKgInYear = (["season_1", "season_2", "season_3", "season_4"] as SeasonType[]).reduce(
                    (acc, sKey) => acc + seasonsObj[sKey].reduce((sAcc, h) => sAcc + h.quantityKg, 0),
                    0
                  );
                  const totalNetInYear = (["season_1", "season_2", "season_3", "season_4"] as SeasonType[]).reduce(
                    (acc, sKey) => acc + seasonsObj[sKey].reduce((sAcc, h) => sAcc + h.netReceivable, 0),
                    0
                  );

                  return (
                    <div
                      key={yearKey}
                      className={`p-4 rounded-2xl border space-y-4 ${
                        isDark ? "bg-[#0b1c15] border-emerald-900" : "bg-white border-emerald-200 shadow-xs"
                      }`}
                    >
                      {/* Year Banner Header */}
                      <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                          <h4 className={`font-black text-base md:text-lg ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                            {yearKey} Yılı Hasat Sezonları
                          </h4>
                        </div>
                        <div className="text-right text-xs">
                          <span className={`font-black block ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                            {formatKg(totalKgInYear)} KG
                          </span>
                          <span className={`text-[10px] ${isDark ? "opacity-75" : "text-emerald-900 font-semibold"}`}>
                            Toplam Net: {formatCurrency(totalNetInYear)}
                          </span>
                        </div>
                      </div>

                      {/* 1., 2., 3., 4. Sezon Bölümleri */}
                      <div className="space-y-4">
                        {(["season_1", "season_2", "season_3", "season_4"] as SeasonType[]).map((seasonKey) => {
                          const seasonList = seasonsObj[seasonKey];
                          const info = SEASON_LABELS[seasonKey];
                          const seasonTotalKg = seasonList.reduce((acc, h) => acc + h.quantityKg, 0);
                          const seasonTotalNet = seasonList.reduce((acc, h) => acc + h.netReceivable, 0);

                          // Skip season block if filter is active for another season and list is empty
                          if (filterSeason !== "all" && filterSeason !== seasonKey) return null;

                          return (
                            <div
                              key={seasonKey}
                              className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                                isDark
                                  ? "bg-[#11271e] border-emerald-900/70"
                                  : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                              }`}
                            >
                              {/* Season Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-200 text-emerald-950"}`}>
                                    {seasonKey.replace("season_", "")}
                                  </div>
                                  <div>
                                    <div className={`font-black text-xs ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                                      {info.title} - {info.subtitle}
                                    </div>
                                    <div className={`text-[10px] ${isDark ? "opacity-70" : "text-emerald-900 font-medium"}`}>
                                      {info.tag} • {seasonList.length} Teslimat Kaydı
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className={`text-xs font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                                    {formatKg(seasonTotalKg)} KG
                                  </span>
                                  <span className={`text-[10px] block ${isDark ? "opacity-75" : "text-emerald-900 font-semibold"}`}>
                                    {formatCurrency(seasonTotalNet)}
                                  </span>
                                </div>
                              </div>

                              {/* Hasat Kayıtları Listesi */}
                              {seasonList.length === 0 ? (
                                <div className={`text-[11px] italic py-1 pl-2 ${isDark ? "opacity-50" : "text-gray-600 font-medium"}`}>
                                  Bu sezonda henüz teslimat kaydı bulunmuyor.
                                </div>
                              ) : (
                                <div className="space-y-2 pt-1">
                                  {seasonList.map((h) => (
                                    <div
                                      key={h.id}
                                      className={`p-3 rounded-xl border transition-colors ${
                                        isDark
                                          ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-100"
                                          : "bg-white border-emerald-200 text-gray-900"
                                      }`}
                                    >
                                      {/* Kart Başlığı: Alıcı, Durum & İyileştirilmiş Butonlar */}
                                      <div className="flex items-center justify-between gap-2 border-b border-emerald-900/20 pb-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                          <span className={`font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                                            {h.buyerName}
                                          </span>
                                          <span
                                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                                              h.status === "completed"
                                                ? isDark
                                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                  : "bg-emerald-100 text-emerald-950 border-emerald-300"
                                                : isDark
                                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                : "bg-amber-100 text-amber-950 border-amber-300"
                                            }`}
                                          >
                                            {h.status === "completed" ? "Tahsil Edildi" : "Vadeli Açık"}
                                          </span>
                                        </div>

                                        {/* Düzenle ve Sil Butonları */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setEditingHarvest(h)}
                                            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                              isDark
                                                ? "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80"
                                                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-300"
                                            }`}
                                            title="Hasat Kaydını Düzenle / Sezon Değiştir"
                                          >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span className="text-[11px]">Düzenle</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              triggerConfirmDelete(
                                                "Hasat Kaydını Sil",
                                                `${h.buyerName} - ${formatKg(h.quantityKg)} KG (${h.date})`,
                                                "Bu hasat teslimat kaydı ve buna bağlı bakiye bilgisi kalıcı olarak silinecektir.",
                                                () => onDeleteHarvest(h.id)
                                              )
                                            }
                                            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                              isDark
                                                ? "bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/60"
                                                : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold"
                                            }`}
                                            title="Hasat Kaydını Sil"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span className="text-[11px]">Sil</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Kart Gövdesi */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                        <div className="space-y-0.5">
                                          <div className={`text-[11px] flex items-center gap-1 ${isDark ? "opacity-80" : "text-gray-800 font-medium"}`}>
                                            <Calendar className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                                            <span>{h.date}</span>
                                            <span>•</span>
                                            <span className={`font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{formatKg(h.quantityKg)} KG</span>
                                            <span>@ {h.unitPriceGross.toFixed(2)} TL</span>
                                          </div>
                                          <div className={`text-[10px] ${isDark ? "opacity-60" : "text-gray-600 font-medium"}`}>
                                            Bahçe: {h.gardenName} {h.receiptNote ? `• "${h.receiptNote}"` : ""}
                                          </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                          <div className={`font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                                            {formatCurrency(h.netReceivable)}
                                          </div>
                                          {h.deductionAmount > 0 && (
                                            <div className={`text-[10px] font-bold ${isDark ? "text-red-400 opacity-80" : "text-red-700"}`}>
                                              Kesinti: -{formatCurrency(h.deductionAmount)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUBVIEW: GİDERLER (Yeni Gider Ekle + Bahçe Seçimi + Açıklama + Onaylı Silme)
         ========================================================================= */}
      {activeSubView === "expenses" && (
        <div className="space-y-4">
          {/* EKRAN 1: AYRI AÇILAN YENİ GİDER / MASRAF EKLEME EKRANI */}
          {isAddingExpense ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Üst Dönüş Barı */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(false)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDark
                        ? "bg-[#142920] hover:bg-[#1c3a2e] border-emerald-800 text-emerald-300"
                        : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700 shadow-xs"
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>← Yapılan İşlemlere Dön</span>
                  </button>
                  <h3 className="font-bold text-sm md:text-base flex items-center gap-1.5 text-blue-400">
                    <Plus className="w-4 h-4" />
                    <span>Yeni Gider / Masraf Kaydı Ekle</span>
                  </h3>
                </div>
                <span className="text-[11px] opacity-65">* Zorunlu alanlar</span>
              </div>

              {/* Ayrı Ekleme Formu */}
              <form
                onSubmit={handleSaveExpense}
                className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
                  isDark ? "bg-[#10241c] border-emerald-800 text-emerald-100 shadow-lg" : "bg-white border-blue-200 shadow-md"
                }`}
              >
                {/* Gider Başlığı */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Gider Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="Örn: 25 Torba 25-5-10 Çay Gübresi veya Tırpan Motoru Yakıtı"
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-medium ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Bahçe Seçimi (Bahçe ve Parsel Yönetiminden Kayıtlı Bahçelerim) */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1 flex items-center gap-1 text-teal-400">
                    <Trees className="w-3.5 h-3.5" />
                    <span>İlişkili Bahçe (Kayıtlı Bahçelerim)</span>
                  </label>
                  <select
                    value={expenseGardenId}
                    onChange={(e) => setExpenseGardenId(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-medium ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="none">Genel Masraf (Belirli bir bahçeye ait değil)</option>
                    {gardens.map((g) => (
                      <option key={g.id} value={g.id}>
                        🌳 {g.name} ({g.sizeDecares} Dönüm - {g.location})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] opacity-65 mt-1">
                    Kayıtlı bir bahçe seçtiğinizde bu masraf, o bahçenin "Yapılan Masraflar ve Açıklamalar" dökümüne ve net kâr hesabına yansıtılır.
                  </p>
                </div>

                {/* Kategori, Tarih ve Tutar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Kategori</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as any)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="fertilizer">🌱 Gübre</option>
                      <option value="labor_crew">👥 İşçilik / Çavuş</option>
                      <option value="pruning">✂️ Budama</option>
                      <option value="fuel_tools">⛽ Yakıt / Tırpan</option>
                      <option value="sacks">📦 Çuval & Malzeme</option>
                      <option value="other">📑 Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Gider Tarihi</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 text-xs border font-medium ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Tutar (TL) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Örn: 4500"
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold border text-red-400 ${
                        isDark ? "bg-[#142920] border-emerald-800 placeholder:text-gray-500" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Açıklamalar Bölümü */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Masraf Açıklaması ve Detaylar</span>
                  </label>
                  <textarea
                    rows={3}
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    placeholder="Örn: Tarım Kredi Kooperatifinden 25 torba gübre alımı, 500 TL nakliye ücreti dahil peşin ödendi."
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Butonlar */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isDark ? "border-emerald-800 text-gray-300 hover:bg-white/5" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs cursor-pointer transition-all shadow-md flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Gideri Kaydet ve Listeye Ekle</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* EKRAN 2: İLK AÇILIŞ - ÜSTE YENİ GİDER / MASRAF EKLE BUTONU VE YAPILAN İŞLEMLER */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Üst Başlık ve Yeni Gider / Masraf Ekle Butonu */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-900/25 via-emerald-950/20 to-teal-950/30 border border-blue-800/40 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span>Gider ve Masraf Yönetimi</span>
                  </h3>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    Kayıtlı bahçelerinize ait giderleri ve genel harcamaları takip edin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingExpense(true);
                    setExpenseDate(new Date().toISOString().split("T")[0]);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-center shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Yeni Gider / Masraf Ekle</span>
                </button>
              </div>

              {/* Yapılan İşlemler (Özet Kartları) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className={`p-3 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-white border-emerald-200 shadow-2xs"}`}>
                  <span className={`text-[10px] font-bold block ${isDark ? "opacity-70" : "text-gray-700"}`}>Toplam Gider Tutarı</span>
                  <span className={`text-sm sm:text-base font-black ${isDark ? "text-red-400" : "text-red-700"}`}>
                    {formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-white border-emerald-200 shadow-2xs"}`}>
                  <span className={`text-[10px] font-bold block ${isDark ? "opacity-70" : "text-gray-700"}`}>Kayıtlı Masraf Sayısı</span>
                  <span className={`text-sm sm:text-base font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                    {expenses.length} İşlem
                  </span>
                </div>
                <div className={`col-span-2 sm:col-span-1 p-3 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-white border-emerald-200 shadow-2xs"}`}>
                  <span className={`text-[10px] font-bold block ${isDark ? "opacity-70" : "text-gray-700"}`}>Bahçe Masrafları</span>
                  <span className={`text-sm sm:text-base font-black ${isDark ? "text-teal-400" : "text-teal-950"}`}>
                    {formatCurrency(expenses.filter((e) => e.gardenId).reduce((acc, e) => acc + e.amount, 0))}
                  </span>
                </div>
              </div>

          {/* Giderler Filtreleme ve Liste */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <span>Kayıtlı Giderler</span>
                <span className="text-[10px] opacity-75">
                  (Toplam: {formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))})
                </span>
              </h4>

              {/* Bahçe Filtresi */}
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 opacity-60 shrink-0" />
                <select
                  value={filterExpenseGarden}
                  onChange={(e) => setFilterExpenseGarden(e.target.value)}
                  className={`text-xs rounded-lg px-2 py-1 border font-medium ${
                    isDark ? "bg-[#10241c] border-emerald-900 text-emerald-200" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">Tüm Masraflar ({expenses.length})</option>
                  <option value="none">
                    Genel Masraflar ({expenses.filter((e) => !e.gardenId).length})
                  </option>
                  {gardens.map((g) => (
                    <option key={g.id} value={g.id}>
                      🌳 {g.name} ({expenses.filter((e) => e.gardenId === g.id).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Masraf Kartları */}
            {(() => {
              const displayExpenses = expenses.filter((exp) => {
                if (filterExpenseGarden === "none") return !exp.gardenId;
                if (filterExpenseGarden !== "all") return exp.gardenId === filterExpenseGarden;
                return true;
              });

              if (displayExpenses.length === 0) {
                return (
                  <div
                    className={`p-6 rounded-2xl border text-center text-xs space-y-1 ${
                      isDark ? "bg-[#10241c]/40 border-emerald-900/60 text-emerald-300/70" : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Receipt className="w-8 h-8 mx-auto opacity-40 mb-1" />
                    <p className="font-semibold">Seçili filtrede henüz gider kaydı bulunmuyor.</p>
                    <p className="text-[11px] opacity-70">Yukarıdaki formdan yeni masraf ekleyebilirsiniz.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {displayExpenses.map((exp) => {
                    const categoryLabels: Record<string, string> = {
                      fertilizer: "🌱 Gübre",
                      labor_crew: "👥 İşçilik / Çavuş",
                      pruning: "✂️ Budama",
                      fuel_tools: "⛽ Yakıt / Tırpan",
                      sacks: "📦 Çuval & Malzeme",
                      other: "📑 Diğer",
                    };

                    return (
                      <div
                        key={exp.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                          isDark ? "bg-[#0b1c15] border-emerald-900/80 text-emerald-200" : "bg-white border-gray-200 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="font-bold text-sm text-emerald-100 flex items-center gap-2 flex-wrap">
                              <span>{exp.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/15 text-emerald-300">
                                {categoryLabels[exp.category] || exp.category}
                              </span>
                              {exp.gardenName ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                  <Trees className="w-3 h-3" />
                                  <span>{exp.gardenName}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/15 text-gray-400">
                                  Genel Masraf
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] opacity-75">{exp.date}</div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-sm text-red-400 mr-1">
                              -{formatCurrency(exp.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingExpense(exp)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg cursor-pointer transition-colors"
                              title="Gideri Düzenle"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                triggerConfirmDelete(
                                  "Gider Kaydını Sil",
                                  `${exp.title} (${formatCurrency(exp.amount)})`,
                                  "Bu gider kaydı harcama ve kâr/zarar hesaplamalarından silinecektir.",
                                  () => onDeleteExpense(exp.id)
                                )
                              }
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                              title="Gideri Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Açıklama / Not Bölümü */}
                        {exp.note && (
                          <div
                            className={`text-[11px] p-2 rounded-lg flex items-start gap-1.5 ${
                              isDark ? "bg-black/30 border border-emerald-950 text-emerald-200/90" : "bg-emerald-50/60 border border-emerald-100 text-emerald-900"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-teal-300 block">Açıklama:</span>
                              <span className="italic">{exp.note}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUBVIEW: BAHÇELER (Bahçe ve Parsel Yönetimi + Yapılan Masraflar & Açıklamalar)
         ========================================================================= */}
      {activeSubView === "gardens" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <Trees className="w-4 h-4 text-teal-400" />
                <span>Bahçe ve Parsel Yönetimi</span>
              </h3>
              <p className="text-[11px] opacity-75">
                Kayıtlı çaylık ve fındıklık parselleri, yapılan masraflar ve net kâr durumu
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300">
                {gardens.length} Kayıtlı Bahçe
              </span>
              <button
                type="button"
                id="btn-open-add-garden"
                onClick={() => setIsAddingGarden(!isAddingGarden)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-102 ${
                  isAddingGarden
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-teal-600 hover:bg-teal-500 text-white"
                }`}
              >
                {isAddingGarden ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isAddingGarden ? "Formu Kapat" : "Yeni Bahçe / Parsel Ekle"}</span>
              </button>
            </div>
          </div>

          {/* Top Overall Gardens Summary KPI */}
          {(() => {
            const totalDecares = gardens.reduce((acc, g) => acc + (g.sizeDecares || 0), 0);
            const totalGardenExpenses = expenses
              .filter((e) => !!e.gardenId)
              .reduce((acc, e) => acc + e.amount, 0);
            const totalGardenHarvestRev = harvests.reduce((acc, h) => acc + h.netReceivable, 0);

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div
                  className={`p-3 rounded-xl border ${
                    isDark ? "bg-[#10241c] border-emerald-900" : "bg-white border-gray-200"
                  }`}
                >
                  <span className="text-[10px] opacity-75 block font-semibold">Toplam Alan</span>
                  <span className="text-sm font-bold text-teal-300">{totalDecares} Dönüm</span>
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    isDark ? "bg-[#10241c] border-emerald-900" : "bg-white border-emerald-200"
                  }`}
                >
                  <span className={`text-[10px] block font-bold ${isDark ? "opacity-75" : "text-gray-700"}`}>Bahçe Masrafları</span>
                  <span className={`text-sm font-black ${isDark ? "text-red-400" : "text-red-700"}`}>
                    -{formatCurrency(totalGardenExpenses)}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${
                    isDark ? "bg-[#10241c] border-emerald-900" : "bg-white border-emerald-200"
                  }`}
                >
                  <span className={`text-[10px] block font-bold ${isDark ? "opacity-75" : "text-gray-700"}`}>Toplam Hasat Geliri</span>
                  <span className={`text-sm font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                    {formatCurrency(totalGardenHarvestRev)}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Yeni Bahçe / Parsel Ekleme Formu (Ayrı Butona Dokunulduğunda Açılır) */}
          {isAddingGarden && (
            <form
              onSubmit={handleSaveGarden}
              className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in shadow-lg ${
                isDark ? "bg-[#10241c] border-teal-500/40 text-emerald-100" : "bg-teal-50/70 border-teal-300"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-teal-900/30">
                <h4 className={`font-black text-xs flex items-center gap-1.5 ${isDark ? "text-teal-400" : "text-teal-950"}`}>
                  <Plus className="w-4 h-4" /> Yeni Bahçe / Parsel Ekle
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGardenCropType("tea")}
                      className={`px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                        gardenCropType === "tea"
                          ? "bg-teal-600 border-teal-500 text-white"
                          : isDark
                          ? "bg-[#142920] border-emerald-800 text-emerald-300"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      🌱 Yaş Çay
                    </button>
                    <button
                      type="button"
                      onClick={() => setGardenCropType("hazelnut")}
                      className={`px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                        gardenCropType === "hazelnut"
                          ? "bg-amber-600 border-amber-500 text-white"
                          : isDark
                          ? "bg-[#142920] border-emerald-800 text-amber-300"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      🌰 Fındık
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingGarden(false)}
                    className="p-1 rounded-lg hover:bg-black/20 text-gray-400 hover:text-white cursor-pointer"
                    title="Formu Kapat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Bahçe Adı */}
            <div>
              <label className="block text-[11px] mb-1 font-semibold">Bahçe / Parsel Adı *</label>
              <input
                type="text"
                required
                value={gardenName}
                onChange={(e) => setGardenName(e.target.value)}
                placeholder="Örn: Rize Çayeli Yamaç Çaylığı veya Derebaşı Parseli"
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* Konum & Büyüklük */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] mb-1 font-semibold">Konum (İl/İlçe/Köy) *</label>
                <input
                  type="text"
                  required
                  value={gardenLocation}
                  onChange={(e) => setGardenLocation(e.target.value)}
                  placeholder="Örn: Rize / Çayeli - Büyükköy"
                  className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] mb-1 font-semibold">Büyüklük (Dönüm) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={gardenSize}
                  onChange={(e) => setGardenSize(e.target.value)}
                  placeholder="Örn: 6.5"
                  className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                  }`}
                />
              </div>
            </div>

            {/* Harita ve Konum Seçimi (Google Maps) */}
            <div
              className={`p-3 rounded-xl border space-y-2 ${
                isDark ? "bg-[#0d1f17] border-emerald-900/80" : "bg-emerald-50/50 border-emerald-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="font-bold text-[11px] text-teal-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Google Haritalar & Kadastro Bilgisi</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsGardenMapPickerOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Haritadan Konum Seç</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setGardenLatitude(pos.coords.latitude);
                            setGardenLongitude(pos.coords.longitude);
                            setGardenGoogleMapsUrl(
                              `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
                            );
                            if (!gardenLocation) {
                              setGardenLocation("Mevcut Parsel GPS Konumu");
                            }
                          },
                          () => {
                            alert("Konum izni alınamadı. Harita arayüzünden nokta seçebilirsiniz.");
                          }
                        );
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                      isDark
                        ? "border-emerald-800 text-emerald-300 hover:bg-emerald-900/40"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Mevcut GPS</span>
                  </button>
                </div>
              </div>

              {/* Ada & Parsel No */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] opacity-75 mb-0.5">Ada No (Opsiyonel)</label>
                  <input
                    type="text"
                    value={gardenAdaNo}
                    onChange={(e) => setGardenAdaNo(e.target.value)}
                    placeholder="Örn: 104"
                    className={`w-full rounded-lg px-2.5 py-1 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] opacity-75 mb-0.5">Parsel No (Opsiyonel)</label>
                  <input
                    type="text"
                    value={gardenParselNo}
                    onChange={(e) => setGardenParselNo(e.target.value)}
                    placeholder="Örn: 12"
                    className={`w-full rounded-lg px-2.5 py-1 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Seçili Harita Durumu */}
              {gardenLatitude && gardenLongitude && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-teal-500/15 border border-teal-500/30 text-[11px] text-teal-300">
                  <span className="font-mono">
                    📍 {gardenLatitude.toFixed(5)}, {gardenLongitude.toFixed(5)}
                  </span>
                  <a
                    href={
                      gardenGoogleMapsUrl ||
                      `https://www.google.com/maps?q=${gardenLatitude},${gardenLongitude}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline flex items-center gap-1 text-teal-200 hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Google Haritalar'da Aç
                  </a>
                </div>
              )}
            </div>

            {/* Notlar */}
            <div>
              <label className="block text-[11px] mb-1 font-semibold">Notlar / Parsel Detayı</label>
              <textarea
                rows={2}
                value={gardenNotes}
                onChange={(e) => setGardenNotes(e.target.value)}
                placeholder="Örn: Yol kenarı, eğimli çay arazisi..."
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500" : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingGarden(false)}
                className="px-3.5 py-2 rounded-xl border border-gray-500/30 text-xs font-bold cursor-pointer hover:bg-black/10"
              >
                Vazgeç / İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Bahçeyi Sisteme Ekle</span>
              </button>
            </div>
          </form>
        )}

          {/* Kayıtlı Bahçelerim Listesi ve Yapılan Masraflar & Açıklamalar */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs flex items-center justify-between">
              <span>Kayıtlı Bahçelerim ({gardens.length})</span>
              <span className="text-[10px] opacity-70">Düzenleme, silme, harita ve masraf detayları</span>
            </h4>

            {gardens.map((g) => {
              // Bahçeye ait masraflar
              const gExpenses = expenses.filter((e) => e.gardenId === g.id);
              const gTotalExp = gExpenses.reduce((acc, e) => acc + e.amount, 0);

              // Bahçeye ait hasatlar
              const gHarvests = harvests.filter(
                (h) => h.gardenId === g.id || h.gardenName.toLowerCase() === g.name.toLowerCase()
              );
              const gTotalKg = gHarvests.reduce((acc, h) => acc + h.quantityKg, 0);
              const gTotalRev = gHarvests.reduce((acc, h) => acc + h.netReceivable, 0);
              const gNetProfit = gTotalRev - gTotalExp;

              return (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
                    isDark ? "bg-[#0b1c15] border-emerald-900 text-emerald-200" : "bg-white border-gray-200 shadow-xs"
                  }`}
                >
                  {/* Bahçe Başlığı, Harita Bağlantısı, Düzenleme ve Silme Butonları */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-teal-400">{g.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold">
                          {g.cropType === "hazelnut" ? "🌰 Fındık" : "🌱 Yaş Çay"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          {g.sizeDecares} Dönüm
                        </span>
                        {(g.adaNo || g.parselNo) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                            Ada: {g.adaNo || "-"} / Parsel: {g.parselNo || "-"}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] opacity-75 mt-1 flex flex-wrap items-center gap-2">
                        <span>📍 {g.location}</span>
                        {(g.latitude && g.longitude) || g.googleMapsUrl ? (
                          <a
                            href={
                              g.googleMapsUrl ||
                              `https://www.google.com/maps?q=${g.latitude},${g.longitude}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Haritada Gör</span>
                          </a>
                        ) : null}
                      </div>

                      {g.notes && <div className="text-[10px] italic opacity-60 mt-0.5">"{g.notes}"</div>}
                    </div>

                    {/* Eylem Butonları: Düzenle & Sil */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingGarden(g)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                          isDark
                            ? "bg-teal-950/60 border-teal-800 text-teal-300 hover:bg-teal-900"
                            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                        }`}
                        title="Bahçeyi Düzenle"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          triggerConfirmDelete(
                            "Bahçeyi Sil",
                            g.name,
                            "Bu bahçe kaydı ve ilişkili tanım kalıcı olarak silinecektir.",
                            () => onDeleteGarden(g.id)
                          )
                        }
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer transition-colors"
                        title="Bahçeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bahçe Finansal Özeti KPI Şeridi */}
                  <div className={`grid grid-cols-3 gap-2 p-2.5 rounded-xl text-[11px] ${isDark ? "bg-black/25" : "bg-emerald-50/80 border border-emerald-200 text-emerald-950"}`}>
                    <div>
                      <span className={`block text-[10px] ${isDark ? "opacity-70" : "text-gray-700 font-bold"}`}>Hasat</span>
                      <span className={`font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                        {formatKg(gTotalKg)} KG
                      </span>
                      <span className={`block text-[9px] ${isDark ? "opacity-60" : "text-emerald-900 font-semibold"}`}>
                        {formatCurrency(gTotalRev)}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isDark ? "opacity-70" : "text-gray-700 font-bold"}`}>Yapılan Masraf</span>
                      <span className={`font-black ${isDark ? "text-red-400" : "text-red-700"}`}>
                        -{formatCurrency(gTotalExp)}
                      </span>
                      <span className={`block text-[9px] ${isDark ? "opacity-60" : "text-gray-700 font-semibold"}`}>
                        {gExpenses.length} Harcama
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[10px] ${isDark ? "opacity-70" : "text-gray-700 font-bold"}`}>Net Kâr</span>
                      <span className={`font-black ${gNetProfit >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-950") : (isDark ? "text-red-400" : "text-red-700")}`}>
                        {formatCurrency(gNetProfit)}
                      </span>
                      <span className={`block text-[9px] font-bold ${gNetProfit >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-900") : (isDark ? "text-red-400" : "text-red-700")}`}>
                        {gNetProfit >= 0 ? "Kârda" : "Zararda"}
                      </span>
                    </div>
                  </div>

                  {/* =================================================================
                      YAPILAN MASRAFLAR VE AÇIKLAMALAR BÖLÜMÜ
                     ================================================================= */}
                  <div className="pt-2 border-t border-emerald-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-blue-300">
                        <Receipt className="w-3.5 h-3.5 text-blue-400" />
                        <span>Yapılan Masraflar ve Açıklamalar ({gExpenses.length})</span>
                      </div>

                      {/* Hızlı Masraf Ekle Butonu */}
                      <button
                        type="button"
                        onClick={() => handleQuickAddExpenseForGarden(g.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Bu Bahçeye Masraf Ekle</span>
                      </button>
                    </div>

                    {gExpenses.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {gExpenses.map((exp) => (
                          <div
                            key={exp.id}
                            className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                              isDark ? "bg-[#10241c]/60 border-emerald-900/60" : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-emerald-100">{exp.title}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300">
                                  {exp.category}
                                </span>
                              </div>
                              <span className="font-bold text-red-400">
                                -{formatCurrency(exp.amount)}
                              </span>
                            </div>

                            <div className="text-[10px] opacity-70 flex items-center justify-between">
                              <span>Tarih: {exp.date}</span>
                            </div>

                            {/* Masraf Açıklaması */}
                            <div
                              className={`text-[11px] p-2 rounded-lg flex items-start gap-1.5 ${
                                isDark
                                  ? "bg-black/35 border border-emerald-950/80 text-emerald-200/90"
                                  : "bg-white border border-gray-200 text-gray-800"
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-teal-300 block">
                                  Açıklama:
                                </span>
                                <span className="italic">
                                  {exp.note || "Bu masraf için özel açıklama girilmedi."}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`p-3 rounded-xl border border-dashed text-center text-[11px] ${
                          isDark ? "border-emerald-900/60 text-emerald-400/60 bg-black/10" : "border-gray-200 text-gray-500 bg-gray-50/50"
                        }`}
                      >
                        <p>Bu bahçeye ait henüz kayıtlı bir masraf bulunmuyor.</p>
                        <button
                          type="button"
                          onClick={() => handleQuickAddExpenseForGarden(g.id)}
                          className="mt-1 text-blue-400 hover:text-blue-300 font-semibold underline text-[10px] cursor-pointer"
                        >
                          Hemen bir gübre, budama veya işçilik masrafı ekleyin &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBVIEW: FABRİKA FİYATLARI & YENİ FABRİKA EKLE
          (Fabrika ismi, Ödeme Seçenekleri: Peşin, Haftalık, Aylık, Vadeli, Diğer Manuel)
         ========================================================================= */}
      {activeSubView === "prices" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Fabrikalar & Alım Koşulları</span>
              </h3>
              <p className="text-[11px] opacity-75">
                ÇAYKUR, özel sektör ve resmi fabrika alım şartları
              </p>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsAddingFactory(!isAddingFactory)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Yeni fabrika veya alım yeri tanımlayın"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingFactory ? "Formu Kapat" : "Yeni Fabrika Ekle"}</span>
              </button>
            ) : null}
          </div>

          {/* "Yeni Fabrika Ekle" Formu */}
          {isAddingFactory && (
            <form
              onSubmit={handleSaveFactory}
              className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in ${
                isDark ? "bg-[#10241c] border-purple-900/80 text-emerald-100" : "bg-purple-50/50 border-purple-200"
              }`}
            >
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                <h4 className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Yeni Fabrika / Alım Yeri Tanımla
                </h4>
                <span className="text-[10px] opacity-70">Tüm ödeme seçenekleri desteklenir</span>
              </div>

              {/* Fabrika İsmi */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Fabrika İsmi <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  placeholder="Örn: Tirebolu 42 Çay Fabrikası veya Kavalcı Çay A.Ş."
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Ürün & Fiyatlar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Ürün Tipi</label>
                  <select
                    value={factoryCrop}
                    onChange={(e) => setFactoryCrop(e.target.value as any)}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="tea">Yaş Çay</option>
                    <option value="hazelnut">Fındık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">
                    Taban Fiyat (TL/KG) <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={factoryBasePrice}
                    onChange={(e) => setFactoryBasePrice(e.target.value)}
                    placeholder="Örn: 36.50"
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Destekleme Primi (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={factorySupportPayment}
                    onChange={(e) => setFactorySupportPayment(e.target.value)}
                    placeholder="Örn: 3.50"
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Ödeme Seçenekleri: Peşin, Haftalık, Aylık, Vadeli, Diğer (Ayrı Ayrı Değer Girilebilir) */}
              <div className="space-y-2 pt-1 border-t border-purple-900/30">
                <div>
                  <label className="block text-xs font-bold text-purple-300">
                    Ödeme Seçenekleri & Alım Şartları
                  </label>
                  <p className="text-[11px] opacity-75">
                    Hepsine ayrı ayrı değer girebilirsiniz. Yalnızca değer girdiğiniz seçenekler fabrika kartında gösterilecektir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Peşin */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/50 border-emerald-200"}`}>
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Peşin Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={factoryPayPesin}
                      onChange={(e) => setFactoryPayPesin(e.target.value)}
                      placeholder="Örn: Kantar tesliminde anında nakit veya aynı gün EFT"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Haftalık */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-blue-50/50 border-blue-200"}`}>
                    <label className="block text-[11px] font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Haftalık Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={factoryPayHaftalik}
                      onChange={(e) => setFactoryPayHaftalik(e.target.value)}
                      placeholder="Örn: Her Cuma günü banka hesabına aktarım"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Aylık */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-purple-50/50 border-purple-200"}`}>
                    <label className="block text-[11px] font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Aylık Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={factoryPayAylik}
                      onChange={(e) => setFactoryPayAylik(e.target.value)}
                      placeholder="Örn: Ay sonunu takip eden 15 gün içinde toplu ödeme"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Vadeli */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-amber-50/50 border-amber-200"}`}>
                    <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Vadeli Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={factoryPayVadeli}
                      onChange={(e) => setFactoryPayVadeli(e.target.value)}
                      placeholder="Örn: %50 peşin, kalan 45 gün vadeli çek veya senet"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Ek Ödeme Koşulu (Manuel / Özel Şart) */}
                  <div className={`sm:col-span-2 p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-rose-50/50 border-rose-200"}`}>
                    <label className="block text-[11px] font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      Ek Ödeme Koşulu (Özel Fiyat, Sözleşme, Avans & Mahsup Şartı)
                    </label>
                    <input
                      type="text"
                      value={factoryPayDiger}
                      onChange={(e) => setFactoryPayDiger(e.target.value)}
                      placeholder="Örn: 38.00 TL (Kalite Primi) veya Gübre/ilaç mahsubu, nakliye fabrika karşılar"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Not & Ek Bilgi */}
              <div>
                <label className="block text-[11px] font-semibold mb-1">Not / Kantar Şartı</label>
                <input
                  type="text"
                  value={factoryNote}
                  onChange={(e) => setFactoryNote(e.target.value)}
                  placeholder="Örn: Serbest kota, randıman garantisi, fire kesintisi %1"
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingFactory(false)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                    isDark ? "border-emerald-800 text-emerald-300" : "border-gray-200 text-gray-600"
                  }`}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Fabrikayı Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Fabrika Fiyat Listesi */}
          <div className="space-y-2.5">
            {factories
              .filter((f) => {
                // Genel standart fabrika ise herkes görür
                if (!f.isUserAdded && !f.userId) return true;
                // Admin tüm fabrikaları denetleyebilir
                if (currentUser?.role === "admin") return true;
                // Kullanıcının kendi eklediği fabrikayı SADECE kendisi görür
                return Boolean(
                  currentUser &&
                    (f.userId === currentUser.id ||
                      (f.createdBy &&
                        (f.createdBy === currentUser.fullName || f.createdBy === currentUser.username)))
                );
              })
              .map((f) => {
                const isFactoryOwner = Boolean(
                  currentUser &&
                    (f.userId === currentUser.id ||
                      (f.createdBy &&
                        (f.createdBy === currentUser.fullName || f.createdBy === currentUser.username)))
                );
                const canManageFactory = currentUser?.role === "admin" || (f.isUserAdded && isFactoryOwner);

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-xl border space-y-2 transition-all ${
                      isDark ? "bg-[#10241c] border-emerald-900 text-emerald-100" : "bg-white border-emerald-200 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-black text-sm ${isDark ? "text-purple-300" : "text-purple-950"}`}>{f.factoryName}</h4>
                          {f.isUserAdded && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${isDark ? "bg-purple-500/20 text-purple-300 border-purple-800" : "bg-purple-100 text-purple-950 border-purple-300"}`}>
                              {isFactoryOwner ? "Sizin Eklediğiniz Özel Fabrika" : "Özel Fabrika"}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border mt-1 inline-block ${isDark ? "bg-black/20 text-emerald-300 border-emerald-800" : "bg-emerald-100 text-emerald-950 font-bold border-emerald-300"}`}>
                          {f.crop === "tea" ? "Yaş Çay" : "Fındık"}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-base font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                          {f.basePrice.toFixed(2)} TL / KG
                        </span>
                        {f.supportPayment && (
                          <span className={`text-[10px] block font-bold ${isDark ? "text-teal-400" : "text-teal-900"}`}>
                            +{f.supportPayment.toFixed(2)} TL Destekleme
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Yalnızca Değer Girilen Ödeme Seçenekleri Gösterilir */}
                    {(() => {
                      const activePayments = getActivePaymentEntries(f);
                      return (
                        <div className="pt-2 border-t border-emerald-900/40 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Ödeme Seçenekleri & Koşulları:</span>
                            </div>

                            {canManageFactory && (
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {/* Düzenle Butonu */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEditFactory(f)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold border border-purple-800/40"
                                  title={isFactoryOwner ? "Kendi Fabrikanızı Düzenle" : "Fabrikayı Düzenle"}
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>Düzenle</span>
                                </button>

                                {/* Silme Butonu */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    triggerConfirmDelete(
                                      "Fabrikayı Listeden Sil",
                                      f.factoryName,
                                      `"${f.factoryName}" fabrikasını ve tüm alım koşullarını silmek istediğinizden emin misiniz?`,
                                      () => onDeleteFactory(f.id)
                                    )
                                  }
                                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                  title={isFactoryOwner ? "Kendi Fabrikanızı Sil" : "Fabrikayı Sil"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                      {activePayments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                          {activePayments.map((p) => (
                            <div
                              key={p.key}
                              className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${p.badge}`}
                            >
                              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${p.dotColor}`} />
                              <div className="min-w-0 flex-1">
                                <span className="font-bold mr-1">{p.label}:</span>
                                <span className="opacity-90 break-words">{p.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs opacity-60 italic py-0.5">
                          Belirtilmiş özel ödeme şartı bulunmuyor.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {f.note && <div className="text-[11px] opacity-60 italic">{f.note}</div>}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBVIEW: RAPORLAR (GELİŞMİŞ HASAT & FİNANS ANALİZİ)
         ========================================================================= */}
      {activeSubView === "reports" && (
        <HarvestReportsView
          harvests={harvests}
          expenses={expenses}
          payments={payments}
          gardens={gardens}
          factories={factories}
          isDark={isDark}
        />
      )}

      {/* Kayıtlı Fabrikayı Düzenle Modalı */}
      {editingFactory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-4 sm:p-5 shadow-2xl space-y-4 ${
              isDark ? "bg-[#0d1e17] border-purple-800 text-emerald-100" : "bg-white border-purple-200 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-purple-900/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-purple-300">
                    Fabrikayı Düzenle
                  </h3>
                  <p className="text-[11px] opacity-75">
                    {editingFactory.factoryName} için fiyat ve alım koşullarını güncelleyin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelEditFactory}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFactory} className="space-y-3.5">
              {/* Fabrika İsmi */}
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Fabrika İsmi <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFactoryName}
                  onChange={(e) => setEditFactoryName(e.target.value)}
                  placeholder="Fabrika adı"
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Ürün & Fiyatlar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Ürün Tipi</label>
                  <select
                    value={editFactoryCrop}
                    onChange={(e) => setEditFactoryCrop(e.target.value as any)}
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="tea">Yaş Çay</option>
                    <option value="hazelnut">Fındık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">
                    Taban Fiyat (TL/KG) <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFactoryBasePrice}
                    onChange={(e) => setEditFactoryBasePrice(e.target.value)}
                    placeholder="Örn: 38.00"
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1">Destekleme (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFactorySupportPayment}
                    onChange={(e) => setEditFactorySupportPayment(e.target.value)}
                    placeholder="Örn: 3.50"
                    className={`w-full rounded-xl px-2.5 py-1.5 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Ödeme Seçenekleri: Peşin, Haftalık, Aylık, Vadeli, Diğer (Ayrı Ayrı Değer Girilebilir) */}
              <div className="space-y-2 pt-1 border-t border-purple-900/30">
                <div>
                  <label className="block text-xs font-bold text-purple-300">
                    Ödeme Seçenekleri & Alım Şartları
                  </label>
                  <p className="text-[11px] opacity-75">
                    Hepsine ayrı ayrı şart veya detay girebilirsiniz. Yalnızca değer girdiğiniz seçenekler fabrika kartında gösterilir.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Peşin */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/50 border-emerald-200"}`}>
                    <label className="block text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Peşin Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={editPayPesin}
                      onChange={(e) => setEditPayPesin(e.target.value)}
                      placeholder="Örn: Kantar tesliminde anında nakit veya aynı gün EFT"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Haftalık */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-blue-50/50 border-blue-200"}`}>
                    <label className="block text-[11px] font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Haftalık Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={editPayHaftalik}
                      onChange={(e) => setEditPayHaftalik(e.target.value)}
                      placeholder="Örn: Her Cuma günü banka hesabına aktarım"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Aylık */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-purple-50/50 border-purple-200"}`}>
                    <label className="block text-[11px] font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Aylık Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={editPayAylik}
                      onChange={(e) => setEditPayAylik(e.target.value)}
                      placeholder="Örn: Ay sonunu takip eden 15 gün içinde toplu ödeme"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Vadeli */}
                  <div className={`p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-amber-50/50 border-amber-200"}`}>
                    <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      Vadeli Ödeme Şartı
                    </label>
                    <input
                      type="text"
                      value={editPayVadeli}
                      onChange={(e) => setEditPayVadeli(e.target.value)}
                      placeholder="Örn: %50 peşin, kalan 45 gün vadeli çek veya senet"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>

                  {/* Diğer (Manuel) */}
                  <div className={`sm:col-span-2 p-2 rounded-xl border ${isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-rose-50/50 border-rose-200"}`}>
                    <label className="block text-[11px] font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      Diğer (Özel Sözleşme, Avans & Mahsup Şartı)
                    </label>
                    <input
                      type="text"
                      value={editPayDiger}
                      onChange={(e) => setEditPayDiger(e.target.value)}
                      placeholder="Örn: Gübre/ilaç mahsubu, budama prim desteği, nakliye fabrika karşılar"
                      className={`w-full rounded-lg px-2.5 py-1.5 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Not & Kantar Şartı */}
              <div>
                <label className="block text-[11px] font-semibold mb-1">Not / Kantar Şartı</label>
                <input
                  type="text"
                  value={editFactoryNote}
                  onChange={(e) => setEditFactoryNote(e.target.value)}
                  placeholder="Örn: Serbest kontenjan, randıman garantisi, fire kesintisi"
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEditFactory}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    isDark ? "border-emerald-800 text-emerald-300 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBVIEW: MESSAGES (Admin ile İletişim / Yönetici Toplu & Özel Mesajlaşma)
         ========================================================================= */}
      {activeSubView === "messages" && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setActiveSubView("menu")}
            className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              isDark
                ? "bg-[#10241c] border-emerald-900 text-emerald-300 hover:bg-[#142f24]"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>İşlemler Menüsüne Geri Dön</span>
          </button>

          <AdminMessagingSection
            currentUser={currentUser}
            users={users}
            messages={adminMessages || []}
            onSendMessage={onSendAdminMessage || (() => {})}
            onDeleteMessage={onDeleteAdminMessage}
            isDark={isDark}
          />
        </div>
      )}

      {/* Confirmation Modal for All Deletions */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalState.onConfirm}
        title={deleteModalState.title}
        itemName={deleteModalState.itemName}
        description={deleteModalState.description}
        isDark={isDark}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        gardens={gardens}
        onSave={(updated) => {
          onUpdateExpense?.(updated);
          setEditingExpense(null);
        }}
        isDark={isDark}
      />

      {/* Edit Garden Modal */}
      <EditGardenModal
        isOpen={!!editingGarden}
        garden={editingGarden}
        onClose={() => setEditingGarden(null)}
        onSaveGarden={(updated) => {
          onUpdateGarden?.(updated);
          setEditingGarden(null);
        }}
        isDark={isDark}
      />

      {/* Edit Harvest Modal */}
      <EditHarvestModal
        isOpen={!!editingHarvest}
        harvest={editingHarvest}
        gardens={gardens}
        factories={factories}
        onClose={() => setEditingHarvest(null)}
        onSave={(updated) => {
          onUpdateHarvest?.(updated);
          setEditingHarvest(null);
        }}
        isDark={isDark}
      />

      {/* Map Location Picker Modal for New Garden Form */}
      {isGardenMapPickerOpen && (
        <MapLocationPickerModal
          isOpen={isGardenMapPickerOpen}
          onClose={() => setIsGardenMapPickerOpen(false)}
          initialLat={gardenLatitude}
          initialLng={gardenLongitude}
          initialLocationText={gardenLocation}
          initialAdaNo={gardenAdaNo}
          initialParselNo={gardenParselNo}
          isDark={isDark}
          onSelectLocation={(data) => {
            setGardenLocation(data.locationText);
            setGardenLatitude(data.latitude);
            setGardenLongitude(data.longitude);
            setGardenGoogleMapsUrl(data.googleMapsUrl);
            if (data.adaNo) setGardenAdaNo(data.adaNo);
            if (data.parselNo) setGardenParselNo(data.parselNo);
          }}
        />
      )}
    </div>
  );
};
