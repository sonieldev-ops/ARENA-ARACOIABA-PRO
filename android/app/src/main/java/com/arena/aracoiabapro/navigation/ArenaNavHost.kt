package com.sonielguedes.arenaaracoiabapro.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navDeepLink
import androidx.navigation.navArgument
import com.sonielguedes.arenaaracoiabapro.presentation.athlete.AthleteDashboardScreen
import com.sonielguedes.arenaaracoiabapro.presentation.home.HomeScreen
import com.sonielguedes.arenaaracoiabapro.presentation.match.MatchDetailScreen
import com.sonielguedes.arenaaracoiabapro.presentation.ranking.RankingScreen
import com.sonielguedes.arenaaracoiabapro.presentation.auth.AuthViewModel
import com.sonielguedes.arenaaracoiabapro.presentation.auth.LoginScreen
import com.sonielguedes.arenaaracoiabapro.presentation.auth.RegisterScreen
import com.sonielguedes.arenaaracoiabapro.presentation.payment.PaymentStatusScreen
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun ArenaNavHost(navController: NavHostController) {
    val authViewModel: AuthViewModel = viewModel()
    val startDest = "public_home"
    
    NavHost(navController = navController, startDestination = startDest) {
        
        composable("public_home") {
            HomeScreen(
                onNavigateToMatch = { matchId -> navController.navigate("match_detail/$matchId") },
                onNavigateToRanking = { champId -> navController.navigate("ranking/$champId") },
                onNavigateToLogin = { 
                    if (authViewModel.isUserLoggedIn) {
                        navController.navigate("athlete_dashboard")
                    } else {
                        navController.navigate("login")
                    }
                }
            )
        }

        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("athlete_dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate("register")
                }
            )
        }

        composable("register") {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate("athlete_dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onBackToLogin = {
                    navController.popBackStack()
                }
            )
        }

        composable("athlete_dashboard") {
            AthleteDashboardScreen(
                onNavigateToMatch = { matchId -> navController.navigate("match_detail/$matchId") },
                onNavigateToNotifications = { navController.navigate("notifications") },
                onNavigateToProfile = { navController.navigate("profile") }
            )
        }

        composable(
            route = "match_detail/{matchId}",
            arguments = listOf(navArgument("matchId") { type = NavType.StringType })
        ) { backStackEntry ->
            val matchId = backStackEntry.arguments?.getString("matchId") ?: ""
            MatchDetailScreen(matchId = matchId, onBack = { navController.popBackStack() })
        }

        composable(
            route = "ranking/{championshipId}",
            arguments = listOf(navArgument("championshipId") { type = NavType.StringType })
        ) { backStackEntry ->
            val champId = backStackEntry.arguments?.getString("championshipId") ?: ""
            RankingScreen(championshipId = champId, onBack = { navController.popBackStack() })
        }

        composable("payment_status") {
            PaymentStatusScreen(onBack = { navController.popBackStack() })
        }
    }
}
