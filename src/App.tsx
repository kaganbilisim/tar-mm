import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  UserRole,
  HarvestRecord,
  PaymentRecord,
  ExpenseRecord,
  Garden,
  FactoryPrice,
  AppSettings,
  DEFAULT_APP_SETTINGS,
  JobListing,
  CrewLeaderProfile,
  WorkerProfile,
  JobApplication,
  ServiceOffer,
  CrewMember,
  AgriProductListing,
  UserAccount,
  FarmingFocus,
  AdminUserMessage,
} from "./types";
import {
  INITIAL_GARDENS,
  INITIAL_HARVESTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  FACTORY_PRICES,
  INITIAL_JOBS,
  INITIAL_CREWS,
  INITIAL_WORKERS,
  INITIAL_APPLICATIONS,
  INITIAL_SERVICES,
  INITIAL_AGRI_PRODUCTS,
  DEFAULT_ADMIN_USER,
  INITIAL_USERS,
  INITIAL_ADMIN_MESSAGES,
} from "./mockData";
import { Header } from "./components/Header";
import { HomeOverview } from "./components/HomeOverview";
import { HarvestModal } from "./components/HarvestModal";
import { PaymentModal } from "./components/PaymentModal";
import { ReceivablesView } from "./components/ReceivablesView";
import { AssistantView } from "./components/AssistantView";
import { AgronomyGuideView } from "./components/AgronomyGuideView";
import { OtherOperationsView } from "./components/OtherOperationsView";
import { MarketplaceView } from "./components/MarketplaceView";
import { PrivacySettingsModal } from "./components/PrivacySettingsModal";
import { AdvancedSettingsModal } from "./components/AdvancedSettingsModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { AuthModal } from "./components/AuthModal";
import { UserSettingsModal } from "./components/UserSettingsModal";
import { AdminControlModal } from "./components/AdminControlModal";
import { AndroidInstallModal } from "./components/AndroidInstallModal";
import { checkProfanity } from "./utils/moderation";
import {
  Home,
  Sparkles,
  Plus,
  Calendar,
  MoreHorizontal,
  BookOpen,
  Leaf,
  Briefcase,
} from "lucide-react";

// Persistent tombstone tracking for deleted items (ensures deleted items NEVER resurrect upon refresh)
const getDeletedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem("tarim_cepte_deleted_ids");
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
};

const registerDeletedId = (id: string, collection: string) => {
  try {
    const ids = getDeletedIds();
    ids.add(id);
    localStorage.setItem("tarim_cepte_deleted_ids", JSON.stringify(Array.from(ids)));
    // Asynchronously notify backend server
    fetch("/api/data/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, id }),
    }).catch(() => {});
  } catch (err) {
    console.error("registerDeletedId error:", err);
  }
};

