package com.sonielguedes.arenaaracoiabapro.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaCard

@Composable
fun ShimmerItem(
    height: Dp,
    width: Dp = Dp.Unspecified,
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(8.dp)
) {
    val shimmerColors = listOf(
        ArenaCard,
        ArenaCard.copy(alpha = 0.6f),
        ArenaCard,
    )

    val transition = rememberInfiniteTransition(label = "shimmer")
    val translateAnim = transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "translate"
    )

    val brush = Brush.linearGradient(
        colors = shimmerColors,
        start = Offset.Zero,
        end = Offset(x = translateAnim.value, y = translateAnim.value)
    )

    Box(
        modifier = modifier
            .then(if (width != Dp.Unspecified) Modifier.width(width) else Modifier.fillMaxWidth())
            .height(height)
            .background(brush, shape)
    )
}

@Composable
fun ArenaSkeleton(modifier: Modifier = Modifier) {
    Column(modifier = modifier.padding(16.dp)) {
        ShimmerItem(height = 120.dp, modifier = Modifier.padding(bottom = 16.dp))
        ShimmerItem(height = 80.dp, width = 150.dp, modifier = Modifier.padding(bottom = 8.dp))
        ShimmerItem(height = 20.dp, modifier = Modifier.padding(bottom = 24.dp))
        repeat(3) {
            Row(modifier = Modifier.padding(bottom = 16.dp)) {
                ShimmerItem(height = 60.dp, width = 60.dp, modifier = Modifier.padding(end = 16.dp))
                Column {
                    ShimmerItem(height = 20.dp, width = 200.dp, modifier = Modifier.padding(bottom = 8.dp))
                    ShimmerItem(height = 20.dp, width = 100.dp)
                }
            }
        }
    }
}
