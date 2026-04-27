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

@Composable
fun NextMatchPremiumCard(
    homeTeam: String,
    awayTeam: String,
    date: String,
    time: String,
    location: String,
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
                Surface(
                    color = ArenaGold,
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "PRÓXIMO",
                        color = ArenaBlack,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
                Text(
                    text = "$date - $time",
                    color = ArenaMuted,
                    fontSize = 12.sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SmallTeamBadge(homeTeam)
                Text(text = "VS", fontWeight = FontWeight.Black, fontSize = 16.sp, color = ArenaBorder)
                SmallTeamBadge(awayTeam)
            }

            Spacer(modifier = Modifier.height(20.dp))
            
            Divider(color = ArenaBorder, thickness = 1.dp)
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = location,
                color = ArenaMuted,
                fontSize = 12.sp,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}

@Composable
private fun SmallTeamBadge(name: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(ArenaSurface, CircleShape)
                .border(1.dp, ArenaBorder, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = name.take(1).uppercase(),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = ArenaGold
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = name.uppercase(),
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = ArenaText
        )
    }
}
