package com.sonielguedes.arenaaracoiabapro.presentation.athlete

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Info
import com.sonielguedes.arenaaracoiabapro.data.model.FavoriteTeam
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sonielguedes.arenaaracoiabapro.data.model.AppNotification
import com.sonielguedes.arenaaracoiabapro.data.model.Match
import com.sonielguedes.arenaaracoiabapro.data.model.RankingTeam
import com.sonielguedes.arenaaracoiabapro.data.model.Scorer
import com.sonielguedes.arenaaracoiabapro.data.model.UserProfile
import com.sonielguedes.arenaaracoiabapro.presentation.athlete.components.LiveMatchEliteCard
import com.sonielguedes.arenaaracoiabapro.presentation.athlete.viewmodel.AthleteDashboardViewModel
import com.sonielguedes.arenaaracoiabapro.presentation.athlete.viewmodel.DashboardState
import com.sonielguedes.arenaaracoiabapro.presentation.live.components.GoalCelebrationOverlay
import com.sonielguedes.arenaaracoiabapro.ui.components.SectionHeader
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaBlack
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaBorder
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaCard
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaGold
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaMuted
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaRed
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaText
import java.text.SimpleDateFormat
import java.util.Locale

@Composable
fun AthleteDashboardScreen(
    onNavigateToMatch: (String) -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToProfile: () -> Unit,
    viewModel: AthleteDashboardViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val favorites by viewModel.favorites.collectAsState(initial = emptyList())

    when (val state = uiState) {
        is DashboardState.Loading -> {
            Box(modifier = Modifier.fillMaxSize().background(ArenaBlack), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = ArenaGold)
            }
        }
        is DashboardState.Error -> {
            ErrorState(state.message) { viewModel.loadDashboardData() }
        }
        is DashboardState.NoTeam -> {
            NoTeamState { viewModel.loadDashboardData() }
        }
        is DashboardState.Success -> {
            var showGoalOverlay by remember { mutableStateOf(false) }
            var lastScorerName by remember { mutableStateOf<String?>(null) }
            
            val currentScore = "${state.liveMatch?.scoreA}-${state.liveMatch?.scoreB}"
            var lastKnownScore by remember { mutableStateOf(currentScore) }

            LaunchedEffect(currentScore) {
                if (state.liveMatch != null && lastKnownScore != currentScore && lastKnownScore != "null-null") {
                    // Tenta encontrar o artilheiro no evento mais recente de GOAL
                    lastScorerName = state.liveEvents.filter { it.type == "GOAL" }.maxByOrNull { it.createdAt?.seconds ?: 0L }?.playerName
                    showGoalOverlay = true
                    lastKnownScore = currentScore
                }
            }

            Box {
                DashboardContent(
                    profile = state.profile,
                    liveMatch = state.liveMatch,
                    matches = state.matches,
                    ranking = state.ranking,
                    scorers = state.scorers,
                    notifications = state.notifications,
                    favorites = favorites,
                    onNotificationClick = { viewModel.markNotificationAsRead(it.id) },
                    onToggleFavorite = { viewModel.toggleFavorite(it) },
                    onNavigateToMatch = onNavigateToMatch
                )

                GoalCelebrationOverlay(
                    teamName = state.liveMatch?.let { 
                        val scores = lastKnownScore.split("-")
                        val lastScoreA = scores.getOrNull(0)?.toIntOrNull() ?: 0
                        if (it.scoreA > lastScoreA) it.teamAName else it.teamBName 
                    } ?: "",
                    playerName = lastScorerName,
                    isVisible = showGoalOverlay,
                    onFinished = { showGoalOverlay = false }
                )
            }
        }
    }
}

