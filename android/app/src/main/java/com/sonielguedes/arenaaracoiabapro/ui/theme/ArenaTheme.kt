package com.sonielguedes.arenaaracoiabapro.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = ArenaGold,
    secondary = ArenaGoldDark,
    tertiary = ArenaRed,
    background = ArenaBlack,
    surface = ArenaSurface,
    onPrimary = ArenaBlack,
    onSecondary = ArenaBlack,
    onTertiary = ArenaText,
    onBackground = ArenaText,
    onSurface = ArenaText,
)

@Composable
fun ArenaProTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = ArenaTypography,
        content = content
    )
}
