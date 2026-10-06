import React, { useState } from "react";
import { X, ShieldCheck, Lock, Trash2, CheckCircle2, AlertTriangle, Database } from "lucide-react";

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWipeData: () => void;
  isDark: boolean;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  onWipeData,
  isDark,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleWipe = () => {
    onWipeData();
    setIsConfirming(false);
    onClose();
  };

  return (
    <div
      id="privacy-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="privacy-modal-card"
        className={`w-full max-w-lg rounded-2xl shadow-2xl border my-8 transition-all overflow-hidden ${
          isDark ? "bg-[#0f2119] border-emerald-800 text-emerald-50" : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? "bg-[#0b1a13] border-emerald-800/60" : "bg-emerald-50/70 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">Gizlilik & Veri Güvenliği</h3>
              <p className="text-[11px] opacity-70">
                Tarım Cepte AI - Şeffaflık Taahhüdü
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Encryption Badge */}
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-200">Uçtan Uca Şifreli & Yerel Depolama</div>
              <p className="text-[11px] opacity-90 mt-0.5">
                Tarım kayıtlarınız, kantar fişleriniz ve ücret bilgileriniz üçüncü taraflarla paylaşılmaz.
              </p>
            </div>
          </div>

          {/* Processed Data Types List */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">
              Sistemde İşlenen Veriler ve Şeffaflık:
            </div>
            <p className="text-[11px] opacity-85 leading-relaxed">
              Uygulamamız yalnızca tarımsal pazar yeri ve bahçe yönetimi süreçlerinin yürütülmesi amacıyla aşağıdaki verileri işlemektedir:
            </p>
            <ul className="space-y-2 text-[11px] opacity-90 pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ad-Soyad ve Telefon Numarası:</strong> İşveren ve işçi doğrudan doğrulanmış iletişim için kullanılır.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Şehir / İlçe Düzeyinde Konum:</strong> Bahçe lokasyonu ve bölgesel iş eşleştirmeleri için (Rize, Trabzon, Giresun, Ordu, Artvin).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Mesleki Deneyim & Beceriler:</strong> Makas, tırpan, çuval taşıma, budama ve ekip yönetimi yetkinlikleri.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Bahçe & Hasat Kayıtları:</strong> Dönüm, ürün türü, teslimat ve kantar fişi verileri.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Uygulama İçi Sohbet ve Asistan Kayıtları:</strong> Tarım Cepte AI ile yapılan zirai danışma ve mesajlaşma günlükleri.</span>
              </li>
            </ul>
          </div>

          {/* Wipe Data Section */}
          <div className="pt-3 border-t border-emerald-800/40 space-y-2">
            <div className="font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Veri Silme ve Gizlilik Güvencesi</span>
            </div>
            <p className="text-[11px] opacity-75 leading-relaxed">
              Tüm verileriniz şifrelenir ve güvenle korunur. Dilediğiniz an tüm profil ve kullanım verilerinizi kalıcı olarak silebilirsiniz.
            </p>
            {!isConfirming ? (
              <button
                type="button"
                onClick={() => setIsConfirming(true)}
                className="w-full py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-red-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hesap Ayarları: Tüm Verilerimi Kalıcı Olarak Sil</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 space-y-2.5 animate-in fade-in">
                <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>DİKKAT: Cihazdaki tüm veriler kalıcı olarak silinecektir!</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={handleWipe}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Silmeyi Onayla ve Sıfırla</span>
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
