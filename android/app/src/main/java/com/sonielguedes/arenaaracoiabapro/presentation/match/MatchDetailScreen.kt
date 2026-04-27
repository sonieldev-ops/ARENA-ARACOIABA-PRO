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
import com.sonielguedes.arenaaracoiabapro.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

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
                title = { Text("DETALHES DA PARTIDA", color = ArenaGold, fontSize = 18.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar", tint = ArenaGold)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = ArenaBlack)
            )
        },
        containerColor = ArenaBlack
    ) { padding ->
        when (val state = uiState) {
            is MatchDetailState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = ArenaGold)
                }
            }
            is MatchDetailState.Success -> {
                MatchContent(state.match, state.events, padding)
            }
            is MatchDetailState.Error -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(state.message, color = ArenaRed)
                }
            }
        }
    }
}

@Composable
fun MatchContent(match: Match, events: List<MatchEvent>, padding: PaddingValues) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            ScoreBoard(match)
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
fun ScoreBoard(match: Match) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (match.status == "LIVE") {
                LiveBadge()
                Spacer(Modifier.height(16.dp))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TeamDisplay(match.teamAName, match.scoreA)
                Text("X", color = ArenaGold, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                TeamDisplay(match.teamBName, match.scoreB)
            }
            
            Spacer(Modifier.height(16.dp))
            Text(
                text = if (match.status == "FINISHED") "FINALIZADO" else match.scheduledAt?.toDate()?.let { 
                    SimpleDateFormat("dd/MM HH:mm", Locale.getDefault()).format(it)
                } ?: "",
                color = ArenaMuted,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
fun TeamDisplay(name: String, score: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(ArenaBorder),
            contentAlignment = Alignment.Center
        ) {
            Text(name.take(1).uppercase(), color = ArenaGold, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(8.dp))
        Text(name, color = ArenaText, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
        Text(score.toString(), color = ArenaText, fontSize = 36.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun LiveBadge() {
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
