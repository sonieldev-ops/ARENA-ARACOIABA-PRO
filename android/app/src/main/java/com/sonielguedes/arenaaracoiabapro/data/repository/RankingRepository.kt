package com.sonielguedes.arenaaracoiabapro.data.repository

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.toObject
import com.sonielguedes.arenaaracoiabapro.data.model.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class RankingRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    fun observeRanking(championshipId: String): Flow<List<RankingTeam>> = callbackFlow {
        val listener = firestore.collection("rankings")
            .document(championshipId)
            .collection("teams")
            .orderBy("position")
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    // Fallback local sort if index not ready
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
            .limit(20)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val list = snapshot?.documents?.mapNotNull { it.toObject<Scorer>()?.copy(id = it.id) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }
}
