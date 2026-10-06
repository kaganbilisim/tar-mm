package com.tarimcepte.app.core.database.dao

import androidx.room.*
import com.tarimcepte.app.core.database.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface HarvestDao {
    @Query("SELECT * FROM harvests ORDER BY date DESC")
    fun getAllHarvests(): Flow<List<HarvestEntity>>

    @Query("SELECT * FROM harvests WHERE id = :id")
    suspend fun getHarvestById(id: String): HarvestEntity?

    @Query("SELECT * FROM harvests WHERE syncStatus != 'SYNCED'")
    suspend fun getPendingSyncHarvests(): List<HarvestEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHarvest(harvest: HarvestEntity)

    @Update
    suspend fun updateHarvest(harvest: HarvestEntity)

    @Delete
    suspend fun deleteHarvest(harvest: HarvestEntity)

    @Query("DELETE FROM harvests")
    suspend fun clearAll()
}

@Dao
interface GardenDao {
    @Query("SELECT * FROM gardens ORDER BY name ASC")
    fun getAllGardens(): Flow<List<GardenEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGarden(garden: GardenEntity)

    @Delete
    suspend fun deleteGarden(garden: GardenEntity)

    @Query("DELETE FROM gardens")
    suspend fun clearAll()
}

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY date DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)

    @Query("DELETE FROM expenses")
    suspend fun clearAll()
}

@Dao
interface JobDao {
    @Query("SELECT * FROM jobs ORDER BY startDate DESC")
    fun getAllJobs(): Flow<List<JobEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJob(job: JobEntity)

    @Delete
    suspend fun deleteJob(job: JobEntity)

    @Query("DELETE FROM jobs")
    suspend fun clearAll()
}
