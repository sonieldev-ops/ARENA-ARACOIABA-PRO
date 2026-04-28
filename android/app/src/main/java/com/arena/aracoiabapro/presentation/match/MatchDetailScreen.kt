package com.sonielguedes.arenaaracoiabapro.presentation.match

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sonielguedes.arenaaracoiabapro.data.model.Match
import com.sonielguedes.arenaaracoiabapro.data.model.MatchEvent
import com.sonielguedes.arenaaracoiabapro.ui.components.ArenaBadge
import com.sonielguedes.arenaaracoiabapro.ui.components.BadgeType
import com.sonielguedes.arenaaracoiabapro.ui.components.SectionHeader
import com.sonielguedes.arenaaracoiabapro.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

import com.sonielguedes.arenaaracoiabapro.presentation.live.components.GoalCelebrationOverlay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MatchDetailScreen(
    matchId: String,
    onBack: () -> Unit,
    viewModel: MatchDetailViewModel = viewModel(factory = MatchDetailViewModelFactory(matchId))
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(uiState.match?.championshipId ?: "DETALHES", color = ArenaGold, fontSize = 16.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    TextButton(onClick = onBack) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar", tint = ArenaGold, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("VOLTAR", color = ArenaGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = ArenaBlack)
            )
        },
        containerColor = ArenaBlack
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize()) {
            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = ArenaGold)
                }
            } else if (uiState.error != null) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.error!!, color = ArenaRed)
                }
            } else {
                uiState.match?.let { match ->
                    MatchContent(match, uiState.events, uiState.elapsedSeconds, padding)
                }
            }

            GoalCelebrationOverlay(
                teamName = uiState.lastGoalEvent?.let { event ->
                    if (uiState.match?.teamAId == event.teamId) uiState.match?.teamAName else uiState.match?.teamBName
                } ?: "",
                playerName = uiState.lastGoalEvent?.playerName,
                isVisible = uiState.showGoalAnimation,
                onFinished = { /* O ViewModel já controla o tempo */ }
            )
        }
    }
}

@Composable
fun MatchContent(match: Match, events: List<MatchEvent>, elapsedSeconds: Int, padding: PaddingValues) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            ScoreBoard(match, elapsedSeconds)
            Spacer(Modifier.height(24.dp))
        }

        item {
            SectionHeader("CRONOLOGIA", ArenaGold)
            Spacer(Modifier.height(12.dp))
        }

        if (events.isEmpty()) {
            item {
                Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    Text("Nenhum evento registrado ainda.", color = ArenaMuted)
                }
            }
        } else {
            items(events) { event ->
                EventRow(event)
            }
        }
        
        item { Spacer(Modifier.height(32.dp)) }
    }
}

@Composable
fun ScoreBoard(match: Match, elapsedSeconds: Int) {
    val currentTimeMillis = System.currentTimeMillis()
    val displayTime = remember(match.startedAt, match.period, currentTimeMillis) {
        if (match.startedAt == null) return@remember match.period ?: ""
        
        val diffMinutes = (currentTimeMillis - match.startedAt.toDate().time) / 60000
        val baseMinutes = if (diffMinutes < 0) 0 else diffMinutes.toInt()

        when (match.period) {
            "1T" -> if (baseMinutes > 45) "45+${baseMinutes - 45}'" else "${baseMinutes}'"
            "2T" -> {
                val secondHalfMin = baseMinutes + 45
                if (secondHalfMin > 90) "90+${secondHalfMin - 90}'" else "${secondHalfMin}'"
            }
            "INT", "INTERVALO" -> "INT"
            else -> "${baseMinutes}'"
        }
    }

    val periodLabel = remember(match.period) {
        when (match.period) {
            "1T" -> "1º TEMPO"
            "2T" -> "2º TEMPO"
            "INT", "INTERVALO" -> "INT"
            else -> "AO VIVO"
        }
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 32.dp, horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Time A
            TeamDisplay(match.teamAName, -1) // -1 para ocultar o score aqui

            // Status e Placar Central
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                if (match.status == "LIVE") {
                    ArenaBadge(text = periodLabel, type = BadgeType.G4) // Usando azul como no print
                    Spacer(Modifier.height(8.dp))
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(match.scoreA.toString(), color = Color.White, fontSize = 64.sp, fontWeight = FontWeight.Black)
                    Text(" : ", color = ArenaMuted, fontSize = 32.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 16.dp))
                    Text(match.scoreB.toString(), color = Color.White, fontSize = 64.sp, fontWeight = FontWeight.Black)
                }

                if (match.status == "FINISHED") {
                    ArenaBadge(text = "FINALIZADO", type = BadgeType.FINISHED)
                } else if (match.status == "SCHEDULED") {
                    ArenaBadge(text = "AGUARDANDO", type = BadgeType.NEXT)
                } else if (match.status == "LIVE" && displayTime.isNotEmpty()) {
                    Text(displayTime, color = ArenaGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Time B
            TeamDisplay(match.teamBName, -1)
        }
    }
}

@Composable
fun TeamDisplay(name: String, score: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(ArenaBorder),
            contentAlignment = Alignment.Center
        ) {
            Text(name.take(2).uppercase(), color = ArenaGold, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(12.dp))
        Text(name.uppercase(), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, letterSpacing = 1.sp)
        if (score >= 0) {
            Text(score.toString(), color = ArenaText, fontSize = 36.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
fun LiveBadge(displayTime: String, periodLabel: String) {
    val infiniteTransition = rememberInfiniteTransition(label = "live")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
            color = ArenaRed.copy(alpha = alpha),
            shape = RoundedCornerShape(4.dp)
        ) {
            Text(
                "AO VIVO",
                color = Color.White,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(Modifier.width(8.dp))
        Text(
            displayTime,
            color = ArenaGold,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black
        )
    }
}

@Composable
fun EventRow(event: MatchEvent) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .width(40.dp)
                .height(24.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(ArenaBorder),
            contentAlignment = Alignment.Center
        ) {
            Text("${event.minute}'", color = ArenaGold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        
        Spacer(Modifier.width(16.dp))
        
        Column(Modifier.weight(1f)) {
            Text(
                text = when(event.type) {
                    "GOAL" -> "GOL!"
                    "CARD_YELLOW" -> "Cartão Amarelo"
                    "CARD_RED" -> "Cartão Vermelho"
                    else -> event.type
                },
                color = if (event.type == "GOAL") ArenaGold else ArenaText,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text("${event.playerName ?: ""} - ${event.description}", color = ArenaMuted, fontSize = 12.sp)
        }
        
        if (event.type == "GOAL") {
            Text("⚽", fontSize = 20.sp)
        }
    }
}

class MatchDetailViewModelFactory(private val matchId: String) : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return MatchDetailViewModel(matchId) as T
    }
}
