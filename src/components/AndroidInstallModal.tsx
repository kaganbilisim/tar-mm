import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Wifi,
  MapPin,
  Bell,
  HardDrive,
  X,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
} from "lucide-react";

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const { isInstallable, isInstalled, install, isAndroid } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div
      id="android-install-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="android-install-card"
        className={`w-full max-w-lg rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? "bg-[#0b1c15] border-emerald-800 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-900/60" : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-950/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <span>Tarım Cepte Android Uygulaması</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  v2.4.0
                </span>
              </h3>
              <p className="text-[11px] opacity-75">
                APK, PWA ve TWA Android Yerel Çalışma Merkezi
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Durum Banner'ı */}
          {isInstalled ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-xs">Android Uygulaması Başarıyla Yüklü!</div>
                <div className="text-[11px] opacity-80">
                  Uygulama telefonunuzun ana ekranında ve uygulama çekmecesinde bağımsız olarak çalışmaktadır.
                </div>
              </div>
            </div>
          ) : installSuccess ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center gap-3 text-emerald-300 animate-pulse">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-xs">Yükleme Başlatıldı!</div>
                <div className="text-[11px] opacity-80">
                  Tarım Cepte telefonunuza ekleniyor. Birkaç saniye içinde ana ekranınızda belirecektir.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-emerald-950/60 border border-emerald-700/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Tek Dokunuşla Telefona Yükle</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 font-semibold">
                  Android APK / PWA
                </span>
              </div>
              <p className="text-[11px] opacity-85 text-emerald-100">
                Tarım Cepte uygulamasını Android telefonunuza yükleyerek tarayıcı çubuğu olmadan tam ekran ve sıfır gecikmeyle kullanın.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Doğrudan APK İndir */}
                <a
                  href="/TarimCepte.apk"
                  download="TarimCepte.apk"
                  className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/60 transition-transform active:scale-98 border border-emerald-400/40 text-center no-underline"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>TarimCepte.apk İndir (v2.4.0)</span>
                </a>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-[#06140f] font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/60 transition-transform active:scale-98"
                  >
                    <Smartphone className="w-4 h-4 stroke-[2.5]" />
                    <span>Ana Ekrana Ekle</span>
                  </button>
                ) : (
                  <a
                    href="/apk"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3.5 rounded-xl bg-black/40 hover:bg-black/60 text-emerald-200 border border-emerald-700/60 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors text-center no-underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>APK İndirme Sayfası</span>
                  </a>
                )}
              </div>

              {!isInstallable && (
                <div className="text-[11px] p-2.5 rounded-lg bg-black/30 border border-emerald-800/40 space-y-1.5 text-emerald-200">
                  <div className="font-bold flex items-center gap-1.5 text-teal-300">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Android Chrome / Samsung İnternet Kurulum Adımları:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] opacity-90 pl-1">
                    <li>Yukarıdaki <strong>"TarimCepte.apk İndir"</strong> butonuna dokunarak doğrudan APK'yı kurabilir veya,</li>
                    <li>Tarayıcınızın sağ üstündeki <strong>üç nokta (⋮)</strong> menüsünden <strong>"Uygulamayı Yükle"</strong> seçeneğini seçebilirsiniz.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Android Yerel Yetenekler & Avantajlar */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Android Yerel Yetenekler ve Özellikler</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[11px]">Çevrimdışı (Offline) Çalışma</div>
                  <div className="text-[10px] opacity-70">
                    Çaylık ve fındıklık vadilerinde internet çekmese dahi kayıtlarınız çalışmaya devam eder.
                  </div>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HardDrive className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[11px]">Yerel Güvenli Bellek</div>
                  <div className="text-[10px] opacity-70">
                    Tüm bahçe, hasat, tahsilat ve kullanıcı verileriniz cihazınızda şifreli olarak saklanır.
                  </div>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[11px]">Google Haritalar & GPS</div>
                  <div className="text-[10px] opacity-70">
                    Parsel konumu, uydu haritası ve ada/parsel koordinat kaydı tek tuşla GPS ile alınır.
                  </div>
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                  isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[11px]">Android Geri Tuşu & Bildirim</div>
                  <div className="text-[10px] opacity-70">
                    Telefonunuzun donanım/hareket geri tuşu modalları ve pencereleri doğal olarak yönetir.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kurulum Sorun Giderme Rehberi */}
          <div
            className={`p-3 rounded-xl border text-[11px] space-y-2 ${
              isDark ? "bg-amber-950/20 border-amber-800/40 text-amber-200" : "bg-amber-50 border-amber-300 text-amber-950"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Uygulama Kurulmuyorsa Çözüm Adımları:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[10.5px] opacity-95">
              <li>
                <strong>"Paket ayrıştırılamadı" hatası:</strong> Tarayıcınızın (Chrome / Samsung Internet) sağ üstündeki <strong>üç nokta (⋮)</strong> menüsünden <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğini kullanın. Bu yöntem Google Play entegrasyonuyla WebAPK oluşturarak tüm Android telefonlara anında sorunsuz kurulur.
              </li>
              <li>
                <strong>"Bilinmeyen kaynaklar engellendi":</strong> İndirilen APK'yı açmak için: <em>Telefon Ayarları &gt; Uygulamalar &gt; Chrome &gt; Bilinmeyen uygulamaları yükle &gt; İzin ver</em> adımlarını uygulayın.
              </li>
              <li>
                <strong>"Play Protect engelledi":</strong> Google Play Protect uyarı ekranında <strong>"Ayrıntılar &gt; Yine de Yükle"</strong> seçeneğine dokunun.
              </li>
            </ul>
          </div>

          {/* Teknik Paket & Kimlik Bilgileri */}
          <div
            className={`p-3 rounded-xl border text-[11px] space-y-2 ${
              isDark ? "bg-black/30 border-emerald-900/50" : "bg-emerald-50/60 border-emerald-200"
            }`}
          >
            <div className="font-bold text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Android Paket Kimliği & Uyumluluk</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] opacity-85">
              <div>
                <span className="opacity-60 block">Paket Kimliği (App ID):</span>
                <span className="font-mono font-bold text-emerald-300">com.tarimcepte.app</span>
              </div>
              <div>
                <span className="opacity-60 block">Hedef Sistem:</span>
                <span className="font-bold">Android 8.0+ (Oreo - 15)</span>
              </div>
              <div>
                <span className="opacity-60 block">Paket Türü:</span>
                <span className="font-bold">WebAPK / TWA / Capacitor</span>
              </div>
              <div>
                <span className="opacity-60 block">Aktif Sezon:</span>
                <span className="font-bold text-emerald-400">2026 Çay & Fındık</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3.5 border-t flex items-center justify-between shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-800/60" : "bg-gray-50 border-gray-200"
          }`}
        >
          <span className="text-[10px] opacity-60">
            {isAndroid ? "📱 Android Cihaz Algılandı" : "💻 Web / Android Uyumluluğu Aktif"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
