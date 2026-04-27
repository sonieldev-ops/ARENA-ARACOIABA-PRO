package com.sonielguedes.arenaaracoiabapro.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

enum class BadgeType {
    LIVE, NEXT, FINISHED, WIN, DRAW, LOSS, G4
}

@Composable
fun ArenaBadge(
    text: String,
    type: BadgeType,
    modifier: Modifier = Modifier
) {
    val backgroundColor = when (type) {
        BadgeType.LIVE -> ArenaRed
        BadgeType.NEXT -> ArenaGold
        BadgeType.FINISHED -> ArenaMuted
        BadgeType.WIN -> ArenaGreen
        BadgeType.DRAW -> ArenaMuted
        BadgeType.LOSS -> ArenaRed
        BadgeType.G4 -> ArenaBlue
    }

    val textColor = when (type) {
        BadgeType.NEXT -> ArenaBlack
        else -> ArenaText
    }

    Box(
        modifier = modifier
            .background(backgroundColor, RoundedCornerShape(4.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = text.uppercase(),
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
