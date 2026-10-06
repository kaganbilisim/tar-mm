# Tarım Cepte – Native Android (Kotlin & Jetpack Compose) Mimarisi

Bu dizin, **Tarım Cepte** uygulamasının resmi, modern ve kurumsal **Native Android** kaynak kodunu içerir.

## 🛠️ Teknik Standartlar ve Mimari
- **Dil:** Kotlin 2.1.0
- **UI Toolkit:** Jetpack Compose & Material 3 (Forest Emerald & Soil Brown tema)
- **Mimari:** Clean Architecture + Feature-based Modular Pattern (MVVM)
- **Dependency Injection:** Dagger Hilt 2.55
- **Asenkron Programlama:** Kotlin Coroutines & Flow
- **Yerel Veritabanı:** Room Database 2.6.1 (ACID garantili, tip güvenli çevrimdışı önbellekleme)
- **Kullanıcı Ayarları & Güvenlik:** DataStore Preferences + Android Keystore EncryptedSharedPreferences
- **Ağ:** Retrofit 2.11 + OkHttp 4.12 + KotlinX Serialization
- **Arka Plan Eşitleme:** WorkManager (`SyncWorker`)
- **Minimum SDK:** 24 (Android 7.0+) | **Hedef SDK:** 35 (Android 15)

---

## 📂 Klasör ve Paket Yapısı
```
android/app/src/main/
├── AndroidManifest.xml
├── java/com/tarimcepte/app/
│   ├── TarimCepteApplication.kt    # Hilt App & Bildirim Kanalları
│   ├── MainActivity.kt             # Single-Activity + Edge-to-Edge
│   ├── navigation/                 # Navigation Compose Rotaları
│   ├── core/
│   │   ├── designsystem/           # Color, Theme, Type, TarimButton, EmptyState
│   │   ├── model/                  # Domain veri modelleri (Harvest, Garden, JobListing vb.)
│   │   ├── database/               # Room Entities, DAOs ve Database
│   │   ├── repository/             # Repository Pattern (Harvest, Job, Auth)
│   │   ├── sync/                   # WorkManager SyncWorker
│   │   └── di/                     # Dagger Hilt modülleri
│   └── feature/
│       ├── home/                   # Ana Sayfa, KPI Kartları
│       ├── harvest/                # Hasat Ekleme, Otomatik Kesinti, Fiş OCR
│       ├── receivables/            # Vadeli Alacaklar & Tahsilat
│       ├── marketplace/            # Pazar Yeri (6 zorunlu alanlı ilanlar, arama)
│       └── assistant/              # Gemini AI Karadeniz Ziraat Asistanı
```

---

## 🚀 Derleme ve Çalıştırma Komutları

### 1. Debug APK Oluşturma
```bash
./gradlew assembleDebug
```
Üretilen APK: `app/build/outputs/apk/debug/app-debug.apk`

### 2. Google Play Store İçin Release App Bundle (AAB) Oluşturma
```bash
./gradlew bundleRelease
```
Üretilen AAB: `app/build/outputs/bundle/release/app-release.aab`

### 3. Birim Testleri Çalıştırma
```bash
./gradlew test
```
- `JobValidationTest`: 6 zorunlu alan ve "ücret görüşülür" yasağını doğrular.
- `DeductionCalculationTest`: %2 borsa/stopaj kesintisi hesaplamasını doğrular.

---

## 🔒 Güvenlik & Gizlilik
- API anahtarları kaynak kodda açıkça bulunmaz; BuildConfig üzerinden enjekte edilir.
- Ağ trafiğinde HTTPS zorunludur (`cleartextTrafficPermitted="false"`).
- Kullanıcı şifreleri ve oturum anahtarları Android Keystore donanımsal koruması altındadır.
