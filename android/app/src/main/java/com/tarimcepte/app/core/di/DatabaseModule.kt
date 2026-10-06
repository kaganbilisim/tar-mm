package com.tarimcepte.app.core.di

import android.content.Context
import androidx.room.Room
import com.tarimcepte.app.core.database.TarimDatabase
import com.tarimcepte.app.core.database.dao.ExpenseDao
import com.tarimcepte.app.core.database.dao.GardenDao
import com.tarimcepte.app.core.database.dao.HarvestDao
import com.tarimcepte.app.core.database.dao.JobDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideTarimDatabase(
        @ApplicationContext context: Context
    ): TarimDatabase {
        return Room.databaseBuilder(
            context,
            TarimDatabase::class.java,
            TarimDatabase.DATABASE_NAME
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideHarvestDao(database: TarimDatabase): HarvestDao = database.harvestDao()

    @Provides
    fun provideGardenDao(database: TarimDatabase): GardenDao = database.gardenDao()

    @Provides
    fun provideExpenseDao(database: TarimDatabase): ExpenseDao = database.expenseDao()

    @Provides
    fun provideJobDao(database: TarimDatabase): JobDao = database.jobDao()
}
