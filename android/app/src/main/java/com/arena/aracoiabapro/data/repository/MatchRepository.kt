package com.sonielguedes.arenaaracoiabapro.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.toObject
import com.sonielguedes.arenaaracoiabapro.data.model.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class MatchRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun observeMatchDetail(matchId: String): Flow<Match?> = callbackFlow {
        val listener = firestore.collection("matches").document(matchId)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val match = try {
                    snapshot?.toObject<Match>()?.copy(id = snapshot.id)
                } catch (e: Exception) {
                    null
                }
                trySend(match)
            }
        awaitClose { listener.remove() }
    }

    fun observeMatchEvents(matchId: String): Flow<List<MatchEvent>> = callbackFlow {
        val listener = firestore.collection("matches").document(matchId)
            .collection("events")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val events = snapshot?.documents?.mapNotNull { it.toObject<MatchEvent>()?.copy(id = it.id) } ?: emptyList()
                trySend(events)
            }
        awaitClose { listener.remove() }
    }

    fun observeMatchesByChampionship(championshipId: String): Flow<List<Match>> = callbackFlow {
        val listener = firestore.collection("matches")
            .whereEqualTo("championshipId", championshipId)
            .orderBy("scheduledAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val matches = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject<Match>()?.copy(id = doc.id)
                    } catch (e: Exception) {
                        null
                    }
                } ?: emptyList()
                trySend(matches)
            }
        awaitClose { listener.remove() }
    }
}
