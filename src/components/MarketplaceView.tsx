import React, { useState, useMemo, useEffect } from "react";
import {
  UserRole,
  JobListing,
  CrewLeaderProfile,
  WorkerProfile,
  JobApplication,
  ServiceOffer,
  CrewMember,
  FarmingFocus,
  UserAccount,
} from "../types";
import {
  Users,
  Briefcase,
  UserCheck,
  Wrench,
  Calculator,
  Plus,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  UserPlus,
  Shield,
  Copy,
  Sliders,
  DollarSign,
  Filter,
  Check,
  Send,
  Trash2,
  Edit,
  Pencil,
  Lock,
} from "lucide-react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import {
  validateContent,
  validateFormFields,
  sanitizeText,
  isJobExpired,
  getJobRemainingDays,
} from "../utils/moderation";

interface MarketplaceViewProps {
  currentRole: UserRole;
  currentUser?: UserAccount | null;
  isDark: boolean;
  farmingFocus?: FarmingFocus;
  jobs: JobListing[];
  crews: CrewLeaderProfile[];
  workers: WorkerProfile[];
  applications: JobApplication[];
  services: ServiceOffer[];
  initialSubTab?: "jobs" | "crews" | "workers" | "services" | "applications" | "calculator" | "admin";
  onSaveJob: (job: Omit<JobListing, "id" | "createdAt" | "applicantsCount">) => void;
  onUpdateJob?: (job: JobListing) => void;
  onDeleteJob: (id: string) => void;
  onUpdateJobStatus: (id: string, status: JobListing["status"]) => void;
  onApplyToJob: (application: Omit<JobApplication, "id" | "createdAt">) => void;
  onUpdateApplicationStatus: (id: string, status: JobApplication["status"]) => void;
  onSaveService: (service: Omit<ServiceOffer, "id"> & { id?: string; userId?: string }) => void;
  onDeleteService: (id: string) => void;
  onUpdateWorkerStatus?: (workerId: string, status: "available" | "busy", wage: number) => void;
  onDeleteWorker?: (workerId: string) => void;
  onDeleteCrew?: (crewId: string) => void;
  onDeleteApplication?: (applicationId: string) => void;
  onAddCrewMember?: (crewId: string, member: Omit<CrewMember, "id">) => void;
  onDeleteCrewMember?: (crewId: string, memberId: string) => void;
  onSaveCrew?: (crew: Omit<CrewLeaderProfile, "id" | "rating" | "verified" | "members"> & { id?: string; userId?: string }) => void;
  onSaveWorker?: (worker: Omit<WorkerProfile, "id" | "rating" | "reviewCount"> & { id?: string; userId?: string }) => void;
  onOpenAuthModal?: () => void;
}

// Safe phone formatting helpers to avoid runtime undefined errors
const getCleanPhone = (phone?: string | null): string => {
  if (!phone) return "05320000000";
  return String(phone).replace(/\s+/g, "");
};

