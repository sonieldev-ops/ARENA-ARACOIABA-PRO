package com.sonielguedes.arenaaracoiabapro.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navDeepLink
import androidx.navigation.navArgument
import com.sonielguedes.arenaaracoiabapro.presentation.dashboard.DashboardScreen

@Composable
fun ArenaNavHost(navController: NavHostController) {
    val uri = "arena://"

    NavHost(navController = navController, startDestination = "dashboard") {
        
        // Dashboard / Home
        composable("dashboard") {
            DashboardScreen()
        }

        // Live Match via Deep Link
        composable(
            route = "match/{matchId}",
            deepLinks = listOf(
                navDeepLink { uriPattern = "$uri/match/{matchId}" }
            ),
            arguments = listOf(
                navArgument("matchId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val matchId = backStackEntry.arguments?.getString("matchId")
            // LiveMatchScreen(matchId) // Implementar componente de destino
            println("Navegando para Partida: $matchId")
        }

        // Convites via Deep Link
        composable(
            route = "invite/{inviteId}",
            deepLinks = listOf(
                navDeepLink { uriPattern = "$uri/invite/{inviteId}" }
            ),
            arguments = listOf(
                navArgument("inviteId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val inviteId = backStackEntry.arguments?.getString("inviteId")
            // InviteScreen(inviteId)
            println("Navegando para Convite: $inviteId")
        }

        // Ranking via Deep Link
        composable(
            route = "ranking",
            deepLinks = listOf(
                navDeepLink { uriPattern = "$uri/ranking" }
            )
        ) {
            // RankingScreen()
            println("Navegando para Ranking")
        }
    }
}
