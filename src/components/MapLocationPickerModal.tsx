import React, { useState, useEffect } from "react";
import {
  MapPin,
  X,
  Navigation,
  ExternalLink,
  Search,
  Compass,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface MapLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialLocationText?: string;
  initialAdaNo?: string;
  initialParselNo?: string;
  isDark: boolean;
  onSelectLocation: (data: {
    locationText: string;
    latitude: number;
    longitude: number;
    googleMapsUrl: string;
    adaNo?: string;
    parselNo?: string;
  }) => void;
}

// Karadeniz Bölgesi Hızlı Seçim Noktaları
const QUICK_LOCATIONS = [
  { name: "Rize / Çayeli - Kaptanpaşa", lat: 40.9984, lng: 40.7512 },
  { name: "Rize / Merkez - Gündoğdu", lat: 41.0421, lng: 40.5732 },
  { name: "Rize / Pazar - Kirazlık", lat: 41.1764, lng: 40.8845 },
  { name: "Rize / Ardeşen - Tunca", lat: 41.1895, lng: 41.0124 },
  { name: "Rize / Fındıklı - Çağlayan", lat: 41.2584, lng: 41.1425 },
  { name: "Rize / Güneysu - Ortaköy", lat: 40.9854, lng: 40.6124 },
  { name: "Trabzon / Of - Kıyıcık", lat: 40.9412, lng: 40.2867 },
  { name: "Trabzon / Sürmene - Köprübaşı", lat: 40.9125, lng: 40.1245 },
  { name: "Artvin / Hopa - Kemalpaşa", lat: 41.4254, lng: 41.4682 },
  { name: "Artvin / Arhavi - Dikyamaç", lat: 41.3452, lng: 41.3125 },
  { name: "Giresun / Tirebolu - Doğankent", lat: 40.9856, lng: 38.8241 },
  { name: "Ordu / Fatsa - Ilıca", lat: 41.0284, lng: 37.4985 },
];

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialLocationText,
  initialAdaNo,
  initialParselNo,
  isDark,
  onSelectLocation,
}) => {
  const [lat, setLat] = useState<number>(initialLat || 41.0254);
  const [lng, setLng] = useState<number>(initialLng || 40.5284);
  const [locationName, setLocationName] = useState<string>(
    initialLocationText || "Rize / Çayeli"
  );
  const [adaNo, setAdaNo] = useState<string>(initialAdaNo || "");
  const [parselNo, setParselNo] = useState<string>(initialParselNo || "");
  const [pastedInput, setPastedInput] = useState<string>("");
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialLat) setLat(initialLat);
    if (initialLng) setLng(initialLng);
    if (initialLocationText) setLocationName(initialLocationText);
    if (initialAdaNo) setAdaNo(initialAdaNo);
    if (initialParselNo) setParselNo(initialParselNo);
  }, [initialLat, initialLng, initialLocationText, initialAdaNo, initialParselNo, isOpen]);

  if (!isOpen) return null;

  // Google Maps linki
  const googleMapsLink = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

  // OpenStreetMap embed bbox (çevresi)
  const delta = 0.008;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  // Mevcut GPS Konumunu Al
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Cihazınızda konum servisi desteklenmiyor.");
      return;
    }

    setIsGettingGps(true);
    setGpsError(null);
    setGpsSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        setLat(userLat);
        setLng(userLng);
        setIsGettingGps(false);
        setGpsSuccess(
          `✓ Mevcut GPS konumunuz alındı (Hassasiyet: ±${Math.round(pos.coords.accuracy)}m)`
        );

        // Yakındaki Karadeniz ilçesi ile eşleştirmeyi dene
        const nearest = QUICK_LOCATIONS.reduce((prev, curr) => {
          const distPrev = Math.hypot(prev.lat - userLat, prev.lng - userLng);
          const distCurr = Math.hypot(curr.lat - userLat, curr.lng - userLng);
          return distCurr < distPrev ? curr : prev;
        }, QUICK_LOCATIONS[0]);

        if (nearest) {
          setLocationName((prev) =>
            prev && prev !== "Rize / Çayeli" ? prev : `${nearest.name} (GPS Tarlası)`
          );
        }
      },
      (err) => {
        setIsGettingGps(false);
        setGpsError(`Konum alınamadı: ${err.message}. Lütfen manuel koordinat girin.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Google Haritalar Koordinatı veya Linki Yapıştırma Ayrıştırıcı
  const handleParsePastedInput = () => {
    if (!pastedInput.trim()) return;

    const input = pastedInput.trim();

    // 1. Durum: 41.0254, 40.5284 formatı
    const coordMatch = input.match(/([-+]?\d{1,2}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)/);
    if (coordMatch) {
      const parsedLat = parseFloat(coordMatch[1]);
      const parsedLng = parseFloat(coordMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLat(Number(parsedLat.toFixed(6)));
        setLng(Number(parsedLng.toFixed(6)));
        setGpsSuccess("✓ Google Haritalar koordinatları başarıyla yüklendi.");
        setGpsError(null);
        setPastedInput("");
        return;
      }
    }

    // 2. Durum: Google Maps @lat,lng linki
    const urlMatch = input.match(/@([-+]?\d{1,2}\.\d+),([-+]?\d{1,3}\.\d+)/);
    if (urlMatch) {
      const parsedLat = parseFloat(urlMatch[1]);
      const parsedLng = parseFloat(urlMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLat(Number(parsedLat.toFixed(6)));
        setLng(Number(parsedLng.toFixed(6)));
        setGpsSuccess("✓ Google Haritalar bağlantısından koordinat ayrıştırıldı.");
        setGpsError(null);
        setPastedInput("");
        return;
      }
    }

    setGpsError("Koordinat ayrıştırılamadı. Lütfen '41.0254, 40.5284' şeklinde veya geçerli bir Google Maps bağlantısı girin.");
  };

  // Haritada yön tuşlarıyla veya tıklama simülasyonuyla ince ayar yapma
  const adjustCoordinates = (dLat: number, dLng: number) => {
    setLat((prev) => Number((prev + dLat).toFixed(6)));
    setLng((prev) => Number((prev + dLng).toFixed(6)));
  };

  // Tamamla ve Form'a Aktar
  const handleConfirm = () => {
    if (!locationName.trim()) {
      alert("Lütfen bahçe veya mahalle konum adını girin.");
      return;
    }

    onSelectLocation({
      locationText: locationName.trim(),
      latitude: lat,
      longitude: lng,
      googleMapsUrl: googleMapsLink,
      adaNo: adaNo.trim() || undefined,
      parselNo: parselNo.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="map-picker-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        id="map-picker-card"
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border my-6 transition-all overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? "bg-[#0b1c15] border-emerald-800/80 text-emerald-50"
            : "bg-white border-emerald-200 text-gray-900"
        }`}
      >
        {/* Modal Başlığı */}
        <div
          className={`p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-800/60" : "bg-emerald-50 border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                <span>Google Haritalar & Konum Seçici</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  Parsel Koordinatı
                </span>
              </h3>
              <p className="text-[11px] opacity-75">
                Bahçenizin yerini haritada belirleyin veya Google Maps bağlantısı yapıştırın
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

        {/* Modal Gövdesi */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Hızlı Konum & GPS Aksiyon Barı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. GPS Konumu Butonu */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingGps}
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isDark
                  ? "bg-emerald-900/40 hover:bg-emerald-800/60 border-emerald-700 text-emerald-200"
                  : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
              }`}
            >
              <Navigation className={`w-4 h-4 text-emerald-400 ${isGettingGps ? "animate-spin" : ""}`} />
              <span>{isGettingGps ? "Konum Alınıyor..." : "Mevcut Tarlamın GPS Konumunu Al"}</span>
            </button>

            {/* 2. Google Maps'te Canlı Aç */}
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                isDark
                  ? "bg-blue-950/30 hover:bg-blue-900/40 border-blue-800/60 text-blue-300"
                  : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              }`}
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Google Haritalar'da Canlı Görüntüle</span>
            </a>
          </div>

          {/* Geri Bildirim Mesajları */}
          {gpsSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{gpsSuccess}</span>
            </div>
          )}
          {gpsError && (
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Google Maps / Koordinat Yapıştırma Alanı */}
          <div
            className={`p-3 rounded-xl border space-y-2 ${
              isDark ? "bg-[#10241c] border-emerald-900/80" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="font-bold text-[11px] text-emerald-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Google Haritalar Linki veya Koordinat Yapıştır
              </label>
              <span className="text-[10px] opacity-60">Örn: 41.0254, 40.5284</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={pastedInput}
                onChange={(e) => setPastedInput(e.target.value)}
                placeholder="Google Maps'ten kopyalanan koordinat veya bağlantıyı yapıştırın..."
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
                  isDark
                    ? "bg-[#142920] border-emerald-800 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <button
                type="button"
                onClick={handleParsePastedInput}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
              >
                Uygula
              </button>
            </div>
          </div>

          {/* İnteraktif Harita Önizleme Çerçevesi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Harita Önizlemesi & Parsel Konumu</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 bg-black/40 px-2 py-0.5 rounded border border-emerald-900">
                  {lat.toFixed(6)}, {lng.toFixed(6)}
                </span>
              </div>
            </div>

            {/* Embed OSM Tile Frame with pin */}
            <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-emerald-800/80 shadow-inner bg-black/30">
              <iframe
                title="Parsel Haritası"
                src={mapEmbedUrl}
                className="w-full h-full border-0 filter contrast-105"
                loading="lazy"
              />

              {/* Pin Overlay Badge */}
              <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md border border-emerald-600/60 text-emerald-200 px-2.5 py-1.5 rounded-lg text-[10px] shadow-lg flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">{locationName || "Seçili Parsel"}</span>
              </div>

              {/* İnce Ayar Koordinat Butonları (Pusula) */}
              <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-emerald-800/80 shadow-md">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => adjustCoordinates(0.001, 0)}
                    className="w-6 h-6 rounded bg-emerald-900/80 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                    title="Kuzeye Kaydır"
                  >
                    ↑
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => adjustCoordinates(0, -0.001)}
                    className="w-6 h-6 rounded bg-emerald-900/80 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                    title="Batıya Kaydır"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCoordinates(0, 0.001)}
                    className="w-6 h-6 rounded bg-emerald-900/80 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                    title="Doğuya Kaydır"
                  >
                    →
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => adjustCoordinates(-0.001, 0)}
                    className="w-6 h-6 rounded bg-emerald-900/80 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                    title="Güneye Kaydır"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Karadeniz İlçe / Bölge Seçimleri */}
          <div className="space-y-1.5">
            <span className="font-semibold text-[11px] text-teal-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Hızlı Bölge Seçimi (Karadeniz Çay & Fındık Havzası)
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {QUICK_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLat(loc.lat);
                    setLng(loc.lng);
                    setLocationName(loc.name);
                    setGpsSuccess(`✓ ${loc.name} konumu seçildi.`);
                  }}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-medium transition-colors cursor-pointer ${
                    Math.abs(lat - loc.lat) < 0.005 && Math.abs(lng - loc.lng) < 0.005
                      ? "bg-teal-600 text-white border-teal-500 font-bold"
                      : isDark
                      ? "bg-[#142920] border-emerald-900 text-emerald-200 hover:bg-emerald-800/50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Parsel ve Ada Bilgileri (Kadastro / Manuel Giriş) */}
          <div
            className={`p-3.5 rounded-xl border space-y-3 ${
              isDark ? "bg-[#10241c] border-emerald-900/60" : "bg-emerald-50/50 border-emerald-100"
            }`}
          >
            <div className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Parsel & Adres Tanımları
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold mb-1">
                  Konum Adı (İl / İlçe - Köy veya Mahalle) *
                </label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Örn: Rize / Çayeli - Kaptanpaşa Köyü"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Ada Numarası</label>
                <input
                  type="text"
                  value={adaNo}
                  onChange={(e) => setAdaNo(e.target.value)}
                  placeholder="Örn: 104"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Parsel Numarası</label>
                <input
                  type="text"
                  value={parselNo}
                  onChange={(e) => setParselNo(e.target.value)}
                  placeholder="Örn: 12"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                    isDark
                      ? "bg-[#142920] border-emerald-800 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">Koordinatlar</label>
                <div
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono truncate ${
                    isDark ? "bg-[#142920] border-emerald-800 text-emerald-300" : "bg-gray-100 border-gray-200"
                  }`}
                >
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Alt Butonları */}
        <div
          className={`p-3 sm:p-4 border-t flex items-center justify-end gap-2 shrink-0 ${
            isDark ? "bg-[#081510] border-emerald-800/60" : "bg-gray-50 border-gray-200"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              isDark
                ? "border-emerald-800 text-emerald-300 hover:bg-emerald-900/40"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Seçilen Konumu Bahçeye Aktar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
