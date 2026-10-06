package com.tarimcepte.app.feature.marketplace

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Call
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tarimcepte.app.core.designsystem.components.EmptyState
import com.tarimcepte.app.core.designsystem.components.TarimButton
import com.tarimcepte.app.core.model.JobListing
import com.tarimcepte.app.core.repository.JobRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class MarketplaceViewModel @Inject constructor(
    private val jobRepository: JobRepository
) : ViewModel() {

    val jobs: StateFlow<List<JobListing>> = jobRepository.getJobs()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
}

@Composable
fun MarketplaceScreen(
    onNavigateToCreateJob: () -> Unit,
    viewModel: MarketplaceViewModel = hiltViewModel()
) {
    val jobs by viewModel.jobs.collectAsState()
    val context = LocalContext.current

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Tarım Pazar Yeri",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "%0 Komisyon • Şeffaf Eşleşme",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            TarimButton(
                text = "İlan Ver",
                icon = Icons.Default.Add,
                onClick = onNavigateToCreateJob
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (jobs.isEmpty()) {
            EmptyState(
                title = "Aktif iş ilanı bulunmuyor",
                description = "Bahçe sahipleri tarafından oluşturulan net yevmiyeli iş ilanları burada listelenir."
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(jobs) { job ->
                    JobCard(
                        job = job,
                        onCallEmployer = {
                            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${job.employerPhone}"))
                            context.startActivity(intent)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun JobCard(
    job: JobListing,
    onCallEmployer: () -> Unit
) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = job.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${job.wageAmount.toInt()} ₺",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Text(
                text = "${job.locationCity} / ${job.locationDistrict} • ${job.workerCount} İşçi",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Şartlar Rozetleri
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                if (job.hasAccommodation) ConditionBadge("Konaklama Var")
                if (job.hasFood) ConditionBadge("Yemek Var")
                if (job.hasTransportation) ConditionBadge("Servis Var")
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "İşveren: ${job.employerName}",
                    style = MaterialTheme.typography.labelSmall
                )
                OutlinedButton(
                    onClick = onCallEmployer,
                    modifier = Modifier.defaultMinSize(minHeight = 48.dp)
                ) {
                    Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("İşvereni Ara")
                }
            }
        }
    }
}

@Composable
fun ConditionBadge(text: String) {
    Surface(
        color = MaterialTheme.colorScheme.secondaryContainer,
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSecondaryContainer,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}
