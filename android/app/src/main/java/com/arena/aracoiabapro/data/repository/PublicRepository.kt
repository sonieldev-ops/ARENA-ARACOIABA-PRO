package com.sonielguedes.arenaaracoiabapro.data.repository

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
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

    fun observeAllLiveMatches(): Flow<List<Match>> = callbackFlow {
        val listener = firestore.collection("matches")
            .whereEqualTo("status", "LIVE")
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val matches = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject<Match>()?.copy(id = doc.id)
                    } catch (e: Exception) {
                        null // Ignora documentos corrompidos em vez de crashar
                    }
                } ?: emptyList()
                trySend(matches)
            }
        awaitClose { listener.remove() }
    }

    fun observeAllMatches(): Flow<List<Match>> = callbackFlow {
        val listener = firestore.collection("matches")
            .orderBy("scheduledAt", Query.Direction.DESCENDING)
            .limit(20)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val matches = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject<Match>()?.copy(id = doc.id)
                    } catch (e: Exception) {
                        null // Ignora documentos corrompidos em vez de crashar
                    }
                } ?: emptyList()
                trySend(matches)
            }
        awaitClose { listener.remove() }
    }

    fun observeRanking(championshipId: String): Flow<List<RankingTeam>> = callbackFlow {
        val listener = firestore.collection("rankings")
            .document(championshipId)
            .collection("teams")
            .orderBy("position")
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    firestore.collection("rankings")
                        .document(championshipId)
                        .collection("teams")
                        .get()
                        .addOnSuccessListener { snap ->
                            val list = snap.documents.mapNotNull { it.toObject<RankingTeam>()?.copy(id = it.id) }
                                .sortedBy { it.position }
                            trySend(list)
                        }
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { it.toObject<RankingTeam>()?.copy(id = it.id) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    fun observeTopScorers(championshipId: String): Flow<List<Scorer>> = callbackFlow {
        val listener = firestore.collection("rankings")
            .document(championshipId)
            .collection("scorers")
            .orderBy("goals", Query.Direction.DESCENDING)
            .limit(10)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val list = snapshot?.documents?.mapNotNull { it.toObject<Scorer>()?.copy(id = it.id) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun getTeams(): List<Team> {
        val snapshot = firestore.collection("teams").get().await()
        return snapshot.documents.mapNotNull { it.toObject<Team>()?.copy(id = it.id) }
    }
}
