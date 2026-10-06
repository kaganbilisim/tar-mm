import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  isDark: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Silme İşlemini Onaylayın",
  itemName,
  description = "Bu işlem geri alınamaz. Kaydı kalıcı olarak silmek istediğinizden emin misiniz?",
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-delete-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="confirm-delete-card"
        className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 transition-all ${
          isDark
            ? "bg-[#11241c] border-red-900/60 text-emerald-50"
            : "bg-white border-red-200 text-gray-900"
        }`}
      >
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm md:text-base text-red-400">
              {title}
            </h3>
            {itemName && (
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-lg inline-block ${
                  isDark ? "bg-black/30 text-emerald-200" : "bg-gray-100 text-gray-800"
                }`}
              >
                "{itemName}"
              </div>
            )}
            <p className="text-xs opacity-80 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-red-900/30">
          <button
            onClick={onClose}
            type="button"
            className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              isDark
                ? "border-emerald-800 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Vazgeç
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Evet, Sil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
