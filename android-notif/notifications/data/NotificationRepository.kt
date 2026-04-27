package com.arenaaracoiaba.pro.modules.notifications.data

import com.arenaaracoiaba.pro.modules.notifications.model.NotificationItem
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class NotificationRepository(private val db: FirebaseFirestore) {

    fun listenUnreadCount(userId: String): Flow<Int> = callbackFlow {
        val docRef = db.collection("users").document(userId)
            .collection("metadata").document("notifications")
        
        val subscription = docRef.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener
            val count = snapshot?.getLong("unreadCount")?.toInt() ?: 0
            trySend(count)
        }
        awaitClose { subscription.remove() }
    }

    fun listenNotifications(userId: String, limit: Long = 50): Flow<List<NotificationItem>> = callbackFlow {
        val query = db.collection("users").document(userId)
            .collection("notifications")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(limit)

        val subscription = query.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener
            val notifications = snapshot?.toObjects(NotificationItem::class.java) ?: emptyList()
            trySend(notifications)
        }
        awaitClose { subscription.remove() }
    }

    suspend fun markAsRead(userId: String, notificationId: String) {
        val batch = db.batch()
        val docRef = db.collection("users").document(userId)
            .collection("notifications").document(notificationId)
        val metaRef = db.collection("users").document(userId)
            .collection("metadata").document("notifications")

        batch.update(docRef, "isRead", true, "readAt", com.google.firebase.Timestamp.now())
        batch.update(metaRef, "unreadCount", com.google.firebase.firestore.FieldValue.increment(-1))
        
        batch.commit().await()
    }

    suspend fun markAllAsRead(userId: String) {
        // Implementação similar ao Web, idealmente via Cloud Function para escala.
        val unreadDocs = db.collection("users").document(userId)
            .collection("notifications")
            .whereEqualTo("isRead", false)
            .limit(50)
            .get()
            .await()

        if (unreadDocs.isEmpty) return

        val batch = db.batch()
        unreadDocs.forEach { doc ->
            batch.update(doc.reference, "isRead", true, "readAt", com.google.firebase.Timestamp.now())
        }
        
        val metaRef = db.collection("users").document(userId)
            .collection("metadata").document("notifications")
        batch.update(metaRef, "unreadCount", 0)

        batch.commit().await()
    }
}
