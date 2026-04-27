package com.sonielguedes.arenaaracoiabapro.presentation.athlete.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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

data class RecentMatch(val opponent: String, val scoreHome: Int, val scoreAway: Int, val result: ResultType)
enum class ResultType { WIN, DRAW, LOSS }

@Composable
fun RecentMatchesCard(
    matches: List<RecentMatch>,
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
                text = "ÚLTIMOS JOGOS",
                style = MaterialTheme.typography.titleSmall,
                color = ArenaGold,
                fontWeight = FontWeight.Black
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            matches.forEach { match ->
                MatchResultRow(match = match)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun MatchResultRow(match: RecentMatch) {
    val resultColor = when (match.result) {
        ResultType.WIN -> ArenaGreen
        ResultType.DRAW -> ArenaMuted
        ResultType.LOSS -> ArenaRed
    }
    
    val resultText = when (match.result) {
        ResultType.WIN -> "V"
        ResultType.DRAW -> "E"
        ResultType.LOSS -> "D"
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(ArenaSurface, RoundedCornerShape(8.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .background(resultColor, RoundedCornerShape(4.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = resultText, color = ArenaText, fontSize = 12.sp, fontWeight = FontWeight.Black)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(text = match.opponent, color = ArenaText, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        
        Text(
            text = "${match.scoreHome} - ${match.scoreAway}",
            color = ArenaText,
            fontSize = 14.sp,
            fontWeight = FontWeight.Black
        )
    }
}
