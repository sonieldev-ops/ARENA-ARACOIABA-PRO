package com.sonielguedes.arenaaracoiabapro.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sonielguedes.arenaaracoiabapro.data.model.Match
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

@OptIn(ExperimentalMaterial3Api::)
@Composable
fun HomeScreen(
    onNavigateToMatch: (String) -> Unit,
    onNavigateToRanking: (String) -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("ARENA PRO", color = ArenaGold, fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onNavigateToLogin) {
                        Icon(Icons.Default.Person, contentDescription = "Login", tint = ArenaGold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ArenaBlack)
            )
        },
        containerColor = ArenaBlack
    ) { padding ->
        when (val state = uiState) {
            is HomeState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = ArenaGold)
                }
            }
            is HomeState.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    // Campeonato Ativo Header
                    item {
                        state.activeChampionship?.let {
                            Text(
                                text = it.name,
                                style = MaterialTheme.typography.headlineMedium,
                                color = ArenaGold,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }

                    // Ao Vivo
                    if (state.liveMatches.isNotEmpty()) {
                        item {
                            SectionHeader("AO VIVO", ArenaRed)
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                items(state.liveMatches) { match ->
                                    LiveMatchCard(match) { onNavigateToMatch(match.id) }
                                }
                            }
                        }
                    }

                    // Próximos Jogos
                    item {
                        SectionHeader("PRÓXIMOS JOGOS", ArenaGold)
                        state.recentMatches.forEach { match ->
                            MatchRow(match) { onNavigateToMatch(match.id) }
                            Spacer(Modifier.height(8.dp))
                        }
                    }

                    // Resumo Ranking
                    item {
                        SectionHeader("CLASSIFICAÇÃO", ArenaGold)
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(ArenaCard)
                                .padding(8.dp)
                        ) {
                            state.ranking.forEach { team ->
                                RankingRow(team)
                            }
                            TextButton(
                                onClick = { state.activeChampionship?.let { onNavigateToRanking(it.id) } },
                                modifier = Modifier.align(Alignment.End)
                            ) {
                                Text("Ver tabela completa", color = ArenaGold)
                            }
                        }
                    }
                    
                    item { Spacer(Modifier.height(32.dp)) }
                }
            }
            is HomeState.Error -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(state.message, color = ArenaRed)
                }
            }
        }
    }
}

@Composable
fun SectionHeader(title: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(4.dp, 16.dp).background(color))
        Spacer(Modifier.width(8.dp))
        Text(title, color = color, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
    }
    Spacer(Modifier.height(12.dp))
}

@Composable
fun LiveMatchCard(match: Match, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(280.dp)
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = ArenaCardAlt),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Badge(containerColor = ArenaRed) { Text("LIVE", color = Color.White, modifier = Modifier.padding(2.dp)) }
            Spacer(Modifier.height(12.dp))
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TeamInfo(match.teamAName, match.scoreA)
                Text("VS", color = ArenaGold, fontWeight = FontWeight.Bold)
                TeamInfo(match.teamBName, match.scoreB)
            }
        }
    }
}

@Composable
fun TeamInfo(name: String, score: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(48.dp).clip(RoundedCornerShape(24.dp)).background(ArenaBorder)) // Logo placeholder
        Text(name, color = ArenaText, fontSize = 12.sp, maxLines = 1)
        Text(score.toString(), color = ArenaText, fontSize = 24.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun MatchRow(match: Match, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(ArenaCard)
            .clickable { onClick() }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(match.teamAName, color = ArenaText, modifier = Modifier.weight(1f))
        Text("${match.scoreA} - ${match.scoreB}", color = ArenaGold, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 16.dp))
        Text(match.teamBName, color = ArenaText, modifier = Modifier.weight(1f))
    }
}

@Composable
fun RankingRow(team: com.sonielguedes.arenaaracoiabapro.data.model.RankingTeam) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(team.position.toString(), color = if (team.position <= 4) ArenaGreen else ArenaMuted, modifier = Modifier.width(24.dp))
        Text(team.teamName, color = ArenaText, modifier = Modifier.weight(1f))
        Text(team.points.toString(), color = ArenaGold, fontWeight = FontWeight.Bold)
    }
}
