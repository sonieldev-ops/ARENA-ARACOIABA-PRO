package com.sonielguedes.arenaaracoiabapro.presentation.athlete.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sonielguedes.arenaaracoiabapro.ui.components.ArenaBadge
import com.sonielguedes.arenaaracoiabapro.ui.components.BadgeType
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

@Composable
fun LiveMatchEliteCard(
    homeTeam: String,
    awayTeam: String,
    homeScore: Int,
    awayScore: Int,
    time: String,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, ArenaBorder, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = ArenaCard),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        colors = listOf(ArenaCard, ArenaCardAlt)
                    )
                )
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(ArenaRed.copy(alpha = alpha))
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "AO VIVO",
                        color = ArenaRed,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Text(
                    text = time,
                    color = ArenaText,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TeamInfo(name = homeTeam, isHome = true)
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    ScoreText(score = homeScore)
                    Text(
                        text = "X",
                        modifier = Modifier.padding(horizontal = 16.dp),
                        color = ArenaMuted,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    ScoreText(score = awayScore)
                }

                TeamInfo(name = awayTeam, isHome = false)
            }
        }
    }
}

@Composable
private fun TeamInfo(name: String, isHome: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(60.dp)
                .background(ArenaSurface, CircleShape)
                .border(1.dp, ArenaBorder, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = name.take(1).uppercase(),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = ArenaGold
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = name.uppercase(),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = ArenaText
        )
    }
}

@Composable
private fun ScoreText(score: Int) {
    val animatedScore by animateIntAsState(
        targetValue = score,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "score"
    )
    
    Text(
        text = animatedScore.toString(),
        fontSize = 42.sp,
        fontWeight = FontWeight.Black,
        color = Color.White
    )
}