@Composable
fun DashboardContent(
    profile: UserProfile,
    liveMatch: Match?,
    matches: List<Match>,
    ranking: List<RankingTeam>,
    scorers: List<Scorer>,
    notifications: List<AppNotification>,
    favorites: List<FavoriteTeam>,
    onNotificationClick: (AppNotification) -> Unit,
    onToggleFavorite: (FavoriteTeam) -> Unit,
    onNavigateToMatch: (String) -> Unit
) {
    Box(modifier = Modifier.fillMaxSize().background(ArenaBlack)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { DashboardHeader(profile.fullName) }

            if (liveMatch != null) {
                item {
                    SectionHeader("SEU TIME AO VIVO", ArenaRed)
                    Spacer(Modifier.height(8.dp))
                    LiveMatchEliteCard(
                        homeTeam = liveMatch.teamAName,
                        awayTeam = liveMatch.teamBName,
                        homeScore = liveMatch.scoreA,
                        awayScore = liveMatch.scoreB,
                        startedAt = liveMatch.startedAt,
                        period = liveMatch.period,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }
            }

            if (ranking.isNotEmpty()) {
                item {
                    SectionHeader("MEU TIME & FAVORITOS", ArenaGold)
                    Spacer(Modifier.height(8.dp))
                    
                    val myTeamRanking = ranking.find { it.teamId == profile.teamId }
                    if (myTeamRanking != null) {
                        FavoriteTeamCard(
                            teamName = myTeamRanking.teamName,
                            points = myTeamRanking.points,
                            position = myTeamRanking.position,
                            isFavorite = true, // Seu time é sempre fixo aqui
                            canToggle = false,
                            onToggle = {}
                        )
                        Spacer(Modifier.height(8.dp))
                    }

                    favorites.filter { it.teamId != profile.teamId }.forEach { fav ->
                        val favRanking = ranking.find { it.teamId == fav.teamId }
                        FavoriteTeamCard(
                            teamName = fav.teamName,
                            points = favRanking?.points ?: 0,
                            position = favRanking?.position ?: 0,
                            isFavorite = true,
                            onToggle = { onToggleFavorite(fav) }
                        )
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }

            val unread = notifications.filter { !it.read }
            if (unread.isNotEmpty()) {
                item {
                    SectionHeader("NOTIFICAÇÕES", ArenaGold)
                    Spacer(Modifier.height(8.dp))
                    unread.take(2).forEach { notification ->
                        NotificationItem(notification, onClick = { onNotificationClick(notification) })
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }

            if (matches.isNotEmpty()) {
                item {
                    SectionHeader("MEUS JOGOS", ArenaGold)
                    Spacer(Modifier.height(8.dp))
                }
                items(matches.take(3)) { match ->
                    MatchDashboardCard(match, onClick = { onNavigateToMatch(match.id) })
                }
            }

            if (ranking.isNotEmpty()) {
                item {
                    SectionHeader("CLASSIFICAÇÃO", ArenaGold)
                    Spacer(Modifier.height(8.dp))
                    CompactRankingTable(ranking, profile.teamId)
                }
            }

            if (scorers.isNotEmpty()) {
                item {
                    SectionHeader("ARTILHARIA", ArenaGold)
                    Spacer(Modifier.height(8.dp))
                    CompactScorersList(scorers)
                }
            }

            item { Spacer(modifier = Modifier.height(32.dp)) }
        }
    }
}

@Composable
fun FavoriteTeamCard(
    teamName: String,
    points: Int,
    position: Int,
    isFavorite: Boolean,
    canToggle: Boolean = true,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(teamName, color = ArenaText, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("${position}º Lugar • $points pts", color = ArenaMuted, fontSize = 12.sp)
            }
            if (canToggle) {
                IconButton(onClick = onToggle) {
                    Icon(
                        if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = null,
                        tint = if (isFavorite) ArenaRed else ArenaMuted
                    )
                }
            }
        }
    }
}

@Composable
fun DashboardHeader(userName: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(text = "BEM-VINDO,", style = MaterialTheme.typography.labelSmall, color = ArenaMuted)
            Text(text = userName.uppercase(), style = MaterialTheme.typography.headlineMedium, color = ArenaText, fontWeight = FontWeight.Black)
        }
        IconButton(onClick = { }, modifier = Modifier.background(ArenaCard, CircleShape)) {
            Icon(Icons.Default.Notifications, contentDescription = null, tint = ArenaGold)
        }
    }
}

