package com.sonielguedes.arenaaracoiabapro.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.toObject
import com.sonielguedes.arenaaracoiabapro.data.model.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class PublicRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun observeActiveChampionships(): Flow<List<Championship>> = callbackFlow {
        val listener = firestore.collection("championships")
            .whereEqualTo("status", "ACTIVE")
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val list = snapshot?.documents?.mapNotNull { it.toObject<Championship>()?.copy(id = it.id) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun getTeams(): List<Team> {
        val snapshot = firestore.collection("teams").get().await()
        return snapshot.documents.mapNotNull { it.toObject<Team>()?.copy(id = it.id) }
    }
}
