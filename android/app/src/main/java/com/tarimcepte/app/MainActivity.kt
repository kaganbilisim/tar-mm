package com.tarimcepte.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.tarimcepte.app.core.designsystem.TarimCepteTheme
import com.tarimcepte.app.navigation.MainAppScaffold
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TarimCepteTheme {
                MainAppScaffold()
            }
        }
    }
}
