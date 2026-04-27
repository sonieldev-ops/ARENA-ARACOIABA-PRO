package com.arenaaracoiaba.pro.modules.notifications.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arenaaracoiaba.pro.modules.notifications.data.NotificationRepository
import com.arenaaracoiaba.pro.modules.notifications.model.NotificationItem
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class NotificationsViewModel(
    private val repository: NotificationRepository,
    private val userId: String
) : ViewModel() {

    private val _notifications = MutableStateFlow<List<NotificationItem>>(emptyList())
    val notifications: StateFlow<List<NotificationItem>> = _notifications.asStateFlow()

    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        observeData()
    }

    private fun observeData() {
        viewModelScope.launch {
            _isLoading.value = true
            repository.listenNotifications(userId).collect {
                _notifications.value = it
                _isLoading.value = false
            }
        }
        viewModelScope.launch {
            repository.listenUnreadCount(userId).collect {
                _unreadCount.value = it
            }
        }
    }

    fun markAsRead(notificationId: String) {
        viewModelScope.launch {
            repository.markAsRead(userId, notificationId)
        }
    }

    fun markAllAsRead() {
        viewModelScope.launch {
            repository.markAllAsRead(userId)
        }
    }
}
