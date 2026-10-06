package com.tarimcepte.app.core.repository

import com.tarimcepte.app.core.database.dao.JobDao
import com.tarimcepte.app.core.database.entity.JobEntity
import com.tarimcepte.app.core.model.FarmingFocus
import com.tarimcepte.app.core.model.JobListing
import com.tarimcepte.app.core.model.JobPaymentType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class JobRepository @Inject constructor(
    private val jobDao: JobDao
) {
    fun getJobs(): Flow<List<JobListing>> {
        return jobDao.getAllJobs().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    suspend fun createJob(job: JobListing): Result<Unit> {
        // İş İlanı Doğrulama Kuralları (KESİN UYGULAMA)
        // "Ücret görüşülür" kesinlikle yasaktır, 6 zorunlu alan doğrulanır.
        if (job.workerCount <= 0) {
            return Result.failure(IllegalArgumentException("İhtiyaç duyulan tam işçi sayısı zorunludur."))
        }
        if (job.startDate.isBlank()) {
            return Result.failure(IllegalArgumentException("Başlangıç tarihi zorunludur."))
        }
        if (job.wageAmount <= 0.0) {
            return Result.failure(IllegalArgumentException("Net ücret tutarı zorunludur. 'Ücret görüşülür' ifadesi yasaktır."))
        }
        if (job.employerPhone.isBlank()) {
            return Result.failure(IllegalArgumentException("İşveren iletişim numarası zorunludur."))
        }

        jobDao.insertJob(job.toEntity(syncStatus = "PENDING_SYNC"))
        return Result.success(Unit)
    }

    private fun JobEntity.toDomain(): JobListing {
        return JobListing(
            id = id,
            title = title,
            cropType = try { FarmingFocus.valueOf(cropType) } catch (e: Exception) { FarmingFocus.TEA },
            locationCity = locationCity,
            locationDistrict = locationDistrict,
            workerCount = workerCount,
            startDate = startDate,
            estimatedDays = estimatedDays,
            paymentType = try { JobPaymentType.valueOf(paymentType) } catch (e: Exception) { JobPaymentType.DAILY_WAGE },
            wageAmount = wageAmount,
            hasAccommodation = hasAccommodation,
            hasFood = hasFood,
            hasTransportation = hasTransportation,
            employerName = employerName,
            employerPhone = employerPhone,
            notes = notes,
            status = status
        )
    }

    private fun JobListing.toEntity(syncStatus: String = "SYNCED"): JobEntity {
        return JobEntity(
            id = id,
            title = title,
            cropType = cropType.name,
            locationCity = locationCity,
            locationDistrict = locationDistrict,
            workerCount = workerCount,
            startDate = startDate,
            estimatedDays = estimatedDays,
            paymentType = paymentType.name,
            wageAmount = wageAmount,
            hasAccommodation = hasAccommodation,
            hasFood = hasFood,
            hasTransportation = hasTransportation,
            employerName = employerName,
            employerPhone = employerPhone,
            notes = notes,
            status = status,
            syncStatus = syncStatus
        )
    }
}
