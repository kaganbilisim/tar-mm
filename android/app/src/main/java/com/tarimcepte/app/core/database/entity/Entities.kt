package com.tarimcepte.app.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "harvests")
data class HarvestEntity(
    @PrimaryKey val id: String,
    val date: String,
    val season: String,
    val gardenId: String,
    val gardenName: String,
    val quantityKg: Double,
    val buyerName: String,
    val unitPriceGross: Double,
    val grossAmount: Double,
    val deductionRate: Double,
    val deductionAmount: Double,
    val netReceivable: Double,
    val collectedAmount: Double,
    val dueDate: String?,
    val status: String,
    val receiptNote: String?,
    val cropType: String,
    val syncStatus: String = "SYNCED",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "gardens")
data class GardenEntity(
    @PrimaryKey val id: String,
    val name: String,
    val location: String,
    val sizeDecares: Double,
    val cropType: String,
    val bushesCount: Int?,
    val adaNo: String?,
    val parselNo: String?,
    val latitude: Double?,
    val longitude: Double?,
    val notes: String?,
    val syncStatus: String = "SYNCED",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val date: String,
    val category: String,
    val title: String,
    val amount: Double,
    val gardenId: String?,
    val gardenName: String?,
    val note: String?,
    val syncStatus: String = "SYNCED",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "jobs")
data class JobEntity(
    @PrimaryKey val id: String,
    val title: String,
    val cropType: String,
    val locationCity: String,
    val locationDistrict: String,
    val workerCount: Int,
    val startDate: String,
    val estimatedDays: Int,
    val paymentType: String,
    val wageAmount: Double,
    val hasAccommodation: Boolean,
    val hasFood: Boolean,
    val hasTransportation: Boolean,
    val employerName: String,
    val employerPhone: String,
    val notes: String,
    val status: String,
    val syncStatus: String = "SYNCED",
    val updatedAt: Long = System.currentTimeMillis()
)
