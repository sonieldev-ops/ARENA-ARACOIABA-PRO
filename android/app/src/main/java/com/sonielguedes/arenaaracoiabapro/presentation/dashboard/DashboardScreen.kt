package com.sonielguedes.arenaaracoiabapro.presentation.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

@Composable
fun DashboardScreen() {
    Scaffold(
        containerColor = ArenaBlack,
        topBar = {
            DashboardTopBar()
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            item {
                LiveMatchWidget()
            }
            
            item {
                SectionHeader("Próximo Jogo")
                NextMatchCard()
            }

            item {
                SectionHeader("Sua Artilharia")
                QuickStatsCard()
            }
        }
    }
}

@Composable
fun DashboardTopBar() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "BEM-VINDO,",
                style = Typography.labelMedium,
                color = ArenaGrey
            )
            Text(
                text = "GUEDES #10",
                style = Typography.displayLarge,
                color = Color.White
            )
        }
        
        Box(
            modifier = Modifier
                .size(48.dp)
                .border(2.dp, ArenaGold, CircleShape)
                .padding(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .background(ArenaSurface)
            )
        }
    }
}

@Composable
fun LiveMatchWidget() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaSurface),
        shape = RoundedCornerShape(24.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.05f))
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = ArenaError.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ArenaError)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(modifier = Modifier.size(6.dp).background(ArenaError, CircleShape))
                        Spacer(Modifier.width(6.dp))
                        Text("AO VIVO", color = ArenaError, style = Typography.labelMedium, fontSize = 10.sp)
                    }
                }
                Text("32' 2T", color = ArenaGrey, fontWeight = FontWeight.Bold)
            }
            
            Spacer(Modifier.height(20.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TeamMiniInfo("ARACOIABA", "3")
                Text("X", style = Typography.displayLarge, color = ArenaGrey.copy(alpha = 0.5f))
                TeamMiniInfo("LIONS PRO", "1")
            }
        }
    }
}

@Composable
fun TeamMiniInfo(name: String, score: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(modifier = Modifier.size(50.dp).background(ArenaGreyDark, CircleShape))
        Spacer(Modifier.height(8.dp))
        Text(name, color = Color.White, style = Typography.labelMedium)
        Text(score, color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun SectionHeader(title: String) {
    Text(
        text = title.uppercase(),
        style = Typography.labelMedium,
        color = ArenaGrey,
        modifier = Modifier.padding(bottom = 12.dp)
    )
}

@Composable
fun NextMatchCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaSurface),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.size(40.dp).background(ArenaGreyDark, RoundedCornerShape(8.dp)))
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text("Sábado, 16:00", color = ArenaGold, style = Typography.labelMedium)
                Text("Arena Central - Campo A", color = Color.White, style = Typography.bodyLarge)
            }
            Text("DETALHES", color = ArenaGrey, style = Typography.labelMedium)
        }
    }
}

@Composable
fun QuickStatsCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ArenaSurface),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            StatItem("GOLS", "12")
            VerticalDivider()
            StatItem("ASSIST", "08")
            VerticalDivider()
            StatItem("MÉDIA", "1.4")
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, color = ArenaGrey, style = Typography.labelMedium)
        Text(value, color = ArenaGold, fontSize = 24.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun VerticalDivider() {
    Box(modifier = Modifier.width(1.dp).height(30.dp).background(Color.White.copy(alpha = 0.1f)))
}
