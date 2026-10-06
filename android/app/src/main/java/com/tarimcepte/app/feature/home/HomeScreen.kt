package com.tarimcepte.app.feature.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tarimcepte.app.core.designsystem.components.EmptyState
import com.tarimcepte.app.core.designsystem.components.TarimButton
import com.tarimcepte.app.core.model.Harvest
import com.tarimcepte.app.core.repository.HarvestRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import java.text.NumberFormat
import java.util.Locale
import javax.inject.Inject

data class HomeUiState(
    val harvests: List<Harvest> = emptyList(),
    val totalKg: Double = 0.0,
    val totalGrossRevenue: Double = 0.0,
    val totalCollected: Double = 0.0,
    val totalPendingReceivables: Double = 0.0
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val harvestRepository: HarvestRepository
) : ViewModel() {

    val uiState: StateFlow<List<Harvest>> = harvestRepository.getHarvests()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
}

@Composable
fun HomeScreen(
    onNavigateToAddHarvest: () -> Unit,
    onNavigateToAssistant: () -> Unit,
    onNavigateToAgronomy: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val harvests by viewModel.uiState.collectAsState()

    val totalKg = harvests.sumOf { it.quantityKg }
    val totalNet = harvests.sumOf { it.netReceivable }
    val totalCollected = harvests.sumOf { it.collectedAmount }
    val pendingReceivable = (totalNet - totalCollected).coerceAtLeast(0.0)

    val currencyFormat = NumberFormat.getCurrencyInstance(Locale("tr", "TR"))

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Karşılama ve Hızlı Ziraat Asistanı Butonu
        item {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Karadeniz Çay & Fındık Sezonu",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "2026 Hasat ve Vadeli Alacak Takibi",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    IconButton(
                        onClick = onNavigateToAssistant,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Chat,
                            contentDescription = "Ziraat Asistanı",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }

        // Finansal KPI Kartları (Grid yerine temiz 2x2 Flow)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    KpiCard(
                        title = "Toplam Hasat",
                        value = "${totalKg.toInt()} KG",
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Toplam Net Ciro",
                        value = currencyFormat.format(totalNet),
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    KpiCard(
                        title = "Tahsil Edilen",
                        value = currencyFormat.format(totalCollected),
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Kalan Alacak",
                        value = currencyFormat.format(pendingReceivable),
                        isWarning = pendingReceivable > 0,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Hızlı Aksiyon Butonları
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TarimButton(
                    text = "Hasat Ekle",
                    icon = Icons.Default.Add,
                    onClick = onNavigateToAddHarvest,
                    modifier = Modifier.weight(1f)
                )
                OutlinedButton(
                    onClick = onNavigateToAgronomy,
                    modifier = Modifier
                        .weight(1f)
                        .defaultMinSize(minHeight = 48.dp)
                ) {
                    Icon(Icons.Default.CalendarMonth, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Rehber")
                }
            }
        }

        // Son Hasat Teslimatları Başlığı
        item {
            Text(
                text = "Son Teslimatlar",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }

        if (harvests.isEmpty()) {
            item {
                EmptyState(
                    title = "Henüz hasat kaydı bulunmuyor",
                    description = "ÇAYKUR veya özel fabrikalara teslim ettiğiniz kantarları kaydetmek için 'Hasat Ekle' butonuna dokunun."
                )
            }
        } else {
            items(harvests) { harvest ->
                HarvestItemCard(harvest = harvest)
            }
        }
    }
}

@Composable
fun KpiCard(
    title: String,
    value: String,
    modifier: Modifier = Modifier,
    isWarning: Boolean = false
) {
    ElevatedCard(
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Black,
                color = if (isWarning) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun HarvestItemCard(harvest: Harvest) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = harvest.buyerName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${harvest.gardenName} • ${harvest.season.displayName}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Tarih: ${harvest.date}",
                    style = MaterialTheme.typography.labelSmall
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${harvest.quantityKg.toInt()} KG",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Net: ${harvest.netReceivable.toInt()} ₺",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}
