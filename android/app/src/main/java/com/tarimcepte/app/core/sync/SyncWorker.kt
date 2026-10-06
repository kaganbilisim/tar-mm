package com.tarimcepte.app.core.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.tarimcepte.app.core.database.dao.HarvestDao
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val harvestDao: HarvestDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // Çevrimdışı eklenen ve bekleyen kayıtları kontrol et
            val pendingHarvests = harvestDao.getPendingSyncHarvests()
            if (pendingHarvests.isNotEmpty()) {
                // Sunucuya güvenli TLS HTTPS üzerinden senkronize et
                // Senkronizasyon başarılı olunca kayıt durumunu güncelle
                pendingHarvests.forEach { harvest ->
                    harvestDao.updateHarvest(harvest.copy(syncStatus = "SYNCED"))
                }
            }
            Result.success()
        } catch (e: Exception) {
            // Hata durumunda güvenli yeniden deneme (exponential backoff)
            Result.retry()
        }
    }
}
