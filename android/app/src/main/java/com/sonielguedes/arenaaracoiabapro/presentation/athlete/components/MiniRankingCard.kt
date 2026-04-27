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

data class RankingItem(val position: Int, val teamName: String, val points: Int, val isUserTeam: Boolean = false)

@Composable
fun MiniRankingCard(
    ranking: List<RankingItem>,
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "CLASSIFICAÇÃO",
                    style = MaterialTheme.typography.titleSmall,
                    color = ArenaGold,
                    fontWeight = FontWeight.Black
                )
                Text(text = "VER TUDO", fontSize = 10.sp, color = ArenaMuted, fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.height(16.dp))

            ranking.take(4).forEach { item ->
                RankingRow(item = item)
                Spacer(modifier = Modifier.height(12.dp))
            }
            
            // G4 Line Indicator
            Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(ArenaBlue.copy(alpha = 0.3f)))
        }
    }
}

@Composable
private fun RankingRow(item: RankingItem) {
    val bgColor = if (item.isUserTeam) ArenaSurface else Color.Transparent
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(bgColor, RoundedCornerShape(4.dp))
            .padding(vertical = 4.dp, horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "${item.position}º",
            fontSize = 12.sp,
            fontWeight = if (item.position <= 4) FontWeight.Black else FontWeight.Medium,
            color = if (item.position <= 4) ArenaBlue else ArenaMuted,
            modifier = Modifier.width(28.dp)
        )
        
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(ArenaSurface, CircleShape)
                .border(0.5.dp, ArenaBorder, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(item.teamName.take(1), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = ArenaGold)
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Text(
            text = item.teamName,
            fontSize = 13.sp,
            fontWeight = if (item.isUserTeam) FontWeight.Bold else FontWeight.Medium,
            color = ArenaText,
            modifier = Modifier.weight(1f)
        )
        
        Text(
            text = "${item.points} P",
            fontSize = 13.sp,
            fontWeight = FontWeight.Black,
            color = if (item.isUserTeam) ArenaGold else ArenaText
        )
    }
}
