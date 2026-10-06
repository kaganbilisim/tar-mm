package com.tarimcepte.app.core.repository

import com.tarimcepte.app.core.database.dao.HarvestDao
import com.tarimcepte.app.core.database.entity.HarvestEntity
import com.tarimcepte.app.core.model.FarmingFocus
import com.tarimcepte.app.core.model.Harvest
import com.tarimcepte.app.core.model.PaymentStatus
import com.tarimcepte.app.core.model.SeasonType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HarvestRepository @Inject constructor(
    private val harvestDao: HarvestDao
) {
    fun getHarvests(): Flow<List<Harvest>> {
        return harvestDao.getAllHarvests().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    suspend fun saveHarvest(harvest: Harvest) {
        val entity = harvest.toEntity(syncStatus = "PENDING_SYNC")
        harvestDao.insertHarvest(entity)
    }

    suspend fun collectPayment(harvestId: String, amount: Double) {
        val existing = harvestDao.getHarvestById(harvestId) ?: return
        val newCollected = existing.collectedAmount + amount
        val newStatus = if (newCollected >= existing.netReceivable) "COMPLETED" else "PARTIAL"

        val updated = existing.copy(
            collectedAmount = newCollected,
            status = newStatus,
            syncStatus = "PENDING_SYNC",
            updatedAt = System.currentTimeMillis()
        )
        harvestDao.updateHarvest(updated)
    }

    suspend fun deleteHarvest(harvestId: String) {
        val existing = harvestDao.getHarvestById(harvestId) ?: return
        harvestDao.deleteHarvest(existing)
    }

    private fun HarvestEntity.toDomain(): Harvest {
        return Harvest(
            id = id,
            date = date,
            season = try { SeasonType.valueOf(season) } catch (e: Exception) { SeasonType.SEASON_1 },
            gardenId = gardenId,
            gardenName = gardenName,
            quantityKg = quantityKg,
            buyerName = buyerName,
            unitPriceGross = unitPriceGross,
            grossAmount = grossAmount,
            deductionRate = deductionRate,
            deductionAmount = deductionAmount,
            netReceivable = netReceivable,
            collectedAmount = collectedAmount,
            dueDate = dueDate,
            status = try { PaymentStatus.valueOf(status) } catch (e: Exception) { PaymentStatus.PENDING },
            receiptNote = receiptNote,
            cropType = try { FarmingFocus.valueOf(cropType) } catch (e: Exception) { FarmingFocus.TEA }
        )
    }

    private fun Harvest.toEntity(syncStatus: String = "SYNCED"): HarvestEntity {
        return HarvestEntity(
            id = id,
            date = date,
            season = season.name,
            gardenId = gardenId,
            gardenName = gardenName,
            quantityKg = quantityKg,
            buyerName = buyerName,
            unitPriceGross = unitPriceGross,
            grossAmount = grossAmount,
            deductionRate = deductionRate,
            deductionAmount = deductionAmount,
            netReceivable = netReceivable,
            collectedAmount = collectedAmount,
            dueDate = dueDate,
            status = status.name,
            receiptNote = receiptNote,
            cropType = cropType.name,
            syncStatus = syncStatus
        )
    }
}
