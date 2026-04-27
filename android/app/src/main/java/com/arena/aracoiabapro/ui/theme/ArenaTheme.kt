package com.sonielguedes.arenaaracoiabapro.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Paleta Black Edition
val ArenaBlack = Color(0xFF05070A)
val ArenaSurface = Color(0xFF0B0F14)
val ArenaCard = Color(0xFF101820)
val ArenaCardAlt = Color(0xFF151C26)
val ArenaGold = Color(0xFFFACC15)
val ArenaGoldDark = Color(0xFFB8860B)
val ArenaRed = Color(0xFFEF233C)
val ArenaGreen = Color(0xFF22C55E)
val ArenaBlue = Color(0xFF2563EB)
val ArenaText = Color(0xFFF9FAFB)
val ArenaMuted = Color(0xFF9CA3AF)
val ArenaBorder = Color(0xFF1F2937)
val ArenaGrey = Color(0xFF9CA3AF)
val ArenaGreyDark = Color(0xFF4B5563)
val ArenaError = Color(0xFFEF4444)

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
