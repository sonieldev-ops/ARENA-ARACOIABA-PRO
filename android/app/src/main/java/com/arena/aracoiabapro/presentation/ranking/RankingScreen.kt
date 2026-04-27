package com.sonielguedes.arenaaracoiabapro.presentation.ranking

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sonielguedes.arenaaracoiabapro.data.model.RankingTeam
import com.sonielguedes.arenaaracoiabapro.data.model.Scorer
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RankingScreen(
    championshipId: String,
    onBack: () -> Unit,
    viewModel: RankingViewModel = viewModel(factory = RankingViewModelFactory(championshipId))
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("CLASSIFICAÇÃO", color = ArenaGold, fontSize = 18.sp, fontWeight = FontWeight.Bold) },
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
        Column(Modifier.padding(padding)) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = ArenaBlack,
                contentColor = ArenaGold,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = ArenaGold
                    )
                }
            ) {
                Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Tabela") })
                Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Artilharia") })
            }

            when (val state = uiState) {
                is RankingState.Loading -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = ArenaGold)
                    }
                }
                is RankingState.Success -> {
                    if (selectedTab == 0) {
                        RankingList(state.ranking)
                    } else {
                        ScorersList(state.scorers)
                    }
                }
                is RankingState.Error -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(state.message, color = ArenaRed)
                    }
                }
            }
        }
    }
}

@Composable
fun RankingList(ranking: List<RankingTeam>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            RankingHeaderRow()
        }
        itemsIndexed(ranking) { index, team ->
            FullRankingRow(team, index + 1)
        }
    }
}

@Composable
fun RankingHeaderRow() {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text("#", color = ArenaMuted, modifier = Modifier.width(30.dp), fontWeight = FontWeight.Bold)
        Text("TIME", color = ArenaMuted, modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("P", color = ArenaMuted, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center, fontWeight = FontWeight.Bold)
            Text("J", color = ArenaMuted, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center, fontWeight = FontWeight.Bold)
            Text("SG", color = ArenaMuted, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun FullRankingRow(team: RankingTeam, position: Int) {
    val bgColor = if (position <= 4) ArenaGreen.copy(alpha = 0.05f) else Color.Transparent
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(if (position <= 4) bgColor else ArenaCard)
            .padding(horizontal = 8.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = position.toString(),
            color = if (position <= 4) ArenaGreen else ArenaText,
            modifier = Modifier.width(30.dp),
            fontWeight = FontWeight.Bold
        )
        Text(team.teamName, color = ArenaText, modifier = Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(team.points.toString(), color = ArenaGold, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center, fontWeight = FontWeight.Bold)
            Text(team.played.toString(), color = ArenaText, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center)
            Text(team.goalDifference.toString(), color = if (team.goalDifference > 0) ArenaGreen else if (team.goalDifference < 0) ArenaRed else ArenaText, modifier = Modifier.width(24.dp), textAlign = TextAlign.Center)
        }
    }
}

@Composable
fun ScorersList(scorers: List<Scorer>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        itemsIndexed(scorers) { index, scorer ->
            ScorerRow(scorer, index + 1)
        }
    }
}

@Composable
fun ScorerRow(scorer: Scorer, position: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(ArenaCard)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = position.toString(),
            color = if (position <= 3) ArenaGold else ArenaMuted,
            modifier = Modifier.width(32.dp),
            fontWeight = FontWeight.Black,
            fontSize = 18.sp
        )
        Column(Modifier.weight(1f)) {
            Text(scorer.athleteName, color = ArenaText, fontWeight = FontWeight.Bold)
            Text(scorer.teamName, color = ArenaMuted, fontSize = 12.sp)
        }
        Text(
            text = scorer.goals.toString(),
            color = ArenaGold,
            fontWeight = FontWeight.Black,
            fontSize = 20.sp
        )
    }
}

class RankingViewModelFactory(private val championshipId: String) : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        return RankingViewModel(championshipId) as T
    }
}
