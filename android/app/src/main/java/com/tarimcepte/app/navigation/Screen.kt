package com.tarimcepte.app.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Home : Screen("home", "Hasat", Icons.Default.Agriculture)
    object Marketplace : Screen("marketplace", "Pazar Yeri", Icons.Default.Work)
    object AddHarvest : Screen("add_harvest", "Hasat Ekle", Icons.Default.AddCircle)
    object Receivables : Screen("receivables", "Tahsilat", Icons.Default.AccountBalanceWallet)
    object Operations : Screen("operations", "İşlemler", Icons.Default.Settings)
    object Assistant : Screen("assistant", "Ziraat AI", Icons.Default.Chat)
    object AgronomyGuide : Screen("agronomy", "Ziraat Rehberi", Icons.Default.MenuBook)
    object CreateJob : Screen("create_job", "İlan Ver", Icons.Default.PostAdd)
}

val BottomNavItems = listOf(
    Screen.Home,
    Screen.Marketplace,
    Screen.AddHarvest,
    Screen.Receivables,
    Screen.Operations
)
