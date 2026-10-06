import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Smartphone, Download, CheckCircle2 } from "lucide-react";

interface PWAInstallButtonProps {
  isDark?: boolean;
  variant?: "header" | "card" | "banner";
  onOpenModal?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  isDark = true,
  variant = "header",
  onOpenModal,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [justInstalled, setJustInstalled] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setJustInstalled(true);
        return;
      }
    }
    if (onOpenModal) {
      onOpenModal();
    }
  };

  if (isInstalled && !justInstalled) {
    if (variant === "header") {
      return (
        <span
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
          title="Tarım Cepte Android Uygulaması Olarak Çalışıyor"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Android v2.4</span>
        </span>
      );
    }
    return (
      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Android Uygulaması Olarak Yüklü</span>
        </div>
        <span className="text-[10px] opacity-75">v2.4.0 (2026 Sezonu)</span>
      </div>
    );
  }

  if (variant === "header") {
    return (
      <button
        id="btn-android-install-header"
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[#06140f] font-black text-xs transition-all cursor-pointer shadow-md shadow-emerald-950/40 border border-emerald-300/60 shrink-0 active:scale-95"
        title="Tarım Cepte Android Uygulamasını Telefona Yükle"
      >
        <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="hidden sm:inline">Android'e Yükle</span>
        <span className="sm:hidden">Android</span>
      </button>
    );
  }

  // variant === "card"
  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        isDark
          ? "bg-gradient-to-r from-[#10241c] to-[#122e23] hover:from-[#143025] hover:to-[#17382b] border-emerald-500/40 text-emerald-100 shadow-sm"
          : "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-300 text-gray-900 shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold flex items-center gap-2">
            <span>Android Uygulaması (APK / PWA)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-400/30">
              Yükle
            </span>
          </div>
          <div className="text-[11px] opacity-75">
            Telefona tek tıkla kurun, tam ekran ve internetsiz arazide kesintisiz kullanın
          </div>
        </div>
      </div>
      <Download className="w-4 h-4 text-emerald-400 opacity-80" />
    </div>
  );
};
