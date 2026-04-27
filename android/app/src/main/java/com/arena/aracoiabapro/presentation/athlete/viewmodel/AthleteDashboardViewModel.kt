package com.sonielguedes.arenaaracoiabapro.presentation.athlete.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.*
import com.sonielguedes.arenaaracoiabapro.data.repository.AthleteRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed class DashboardState {
    object Loading : DashboardState()
    data class Success(
        val profile: UserProfile,
        val liveMatch: Match?,
        val matches: List<Match>,
        val ranking: List<RankingTeam>,
        val scorers: List<Scorer>,
        val notifications: List<AppNotification>,
        val liveEvents: List<MatchEvent> = emptyList()
    ) : DashboardState()
    data class NoTeam(val profile: UserProfile) : DashboardState()
    data class Error(val message: String) : DashboardState()
}

class AthleteDashboardViewModel(
    private val repository: AthleteRepository = AthleteRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardState>(DashboardState.Loading)
    val uiState: StateFlow<DashboardState> = _uiState.asStateFlow()

    private val _favorites = MutableStateFlow<List<FavoriteTeam>>(emptyList())
    val favorites: StateFlow<List<FavoriteTeam>> = _favorites.asStateFlow()

    init {
        loadDashboardData()
    }

    fun markNotificationAsRead(notificationId: String) {
        val currentState = _uiState.value
        if (currentState is DashboardState.Success) {
            viewModelScope.launch {
                try {
                    repository.markNotificationAsRead(currentState.profile.uid, notificationId)
                } catch (e: Exception) {
                    // Log error
                }
            }
        }
    }

    fun toggleFavorite(team: FavoriteTeam) {
        val currentState = _uiState.value
        if (currentState is DashboardState.Success) {
            viewModelScope.launch {
                try {
                    repository.toggleFavoriteTeam(currentState.profile.uid, team)
                } catch (e: Exception) {
                    // Log error
                }
            }
        }
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = DashboardState.Loading
            try {
                val profile = repository.getCurrentUserProfile()
                
                if (profile.teamId == null) {
                    _uiState.value = DashboardState.NoTeam(profile)
                    return@launch
                }

                combine(
                    repository.observeLiveMatch(profile.teamId),
                    repository.observeTeamMatches(profile.teamId),
                    profile.championshipId?.let { repository.observeRanking(it) } ?: flowOf(emptyList<RankingTeam>()),
                    profile.championshipId?.let { repository.observeTopScorers(it) } ?: flowOf(emptyList<Scorer>()),
                    repository.observeNotifications(profile.uid),
                    repository.observeFavorites(profile.uid)
                ) { flows ->
                    val liveMatch = flows[0] as Match?
                    val matches = flows[1] as List<Match>
                    val ranking = flows[2] as List<RankingTeam>
                    val scorers = flows[3] as List<Scorer>
                    val notifications = flows[4] as List<AppNotification>
                    val favorites = flows[5] as List<FavoriteTeam>

                    _favorites.value = favorites
                    if (liveMatch != null) {
                        repository.observeMatchEvents(liveMatch.id).map { events ->
                            DashboardState.Success(
                                profile = profile,
                                liveMatch = liveMatch,
                                matches = matches,
                                ranking = ranking,
                                scorers = scorers,
                                notifications = notifications,
                                liveEvents = events
                            )
                        }
                    } else {
                        flowOf(DashboardState.Success(
                            profile = profile,
                            liveMatch = null,
                            matches = matches,
                            ranking = ranking,
                            scorers = scorers,
                            notifications = notifications,
                            liveEvents = emptyList()
                        ))
                    }
                }.flattenConcat().collect {
                    _uiState.value = it
                }

            } catch (e: Exception) {
                _uiState.value = DashboardState.Error(e.message ?: "Erro desconhecido")
            }
        }
    }
}
