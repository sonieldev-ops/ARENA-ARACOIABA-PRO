package com.sonielguedes.arenaaracoiabapro.presentation.live.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.sonielguedes.arenaaracoiabapro.ui.theme.ArenaGold

@Composable
fun GoalFlashEffect(
    isVisible: Boolean,
    onFinished: () -> Unit
) {
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(isVisible) {
        if (isVisible) {
            alpha.animateTo(0.6f, animationSpec = tween(100))
            alpha.animateTo(0f, animationSpec = tween(500))
            onFinished()
        }
    }

    if (alpha.value > 0f) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            ArenaGold.copy(alpha = alpha.value),
                            Color.Transparent
                        )
                    )
                )
        )
    }
}
