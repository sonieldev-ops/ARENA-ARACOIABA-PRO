package com.sonielguedes.arenaaracoiabapro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.sonielguedes.arenaaracoiabapro.presentation.dashboard.DashboardScreen
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ArenaTheme {
                DashboardScreen()
            }
        }
    }
}
