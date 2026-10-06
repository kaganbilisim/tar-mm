package com.tarimcepte.app.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.tarimcepte.app.core.database.dao.*
import com.tarimcepte.app.core.database.entity.*

@Database(
    entities = [
        HarvestEntity::class,
        GardenEntity::class,
        ExpenseEntity::class,
        JobEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class TarimDatabase : RoomDatabase() {
    abstract fun harvestDao(): HarvestDao
    abstract fun gardenDao(): GardenDao
    abstract fun expenseDao(): ExpenseDao
    abstract fun jobDao(): JobDao

    companion object {
        const val DATABASE_NAME = "tarim_cepte.db"
    }
}