export function App() {
  // Theme state: dark tea green vs emerald light (Açık yeşil modu varsayılan başlatılır)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("tarim_cepte_theme");
      if (saved) return saved === "dark";
    } catch {
      // fallback
    }
    return false; // Varsayılan: Açık yeşil modu aktif başlatılır
  });

  useEffect(() => {
    try {
      localStorage.setItem("tarim_cepte_theme", isDark ? "dark" : "light");
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", isDark);
      }
    } catch {
      // ignore
    }
  }, [isDark]);

  // Mobile frame simulator vs native full Android view - default false for true edge-to-edge Android application
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Android Native Toast feedback state
  const [androidToast, setAndroidToast] = useState<{ show: boolean; message: string } | null>(null);

  const showAndroidToast = (message: string) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    setAndroidToast({ show: true, message });
    setTimeout(() => {
      setAndroidToast(null);
    }, 2800);
  };

  // User role state
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem("tarim_cepte_current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role) return parsed.role;
      }
    } catch {
      // fallback
    }
    return "employer";
  });

  // Navigation tab: Ana açılış sayfası Hasat & Bahçe Takibi ("home"), Pazar Yeri & İlanlar ("marketplace")
  const [activeTab, setActiveTab] = useState<
    "home" | "marketplace" | "assistant" | "harvest" | "receivables" | "agronomy" | "other"
  >(() => {
    if (typeof window !== "undefined" && window.location.search.includes("crew_invite")) {
      return "marketplace";
    }
    return "home";
  });

  const [initialMarketSubTab, setInitialMarketSubTab] = useState<
    "jobs" | "crews" | "workers" | "services" | "applications" | "calculator" | "admin"
  >("jobs");

  // Modals state
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [selectedHarvestForPayment, setSelectedHarvestForPayment] = useState<string | undefined>();

  // Kullanıcı Hesabı & Kimlik Doğrulama Durumları
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_users");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((u: any) => !deletedIds.has(u.id));
        }
      }
      return INITIAL_USERS.filter((u) => !deletedIds.has(u.id));
    } catch {
      return INITIAL_USERS.filter((u) => !deletedIds.has(u.id));
    }
  });

  // Yönetici & Kullanıcı Karşılıklı Mesajları ve Toplu Duyurular
  const [adminMessages, setAdminMessages] = useState<AdminUserMessage[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_admin_user_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((m: any) => !deletedIds.has(m.id));
        }
      }
      return INITIAL_ADMIN_MESSAGES.filter((m) => !deletedIds.has(m.id));
    } catch {
      return INITIAL_ADMIN_MESSAGES.filter((m) => !deletedIds.has(m.id));
    }
  });

  useEffect(() => {
    localStorage.setItem("tarim_cepte_admin_user_messages", JSON.stringify(adminMessages));
  }, [adminMessages]);

  const handleSendAdminMessage = (msg: Omit<AdminUserMessage, "id" | "createdAt">) => {
    const newMsg: AdminUserMessage = {
      ...msg,
      id: `adm-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setAdminMessages((prev) => [newMsg, ...prev]);
  };

  const handleDeleteAdminMessage = (id: string) => {
    registerDeletedId(id, "admin_messages");
    setAdminMessages((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem("tarim_cepte_admin_user_messages", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Mesaj kalıcı olarak silindi");
  };

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("tarim_cepte_current_user");
      if (saved) return JSON.parse(saved);
      // Kullanıcı girişi yapılmadan uygulama çalıştırılmaz
      return null;
    } catch {
      return null;
    }
  });

  // Kullanıcının seçtiği tarım odağı: "tea" | "hazelnut" | "both"
  const farmingFocus: FarmingFocus = currentUser?.farmingFocus || "both";

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<"login" | "register" | "forgot">("login");
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // Android Sistem Geri Tuşu (Hardware Back Button / Gesture Swipe) Desteği
  useEffect(() => {
    const handlePopState = () => {
      // 1. Önce açık olan modalları kapat
      if (isAndroidModalOpen) {
        setIsAndroidModalOpen(false);
        return;
      }
      if (isHarvestModalOpen) {
        setIsHarvestModalOpen(false);
        return;
      }
      if (isPaymentModalOpen) {
        setIsPaymentModalOpen(false);
        return;
      }
      if (isAdvancedSettingsOpen) {
        setIsAdvancedSettingsOpen(false);
        return;
      }
      if (isAdminModalOpen) {
        setIsAdminModalOpen(false);
        return;
      }
      if (isUserSettingsModalOpen) {
        setIsUserSettingsModalOpen(false);
        return;
      }
      if (isPrivacyModalOpen) {
        setIsPrivacyModalOpen(false);
        return;
      }
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }

      // 2. Modallar kapalıysa ve ana sayfada değilse ana sekmeye (home) dön
      if (activeTab !== "home") {
        setActiveTab("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    isAndroidModalOpen,
    isHarvestModalOpen,
    isPaymentModalOpen,
    isAdvancedSettingsOpen,
    isAdminModalOpen,
    isUserSettingsModalOpen,
    isPrivacyModalOpen,
    isAuthModalOpen,
    activeTab,
  ]);

  const handleDeleteUser = (userId: string) => {
    registerDeletedId(userId, "users");
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem("tarim_cepte_users", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Kullanıcı hesabı kalıcı olarak silindi");
    if (currentUser?.id === userId) {
      handleLogout();
    }
  };

  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
  };

  useEffect(() => {
    localStorage.setItem("tarim_cepte_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("tarim_cepte_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("tarim_cepte_current_user");
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role && user.role !== currentRole) {
      setCurrentRole(user.role);
    }
    setActiveTab("home");
    setIsAuthModalOpen(false);
  };

  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    if (newUser.role && newUser.role !== currentRole) {
      setCurrentRole(newUser.role);
    }
    setActiveTab("home");
    setIsAuthModalOpen(false);
  };

  const handleResetPassword = (username: string, newPass: string): boolean => {
    let found = false;
    const cleanQuery = username.trim().toLowerCase();
    setUsers((prev) =>
      prev.map((u) => {
        if (u.username.toLowerCase() === cleanQuery || (u.email && u.email.toLowerCase() === cleanQuery)) {
          found = true;
          return { ...u, password: newPass };
        }
        return u;
      })
    );
    if (
      currentUser &&
      (currentUser.username.toLowerCase() === cleanQuery ||
        (currentUser.email && currentUser.email.toLowerCase() === cleanQuery))
    ) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null));
    }
    return found;
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (updatedUser.role && updatedUser.role !== currentRole) {
      setCurrentRole(updatedUser.role);
    }
  };

  const handleLogout = () => {
    setIsUserSettingsModalOpen(false);
    setCurrentUser(null);
    setActiveTab("home");
    setAuthModalInitialMode("login");
    setIsAuthModalOpen(true);
  };

  // Helper: Her kullanıcı için izole edilmiş localStorage anahtarları
  const getUserStorageKey = (userId: string | undefined, key: string) => {
    return userId ? `tarim_cepte_user_${userId}_${key}` : `tarim_cepte_guest_${key}`;
  };

  // Helper: Kullanıcıya özel verileri localStorage'dan oku
  const loadScopedUserData = (user: UserAccount | null) => {
    const userId = user?.id;
    const deletedIds = getDeletedIds();

    // 1. Hasatlar
    const userHarvestsKey = getUserStorageKey(userId, "harvests");
    const savedHarvests = localStorage.getItem(userHarvestsKey);
    let resolvedHarvests: HarvestRecord[] = [];
    if (savedHarvests) {
      try {
        resolvedHarvests = JSON.parse(savedHarvests).filter((h: any) => !deletedIds.has(h.id));
      } catch {
        resolvedHarvests = [];
      }
    } else if (!user) {
      resolvedHarvests = [];
    } else if (user.username === "tamer6715" || user.id === "u-1") {
      const old = localStorage.getItem("tarim_cepte_harvests");
      resolvedHarvests = (old ? JSON.parse(old) : INITIAL_HARVESTS).filter((h: any) => !deletedIds.has(h.id));
      localStorage.setItem(userHarvestsKey, JSON.stringify(resolvedHarvests));
    } else {
      // Yeni kullanıcı (Ali vb.) için tertemiz, boş liste başlar! Tamer'in hasadı görünmez
      resolvedHarvests = [];
      localStorage.setItem(userHarvestsKey, JSON.stringify([]));
    }

    // 2. Bahçeler
    const userGardensKey = getUserStorageKey(userId, "gardens");
    const savedGardens = localStorage.getItem(userGardensKey);
    let resolvedGardens: Garden[] = [];
    if (savedGardens) {
      try {
        resolvedGardens = JSON.parse(savedGardens).filter((g: any) => !deletedIds.has(g.id));
      } catch {
        resolvedGardens = [];
      }
    } else if (user?.username === "tamer6715" || user?.id === "u-1") {
      const old = localStorage.getItem("tarim_cepte_gardens");
      resolvedGardens = (old ? JSON.parse(old) : INITIAL_GARDENS).filter((g: any) => !deletedIds.has(g.id));
      localStorage.setItem(userGardensKey, JSON.stringify(resolvedGardens));
    } else if (user) {
      resolvedGardens = [
        {
          id: `g-${Date.now()}-1`,
          name: `${user.fullName || user.username} Bahçesi`,
          location: "Rize / Merkez",
          sizeDecares: 5,
          cropType: (user.farmingFocus === "hazelnut" ? "hazelnut" : "tea") as "tea" | "hazelnut",
          bushesCount: user.farmingFocus === "hazelnut" ? 250 : 1500,
        },
      ].filter((g) => !deletedIds.has(g.id));
      localStorage.setItem(userGardensKey, JSON.stringify(resolvedGardens));
    } else {
      resolvedGardens = [];
    }

    // 3. Masraflar (Expenses)
    const userExpensesKey = getUserStorageKey(userId, "expenses");
    const savedExpenses = localStorage.getItem(userExpensesKey);
    let resolvedExpenses: ExpenseRecord[] = [];
    if (savedExpenses) {
      try {
        resolvedExpenses = JSON.parse(savedExpenses).filter((e: any) => !deletedIds.has(e.id));
      } catch {
        resolvedExpenses = [];
      }
    } else if (user?.username === "tamer6715" || user?.id === "u-1") {
      const old = localStorage.getItem("tarim_cepte_expenses");
      resolvedExpenses = (old ? JSON.parse(old) : INITIAL_EXPENSES).filter((e: any) => !deletedIds.has(e.id));
      localStorage.setItem(userExpensesKey, JSON.stringify(resolvedExpenses));
    } else {
      resolvedExpenses = [];
      if (user) localStorage.setItem(userExpensesKey, JSON.stringify([]));
    }

    // 4. Tahsilatlar (Payments)
    const userPaymentsKey = getUserStorageKey(userId, "payments");
    const savedPayments = localStorage.getItem(userPaymentsKey);
    let resolvedPayments: PaymentRecord[] = [];
    if (savedPayments) {
      try {
        resolvedPayments = JSON.parse(savedPayments).filter((p: any) => !deletedIds.has(p.id));
      } catch {
        resolvedPayments = [];
      }
    } else if (user?.username === "tamer6715" || user?.id === "u-1") {
      const old = localStorage.getItem("tarim_cepte_payments");
      resolvedPayments = (old ? JSON.parse(old) : INITIAL_PAYMENTS).filter((p: any) => !deletedIds.has(p.id));
      localStorage.setItem(userPaymentsKey, JSON.stringify(resolvedPayments));
    } else {
      resolvedPayments = [];
      if (user) localStorage.setItem(userPaymentsKey, JSON.stringify([]));
    }

    // 5. Fabrikalar
    const userFactoriesKey = getUserStorageKey(userId, "factories");
    const savedFactories = localStorage.getItem(userFactoriesKey);
    let resolvedFactories: FactoryPrice[] = [];
    if (savedFactories) {
      try {
        resolvedFactories = JSON.parse(savedFactories).filter((f: any) => !deletedIds.has(f.id));
      } catch {
        resolvedFactories = FACTORY_PRICES.filter((f) => !deletedIds.has(f.id));
      }
    } else {
      resolvedFactories = FACTORY_PRICES.filter((f) => !deletedIds.has(f.id));
      if (user) localStorage.setItem(userFactoriesKey, JSON.stringify(resolvedFactories));
    }

    // 6. Ayarlar
    const userSettingsKey = getUserStorageKey(userId, "settings");
    const savedSettings = localStorage.getItem(userSettingsKey);
    let resolvedSettings: AppSettings = DEFAULT_APP_SETTINGS;
    if (savedSettings) {
      try {
        resolvedSettings = JSON.parse(savedSettings);
      } catch {
        resolvedSettings = DEFAULT_APP_SETTINGS;
      }
    } else {
      resolvedSettings = {
        ...DEFAULT_APP_SETTINGS,
        farmerName: user?.fullName || user?.username || "",
        defaultCropType: user?.farmingFocus === "hazelnut" ? "hazelnut" : "tea",
      };
      if (user) localStorage.setItem(userSettingsKey, JSON.stringify(resolvedSettings));
    }

    // Global Reklam ve Duyuru Bannerlarını Senkronize Et (Adminin eklediği görseller tüm kullanıcılara yansısın)
    try {
      const globalBannersStr = localStorage.getItem("tarim_cepte_global_ad_banners");
      if (globalBannersStr) {
        const globalBanners = JSON.parse(globalBannersStr);
        if (Array.isArray(globalBanners) && globalBanners.length > 0) {
          resolvedSettings.adBanners = globalBanners;
          if (globalBanners[0]) {
            resolvedSettings.adBanner = {
              ...globalBanners[0],
              imageUrl: globalBanners[0].imageUrl,
            };
          }
        }
      }
    } catch {
      // ignore
    }

    return {
      resolvedHarvests,
      resolvedGardens,
      resolvedExpenses,
      resolvedPayments,
      resolvedFactories,
      resolvedSettings,
    };
  };

  // Aktif yüklenen kullanıcı referansı (veri yazarken yarış durumunu engellemek için)
  const loadedUserIdRef = useRef<string | undefined>(currentUser?.id);

  // İlk state yüklemeleri (kullanıcıya özel izole veri)
  const initialScopedData = useRef(loadScopedUserData(currentUser)).current;

  // Persistent Data States with Scoped LocalStorage
  const [harvests, setHarvests] = useState<HarvestRecord[]>(initialScopedData.resolvedHarvests);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialScopedData.resolvedPayments);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialScopedData.resolvedExpenses);
  const [gardens, setGardens] = useState<Garden[]>(initialScopedData.resolvedGardens);
  const [factories, setFactories] = useState<FactoryPrice[]>(initialScopedData.resolvedFactories);
  const [settings, setSettings] = useState<AppSettings>(initialScopedData.resolvedSettings);

  // Kullanıcı değiştiğinde o kullanıcının özel verilerini anında yükle
  useEffect(() => {
    const scoped = loadScopedUserData(currentUser);
    setHarvests(scoped.resolvedHarvests);
    setPayments(scoped.resolvedPayments);
    setExpenses(scoped.resolvedExpenses);
    setGardens(scoped.resolvedGardens);
    setFactories(scoped.resolvedFactories);
    setSettings(scoped.resolvedSettings);
    loadedUserIdRef.current = currentUser?.id;
  }, [currentUser?.id]);

  // Tarım Pazar Yeri Kalıcı Durumları (İlanlar, Çavuşlar, Bireysel İşçiler, Başvurular, Hizmetler)
  const [jobs, setJobs] = useState<JobListing[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_jobs");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((j: any) => !deletedIds.has(j.id))
            .map((j: any) => ({
              ...j,
              employerPhone: j.employerPhone || j.phone || "0532 411 28 53",
            }));
        }
      }
      return INITIAL_JOBS.filter((j) => !deletedIds.has(j.id));
    } catch {
      return INITIAL_JOBS.filter((j) => !deletedIds.has(j.id));
    }
  });

  const [crews, setCrews] = useState<CrewLeaderProfile[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_crews");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((c: any) => !deletedIds.has(c.id))
            .map((c: any) => ({
              ...c,
              phone: c.phone || "0532 789 12 34",
            }));
        }
      }
      return INITIAL_CREWS.filter((c) => !deletedIds.has(c.id));
    } catch {
      return INITIAL_CREWS.filter((c) => !deletedIds.has(c.id));
    }
  });

  const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_workers");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((w: any) => !deletedIds.has(w.id))
            .map((w: any) => ({
              ...w,
              phone: w.phone || "0533 123 45 67",
            }));
        }
      }
      return INITIAL_WORKERS.filter((w) => !deletedIds.has(w.id));
    } catch {
      return INITIAL_WORKERS.filter((w) => !deletedIds.has(w.id));
    }
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_applications");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => !deletedIds.has(a.id));
        }
      }
      return INITIAL_APPLICATIONS.filter((a) => !deletedIds.has(a.id));
    } catch {
      return INITIAL_APPLICATIONS.filter((a) => !deletedIds.has(a.id));
    }
  });

  const [services, setServices] = useState<ServiceOffer[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_services");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s: any) => !deletedIds.has(s.id));
        }
      }
      return INITIAL_SERVICES.filter((s) => !deletedIds.has(s.id));
    } catch {
      return INITIAL_SERVICES.filter((s) => !deletedIds.has(s.id));
    }
  });

  // Sync state to local storage (Kullanıcı bazlı izole depolama)
  useEffect(() => {
    if (loadedUserIdRef.current === currentUser?.id) {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "harvests"), JSON.stringify(harvests));
    }
  }, [harvests]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUser?.id) {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "payments"), JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUser?.id) {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "expenses"), JSON.stringify(expenses));
    }
  }, [expenses]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUser?.id) {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "gardens"), JSON.stringify(gardens));
    }
  }, [gardens]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUser?.id) {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "factories"), JSON.stringify(factories));
    }
  }, [factories]);

  useEffect(() => {
    if (loadedUserIdRef.current === currentUser?.id) {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "settings"), JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("tarim_cepte_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("tarim_cepte_crews", JSON.stringify(crews));
  }, [crews]);

  useEffect(() => {
    localStorage.setItem("tarim_cepte_workers", JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem("tarim_cepte_applications", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("tarim_cepte_services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("tarim_cepte_users", JSON.stringify(users));
  }, [users]);

  // Tarım Pazaryeri Ürün İlanları (Fındık, Çay, Mısır, Sebze, vb.)
  const [products, setProducts] = useState<AgriProductListing[]>(() => {
    const deletedIds = getDeletedIds();
    try {
      const saved = localStorage.getItem("tarim_cepte_agri_products");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => !deletedIds.has(p.id));
        }
      }
      return INITIAL_AGRI_PRODUCTS.filter((p) => !deletedIds.has(p.id));
    } catch {
      return INITIAL_AGRI_PRODUCTS.filter((p) => !deletedIds.has(p.id));
    }
  });

  useEffect(() => {
    localStorage.setItem("tarim_cepte_agri_products", JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (newProd: AgriProductListing) => {
    setProducts((prev) => [newProd, ...prev]);
    showAndroidToast("Ürün ilanı yayınlandı");
  };

  const handleDeleteProduct = (id: string) => {
    registerDeletedId(id, "products");
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem("tarim_cepte_agri_products", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Ürün ilanı kalıcı olarak silindi");
  };

  // Synchronize persisted data from server backend on mount
  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const serverData = res.data;
          const deletedIds = getDeletedIds();
          if (Array.isArray(serverData.deleted_ids)) {
            serverData.deleted_ids.forEach((id: string) => deletedIds.add(id));
            localStorage.setItem("tarim_cepte_deleted_ids", JSON.stringify(Array.from(deletedIds)));
          }
          if (Array.isArray(serverData.services) && serverData.services.length > 0) {
            setServices(serverData.services.filter((s: any) => !deletedIds.has(s.id)));
          }
          if (Array.isArray(serverData.jobs) && serverData.jobs.length > 0) {
            setJobs(serverData.jobs.filter((j: any) => !deletedIds.has(j.id)));
          }
          if (Array.isArray(serverData.crews) && serverData.crews.length > 0) {
            setCrews(serverData.crews.filter((c: any) => !deletedIds.has(c.id)));
          }
          if (Array.isArray(serverData.workers) && serverData.workers.length > 0) {
            setWorkers(serverData.workers.filter((w: any) => !deletedIds.has(w.id)));
          }
          if (Array.isArray(serverData.products) && serverData.products.length > 0) {
            setProducts(serverData.products.filter((p: any) => !deletedIds.has(p.id)));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Garden Update Handler
  const handleUpdateGarden = (updated: Garden) => {
    setGardens((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  // Handlers
  const handleSaveHarvest = (
    newHarvestData: Omit<
      HarvestRecord,
      "id" | "grossAmount" | "deductionAmount" | "netReceivable" | "status" | "collectedAmount"
    > & {
      grossAmount?: number;
      deductionAmount?: number;
      netReceivable?: number;
    }
  ) => {
    const gross =
      newHarvestData.grossAmount ??
      newHarvestData.quantityKg * newHarvestData.unitPriceGross;
    const deduction =
      newHarvestData.deductionAmount ?? gross * newHarvestData.deductionRate;
    const net =
      newHarvestData.netReceivable ?? (gross - deduction);

    const newRecord: HarvestRecord = {
      ...newHarvestData,
      id: `h-${Date.now()}`,
      grossAmount: gross,
      deductionAmount: deduction,
      netReceivable: net,
      collectedAmount: 0,
      status: "pending",
    };

    setHarvests((prev) => [newRecord, ...prev]);
  };

  const handleSavePayment = (newPaymentData: Omit<PaymentRecord, "id">) => {
    const newRecord: PaymentRecord = {
      ...newPaymentData,
      id: `p-${Date.now()}`,
    };

    setPayments((prev) => [newRecord, ...prev]);

    // If payment is tied to a specific harvest, update collectedAmount
    if (newPaymentData.harvestId) {
      setHarvests((prev) =>
        prev.map((h) => {
          if (h.id === newPaymentData.harvestId) {
            const updatedCollected = (h.collectedAmount || 0) + newPaymentData.amount;
            const isCompleted = updatedCollected >= h.netReceivable - 0.5;
            return {
              ...h,
              collectedAmount: updatedCollected,
              status: isCompleted ? "completed" : "partial",
            };
          }
          return h;
        })
      );
    }
  };

  const handleAddExpense = (newExpData: Omit<ExpenseRecord, "id">) => {
    const newExp: ExpenseRecord = {
      ...newExpData,
      id: `e-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleQuickCompleteHarvest = (harvestId: string) => {
    const harvest = harvests.find((h) => h.id === harvestId);
    if (!harvest) return;
    const remaining = harvest.netReceivable - (harvest.collectedAmount || 0);
    if (remaining <= 0.01) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const newRecord: PaymentRecord = {
      id: `p-${Date.now()}`,
      harvestId: harvest.id,
      date: todayStr,
      amount: remaining,
      note: `${harvest.buyerName} - Bakiye Tamamı Tahsil Edildi`,
      paymentMethod: "bank",
    };

    setPayments((prev) => [newRecord, ...prev]);
    setHarvests((prev) =>
      prev.map((h) =>
        h.id === harvestId
          ? { ...h, collectedAmount: h.netReceivable, status: "completed" }
          : h
      )
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    const p = payments.find((x) => x.id === paymentId);
    if (!p) return;

    registerDeletedId(paymentId, "payments");
    const nextPayments = payments.filter((x) => x.id !== paymentId);
    setPayments(nextPayments);
    try {
      localStorage.setItem(getUserStorageKey(currentUser?.id, "payments"), JSON.stringify(nextPayments));
    } catch {}

    if (p.harvestId) {
      setHarvests((prev) => {
        const next = prev.map((h) => {
          if (h.id === p.harvestId) {
            const newCollected = Math.max(0, (h.collectedAmount || 0) - p.amount);
            return {
              ...h,
              collectedAmount: newCollected,
              status: (newCollected <= 0.01 ? "pending" : "partial") as "pending" | "partial",
            };
          }
          return h;
        });
        try {
          localStorage.setItem(getUserStorageKey(currentUser?.id, "harvests"), JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    showAndroidToast("Tahsilat kaydı silindi");
  };

  const handleAddGarden = (newGardenData: Omit<Garden, "id">) => {
    const newG: Garden = {
      ...newGardenData,
      id: `g-${Date.now()}`,
    };
    setGardens((prev) => {
      const next = [...prev, newG];
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "gardens"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Bahçe başarıyla eklendi");
  };

  const handleDeleteHarvest = (id: string) => {
    registerDeletedId(id, "harvests");
    setHarvests((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "harvests"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Hasat kaydı kalıcı olarak silindi");
  };

  const handleUpdateHarvest = (updatedHarvest: HarvestRecord) => {
    setHarvests((prev) => {
      const next = prev.map((h) => (h.id === updatedHarvest.id ? updatedHarvest : h));
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "harvests"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Hasat kaydı güncellendi");
  };

  const handleDeleteExpense = (id: string) => {
    registerDeletedId(id, "expenses");
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "expenses"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Masraf kaydı silindi");
  };

  const handleUpdateExpense = (updatedExpense: ExpenseRecord) => {
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e));
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "expenses"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Masraf kaydı güncellendi");
  };

  const handleDeleteGarden = (id: string) => {
    registerDeletedId(id, "gardens");
    setGardens((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "gardens"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Bahçe kalıcı olarak silindi");
  };

  // Yalnızca geçerli kullanıcının kendi eklediği fabrikalar ve genel standart fabrikalar
  const visibleFactories = useMemo(() => {
    return factories.filter((f) => {
      // Genel standart fabrika ise herkes görür
      if (!f.isUserAdded && !f.userId) return true;
      // Admin tüm fabrikaları denetleyebilir
      if (currentUser?.role === "admin" || currentRole === "admin") return true;
      // Kullanıcının kendi eklediği fabrikayı SADECE kendisi görür
      return Boolean(
        currentUser &&
          (f.userId === currentUser.id ||
            (f.createdBy &&
              (f.createdBy === currentUser.fullName || f.createdBy === currentUser.username)))
      );
    });
  }, [factories, currentUser, currentRole]);

  const handleAddFactory = (newFactoryData: Omit<FactoryPrice, "id">) => {
    const newFactory: FactoryPrice = {
      ...newFactoryData,
      id: `f-${Date.now()}`,
      isUserAdded: true,
      userId: currentUser?.id,
      createdBy: currentUser?.fullName || currentUser?.username,
    };
    setFactories((prev) => {
      const next = [newFactory, ...prev];
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "factories"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${newFactory.factoryName}" fabrikası eklendi`);
  };

  const handleDeleteFactory = (id: string) => {
    const target = factories.find((f) => f.id === id);
    if (!target) return;
    const isOwner = Boolean(
      currentUser &&
        (target.userId === currentUser.id ||
          (target.createdBy &&
            (target.createdBy === currentUser.fullName || target.createdBy === currentUser.username)))
    );
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    registerDeletedId(id, "factories");
    setFactories((prev) => {
      const next = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem(getUserStorageKey(currentUser?.id, "factories"), JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${target.factoryName}" fabrikası silindi`);
  };

  const handleUpdateFactory = (updatedFactory: FactoryPrice) => {
    const target = factories.find((f) => f.id === updatedFactory.id);
    if (!target) return;
    const isOwner = Boolean(
      currentUser &&
        (target.userId === currentUser.id ||
          (target.createdBy &&
            (target.createdBy === currentUser.fullName || target.createdBy === currentUser.username)))
    );
    if (currentUser?.role !== "admin" && !isOwner) {
      return;
    }
    setFactories((prev) =>
      prev.map((f) => (f.id === updatedFactory.id ? updatedFactory : f))
    );
  };

  // Tarım Pazar Yeri Handlers
  const handleSaveJob = (jobData: Omit<JobListing, "id" | "createdAt" | "applicantsCount">) => {
    if (!currentUser && currentRole !== "admin") return;

    // 'Kötü Söz Denetleyici' (Profanity Filter): İlan ve açıklama alanlarını denetle
    const profanityResult = checkProfanity({
      "İlan Başlığı": jobData.title,
      "İlan Açıklaması / Notlar": jobData.notes,
      "İşveren Adı": jobData.employerName,
      "Şehir": jobData.locationCity,
      "İlçe": jobData.locationDistrict,
    });
    if (!profanityResult.isValid) {
      showAndroidToast(profanityResult.errorMessage || "İlan içeriğinde sansürlü veya topluluk kurallarına aykırı kelime tespit edildi!");
      return;
    }

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const newJob: JobListing = {
      ...jobData,
      id: `j-${now}`,
      employerId: currentUser?.id,
      employerName: currentUser?.fullName || currentUser?.username || jobData.employerName,
      employerPhone: currentUser?.phone || jobData.employerPhone,
      createdAt: "Bugün",
      createdAtTimestamp: now,
      expiresAtTimestamp: now + SEVEN_DAYS_MS,
      status: "active",
      applicantsCount: 0,
    };
    setJobs((prev) => {
      const next = [newJob, ...prev];
      try {
        localStorage.setItem("tarim_cepte_jobs", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${newJob.title}" ilanı 7 gün süreyle başarıyla yayına alındı`);
  };

  const handleUpdateJob = (updatedJob: JobListing) => {
    const target = jobs.find((j) => j.id === updatedJob.id);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.employerId && target.employerId === currentUser.id) ||
      Boolean(currentUser && !target.employerId && (target.employerName === currentUser.fullName || target.employerName === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }

    // 'Kötü Söz Denetleyici' (Profanity Filter)
    const profanityResult = checkProfanity({
      "İlan Başlığı": updatedJob.title,
      "İlan Açıklaması / Notlar": updatedJob.notes,
      "İşveren Adı": updatedJob.employerName,
      "Şehir": updatedJob.locationCity,
      "İlçe": updatedJob.locationDistrict,
    });
    if (!profanityResult.isValid) {
      showAndroidToast(profanityResult.errorMessage || "İlan içeriğinde sansürlü veya topluluk kurallarına aykırı kelime tespit edildi!");
      return;
    }

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const finalJob: JobListing = {
      ...updatedJob,
      createdAtTimestamp: updatedJob.createdAtTimestamp || now,
      expiresAtTimestamp: updatedJob.status === "active" && (!updatedJob.expiresAtTimestamp || updatedJob.expiresAtTimestamp <= now)
        ? now + SEVEN_DAYS_MS
        : updatedJob.expiresAtTimestamp,
    };
    setJobs((prev) => {
      const next = prev.map((j) => (j.id === updatedJob.id ? finalJob : j));
      try {
        localStorage.setItem("tarim_cepte_jobs", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${updatedJob.title}" ilanı güncellendi`);
  };

  const handleDeleteJob = (id: string) => {
    const target = jobs.find((j) => j.id === id);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.employerId && target.employerId === currentUser.id) ||
      Boolean(currentUser && !target.employerId && (target.employerName === currentUser.fullName || target.employerName === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    registerDeletedId(id, "jobs");
    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      try {
        localStorage.setItem("tarim_cepte_jobs", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${target.title}" ilanı kalıcı olarak silindi`);
  };

  const handleUpdateJobStatus = (id: string, status: JobListing["status"]) => {
    const target = jobs.find((j) => j.id === id);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.employerId && target.employerId === currentUser.id) ||
      Boolean(currentUser && !target.employerId && (target.employerName === currentUser.fullName || target.employerName === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    setJobs((prev) => {
      const next = prev.map((j) => {
        if (j.id !== id) return j;
        if (status === "active") {
          return {
            ...j,
            status: "active" as const,
            createdAt: "Bugün",
            createdAtTimestamp: now,
            expiresAtTimestamp: now + SEVEN_DAYS_MS,
          };
        } else {
          return {
            ...j,
            status,
          };
        }
      });
      try {
        localStorage.setItem("tarim_cepte_jobs", JSON.stringify(next));
      } catch {}
      return next;
    });
    if (status === "active") {
      showAndroidToast(`"${target.title}" ilanı 7 gün süreyle tekrar aktif edildi!`);
    } else {
      showAndroidToast(`"${target.title}" ilanı pasife alındı (diğer kullanıcılara gizlendi)`);
    }
  };

  const handleApplyToJob = (appData: Omit<JobApplication, "id" | "createdAt">) => {
    if (!currentUser && currentRole !== "admin") return;

    // 'Kötü Söz Denetleyici' (Profanity Filter): Başvuran adı ve teklif açıklamasını denetle
    const profanityResult = checkProfanity({
      "Başvuran Adı": appData.applicantName,
      "Başvuru Açıklaması / Teklif Notu": appData.offerNote,
    });
    if (!profanityResult.isValid) {
      showAndroidToast(profanityResult.errorMessage || "Başvuru içeriğinde sansürlü veya uygunsuz kelime tespit edildi!");
      return;
    }

    const newApp: JobApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      applicantId: currentUser?.id,
      applicantName: currentUser?.fullName || currentUser?.username || appData.applicantName,
      applicantPhone: currentUser?.phone || appData.applicantPhone,
      createdAt: "Şimdi",
    };
    setApplications((prev) => [newApp, ...prev]);
    setJobs((prev) =>
      prev.map((j) => (j.id === appData.jobId ? { ...j, applicantsCount: (j.applicantsCount || 0) + 1 } : j))
    );
    showAndroidToast("İş başvurunuz iletildi");
  };

  const handleUpdateApplicationStatus = (id: string, status: JobApplication["status"]) => {
    setApplications((prev) => {
      const targetApp = prev.find((a) => a.id === id);
      if (!targetApp) return prev;
      const relatedJob = jobs.find((j) => j.id === targetApp.jobId);
      const isJobEmployer = Boolean(currentUser && relatedJob?.employerId && relatedJob.employerId === currentUser.id) ||
        Boolean(currentUser && !relatedJob?.employerId && (relatedJob?.employerName === currentUser.fullName || relatedJob?.employerName === currentUser.username));
      if (currentUser?.role !== "admin" && currentRole !== "admin" && !isJobEmployer) {
        return prev;
      }

      const updatedApplications = prev.map((a) => (a.id === id ? { ...a, status } : a));

      if (targetApp.jobId) {
        if (status === "accepted") {
          // İlgili ilan kabul edildiğinde ilanı pasif (filled/inactive) yap
          setJobs((jobPrev) =>
            jobPrev.map((j) => (j.id === targetApp.jobId ? { ...j, status: "filled" } : j))
          );
        } else {
          // Eğer kabul durumu geri alındıysa/reddedildiyse ve bu ilana ait başka kabul edilmiş başvuru yoksa ilanı tekrar aktif yap
          const hasOtherAccepted = updatedApplications.some(
            (a) => a.jobId === targetApp.jobId && a.id !== id && a.status === "accepted"
          );
          if (!hasOtherAccepted) {
            setJobs((jobPrev) =>
              jobPrev.map((j) => (j.id === targetApp.jobId && j.status === "filled" ? { ...j, status: "active" } : j))
            );
          }
        }
      }

      return updatedApplications;
    });
  };

  const handleSaveService = (srvData: Omit<ServiceOffer, "id"> & { id?: string; userId?: string }) => {
    if (!currentUser && currentRole !== "admin") return;

    // 'Kötü Söz Denetleyici' (Profanity Filter): Hizmet başlığı ve açıklamasını denetle
    const profanityResult = checkProfanity({
      "Hizmet Başlığı": srvData.title,
      "Hizmet Açıklaması": srvData.description,
      "Hizmet Veren Adı": srvData.providerName,
      "Şehir": srvData.city,
    });
    if (!profanityResult.isValid) {
      showAndroidToast(profanityResult.errorMessage || "Hizmet ilanında sansürlü veya uygunsuz kelime tespit edildi!");
      return;
    }

    if (srvData.id) {
      const target = services.find((s) => s.id === srvData.id);
      if (!target) return;
      const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
        Boolean(currentUser && !target.userId && (target.providerName === currentUser.fullName || target.providerName === currentUser.username));
      if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
        return;
      }
      setServices((prev) => {
        const next = prev.map((s) => (s.id === srvData.id ? { ...s, ...srvData } : s));
        try {
          localStorage.setItem("tarim_cepte_services", JSON.stringify(next));
        } catch {}
        return next;
      });
      showAndroidToast("Zirai hizmet güncellendi");
    } else {
      const newSrv: ServiceOffer = {
        ...srvData,
        id: `so-${Date.now()}`,
        userId: currentUser?.id,
        rating: 5.0,
      };
      setServices((prev) => {
        const next = [newSrv, ...prev];
        try {
          localStorage.setItem("tarim_cepte_services", JSON.stringify(next));
        } catch {}
        return next;
      });
      showAndroidToast("Yeni zirai hizmet teklifi eklendi");
    }
  };

  const handleDeleteService = (id: string) => {
    const target = services.find((s) => s.id === id);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
      Boolean(currentUser && !target.userId && (target.providerName === currentUser.fullName || target.providerName === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    registerDeletedId(id, "services");
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem("tarim_cepte_services", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${target.title}" hizmeti kalıcı olarak silindi`);
  };

  const handleUpdateWorkerStatus = (workerId: string, status: "available" | "busy", wage: number) => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
      Boolean(currentUser && !target.userId && (target.name === currentUser.fullName || target.name === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, availabilityStatus: status, expectedDailyWage: wage } : w))
    );
  };

  const handleAddCrewMember = (crewId: string, member: Omit<CrewMember, "id">) => {
    const target = crews.find((c) => c.id === crewId);
    if (!target) return;
    const newMember: CrewMember = {
      ...member,
      id: `cm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCrews((prev) => {
      const next = prev.map((c) =>
        c.id === crewId
          ? {
              ...c,
              members: [...(c.members || []), newMember],
              crewSize: Math.max(c.crewSize || 1, (c.members?.length || 0) + 1),
            }
          : c
      );
      try {
        localStorage.setItem("tarim_cepte_crews", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Ekip üyesi eklendi");
  };

  const handleDeleteCrewMember = (crewId: string, memberId: string) => {
    const target = crews.find((c) => c.id === crewId);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
      Boolean(currentUser && !target.userId && (target.name === currentUser.fullName || target.name === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    setCrews((prev) => {
      const next = prev.map((c) =>
        c.id === crewId
          ? {
              ...c,
              members: (c.members || []).filter((m) => m.id !== memberId),
              crewSize: Math.max(1, (c.members || []).length - 1),
            }
          : c
      );
      try {
        localStorage.setItem("tarim_cepte_crews", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Ekip üyesi çıkarıldı");
  };

  const handleDeleteCrew = (id: string) => {
    const target = crews.find((c) => c.id === id);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
      Boolean(currentUser && !target.userId && (target.name === currentUser.fullName || target.name === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    registerDeletedId(id, "crews");
    setCrews((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem("tarim_cepte_crews", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${target.name}" ekibi kalıcı olarak silindi`);
  };

  const handleSaveCrew = (crewData: Omit<CrewLeaderProfile, "id" | "rating" | "verified"> & { id?: string; userId?: string; members?: CrewMember[] }) => {
    if (!currentUser && currentRole !== "admin") return;

    // 'Kötü Söz Denetleyici' (Profanity Filter)
    const profanityResult = checkProfanity({
      "Ekip Adı / Çavuş": crewData.name,
      "Konum": crewData.location,
    });
    if (!profanityResult.isValid) {
      showAndroidToast(profanityResult.errorMessage || "Ekip kaydında sansürlü veya uygunsuz kelime tespit edildi!");
      return;
    }

    if (crewData.id) {
      const target = crews.find((c) => c.id === crewData.id);
      if (!target) return;
      const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
        Boolean(currentUser && !target.userId && (target.name === currentUser.fullName || target.name === currentUser.username));
      if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
        return;
      }
      setCrews((prev) => {
        const next = prev.map((c) =>
          c.id === crewData.id
            ? {
                ...c,
                ...crewData,
                members: crewData.members !== undefined ? crewData.members : (c.members || []),
                crewSize: Math.max(crewData.crewSize || 1, (crewData.members || c.members || []).length),
              }
            : c
        );
        try {
          localStorage.setItem("tarim_cepte_crews", JSON.stringify(next));
        } catch {}
        return next;
      });
      showAndroidToast("Çavuş profili güncellendi");
    } else {
      const initialMembers = crewData.members || [];
      const newCrew: CrewLeaderProfile = {
        ...crewData,
        id: `c-${Date.now()}`,
        userId: currentUser?.id,
        rating: 5.0,
        verified: true,
        members: initialMembers,
        crewSize: Math.max(crewData.crewSize || 1, initialMembers.length),
      };
      setCrews((prev) => {
        const next = [newCrew, ...prev];
        try {
          localStorage.setItem("tarim_cepte_crews", JSON.stringify(next));
        } catch {}
        return next;
      });
      showAndroidToast("Çavuş ve ekip kaydı oluşturuldu");
    }
  };

  const handleDeleteWorker = (id: string) => {
    const target = workers.find((w) => w.id === id);
    if (!target) return;
    const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
      Boolean(currentUser && !target.userId && (target.name === currentUser.fullName || target.name === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
      return;
    }
    registerDeletedId(id, "workers");
    setWorkers((prev) => {
      const next = prev.filter((w) => w.id !== id);
      try {
        localStorage.setItem("tarim_cepte_workers", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast(`"${target.name}" işçi profili kalıcı olarak silindi`);
  };

  const handleSaveWorker = (workerData: Omit<WorkerProfile, "id" | "rating" | "reviewCount"> & { id?: string; userId?: string }) => {
    if (!currentUser && currentRole !== "admin") return;

    // 'Kötü Söz Denetleyici' (Profanity Filter)
    const profanityResult = checkProfanity({
      "İşçi Adı": workerData.name,
      "Konum": workerData.location,
    });
    if (!profanityResult.isValid) {
      showAndroidToast(profanityResult.errorMessage || "İşçi profilinde sansürlü veya uygunsuz kelime tespit edildi!");
      return;
    }

    if (workerData.id) {
      const target = workers.find((w) => w.id === workerData.id);
      if (!target) return;
      const isOwner = Boolean(currentUser && target.userId && target.userId === currentUser.id) ||
        Boolean(currentUser && !target.userId && (target.name === currentUser.fullName || target.name === currentUser.username));
      if (currentUser?.role !== "admin" && currentRole !== "admin" && !isOwner) {
        return;
      }
      setWorkers((prev) => {
        const next = prev.map((w) =>
          w.id === workerData.id
            ? { ...w, ...workerData }
            : w
        );
        try {
          localStorage.setItem("tarim_cepte_workers", JSON.stringify(next));
        } catch {}
        return next;
      });
      showAndroidToast("İşçi profili güncellendi");
    } else {
      const newWorker: WorkerProfile = {
        ...workerData,
        id: `w-${Date.now()}`,
        userId: currentUser?.id,
        rating: 5.0,
        reviewCount: 1,
      };
      setWorkers((prev) => {
        const next = [newWorker, ...prev];
        try {
          localStorage.setItem("tarim_cepte_workers", JSON.stringify(next));
        } catch {}
        return next;
      });
      showAndroidToast("İşçi profili yayınlandı");
    }
  };

  const handleDeleteApplication = (id: string) => {
    const target = applications.find((a) => a.id === id);
    if (!target) return;
    const relatedJob = jobs.find((j) => j.id === target.jobId);
    const isApplicant = Boolean(currentUser && target.applicantId && target.applicantId === currentUser.id) ||
      Boolean(currentUser && !target.applicantId && (target.applicantName === currentUser.fullName || target.applicantName === currentUser.username));
    const isJobEmployer = Boolean(currentUser && relatedJob?.employerId && relatedJob.employerId === currentUser.id) ||
      Boolean(currentUser && !relatedJob?.employerId && (relatedJob?.employerName === currentUser.fullName || relatedJob?.employerName === currentUser.username));
    if (currentUser?.role !== "admin" && currentRole !== "admin" && !isApplicant && !isJobEmployer) {
      return;
    }
    registerDeletedId(id, "applications");
    setApplications((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem("tarim_cepte_applications", JSON.stringify(next));
      } catch {}
      return next;
    });
    showAndroidToast("Başvuru kalıcı olarak silindi");
  };

  const handleWipeAllData = () => {
    localStorage.removeItem("tarim_cepte_harvests");
    localStorage.removeItem("tarim_cepte_payments");
    localStorage.removeItem("tarim_cepte_expenses");
    localStorage.removeItem("tarim_cepte_gardens");
    localStorage.removeItem("tarim_cepte_factories");
    localStorage.removeItem("tarim_cepte_settings");
    localStorage.removeItem("tarim_cepte_jobs");
    localStorage.removeItem("tarim_cepte_crews");
    localStorage.removeItem("tarim_cepte_workers");
    localStorage.removeItem("tarim_cepte_applications");
    localStorage.removeItem("tarim_cepte_services");
    localStorage.removeItem("tarim_cepte_agri_products");

    setHarvests([]);
    setPayments([]);
    setExpenses([]);
    setGardens(INITIAL_GARDENS);
    setFactories(FACTORY_PRICES);
    setSettings(DEFAULT_APP_SETTINGS);
    setJobs(INITIAL_JOBS);
    setCrews(INITIAL_CREWS);
    setWorkers(INITIAL_WORKERS);
    setApplications([]);
    setServices(INITIAL_SERVICES);
    setProducts([]);
    setActiveTab("home");
  };

  const handleWipeAccountAndData = () => {
    if (currentUser) {
      setUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    }
    handleWipeAllData();
    localStorage.removeItem("tarim_cepte_current_user");
    setCurrentUser(null);
    setAuthModalInitialMode("login");
    setIsAuthModalOpen(true);
  };

  const handleSelectHarvestForPayment = (harvest: HarvestRecord) => {
    setSelectedHarvestForPayment(harvest.id);
    setIsPaymentModalOpen(true);
  };

  // KULLANICI GİRİŞİ YAPILMADAN UYGULAMAYI ÇALIŞTIRMA (GİRİŞ KAPISI)
  if (!currentUser) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 transition-colors duration-200 ${
          isDark ? "bg-[#06140f] text-emerald-50" : "bg-[#edf6f0] text-[#052115]"
        }`}
      >
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          isDark={isDark}
          initialMode={authModalInitialMode}
          users={users}
          currentUser={currentUser}
          onLogin={handleLoginSuccess}
          onRegister={handleRegisterUser}
          onResetPassword={handleResetPassword}
          canClose={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 w-full max-w-full overflow-x-hidden ${
        isDark ? "bg-[#06140f] text-emerald-50" : "bg-[#edf6f0] text-[#052115]"
      }`}
    >
      {/* Top Application Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        userName={currentUser ? (currentUser.fullName || currentUser.username) : "Misafir"}
        currentUser={currentUser}
        farmingFocus={farmingFocus}
        onOpenUserSettings={() => {
          if (currentUser) {
            setIsUserSettingsModalOpen(true);
          } else {
            setAuthModalInitialMode("login");
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAuthModal={() => {
          setAuthModalInitialMode("login");
          setIsAuthModalOpen(true);
        }}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Network Connectivity Status for Offline Karadeniz Valley Operations */}
      <OfflineIndicator />

      {/* Main Container - Responsive layout: Edge-to-edge native on mobile, optional phone frame on desktop */}
      <main
        className={`mx-auto transition-all duration-300 w-full max-w-full overflow-x-hidden ${
          isMobileFrame
            ? "max-w-md px-1.5 sm:px-4 py-1.5 sm:py-6"
            : "max-w-4xl px-2 sm:px-4 py-2 sm:py-6"
        }`}
      >
        {/* Device Frame Wrapper when in Mobile Frame Mode (Desktop Mockup on sm+, edge-to-edge native on phones) */}
        <div
          className={
            isMobileFrame
              ? `sm:rounded-[38px] sm:border-4 sm:shadow-2xl p-2 sm:p-4 overflow-hidden relative transition-colors ${
                  isDark
                    ? "bg-[#0c1c15] sm:border-emerald-950 sm:shadow-emerald-950/60"
                    : "bg-white sm:border-emerald-800/30 sm:shadow-emerald-900/15"
                }`
              : ""
          }
        >
          {/* Simulated Mobile Status Notch ONLY on desktop screens */}
          {isMobileFrame && (
            <div className="hidden sm:flex items-center justify-between px-3 pt-1 pb-2 text-[11px] font-semibold opacity-70">
              <span>09:41</span>
              <div className="w-16 h-3.5 bg-black/40 rounded-full mx-auto" />
              <span className="flex items-center gap-1">5G 100%</span>
            </div>
          )}

          {/* Tab Views */}
          <div className="min-h-[560px]">
            {activeTab === "home" && (
              <HomeOverview
                harvests={harvests}
                payments={payments}
                expenses={expenses}
                isDark={isDark}
                farmingFocus={farmingFocus}
                jobsCount={jobs.length}
                crewsCount={crews.length}
                workersCount={workers.length}
                servicesCount={services.length}
                applicationsCount={applications.length}
                settings={settings}
                currentUser={currentUser}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
                onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
                onOpenAddHarvest={() => setIsHarvestModalOpen(true)}
                onOpenAddPayment={() => {
                  setSelectedHarvestForPayment(undefined);
                  setIsPaymentModalOpen(true);
                }}
                onNavigateTab={(tab, subTab) => {
                  if (tab === "harvest") {
                    setIsHarvestModalOpen(true);
                  } else {
                    if (tab === "marketplace" && subTab) {
                      setInitialMarketSubTab(subTab as any);
                    }
                    setActiveTab(tab as any);
                  }
                }}
                onSelectHarvestForPayment={handleSelectHarvestForPayment}
              />
            )}

            {activeTab === "marketplace" && (
              <MarketplaceView
                currentRole={currentRole}
                currentUser={currentUser}
                isDark={isDark}
                farmingFocus={farmingFocus}
                jobs={jobs}
                crews={crews}
                workers={workers}
                applications={applications}
                services={services}
                initialSubTab={initialMarketSubTab}
                onSaveJob={handleSaveJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
                onUpdateJobStatus={handleUpdateJobStatus}
                onApplyToJob={handleApplyToJob}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
                onSaveService={handleSaveService}
                onDeleteService={handleDeleteService}
                onUpdateWorkerStatus={handleUpdateWorkerStatus}
                onDeleteWorker={handleDeleteWorker}
                onDeleteCrew={handleDeleteCrew}
                onDeleteApplication={handleDeleteApplication}
                onAddCrewMember={handleAddCrewMember}
                onDeleteCrewMember={handleDeleteCrewMember}
                onSaveCrew={handleSaveCrew}
                onSaveWorker={handleSaveWorker}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === "assistant" && (
              <AssistantView
                harvests={harvests}
                payments={payments}
                isDark={isDark}
              />
            )}

            {activeTab === "receivables" && (
              <ReceivablesView
                harvests={harvests}
                payments={payments}
                isDark={isDark}
                currentRole={currentRole}
                farmingFocus={farmingFocus}
                onOpenPaymentModal={(hId) => {
                  setSelectedHarvestForPayment(hId);
                  setIsPaymentModalOpen(true);
                }}
                onQuickCompleteHarvest={handleQuickCompleteHarvest}
                onDeletePayment={handleDeletePayment}
                onDeleteHarvest={handleDeleteHarvest}
              />
            )}

            {activeTab === "agronomy" && (
              <AgronomyGuideView
                isDark={isDark}
              />
            )}

            {activeTab === "other" && (
              <OtherOperationsView
                harvests={harvests}
                expenses={expenses}
                payments={payments}
                gardens={gardens}
                factories={visibleFactories}
                isDark={isDark}
                currentUser={currentUser}
                users={users}
                adminMessages={adminMessages}
                farmingFocus={farmingFocus}
                onOpenUserSettings={() => {
                  if (currentUser) {
                    setIsUserSettingsModalOpen(true);
                  } else {
                    setAuthModalInitialMode("login");
                    setIsAuthModalOpen(true);
                  }
                }}
                onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                onOpenSettings={() => setIsAdvancedSettingsOpen(true)}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
                onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
                onNavigateTab={(tab, subTab) => {
                  if (tab === "marketplace" && subTab) {
                    setInitialMarketSubTab(subTab as any);
                  }
                  setActiveTab(tab as any);
                }}
                onDeleteHarvest={handleDeleteHarvest}
                onUpdateHarvest={handleUpdateHarvest}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteGarden={handleDeleteGarden}
                onUpdateGarden={handleUpdateGarden}
                onDeleteFactory={handleDeleteFactory}
                onAddExpense={handleAddExpense}
                onAddGarden={handleAddGarden}
                onAddFactory={handleAddFactory}
                onUpdateFactory={handleUpdateFactory}
                onSendAdminMessage={handleSendAdminMessage}
                onDeleteAdminMessage={handleDeleteAdminMessage}
              />
            )}
          </div>

          {/* Bottom Fixed Navigation: 1. Hasat | 2. Pazar Yeri & İlanlar | 3. Hasat Ekle (Ortada) | 4. Tahsilat | 5. İşlemler */}
          <nav
            id="bottom-navigation-bar"
            className={`sticky bottom-0 -mx-2 sm:-mx-4 -mb-2 sm:-mb-4 px-2 sm:px-3 pt-1.5 pb-safe-nav border-t backdrop-blur-md transition-colors z-30 flex items-center justify-around ${
              isDark
                ? "bg-[#0b1b14]/95 border-emerald-900/60 text-emerald-200"
                : "bg-white/95 border-emerald-300 text-emerald-950 shadow-lg shadow-emerald-950/10"
            }`}
          >
            {/* 1. Hasat & Bahçe Takibi */}
            <button
              id="nav-tab-home"
              type="button"
              onClick={() => setActiveTab("home")}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 transition-all duration-200 ease-out cursor-pointer select-none ${
                activeTab === "home"
                  ? isDark
                    ? "text-[#20C878] font-bold scale-105"
                    : "text-emerald-950 font-black scale-105"
                  : isDark
                  ? "text-emerald-200/70 hover:text-emerald-100 hover:scale-102 scale-100"
                  : "text-emerald-900/80 hover:text-emerald-950 font-bold hover:scale-102 scale-100"
              }`}
            >
              <Home className="w-5 h-5 transition-transform duration-200" />
              <span className="text-[10px] tracking-tight leading-tight mt-0.5">Hasat</span>
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-200 ${
                  activeTab === "home"
                    ? isDark
                      ? "bg-[#20C878] scale-100 opacity-100 shadow-sm shadow-emerald-400/50"
                      : "bg-emerald-900 scale-100 opacity-100 shadow-sm"
                    : "scale-0 opacity-0 bg-transparent"
                }`}
              />
            </button>

            {/* 2. Tarım Pazar Yeri & İş Gücü (Hasat İlanları, Çavuşlar, İşçiler, Hizmetler, Başvurular) */}
            <button
              id="nav-tab-marketplace"
              type="button"
              onClick={() => {
                setActiveTab("marketplace");
              }}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 transition-all duration-200 ease-out cursor-pointer select-none ${
                activeTab === "marketplace"
                  ? isDark
                    ? "text-[#20C878] font-bold scale-105"
                    : "text-emerald-950 font-black scale-105"
                  : isDark
                  ? "text-emerald-200/70 hover:text-emerald-100 hover:scale-102 scale-100"
                  : "text-emerald-900/80 hover:text-emerald-950 font-bold hover:scale-102 scale-100"
              }`}
            >
              <div className="relative">
                <Briefcase className="w-5 h-5 transition-transform duration-200" />
                {jobs.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                    {jobs.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-tight mt-0.5">Pazar Yeri</span>
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-200 ${
                  activeTab === "marketplace"
                    ? isDark
                      ? "bg-[#20C878] scale-100 opacity-100 shadow-sm shadow-emerald-400/50"
                      : "bg-emerald-900 scale-100 opacity-100 shadow-sm"
                    : "scale-0 opacity-0 bg-transparent"
                }`}
              />
            </button>

            {/* 3. HASAT EKLEME (Ortada Vurgulu Buton) */}
            <button
              id="nav-tab-add-harvest"
              type="button"
              onClick={() => setIsHarvestModalOpen(true)}
              className="flex flex-col items-center justify-center -mt-5 group min-w-[58px] min-h-[52px] cursor-pointer"
              title="Yeni Hasat Ekle"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-110 group-active:scale-95 transition-transform duration-200 border-2 border-white dark:border-[#0c1c15]">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className={`text-[10px] mt-0.5 font-black ${isDark ? "text-[#20C878]" : "text-emerald-950"}`}>
                Hasat Ekle
              </span>
            </button>

            {/* 4. Tahsilat */}
            <button
              id="nav-tab-receivables"
              type="button"
              onClick={() => setActiveTab("receivables")}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 transition-all duration-200 ease-out cursor-pointer select-none ${
                activeTab === "receivables"
                  ? isDark
                    ? "text-[#20C878] font-bold scale-105"
                    : "text-emerald-950 font-black scale-105"
                  : isDark
                  ? "text-emerald-200/70 hover:text-emerald-100 hover:scale-102 scale-100"
                  : "text-emerald-900/80 hover:text-emerald-950 font-bold hover:scale-102 scale-100"
              }`}
            >
              <Calendar className="w-5 h-5 transition-transform duration-200" />
              <span className="text-[10px] tracking-tight leading-tight mt-0.5">Tahsilat</span>
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-200 ${
                  activeTab === "receivables"
                    ? isDark
                      ? "bg-[#20C878] scale-100 opacity-100 shadow-sm shadow-emerald-400/50"
                      : "bg-emerald-900 scale-100 opacity-100 shadow-sm"
                    : "scale-0 opacity-0 bg-transparent"
                }`}
              />
            </button>

            {/* 5. Bahçe, Rapor & İşlemler Menüsü */}
            <button
              id="nav-tab-other"
              type="button"
              onClick={() => setActiveTab("other")}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1.5 transition-all duration-200 ease-out cursor-pointer select-none ${
                activeTab === "other"
                  ? isDark
                    ? "text-[#20C878] font-bold scale-105"
                    : "text-emerald-950 font-black scale-105"
                  : isDark
                  ? "text-emerald-200/70 hover:text-emerald-100 hover:scale-102 scale-100"
                  : "text-emerald-900/80 hover:text-emerald-950 font-bold hover:scale-102 scale-100"
              }`}
            >
              <MoreHorizontal className="w-5 h-5 transition-transform duration-200" />
              <span className="text-[10px] tracking-tight leading-tight mt-0.5">İşlemler</span>
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all duration-200 ${
                  activeTab === "other"
                    ? isDark
                      ? "bg-[#20C878] scale-100 opacity-100 shadow-sm shadow-emerald-400/50"
                      : "bg-emerald-900 scale-100 opacity-100 shadow-sm"
                    : "scale-0 opacity-0 bg-transparent"
                }`}
              />
            </button>
          </nav>
        </div>
      </main>

      {/* Harvest Add Modal (with OCR and Auto Deduction from Settings) */}
      <HarvestModal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        onSaveHarvest={handleSaveHarvest}
        gardens={gardens}
        factories={visibleFactories}
        settings={settings}
        isDark={isDark}
        farmingFocus={farmingFocus}
      />

      {/* Payment / Tahsilat Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedHarvestForPayment(undefined);
        }}
        harvests={harvests}
        payments={payments}
        onSavePayment={handleSavePayment}
        selectedHarvestId={selectedHarvestForPayment}
        isDark={isDark}
      />

      {/* Privacy and Data Wipe Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onWipeData={handleWipeAllData}
        isDark={isDark}
      />

      {/* Advanced Settings & Deductions (Borsa / Stopaj) Modal */}
      <AdvancedSettingsModal
        isOpen={isAdvancedSettingsOpen}
        onClose={() => setIsAdvancedSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(updatedSettings) => setSettings(updatedSettings)}
        onWipeData={handleWipeAllData}
        isDark={isDark}
        currentUser={currentUser}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Admin Control Center Modal (Yalnızca Admin yetkisine sahip kullanıcılar) */}
      {isAdminModalOpen && currentUser && currentUser.role === "admin" && (
        <AdminControlModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          isDark={isDark}
          currentUser={currentUser}
          users={users}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            if (newSettings.adBanners && newSettings.adBanners.length > 0) {
              try {
                localStorage.setItem("tarim_cepte_global_ad_banners", JSON.stringify(newSettings.adBanners));
                if (newSettings.adBanner) {
                  localStorage.setItem("tarim_cepte_global_ad_banner", JSON.stringify(newSettings.adBanner));
                }
              } catch {
                // ignore
              }
            }
          }}
          harvests={harvests}
          onDeleteHarvest={handleDeleteHarvest}
          payments={payments}
          onDeletePayment={handleDeletePayment}
          expenses={expenses}
          onDeleteExpense={handleDeleteExpense}
          jobs={jobs}
          onDeleteJob={handleDeleteJob}
          onUpdateJobStatus={handleUpdateJobStatus}
          crews={crews}
          onDeleteCrew={handleDeleteCrew}
          workers={workers}
          onDeleteWorker={handleDeleteWorker}
          applications={applications}
          onDeleteApplication={handleDeleteApplication}
          services={services}
          onDeleteService={handleDeleteService}
          factories={factories}
          onAddFactory={handleAddFactory}
          onUpdateFactory={handleUpdateFactory}
          onDeleteFactory={handleDeleteFactory}
          onWipeAllData={handleWipeAllData}
          adminMessages={adminMessages}
          onSendMessage={handleSendAdminMessage}
          onDeleteMessage={handleDeleteAdminMessage}
        />
      )}

      {/* Auth Modal (Giriş Yap, Üye Ol, Şifre Sıfırlama) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isDark={isDark}
        initialMode={authModalInitialMode}
        users={users}
        currentUser={currentUser}
        onLogin={handleLoginSuccess}
        onRegister={handleRegisterUser}
        onResetPassword={handleResetPassword}
      />

      {/* User Settings Modal (Kullanım Amacı: Çay / Fındık / Her İkisi, Şifre Değiştirme, Profil) */}
      {currentUser && (
        <UserSettingsModal
          isOpen={isUserSettingsModalOpen}
          onClose={() => setIsUserSettingsModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onWipeAccountAndData={handleWipeAccountAndData}
          onSwitchToLogin={() => {
            setIsUserSettingsModalOpen(false);
            setAuthModalInitialMode("login");
            setIsAuthModalOpen(true);
          }}
          onOpenAuthModal={(mode) => {
            setIsUserSettingsModalOpen(false);
            setAuthModalInitialMode(mode);
            setIsAuthModalOpen(true);
          }}
          isDark={isDark}
        />
      )}

      {/* Android Uygulama & Kurulum Yönetim Modalı */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        isDark={isDark}
      />

      {/* Native Android Snackbar / Toast Feedback Notification */}
      {androidToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0a2318] border border-emerald-500/60 text-emerald-100 text-xs font-semibold shadow-2xl shadow-black/80 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>{androidToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
