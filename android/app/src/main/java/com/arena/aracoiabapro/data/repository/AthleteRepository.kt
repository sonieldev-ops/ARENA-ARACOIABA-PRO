package com.sonielguedes.arenaaracoiabapro.data.repository

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.toObject
import com.sonielguedes.arenaaracoiabapro.data.model.*
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class AthleteRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val TAG = "ARENA_FIREBASE"

    suspend fun getCurrentUserProfile(): UserProfile {
        val uid = auth.currentUser?.uid ?: throw Exception("User not authenticated")
        Log.d(TAG, "Fetching profile for uid=$uid")
        
        val doc = firestore.collection("users").document(uid).get().await()
        val profile = doc.toObject<UserProfile>() ?: throw Exception("Profile not found")
        
        Log.d(TAG, "Profile loaded: $profile")
        
        // Se championshipId for nulo no user, tenta pegar do team
        if (profile.championshipId == null && profile.teamId != null) {
            try {
                val team = getTeam(profile.teamId)
                return profile.copy(championshipId = team.championshipId)
            } catch (e: Exception) {
                Log.e(TAG, "Error fetching team for championshipId fallback", e)
            }
        }
        
        return profile
    }

    suspend fun getTeam(teamId: String): Team {
        val doc = firestore.collection("teams").document(teamId).get().await()
        return doc.toObject<Team>()?.copy(id = doc.id) ?: throw Exception("Team not found")
    }

    fun observeLiveMatch(teamId: String): Flow<Match?> = callbackFlow {
        Log.d(TAG, "Observing live match for teamId=$teamId")
        
        // Fallback: search by teamAId or teamBId if teamIds array doesn't exist
        val listener = firestore.collection("matches")
            .whereEqualTo("status", "LIVE")
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.e(TAG, "Live match error", e)
                    return@addSnapshotListener
                }
                
                val match = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject<Match>()?.copy(id = doc.id)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error deserializing match ${doc.id}", e)
                        null
                    }
                }?.firstOrNull { it.teamAId == teamId || it.teamBId == teamId || it.teamIds.contains(teamId) }
                
                Log.d(TAG, "Live match update: ${match?.id}")
                trySend(match)
            }
        awaitClose { listener.remove() }
    }

    fun observeTeamMatches(teamId: String): Flow<List<Match>> = callbackFlow {
        Log.d(TAG, "Observing matches for teamId=$teamId")
        
        // Firestore whereArrayContains is preferred if teamIds exists
        val listener = firestore.collection("matches")
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.e(TAG, "Matches error", e)
                    return@addSnapshotListener
                }
                
                val matches = snapshot?.documents?.mapNotNull { doc ->
                    try {
                        doc.toObject<Match>()?.copy(id = doc.id)
                    } catch (e: Exception) {
                        Log.e(TAG, "Error deserializing match ${doc.id}", e)
                        null
                    }
                }?.filter { it.teamAId == teamId || it.teamBId == teamId || it.teamIds.contains(teamId) }
                    ?.sortedByDescending { it.scheduledAt }
                    ?: emptyList()
                
                Log.d(TAG, "Matches loaded: ${matches.size}")
                trySend(matches)
            }
        awaitClose { listener.remove() }
    }

    fun observeRanking(championshipId: String): Flow<List<RankingTeam>> = callbackFlow {
        Log.d(TAG, "Observing ranking for championshipId=$championshipId")
        val listener = firestore.collection("rankings")
            .document(championshipId)
            .collection("teams")
            .orderBy("position")
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.e(TAG, "Ranking error", e)
                    // If position index doesn't exist yet, try without order and sort locally
                    firestore.collection("rankings")
                        .document(championshipId)
                        .collection("teams")
                        .get()
                        .addOnSuccessListener { snap ->
                            val list = snap.documents.mapNotNull { it.toObject<RankingTeam>()?.copy(id = it.id) }
                                .sortedWith(compareByDescending<RankingTeam> { it.points }
                                    .thenByDescending { it.goalDifference }
                                    .thenByDescending { it.goalsFor })
                            trySend(list)
                        }
                    return@addSnapshotListener
                }
                
                val list = snapshot?.documents?.mapNotNull { it.toObject<RankingTeam>()?.copy(id = it.id) } ?: emptyList()
                Log.d(TAG, "Ranking loaded: ${list.size}")
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    fun observeTopScorers(championshipId: String): Flow<List<Scorer>> = callbackFlow {
        Log.d(TAG, "Observing scorers for championshipId=$championshipId")
        val listener = firestore.collection("rankings")
            .document(championshipId)
            .collection("scorers")
            .orderBy("goals", Query.Direction.DESCENDING)
            .limit(10)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.e(TAG, "Scorers error", e)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { it.toObject<Scorer>()?.copy(id = it.id) } ?: emptyList()
                Log.d(TAG, "Scorers loaded: ${list.size}")
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
                        Log.e(TAG, "Error deserializing live match ${doc.id}", e)
                        null
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
                        Log.e(TAG, "Error deserializing match history ${doc.id}", e)
                        null
                    }
                } ?: emptyList()
                trySend(matches)
            }
        awaitClose { listener.remove() }
    }

    fun observeNotifications(userId: String): Flow<List<AppNotification>> = callbackFlow {
        Log.d(TAG, "Observing notifications for userId=$userId")
        val listener = firestore.collection("users")
            .document(userId)
            .collection("notifications")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .limit(20)
            .addSnapshotListener { snapshot, e ->
                if (e != null) {
                    Log.e(TAG, "Notifications error", e)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { it.toObject<AppNotification>()?.copy(id = it.id) } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    fun observeMatchEvents(matchId: String): Flow<List<MatchEvent>> = callbackFlow {
        val listener = firestore.collection("matches")
            .document(matchId)
            .collection("events")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, e ->
                if (e != null) return@addSnapshotListener
                val events = snapshot?.documents?.mapNotNull { it.toObject<MatchEvent>()?.copy(id = it.id) } ?: emptyList()
                trySend(events)
            }
        awaitClose { listener.remove() }
    }

    suspend fun markNotificationAsRead(userId: String, notificationId: String) {
        firestore.collection("users")
            .document(userId)
            .collection("notifications")
            .document(notificationId)
            .update("read", true)
            .await()
    }

    suspend fun toggleFavoriteTeam(userId: String, team: FavoriteTeam) {
        val favRef = firestore.collection("users")
            .document(userId)
            .collection("favorites")
            .document(team.teamId)
        
        val doc = favRef.get().await()
        if (doc.exists()) {
            favRef.delete().await()
        } else {
            favRef.set(team).await()
        }
    }

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

}
