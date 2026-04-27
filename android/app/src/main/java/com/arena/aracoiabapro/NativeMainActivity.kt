package com.sonielguedes.arenaaracoiabapro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.navigation.compose.rememberNavController
import com.sonielguedes.arenaaracoiabapro.navigation.ArenaNavHost
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaProTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ArenaProTheme {
                val navController = rememberNavController()
                ArenaNavHost(navController = navController)
            }
        }
    }
}
