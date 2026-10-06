package com.tarimcepte.app.feature.assistant

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.tarimcepte.app.core.designsystem.components.TarimButton

data class ChatMessageItem(
    val sender: String, // "user" or "ai"
    val text: String
)

@Composable
fun AiAssistantScreen(
    onNavigateBack: () -> Unit
) {
    var inputText by remember { mutableStateOf("") }
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessageItem(
                    sender = "ai",
                    text = "Merhaba! Ben Tarım Cepte Ziraat Asistanınızım. Çay gübreleme, 1/7 gençleştirme budaması, külleme, fındık kurdu mücadelesi ve iş ilanı kuralları hakkında sorularınızı sorabilirsiniz."
                )
            )
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "🌱 Tarım Cepte AI Ziraat Danışmanı",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Karadeniz çay ve fındık tarımına özel uzman tavsiyeleri",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Mesaj Geçmişi
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { msg ->
                val isAi = msg.sender == "ai"
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = if (isAi) Alignment.CenterStart else Alignment.CenterEnd
                ) {
                    Surface(
                        color = if (isAi) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.primary,
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.widthIn(max = 300.dp)
                    ) {
                        Text(
                            text = msg.text,
                            modifier = Modifier.padding(12.dp),
                            color = if (isAi) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onPrimary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Hızlı Ziraat Soruları
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SuggestionChip(
                onClick = { inputText = "Çayda 25-5-10 gübreleme takvimi nedir?" },
                label = { Text("Gübreleme", style = MaterialTheme.typography.labelSmall) }
            )
            SuggestionChip(
                onClick = { inputText = "Fındık kurdu ilacı ne zaman atılır?" },
                label = { Text("Fındık Kurdu", style = MaterialTheme.typography.labelSmall) }
            )
            SuggestionChip(
                onClick = { inputText = "1/7 çay budaması ne kazandırır?" },
                label = { Text("Budama", style = MaterialTheme.typography.labelSmall) }
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Mesaj Giriş Alanı
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Ziraat sorunuzu yazın...") },
                modifier = Modifier.weight(1f)
            )
            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        val userMsg = inputText
                        inputText = ""
                        val newHistory = messages + ChatMessageItem(sender = "user", text = userMsg)
                        // Yerel Karadeniz ziraat kural motoru yanıtı
                        val reply = when {
                            userMsg.contains("gübre", ignoreCase = true) ->
                                "Çayda 25-5-10 kompoze gübresi 1. sürüm öncesi (Mart-Nisan) dekara 70-80 kg ocak izdüşümüne uygulanmalıdır. Yağmur öncesi verilmesi emilimi artırır."
                            userMsg.contains("budama", ignoreCase = true) ->
                                "1/7 veya 1/10 gençleştirme budaması taze sürgün verimini artırırken makas hasat işçiliği maliyetlerini %25-35 oranında kalıcı olarak düşürür."
                            userMsg.contains("fındık", ignoreCase = true) ->
                                "Fındık kurdu (Curculio nucum) ilaçlaması Mayıs ayı başında fındıklar mercimek iriliğine ulaştığında sabah serinliğinde yapılmalıdır."
                            else ->
                                "Sorunuz Tarım Cepte AI ziraat bilgi tabanında inceleniyor. Lütfen sürüm dönemi veya bahçe ada/parsel bilgisini de belirtiniz."
                        }
                        messages = newHistory + ChatMessageItem(sender = "ai", text = reply)
                    }
                },
                modifier = Modifier.size(48.dp)
            ) {
                Icon(Icons.Default.Send, contentDescription = "Gönder", tint = MaterialTheme.colorScheme.primary)
            }
        }
    }
}
