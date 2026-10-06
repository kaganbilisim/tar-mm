import React, { useState, useEffect } from "react";
import { Garden } from "../types";
import {
  Trees,
  X,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Navigation,
  Compass,
} from "lucide-react";
import { MapLocationPickerModal } from "./MapLocationPickerModal";

interface EditGardenModalProps {
  isOpen: boolean;
  garden: Garden | null;
  onClose: () => void;
  onSaveGarden: (updated: Garden) => void;
  isDark: boolean;
}

export const EditGardenModal: React.FC<EditGardenModalProps> = ({
  isOpen,
  garden,
  onClose,
  onSaveGarden,
  isDark,
}) => {
  const [name, setName] = useState("");
  const [cropType, setCropType] = useState<"tea" | "hazelnut">("tea");
  const [sizeDecares, setSizeDecares] = useState("");
  const [location, setLocation] = useState("");
  const [adaNo, setAdaNo] = useState("");
  const [parselNo, setParselNo] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | undefined>();
  const [bushesCount, setBushesCount] = useState("");
  const [notes, setNotes] = useState("");
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  useEffect(() => {
    if (garden) {
      setName(garden.name || "");
      setCropType(garden.cropType || "tea");
      setSizeDecares(garden.sizeDecares ? String(garden.sizeDecares) : "");
      setLocation(garden.location || "");
      setAdaNo(garden.adaNo || "");
      setParselNo(garden.parselNo || "");
      setLatitude(garden.latitude);
      setLongitude(garden.longitude);
      setGoogleMapsUrl(garden.googleMapsUrl);
      setBushesCount(garden.bushesCount ? String(garden.bushesCount) : "");
      setNotes(garden.notes || "");
    }
  }, [garden, isOpen]);

  if (!isOpen || !garden) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Lütfen bahçe veya parsel adını giriniz.");
      return;
    }

    const updated: Garden = {
      ...garden,
      name: name.trim(),
      cropType,
      sizeDecares: parseFloat(sizeDecares) || garden.sizeDecares || 1,
      location: location.trim() || garden.location,
      adaNo: adaNo.trim() || undefined,
      parselNo: parselNo.trim() || undefined,
      latitude,
      longitude,
      googleMapsUrl:
        googleMapsUrl ||
        (latitude && longitude
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : undefined),
      bushesCount: parseInt(bushesCount, 10) || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveGarden(updated);
    onClose();
  };

  const handleLocationPicked = (data: {
    locationText: string;
    latitude: number;
    longitude: number;
    googleMapsUrl: string;
    adaNo?: string;
    parselNo?: string;
  }) => {
    setLocation(data.locationText);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setGoogleMapsUrl(data.googleMapsUrl);
    if (data.adaNo) setAdaNo(data.adaNo);
    if (data.parselNo) setParselNo(data.parselNo);
  };

  return (
    <>
      <div
        id="edit-garden-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      >
        <div
          id="edit-garden-card"
          className={`w-full max-w-lg rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden flex flex-col ${
            isDark
              ? "bg-[#0b1c15] border-emerald-800/80 text-emerald-50"
              : "bg-white border-emerald-200 text-gray-900"
          }`}
        >
          {/* Header */}
          <div
            className={`p-3.5 sm:p-4 border-b flex items-center justify-between ${
              isDark ? "bg-[#081510] border-emerald-800/60" : "bg-emerald-50 border-emerald-100"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Trees className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base">Bahçe / Parsel Bilgilerini Düzenle</h3>
                <p className="text-[11px] opacity-70">
                  Kayıtlı bahçenin konumu, büyüklüğü ve ada/parsel detayları
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs overflow-y-auto max-h-[80vh]">
            {/* Bahçe Adı */}
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                Bahçe / Parsel Adı *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Çayeli Kaptanpaşa Yamaç Çaylığı"
                className={`w-full px-3 py-2 rounded-lg border text-xs ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Ürün Türü & Büyüklük */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Ürün Türü</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as "tea" | "hazelnut")}
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="tea">🌱 Yaş Çay</option>
                  <option value="hazelnut">🌰 Fındık</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">
                  Büyüklük (Dönüm / Dekar) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={sizeDecares}
                  onChange={(e) => setSizeDecares(e.target.value)}
                  placeholder="Örn: 6.5"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>

            {/* Konum & Harita Entegrasyonu */}
            <div
              className={`p-3 rounded-xl border space-y-2.5 ${
                isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-emerald-50/50 border-emerald-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="font-bold text-[11px] text-teal-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Konum ve Harita Bilgileri
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Haritadan Seç / Güncelle
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Örn: Rize / Çayeli - Kaptanpaşa Köyü"
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Ada / Parsel / Koordinat Özeti */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] opacity-75 block">Ada No</span>
                  <input
                    type="text"
                    value={adaNo}
                    onChange={(e) => setAdaNo(e.target.value)}
                    placeholder="Örn: 104"
                    className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                      isDark
                        ? "bg-[#142920] border-emerald-800 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-[10px] opacity-75 block">Parsel No</span>
                  <input
                    type="text"
                    value={parselNo}
                    onChange={(e) => setParselNo(e.target.value)}
                    placeholder="Örn: 12"
                    className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                      isDark
                        ? "bg-[#142920] border-emerald-800 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] opacity-75 block">Harita Durumu</span>
                  {latitude && longitude ? (
                    <a
                      href={googleMapsUrl || `https://www.google.com/maps?q=${latitude},${longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium mt-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Haritalar
                    </a>
                  ) : (
                    <span className="text-[11px] opacity-50 block mt-1.5">Pini Yok</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ocak / Kök Sayısı */}
            <div>
              <label className="block text-[11px] font-semibold mb-1">
                {cropType === "tea" ? "Çay Ocağı / Kök Sayısı" : "Fındık Ocağı Sayısı"} (Opsiyonel)
              </label>
              <input
                type="number"
                value={bushesCount}
                onChange={(e) => setBushesCount(e.target.value)}
                placeholder="Örn: 3200"
                className={`w-full px-3 py-2 rounded-lg border text-xs ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Notlar */}
            <div>
              <label className="block text-[11px] font-semibold mb-1">Notlar / Parsel Detayı</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Dik yamaç arazisi, yolun hemen üstünde..."
                className={`w-full px-3 py-2 rounded-lg border text-xs ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl border font-semibold cursor-pointer transition-colors ${
                  isDark
                    ? "border-emerald-800 text-emerald-300 hover:bg-emerald-900/40"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Harita Seçim Modalı */}
      {isMapPickerOpen && (
        <MapLocationPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          initialLat={latitude}
          initialLng={longitude}
          initialLocationText={location}
          initialAdaNo={adaNo}
          initialParselNo={parselNo}
          isDark={isDark}
          onSelectLocation={handleLocationPicked}
        />
      )}
    </>
  );
};
