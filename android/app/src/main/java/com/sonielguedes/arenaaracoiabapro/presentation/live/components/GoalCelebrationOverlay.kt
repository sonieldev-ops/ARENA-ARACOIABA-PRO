package com.sonielguedes.arenaaracoiabapro.presentation.live.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaGold
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaRed
import kotlinx.coroutines.delay

@Composable
fun GoalCelebrationOverlay(
    teamName: String,
    playerName: String?,
    isVisible: Boolean,
    onFinished: () -> Unit
) {
    if (isVisible) {
        LaunchedEffect(Unit) {
            delay(3000)
            onFinished()
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Black.copy(alpha = 0.8f), Color.Transparent, Color.Black.copy(alpha = 0.8f))
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                val infiniteTransition = rememberInfiniteTransition(label = "goal")
                val scale by infiniteTransition.animateFloat(
                    initialValue = 1f,
                    targetValue = 1.2f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(300, easing = FastOutSlowInEasing),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "scale"
                )

                Text(
                    text = "GOOOOL!",
                    fontSize = 80.sp,
                    fontWeight = FontWeight.Black,
                    color = ArenaGold,
                    modifier = Modifier.graphicsLayer(scaleX = scale, scaleY = scale)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = teamName.uppercase(),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                if (playerName != null) {
                    Text(
                        text = playerName,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Medium,
                        color = ArenaGold
                    )
                }
            }
        }
    }
}
