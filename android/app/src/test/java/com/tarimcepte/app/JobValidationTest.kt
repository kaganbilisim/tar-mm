package com.tarimcepte.app

import com.tarimcepte.app.core.database.dao.JobDao
import com.tarimcepte.app.core.model.FarmingFocus
import com.tarimcepte.app.core.model.JobListing
import com.tarimcepte.app.core.model.JobPaymentType
import com.tarimcepte.app.core.repository.JobRepository
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.mockito.Mockito.mock

class JobValidationTest {

    private val jobDao = mock(JobDao::class.java)
    private val repository = JobRepository(jobDao)

    @Test
    fun `creating job with zero worker count must fail`() = runBlocking {
        val invalidJob = JobListing(
            id = "test-1",
            title = "Çay Hasat İşçisi",
            cropType = FarmingFocus.TEA,
            locationCity = "Rize",
            locationDistrict = "Çayeli",
            workerCount = 0, // Geçersiz
            startDate = "2026-05-15",
            estimatedDays = 5,
            paymentType = JobPaymentType.DAILY_WAGE,
            wageAmount = 2200.0,
            hasAccommodation = true,
            hasFood = true,
            hasTransportation = true,
            employerName = "Mehmet Çepni",
            employerPhone = "05321112233"
        )
        val result = repository.createJob(invalidJob)
        assertTrue(result.isFailure)
    }

    @Test
    fun `creating job with zero wage must fail because ucret gorusulur is strictly prohibited`() = runBlocking {
        val invalidJob = JobListing(
            id = "test-2",
            title = "Çay Hasat İşçisi",
            cropType = FarmingFocus.TEA,
            locationCity = "Rize",
            locationDistrict = "Çayeli",
            workerCount = 4,
            startDate = "2026-05-15",
            estimatedDays = 5,
            paymentType = JobPaymentType.DAILY_WAGE,
            wageAmount = 0.0, // Geçersiz ("ücret görüşülür" yasak)
            hasAccommodation = true,
            hasFood = true,
            hasTransportation = true,
            employerName = "Mehmet Çepni",
            employerPhone = "05321112233"
        )
        val result = repository.createJob(invalidJob)
        assertTrue(result.isFailure)
    }

    @Test
    fun `valid job with all 6 mandatory fields succeeds`() = runBlocking {
        val validJob = JobListing(
            id = "test-3",
            title = "Çay Hasat İşçisi",
            cropType = FarmingFocus.TEA,
            locationCity = "Rize",
            locationDistrict = "Çayeli",
            workerCount = 6,
            startDate = "2026-05-15",
            estimatedDays = 5,
            paymentType = JobPaymentType.DAILY_WAGE,
            wageAmount = 2200.0,
            hasAccommodation = true,
            hasFood = true,
            hasTransportation = true,
            employerName = "Mehmet Çepni",
            employerPhone = "05321112233"
        )
        val result = repository.createJob(validJob)
        assertTrue(result.isSuccess)
    }
}