const getCleanWaPhone = (phone?: string | null): string => {
  if (!phone) return "5320000000";
  return String(phone).replace(/[^0-9]/g, "").replace(/^0/, "");
};

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  currentRole,
  currentUser,
  isDark,
  farmingFocus = "both",
  jobs = [],
  crews = [],
  workers = [],
  applications = [],
  services = [],
  initialSubTab = "jobs",
  onSaveJob,
  onUpdateJob,
  onDeleteJob,
  onUpdateJobStatus,
  onApplyToJob,
  onUpdateApplicationStatus,
  onSaveService,
  onDeleteService,
  onUpdateWorkerStatus,
  onDeleteWorker,
  onDeleteCrew,
  onDeleteApplication,
  onAddCrewMember,
  onDeleteCrewMember,
  onSaveCrew,
  onSaveWorker,
  onOpenAuthModal,
}) => {
  // Guaranteed safe array references against corrupted local storage
  const safeJobs = useMemo(() => (Array.isArray(jobs) ? jobs : []), [jobs]);
  const safeCrews = useMemo(() => (Array.isArray(crews) ? crews : []), [crews]);
  const safeWorkers = useMemo(() => (Array.isArray(workers) ? workers : []), [workers]);
  const safeApplications = useMemo(() => (Array.isArray(applications) ? applications : []), [applications]);
  const safeServices = useMemo(() => (Array.isArray(services) ? services : []), [services]);

  // Giriş Yapma Zorunluluğu Kontrolü
  const requireLogin = (actionName: string = "işlem yapmak"): boolean => {
    if (!currentUser && currentRole !== "admin") {
      if (onOpenAuthModal) {
        onOpenAuthModal();
      } else {
        alert(`Lütfen ${actionName} için önce kullanıcı girişi yapınız.`);
      }
      return false;
    }
    return true;
  };

  // Sub-tabs in Marketplace
  const [activeMarketTab, setActiveMarketTab] = useState<
    "jobs" | "crews" | "workers" | "services" | "applications" | "calculator" | "admin"
  >(initialSubTab || "jobs");

  useEffect(() => {
    if (initialSubTab) {
      setActiveMarketTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Filters for jobs
  const [filterCrop, setFilterCrop] = useState<"all" | "tea" | "hazelnut">("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // State for "Yeni İlan Aç" / "İlan Düzenle" BottomSheet/Modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    cropType: "tea" as "tea" | "hazelnut",
    locationCity: "Rize",
    locationDistrict: "Çayeli",
    gardenSizeDonum: 8,
    workerCount: 5,
    startDate: new Date().toISOString().split("T")[0],
    estimatedDays: 4,
    paymentType: "daily_wage" as "daily_wage" | "lump_sum" | "per_donum",
    wageAmount: 2200,
    hasAccommodation: true,
    hasFood: true,
    hasTransportation: true,
    notes: "",
    employerName: "Ahmet Kavalcı",
    employerPhone: "0532 411 28 53",
  });
  const [jobFormError, setJobFormError] = useState<string | null>(null);

  const handleOpenNewJobModal = () => {
    if (!requireLogin("hasat ilanı yayınlamak")) return;
    setEditingJobId(null);
    setNewJobForm({
      title: "",
      cropType: (farmingFocus === "hazelnut" ? "hazelnut" : "tea") as "tea" | "hazelnut",
      locationCity: currentUser?.city || "Rize",
      locationDistrict: currentUser?.district || "Çayeli",
      gardenSizeDonum: 8,
      workerCount: 5,
      startDate: new Date().toISOString().split("T")[0],
      estimatedDays: 4,
      paymentType: "daily_wage",
      wageAmount: 2200,
      hasAccommodation: true,
      hasFood: true,
      hasTransportation: true,
      notes: "",
      employerName: currentUser?.fullName || currentUser?.username || "Bahçe Sahibi",
      employerPhone: currentUser?.phone || "0532 411 28 53",
    });
    setJobFormError(null);
    setIsJobModalOpen(true);
  };

  const handleOpenEditJobModal = (job: JobListing) => {
    setEditingJobId(job.id);
    setNewJobForm({
      title: job.title,
      cropType: job.cropType,
      locationCity: job.locationCity,
      locationDistrict: job.locationDistrict,
      gardenSizeDonum: job.gardenSizeDonum || 8,
      workerCount: job.workerCount,
      startDate: job.startDate,
      estimatedDays: job.estimatedDays,
      paymentType: job.paymentType,
      wageAmount: job.wageAmount,
      hasAccommodation: job.hasAccommodation,
      hasFood: job.hasFood,
      hasTransportation: job.hasTransportation,
      notes: job.notes || "",
      employerName: job.employerName,
      employerPhone: job.employerPhone || job.phone || "0532 411 28 53",
    });
    setJobFormError(null);
    setIsJobModalOpen(true);
  };

  // State for Çavuş & Ekip Edit/New
  const [editingCrewId, setEditingCrewId] = useState<string | null>(null);

  const handleOpenNewCrewModal = () => {
    if (!requireLogin("ekip ilanı yayınlamak")) return;
    setEditingCrewId(null);
    setModalMemberName("");
    setModalMemberRole("Makasçı");
    setModalMemberPhone("");
    setCrewFormData({
      name: currentUser?.fullName || currentUser?.username || "Çavuş Mehmet Yılmaz",
      phone: currentUser?.phone || "0535 882 14 00",
      location: currentUser?.city && currentUser?.district ? `${currentUser.city} / ${currentUser.district}` : "Rize / Çayeli",
      crewSize: 10,
      experienceYears: 10,
      expectedDailyWagePerPerson: 2200,
      specialties: ["Makas Ustası", "Yamaç Arazi Hasadı", "Motorlu Tırpan"],
      availableDates: "Müsait - Çay 1. ve 2. Sürgün / Fındık",
      availability: "Müsait - Çay 1. ve 2. Sürgün / Fındık",
      notes: "Deneyimli ekibimizle hasatta hizmet vermekteyiz.",
      members: [],
    });
    setIsCrewModalOpen(true);
  };

  const handleOpenEditCrewModal = (crew: CrewLeaderProfile) => {
    setEditingCrewId(crew.id);
    setModalMemberName("");
    setModalMemberRole("Makasçı");
    setModalMemberPhone("");
    setCrewFormData({
      name: crew.name,
      phone: crew.phone,
      location: crew.location,
      crewSize: crew.crewSize || 10,
      experienceYears: crew.experienceYears || 5,
      expectedDailyWagePerPerson: crew.expectedDailyWagePerPerson || 2200,
      specialties: crew.specialties || ["Makas Ustası"],
      availableDates: crew.availableDates || "Müsait",
      availability: crew.availableDates || "Müsait",
      notes: "",
      members: crew.members || [],
    });
    setIsCrewModalOpen(true);
  };

  // State for Bireysel İşçi Edit/New
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);

  const handleOpenNewWorkerModal = () => {
    if (!requireLogin("işçi ilanı yayınlamak")) return;
    setEditingWorkerId(null);
    setWorkerFormData({
      name: currentUser?.fullName || currentUser?.username || "Murat Demir",
      phone: currentUser?.phone || "0531 200 45 77",
      location: currentUser?.city && currentUser?.district ? `${currentUser.city} / ${currentUser.district}` : "Rize / Merkez",
      skills: ["Usta Çay Makasçısı", "Motorlu Tırpan", "Budama"],
      experienceYears: 7,
      expectedDailyWage: 2300,
      availability: "available",
      bio: "Karadeniz hasat ve budama işlerinde deneyimliyim.",
      preferredCrops: ["Çay", "Fındık"],
    });
    setIsWorkerModalOpen(true);
  };

  const handleOpenEditWorkerModal = (worker: WorkerProfile) => {
    setEditingWorkerId(worker.id);
    setWorkerFormData({
      name: worker.name,
      phone: worker.phone,
      location: worker.location,
      skills: worker.skills || ["Usta Çay Makasçısı"],
      experienceYears: worker.experienceYears || 5,
      expectedDailyWage: worker.expectedDailyWage || 2200,
      availability: worker.availabilityStatus || "available",
      bio: worker.description || "",
      preferredCrops: ["Çay", "Fındık"],
    });
    setIsWorkerModalOpen(true);
  };

  // State for Zirai Hizmet Edit/New
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const handleOpenNewServiceModal = () => {
    if (!requireLogin("hizmet ilanı yayınlamak")) return;
    setEditingServiceId(null);
    setNewServiceForm({
      title: "",
      category: "pruning",
      providerName: currentUser?.fullName || currentUser?.username || "Hizmet Sağlayıcı",
      providerPhone: currentUser?.phone || "0538 000 00 00",
      city: currentUser?.city || "Rize",
      pricingUnit: "donum",
      priceAmount: 1500,
      description: "",
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditServiceModal = (srv: ServiceOffer) => {
    setEditingServiceId(srv.id);
    setNewServiceForm({
      title: srv.title,
      category: srv.category,
      providerName: srv.providerName,
      providerPhone: srv.providerPhone,
      city: srv.city,
      pricingUnit: srv.pricingUnit,
      priceAmount: srv.priceAmount,
      description: srv.description || "",
    });
    setIsServiceModalOpen(true);
  };

  // State for Job Application Modal
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobListing | null>(null);
  const [applyForm, setApplyForm] = useState({
    applicantName: "",
    applicantPhone: "",
    teamSize: 1,
    demandedWage: 2200,
    offerNote: "",
  });
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Confirmation Delete Modal State for Admin Deletions
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
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

  // State for New Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    title: "",
    category: "pruning" as "pruning" | "clearing" | "spraying" | "soil_analysis",
    providerName: "",
    providerPhone: "",
    city: "Rize",
    pricingUnit: "donum" as "donum" | "ocak" | "daily",
    priceAmount: 1500,
    description: "",
  });

  // State for Çavuş & Ekip Ad Modal (For Crew Leaders)
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [crewForm, setCrewForm] = useState({
    name: "Çavuş Mehmet Yılmaz",
    phone: "0535 882 14 00",
    city: "Rize",
    district: "Pazar",
    crewSize: 10,
    experienceYears: 12,
    expectedDailyWagePerPerson: 2200,
    specialties: ["Usta Çay Makasçısı", "Motorlu Tırpancı", "Çuvalcı (Sırt/Yamaç)", "Teleferik Operatörü"],
    availableDates: "15 Eylül - 15 Ekim Sezonu",
  });

  // State for Bireysel İşçi Ad Modal (For Individual Workers)
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    name: "Murat Demir",
    phone: "0531 200 45 77",
    city: "Rize",
    location: "Rize / Merkez",
    experienceYears: 8,
    expectedDailyWage: 2200,
    skills: ["Usta Çay Makasçısı", "Motorlu Tırpan", "Çuval Taşıma"],
    availability: "Hafta içi ve hafta sonu tam zamanlı",
    availabilityStatus: "available" as "available" | "busy",
    description: "Günde 400-450 kg çay biçerim. Yamaç ve teleferik arazisinde 8 yıllık tecrübem var.",
    references: "Kavalcı Çay Bahçeleri, Çayeli Ziraat Odası",
  });

  // WhatsApp Invite & Member Join Flow State
  const [inviteWorkerPhone, setInviteWorkerPhone] = useState("");
  const [pendingInvite, setPendingInvite] = useState<{
    crewId: string;
    crewName: string;
    dailyWage: number;
  } | null>(null);
  const [inviteAcceptForm, setInviteAcceptForm] = useState<{
    name: string;
    phone: string;
    roleTitle: CrewMember["roleTitle"];
    dailyWage: number;
  }>({
    name: "",
    phone: "",
    roleTitle: "Makasçı",
    dailyWage: 2200,
  });
  const [inviteJoinedSuccess, setInviteJoinedSuccess] = useState<string | null>(null);

  // Check URL query parameters on load for WhatsApp invite link (?crew_invite=...&crew_name=...&daily_wage=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const inviteId = params.get("crew_invite");
      const inviteName = params.get("crew_name");
      const wageParam = params.get("daily_wage");
      if (inviteId) {
        const decodedName = inviteName ? decodeURIComponent(inviteName) : "Çavuş Ekibi";
        const wage = wageParam ? Number(wageParam) : 2200;
        setPendingInvite({
          crewId: inviteId,
          crewName: decodedName,
          dailyWage: wage,
        });
        setInviteAcceptForm({
          name: currentRole === "worker" ? "Murat Demir" : "",
          phone: currentRole === "worker" ? "0531 200 45 77" : "",
          roleTitle: "Makasçı",
          dailyWage: wage,
        });
        setActiveMarketTab("crews");
      }
    } catch (e) {
      console.error("Invite param parsing error:", e);
    }
  }, [currentRole]);

  // Active crew associated with crew leader
  const myCrew = useMemo(() => {
    return safeCrews.find((c) => c.id === "c-1") || safeCrews[0] || {
      id: "c-1",
      name: "Çavuş Mehmet Yılmaz",
      location: "Rize / Pazar",
      crewSize: 10,
      expectedDailyWagePerPerson: 2200,
      phone: "0535 882 14 00",
      members: [],
    };
  }, [safeCrews]);

  // Generate dynamic invite link for WhatsApp
  const generateInviteLink = (crewId: string, crewName: string, wage: number) => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?crew_invite=${crewId}&crew_name=${encodeURIComponent(crewName)}&daily_wage=${wage}`;
  };

  // Calculator State
  const [calcCrop, setCalcCrop] = useState<"tea" | "hazelnut">("tea");
  const [calcDonum, setCalcDonum] = useState<number>(8.0);
  const [calcDays, setCalcDays] = useState<number>(4);
  const [calcDailyWage, setCalcDailyWage] = useState<number>(2200);
  const [calcIncludeFood, setCalcIncludeFood] = useState<boolean>(true);
  const [calcIncludeTransport, setCalcIncludeTransport] = useState<boolean>(true);

  // Crew Management State (Kayıtlı Kadro & Karşılıklı Davet Sistemi)
  const [crewTerminalTab, setCrewTerminalTab] = useState<"manage" | "accept">("manage");
  const [selectedCrewToManageId, setSelectedCrewToManageId] = useState<string>("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<CrewMember["roleTitle"]>("Makasçı");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Modal içindeki kayıtlı kadro üyesi ekleme alanları
  const [modalMemberName, setModalMemberName] = useState("");
  const [modalMemberRole, setModalMemberRole] = useState<CrewMember["roleTitle"]>("Makasçı");
  const [modalMemberPhone, setModalMemberPhone] = useState("");

  // Crew Form State (for publishing / editing crew profile)
  const [crewFormData, setCrewFormData] = useState<{
    name: string;
    phone: string;
    location: string;
    crewSize: number;
    experienceYears: number;
    expectedDailyWagePerPerson: number;
    specialties: string[];
    availableDates: string;
    availability: string;
    notes: string;
    members: CrewMember[];
  }>({
    name: "Çavuş Mehmet Yılmaz",
    phone: "0535 882 14 00",
    location: "Rize / Çayeli",
    crewSize: 10,
    experienceYears: 12,
    expectedDailyWagePerPerson: 2200,
    specialties: ["Makas Ustası", "Yamaç Arazi Hasadı", "Motorlu Tırpan"],
    availableDates: "Müsait - Çay 1. ve 2. Sürgün / Fındık",
    availability: "Müsait - Çay 1. ve 2. Sürgün / Fındık",
    notes: "10 kişilik deneyimli ekibimizle çay ve fındık hasadında hizmet vermekteyiz.",
    members: [],
  });

  // Worker Form State (for publishing / editing worker profile)
  const [workerFormData, setWorkerFormData] = useState({
    name: "Murat Demir",
    phone: "0531 200 45 77",
    location: "Trabzon / Of",
    skills: ["Usta Çay Makasçısı", "Motorlu Tırpan", "Budama"],
    experienceYears: 7,
    expectedDailyWage: 2300,
    availability: "available" as "available" | "busy",
    bio: "7 yıldır Karadeniz çay ve fındık hasadında usta makasçı ve motorlu tırpan operatörü olarak çalışıyorum.",
    preferredCrops: ["Çay", "Fındık"],
  });

  // Worker Profile State (For Worker role)
  const [myAvailability, setMyAvailability] = useState<"available" | "busy">("available");
  const [myExpectedWage, setMyExpectedWage] = useState<number>(2200);

  // Admin Policy State
  const [minWagePolicy, setMinWagePolicy] = useState<number>(2000);

  // Oturum açan kullanıcının bilgilerini formlara otomatik doldur
  useEffect(() => {
    if (currentUser) {
      const name = currentUser.fullName?.trim() || currentUser.username || "";
      const phone = currentUser.phone?.trim() || "";
      if (name) {
        setCrewFormData((prev) => ({ ...prev, name, phone: phone || prev.phone }));
        setCrewForm((prev) => ({ ...prev, name, phone: phone || prev.phone }));
        setWorkerFormData((prev) => ({ ...prev, name, phone: phone || prev.phone }));
        setWorkerForm((prev) => ({ ...prev, name, phone: phone || prev.phone }));
        setNewJobForm((prev) => ({ ...prev, employerName: name, employerPhone: phone || prev.employerPhone }));
        setNewServiceForm((prev) => ({ ...prev, providerName: name, providerPhone: phone || prev.providerPhone }));
        setApplyForm((prev) => ({ ...prev, applicantName: name, applicantPhone: phone || prev.applicantPhone }));
      }
    }
  }, [currentUser]);

  // =========================================================================
  // CALCULATOR LOGIC (Exact formulas from user instructions)
  // Çay: 0.4 dönüm/gün veya 350-450 kg. Gerekli İşçi = ceil(Dönüm / (Hedef Gün * 0.4))
  // Fındık: 0.35 dönüm/gün veya 50-70 kg. Gerekli İşçi = ceil(Dönüm / (Hedef Gün * 0.35))
  // Adam-Gün = Gerekli İşçi * Hedef Gün
  // Yevmiye Gideri = Adam-Gün * Günlük Yevmiye
  // Yemek = Adam-Gün * 250 TL
  // Ulaşım = Hedef Gün * 1200 TL
  // =========================================================================
  const calcResults = useMemo(() => {
    const ratePerDay = calcCrop === "tea" ? 0.4 : 0.35;
    const requiredWorkers = Math.max(1, Math.ceil(calcDonum / (calcDays * ratePerDay)));
    const totalManDays = requiredWorkers * calcDays;
    const laborCost = totalManDays * calcDailyWage;
    const foodCost = calcIncludeFood ? totalManDays * 250 : 0;
    const transportCost = calcIncludeTransport ? calcDays * 1200 : 0;
    const totalBudget = laborCost + foodCost + transportCost;

    return {
      requiredWorkers,
      totalManDays,
      laborCost,
      foodCost,
      transportCost,
      totalBudget,
    };
  }, [calcCrop, calcDonum, calcDays, calcDailyWage, calcIncludeFood, calcIncludeTransport]);

  // Handle transfer from Calculator to New Job Form
  const handleApplyCalcToJob = () => {
    setNewJobForm((prev) => ({
      ...prev,
      cropType: calcCrop,
      gardenSizeDonum: calcDonum,
      estimatedDays: calcDays,
      workerCount: calcResults.requiredWorkers,
      wageAmount: calcDailyWage,
      hasFood: calcIncludeFood,
      hasTransportation: calcIncludeTransport,
      title: `${calcCrop === "tea" ? "Çay" : "Fındık"} Hasadı İçin ${calcResults.requiredWorkers} Kişilik Ekip`,
    }));
    setIsJobModalOpen(true);
  };

  // =========================================================================
  // ZERO VAGUENESS VERIFICATION (Mandatory 6 Fields & No "görüşülür")
  // =========================================================================
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    setJobFormError(null);

    // 1. Worker count check
    if (!newJobForm.workerCount || newJobForm.workerCount <= 0) {
      setJobFormError("İhtiyaç duyulan tam işçi sayısı pozitif bir tam sayı olmalıdır.");
      return;
    }

    // 2. Start date & estimated days check
    if (!newJobForm.startDate || !newJobForm.estimatedDays || newJobForm.estimatedDays <= 0) {
      setJobFormError("Başlangıç tarihi ve tahmini çalışma süresi (gün) eksiksiz girilmelidir.");
      return;
    }

    // 3. Payment type & wage amount check (NO "görüşülür")
    if (!newJobForm.wageAmount || newJobForm.wageAmount <= 0) {
      setJobFormError("Ücret miktarı kesin TL tutarında belirtilmelidir. 'Ücret görüşülür' veya 'pazarlık yapılır' kesinlikle yasaktır!");
      return;
    }

    // 4. Sansür, Küfür, Hakaret, Argo, Dolandırıcılık ve Topluluk Kuralları Denetimi
    const modResult = validateFormFields({
      "İlan Başlığı": newJobForm.title,
      "İlan Açıklaması / Notlar": newJobForm.notes,
      "İşveren Adı": newJobForm.employerName,
      "Şehir": newJobForm.locationCity,
      "İlçe": newJobForm.locationDistrict,
    });
    if (!modResult.isValid) {
      setJobFormError(modResult.errorMessage || "İlan içeriğinde topluluk kurallarına aykırı ifade tespit edildi.");
      return;
    }

    // Check employer name & phone
    if (!newJobForm.employerName.trim() || !newJobForm.employerPhone.trim()) {
      setJobFormError("İşveren adı ve iletişim telefon numarası zorunludur.");
      return;
    }

    // Submit valid job (Düzenleme veya Yeni İlan)
    if (editingJobId && onUpdateJob) {
      const existing = safeJobs.find((j) => j.id === editingJobId);
      if (existing) {
        onUpdateJob({
          ...existing,
          ...newJobForm,
        });
      }
    } else {
      onSaveJob({
        ...newJobForm,
        employerId: currentUser?.id,
        employerName: currentUser?.fullName || currentUser?.username || newJobForm.employerName,
        employerPhone: currentUser?.phone || newJobForm.employerPhone,
        status: "active",
      });
    }

    setIsJobModalOpen(false);
    setEditingJobId(null);
  };

  // Check if a specific applicant phone or name was rejected for this job
  const isApplicantRejectedForJob = (jobId: string, phone?: string, name?: string) => {
    const cleanP = (phone || "").replace(/\D/g, "");
    const trimN = (name || "").trim().toLowerCase();

    return safeApplications.some((app) => {
      if (app.jobId !== jobId || app.status !== "rejected") return false;
      const appPhone = (app.applicantPhone || "").replace(/\D/g, "");
      const appName = (app.applicantName || "").trim().toLowerCase();

      const phoneMatch =
        cleanP.length >= 10 &&
        appPhone.length >= 10 &&
        (cleanP.endsWith(appPhone.slice(-10)) || appPhone.endsWith(cleanP.slice(-10)));
      const nameMatch = trimN.length > 2 && appName === trimN;

      return phoneMatch || nameMatch;
    });
  };

  // Check if active user profile has a rejected application for this job
  const hasMyRejectedApplication = (jobId: string) => {
    const defaultPhone =
      currentRole === "crew_leader"
        ? "05358821400"
        : currentRole === "worker"
        ? "05312004577"
        : "";
    const defaultName =
      currentRole === "crew_leader"
        ? "Çavuş Mehmet Yılmaz"
        : currentRole === "worker"
        ? "Murat Demir"
        : "";

    return isApplicantRejectedForJob(jobId, defaultPhone, defaultName);
  };

  // Handle Application Submit
  const handleSendApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    setApplyError(null);

    if (!applyForm.applicantName.trim() || !applyForm.applicantPhone.trim()) {
      setApplyError("Lütfen adınızı ve telefon numaranızı girin.");
      return;
    }
    if (!applyForm.demandedWage || applyForm.demandedWage <= 0) {
      setApplyError("Lütfen kesin yevmiye / ücret tutarınızı belirtin.");
      return;
    }

    // Topluluk kuralları ve sansür denetimi
    const modResult = validateFormFields({
      "Başvuran Adı": applyForm.applicantName,
      "Başvuru / Teklif Notu": applyForm.offerNote,
    });
    if (!modResult.isValid) {
      setApplyError(modResult.errorMessage || "Başvuru içeriğinde topluluk kurallarına aykırı ifade tespit edildi.");
      return;
    }

    // STRICT REJECTION RULE: If this applicant was previously rejected for this job, forbid applying again!
    if (isApplicantRejectedForJob(selectedJobForApply.id, applyForm.applicantPhone, applyForm.applicantName)) {
      setApplyError(
        "Bu ilana daha önce yapmış olduğunuz başvuru işveren tarafından reddedilmiştir. Sistem politikalarımız gereği reddedilen bir ilana tekrar başvuru yapılamaz."
      );
      return;
    }

    onApplyToJob({
      jobId: selectedJobForApply.id,
      jobTitle: selectedJobForApply.title,
      applicantName: applyForm.applicantName,
      applicantPhone: applyForm.applicantPhone,
      applicantRole: currentRole === "crew_leader" ? "crew_leader" : "worker",
      teamSize: currentRole === "crew_leader" ? applyForm.teamSize : 1,
      demandedWage: applyForm.demandedWage,
      offerNote: applyForm.offerNote,
      status: "pending",
    });

    setApplySuccessMsg("Başvurunuz doğrudan işverene iletildi! İşveren sizinle doğrudan telefon veya WhatsApp üzerinden iletişime geçecektir.");
    setTimeout(() => {
      setSelectedJobForApply(null);
      setApplySuccessMsg(null);
      setApplyError(null);
    }, 2500);
  };

  // Filtered jobs with 7-day expiration and strict passive privacy
  const filteredJobs = useMemo(() => {
    return safeJobs.filter((job) => {
      if (!job) return false;
      const effectiveCrop = farmingFocus === "tea" ? "tea" : farmingFocus === "hazelnut" ? "hazelnut" : filterCrop;
      if (effectiveCrop !== "all" && job.cropType !== effectiveCrop) return false;
      if (filterCity !== "all" && job.locationCity !== filterCity) return false;
      if (filterPayment !== "all" && job.paymentType !== filterPayment) return false;

      const isExpired = isJobExpired(job);
      const isJobPassive = isExpired || job.status === "inactive" || job.status === "filled" || job.status === "completed";

      const isJobOwner =
        Boolean(currentUser && job.employerId && job.employerId === currentUser.id) ||
        Boolean(currentUser && !job.employerId && (job.employerName === currentUser.fullName || job.employerName === currentUser.username)) ||
        Boolean(currentUser?.phone && job.employerPhone && currentUser.phone.replace(/\D/g, "") === job.employerPhone.replace(/\D/g, ""));
      const canManageJob = isJobOwner || currentRole === "admin" || currentUser?.role === "admin";

      // KURAL: Pasif ilanlar diğer kullanıcılar tarafından ASLA görünmez!
      // Yalnızca ilan sahibi veya sistem yöneticisi (admin) görebilir.
      if (isJobPassive && !canManageJob) {
        return false;
      }

      if (filterStatus === "active" && isJobPassive) return false;
      if (filterStatus === "inactive" && !isJobPassive) return false;

      return true;
    });
  }, [safeJobs, filterCrop, filterCity, filterPayment, filterStatus, farmingFocus, currentUser, currentRole]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} panoya kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          BAŞLIK & KOMİSYONSUZ EŞLEŞME ROZETİ
         ========================================================================= */}
      <div className="border-b border-emerald-900/30 pb-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className={`text-base sm:text-lg font-extrabold flex items-center gap-2 truncate whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                <Briefcase className={`w-5 h-5 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                <span className="truncate">Karadeniz Tarım Pazar Yeri</span>
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
                %0 Komisyon
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950 font-medium"}`}>
              İşverenler, Çavuşlar, Bireysel İşçiler ve Zirai Hizmet Sağlayıcıları tek noktada buluşuyor.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROL ÖZETİ & DİNAMİK BİLGİ KARTI
         ========================================================================= */}
      <div
        className={`px-3 py-2.5 rounded-2xl border flex items-center justify-between gap-2.5 text-xs min-w-0 ${
          isDark ? "bg-[#0b1c15] border-emerald-900/80" : "bg-white border-emerald-300 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-900"}`}>
            {currentRole === "employer" && <Briefcase className="w-4 h-4" />}
            {currentRole === "crew_leader" && <Users className="w-4 h-4" />}
            {currentRole === "worker" && <UserCheck className="w-4 h-4" />}
            {currentRole === "service_provider" && <Wrench className="w-4 h-4" />}
            {currentRole === "admin" && <Shield className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`font-black text-xs sm:text-sm truncate whitespace-nowrap ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
              Aktif Rolünüz:{" "}
              {currentRole === "employer"
                ? "İşveren (Bahçe Sahibi)"
                : currentRole === "crew_leader"
                ? "Ekip Lideri (Çavuş)"
                : currentRole === "worker"
                ? "Bireysel İşçi"
                : currentRole === "service_provider"
                ? "Zirai Hizmet Sağlayıcı"
                : "Yönetici (Admin)"}
            </div>
            <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${isDark ? "opacity-75 text-emerald-200/80" : "text-emerald-950/90 font-medium"}`}>
              {currentRole === "employer" && "İlan açabilir, iş gücü bütçesi hesaplayabilir, başvuruları onaylayabilirsiniz."}
              {currentRole === "crew_leader" && "Ekip kadronuzu yönetebilir, ilanlara toplu blok halinde başvurabilirsiniz."}
              {currentRole === "worker" && "Müsaitlik durumunuzu belirleyebilir, ilanlara yevmiyenizle başvurabilirsiniz."}
              {currentRole === "service_provider" && "Budama, tırpan ve toprak analizi hizmetlerinizi net fiyatla yayınlayabilirsiniz."}
              {currentRole === "admin" && "Tüm ilan ve başvuruları denetleyebilir, taban yevmiye kuralı koyabilirsiniz."}
            </p>
          </div>
        </div>

        <span className={`text-[10px] text-right hidden sm:inline shrink-0 whitespace-nowrap font-bold ${isDark ? "opacity-60 text-emerald-300" : "text-emerald-950"}`}>
          Rol değiştirebilirsiniz
        </span>
      </div>

      {/* =========================================================================
          PAZAR YERİ SEKMELERİ (Tek satırda 5 buton: Hasat & İlanlar, Çavuşlar, İşçiler, Hizmetler, Başvurular)
         ========================================================================= */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-xs font-bold w-full">
        {/* 1. Hasat & İlanlar */}
        <button
          id="market-tab-jobs"
          type="button"
          onClick={() => setActiveMarketTab("jobs")}
          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer text-center ${
            activeMarketTab === "jobs"
              ? "bg-emerald-700 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/50"
              : isDark
              ? "bg-[#11241c] border-emerald-900/80 text-emerald-300 hover:bg-[#162e24]"
              : "bg-white border-emerald-300 text-emerald-950 font-black hover:bg-emerald-50 shadow-2xs"
          }`}
        >
          <Briefcase className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeMarketTab === "jobs" ? "text-white" : isDark ? "text-emerald-400" : "text-emerald-900"}`} />
          <span className="text-[10px] sm:text-xs leading-tight font-bold">Hasat & İlanlar</span>
          <span className="text-[9px] sm:text-[11px] font-black opacity-90">({safeJobs.length})</span>
        </button>

        {/* 2. Çavuşlar & Ekipler */}
        <button
          id="market-tab-crews"
          type="button"
          onClick={() => setActiveMarketTab("crews")}
          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer text-center ${
            activeMarketTab === "crews"
              ? "bg-emerald-700 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/50"
              : isDark
              ? "bg-[#11241c] border-emerald-900/80 text-emerald-300 hover:bg-[#162e24]"
              : "bg-white border-emerald-300 text-emerald-950 font-black hover:bg-emerald-50 shadow-2xs"
          }`}
        >
          <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeMarketTab === "crews" ? "text-white" : isDark ? "text-emerald-400" : "text-emerald-900"}`} />
          <span className="text-[10px] sm:text-xs leading-tight font-bold">Çavuşlar & Ekipler</span>
          <span className="text-[9px] sm:text-[11px] font-black opacity-90">({safeCrews.length})</span>
        </button>

        {/* 3. Bireysel İşçiler */}
        <button
          id="market-tab-workers"
          type="button"
          onClick={() => setActiveMarketTab("workers")}
          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer text-center ${
            activeMarketTab === "workers"
              ? "bg-emerald-700 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/50"
              : isDark
              ? "bg-[#11241c] border-emerald-900/80 text-emerald-300 hover:bg-[#162e24]"
              : "bg-white border-emerald-300 text-emerald-950 font-black hover:bg-emerald-50 shadow-2xs"
          }`}
        >
          <UserCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeMarketTab === "workers" ? "text-white" : isDark ? "text-emerald-400" : "text-emerald-900"}`} />
          <span className="text-[10px] sm:text-xs leading-tight font-bold">Bireysel İşçiler</span>
          <span className="text-[9px] sm:text-[11px] font-black opacity-90">({safeWorkers.length})</span>
        </button>

        {/* 4. Zirai Hizmetler */}
        <button
          id="market-tab-services"
          type="button"
          onClick={() => setActiveMarketTab("services")}
          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer text-center ${
            activeMarketTab === "services"
              ? "bg-emerald-700 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/50"
              : isDark
              ? "bg-[#11241c] border-emerald-900/80 text-emerald-300 hover:bg-[#162e24]"
              : "bg-white border-emerald-300 text-emerald-950 font-black hover:bg-emerald-50 shadow-2xs"
          }`}
        >
          <Wrench className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeMarketTab === "services" ? "text-white" : isDark ? "text-emerald-400" : "text-emerald-900"}`} />
          <span className="text-[10px] sm:text-xs leading-tight font-bold">Zirai Hizmetler</span>
          <span className="text-[9px] sm:text-[11px] font-black opacity-90">({safeServices.length})</span>
        </button>

        {/* 5. Başvurular */}
        <button
          id="market-tab-applications"
          type="button"
          onClick={() => setActiveMarketTab("applications")}
          className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer text-center ${
            activeMarketTab === "applications"
              ? "bg-emerald-700 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/50"
              : isDark
              ? "bg-[#11241c] border-emerald-900/80 text-emerald-300 hover:bg-[#162e24]"
              : "bg-white border-emerald-300 text-emerald-950 font-black hover:bg-emerald-50 shadow-2xs"
          }`}
        >
          <Send className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeMarketTab === "applications" ? "text-white" : isDark ? "text-emerald-400" : "text-emerald-900"}`} />
          <span className="text-[10px] sm:text-xs leading-tight font-bold">Başvurular</span>
          <span className="text-[9px] sm:text-[11px] font-black opacity-90">({safeApplications.length})</span>
        </button>
      </div>

      {currentRole === "admin" && (
        <button
          id="market-tab-admin"
          type="button"
          onClick={() => setActiveMarketTab("admin")}
          className={`w-full p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs font-bold ${
            activeMarketTab === "admin"
              ? "bg-amber-600 text-white border-amber-500 shadow-xs"
              : isDark
              ? "bg-[#271d11] border-amber-900/80 text-amber-300 hover:bg-[#332516]"
              : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Denetim Paneli</span>
        </button>
      )}

      {copyFeedback && (
        <div className={`p-2 rounded-xl text-xs font-bold text-center border animate-in fade-in ${isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-emerald-100 text-emerald-950 border-emerald-300"}`}>
          {copyFeedback}
        </div>
      )}

      {/* =========================================================================
          TAB 1: İLANLAR (JOB POSTINGS)
         ========================================================================= */}
      {activeMarketTab === "jobs" && (
        <div className="space-y-3.5">
          {/* Hasat & İlanlar Bölümü Rol Tabanlı İlan Açma Alanı */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 min-w-0 ${
              isDark ? "bg-[#0b1c15] border-emerald-800" : "bg-emerald-50/90 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-800"}`}>
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-black text-xs sm:text-sm truncate whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  {currentRole === "employer" ? "🌱 Bahçe Sahibi Hasat İlan Alanı" : "Hasat & İş İlanları"}
                </h4>
                <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950/90 font-medium"}`}>
                  {currentRole === "employer"
                    ? "İşçi sayısı, net yevmiye/götürü tutar, servis, yemek ve konaklama şartlarını girerek kendi ilanınızı yayınlayın."
                    : "Bahçe sahipleri tarafından oluşturulan güncel çay ve fındık hasat iş ilanları."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenNewJobModal}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{currentRole === "employer" ? "Hasat İlanı Yayınla" : "Yeni İlan Aç"}</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div
            className={`p-3 rounded-2xl border space-y-2.5 ${
              isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-white border-emerald-300 shadow-2xs"
            }`}
          >
            <div className={`flex items-center justify-between text-xs font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>İlanları Filtrele</span>
              </span>
              <span className={`text-[11px] font-bold ${isDark ? "opacity-70 text-emerald-300" : "text-emerald-900"}`}>{filteredJobs.length} ilan bulundu</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Ürün Türü</label>
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value as any)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">Tüm Ürünler (Çay & Fındık)</option>
                  <option value="tea">Çay İlanları</option>
                  <option value="hazelnut">Fındık İlanları</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Şehir</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">Tüm Şehirler</option>
                  <option value="Rize">Rize</option>
                  <option value="Trabzon">Trabzon</option>
                  <option value="Artvin">Artvin</option>
                  <option value="Giresun">Giresun</option>
                  <option value="Ordu">Ordu</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Ödeme Türü</label>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">Tüm Ödeme Türleri</option>
                  <option value="daily_wage">Günlük Yevmiye</option>
                  <option value="lump_sum">Götürü Tutar</option>
                  <option value="per_donum">Dönüm Başı</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>İlan Durumu</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs font-bold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">Tüm İlanlar</option>
                  <option value="active">🟢 Açık / Aktif İlanlar</option>
                  <option value="inactive">🔒 Pasif / Eşleşen İlanlar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Cards */}
          {filteredJobs.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border border-dashed text-xs font-bold ${isDark ? "border-emerald-800/40 text-emerald-300/80" : "border-emerald-300 text-emerald-950 bg-white"}`}>
              Seçilen kriterlere uygun açık iş ilanı bulunamadı.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const isExpired = isJobExpired(job);
                const isJobInactive = isExpired || job.status === "filled" || job.status === "inactive" || job.status === "completed";
                const remainingDays = getJobRemainingDays(job);
                const isUserRejected = hasMyRejectedApplication(job.id);
                const isJobOwner =
                  Boolean(currentUser && job.employerId && job.employerId === currentUser.id) ||
                  Boolean(currentUser && !job.employerId && (job.employerName === currentUser.fullName || job.employerName === currentUser.username)) ||
                  Boolean(currentUser?.phone && job.employerPhone && currentUser.phone.replace(/\D/g, "") === job.employerPhone.replace(/\D/g, ""));
                const canManageJob = isJobOwner || currentRole === "admin" || currentUser?.role === "admin";

                return (
                <div
                  key={job.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUserRejected
                      ? isDark
                        ? "bg-[#140b0e]/90 border-red-900/50 text-gray-300"
                        : "bg-red-50/50 border-red-200 text-gray-800"
                      : isJobInactive
                      ? isDark
                        ? "bg-[#08140e]/90 border-amber-900/40 text-gray-300"
                        : "bg-gray-50 border-gray-300 text-gray-800"
                      : isDark
                      ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-100 hover:border-emerald-700/60"
                      : "bg-white border-emerald-200/90 text-gray-900 shadow-xs hover:border-emerald-400"
                  }`}
                >
                  {/* Header Row: Title & Crop Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 border-b border-emerald-900/20 pb-2.5 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                            job.cropType === "tea"
                              ? isDark
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-emerald-100 text-emerald-950 border border-emerald-300 font-black"
                              : isDark
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-amber-100 text-amber-950 border border-amber-300 font-black"
                          }`}
                        >
                          {job.cropType === "tea" ? "🌱 Çay İlanı" : "🌰 Fındık İlanı"}
                        </span>
                        <span className={`text-xs font-bold truncate max-w-[160px] sm:max-w-none ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>
                          {job.locationCity} / {job.locationDistrict}
                        </span>

                        {isJobOwner && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-purple-100 text-purple-950 border border-purple-300"}`}>
                            <span>👤 Sizin İlanınız</span>
                          </span>
                        )}

                        {isUserRejected ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-red-100 text-red-950 border border-red-300"}`}>
                            <XCircle className="w-3 h-3 text-red-500" />
                            <span>Başvuru Reddedildi</span>
                          </span>
                        ) : isJobInactive ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-amber-100 text-amber-950 border border-amber-300"}`}>
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>{isExpired ? "Pasif (7 Günlük Süre Doldu)" : "Pasif (Gizli)"}</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border border-emerald-300"}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Açık / Aktif</span>
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${isDark ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-950 border border-blue-300 font-bold"}`} title="İlanlar 7 gün sonra sistem tarafından otomatik pasife alınır">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>7 Günlük Süre: {remainingDays} gün kaldı</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className={`font-black text-sm sm:text-base mt-1.5 truncate whitespace-nowrap ${isJobInactive ? "text-gray-400 line-through opacity-85" : isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                        {job.title}
                      </h3>
                    </div>

                    {/* Net Wage Tag (Strict rule: bold and clear) */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded-xl bg-emerald-950/30 sm:bg-transparent border border-emerald-900/30 sm:border-0 shrink-0">
                      <div className={`text-[10px] uppercase font-black ${isDark ? "opacity-75 text-emerald-300" : "text-emerald-950"}`}>
                        {job.paymentType === "daily_wage"
                          ? "Günlük Yevmiye"
                          : job.paymentType === "lump_sum"
                          ? "Toplam Götürü"
                          : "Dönüm Başı"}
                      </div>
                      <div className="flex items-baseline gap-1.5 sm:block">
                        <span className={`font-black text-base sm:text-lg ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                          {job.wageAmount.toLocaleString("tr-TR")} TL
                        </span>
                        <span className={`text-[9px] font-bold block sm:text-right ${isDark ? "text-emerald-300/80" : "text-emerald-900"}`}>Net • Pazarlıksız</span>
                      </div>
                    </div>
                  </div>

                  {/* Reddedilen İlan Bilgilendirmesi */}
                  {isUserRejected && (
                    <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-600/40 text-red-200 text-xs flex items-center gap-2 my-2">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Bu ilana yaptığınız başvuru işveren tarafından reddedilmiştir. Politikalarımız gereği bu ilana tekrar başvuru yapılamaz.</span>
                    </div>
                  )}

                  {/* Pasif İlan Bilgilendirme ve Hızlı Durum Yönetimi */}
                  {!isUserRejected && isJobInactive && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between gap-2 my-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[11px] sm:text-xs">
                          {isExpired
                            ? "Bu ilanın 7 günlük yayın süresi doldu ve sistem tarafından otomatik olarak pasife alındı. İlan diğer kullanıcılara gizlenmiştir."
                            : "Bu ilan şu anda pasif durumda ve diğer kullanıcılara gizlenmiştir."}
                        </span>
                      </div>
                      {canManageJob && (
                        <button
                          type="button"
                          onClick={() => onUpdateJobStatus(job.id, "active")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                          title="İlanı 7 gün süreyle tekrar yayına al"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>🔄 Tekrar Aktif Et (7 Gün)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Details Grid: Workers, Date, Garden Area, Applications (Mobile-responsive, organized & neat) */}
                  <div
                    className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:p-2.5 rounded-xl border my-2 text-center items-center ${
                      isDark
                        ? "bg-[#07150e] border-emerald-900/50 text-emerald-100"
                        : "bg-[#edf6f0] border-emerald-300 text-gray-900"
                    }`}
                  >
                    {/* 1. İşçi Sayısı */}
                    <div className="flex flex-col items-center justify-center min-w-0 p-1 rounded-lg bg-black/5 dark:bg-black/10 sm:bg-transparent">
                      <span className={`text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>İşçi Sayısı</span>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white mt-0.5 truncate">
                        {job.workerCount} Kişi
                      </span>
                    </div>

                    {/* 2. Tarih */}
                    <div
                      className={`flex flex-col items-center justify-center min-w-0 p-1 rounded-lg bg-black/5 dark:bg-black/10 sm:bg-transparent sm:border-l ${
                        isDark ? "sm:border-emerald-900/40" : "sm:border-emerald-300"
                      }`}
                    >
                      <span className={`text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Tarih / Süre</span>
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
                        <span className="text-[11px] sm:text-xs font-black text-gray-900 dark:text-white leading-tight">
                          {job.startDate}
                        </span>
                        <span className={`text-[9px] sm:text-[10px] font-black ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>
                          ({job.estimatedDays} Gün)
                        </span>
                      </div>
                    </div>

                    {/* 3. Alan */}
                    <div
                      className={`flex flex-col items-center justify-center min-w-0 p-1 rounded-lg bg-black/5 dark:bg-black/10 sm:bg-transparent sm:border-l ${
                        isDark ? "sm:border-emerald-900/40" : "sm:border-emerald-300"
                      }`}
                    >
                      <span className={`text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Bahçe Alanı</span>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white mt-0.5 truncate">
                        {job.gardenSizeDonum || 8} Dönüm
                      </span>
                    </div>

                    {/* 4. Başvuru */}
                    <div
                      className={`flex flex-col items-center justify-center min-w-0 p-1 rounded-lg bg-black/5 dark:bg-black/10 sm:bg-transparent sm:border-l ${
                        isDark ? "sm:border-emerald-900/40" : "sm:border-emerald-300"
                      }`}
                    >
                      <span className={`text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Başvuru Sayısı</span>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white mt-0.5 truncate">
                        {job.applicantsCount || 0} Kişi
                      </span>
                    </div>
                  </div>

                  {/* Amenities Badges (Konaklama, Yemek, Servis) */}
                  <div className="grid grid-cols-1 xs:grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 pt-1 text-[11px] font-bold">
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-center flex items-center justify-center gap-1 truncate ${
                        job.hasAccommodation
                          ? isDark
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-950 border-emerald-300 font-black"
                          : isDark
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-red-50 text-red-900 border-red-200 font-bold"
                      }`}
                    >
                      {job.hasAccommodation ? "✅ Konaklama Var" : "❌ Konaklama Yok"}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg border text-center flex items-center justify-center gap-1 truncate ${
                        job.hasFood
                          ? isDark
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-950 border-emerald-300 font-black"
                          : isDark
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-red-50 text-red-900 border-red-200 font-bold"
                      }`}
                    >
                      {job.hasFood ? "✅ Yemek / Kumanya Var" : "❌ Yemek Yok"}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg border text-center flex items-center justify-center gap-1 truncate ${
                        job.hasTransportation
                          ? isDark
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-950 border-emerald-300 font-black"
                          : isDark
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-red-50 text-red-900 border-red-200 font-bold"
                      }`}
                    >
                      {job.hasTransportation ? "✅ Servis / Ulaşım Var" : "❌ Servis Yok"}
                    </span>
                  </div>

                  {job.notes && (
                    <p className={`text-[11px] mt-2 italic p-2 rounded-xl border line-clamp-2 leading-relaxed ${isDark ? "opacity-75 bg-black/10 border-emerald-900/20 text-emerald-200" : "bg-gray-50 border-gray-200 text-gray-800 font-medium"}`}>
                      "{job.notes}"
                    </p>
                  )}

                  {/* Bottom Action Row: Direct Contact & Application */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-emerald-900/20">
                    <div className="text-xs flex items-center gap-1.5 min-w-0">
                      <span className={`shrink-0 font-bold ${isDark ? "opacity-70 text-emerald-300" : "text-emerald-950"}`}>İşveren:</span>
                      <strong className={`truncate ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>{job.employerName || "İşveren"}</strong>
                      <span className={`text-[11px] shrink-0 font-bold ${isDark ? "opacity-60 text-emerald-200" : "text-gray-700"}`}>({job.employerPhone || job.phone || "0532 411 28 53"})</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                      {/* Doğrudan Arama (tel:intent) */}
                      <a
                        href={`tel:${getCleanPhone(job.employerPhone || job.phone)}`}
                        className="flex-1 sm:flex-initial justify-center px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors"
                        title="İşvereni Doğrudan Ara"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>Ara</span>
                      </a>

                      {/* Doğrudan SMS (sms:intent) */}
                      <a
                        href={`sms:${getCleanPhone(job.employerPhone || job.phone)}?body=Merhaba ${encodeURIComponent(job.employerName || "İşveren")}, ${encodeURIComponent(job.title || "ilanınız")} için görüşmek istiyorum.`}
                        className="flex-1 sm:flex-initial justify-center px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-blue-700/80 hover:bg-blue-600 text-white transition-colors"
                        title="SMS Gönder"
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                        <span>SMS</span>
                      </a>

                      {/* WhatsApp Doğrudan Paylaşım/Bağlantı */}
                      <a
                        href={`https://wa.me/90${getCleanWaPhone(job.employerPhone || job.phone)}?text=${encodeURIComponent(
                          `Merhaba ${job.employerName || "İşveren"}, Tarım Cepte uygulamasındaki '${job.title || "ilanınız"}' için yazıyorum.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial justify-center px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white transition-colors"
                        title="WhatsApp Üzerinden Mesaj At"
                      >
                        <Share2 className="w-3.5 h-3.5 shrink-0" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Başvuru Butonu veya Reddedildi / Kadro Doldu Rozeti */}
                      {isUserRejected ? (
                        <div
                          className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-red-950/70 text-red-300 border border-red-800/60 cursor-not-allowed"
                          title="İşveren bu ilana başvurunuzu reddetti. Bu ilana tekrar başvuru yapılamaz."
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>Başvuru Reddedildi</span>
                        </div>
                      ) : isJobInactive ? (
                        <div
                          className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gray-800 text-gray-400 border border-gray-700 opacity-80 cursor-not-allowed"
                          title="Bu ilanın işçi ihtiyacı karşılandı (Pasif)"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                          <span>Kadro Doldu</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobForApply(job);
                            setApplyError(null);
                            setApplyForm({
                              applicantName: currentRole === "crew_leader" ? "Çavuş Mehmet Yılmaz" : currentRole === "worker" ? "Murat Demir" : "",
                              applicantPhone: currentRole === "crew_leader" ? "0535 882 14 00" : currentRole === "worker" ? "0531 200 45 77" : "",
                              teamSize: currentRole === "crew_leader" ? 8 : 1,
                              demandedWage: job.wageAmount,
                              offerNote: "",
                            });
                          }}
                          className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5 shrink-0" />
                          <span>{currentRole === "crew_leader" ? "Ekip Adına Başvur" : "Başvur"}</span>
                        </button>
                      )}

                      {/* Sadece İlan Sahibi veya Admin için Durum Değiştirme (Pasife / Aktife Al) */}
                      {canManageJob && (
                        <button
                          type="button"
                          onClick={() => onUpdateJobStatus(job.id, isJobInactive ? "active" : "inactive")}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                            isJobInactive
                              ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
                              : "bg-amber-900/40 text-amber-300 hover:bg-amber-800/50 border border-amber-700/40"
                          }`}
                          title={isJobInactive ? "İlanı 7 gün süreyle tekrar yayına al" : "İlanı pasife al (diğer kullanıcılara gizle)"}
                        >
                          {isJobInactive ? "🔄 Tekrar Aktif Et (7 Gün)" : "⏸️ Pasife Al"}
                        </button>
                      )}

                      {/* Sadece İlan Sahibi veya Admin için İlanı Düzenle */}
                      {canManageJob && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditJobModal(job)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-900/30 text-purple-300 hover:bg-purple-800/50 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          title="İlanı Düzenle"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Düzenle</span>
                        </button>
                      )}

                      {/* Sadece İlan Sahibi veya Admin için İlanı Sil */}
                      {canManageJob && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmState({
                              isOpen: true,
                              title: "İlanı Sil",
                              itemName: job.title,
                              description: `"${job.title}" başlıklı ilanı ve bu ilana ait tüm başvuruları kalıcı olarak silmek istediğinizden emin misiniz?`,
                              onConfirm: () => onDeleteJob(job.id),
                            });
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer shrink-0"
                          title={currentRole === "admin" ? "İlanı Sil (Admin)" : "Kendi İlanınızı Sil"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: EKİP LİDERLERİ & ÇAVUŞLAR (CREW LEADERS)
         ========================================================================= */}
      {activeMarketTab === "crews" && (
        <div className="space-y-3.5">
          {/* Çavuşlar & Ekipler Bölümü Rol Tabanlı İlan Açma Alanı */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 min-w-0 ${
              isDark ? "bg-[#0b1c15] border-emerald-800" : "bg-emerald-50/90 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-emerald-400 truncate whitespace-nowrap">
                  {currentRole === "crew_leader" ? "👥 Ekip Lideri (Çavuş) İlan Alanı" : "Çavuşlar & Çalışma Ekipleri"}
                </h4>
                <p className="text-[11px] opacity-75 mt-0.5 line-clamp-2 leading-relaxed">
                  {currentRole === "crew_leader"
                    ? "Kendi ekibinizi, kişi kapasitenizi, uzmanlıklarınızı ve kişi başı net yevmiyenizi ilan olarak yayınlayın."
                    : "Bölgenin tecrübeli çavuşlarını ve hazır hasat ekiplerini inceleyin veya kendi ekibinizi ekleyin."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenNewCrewModal}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{currentRole === "crew_leader" ? "Ekip İlanı Yayınla" : "Yeni Ekip İlanı"}</span>
            </button>
          </div>

          {/* Davet Onay Bildirimi */}
          {inviteJoinedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-100 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{inviteJoinedSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setInviteJoinedSuccess(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Kayıtlı Kadro Üyeleri & Karşılıklı Davet Sistemi (Tüm kullanıcılara ve çavuşlara aktif terminal) */}
          {(() => {
            const activeManagedCrew =
              safeCrews.find((c) => c.id === selectedCrewToManageId) ||
              safeCrews.find((c) => Boolean(currentUser && c.userId && c.userId === currentUser.id)) ||
              safeCrews[0] ||
              myCrew;

            return (
              <div
                className={`p-4 rounded-2xl border space-y-3.5 ${
                  isDark ? "bg-[#11271e] border-emerald-800 text-emerald-50" : "bg-emerald-50 border-emerald-300 text-gray-900"
                }`}
              >
                {/* Terminal Navigation Sub-tabs: 1. Davet & Yönetim | 2. Karşılıklı Davet Kabul */}
                <div className="flex items-center justify-between gap-2 border-b border-emerald-900/30 pb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCrewTerminalTab("manage")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        crewTerminalTab === "manage"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isDark
                          ? "text-emerald-300 hover:text-white"
                          : "text-emerald-900 hover:bg-emerald-100 font-semibold"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Kayıtlı Kadro & Davet Gönder</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCrewTerminalTab("accept")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        crewTerminalTab === "accept"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isDark
                          ? "text-emerald-300 hover:text-white"
                          : "text-emerald-900 hover:bg-emerald-100 font-semibold"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>🤝 Karşılıklı Davet Kabul (Kadroya Katıl)</span>
                    </button>
                  </div>

                  {/* Ekip Seçim Alanı */}
                  {safeCrews.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                        Yönetilen Ekip:
                      </span>
                      <select
                        value={activeManagedCrew.id}
                        onChange={(e) => setSelectedCrewToManageId(e.target.value)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                          isDark ? "bg-[#0b1a13] border-emerald-800 text-emerald-200" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        {safeCrews.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.members?.length || 0} Kişi)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* TAB 1: ÇAVUŞ KADRO YÖNETİMİ & WHATSAPP DAVET SİSTEMİ */}
                {crewTerminalTab === "manage" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-extrabold text-xs sm:text-sm flex items-center gap-1.5 truncate whitespace-nowrap ${
                          isDark ? "text-emerald-400" : "text-emerald-950 font-black"
                        }`}>
                          <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="truncate">Kayıtlı Kadro Üyeleri Yönetim Paneli</span>
                        </h4>
                        <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${
                          isDark ? "opacity-75" : "text-emerald-900 font-medium"
                        }`}>
                          Aktif Ekip: <strong className={isDark ? "text-emerald-300" : "text-emerald-950 font-black"}>{activeManagedCrew.name}</strong> • Kayıtlı Kadro:{" "}
                          <strong className={isDark ? "text-emerald-300" : "text-emerald-950 font-black"}>
                            {activeManagedCrew.members?.length || 0} Kişi
                          </strong>{" "}
                          (Kapasite: {activeManagedCrew.crewSize || 10} Kişi)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold whitespace-nowrap ${
                          isDark ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}>
                          Kişi Başı: {(activeManagedCrew.expectedDailyWagePerPerson || 2200).toLocaleString("tr-TR")} TL
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp Davet Gönderme Bölümü */}
                    <div className={`p-3 rounded-xl border space-y-2.5 ${
                      isDark ? "bg-black/20 border-emerald-900/40" : "bg-white/80 border-emerald-200 shadow-xs"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                          isDark ? "text-emerald-300" : "text-emerald-950 font-black"
                        }`}>
                          <Share2 className="w-3.5 h-3.5 text-green-500" />
                          <span>İşçiye WhatsApp ile Ekip Davet Linki Gönder</span>
                        </span>
                        <span className={`text-[10px] ${isDark ? "opacity-70" : "text-gray-600"}`}>
                          İşçi bağlantıyı onayladığında anında kadronuza eklenir
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-5">
                          <input
                            type="tel"
                            placeholder="İşçinin WhatsApp No (05xx...) (İsteğe bağlı)"
                            value={inviteWorkerPhone}
                            onChange={(e) => setInviteWorkerPhone(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-7 flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const cleanWa = getCleanWaPhone(inviteWorkerPhone);
                              const inviteLink = generateInviteLink(
                                activeManagedCrew.id,
                                activeManagedCrew.name,
                                activeManagedCrew.expectedDailyWagePerPerson || 2200
                              );
                              const text = `Selamün aleyküm! Ben ${activeManagedCrew.name}. Karadeniz Tarım Cepte uygulamasından seni ekibimize davet ediyorum.\n\nEkibimize katılmak, resmi kadro listemize dahil olmak ve yevmiyeli hasat işlerimize başlamak için lütfen aşağıdaki bağlantıya tıklayarak daveti onayla:\n${inviteLink}\n\nKişi Başı Yevmiye: ${(activeManagedCrew.expectedDailyWagePerPerson || 2200).toLocaleString("tr-TR")} TL\nBölgemiz: ${activeManagedCrew.location}`;
                              const waUrl = cleanWa
                                ? `https://wa.me/90${cleanWa}?text=${encodeURIComponent(text)}`
                                : `https://wa.me/?text=${encodeURIComponent(text)}`;
                              window.open(waUrl, "_blank");
                              setCopyFeedback("✅ WhatsApp davet mesajı yönlendirildi!");
                              setTimeout(() => setCopyFeedback(null), 4000);
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-500 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp ile Gönder</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const inviteLink = generateInviteLink(
                                activeManagedCrew.id,
                                activeManagedCrew.name,
                                activeManagedCrew.expectedDailyWagePerPerson || 2200
                              );
                              copyToClipboard(inviteLink, "Ekip Katılım Davet Linki");
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Linki Kopyala</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPendingInvite({
                                crewId: activeManagedCrew.id,
                                crewName: activeManagedCrew.name,
                                dailyWage: activeManagedCrew.expectedDailyWagePerPerson || 2200,
                              });
                              setInviteAcceptForm({
                                name: currentUser?.fullName || currentUser?.username || "Yeni İşçi Ali",
                                phone: currentUser?.phone || "0534 888 99 00",
                                roleTitle: "Makasçı",
                                dailyWage: activeManagedCrew.expectedDailyWagePerPerson || 2200,
                              });
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="İşçiye giden link tıklandığında açılan onay ekranını anında test edin"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Daveti Test Et & Onayla</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Manuel Kadroya Ekleme Formu */}
                    <div className="space-y-2 pt-1">
                      <span className={`text-[11px] font-bold block ${isDark ? "opacity-80" : "text-emerald-950 font-black"}`}>
                        Veya Manuel Olarak Kadroya Üye Ekle:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          placeholder="İşçi Ad Soyad"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs border ${
                            isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                            isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="Makasçı">Usta Çay Makasçısı</option>
                          <option value="Motorlu Tırpancı">Motorlu Tırpancı</option>
                          <option value="Çuvalcı">Çuval Taşıyıcı</option>
                          <option value="Teleferikçi">Teleferik Operatörü</option>
                          <option value="Usta">Genel Tarım Ustası</option>
                        </select>
                        <input
                          type="tel"
                          placeholder="Telefon No (05xx...)"
                          value={newMemberPhone}
                          onChange={(e) => setNewMemberPhone(e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs border ${
                            isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newMemberName.trim() || !newMemberPhone.trim()) {
                              alert("Lütfen işçi adı ve telefonunu girin.");
                              return;
                            }
                            const modRes = validateContent(newMemberName, "İşçi Adı");
                            if (!modRes.isValid) {
                              alert(modRes.errorMessage);
                              return;
                            }
                            if (onAddCrewMember) {
                              onAddCrewMember(activeManagedCrew.id, {
                                name: newMemberName.trim(),
                                roleTitle: newMemberRole,
                                phone: newMemberPhone.trim(),
                                dailyWage: activeManagedCrew.expectedDailyWagePerPerson || 2200,
                              });
                            }
                            setNewMemberName("");
                            setNewMemberPhone("");
                            setCopyFeedback(`✅ "${newMemberName}" kadroya başarıyla eklendi!`);
                            setTimeout(() => setCopyFeedback(null), 3500);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Kadroya Ekle</span>
                        </button>
                      </div>
                    </div>

                    {/* Aktif Kadro Üyeleri Listesi */}
                    <div className="pt-2 border-t border-emerald-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                          {activeManagedCrew.name} Kayıtlı Kadro Üyeleri ({activeManagedCrew.members?.length || 0} Kişi):
                        </span>
                      </div>

                      {activeManagedCrew.members && activeManagedCrew.members.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {activeManagedCrew.members.map((member) => (
                            <div
                              key={member.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                isDark ? "bg-black/30 border-emerald-900/60 text-white" : "bg-white border-emerald-200 text-gray-900 shadow-xs"
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <span className="font-bold text-xs truncate block">{member.name}</span>
                                <span className={`text-[10px] block ${isDark ? "text-emerald-300" : "text-emerald-800 font-semibold"}`}>
                                  {member.roleTitle}
                                </span>
                                <span className={`text-[10px] block ${isDark ? "opacity-75" : "text-gray-600"}`}>
                                  {member.phone}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={`tel:${getCleanPhone(member.phone)}`}
                                  className="p-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                                  title="Ara"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                {onDeleteCrewMember && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteCrewMember(activeManagedCrew.id, member.id)}
                                    className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                    title="Kadrodan Çıkar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl border text-center text-xs ${
                          isDark ? "bg-black/20 border-emerald-900/30 text-emerald-300" : "bg-white border-gray-200 text-gray-700"
                        }`}>
                          Bu ekibe henüz kayıtlı kadro üyesi eklenmedi. Yukarıdaki form veya WhatsApp daveti ile hemen işçi ekleyebilirsiniz.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: KARŞILIKLI DAVET KABUL ALANI (İŞÇİ / KULLANICI KADROYA KATILIMI) */}
                {crewTerminalTab === "accept" && (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? "bg-black/30 border-emerald-700/60" : "bg-white border-emerald-300 shadow-sm"
                  }`}>
                    <div className="border-b border-emerald-900/30 pb-2.5">
                      <h4 className={`text-sm font-black flex items-center gap-1.5 ${
                        isDark ? "text-emerald-300" : "text-emerald-950"
                      }`}>
                        <UserPlus className="w-4 h-4 text-emerald-500" />
                        <span>Karşılıklı Ekip Davet Kabul ve Kadroya Katılma Formu</span>
                      </h4>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "opacity-75" : "text-gray-700"}`}>
                        Herhangi bir çavuşun ekibine katılmak, yevmiyeli hasat kadrosunda yer almak için bilgilerinizi onaylayın.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!inviteAcceptForm.name.trim() || !inviteAcceptForm.phone.trim()) {
                          alert("Lütfen adınızı ve telefon numaranızı eksiksiz girin.");
                          return;
                        }
                        const modRes = validateContent(inviteAcceptForm.name, "İşçi Ad Soyad");
                        if (!modRes.isValid) {
                          alert(modRes.errorMessage);
                          return;
                        }
                        const targetCrew = safeCrews.find((c) => c.id === selectedCrewToManageId) || activeManagedCrew;
                        if (!targetCrew) return;

                        if (onAddCrewMember) {
                          onAddCrewMember(targetCrew.id, {
                            name: inviteAcceptForm.name.trim(),
                            roleTitle: inviteAcceptForm.roleTitle,
                            phone: inviteAcceptForm.phone.trim(),
                            dailyWage: targetCrew.expectedDailyWagePerPerson || 2200,
                          });
                        }
                        setInviteJoinedSuccess(
                          `🎉 Tebrikler! "${targetCrew.name}" ekibinin Kayıtlı Kadro Üyelerine başarıyla dahil oldunuz.`
                        );
                        setCrewTerminalTab("manage");
                      }}
                      className="space-y-3 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-bold mb-1 ${isDark ? "opacity-80" : "text-gray-900"}`}>
                            Katılmak İstediğiniz Ekip / Çavuş
                          </label>
                          <select
                            value={activeManagedCrew.id}
                            onChange={(e) => setSelectedCrewToManageId(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                              isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                            }`}
                          >
                            {safeCrews.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} — {c.location} ({(c.expectedDailyWagePerPerson || 2200).toLocaleString("tr-TR")} TL / Gün)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block font-bold mb-1 ${isDark ? "opacity-80" : "text-gray-900"}`}>
                            Adınız ve Soyadınız
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: Hasan Yılmaz"
                            value={inviteAcceptForm.name || (currentUser?.fullName || currentUser?.username || "")}
                            onChange={(e) => setInviteAcceptForm({ ...inviteAcceptForm, name: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-bold mb-1 ${isDark ? "opacity-80" : "text-gray-900"}`}>
                            Uzmanlık Alanınız / Kadro Göreviniz
                          </label>
                          <select
                            value={inviteAcceptForm.roleTitle}
                            onChange={(e) =>
                              setInviteAcceptForm({ ...inviteAcceptForm, roleTitle: e.target.value as any })
                            }
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border ${
                              isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="Makasçı">Usta Çay Makasçısı</option>
                            <option value="Motorlu Tırpancı">Motorlu Tırpan Operatörü</option>
                            <option value="Çuvalcı">Çuval Taşıyıcı (Sırt / Teleferik)</option>
                            <option value="Teleferikçi">Teleferik Operatörü</option>
                            <option value="Usta">Genel Tarım Ustası</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block font-bold mb-1 ${isDark ? "opacity-80" : "text-gray-900"}`}>
                            İletişim Telefon Numaranız
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="05xx xxx xx xx"
                            value={inviteAcceptForm.phone || (currentUser?.phone || "")}
                            onChange={(e) => setInviteAcceptForm({ ...inviteAcceptForm, phone: e.target.value })}
                            className={`w-full px-3 py-2 rounded-xl text-xs border ${
                              isDark ? "bg-[#0b1a13] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        isDark ? "bg-emerald-950/60 border-emerald-800 text-emerald-200" : "bg-emerald-50 border-emerald-200 text-emerald-950"
                      }`}>
                        <div className="text-xs">
                          <span className="font-bold">Garantili Net Kişi Başı Yevmiye:</span>
                          <span className="text-[11px] block opacity-75">Ekip sözleşmesi gereği net ödenecektir.</span>
                        </div>
                        <div className="text-base font-black text-emerald-500">
                          {(activeManagedCrew.expectedDailyWagePerPerson || 2200).toLocaleString("tr-TR")} TL / Gün
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Ekip Kadrosuna Katıl ve Daveti Onayla</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Crews List */}
          <div className="space-y-3">
            {safeCrews.map((crew) => {
              const isCrewOwner =
                Boolean(currentUser && crew.userId && crew.userId === currentUser.id) ||
                Boolean(currentUser && !crew.userId && (crew.name === currentUser.fullName || crew.name === currentUser.username)) ||
                Boolean(currentUser?.phone && crew.phone && currentUser.phone.replace(/\D/g, "") === crew.phone.replace(/\D/g, ""));
              const canManageCrew = currentUser?.role === "admin" || currentRole === "admin" || isCrewOwner;

              return (
              <div
                key={crew.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDark
                    ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-100"
                    : "bg-white border-gray-200 text-gray-900 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-emerald-900/20 pb-2.5 mb-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <h3 className={`font-black text-base truncate whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{crew.name}</h3>
                      {isCrewOwner && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-purple-100 text-purple-950 border border-purple-300"}`}>
                          👤 Sizin Ekibiniz
                        </span>
                      )}
                      {crew.verified && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border border-emerald-300"}`}>
                          <CheckCircle className="w-3 h-3" /> Doğrulanmış Çavuş
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-75 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                        <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>{crew.location}</span>
                      </span>
                      <span>•</span>
                      <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>{crew.experienceYears} Yıl Deneyim</span>
                      <span>•</span>
                      <span className="text-amber-500 dark:text-amber-400 font-bold">★ {crew.rating ? crew.rating.toFixed(1) : "5.0"}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded-xl bg-emerald-950/30 sm:bg-transparent border border-emerald-900/30 sm:border-0 shrink-0 mt-1 sm:mt-0">
                    <span className={`text-[10px] uppercase font-bold block ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Kişi Başı Yevmiye</span>
                    <div className="flex items-baseline gap-1.5 sm:block text-right">
                      <span className={`font-black text-base sm:text-lg ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                        {(crew.expectedDailyWagePerPerson || 1800).toLocaleString("tr-TR")} TL
                      </span>
                      <span className={`text-[10px] font-bold block sm:text-right ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>
                        Kapasite: <strong>{crew.crewSize || 8} Kişi</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                  <span className={`text-[11px] font-bold ${isDark ? "opacity-70 text-emerald-200" : "text-emerald-950"}`}>Uzmanlıklar:</span>
                  {(crew.specialties || []).map((spec, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] ${
                        isDark
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-emerald-100 text-emerald-950 border-emerald-300"
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Available Dates */}
                <div className="text-xs mt-2 flex items-center gap-1.5">
                  <Calendar className={`w-3.5 h-3.5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                  <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>Müsaitlik: <strong>{crew.availableDates}</strong></span>
                </div>

                {/* Member Roster (Kayıtlı Kadro Üyeleri Bölümü) */}
                <div className="mt-3 pt-2.5 border-t border-emerald-900/30">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className={`text-xs font-bold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                      Kayıtlı Kadro Üyeleri ({crew.members?.length || 0} Kişi):
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingInvite({
                          crewId: crew.id,
                          crewName: crew.name,
                          dailyWage: crew.expectedDailyWagePerPerson || 2200,
                        });
                        setInviteAcceptForm({
                          name: currentUser?.fullName || currentUser?.username || "",
                          phone: currentUser?.phone || "",
                          roleTitle: "Makasçı",
                          dailyWage: crew.expectedDailyWagePerPerson || 2200,
                        });
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                      title="Bu ekibin kadrosuna katılmak için daveti kabul et"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>🤝 Kadroya Katıl (Davet Kabul)</span>
                    </button>
                  </div>

                  {!canManageCrew ? (
                    <div className="w-full text-[10px] text-amber-500/90 dark:text-amber-400/90 flex items-center gap-1 mt-1 mb-1.5">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span>Kadro üyelerinin telefon numaraları gizlidir. İletişim doğrudan yukarıdaki Çavuş telefonuyla sağlanır.</span>
                    </div>
                  ) : (
                    <div className="w-full text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 mb-1.5 font-medium">
                      <Shield className="w-3 h-3 shrink-0" />
                      <span>👑 Çavuş / Yönetici Görünümü: Kendi ekibinizin tüm kadro telefon numaralarını görüntülemektesiniz.</span>
                    </div>
                  )}

                  {crew.members && crew.members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                      {crew.members.map((m) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-xl text-[11px] flex items-center justify-between border ${
                            isDark
                              ? "bg-black/25 border-emerald-900/40 text-emerald-100"
                              : "bg-emerald-50/70 border-emerald-200 text-gray-900 shadow-2xs"
                          }`}
                        >
                          <div className="min-w-0 pr-1">
                            <span className="font-bold block truncate">{m.name}</span>
                            <span className={`text-[10px] block ${isDark ? "opacity-75 text-emerald-300" : "text-emerald-800 font-semibold"}`}>
                              {m.roleTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {canManageCrew ? (
                              <span className={`text-[10px] font-mono font-semibold ${isDark ? "text-emerald-300" : "text-emerald-950 font-bold"}`}>
                                {m.phone}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                  isDark
                                    ? "bg-emerald-950/70 text-emerald-400/80 border border-emerald-800/40"
                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                                }`}
                                title="Gizlilik Koruması: Kadro işçilerinin telefonları gizlidir; iş anlaşması için yukarıdaki Çavuş aranır."
                              >
                                🔒 Gizli Kadro No
                              </span>
                            )}
                            {canManageCrew && onDeleteCrewMember && (
                              <button
                                type="button"
                                onClick={() => onDeleteCrewMember(crew.id, m.id)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                                title="Kadro Üyesini Çıkar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-2.5 rounded-xl border text-center text-xs ${
                      isDark ? "bg-black/15 border-emerald-900/30 text-emerald-400/80" : "bg-emerald-50/50 border-emerald-200 text-gray-700"
                    }`}>
                      Henüz bu ekibe kayıtlı kadro üyesi eklenmedi. "🤝 Kadroya Katıl" butonu ile hemen katılabilirsiniz.
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 mt-3 border-t border-emerald-900/20">
                  <a
                    href={`tel:${getCleanPhone(crew.phone)}`}
                    className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>Çavuşu Ara ({crew.phone || "0532 000 00 00"})</span>
                  </a>

                  <a
                    href={`https://wa.me/90${getCleanWaPhone(crew.phone)}?text=${encodeURIComponent(
                      `Merhaba ${crew.name || "Çavuş"}, Tarım Cepte uygulamasından ekibinizin müsaitliğini ve hasat şartlarını görüşmek istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp</span>
                  </a>

                  {canManageCrew && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditCrewModal(crew)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-900/30 text-purple-300 hover:bg-purple-800/50 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      title="Ekip İlanını Düzenle"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Düzenle</span>
                    </button>
                  )}

                  {canManageCrew && onDeleteCrew && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Çavuş & Ekip Profilini Sil",
                          itemName: crew.name,
                          description: `"${crew.name}" çavuşuna ait ekip profilini ve bağlı kadro bilgilerini kalıcı olarak silmek istediğinizden emin misiniz?`,
                          onConfirm: () => onDeleteCrew(crew.id),
                        });
                      }}
                      className="p-1.5 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors shrink-0 cursor-pointer"
                      title={currentRole === "admin" ? "Ekip Profilini Sil (Admin)" : "Kendi Ekip İlanınızı Sil"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BİREYSEL İŞÇİLER (WORKERS)
         ========================================================================= */}
      {activeMarketTab === "workers" && (
        <div className="space-y-3.5">
          {/* Bireysel İşçiler Bölümü Rol Tabanlı İlan Açma Alanı */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 min-w-0 ${
              isDark ? "bg-[#0b1c15] border-emerald-800" : "bg-emerald-50/90 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-emerald-400 truncate whitespace-nowrap">
                  {currentRole === "worker" ? "🌾 Bireysel İşçi İlan Alanı" : "Bireysel Hasat & Budama İşçileri"}
                </h4>
                <p className="text-[11px] opacity-75 mt-0.5 line-clamp-2 leading-relaxed">
                  {currentRole === "worker"
                    ? "Çay biçme, motorlu tırpan, budama becerilerinizi ve talep ettiğiniz net günlük yevmiyeyi ilan olarak yayınlayın."
                    : "Müsait durumdaki usta işçileri inceleyin veya bireysel iş arayan olarak kendi ilanınızı yayınlayın."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenNewWorkerModal}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{currentRole === "worker" ? "İşçi İlanı Yayınla" : "Yeni İşçi İlanı"}</span>
            </button>
          </div>

          {/* Worker Status Toggle if current role is worker */}
          {currentRole === "worker" && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? "bg-[#11271e] border-emerald-800" : "bg-emerald-50 border-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs sm:text-sm text-emerald-400 truncate whitespace-nowrap">
                    İşçi Profil & Müsaitlik Ayarım
                  </h4>
                  <p className="text-[11px] opacity-75 mt-0.5 line-clamp-2 leading-relaxed">
                    İşverenlerin ve Çavuşların sizi doğrudan arayabilmesi için durumunuzu güncel tutun.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMyAvailability("available");
                      if (onUpdateWorkerStatus) onUpdateWorkerStatus("w-1", "available", myExpectedWage);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      myAvailability === "available"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    🟢 İşe Açık / Müsait
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMyAvailability("busy");
                      if (onUpdateWorkerStatus) onUpdateWorkerStatus("w-1", "busy", myExpectedWage);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      myAvailability === "busy"
                        ? "bg-red-600 text-white shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    🔴 İşe Kapalı / Meşgul
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-emerald-900/30">
                <span className="text-xs font-bold">Talep Ettiğim Günlük Yevmiye:</span>
                <input
                  type="number"
                  value={myExpectedWage}
                  onChange={(e) => setMyExpectedWage(Number(e.target.value))}
                  className={`w-32 px-3 py-1 rounded-xl text-xs font-extrabold border ${
                    isDark ? "bg-[#0b1a13] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                  }`}
                />
                <span className="text-xs opacity-75">TL (Pazarlıksız net tutar)</span>
              </div>
            </div>
          )}

          {/* Workers List */}
          <div className="space-y-3">
            {safeWorkers.map((worker) => {
              const isWorkerOwner =
                Boolean(currentUser && worker.userId && worker.userId === currentUser.id) ||
                Boolean(currentUser && !worker.userId && (worker.name === currentUser.fullName || worker.name === currentUser.username));
              const canManageWorker = currentUser?.role === "admin" || currentRole === "admin" || isWorkerOwner;

              return (
              <div
                key={worker.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDark
                    ? "bg-[#0b1a13] border-emerald-900/80 text-emerald-100"
                    : "bg-white border-gray-200 text-gray-900 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-emerald-900/20 pb-2.5 mb-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <h3 className={`font-black text-base truncate whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>{worker.name}</h3>
                      {isWorkerOwner && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-purple-100 text-purple-950 border border-purple-300"}`}>
                          👤 Sizin Profiliniz
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                          worker.availabilityStatus === "busy"
                            ? isDark
                              ? "bg-red-500/20 text-red-300 border-red-500/30"
                              : "bg-red-100 text-red-950 border border-red-300 font-black"
                            : isDark
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-100 text-emerald-950 border border-emerald-300 font-black"
                        }`}
                      >
                        {worker.availabilityStatus === "busy" ? "🔴 Meşgul" : "🟢 Müsait"}
                      </span>
                    </div>
                    <div className="text-xs opacity-75 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                        <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>{worker.location}</span>
                      </span>
                      <span>•</span>
                      <span className={isDark ? "text-emerald-100" : "text-emerald-950 font-medium"}>{worker.experienceYears} Yıl Deneyim</span>
                      <span>•</span>
                      <span className="text-amber-500 dark:text-amber-400 font-bold">★ {worker.rating ? worker.rating.toFixed(1) : "5.0"}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded-xl bg-emerald-950/30 sm:bg-transparent border border-emerald-900/30 sm:border-0 shrink-0 mt-1 sm:mt-0">
                    <span className={`text-[10px] uppercase font-bold block ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950"}`}>Beklenen Yevmiye</span>
                    <div className="flex items-baseline gap-1.5 sm:block text-right">
                      <span className={`font-black text-base sm:text-lg ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                        {(worker.expectedDailyWage || 1600).toLocaleString("tr-TR")} TL
                      </span>
                      <span className={`text-[9px] font-bold block sm:text-right ${isDark ? "text-emerald-300" : "text-emerald-900"}`}>Günlük Net</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                  <span className={`text-[11px] font-bold ${isDark ? "opacity-70 text-emerald-200" : "text-emerald-950"}`}>Beceriler:</span>
                  {(worker.skills || []).map((skill, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] ${
                        isDark
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-emerald-100 text-emerald-950 border-emerald-300"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {worker.description && (
                  <p className="text-[11px] opacity-80 mt-2 italic bg-black/10 p-2 rounded-xl border border-emerald-900/20 line-clamp-2 leading-relaxed">
                    "{worker.description}"
                  </p>
                )}

                {worker.references && (
                  <div className="text-[11px] opacity-75 mt-1.5">
                    <strong>Referanslar: </strong>
                    <span>{worker.references}</span>
                  </div>
                )}

                {/* Direct Contact Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 mt-3 border-t border-emerald-900/20">
                  <a
                    href={`tel:${getCleanPhone(worker.phone)}`}
                    className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>Ara ({worker.phone || "0533 000 00 00"})</span>
                  </a>

                  <a
                    href={`sms:${getCleanPhone(worker.phone)}?body=Merhaba ${encodeURIComponent(worker.name || "İşçi")}, hasat işimiz için müsaitliğinizi görüşmek istiyoruz.`}
                    className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>SMS</span>
                  </a>

                  <a
                    href={`https://wa.me/90${getCleanWaPhone(worker.phone)}?text=${encodeURIComponent(
                      `Merhaba ${worker.name || "İşçi"}, Tarım Cepte uygulamasından profilinizi inceledim, hasat işi için görüşmek istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>WhatsApp</span>
                  </a>

                  {canManageWorker && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditWorkerModal(worker)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-900/30 text-purple-300 hover:bg-purple-800/50 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      title="İşçi Profilini Düzenle"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Düzenle</span>
                    </button>
                  )}

                  {canManageWorker && onDeleteWorker && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Bireysel İşçi Profilini Sil",
                          itemName: worker.name,
                          description: `"${worker.name}" adlı bireysel işçinin profil kaydını sistemden kalıcı olarak silmek istediğinizden emin misiniz?`,
                          onConfirm: () => onDeleteWorker(worker.id),
                        });
                      }}
                      className="p-1.5 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors shrink-0 cursor-pointer"
                      title={currentRole === "admin" ? "İşçi Profilini Sil (Admin)" : "Kendi İşçi Profilinizi Sil"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ZİRAİ HİZMETLER (SERVICES)
         ========================================================================= */}
      {activeMarketTab === "services" && (
        <div className="space-y-3.5">
          {/* Zirai Hizmetler Bölümü Rol Tabanlı İlan Açma Alanı */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 min-w-0 ${
              isDark ? "bg-[#0b1c15] border-emerald-800" : "bg-emerald-50/90 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-black text-xs sm:text-sm truncate whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  {currentRole === "service_provider" ? "🛠️ Tarımsal Hizmet İlan Alanı" : "Tarımsal Hizmet Sağlayıcıları"}
                </h4>
                <p className="text-[11px] opacity-75 mt-0.5 line-clamp-2 leading-relaxed">
                  {currentRole === "service_provider"
                    ? "Gençleştirme budaması, motorlu tırpan, drone ile ilaçlama veya toprak analizi hizmetinizi fiyatıyla ilan olarak yayınlayın."
                    : "Gençleştirme budaması (1/7 & 1/10), motorlu tırpan, drone ile ilaçlama ve toprak analizi profesyonel hizmetleri."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenNewServiceModal}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{currentRole === "service_provider" ? "Hizmet İlanı Yayınla" : "Yeni Hizmet Ekle"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safeServices.map((srv) => {
              const isServiceOwner =
                Boolean(currentUser && srv.userId && srv.userId === currentUser.id) ||
                Boolean(currentUser && !srv.userId && (srv.providerName === currentUser.fullName || srv.providerName === currentUser.username));
              const canManageService = currentUser?.role === "admin" || currentRole === "admin" || isServiceOwner;

              return (
              <div
                key={srv.id}
                className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                  isDark ? "bg-[#0b1a13] border-emerald-900/80" : "bg-white border-gray-200 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-emerald-900/20 pb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border inline-block ${isDark ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/20" : "text-emerald-950 bg-emerald-100 border-emerald-300"}`}>
                        {srv.category === "pruning"
                          ? "1/7 & 1/10 Budama"
                          : srv.category === "clearing"
                          ? "Motorlu Tırpan Temizliği"
                          : srv.category === "spraying"
                          ? "Zirai Drone İlaçlama"
                          : "Toprak Analizi & Reçete"}
                      </span>
                      {isServiceOwner && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-purple-100 text-purple-950 border border-purple-300"}`}>
                          👤 Sizin Hizmetiniz
                        </span>
                      )}
                    </div>
                    <h4 className={`font-black text-sm mt-1 truncate whitespace-nowrap ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{srv.title}</h4>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded-xl bg-emerald-950/30 sm:bg-transparent border border-emerald-900/30 sm:border-0 shrink-0">
                    <span className={`text-[10px] font-bold block ${isDark ? "opacity-70 text-emerald-200" : "text-emerald-950"}`}>
                      {srv.pricingUnit === "donum"
                        ? "Dönüm Başı"
                        : srv.pricingUnit === "ocak"
                        ? "Ocak Başı"
                        : "Günlük"}
                    </span>
                    <span className={`font-black text-sm sm:text-base ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                      {(srv.priceAmount || 0).toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "opacity-85 text-emerald-100" : "text-gray-800 font-medium"}`}>{srv.description}</p>

                <div className="pt-2 border-t border-emerald-900/20 flex items-center justify-between text-xs">
                  <div>
                    <div className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{srv.providerName}</div>
                    <div className={`text-[10px] font-medium ${isDark ? "opacity-70 text-emerald-200" : "text-gray-700"}`}>{srv.city}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${getCleanPhone(srv.providerPhone)}`}
                      className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                      title="Sağlayıcıyı Ara"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/90${getCleanWaPhone(srv.providerPhone)}?text=${encodeURIComponent(
                        `Merhaba, '${srv.title}' hizmetiniz hakkında bilgi almak ve randevu oluşturmak istiyorum.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-green-600 hover:bg-green-500 text-white transition-colors"
                      title="WhatsApp Mesajı"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>

                    {canManageService && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditServiceModal(srv)}
                        className="p-2 rounded-xl bg-purple-900/30 text-purple-300 hover:bg-purple-800/50 transition-colors cursor-pointer"
                        title="Hizmeti Düzenle"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canManageService && onDeleteService && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmState({
                            isOpen: true,
                            title: "Zirai Hizmeti Sil",
                            itemName: srv.title,
                            description: `"${srv.title}" başlıklı zirai hizmet teklifini kalıcı olarak silmek istediğinizden emin misiniz?`,
                            onConfirm: () => onDeleteService(srv.id),
                          });
                        }}
                        className="p-2 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors cursor-pointer"
                        title={currentRole === "admin" ? "Hizmeti Sil (Admin)" : "Kendi Hizmetinizi Sil"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: GELEN BAŞVURULAR (APPLICATIONS)
         ========================================================================= */}
      {activeMarketTab === "applications" && (() => {
        const visibleApplications = currentRole === "admin"
          ? safeApplications
          : safeApplications.filter((app) => {
              const isApplicant =
                Boolean(currentUser && app.applicantId && app.applicantId === currentUser.id) ||
                Boolean(currentUser && !app.applicantId && (app.applicantName === currentUser.fullName || app.applicantName === currentUser.username));
              const relatedJob = safeJobs.find((j) => j.id === app.jobId);
              const isJobEmployer =
                Boolean(currentUser && relatedJob?.employerId && relatedJob.employerId === currentUser.id) ||
                Boolean(currentUser && !relatedJob?.employerId && (relatedJob?.employerName === currentUser.fullName || relatedJob?.employerName === currentUser.username));
              return isApplicant || isJobEmployer;
            });

        return (
          <div className="space-y-3.5">
            <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 min-w-0 ${isDark ? "bg-emerald-950/20 border-emerald-900/60" : "bg-white border-emerald-300 shadow-2xs"}`}>
              <div className="min-w-0 flex-1">
                <h3 className={`font-black text-xs sm:text-sm truncate whitespace-nowrap ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  İş Başvuruları ve Teklifler
                </h3>
                <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${isDark ? "opacity-75 text-emerald-200" : "text-emerald-950/90 font-medium"}`}>
                  {currentRole === "admin"
                    ? "Sistemdeki tüm iş başvurularını denetleyin, onaylayın veya yönetin."
                    : "İlanlarınıza gelen ve tarafınızdan yapılan iş başvurularını inceleyin ve yönetin."}
                </p>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-950 border border-emerald-300"}`}>
                {visibleApplications.length} Başvuru
              </span>
            </div>

            {visibleApplications.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border border-dashed text-xs font-bold ${isDark ? "border-emerald-800/40 opacity-75 text-emerald-300" : "border-emerald-300 bg-white text-emerald-950"}`}>
                {currentRole === "admin"
                  ? "Henüz sistemde kayıtlı iş başvurusu bulunmuyor."
                  : "Henüz adınıza veya ilanlarınıza ait bir iş başvurusu bulunmuyor."}
              </div>
            ) : (
              <div className="space-y-3">
                {visibleApplications.map((app) => {
                  const isApplicant =
                    Boolean(currentUser && app.applicantId && app.applicantId === currentUser.id) ||
                    Boolean(currentUser && !app.applicantId && (app.applicantName === currentUser.fullName || app.applicantName === currentUser.username));
                  const relatedJob = safeJobs.find((j) => j.id === app.jobId);
                  const isJobEmployer =
                    Boolean(currentUser && relatedJob?.employerId && relatedJob.employerId === currentUser.id) ||
                    Boolean(currentUser && !relatedJob?.employerId && (relatedJob?.employerName === currentUser.fullName || relatedJob?.employerName === currentUser.username));
                  const canManageApp = isApplicant || isJobEmployer || currentRole === "admin";
                  const canDecideApp = isJobEmployer || currentRole === "admin";

                return (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark ? "bg-[#0b1a13] border-emerald-900/80" : "bg-white border-gray-200 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-emerald-900/20 pb-2 mb-2">
                    <div className="min-w-0">
                      <div className={`text-[10px] truncate max-w-full font-bold ${isDark ? "opacity-70 text-emerald-200" : "text-gray-700"}`}>İlgili İlan: <strong className={isDark ? "text-emerald-300" : "text-emerald-950 font-black"}>{app.jobTitle}</strong></div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`font-black text-sm ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>{app.applicantName}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-950 border border-emerald-300 font-black"}`}>
                          {app.applicantRole === "crew_leader" ? `Çavuş (${app.teamSize} Kişilik Ekip)` : "Bireysel İşçi"}
                        </span>
                        {isApplicant && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black shrink-0 ${isDark ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-purple-100 text-purple-950 border border-purple-300"}`}>
                            👤 Sizin Başvurunuz
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded-xl bg-emerald-950/30 sm:bg-transparent border border-emerald-900/30 sm:border-0 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shrink-0 ${
                          app.status === "accepted"
                            ? isDark
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-emerald-100 text-emerald-950 border border-emerald-300 font-black"
                            : app.status === "rejected"
                            ? isDark
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : "bg-red-100 text-red-950 border border-red-300 font-bold"
                            : isDark
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-amber-100 text-amber-950 border border-amber-300 font-bold"
                        }`}
                      >
                        {app.status === "accepted" ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Kabul Edildi</span>
                          </>
                        ) : app.status === "rejected" ? (
                          "Reddedildi"
                        ) : (
                          "Beklemede"
                        )}
                      </span>
                      <div className={`font-black text-sm mt-0 sm:mt-1 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                        {(app.demandedWage || 0).toLocaleString("tr-TR")} TL / Gün
                      </div>
                    </div>
                  </div>

                  {/* Kabul Edilme Durumu ve İlanın Pasife Alındığı Bilgilendirmesi */}
                  {app.status === "accepted" && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 my-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Bu başvuru kabul edildi. İlgili <strong>"{app.jobTitle}"</strong> ilanı otomatik olarak <strong>pasife</strong> alındı.
                        </span>
                      </div>
                      {(currentRole === "employer" || currentRole === "admin") && (
                        <button
                          type="button"
                          onClick={() => onUpdateApplicationStatus(app.id, "pending")}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-700 hover:bg-gray-600 text-white shrink-0 cursor-pointer shadow-xs transition-colors"
                          title="Kabulü geri al ve ilanı tekrar aktif duruma getir"
                        >
                          Kabulü Geri Al
                        </button>
                      )}
                    </div>
                  )}

                  {app.status === "rejected" && (
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2 my-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>
                          Bu başvuru reddedildi. Adayın bu ilana (<strong>{app.jobTitle}</strong>) tekrar başvurması engellendi.
                        </span>
                      </div>
                      {(currentRole === "employer" || currentRole === "admin") && (
                        <button
                          type="button"
                          onClick={() => onUpdateApplicationStatus(app.id, "pending")}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 shrink-0 cursor-pointer transition-colors"
                          title="Engeli kaldır ve başvuruyu tekrar bekleme durumuna al"
                        >
                          Engeli Kaldır / İncele
                        </button>
                      )}
                    </div>
                  )}

                  {app.offerNote && (
                    <p className="text-xs opacity-85 italic bg-black/10 p-2.5 rounded-xl border border-emerald-900/20 line-clamp-2 leading-relaxed">
                      "{app.offerNote}"
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 mt-2 border-t border-emerald-900/20">
                    <span className="text-[10px] opacity-60 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Başvuru: {app.createdAt}</span>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <a
                        href={`tel:${getCleanPhone(app.applicantPhone)}`}
                        className="flex-1 sm:flex-initial justify-center px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>Ara ({app.applicantPhone || "0532 000 00 00"})</span>
                      </a>

                      {app.status === "pending" && canDecideApp && (
                        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                          <button
                            type="button"
                            onClick={() => onUpdateApplicationStatus(app.id, "accepted")}
                            className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>Kabul Et</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateApplicationStatus(app.id, "rejected")}
                            className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl text-xs font-bold bg-red-900/50 hover:bg-red-800 text-red-200 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Reddet</span>
                          </button>
                        </div>
                      )}

                      {canManageApp && onDeleteApplication && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmState({
                              isOpen: true,
                              title: isApplicant ? "Başvurumu Geri Çek / Sil" : "İş Başvurusunu Sil",
                              itemName: `${app.applicantName} - ${app.applicantRole === "crew_leader" ? "Çavuş Başvurusu" : "İşçi Başvurusu"}`,
                              description: isApplicant
                                ? "Bu ilana yaptığınız başvuruyu kalıcı olarak iptal etmek ve silmek istediğinizden emin misiniz?"
                                : `"${app.applicantName}" tarafından yapılan iş başvurusunu kalıcı olarak silmek istediğinizden emin misiniz?`,
                              onConfirm: () => onDeleteApplication(app.id),
                            });
                          }}
                          className="p-1.5 rounded-xl bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors cursor-pointer shrink-0"
                          title={isApplicant ? "Başvurumu İptal Et / Sil" : "Başvuruyu Sil"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
        );
      })()}

      {/* =========================================================================
          TAB 6: İŞ GÜCÜ & BÜTÇE HESAPLAMA MOTORU (CALCULATOR)
         ========================================================================= */}
      {activeMarketTab === "calculator" && (
        <div
          className={`p-4 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#0b1c15] border-emerald-900" : "bg-white border-emerald-200 shadow-xs"
          }`}
        >
          <div className="border-b border-emerald-900/30 pb-2.5">
            <h3 className={`font-black text-base flex items-center gap-2 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
              <Calculator className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
              <span>Bölgesel İş Gücü & Hasat Bütçesi Hesaplama Motoru</span>
            </h3>
            <p className="text-xs opacity-75 mt-0.5">
              Doğu Karadeniz çay ve fındık toplama standartlarına dayalı otomatik işçi ve masraf hesaplayıcı
            </p>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Ürün Türü */}
            <div>
              <label className="block uppercase font-bold opacity-75 mb-1">Ürün Türü</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcCrop("tea")}
                  className={`p-2.5 rounded-xl font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    calcCrop === "tea"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                      : isDark
                      ? "bg-[#10241c] border-emerald-900 text-emerald-300"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  🌱 Çay (0,4 Dönüm/İşçi/Gün)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcCrop("hazelnut")}
                  className={`p-2.5 rounded-xl font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    calcCrop === "hazelnut"
                      ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                      : isDark
                      ? "bg-[#10241c] border-emerald-900 text-emerald-300"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  🌰 Fındık (0,35 Dönüm/İşçi/Gün)
                </button>
              </div>
            </div>

            {/* Bahçe Alanı */}
            <div>
              <label className="block uppercase font-bold opacity-75 mb-1">Bahçe Büyüklüğü (Dönüm)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={calcDonum}
                onChange={(e) => setCalcDonum(Math.max(0.5, Number(e.target.value)))}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* Hedef Gün */}
            <div>
              <label className="block uppercase font-bold opacity-75 mb-1">Hedef Hasat Süresi (Gün)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={calcDays}
                onChange={(e) => setCalcDays(Math.max(1, Number(e.target.value)))}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                }`}
              />
            </div>

            {/* Günlük Yevmiye */}
            <div>
              <label className="block uppercase font-bold opacity-75 mb-1">Öngörülen Günlük Yevmiye (TL)</label>
              <input
                type="number"
                step="50"
                min="1000"
                value={calcDailyWage}
                onChange={(e) => setCalcDailyWage(Math.max(500, Number(e.target.value)))}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                  isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Additional Options: Yemek & Servis */}
          <div className="flex items-center gap-4 text-xs font-bold pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={calcIncludeFood}
                onChange={(e) => setCalcIncludeFood(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Yemek/Kumanya Dahil (+250 TL/Adam-Gün)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={calcIncludeTransport}
                onChange={(e) => setCalcIncludeTransport(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Ulaşım/Servis Dahil (+1.200 TL/Gün)</span>
            </label>
          </div>

          {/* Results Box */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? "bg-[#07130e] border-emerald-950" : "bg-emerald-50/70 border-emerald-200"
            }`}
          >
            <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-950 font-black"}`}>
              Hesaplanan İş Gücü ve Bütçe Sonuçları
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white border-emerald-200 shadow-2xs"}`}>
                <span className={`text-[10px] block font-semibold ${isDark ? "opacity-75" : "text-gray-700"}`}>Gereken İşçi Sayısı</span>
                <span className={`text-base font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                  {calcResults.requiredWorkers} Kişi
                </span>
                <span className={`text-[9px] block ${isDark ? "opacity-60" : "text-gray-600 font-medium"}`}>Çavuş veya Bireysel</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white border-emerald-200 shadow-2xs"}`}>
                <span className={`text-[10px] block font-semibold ${isDark ? "opacity-75" : "text-gray-700"}`}>Toplam Adam-Gün</span>
                <span className={`text-base font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                  {calcResults.totalManDays} Adam-Gün
                </span>
                <span className={`text-[9px] block ${isDark ? "opacity-60" : "text-gray-600 font-medium"}`}>
                  {calcResults.requiredWorkers} işçi x {calcDays} gün
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white border-emerald-200 shadow-2xs"}`}>
                <span className={`text-[10px] block font-semibold ${isDark ? "opacity-75" : "text-gray-700"}`}>Salt Yevmiye Gideri</span>
                <span className={`text-base font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                  {calcResults.laborCost.toLocaleString("tr-TR")} TL
                </span>
                <span className={`text-[9px] block ${isDark ? "opacity-60" : "text-gray-600 font-medium"}`}>Pazarlıksız net</span>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? "bg-emerald-500/20 border-emerald-500/40" : "bg-emerald-100 border-emerald-300 shadow-2xs"}`}>
                <span className={`text-[10px] font-bold block ${isDark ? "opacity-80 text-emerald-200" : "text-emerald-950"}`}>Tahmini Net Hasat Bütçesi</span>
                <span className={`text-lg font-black ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  {calcResults.totalBudget.toLocaleString("tr-TR")} TL
                </span>
                <span className={`text-[9px] block font-bold ${isDark ? "opacity-75 text-emerald-300" : "text-emerald-900"}`}>
                  (Yevmiye + Yemek + Servis)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-900/30 flex-wrap">
              <div className="text-[11px] opacity-75">
                💡 Formül: {calcCrop === "tea" ? "Çay" : "Fındık"} için Dönüm / ({calcDays} Gün × {calcCrop === "tea" ? "0,4" : "0,35"})
              </div>

              <button
                type="button"
                onClick={handleApplyCalcToJob}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Bu Bilgilerle İlan Oluştur</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: ADMIN PANELİ (Only for Admin Role)
         ========================================================================= */}
      {activeMarketTab === "admin" && currentRole === "admin" && (
        <div
          className={`p-4 rounded-2xl border space-y-4 ${
            isDark ? "bg-[#18130a] border-amber-900/80 text-amber-100" : "bg-amber-50 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2.5">
            <div>
              <h3 className="font-extrabold text-base text-amber-400 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Yönetici & Moderasyon Paneli</span>
              </h3>
              <p className="text-xs opacity-75">
                Pazar yeri denetimi, taban yevmiye politikası ve sistem genel raporlaması
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Süper Yetkili
            </span>
          </div>

          {/* Quick Metrics & Direct Moderation Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveMarketTab("jobs")}
              className="p-3 rounded-xl bg-black/20 border border-amber-900/30 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="opacity-75 text-[10px] block">Hasat & İlanlar</span>
                <span className="text-[10px] text-amber-400 group-hover:underline flex items-center gap-0.5">Yönet & Sil &rarr;</span>
              </div>
              <span className="text-lg font-black text-amber-400">{safeJobs.length} İlan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMarketTab("crews")}
              className="p-3 rounded-xl bg-black/20 border border-amber-900/30 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="opacity-75 text-[10px] block">Çavuşlar & Ekipler</span>
                <span className="text-[10px] text-amber-400 group-hover:underline flex items-center gap-0.5">Yönet & Sil &rarr;</span>
              </div>
              <span className="text-lg font-black text-amber-400">{safeCrews.length} Ekip</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMarketTab("workers")}
              className="p-3 rounded-xl bg-black/20 border border-amber-900/30 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="opacity-75 text-[10px] block">Bireysel İşçiler</span>
                <span className="text-[10px] text-amber-400 group-hover:underline flex items-center gap-0.5">Yönet & Sil &rarr;</span>
              </div>
              <span className="text-lg font-black text-amber-400">{safeWorkers.length} İşçi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMarketTab("applications")}
              className="p-3 rounded-xl bg-black/20 border border-amber-900/30 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="opacity-75 text-[10px] block">İş Başvuruları</span>
                <span className="text-[10px] text-amber-400 group-hover:underline flex items-center gap-0.5">Yönet & Sil &rarr;</span>
              </div>
              <span className="text-lg font-black text-amber-400">{safeApplications.length} Başvuru</span>
            </button>
          </div>

          {/* Taban Yevmiye Politikası */}
          <div className="p-3.5 rounded-xl bg-black/20 border border-amber-900/30 space-y-2 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Bölgesel Taban Yevmiye Politikası</span>
            </div>
            <p className="text-[11px] opacity-75">
              İşçilerin emeğini korumak amacıyla ilanlarda ve profillerde kabul edilecek minimum yevmiye tutarı.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minWagePolicy}
                onChange={(e) => setMinWagePolicy(Number(e.target.value))}
                className="w-32 px-3 py-1.5 rounded-xl text-xs font-bold bg-black/40 border border-amber-700 text-amber-300"
              />
              <span className="text-xs font-bold">TL ve üzeri geçerlidir</span>
            </div>
          </div>

          {/* Export Report */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-900/30">
            <button
              type="button"
              onClick={() => {
                const report = `=== TARIM CEPTE SİSTEM RAPORU ===\nİlan Sayısı: ${jobs.length}\nÇavuş Sayısı: ${crews.length}\nİşçi Sayısı: ${workers.length}\nBaşvuru Sayısı: ${applications.length}\nHizmet Sayısı: ${services.length}\nTaban Yevmiye: ${minWagePolicy} TL\nÜretim Tarihi: ${new Date().toLocaleString("tr-TR")}`;
                copyToClipboard(report, "Sistem Raporu");
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Sistem Raporunu Panoya Kopyala</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: YENİ İLAN AÇ (6 ZORUNLU ALAN DOĞRULAMALI BOTTOMSHEET / MODAL)
         ========================================================================= */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl transition-all ${
              isDark ? "bg-[#0d2118] border-emerald-800 text-emerald-50" : "bg-white border-emerald-300 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
              <div>
                <h3 className={`font-black text-base flex items-center gap-2 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  <Plus className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                  <span>{editingJobId ? "İş İlanını Düzenle" : "Yeni İş İlanı Aç"}</span>
                </h3>
                <p className="text-[11px] opacity-75">
                  6 zorunlu alan doğrulanır. Pazarlık veya 'ücret görüşülür' kesinlikle kabul edilmez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJobModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/20 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {jobFormError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{jobFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              {/* İlan Başlığı */}
              <div>
                <label className="block font-bold opacity-80 mb-1">İlan Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3. Sürüm Çay Hasadı İçin 6 Kişilik Usta Ekip"
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Ürün & Konum */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold opacity-80 mb-1">Ürün</label>
                  <select
                    value={newJobForm.cropType}
                    onChange={(e) => setNewJobForm({ ...newJobForm, cropType: e.target.value as any })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="tea">🌱 Yaş Çay</option>
                    <option value="hazelnut">🌰 Fındık</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">İl / İlçe</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      placeholder="Şehir (Rize)"
                      value={newJobForm.locationCity}
                      onChange={(e) => setNewJobForm({ ...newJobForm, locationCity: e.target.value })}
                      className={`w-full rounded-xl px-2.5 py-2 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="İlçe (Çayeli)"
                      value={newJobForm.locationDistrict}
                      onChange={(e) => setNewJobForm({ ...newJobForm, locationDistrict: e.target.value })}
                      className={`w-full rounded-xl px-2.5 py-2 text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 1. Zorunlu Alan: İşçi Sayısı & Bahçe Büyüklüğü */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold opacity-80 mb-1">
                    1. Zorunlu Alan: İhtiyaç Duyulan İşçi Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newJobForm.workerCount}
                    onChange={(e) => setNewJobForm({ ...newJobForm, workerCount: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                  <span className="text-[10px] opacity-60">Pozitif tam sayı</span>
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Bahçe Büyüklüğü (Dönüm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newJobForm.gardenSizeDonum}
                    onChange={(e) => setNewJobForm({ ...newJobForm, gardenSizeDonum: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* 2. Zorunlu Alan: Başlangıç Tarihi & Tahmini Süre */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold opacity-80 mb-1">
                    2. Zorunlu Alan: Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={newJobForm.startDate}
                    onChange={(e) => setNewJobForm({ ...newJobForm, startDate: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">
                    Tahmini Süre (Gün)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newJobForm.estimatedDays}
                    onChange={(e) => setNewJobForm({ ...newJobForm, estimatedDays: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* 3. Zorunlu Alan: Ödeme Türü ve Net Tutar (SIFIR BELİRSİZLİK) */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <label className={`block font-black ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                  3. Zorunlu Alan: Kesin Ödeme Türü ve Net Tutar (TL)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newJobForm.paymentType}
                    onChange={(e) => setNewJobForm({ ...newJobForm, paymentType: e.target.value as any })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="daily_wage">Günlük Yevmiye (Kişi Başı)</option>
                    <option value="lump_sum">Götürü Tutar (Toplam İş İçin)</option>
                    <option value="per_donum">Dönüm / Dekar Başı</option>
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="500"
                      value={newJobForm.wageAmount}
                      onChange={(e) => setNewJobForm({ ...newJobForm, wageAmount: Number(e.target.value) })}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-black border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold opacity-60">TL Net</span>
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>"Ücret görüşülür" veya pazarlık ifadeleri yasaktır; net rakam zorunludur.</span>
                </div>
              </div>

              {/* 4., 5., 6. Zorunlu Alanlar: Konaklama, Yemek, Ulaşım */}
              <div className="space-y-1.5 pt-1">
                <div className="font-bold opacity-85">4, 5 ve 6. Zorunlu Alanlar: İmkan ve Şartlar</div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col items-center p-2 rounded-xl border bg-black/10 cursor-pointer">
                    <span className="text-[11px] font-bold">4. Konaklama</span>
                    <input
                      type="checkbox"
                      checked={newJobForm.hasAccommodation}
                      onChange={(e) => setNewJobForm({ ...newJobForm, hasAccommodation: e.target.checked })}
                      className="w-4 h-4 mt-1 rounded text-emerald-600"
                    />
                    <span className="text-[9px] opacity-75 mt-0.5">
                      {newJobForm.hasAccommodation ? "Sağlanıyor" : "Yok"}
                    </span>
                  </label>

                  <label className="flex flex-col items-center p-2 rounded-xl border bg-black/10 cursor-pointer">
                    <span className="text-[11px] font-bold">5. Yemek</span>
                    <input
                      type="checkbox"
                      checked={newJobForm.hasFood}
                      onChange={(e) => setNewJobForm({ ...newJobForm, hasFood: e.target.checked })}
                      className="w-4 h-4 mt-1 rounded text-emerald-600"
                    />
                    <span className="text-[9px] opacity-75 mt-0.5">
                      {newJobForm.hasFood ? "Sağlanıyor" : "Yok"}
                    </span>
                  </label>

                  <label className="flex flex-col items-center p-2 rounded-xl border bg-black/10 cursor-pointer">
                    <span className="text-[11px] font-bold">6. Ulaşım</span>
                    <input
                      type="checkbox"
                      checked={newJobForm.hasTransportation}
                      onChange={(e) => setNewJobForm({ ...newJobForm, hasTransportation: e.target.checked })}
                      className="w-4 h-4 mt-1 rounded text-emerald-600"
                    />
                    <span className="text-[9px] opacity-75 mt-0.5">
                      {newJobForm.hasTransportation ? "Sağlanıyor" : "Yok"}
                    </span>
                  </label>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">İşveren Adı</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    value={newJobForm.employerName}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız kullanıcı adınız otomatik aktarılmıştır."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">İşveren Telefonu</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    readOnly
                    placeholder="0532 000 00 00"
                    value={newJobForm.employerPhone}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız telefon numaranız otomatik aktarılmıştır."
                  />
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block font-bold opacity-80 mb-1">Arazi ve İş Notları</label>
                <textarea
                  rows={2}
                  placeholder="Yamaç durumu, teleferik varlığı, kantar saatleri..."
                  value={newJobForm.notes}
                  onChange={(e) => setNewJobForm({ ...newJobForm, notes: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-900/30">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/40 hover:bg-black/20"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white shadow-md cursor-pointer"
                >
                  {editingJobId ? "Değişiklikleri Kaydet" : "İlanı Doğrula ve Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: İLANA BAŞVUR (ÇAVUŞ VEYA İŞÇİ İÇİN BLOK / BİREYSEL ANLAŞMA)
         ========================================================================= */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-5 space-y-4 shadow-2xl ${
              isDark ? "bg-[#0d2118] border-emerald-800 text-emerald-50" : "bg-white border-emerald-300 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
              <div>
                <h3 className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  {currentRole === "crew_leader" ? "Çavuş Olarak Ekip Adına Başvur" : "Bireysel İşçi Olarak Başvur"}
                </h3>
                <p className="text-[11px] opacity-75 truncate">{selectedJobForApply.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJobForApply(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {applySuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-400" />
                <p>{applySuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSendApplication} className="space-y-3 text-xs">
                {applyError && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-600/60 text-red-200 text-xs flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-red-300">Başvuru Engellendi</p>
                      <p className="text-[11px] leading-relaxed">{applyError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold opacity-80 mb-1">Adınız Soyadınız / Ekip Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Çavuş Mehmet Yılmaz veya Murat Demir"
                    value={applyForm.applicantName}
                    onChange={(e) => {
                      setApplyForm({ ...applyForm, applicantName: e.target.value });
                      setApplyError(null);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Telefon Numaranız</label>
                  <input
                    type="tel"
                    required
                    placeholder="0532 000 00 00"
                    value={applyForm.applicantPhone}
                    onChange={(e) => {
                      setApplyForm({ ...applyForm, applicantPhone: e.target.value });
                      setApplyError(null);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                {currentRole === "crew_leader" && (
                  <div>
                    <label className="block font-bold opacity-80 mb-1">
                      Getireceğiniz Ekip Büyüklüğü (Kişi Sayısı)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="30"
                      required
                      value={applyForm.teamSize}
                      onChange={(e) => setApplyForm({ ...applyForm, teamSize: Number(e.target.value) })}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold opacity-80 mb-1">
                    Talep Ettiğiniz Günlük Net Yevmiye (Kişi Başı TL)
                  </label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={applyForm.demandedWage}
                    onChange={(e) => setApplyForm({ ...applyForm, demandedWage: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Teklif Notu & Deneyim Açıklaması</label>
                  <textarea
                    rows={2}
                    placeholder="Örn: 8 kişilik usta makasçı kadromuzla yamaç arazide belirtilen tarihte işe hazırız."
                    value={applyForm.offerNote}
                    onChange={(e) => setApplyForm({ ...applyForm, offerNote: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/30">
                  <button
                    type="button"
                    onClick={() => setSelectedJobForApply(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/40"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  >
                    Başvuruyu İlet
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: YENİ ZİRAİ HİZMET EKLE
         ========================================================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-5 space-y-3.5 shadow-2xl ${
              isDark ? "bg-[#0d2118] border-emerald-800 text-emerald-50" : "bg-white border-emerald-300 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2.5">
              <h3 className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                {editingServiceId ? "Zirai Hizmeti Düzenle" : "Yeni Tarımsal Hizmet İlanı"}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newServiceForm.title.trim() || !newServiceForm.providerPhone.trim()) {
                  alert("Lütfen başlık ve telefon numarasını girin.");
                  return;
                }
                const modRes = validateFormFields({
                  "Hizmet Başlığı": newServiceForm.title,
                  "Hizmet Açıklaması": newServiceForm.description,
                  "Hizmet Veren Adı": newServiceForm.providerName,
                });
                if (!modRes.isValid) {
                  alert(modRes.errorMessage);
                  return;
                }
                if (editingServiceId) {
                  onSaveService({
                    ...newServiceForm,
                    id: editingServiceId,
                    userId: currentUser?.id,
                  });
                } else {
                  onSaveService({
                    ...newServiceForm,
                    userId: currentUser?.id,
                  });
                }
                setIsServiceModalOpen(false);
                setEditingServiceId(null);
                setCopyFeedback(editingServiceId ? "✅ Zirai hizmet başarıyla güncellendi!" : "✅ Zirai hizmet başarıyla yayınlandı!");
                setTimeout(() => setCopyFeedback(null), 4000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold opacity-80 mb-1">Hizmet Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 1/7 Gençleştirme Budaması ve Aşı Macunu"
                  value={newServiceForm.title}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold opacity-80 mb-1">Kategori</label>
                  <select
                    value={newServiceForm.category}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, category: e.target.value as any })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="pruning">Budama (1/7 & 1/10)</option>
                    <option value="clearing">Motorlu Tırpan Temizliği</option>
                    <option value="spraying">Drone / Zirai İlaçlama</option>
                    <option value="soil_analysis">Toprak Analizi & Reçete</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Fiyatlandırma Birimi</label>
                  <select
                    value={newServiceForm.pricingUnit}
                    onChange={(e) => setNewServiceForm({ ...newServiceForm, pricingUnit: e.target.value as any })}
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="donum">Dönüm / Dekar Başı</option>
                    <option value="ocak">Ocak Başı (Fındık)</option>
                    <option value="daily">Günlük Yevmiye</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Net Fiyat (TL)</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={newServiceForm.priceAmount}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, priceAmount: Number(e.target.value) })}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">Hizmet Sağlayıcı Adı</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Usta Budama Şaban"
                    value={newServiceForm.providerName}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız kullanıcı adınız otomatik aktarılmıştır."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">Telefon No</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    readOnly
                    placeholder="0538 000 00 00"
                    value={newServiceForm.providerPhone}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız telefon numaranız otomatik aktarılmıştır."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  placeholder="Kullanılan aletler, aşı macunu ve uygulama yöntemi..."
                  value={newServiceForm.description}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/30">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/40"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  {editingServiceId ? "Değişiklikleri Kaydet" : "Hizmeti Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ÇAVUŞ & EKİP İLANI YAYINLA
         ========================================================================= */}
      {isCrewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-[#0d2118] border-emerald-800 text-emerald-50" : "bg-white border-emerald-300 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
              <div>
                <h3 className={`font-black text-sm flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  <Users className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                  <span>{editingCrewId ? "Çavuş & Ekip İlanını Düzenle" : "Çavuş & Ekip İlanı Yayınla"}</span>
                </h3>
                <p className="text-[11px] opacity-75">
                  {editingCrewId
                    ? "Ekip bilgilerinizi, kişi kapasitenizi ve net kişi başı yevmiyenizi güncelleyin."
                    : "Ekip bilgilerinizi, kişi kapasitenizi ve net kişi başı yevmiyenizi ilan olarak listeleyin."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCrewModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!crewFormData.name.trim() || !crewFormData.phone.trim()) {
                  alert("Lütfen ekip adını ve telefon numarasını doldurun.");
                  return;
                }
                const modRes = validateFormFields({
                  "Ekip Adı / Çavuş": crewFormData.name,
                  "Konum": crewFormData.location,
                });
                if (!modRes.isValid) {
                  alert(modRes.errorMessage);
                  return;
                }
                if (!crewFormData.expectedDailyWagePerPerson || crewFormData.expectedDailyWagePerPerson < 500) {
                  alert("Lütfen kişi başı geçerli bir net günlük yevmiye tutarı girin (Asgari 500 TL).");
                  return;
                }
                if (onSaveCrew) {
                  if (editingCrewId) {
                    onSaveCrew({
                      ...crewFormData,
                      id: editingCrewId,
                      userId: currentUser?.id,
                    });
                  } else {
                    onSaveCrew({
                      ...crewFormData,
                      userId: currentUser?.id,
                    });
                  }
                }
                setIsCrewModalOpen(false);
                setEditingCrewId(null);
                setCopyFeedback(editingCrewId ? "✅ Ekip ilanınız başarıyla güncellendi!" : "✅ Ekip ilanınız başarıyla yayınlandı!");
                setTimeout(() => setCopyFeedback(null), 4000);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">Çavuş / Ekip Adı</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Örn: Çavuş Mehmet Yılmaz Ekibi"
                    value={crewFormData.name}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız kullanıcı adınız otomatik aktarılmıştır, değiştirilemez."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">İletişim Telefon No</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    readOnly
                    placeholder="0535 000 00 00"
                    value={crewFormData.phone}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız telefon numaranız otomatik aktarılmıştır, değiştirilemez."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold opacity-80 mb-1">Şehir & İlçe</label>
                  <input
                    type="text"
                    required
                    placeholder="Rize / Çayeli"
                    value={crewFormData.location}
                    onChange={(e) => setCrewFormData({ ...crewFormData, location: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Kadro Kapasitesi (Kişi)</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    required
                    value={crewFormData.crewSize}
                    onChange={(e) => setCrewFormData({ ...crewFormData, crewSize: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Tecrübe (Yıl)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={crewFormData.experienceYears}
                    onChange={(e) => setCrewFormData({ ...crewFormData, experienceYears: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">
                  Kişi Başı Net Günlük Yevmiye (TL) <span className="text-red-400 font-normal">("Görüşülür" yasaktır)</span>
                </label>
                <input
                  type="number"
                  min="500"
                  step="50"
                  required
                  value={crewFormData.expectedDailyWagePerPerson}
                  onChange={(e) =>
                    setCrewFormData({ ...crewFormData, expectedDailyWagePerPerson: Number(e.target.value) })
                  }
                  className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Ekip Uzmanlıkları & Araç Gereç</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Makas Ustası", "Yamaç Arazi Hasadı", "Motorlu Tırpan", "Teleferik Operatörü", "Çuval Taşıma", "Budama"].map(
                    (spec) => {
                      const isSelected = crewFormData.specialties.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCrewFormData({
                                ...crewFormData,
                                specialties: crewFormData.specialties.filter((s) => s !== spec),
                              });
                            } else {
                              setCrewFormData({
                                ...crewFormData,
                                specialties: [...crewFormData.specialties, spec],
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : isDark
                              ? "bg-[#142920] text-gray-300 border-emerald-900/60 hover:bg-[#1a382c]"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {spec}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Kayıtlı Kadro Üyeleri Bölümü (Yeni İlanda Doğrudan Kadro Oluşturma) */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? "bg-[#0b1c15] border-emerald-800" : "bg-emerald-50/80 border-emerald-300"
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`block font-extrabold ${isDark ? "text-emerald-300" : "text-emerald-950 font-black"}`}>
                    Kayıtlı Kadro Üyeleri ({crewFormData.members?.length || 0} Kişi Eklendi)
                  </label>
                  <span className={`text-[11px] font-bold ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                    Kapasite: {crewFormData.crewSize} Kişi
                  </span>
                </div>
                <p className={`text-[11px] ${isDark ? "opacity-75" : "text-gray-700"}`}>
                  Ekip ilanınızı yayınlamadan önce kadronuzdaki usta işçileri buradan listeye ekleyebilirsiniz.
                </p>

                {/* Eklenen Kadro Üyeleri Listesi */}
                {crewFormData.members && crewFormData.members.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {crewFormData.members.map((member, idx) => (
                      <div
                        key={member.id || idx}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-emerald-200 text-gray-900 shadow-xs"
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <span className="font-bold truncate block">{member.name}</span>
                          <span className={`text-[10px] block ${isDark ? "text-emerald-300" : "text-emerald-700 font-medium"}`}>
                            {member.roleTitle} • {member.phone}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCrewFormData((prev) => ({
                              ...prev,
                              members: prev.members.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors shrink-0 cursor-pointer"
                          title="Üyeyi Listeden Kaldır"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hızlı Yeni Kadro Üyesi Ekleme Giriş Alanları */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 pt-1 border-t border-emerald-900/30">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="İşçi Ad Soyad"
                      value={modalMemberName}
                      onChange={(e) => setModalMemberName(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={modalMemberRole}
                      onChange={(e) => setModalMemberRole(e.target.value as any)}
                      className={`w-full px-2 py-1.5 rounded-xl text-xs font-semibold border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="Makasçı">Makasçı</option>
                      <option value="Motorlu Tırpancı">Tırpancı</option>
                      <option value="Çuvalcı">Çuvalcı</option>
                      <option value="Teleferikçi">Teleferikçi</option>
                      <option value="Usta">Genel Usta</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="tel"
                      placeholder="Telefon No (05xx...)"
                      value={modalMemberPhone}
                      onChange={(e) => setModalMemberPhone(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs border ${
                        isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!modalMemberName.trim() || !modalMemberPhone.trim()) {
                          alert("Lütfen işçi adı ve telefon numarasını girin.");
                          return;
                        }
                        const newM: CrewMember = {
                          id: `cm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                          name: modalMemberName.trim(),
                          roleTitle: modalMemberRole,
                          phone: modalMemberPhone.trim(),
                          dailyWage: crewFormData.expectedDailyWagePerPerson || 2200,
                        };
                        setCrewFormData((prev) => ({
                          ...prev,
                          members: [...(prev.members || []), newM],
                          crewSize: Math.max(prev.crewSize, (prev.members || []).length + 1),
                        }));
                        setModalMemberName("");
                        setModalMemberPhone("");
                      }}
                      className="w-full py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Müsaitlik Dönemi & Ek Açıklama</label>
                <textarea
                  rows={2}
                  value={crewFormData.notes}
                  onChange={(e) => setCrewFormData({ ...crewFormData, notes: e.target.value })}
                  placeholder="Ekibinizin çalışma şartları, araç durumu ve müsaitlik takvimi..."
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/30">
                <button
                  type="button"
                  onClick={() => setIsCrewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/40"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white shadow-md cursor-pointer"
                >
                  {editingCrewId ? "Değişiklikleri Kaydet" : "Ekip İlanını Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BİREYSEL İŞÇİ İLANI / PROFİLİ YAYINLA
         ========================================================================= */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl border p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-[#0d2118] border-emerald-800 text-emerald-50" : "bg-white border-emerald-300 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
              <div>
                <h3 className={`font-black text-sm flex items-center gap-1.5 ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  <UserCheck className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-800"}`} />
                  <span>{editingWorkerId ? "Bireysel İşçi Profilini Düzenle" : "Bireysel İşçi İlanı & Profili Yayınla"}</span>
                </h3>
                <p className="text-[11px] opacity-75">
                  {editingWorkerId
                    ? "Uzmanlıklarınızı, müsaitlik durumunuzu ve talep ettiğiniz net günlük yevmiyenizi güncelleyin."
                    : "Uzmanlıklarınızı, müsaitlik durumunuzu ve talep ettiğiniz net günlük yevmiyenizi listeleyin."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkerModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!workerFormData.name.trim() || !workerFormData.phone.trim()) {
                  alert("Lütfen adınızı ve telefon numaranızı doldurun.");
                  return;
                }
                const modRes = validateFormFields({
                  "İşçi Adı Soyadı": workerFormData.name,
                  "Konum": workerFormData.location,
                });
                if (!modRes.isValid) {
                  alert(modRes.errorMessage);
                  return;
                }
                if (!workerFormData.expectedDailyWage || workerFormData.expectedDailyWage < 500) {
                  alert("Lütfen geçerli bir net günlük yevmiye tutarı girin (Asgari 500 TL).");
                  return;
                }
                if (onSaveWorker) {
                  if (editingWorkerId) {
                    onSaveWorker({
                      ...workerFormData,
                      id: editingWorkerId,
                      userId: currentUser?.id,
                    });
                  } else {
                    onSaveWorker({
                      ...workerFormData,
                      userId: currentUser?.id,
                    });
                  }
                }
                setIsWorkerModalOpen(false);
                setEditingWorkerId(null);
                setCopyFeedback(editingWorkerId ? "✅ İşçi profiliniz başarıyla güncellendi!" : "✅ İşçi ilanınız ve profiliniz başarıyla yayınlandı!");
                setTimeout(() => setCopyFeedback(null), 4000);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">Adınız Soyadınız</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    readOnly
                    placeholder="Örn: Murat Demir"
                    value={workerFormData.name}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız kullanıcı adınız otomatik aktarılmıştır, değiştirilemez."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold opacity-80">İletişim Telefon No</label>
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Kilitli</span>
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    readOnly
                    placeholder="0531 000 00 00"
                    value={workerFormData.phone}
                    className={`w-full rounded-xl px-3 py-2 text-xs border font-bold cursor-not-allowed opacity-90 ${
                      isDark ? "bg-[#0b1712] border-emerald-800 text-emerald-200" : "bg-gray-100 border-gray-300 text-gray-800"
                    }`}
                    title="Giriş yaptığınız telefon numaranız otomatik aktarılmıştır, değiştirilemez."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold opacity-80 mb-1">Şehir & İlçe</label>
                  <input
                    type="text"
                    required
                    placeholder="Trabzon / Of"
                    value={workerFormData.location}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, location: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Deneyim (Yıl)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={workerFormData.experienceYears}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, experienceYears: Number(e.target.value) })}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Müsaitlik Durumu</label>
                  <select
                    value={workerFormData.availability}
                    onChange={(e) =>
                      setWorkerFormData({ ...workerFormData, availability: e.target.value as "available" | "busy" })
                    }
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="available">🟢 İşe Açık / Müsait</option>
                    <option value="busy">🔴 İşe Kapalı / Meşgul</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">
                  Talep Ettiğiniz Net Günlük Yevmiye (TL) <span className="text-red-400 font-normal">("Görüşülür" yasaktır)</span>
                </label>
                <input
                  type="number"
                  min="500"
                  step="50"
                  required
                  value={workerFormData.expectedDailyWage}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, expectedDailyWage: Number(e.target.value) })}
                  className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Becerileriniz & Uzmanlıklarınız</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Usta Çay Makasçısı", "Motorlu Tırpan", "Budama", "Fındık Toplama", "Çuval Taşıma", "Teleferik"].map(
                    (skill) => {
                      const isSelected = workerFormData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setWorkerFormData({
                                ...workerFormData,
                                skills: workerFormData.skills.filter((s) => s !== skill),
                              });
                            } else {
                              setWorkerFormData({
                                ...workerFormData,
                                skills: [...workerFormData.skills, skill],
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : isDark
                              ? "bg-[#142920] text-gray-300 border-emerald-900/60 hover:bg-[#1a382c]"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {skill}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Deneyim Özeti & Tanıtım Notu</label>
                <textarea
                  rows={2}
                  value={workerFormData.bio}
                  onChange={(e) => setWorkerFormData({ ...workerFormData, bio: e.target.value })}
                  placeholder="Kaç yıldır hangi bölgelerde çalıştınız, çay/fındık hasadındaki hızınız..."
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/30">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/40"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white shadow-md cursor-pointer"
                >
                  İşçi Profilini Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: WHATSAPP DAVET LİNKİNİ ONAYLAMA & EKİP KADROSUNA KATILMA
         ========================================================================= */}
      {pendingInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl border p-5 space-y-4 shadow-2xl ${
              isDark ? "bg-[#0b1f17] border-emerald-600 text-emerald-50" : "bg-white border-emerald-400 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-900/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>Çavuş Ekip Kadrosu Daveti</h3>
                  <p className={`text-[11px] ${isDark ? "opacity-75" : "text-emerald-900 font-semibold"}`}>WhatsApp davet bağlantısı doğrulandı</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingInvite(null);
                  if (typeof window !== "undefined" && window.history?.replaceState) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("crew_invite");
                    url.searchParams.delete("crew_name");
                    url.searchParams.delete("daily_wage");
                    window.history.replaceState({}, document.title, url.pathname);
                  }
                }}
                className="p-1 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Invite Info Box */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${isDark ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-100" : "bg-emerald-50 border-emerald-300 text-emerald-950"}`}>
              <div className="text-xs">
                <span className={`block ${isDark ? "opacity-75" : "text-gray-700 font-bold"}`}>Sizi Ekibine Davet Eden Çavuş: </span>
                <strong className={`font-black block text-sm mt-0.5 ${isDark ? "text-emerald-300" : "text-emerald-950"}`}>
                  {pendingInvite.crewName}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-800/40">
                <span className={isDark ? "opacity-75" : "text-gray-700 font-bold"}>Belirlenen Net Günlük Yevmiye:</span>
                <span className={`font-black text-sm ${isDark ? "text-emerald-400" : "text-emerald-950"}`}>
                  {pendingInvite.dailyWage.toLocaleString("tr-TR")} TL / Gün
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inviteAcceptForm.name.trim() || !inviteAcceptForm.phone.trim()) {
                  alert("Lütfen adınızı ve telefon numaranızı eksiksiz doldurun.");
                  return;
                }
                const modRes = validateContent(inviteAcceptForm.name, "İşçi Ad Soyad");
                if (!modRes.isValid) {
                  alert(modRes.errorMessage);
                  return;
                }
                if (onAddCrewMember) {
                  onAddCrewMember(pendingInvite.crewId, {
                    name: inviteAcceptForm.name,
                    roleTitle: inviteAcceptForm.roleTitle,
                    phone: inviteAcceptForm.phone,
                    dailyWage: inviteAcceptForm.dailyWage,
                  });
                }
                setInviteJoinedSuccess(
                  `🎉 Tebrikler! "${pendingInvite.crewName}" ekibinin Kayıtlı Kadro Üyelerine başarıyla eklendiniz.`
                );
                setPendingInvite(null);
                setActiveMarketTab("crews");
                if (typeof window !== "undefined" && window.history?.replaceState) {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("crew_invite");
                  url.searchParams.delete("crew_name");
                  url.searchParams.delete("daily_wage");
                  window.history.replaceState({}, document.title, url.pathname);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold opacity-80 mb-1">Adınız ve Soyadınız</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ali Kaya"
                  value={inviteAcceptForm.name}
                  onChange={(e) => setInviteAcceptForm({ ...inviteAcceptForm, name: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">Telefon Numaranız</label>
                <input
                  type="tel"
                  required
                  placeholder="0534 000 00 00"
                  value={inviteAcceptForm.phone}
                  onChange={(e) => setInviteAcceptForm({ ...inviteAcceptForm, phone: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold opacity-80 mb-1">Ekipteki Göreviniz</label>
                  <select
                    value={inviteAcceptForm.roleTitle}
                    onChange={(e) =>
                      setInviteAcceptForm({
                        ...inviteAcceptForm,
                        roleTitle: e.target.value as CrewMember["roleTitle"],
                      })
                    }
                    className={`w-full rounded-xl px-3 py-2 text-xs font-bold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-white" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="Makasçı">Usta Makasçı</option>
                    <option value="Motorlu Tırpancı">Motorlu Tırpancı</option>
                    <option value="Çuvalcı">Çuval Taşıyıcı</option>
                    <option value="Teleferikçi">Teleferikçi</option>
                    <option value="Usta">Genel Usta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold opacity-80 mb-1">Günlük Yevmiye (TL)</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={inviteAcceptForm.dailyWage}
                    onChange={(e) =>
                      setInviteAcceptForm({ ...inviteAcceptForm, dailyWage: Number(e.target.value) })
                    }
                    className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold border ${
                      isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-white border-gray-300"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-900/30">
                <button
                  type="button"
                  onClick={() => {
                    setPendingInvite(null);
                    if (typeof window !== "undefined" && window.history?.replaceState) {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("crew_invite");
                      url.searchParams.delete("crew_name");
                      url.searchParams.delete("daily_wage");
                      window.history.replaceState({}, document.title, url.pathname);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-500/40"
                >
                  Reddet
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Onayla ve Kadroya Katıl</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Admin Deletions */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          deleteConfirmState.onConfirm();
          setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
        title={deleteConfirmState.title}
        itemName={deleteConfirmState.itemName}
        description={deleteConfirmState.description}
        isDark={isDark}
      />
    </div>
  );
};
