package com.tarimcepte.app

import com.tarimcepte.app.core.model.FarmingFocus
import com.tarimcepte.app.core.model.Harvest
import com.tarimcepte.app.core.model.SeasonType
import org.junit.Assert.assertEquals
import org.junit.Test

class DeductionCalculationTest {

    @Test
    fun `harvest deduction calculation applies exactly 2 percent borsa and withholding tax`() {
        val quantityKg = 1000.0
        val unitPriceGross = 35.0
        val grossExpected = 35000.0
        val deductionExpected = 700.0 // %2
        val netExpected = 34300.0

        val harvest = Harvest(
            id = "h-test-1",
            date = "2026-05-20",
            season = SeasonType.SEASON_1,
            gardenId = "g-1",
            gardenName = "Büyükköy Çaylığı",
            quantityKg = quantityKg,
            buyerName = "ÇAYKUR",
            unitPriceGross = unitPriceGross,
            cropType = FarmingFocus.TEA
        )

        assertEquals(grossExpected, harvest.grossAmount, 0.001)
        assertEquals(deductionExpected, harvest.deductionAmount, 0.001)
        assertEquals(netExpected, harvest.netReceivable, 0.001)
    }
}
