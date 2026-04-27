package com.arenaaracoiaba.pro.modules.notifications.model

import com.google.firebase.Timestamp
import java.util.Date

enum class NotificationType {
    USER_APPROVED, USER_REJECTED, USER_ROLE_CHANGED, 
    USER_SUSPENDED, USER_BLOCKED, USER_REACTIVATED, 
    USER_STATUS_CHANGED, MATCH_UPDATE, CHAMPIONSHIP_ALERT, 
    SYSTEM_NOTICE, GENERIC
}

enum class NotificationPriority { LOW, NORMAL, HIGH, CRITICAL }

enum class NotificationCategory { ACCESS, MATCH, CHAMPIONSHIP, ADMIN, SYSTEM }

data class NotificationItem(
    val id: String = "",
    val userId: String = "",
    val type: NotificationType = NotificationType.GENERIC,
    val category: NotificationCategory = NotificationCategory.SYSTEM,
    val priority: NotificationPriority = NotificationPriority.NORMAL,
    val title: String = "",
    val message: String = "",
    val shortMessage: String? = null,
    val data: Map<String, Any>? = null,
    val isRead: Boolean = false,
    val createdAt: Timestamp = Timestamp.now(),
    val readAt: Timestamp? = null,
    val deepLinkAndroid: String? = null,
    val icon: String? = null
)
