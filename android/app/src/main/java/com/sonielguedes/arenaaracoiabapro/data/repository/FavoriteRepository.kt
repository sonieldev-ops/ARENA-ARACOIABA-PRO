package com.sonielguedes.arenaaracoiabapro.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.toObject
import com.sonielguedes.arenaaracoiabapro.data.model.FavoriteTeam
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FavoriteRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun observeFavorites(userId: String): Flow<List<FavoriteTeam>> = callbackFlow {
        val listener = firestore.collection("users")
            .document(userId)
            .collection("favorites")
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val list = snapshot?.documents?.mapNotNull { it.toObject<FavoriteTeam>() } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun addFavorite(userId: String, favorite: FavoriteTeam) {
        firestore.collection("users")
            .document(userId)
            .collection("favorites")
            .document(favorite.teamId)
            .set(favorite)
            .await()
    }

    suspend fun removeFavorite(userId: String, teamId: String) {
        firestore.collection("users")
            .document(userId)
            .collection("favorites")
            .document(teamId)
            .delete()
            .await()
    }
}
