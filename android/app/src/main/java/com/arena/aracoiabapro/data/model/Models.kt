package com.sonielguedes.arenaaracoiabapro.data.model

import com.google.firebase.Timestamp

data class UserProfile(
    val uid: String = "",
    val fullName: String = "",
    val email: String = "",
    val role: String = "",
    val status: String = "",
    val teamId: String? = null,
    val teamName: String? = null,
    val championshipId: String? = null
)

data class Team(
    val id: String = "",
    val name: String = "",
    val logoUrl: String? = null,
    val championshipId: String? = null
)

data class Match(
    val id: String = "",
    val teamAId: String = "",
    val teamBId: String = "",
    val teamAName: String = "",
    val teamBName: String = "",
    val scoreA: Int = 0,
    val scoreB: Int = 0,
    val status: String = "SCHEDULED",
    val period: String? = "1T", // 1T, 2T, INT, AC
    val championshipId: String = "",
    val scheduledAt: Timestamp? = null,
    val startedAt: Timestamp? = null,
    val finishedAt: Timestamp? = null,
    val teamIds: List<String> = emptyList()
)

data class RankingTeam(
    val id: String = "",
    val teamId: String = "",
    val teamName: String = "",
    val points: Int = 0,
    val played: Int = 0,
    val won: Int = 0,
    val drawn: Int = 0,
    val lost: Int = 0,
    val goalsFor: Int = 0,
    val goalsAgainst: Int = 0,
    val goalDifference: Int = 0,
    val position: Int = 0
)

data class Scorer(
    val id: String = "",
    val athleteId: String = "",
    val athleteName: String = "",
    val teamName: String = "",
    val goals: Int = 0,
    val position: Int = 0
)

data class AppNotification(
    val id: String = "",
    val title: String = "",
    val message: String = "",
    val type: String = "INFO",
    val read: Boolean = false,
    val createdAt: Timestamp? = null
)

data class MatchEvent(
    val id: String = "",
    val type: String = "GOAL", // GOAL, CARD_YELLOW, CARD_RED, START, END, etc.
    val minute: Int = 0,
    val teamId: String? = null,
    val playerName: String? = null,
    val description: String = "",
    val createdAt: Timestamp? = null
)

data class Championship(
    val id: String = "",
    val name: String = "",
    val status: String = "ACTIVE", // ACTIVE, FINISHED
    val season: String = ""
)

data class FavoriteTeam(
    val teamId: String = "",
    val teamName: String = "",
    val logoUrl: String? = null
)

data class TeamPayment(
    val id: String = "",
    val teamName: String = "",
    val teamLogoUrl: String? = null,
    val championshipName: String = "",
    val amount: String = "",
    val status: String = "PENDING" // PAID, PENDING
)
