package com.sonielguedes.arenaaracoiabapro.presentation.athlete.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

data class Scorer(val name: String, val team: String, val goals: Int, val rank: Int)

@Composable
fun TopScorersEliteCard(
    scorers: List<Scorer>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, ArenaBorder, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "ARTILHARIA",
                style = MaterialTheme.typography.titleSmall,
                color = ArenaGold,
                fontWeight = FontWeight.Black
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            scorers.forEachIndexed { index, scorer ->
                ScorerRow(scorer = scorer)
                if (index < scorers.size - 1) {
                    Divider(color = ArenaBorder.copy(alpha = 0.5f), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 8.dp))
                }
            }
        }
    }
}

@Composable
private fun ScorerRow(scorer: Scorer) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            val medal = when (scorer.rank) {
                1 -> "🥇"
                2 -> "🥈"
                3 -> "🥉"
                else -> "${scorer.rank}º"
            }
            Text(
                text = medal,
                fontSize = 18.sp,
                modifier = Modifier.width(32.dp)
            )
            Column {
                Text(
                    text = scorer.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ArenaText
                )
                Text(
                    text = scorer.team,
                    fontSize = 11.sp,
                    color = ArenaMuted
                )
            }
        }
        
        Box(
            modifier = Modifier
                .background(ArenaSurface, RoundedCornerShape(4.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(
                text = "${scorer.goals} GOLS",
                fontSize = 12.sp,
                fontWeight = FontWeight.Black,
                color = ArenaGold
            )
        }
    }
}
