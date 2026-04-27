package com.sonielguedes.arenaaracoiabapro.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SectionHeader(title: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(4.dp, 16.dp).background(color))
        Spacer(Modifier.width(8.dp))
        Text(title, color = color, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, fontSize = 14.sp)
    }
    Spacer(Modifier.height(12.dp))
}
