package com.tarimcepte.app.core.model

import kotlinx.serialization.Serializable

@Serializable
enum class UserRole {
    EMPLOYER,         // Bahçe Sahibi (İşveren)
    CREW_LEADER,      // Çavuş (Ekip Lideri)
    WORKER,           // Bireysel İşçi
    SERVICE_PROVIDER, // Zirai Hizmet Sağlayıcı
    ADMIN             // Sistem Yöneticisi
}

@Serializable
enum class FarmingFocus {
    TEA,
    HAZELNUT,
    BOTH
}

@Serializable
enum class SeasonType(val displayName: String) {
    SEASON_1("1. Sürüm (Mayıs)"),
    SEASON_2("2. Sürüm (Temmuz)"),
    SEASON_3("3. Sürüm (Ağustos)"),
    SEASON_4("4. Sürüm (Sonbahar)"),
    HAZELNUT_MAIN("Fındık Ana Hasadı")
}

@Serializable
enum class PaymentStatus {
    PENDING,
    PARTIAL,
    COMPLETED
}

@Serializable
data class Harvest(
    val id: String,
    val date: String,
    val season: SeasonType,
    val gardenId: String,
    val gardenName: String,
    val quantityKg: Double,
    val buyerName: String,
    val unitPriceGross: Double,
    val grossAmount: Double = quantityKg * unitPriceGross,
    val deductionRate: Double = 0.02, // %2 Borsa tescil + stopaj
    val deductionAmount: Double = grossAmount * deductionRate,
    val netReceivable: Double = grossAmount - deductionAmount,
    val collectedAmount: Double = 0.0,
    val dueDate: String? = null,
    val status: PaymentStatus = if (collectedAmount >= netReceivable) PaymentStatus.COMPLETED else if (collectedAmount > 0) PaymentStatus.PARTIAL else PaymentStatus.PENDING,
    val receiptNote: String? = null,
    val cropType: FarmingFocus = FarmingFocus.TEA
)

@Serializable
data class Garden(
    val id: String,
    val name: String,
    val location: String,
    val sizeDecares: Double, // Dekar / Dönüm
    val cropType: FarmingFocus,
    val bushesCount: Int? = null, // Ocak sayısı
    val adaNo: String? = null,
    val parselNo: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val notes: String? = null
)

@Serializable
data class Expense(
    val id: String,
    val date: String,
    val category: String, // fertilizer, pruning, labor_crew, fuel_tools, sacks, other
    val title: String,
    val amount: Double,
    val gardenId: String? = null,
    val gardenName: String? = null,
    val note: String? = null
)

@Serializable
enum class JobPaymentType(val label: String) {
    DAILY_WAGE("Günlük Yevmiye"),
    LUMP_SUM("Götürü / Toptan"),
    PER_DONUM("Dönüm Başı")
}

@Serializable
data class JobListing(
    val id: String,
    val title: String,
    val cropType: FarmingFocus,
    val locationCity: String,
    val locationDistrict: String,
    val workerCount: Int,           // 1. Zorunlu Alan: Tam işçi sayısı
    val startDate: String,          // 2. Zorunlu Alan: Başlangıç tarihi
    val estimatedDays: Int,         // Tahmini gün
    val paymentType: JobPaymentType,// 3. Zorunlu Alan: Ödeme türü
    val wageAmount: Double,         // 3. Zorunlu Alan: Net TL tutar ("ücret görüşülür" kesinlikle yasak)
    val hasAccommodation: Boolean, // 4. Zorunlu Alan: Konaklama
    val hasFood: Boolean,          // 5. Zorunlu Alan: Yemek
    val hasTransportation: Boolean,// 6. Zorunlu Alan: Servis / Ulaşım
    val employerName: String,
    val employerPhone: String,
    val notes: String = "",
    val status: String = "ACTIVE"
)
