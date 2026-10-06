package com.tarimcepte.app.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.tarimcepte.app.feature.assistant.AiAssistantScreen
import com.tarimcepte.app.feature.harvest.AddHarvestScreen
import com.tarimcepte.app.feature.home.HomeScreen
import com.tarimcepte.app.feature.marketplace.MarketplaceScreen
import com.tarimcepte.app.feature.receivables.ReceivablesScreen

@Composable
fun MainAppScaffold(
    navController: NavHostController = rememberNavController()
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                BottomNavItems.forEach { screen ->
                    val selected = currentRoute == screen.route
                    NavigationBarItem(
                        icon = {
                            if (screen.icon != null) {
                                Icon(screen.icon, contentDescription = screen.title)
                            }
                        },
                        label = { Text(screen.title) },
                        selected = selected,
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigateToAddHarvest = { navController.navigate(Screen.AddHarvest.route) },
                    onNavigateToAssistant = { navController.navigate(Screen.Assistant.route) },
                    onNavigateToAgronomy = { navController.navigate(Screen.Operations.route) }
                )
            }
            composable(Screen.Marketplace.route) {
                MarketplaceScreen(
                    onNavigateToCreateJob = { navController.navigate(Screen.AddHarvest.route) }
                )
            }
            composable(Screen.AddHarvest.route) {
                AddHarvestScreen(
                    onHarvestSaved = { navController.popBackStack() }
                )
            }
            composable(Screen.Receivables.route) {
                ReceivablesScreen()
            }
            composable(Screen.Operations.route) {
                AiAssistantScreen(onNavigateBack = { navController.popBackStack() })
            }
            composable(Screen.Assistant.route) {
                AiAssistantScreen(onNavigateBack = { navController.popBackStack() })
            }
        }
    }
}
