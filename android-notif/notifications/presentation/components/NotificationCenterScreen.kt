package com.arenaaracoiaba.pro.modules.notifications.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arenaaracoiaba.pro.modules.notifications.model.NotificationItem
import com.arenaaracoiaba.pro.modules.notifications.presentation.viewmodel.NotificationsViewModel

@Composable
fun NotificationCenterScreen(
    viewModel: NotificationsViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToDeepLink: (String) -> Unit
) {
    val notifications by viewModel.notifications.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val unreadCount by viewModel.unreadCount.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notificações") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                    }
                },
                actions = {
                    if (unreadCount > 0) {
                        IconButton(onClick = { viewModel.markAllAsRead() }) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Marcar todas como lidas")
                        }
                    }
                },
                backgroundColor = Color.White,
                elevation = 0.dp
            )
        }
    ) { padding ->
        if (isLoading && notifications.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (notifications.isEmpty()) {
            EmptyNotificationsState()
        } else {
            LazyColumn(modifier = Modifier.padding(padding)) {
                items(notifications) { notification ->
                    NotificationItemRow(
                        notification = notification,
                        onClick = {
                            if (!notification.isRead) viewModel.markAsRead(notification.id)
                            notification.deepLinkAndroid?.let { onNavigateToDeepLink(it) }
                        }
                    )
                    Divider(color = Color(0xFFF0F0F0), thickness = 1.dp)
                }
            }
        }
    }
}

@Composable
fun NotificationItemRow(
    notification: NotificationItem,
    onClick: () -> Unit
) {
    val backgroundColor = if (notification.isRead) Color.White else Color(0xFFF0F7FF)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(backgroundColor)
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.Top
    ) {
        // Ícone simplificado para o exemplo
        Icon(
            Icons.Default.Notifications,
            contentDescription = null,
            tint = if (notification.isRead) Color.Gray else Color(0xFF1D4ED8),
            modifier = Modifier.size(24.dp)
        )
        
        Spacer(Modifier.width(16.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = notification.title,
                    fontSize = 14.sp,
                    fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.Bold,
                    color = Color.Black
                )
                // Aqui entraria a formatação de data relativa
            }
            
            Spacer(Modifier.height(4.dp))
            
            Text(
                text = notification.message,
                fontSize = 13.sp,
                color = if (notification.isRead) Color.Gray else Color.DarkGray,
                maxLines = 2
            )
        }
    }
}

@Composable
fun EmptyNotificationsState() {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(Icons.Default.Notifications, contentDescription = null, tint = Color.LightGray, modifier = Modifier.size(64.dp))
        Spacer(Modifier.height(16.dp))
        Text("Nenhuma notificação", color = Color.Gray, fontWeight = FontWeight.Medium)
    }
}
