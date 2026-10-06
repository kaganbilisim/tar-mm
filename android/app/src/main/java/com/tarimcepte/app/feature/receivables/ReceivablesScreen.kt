package com.tarimcepte.app.feature.receivables

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import com.tarimcepte.app.core.model.PaymentStatus
import com.tarimcepte.app.core.repository.HarvestRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale
import javax.inject.Inject

@HiltViewModel
class ReceivablesViewModel @Inject constructor(
    private val harvestRepository: HarvestRepository
) : ViewModel() {

    val harvests: StateFlow<List<Harvest>> = harvestRepository.getHarvests()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun collectFullPayment(harvest: Harvest) {
        viewModelScope.launch {
            val remaining = harvest.netReceivable - harvest.collectedAmount
            harvestRepository.collectPayment(harvest.id, remaining)
        }
    }
}

@Composable
fun ReceivablesScreen(
    viewModel: ReceivablesViewModel = hiltViewModel()
) {
    val harvests by viewModel.harvests.collectAsState()
    val pendingHarvests = harvests.filter { it.status != PaymentStatus.COMPLETED }
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale("tr", "TR"))

    val totalPending = pendingHarvests.sumOf { it.netReceivable - it.collectedAmount }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Vadeli Alacaklar & Tahsilat",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Fabrikalardan bekleyen toplam alacak: ${currencyFormat.format(totalPending)}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.error,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (pendingHarvests.isEmpty()) {
            EmptyState(
                title = "Bekleyen alacağınız bulunmuyor",
                description = "Tüm hasat teslimatlarınız tahsil edilmiş durumdadır."
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(pendingHarvests) { harvest ->
                    val remaining = harvest.netReceivable - harvest.collectedAmount
                    Card(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text(
                                        text = harvest.buyerName,
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Teslimat: ${harvest.date} • ${harvest.quantityKg.toInt()} KG",
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                                Text(
                                    text = currencyFormat.format(remaining),
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Black,
                                    color = MaterialTheme.colorScheme.error
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End
                            ) {
                                TarimButton(
                                    text = "Tahsil Et (Kapat)",
                                    icon = Icons.Default.CheckCircle,
                                    onClick = { viewModel.collectFullPayment(harvest) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
