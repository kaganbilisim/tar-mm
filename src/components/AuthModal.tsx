import React, { useState } from "react";
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
  Sparkles,
  Phone,
  Mail,
  Shield,
  HelpCircle,
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  initialMode?: "login" | "register" | "forgot";
  users: UserAccount[];
  currentUser?: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onRegister: (newUser: UserAccount) => void;
  onResetPassword: (username: string, newPass: string) => boolean;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isDark,
  initialMode = "login",
  users,
  currentUser,
  onLogin,
  onRegister,
  onResetPassword,
  canClose = true,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regFarmingFocus, setRegFarmingFocus] = useState<FarmingFocus>("tea");
  const [regRole, setRegRole] = useState<UserRole>("employer");
  const [regSecurityQuestion, setRegSecurityQuestion] = useState(
    "Doğduğunuz şehir neresidir?"
  );
  const [regSecurityAnswer, setRegSecurityAnswer] = useState("");
  const [regError, setRegError] = useState("");

  // Forgot Password state
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotNewPasswordConfirm, setForgotNewPasswordConfirm] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [foundUser, setFoundUser] = useState<UserAccount | null>(null);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle Quick Admin Login
  const handleQuickAdminLogin = () => {
    const admin = users.find(
      (u) =>
        u.username.toLowerCase() === "kağan" ||
        u.username.toLowerCase() === "kagan"
    );
    if (admin) {
      onLogin(admin);
      onClose();
    } else {
      // Fallback
      onLogin({
        id: "user-kagan-admin",
        username: "kağan",
        password: "tamer6715",
        fullName: "Kağan (Ana Yönetici)",
        phone: "0543 715 52 00",
        role: "admin",
        farmingFocus: "both",
        createdAt: "2026-01-01",
      });
      onClose();
    }
  };

  // Handle Login Submit (Telefon numarası veya Kullanıcı Adı + Şifre)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const uInput = loginUsername.trim().toLowerCase();
    const pInput = loginPassword;

    if (!uInput || !pInput) {
      setLoginError("Lütfen telefon numaranızı (veya kullanıcı adınızı) ve şifrenizi giriniz.");
      return;
    }

    const cleanDigits = (s?: string) => (s || "").replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
    const inputDigits = cleanDigits(uInput);

    // Find user (support phone number, username, Turkish chars normalization, and email)
    const user = users.find((u) => {
      const uPhoneDigits = cleanDigits(u.phone);
      const phoneMatches = Boolean(
        inputDigits.length >= 7 &&
        uPhoneDigits &&
        (uPhoneDigits === inputDigits || uPhoneDigits.endsWith(inputDigits) || inputDigits.endsWith(uPhoneDigits))
      );
      const usernameMatches =
        u.username.toLowerCase() === uInput ||
        u.username.toLowerCase().replace(/ğ/g, "g") === uInput.replace(/ğ/g, "g");
      const emailMatches = Boolean(u.email && u.email.toLowerCase() === uInput);

      return (phoneMatches || usernameMatches || emailMatches) && u.password === pInput;
    });

    if (user) {
      onLogin(user);
      onClose();
    } else {
      // Check if admin credentials matched specifically
      const adminPhoneDigits = cleanDigits("0543 715 52 00");
      if (
        ((uInput === "kağan" || uInput === "kagan") || (inputDigits.length >= 7 && (inputDigits === adminPhoneDigits || adminPhoneDigits.endsWith(inputDigits)))) &&
        pInput === "tamer6715"
      ) {
        const adminUser: UserAccount = {
          id: "user-kagan-admin",
          username: "kağan",
          password: "tamer6715",
          fullName: "Kağan (Ana Yönetici)",
          phone: "0543 715 52 00",
          role: "admin",
          farmingFocus: "both",
          createdAt: "2026-01-01",
        };
        onLogin(adminUser);
        onClose();
        return;
      }
      setLoginError("Telefon numarası / kullanıcı adı veya şifre hatalı. Lütfen kontrol ediniz.");
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regFullName.trim()) {
      setRegError("Lütfen Ad ve Soyadınızı giriniz.");
      return;
    }

    const trimmedUsername = regUsername.trim().toLowerCase();
    if (!trimmedUsername) {
      setRegError("Lütfen bir kullanıcı adı belirleyiniz.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setRegError("Kullanıcı adı en az 3 karakter olmalıdır.");
      return;
    }

    // Check existing username
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === trimmedUsername ||
        u.username.toLowerCase().replace(/ğ/g, "g") === trimmedUsername.replace(/ğ/g, "g")
    );
    if (exists) {
      setRegError("Bu kullanıcı adı zaten kullanılmaktadır. Başka bir kullanıcı adı seçiniz.");
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError("Şifreniz en az 4 karakterden oluşmalıdır.");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError("Şifreler birbiriyle uyuşmuyor.");
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      password: regPassword,
      fullName: regFullName.trim(),
      phone: regPhone.trim() || undefined,
      email: regEmail.trim() || undefined,
      role: regRole,
      farmingFocus: regFarmingFocus,
      securityQuestion: regSecurityQuestion,
      securityAnswer: regSecurityAnswer.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    onRegister(newUser);
    onLogin(newUser);
    onClose();
  };

  // Handle Forgot Password Check User
  const handleForgotCheckUser = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    const target = forgotUsername.trim().toLowerCase();
    if (!target) {
      setForgotError("Lütfen kullanıcı adı veya telefon numaranızı giriniz.");
      return;
    }

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === target ||
        u.username.toLowerCase().replace(/ğ/g, "g") === target.replace(/ğ/g, "g") ||
        (u.phone && u.phone.replace(/\s+/g, "") === target.replace(/\s+/g, "")) ||
        (u.email && u.email.toLowerCase() === target)
    );

    if (user) {
      setFoundUser(user);
      setForgotStep(2);
    } else {
      setForgotError("Bu bilgilere ait kayıtlı kullanıcı bulunamadı.");
    }
  };

  // Handle Forgot Password Confirm
  const handleForgotConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!foundUser) return;

    // Check security answer if set
    if (
      foundUser.securityAnswer &&
      forgotSecurityAnswer.trim().toLowerCase() !== foundUser.securityAnswer.toLowerCase()
    ) {
      setForgotError("Güvenlik sorusu cevabı doğru değil.");
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setForgotError("Yeni şifreniz en az 4 karakter olmalıdır.");
      return;
    }

    if (forgotNewPassword !== forgotNewPasswordConfirm) {
      setForgotError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    const success = onResetPassword(foundUser.username, forgotNewPassword);
    if (success) {
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotSuccess(false);
        setMode("login");
        setLoginUsername(foundUser.username);
        setLoginPassword(forgotNewPassword);
      }, 1500);
    } else {
      setForgotError("Şifre güncellenirken bir hata oluştu.");
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      onClick={(e) => {
        if (canClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="auth-modal-card"
        className={`w-full max-w-lg rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden ${
          isDark
            ? "bg-[#0c1b14] border-emerald-800 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Brand Banner when Login is Mandatory */}
        {!canClose && (
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-950 via-[#0a2318] to-emerald-950 border-b border-emerald-800/40 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-sm tracking-wide">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>TARIM CEPTE AI</span>
            </div>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              Karadeniz Tarımsal Pazar Yeri & Bahçe Yönetim Sistemi
            </p>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Uygulamayı kullanmak için kullanıcı girişi yapınız</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark
              ? "bg-[#081510] border-emerald-900/80"
              : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                {mode === "login" && "Kullanıcı Girişi"}
                {mode === "register" && "Yeni Hesap Oluştur (Üye Ol)"}
                {mode === "forgot" && "Şifre Sıfırlama"}
              </h2>
              <p className="text-xs opacity-75">
                {mode === "login" && "Tarım Cepte hesabınıza giriş yapın"}
                {mode === "register" && "Çay veya fındık üretici profilinizi oluşturun"}
                {mode === "forgot" && "Şifrenizi güvenle yenileyin"}
              </p>
            </div>
          </div>
          {canClose ? (
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
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Giriş Zorunlu</span>
            </div>
          )}
        </div>

        {/* Tabs Switcher */}
        <div className="flex border-b border-emerald-900/30 p-2 gap-1.5 bg-black/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setLoginError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "login"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-emerald-300 hover:bg-emerald-900/40"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Giriş Yap</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setRegError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "register"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-emerald-300 hover:bg-emerald-900/40"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Üye Ol</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setForgotError("");
              setForgotStep(1);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "forgot"
                ? "bg-emerald-600 text-white shadow-xs"
                : isDark
                ? "text-emerald-300 hover:bg-emerald-900/40"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Şifre Sıfırla</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto">
          {/* =========================================================================
              1. LOGIN VIEW
             ========================================================================= */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Master Admin Fast Login Hint Card */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark
                    ? "bg-[#11271e] border-emerald-700/60 text-emerald-100"
                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-400">
                      👑 Ana Yönetici Hesabı
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      kağan
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75">
                    Tel: <strong>0543 715 52 00</strong> (veya <strong>kağan</strong>) • Şifre: <strong>tamer6715</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  Tek Tıkla Giriş
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Phone or Username Input */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Telefon Numarası veya Kullanıcı Adı</span>
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">Şifre ile Güvenli Giriş</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="05XX XXX XX XX veya Kullanıcı Adı"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 focus:border-emerald-500 text-emerald-100"
                        : "bg-gray-50 border-gray-200 focus:border-emerald-600 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-emerald-400">
                    Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setForgotUsername(loginUsername);
                    }}
                    className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Şifremi unuttum?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm transition-colors ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 focus:border-emerald-500 text-emerald-100"
                        : "bg-gray-50 border-gray-200 focus:border-emerald-600 text-gray-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400/70 hover:text-emerald-300 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs opacity-75">Hesabınız yok mu? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setRegError("");
                  }}
                  className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer ml-1"
                >
                  Hemen Üye Olun &rarr;
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              2. REGISTER VIEW (ÜYE OL + ÇAY / FINDIK / HER İKİSİ AMACI)
             ========================================================================= */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{regError}</span>
                </div>
              )}

              {/* CRITICAL USER REQUIREMENT: Tarımsal Üretim Amacı (Çay Tarımı / Fındık Tarımı / Her İkisi) */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isDark
                    ? "bg-[#0b1f16] border-emerald-700/60"
                    : "bg-emerald-50/70 border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xs">
                    🌱
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                      Uygulamayı Hangi Amaçla Kullanacaksınız? (Zorunlu)
                    </label>
                    <p className="text-[11px] opacity-75">
                      Seçiminize göre uygulamadaki alanlar otomatik filtrelenecektir.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Option 1: Çay Tarımı */}
                  <div
                    onClick={() => setRegFarmingFocus("tea")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                      regFarmingFocus === "tea"
                        ? isDark
                          ? "bg-emerald-950 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/40"
                          : "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/30"
                        : isDark
                        ? "bg-[#08150f] border-emerald-900/60 text-emerald-300/70 hover:border-emerald-700"
                        : "bg-white/60 border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
                      🍃
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center justify-center gap-1">
                        <span>Çay Tarımı</span>
                        {regFarmingFocus === "tea" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-0.5 leading-tight">
                        Yalnızca Yaş Çay Hasadı & Çaykur
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Fındık Tarımı */}
                  <div
                    onClick={() => setRegFarmingFocus("hazelnut")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                      regFarmingFocus === "hazelnut"
                        ? isDark
                          ? "bg-emerald-950 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/40"
                          : "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/30"
                        : isDark
                        ? "bg-[#08150f] border-emerald-900/60 text-emerald-300/70 hover:border-emerald-700"
                        : "bg-white/60 border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
                      🌰
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center justify-center gap-1">
                        <span>Fındık Tarımı</span>
                        {regFarmingFocus === "hazelnut" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-0.5 leading-tight">
                        Yalnızca Fındık Hasadı & TMO
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Her İkisi */}
                  <div
                    onClick={() => setRegFarmingFocus("both")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                      regFarmingFocus === "both"
                        ? isDark
                          ? "bg-emerald-950 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/40"
                          : "bg-white border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/30"
                        : isDark
                        ? "bg-[#08150f] border-emerald-900/60 text-emerald-300/70 hover:border-emerald-700"
                        : "bg-white/60 border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-base">
                      🌾
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center justify-center gap-1">
                        <span>Her İkisi</span>
                        {regFarmingFocus === "both" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-75 mt-0.5 leading-tight">
                        Hem Çay Hem Fındık Aktif
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-300/90 font-medium px-1">
                  {regFarmingFocus === "tea" && (
                    <span>
                      ℹ️ <strong>Çay Tarımı:</strong> Sistemde yalnızca Yaş Çay hasadı ve çay fabrikaları aktif olacak; fındık ile ilgili tüm alanlar gizlenecektir.
                    </span>
                  )}
                  {regFarmingFocus === "hazelnut" && (
                    <span>
                      ℹ️ <strong>Fındık Tarımı:</strong> Sistemde yalnızca Fındık hasadı ve fındık alıcıları aktif olacak; çay ile ilgili alanlar gizlenecektir.
                    </span>
                  )}
                  {regFarmingFocus === "both" && (
                    <span>
                      ℹ️ <strong>Her İkisi:</strong> Hem Yaş Çay hem de Fındık hasadı ve kayıt bölümlerinin tamamı aktif olacaktır.
                    </span>
                  )}
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-emerald-400">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="örnek: Ahmet Kavalcı"
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-emerald-400">
                    Kullanıcı Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="örnek: ahmet53"
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-emerald-300">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-emerald-300">
                    E-posta (İsteğe Bağlı)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ahmet@ornek.com"
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-emerald-400">
                    Şifre *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="En az 4 karakter"
                      className={`w-full pl-3 pr-9 py-2 rounded-xl border text-sm ${
                        isDark
                          ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-emerald-400/70"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-emerald-400">
                    Şifre Tekrarı *
                  </label>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="Şifreyi tekrar yazın"
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                      isDark
                        ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              {/* Security Question for Password Reset */}
              <div className="p-3 rounded-xl bg-black/15 border border-emerald-900/40 space-y-2">
                <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Şifre Sıfırlama Güvenlik Sorusu</span>
                </label>
                <select
                  value={regSecurityQuestion}
                  onChange={(e) => setRegSecurityQuestion(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="Doğduğunuz şehir neresidir?">Doğduğunuz şehir neresidir?</option>
                  <option value="İlk evcil hayvanınızın adı nedir?">İlk evcil hayvanınızın adı nedir?</option>
                  <option value="İlkokul öğretmeninizin adı nedir?">İlkokul öğretmeninizin adı nedir?</option>
                  <option value="En sevdiğiniz Karadeniz yaylası hangisidir?">En sevdiğiniz Karadeniz yaylası hangisidir?</option>
                </select>
                <input
                  type="text"
                  required
                  value={regSecurityAnswer}
                  onChange={(e) => setRegSecurityAnswer(e.target.value)}
                  placeholder="Güvenlik sorusu cevabınız (Şifrenizi unutursanız istenir)"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Hesabı Oluştur ve Giriş Yap</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-xs opacity-75">Zaten hesabınız var mı? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setLoginError("");
                  }}
                  className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer ml-1"
                >
                  Giriş Yapın &rarr;
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              3. FORGOT PASSWORD VIEW (ŞİFRE SIFIRLAMA)
             ========================================================================= */}
          {mode === "forgot" && (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm">Şifreniz Başarıyla Sıfırlandı!</div>
                  <p className="text-xs opacity-80">Giriş ekranına yönlendiriliyorsunuz...</p>
                </div>
              ) : forgotStep === 1 ? (
                <form onSubmit={handleForgotCheckUser} className="space-y-4">
                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-emerald-400">
                      Kullanıcı Adı veya Telefon Numarası
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      placeholder="örnek: kağan veya 0532..."
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm ${
                        isDark
                          ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Kullanıcıyı Doğrula</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                    >
                      &larr; Giriş Ekranına Dön
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotConfirm} className="space-y-4">
                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-bold text-emerald-400">
                      Hesap: {foundUser?.fullName} (@{foundUser?.username})
                    </div>
                    {foundUser?.securityQuestion ? (
                      <div className="opacity-80">
                        Güvenlik Sorusu: <strong>{foundUser.securityQuestion}</strong>
                      </div>
                    ) : (
                      <div className="opacity-80">Ana Yönetici ve Doğrulanmış Hesap</div>
                    )}
                  </div>

                  {foundUser?.securityQuestion && (
                    <div>
                      <label className="block text-xs font-bold mb-1 text-emerald-400">
                        Güvenlik Sorusu Cevabınız
                      </label>
                      <input
                        type="text"
                        required
                        value={forgotSecurityAnswer}
                        onChange={(e) => setForgotSecurityAnswer(e.target.value)}
                        placeholder="Cevabınızı yazınız"
                        className={`w-full px-3 py-2 rounded-xl border text-sm ${
                          isDark
                            ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-900"
                        }`}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-1 text-emerald-400">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Yeni şifrenizi girin"
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
                      type="password"
                      required
                      value={forgotNewPasswordConfirm}
                      onChange={(e) => setForgotNewPasswordConfirm(e.target.value)}
                      placeholder="Yeni şifreyi tekrar yazın"
                      className={`w-full px-3 py-2 rounded-xl border text-sm ${
                        isDark
                          ? "bg-[#07130e] border-emerald-900/80 text-emerald-100"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-gray-600 text-xs font-bold hover:bg-white/10 cursor-pointer"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                    >
                      Şifreyi Sıfırla ve Kaydet
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