@Composable
fun LiveMatchDashboardCard(match: Match, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, ArenaRed)
    ) {
        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(ArenaRed))
                Spacer(Modifier.width(8.dp))
                Text("AO VIVO", color = ArenaRed, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            Spacer(Modifier.height(12.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceAround, verticalAlignment = Alignment.CenterVertically) {
                Text(match.teamAName, color = ArenaText, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                Text("${match.scoreA} X ${match.scoreB}", color = ArenaGold, fontSize = 24.sp, fontWeight = FontWeight.Black, modifier = Modifier.padding(horizontal = 16.dp))
                Text(match.teamBName, color = ArenaText, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        }
    }
}

@Composable
fun MatchDashboardCard(match: Match, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(
                match.scheduledAt?.toDate()?.let { SimpleDateFormat("dd/MM", Locale.getDefault()).format(it) } ?: "",
                color = ArenaGold, fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.width(45.dp)
            )
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("${match.teamAName} vs ${match.teamBName}", color = ArenaText, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                val statusText = when(match.status) {
                    "SCHEDULED" -> "AGENDADO"
                    "LIVE" -> "AO VIVO"
                    "FINISHED" -> "FINALIZADO"
                    else -> match.status
                }
                Text(statusText, color = ArenaMuted, fontSize = 12.sp)
            }
            Icon(Icons.Default.Info, contentDescription = null, tint = ArenaMuted, modifier = Modifier.size(16.dp))
        }
    }
}

@Composable
fun NotificationItem(notification: AppNotification, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaCard.copy(alpha = 0.6f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(ArenaGold))
            Spacer(Modifier.width(12.dp))
            Column {
                Text(notification.title, color = ArenaText, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(notification.message, color = ArenaMuted, fontSize = 12.sp, maxLines = 1)
            }
        }
    }
}

@Composable
fun CompactRankingTable(ranking: List<RankingTeam>, userTeamId: String?) {
    Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(ArenaCard).padding(12.dp)) {
        ranking.take(5).forEachIndexed { index, team ->
            val isUserTeam = team.teamId == userTeamId
            Row(modifier = Modifier.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("${index + 1}", color = if (isUserTeam) ArenaGold else ArenaMuted, modifier = Modifier.width(24.dp), fontSize = 12.sp, fontWeight = if (isUserTeam) FontWeight.Bold else FontWeight.Normal)
                Text(team.teamName, color = if (isUserTeam) ArenaGold else ArenaText, modifier = Modifier.weight(1f), fontSize = 14.sp, fontWeight = if (isUserTeam) FontWeight.Bold else FontWeight.Medium)
                Text("${team.points} pts", color = if (isUserTeam) ArenaGold else ArenaText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
            if (index < 4 && index < ranking.size - 1) HorizontalDivider(color = ArenaBorder.copy(alpha = 0.5f))
        }
    }
}

@Composable
fun CompactScorersList(scorers: List<Scorer>) {
    Column(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(ArenaCard).padding(12.dp)) {
        scorers.take(3).forEachIndexed { index, scorer ->
            Row(modifier = Modifier.padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(scorer.athleteName, color = ArenaText, modifier = Modifier.weight(1f), fontSize = 14.sp)
                Text("${scorer.goals} GOLS", color = ArenaGold, fontSize = 12.sp, fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
fun ErrorState(message: String, onRetry: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().background(ArenaBlack).padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.Warning, contentDescription = null, tint = ArenaRed, modifier = Modifier.size(64.dp))
            Spacer(Modifier.height(16.dp))
            Text("Ops! Algo deu errado", color = ArenaText, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(message, color = ArenaMuted, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(Modifier.height(24.dp))
            Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = ArenaGold)) {
                Text("TENTAR NOVAMENTE", color = ArenaBlack)
            }
        }
    }
}

@Composable
fun NoTeamState(onRetry: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().background(ArenaBlack).padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.Info, contentDescription = null, tint = ArenaGold, modifier = Modifier.size(64.dp))
            Spacer(Modifier.height(16.dp))
            Text("Sem time vinculado", color = ArenaText, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("Você ainda não está vinculado a um time. Entre em contato com seu treinador.", color = ArenaMuted, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(Modifier.height(24.dp))
            Button(onClick = onRetry, colors = ButtonDefaults.buttonColors(containerColor = ArenaGold)) {
                Text("ATUALIZAR", color = ArenaBlack)
            }
        }
    }
}
