package com.sonielguedes.arenaaracoiabapro.presentation.athlete

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sonielguedes.arenaaracoiabapro.core.haptics.ArenaHaptics
import com.sonielguedes.arenaaracoiabapro.presentation.athlete.components.*
import com.sonielguedes.arenaaracoiabapro.presentation.live.components.GoalCelebrationOverlay
import com.sonielguedes.arenaaracoiabapro.presentation.live.components.GoalFlashEffect
import com.sonielguedes.arenaaracoiabapro.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun AthleteDashboardScreen() {
    val context = LocalContext.current
    var showGoalOverlay by remember { mutableStateOf(false) }
    var showGoalFlash by remember { mutableStateOf(false) }
    var lastGoalTeam by remember { mutableStateOf("") }
    var lastGoalPlayer by remember { mutableStateOf<String?>(null) }
    
    // Simulação de detecção de gol para demonstração
    LaunchedEffect(Unit) {
        delay(5000)
        lastGoalTeam = "Aracoiaba City"
        lastGoalPlayer = "Gabriel Jesus"
        showGoalOverlay = true
        showGoalFlash = true
        ArenaHaptics.vibrateGoal(context)
    }

    Box(modifier = Modifier.fillMaxSize().background(ArenaBlack)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { DashboardHeader() }
            
            item {
                LiveMatchEliteCard(
                    homeTeam = "Aracoiaba City",
                    awayTeam = "Vila Real",
                    homeScore = 2,
                    awayScore = 1,
                    time = "32' 2T"
                )
            }
            
            item {
                NextMatchPremiumCard(
                    homeTeam = "Aracoiaba City",
                    awayTeam = "Barcelona da Várzea",
                    date = "DOM, 28 ABR",
                    time = "10:00",
                    location = "Campo do Povo"
                )
            }
            
            item {
                TopScorersEliteCard(
                    scorers = listOf(
                        Scorer("Gabriel Jesus", "Aracoiaba City", 12, 1),
                        Scorer("Neymar Jr", "Vila Real", 10, 2),
                        Scorer("Vini Jr", "Barcelona da Várzea", 8, 3)
                    )
                )
            }
            
            item {
                MiniRankingCard(
                    ranking = listOf(
                        RankingItem(1, "Aracoiaba City", 24, true),
                        RankingItem(2, "Barcelona da Várzea", 21),
                        RankingItem(3, "Vila Real", 19),
                        RankingItem(4, "União Fiel", 15)
                    )
                )
            }
            
            item {
                RecentMatchesCard(
                    matches = listOf(
                        RecentMatch("União Fiel", 3, 1, ResultType.WIN),
                        RecentMatch("São Jorge", 2, 2, ResultType.DRAW),
                        RecentMatch("Vila Real", 0, 1, ResultType.LOSS)
                    )
                )
            }
            
            item { Spacer(modifier = Modifier.height(32.dp)) }
        }

        GoalFlashEffect(isVisible = showGoalFlash) { showGoalFlash = false }
        GoalCelebrationOverlay(
            teamName = lastGoalTeam,
            playerName = lastGoalPlayer,
            isVisible = showGoalOverlay,
            onFinished = { showGoalOverlay = false }
        )
    }
}

@Composable
fun DashboardHeader() {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "BEM-VINDO,",
                style = MaterialTheme.typography.labelSmall,
                color = ArenaMuted
            )
            Text(
                text = "GABRIEL JESUS",
                style = MaterialTheme.typography.headlineMedium,
                color = ArenaText,
                fontWeight = FontWeight.Black
            )
        }
        
        IconButton(
            onClick = { },
            modifier = Modifier.background(ArenaCard, CircleShape)
        ) {
            Icon(Icons.Default.Notifications, contentDescription = null, tint = ArenaGold)
        }
    }
}
