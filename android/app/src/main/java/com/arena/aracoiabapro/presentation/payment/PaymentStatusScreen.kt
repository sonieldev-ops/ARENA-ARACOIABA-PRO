package com.sonielguedes.arenaaracoiabapro.presentation.payment

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.tooling.preview.Preview
import com.sonielguedes.arenaaracoiabapro.data.model.TeamPayment
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

@Preview(showBackground = true, backgroundColor = 0xFF05070A)
@Composable
fun PaymentStatusScreenPreview() {
    ArenaProTheme {
        PaymentStatusScreen()
    }
}

@Composable
fun PaymentStatusScreen(
    viewModel: PaymentViewModel = viewModel(),
    onBack: () -> Unit = {}
) {
    val payments by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = ArenaBlack,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(ArenaSurface)
                    .padding(24.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "STATUS DE PAGAMENTO POR EQUIPE",
                        style = Typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontStyle = FontStyle.Italic,
                        letterSpacing = 0.5.sp
                    )
                    
                    OutlinedTextField(
                        value = "",
                        onValueChange = {},
                        placeholder = { Text("Buscar time...", color = ArenaGrey, fontSize = 14.sp) },
                        modifier = Modifier
                            .width(200.dp)
                            .height(48.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ArenaBorder,
                            unfocusedBorderColor = ArenaBorder,
                            focusedContainerColor = ArenaBlack,
                            unfocusedContainerColor = ArenaBlack,
                        ),
                        leadingIcon = {
                            Icon(Icons.Default.Search, contentDescription = null, tint = ArenaGrey, modifier = Modifier.size(20.dp))
                        },
                        singleLine = true
                    )
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("EQUIPE", color = ArenaGrey, modifier = Modifier.weight(2f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("CAMPEONATO", color = ArenaGrey, modifier = Modifier.weight(1.5f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("VALOR", color = ArenaGrey, modifier = Modifier.weight(1f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("STATUS", color = ArenaGrey, modifier = Modifier.weight(1f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("AÇÕES", color = ArenaGrey, modifier = Modifier.weight(1f), fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.End)
            }

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                items(payments) { payment ->
                    PaymentRow(payment)
                }
            }
        }
    }
}

@Composable
fun PaymentRow(payment: TeamPayment) {
    Surface(
        color = ArenaSurface,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Equipe
            Row(
                modifier = Modifier.weight(2f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = payment.teamName.take(1),
                        color = Color.Black,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.width(12.dp))
                Text(payment.teamName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }

            // Campeonato
            Text(
                text = payment.championshipName,
                color = ArenaGrey,
                modifier = Modifier.weight(1.5f),
                fontSize = 14.sp
            )

            // Valor
            Text(
                text = payment.amount,
                color = Color.White,
                modifier = Modifier.weight(1f),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )

            // Status
            Box(modifier = Modifier.weight(1f)) {
                StatusBadge(payment.status)
            }

            // Ações
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (payment.status == "PENDING") {
                    Button(
                        onClick = {},
                        colors = ButtonDefaults.buttonColors(containerColor = ArenaGreen),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text("CONFIRMAR PIX", fontSize = 10.sp, fontWeight = FontWeight.Black)
                    }
                    Spacer(Modifier.width(8.dp))
                }
                
                IconButton(
                    onClick = {},
                    modifier = Modifier
                        .size(32.dp)
                        .background(ArenaBlack.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                ) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = "Details",
                        tint = ArenaGrey,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun StatusBadge(status: String) {
    val isPaid = status == "PAID" || status == "PAGO"
    val backgroundColor = if (isPaid) ArenaGreen.copy(alpha = 0.1f) else ArenaGrey.copy(alpha = 0.1f)
    val textColor = if (isPaid) ArenaGreen else ArenaGrey
    val text = if (isPaid) "PAGO" else "PENDENTE"

    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, textColor.copy(alpha = 0.5f))
    ) {
        Text(
            text = text,
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
