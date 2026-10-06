package com.tarimcepte.app.feature.harvest

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tarimcepte.app.core.designsystem.components.TarimButton
import com.tarimcepte.app.core.model.FarmingFocus
import com.tarimcepte.app.core.model.Harvest
import com.tarimcepte.app.core.model.PaymentStatus
import com.tarimcepte.app.core.model.SeasonType
import com.tarimcepte.app.core.repository.HarvestRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class HarvestViewModel @Inject constructor(
    private val harvestRepository: HarvestRepository
) : ViewModel() {

    fun saveHarvest(
        buyerName: String,
        gardenName: String,
        quantityKg: Double,
        unitPrice: Double,
        season: SeasonType,
        cropType: FarmingFocus,
        dueDate: String?,
        receiptNote: String?,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val gross = quantityKg * unitPrice
            val deduction = gross * 0.02
            val net = gross - deduction

            val harvest = Harvest(
                id = UUID.randomUUID().toString(),
                date = dateStr,
                season = season,
                gardenId = "garden_1",
                gardenName = gardenName.ifBlank { "Ana Çay Bahçesi" },
                quantityKg = quantityKg,
                buyerName = buyerName,
                unitPriceGross = unitPrice,
                grossAmount = gross,
                deductionRate = 0.02,
                deductionAmount = deduction,
                netReceivable = net,
                collectedAmount = 0.0,
                dueDate = dueDate,
                status = PaymentStatus.PENDING,
                receiptNote = receiptNote,
                cropType = cropType
            )
            harvestRepository.saveHarvest(harvest)
            onSuccess()
        }
    }
}

@Composable
fun AddHarvestScreen(
    onHarvestSaved: () -> Unit,
    viewModel: HarvestViewModel = hiltViewModel()
) {
    var buyerName by remember { mutableStateOf("ÇAYKUR") }
    var gardenName by remember { mutableStateOf("Merkez Bahçe") }
    var quantityText by remember { mutableStateOf("") }
    var unitPriceText by remember { mutableStateOf("35.50") }
    var selectedSeason by remember { mutableStateOf(SeasonType.SEASON_1) }
    var noteText by remember { mutableStateOf("") }

    val quantity = quantityText.toDoubleOrNull() ?: 0.0
    val unitPrice = unitPriceText.toDoubleOrNull() ?: 0.0
    val gross = quantity * unitPrice
    val deduction = gross * 0.02
    val net = gross - deduction

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(
            text = "Hasat / Kantar Teslimatı Ekle",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )

        // Fiş Fotoğrafından Hızlı Doldur Butonu (Kamera İzni ile)
        OutlinedButton(
            onClick = {
                // Fiş OCR simülasyonu
                quantityText = "1250"
                unitPriceText = "36.00"
                buyerName = "ÇAYKUR Çayeli Fabrikası"
            },
            modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = 48.dp)
        ) {
            Icon(Icons.Default.CameraAlt, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Kantar Fişi Fotoğrafından Aktar")
        }

        // Fabrika Seçimi
        OutlinedTextField(
            value = buyerName,
            onValueChange = { buyerName = it },
            label = { Text("Alıcı / Fabrika Adı *") },
            modifier = Modifier.fillMaxWidth()
        )

        // Miktar (KG)
        OutlinedTextField(
            value = quantityText,
            onValueChange = { quantityText = it },
            label = { Text("Miktar (KG) *") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            modifier = Modifier.fillMaxWidth()
        )

        // Birim Fiyat (TL/KG)
        OutlinedTextField(
            value = unitPriceText,
            onValueChange = { unitPriceText = it },
            label = { Text("Brüt Birim Fiyat (TL / KG) *") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            modifier = Modifier.fillMaxWidth()
        )

        // Otomatik Kesinti ve Net Tutar Bilgi Kartı
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Brüt Tutar:", style = MaterialTheme.typography.bodyMedium)
                    Text("${gross.toInt()} ₺", fontWeight = FontWeight.Bold)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Borsa Tescil / Stopaj (%2):", style = MaterialTheme.typography.bodyMedium)
                    Text("-${deduction.toInt()} ₺", color = MaterialTheme.colorScheme.error)
                }
                Divider(modifier = Modifier.padding(vertical = 8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Net Tahsil Edilecek:", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Text(
                        "${net.toInt()} ₺",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // Not / Fiş No
        OutlinedTextField(
            value = noteText,
            onValueChange = { noteText = it },
            label = { Text("Kantar Fişi No / Not") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Kaydet Butonu
        TarimButton(
            text = "Hasat Kaydını Tamamla",
            icon = Icons.Default.Check,
            enabled = quantity > 0 && unitPrice > 0,
            onClick = {
                viewModel.saveHarvest(
                    buyerName = buyerName,
                    gardenName = gardenName,
                    quantityKg = quantity,
                    unitPrice = unitPrice,
                    season = selectedSeason,
                    cropType = FarmingFocus.TEA,
                    dueDate = null,
                    receiptNote = noteText,
                    onSuccess = onHarvestSaved
                )
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
