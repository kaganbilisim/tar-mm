import React, { useState, useEffect } from "react";
import { UserAccount, FarmingFocus, UserRole } from "../types";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Shield,
  Save,
  LogOut,
  UserCheck,
  RefreshCw,
  Sparkles,
  Trash2,
  AlertTriangle,
  KeyRound,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  currentUser?: UserAccount | null;
  onUpdateUser: (updated: UserAccount) => void;
  onLogout: () => void;
  onWipeAccountAndData?: () => void;
  onOpenAuthModal?: (mode: "login" | "register") => void;
  onSwitchToLogin?: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  currentUser,
  onUpdateUser,
  onLogout,
  onWipeAccountAndData,
  onOpenAuthModal,
  onSwitchToLogin,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "farming" | "security" | "forgot">("farming");
  const [isConfirmingWipe, setIsConfirmingWipe] = useState(false);

  // Profile fields safely initialized with optional chaining
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [role, setRole] = useState<UserRole>(currentUser?.role || "employer");

  // Farming Focus (CRITICAL)
  const [farmingFocus, setFarmingFocus] = useState<FarmingFocus>(currentUser?.farmingFocus || "both");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // "Şifremi Unuttum" States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotMethod, setForgotMethod] = useState<"security_question" | "phone">("security_question");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Feedback states
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Synchronize state whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setPhone(currentUser.phone || "");
      setEmail(currentUser.email || "");
      setRole(currentUser.role || "employer");
      setFarmingFocus(currentUser.farmingFocus || "both");
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFeedback({ type: "error", message: "Ad Soyad alanı boş bırakılamaz." });
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      role,
      farmingFocus,
    };

    onUpdateUser(updated);
    setFeedback({ type: "success", message: "Kullanıcı profil ayarları başarıyla güncellendi." });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveFarmingFocus = (focus: FarmingFocus) => {
    setFarmingFocus(focus);
    const updated: UserAccount = {
      ...currentUser,
      farmingFocus: focus,
    };
    onUpdateUser(updated);
    setFeedback({
      type: "success",
      message:
        focus === "tea"
          ? "Tarımsal amaç 'Yaş Çay Tarımı' olarak güncellendi. Fındık alanları gizlendi."
          : focus === "hazelnut"
          ? "Tarımsal amaç 'Fındık Tarımı' olarak güncellendi. Çay alanları gizlendi."
          : "Tarımsal amaç 'Her İkisi (Çay & Fındık)' olarak güncellendi. Tüm alanlar aktif.",
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (currentUser.password && currentPassword !== currentUser.password) {
      setFeedback({ type: "error", message: "Mevcut şifrenizi hatalı girdiniz." });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setFeedback({ type: "error", message: "Yeni şifre en az 4 karakter olmalıdır." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Yeni şifreler birbiriyle eşleşmiyor." });
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      password: newPassword,
    };

    onUpdateUser(updated);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFeedback({ type: "success", message: "Şifreniz başarıyla değiştirildi." });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleResetForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentUser) return;

    if (forgotMethod === "security_question") {
      if (currentUser.securityAnswer) {
        if (forgotAnswer.trim().toLowerCase() !== currentUser.securityAnswer.trim().toLowerCase()) {
          setFeedback({ type: "error", message: "Güvenlik sorusu cevabı hatalı. Lütfen tekrar deneyin." });
          return;
        }
      } else if (!forgotAnswer.trim()) {
        setFeedback({ type: "error", message: "Lütfen güvenlik sorusu cevabınızı girin." });
        return;
      }
    } else {
      const cleanInput = forgotPhone.replace(/\D/g, "");
      const cleanUserPhone = (currentUser.phone || "").replace(/\D/g, "");
      if (cleanUserPhone && cleanInput.length >= 4) {
        if (!cleanUserPhone.includes(cleanInput) && !cleanInput.includes(cleanUserPhone)) {
          setFeedback({ type: "error", message: "Girdiğiniz telefon numarası profilinizle eşleşmiyor." });
          return;
        }
      } else if (!cleanInput) {
        setFeedback({ type: "error", message: "Lütfen kayıtlı telefon numaranızı girin." });
        return;
      }
    }

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setFeedback({ type: "error", message: "Yeni şifre en az 4 karakter olmalıdır." });
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setFeedback({ type: "error", message: "Yeni şifreler birbiriyle eşleşmiyor." });
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      password: forgotNewPassword,
    };

    onUpdateUser(updated);
    setIsForgotMode(false);
    setForgotAnswer("");
    setForgotPhone("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setFeedback({ type: "success", message: "Şifreniz başarıyla sıfırlandı ve yeni şifreniz kaydedildi!" });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div
      id="user-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="user-settings-modal-card"
        className={`w-full max-w-xl rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden ${
          isDark
            ? "bg-[#0c1b14] border-emerald-800 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? "bg-[#07150f] border-emerald-900/80" : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Kullanıcı Hesabı & Profil Ayarları
                </h2>
                {currentUser.username === "kağan" && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                    Ana Yönetici
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75">
                @{currentUser.username} • {currentUser.fullName}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-emerald-900/30 p-2 gap-1.5 bg-black/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("farming");
              setFeedback(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "farming"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-emerald-300 hover:bg-emerald-900/40"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Tarımsal Amaç</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("general");
              setFeedback(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "general"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-emerald-300 hover:bg-emerald-900/40"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil Bilgileri</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("security");
              setIsForgotMode(false);
              setFeedback(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "security"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-emerald-300 hover:bg-emerald-900/40"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Şifre Değiştir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("forgot");
              setIsForgotMode(true);
              setFeedback(null);
            }}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "forgot"
                ? "bg-amber-500 text-black shadow-xs font-black"
                : isDark
                ? "text-amber-300 hover:bg-amber-950/40"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Şifremi Unuttum</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mx-4 mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* =========================================================================
              TAB 1: TARIMSAL AMAÇ (ÇAY / FINDIK / HER İKİSİ)
             ========================================================================= */}
          {activeTab === "farming" && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark
                    ? "bg-[#0f241a] border-emerald-700/60 text-emerald-100"
                    : "bg-emerald-50 border-emerald-200 text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm font-bold">
                    🌿
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-400">
                      Uygulama Kullanım Amacı & Mahsul Filtresi
                    </h3>
                    <p className="text-xs opacity-75">
                      Hangi tarımsal ürünü takip etmek istediğinizi seçin. Sistem anında güncellenir.
                    </p>
                  </div>
                </div>

                {/* 3 Selectable Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {/* Option 1: Çay Tarımı */}
                  <div
                    onClick={() => handleSaveFarmingFocus("tea")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                      farmingFocus === "tea"
                        ? isDark
                          ? "bg-emerald-950 border-emerald-400 text-emerald-50 ring-2 ring-emerald-500/50 shadow-md"
                          : "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/40 shadow-sm"
                        : isDark
                        ? "bg-[#091710] border-emerald-900/60 text-emerald-300/70 hover:border-emerald-700"
                        : "bg-white/70 border-gray-200 text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl">
                      🍃
                    </div>
                    <div>
                      <div className="text-xs font-black flex items-center justify-center gap-1.5">
                        <span>Çay Tarımı</span>
                        {farmingFocus === "tea" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-1 leading-tight">
                        Yalnızca Yaş Çay hasadı, ÇAYKUR ve çay fabrikaları
                      </p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        farmingFocus === "tea"
                          ? "bg-emerald-500 text-black"
                          : "bg-black/20 text-emerald-400"
                      }`}
                    >
                      {farmingFocus === "tea" ? "Aktif Mod" : "Seç"}
                    </span>
                  </div>

                  {/* Option 2: Fındık Tarımı */}
                  <div
                    onClick={() => handleSaveFarmingFocus("hazelnut")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                      farmingFocus === "hazelnut"
                        ? isDark
                          ? "bg-emerald-950 border-emerald-400 text-emerald-50 ring-2 ring-emerald-500/50 shadow-md"
                          : "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/40 shadow-sm"
                        : isDark
                        ? "bg-[#091710] border-emerald-900/60 text-emerald-300/70 hover:border-emerald-700"
                        : "bg-white/70 border-gray-200 text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                      🌰
                    </div>
                    <div>
                      <div className="text-xs font-black flex items-center justify-center gap-1.5">
                        <span>Fındık Tarımı</span>
                        {farmingFocus === "hazelnut" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-1 leading-tight">
                        Yalnızca Fındık hasadı, TMO ve fındık tüccarları
                      </p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        farmingFocus === "hazelnut"
                          ? "bg-amber-400 text-black"
                          : "bg-black/20 text-amber-300"
                      }`}
                    >
                      {farmingFocus === "hazelnut" ? "Aktif Mod" : "Seç"}
                    </span>
                  </div>

                  {/* Option 3: Her İkisi */}
                  <div
                    onClick={() => handleSaveFarmingFocus("both")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                      farmingFocus === "both"
                        ? isDark
                          ? "bg-emerald-950 border-emerald-400 text-emerald-50 ring-2 ring-emerald-500/50 shadow-md"
                          : "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/40 shadow-sm"
                        : isDark
                        ? "bg-[#091710] border-emerald-900/60 text-emerald-300/70 hover:border-emerald-700"
                        : "bg-white/70 border-gray-200 text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl">
                      🌾
                    </div>
                    <div>
                      <div className="text-xs font-black flex items-center justify-center gap-1.5">
                        <span>Her İkisi</span>
                        {farmingFocus === "both" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-1 leading-tight">
                        Hem Yaş Çay hem de Fındık kayıt alanlarının tamamı
                      </p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        farmingFocus === "both"
                          ? "bg-teal-400 text-black"
                          : "bg-black/20 text-teal-300"
                      }`}
                    >
                      {farmingFocus === "both" ? "Aktif Mod" : "Seç"}
                    </span>
                  </div>
                </div>

                {/* Mode Explanation Banner */}
                <div className="p-3 rounded-xl bg-black/20 border border-emerald-800/40 text-xs space-y-1">
                  <div className="font-bold text-emerald-300">
                    Sistem Davranış Özeti:
                  </div>
                  {farmingFocus === "tea" && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-85">
                      <li>Sadece <strong>Yaş Çay Hasadı</strong> kayıtları ve istatistikleri listelenir.</li>
                      <li>Fındık hasadı ve fındık alıcıları (TMO, Ferrero) <strong>devre dışı kalır</strong> ve görünmez.</li>
                      <li>Hasat ekleme ekranı doğrudan Çay hasadına kilitlenir.</li>
                    </ul>
                  )}
                  {farmingFocus === "hazelnut" && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-85">
                      <li>Sadece <strong>Fındık Hasadı</strong> kayıtları ve istatistikleri listelenir.</li>
                      <li>Yaş Çay hasadı ve çay fabrikaları (ÇAYKUR, Doğuş) <strong>devre dışı kalır</strong> ve görünmez.</li>
                      <li>Hasat ekleme ekranı doğrudan Fındık hasadına kilitlenir.</li>
                    </ul>
                  )}
                  {farmingFocus === "both" && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-85">
                      <li>Hem <strong>Çay</strong> hem de <strong>Fındık</strong> hasadı alanları ve istatistikleri aktiftir.</li>
                      <li>Tüm fabrika ve tüccarlar listelenir.</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: GENERAL PROFILE
             ========================================================================= */}
          {activeTab === "general" && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-emerald-400">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-emerald-400">
                    Kullanıcı Adı (Değiştirilemez)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className={`w-full px-3 py-2 rounded-xl border text-sm opacity-60 cursor-not-allowed ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-100 border-gray-200 text-gray-700"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-emerald-300">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0532..."
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-emerald-300">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@tarimcepte.com"
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-emerald-300">
                  Kullanıcı Rolü & Yetki Düzeyi
                </label>
                <div
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    currentUser.role === "admin"
                      ? isDark
                        ? "bg-amber-950/30 border-amber-500/40 text-amber-300"
                        : "bg-amber-50 border-amber-300 text-amber-900"
                      : isDark
                      ? "bg-[#07130e] border-emerald-900/80 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {currentUser.role === "admin"
                        ? "👑 Sistem Tek Yöneticisi (Admin)"
                        : "🌱 Standart Kullanıcı (Çiftçi / Üretici - Tek Rol)"}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    {currentUser.role === "admin" ? "Tam Yetkili" : "Tüm İşlemler Açık"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Profil Bilgilerini Kaydet</span>
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              TAB 3 & 4: PASSWORD CHANGE & ŞİFREMİ UNUTTUM
             ========================================================================= */}
          {(activeTab === "security" || activeTab === "forgot") && (
            <div>
              {isForgotMode || activeTab === "forgot" ? (
                /* ŞİFREMİ UNUTTUM EKRANI */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setActiveTab("security");
                        setFeedback(null);
                      }}
                      className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-900"
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Normal Şifre Değiştirmeye Dön</span>
                    </button>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Şifremi Unuttum
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isDark ? "bg-amber-950/20 border-amber-500/30 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <KeyRound className="w-4 h-4" />
                      <span>Mevcut Şifrenizi Hatırlamıyor musunuz?</span>
                    </div>
                    <p className="text-[11px] opacity-80">
                      Hesabınıza ait güvenlik sorusunu yanıtlayarak veya kayıtlı telefon numaranızla doğrulayarak hemen yeni bir şifre belirleyebilirsiniz.
                    </p>
                  </div>

                  <form onSubmit={handleResetForgotPassword} className="space-y-3.5">
                    {/* Doğrulama Yöntemi Seçimi */}
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-emerald-400">
                        Doğrulama Yöntemi
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForgotMethod("security_question")}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            forgotMethod === "security_question"
                              ? isDark
                                ? "bg-emerald-950 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/30"
                                : "bg-emerald-50 border-emerald-500 text-emerald-950"
                              : isDark
                              ? "bg-[#07130e] border-emerald-900/60 text-emerald-300/70"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Güvenlik Sorusu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setForgotMethod("phone")}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            forgotMethod === "phone"
                              ? isDark
                                ? "bg-emerald-950 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/30"
                                : "bg-emerald-50 border-emerald-500 text-emerald-950"
                              : isDark
                              ? "bg-[#07130e] border-emerald-900/60 text-emerald-300/70"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-400" />
                          <span>Kayıtlı Telefon</span>
                        </button>
                      </div>
                    </div>

                    {/* Yöntem 1: Güvenlik Sorusu */}
                    {forgotMethod === "security_question" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-emerald-300">
                          Güvenlik Sorusu
                        </label>
                        <div className={`p-2.5 rounded-xl border text-xs font-semibold ${
                          isDark ? "bg-[#07130e] border-emerald-900/80 text-emerald-200" : "bg-gray-100 border-gray-200 text-gray-800"
                        }`}>
                          {currentUser.securityQuestion || "En sevdiğiniz Karadeniz yaylası hangisidir?"}
                        </div>
                        <input
                          type="text"
                          required
                          value={forgotAnswer}
                          onChange={(e) => setForgotAnswer(e.target.value)}
                          placeholder="Güvenlik sorusunun cevabını yazın"
                          className={`w-full px-3 py-2 rounded-xl border text-sm ${
                            isDark
                              ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          }`}
                        />
                      </div>
                    )}

                    {/* Yöntem 2: Telefon Doğrulama */}
                    {forgotMethod === "phone" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-emerald-300">
                          Kayıtlı Telefon Numaranız
                        </label>
                        <input
                          type="tel"
                          required
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value)}
                          placeholder={currentUser.phone ? `Örn: ${currentUser.phone.slice(0, 4)} *** ** **` : "0532 000 00 00"}
                          className={`w-full px-3 py-2 rounded-xl border text-sm ${
                            isDark
                              ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          }`}
                        />
                      </div>
                    )}

                    {/* Yeni Şifre Alanları */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-emerald-400">
                          Yeni Şifre
                        </label>
                        <div className="relative">
                          <input
                            type={showForgotPass ? "text" : "password"}
                            required
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="En az 4 karakter"
                            className={`w-full px-3 py-2 rounded-xl border text-sm pr-9 ${
                              isDark
                                ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                                : "bg-gray-50 border-gray-200 text-gray-900"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowForgotPass(!showForgotPass)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-400/70"
                          >
                            {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1 text-emerald-400">
                          Yeni Şifre Tekrarı
                        </label>
                        <input
                          type={showForgotPass ? "text" : "password"}
                          required
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          placeholder="Yeni şifreyi tekrar yazın"
                          className={`w-full px-3 py-2 rounded-xl border text-sm ${
                            isDark
                              ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(false);
                          setFeedback(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                          isDark ? "border-emerald-900 text-gray-400 hover:bg-white/5" : "border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Vazgeç
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Şifremi Sıfırla ve Kaydet</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* STANDART ŞİFRE DEĞİŞTİRME EKRANI (Üstünde Şifremi Unuttum butonu ile) */
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-emerald-400">
                        Mevcut Şifre
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setActiveTab("forgot");
                          setFeedback(null);
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Şifremi unuttum?</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Mevcut şifrenizi girin"
                        className={`w-full px-3 py-2 rounded-xl border text-sm ${
                          isDark
                            ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400/70"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-emerald-400">
                        Yeni Şifre
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="En az 4 karakter"
                        className={`w-full px-3 py-2 rounded-xl border text-sm ${
                          isDark
                            ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-emerald-400">
                        Yeni Şifre Tekrarı
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Yeni şifreyi tekrar yazın"
                        className={`w-full px-3 py-2 rounded-xl border text-sm ${
                          isDark
                            ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setFeedback(null);
                      }}
                      className="text-xs text-amber-400/80 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Mevcut şifremi bilmiyorum</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Şifreyi Güncelle</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Account Session Actions */}
          <div className="border-t border-emerald-900/30 pt-4 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAuthModal) {
                  onOpenAuthModal("login");
                } else if (onSwitchToLogin) {
                  onSwitchToLogin();
                }
              }}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Farklı Bir Hesapla Giriş Yap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Oturumu Kapat</span>
            </button>
          </div>

          {/* Hesap Ayarları: Tüm Verilerimi Kalıcı Olarak Sil */}
          <div className="border-t border-rose-900/30 pt-3">
            {!isConfirmingWipe ? (
              <button
                type="button"
                onClick={() => setIsConfirmingWipe(true)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Hesap Ayarları: Tüm Verilerimi Kalıcı Olarak Sil</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Hesabınız ve tüm verileriniz kalıcı olarak silinecek!</span>
                  </div>
                  <p className="text-[11px] text-rose-200/70">
                    Kayıtlı hesabınız, hasatlarınız ve tüm yerel verileriniz temizlenecektir. Emin misiniz?
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingWipe(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onWipeAccountAndData) {
                        onWipeAccountAndData();
                      } else {
                        onLogout();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Evet, Kalıcı Olarak Sil</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
