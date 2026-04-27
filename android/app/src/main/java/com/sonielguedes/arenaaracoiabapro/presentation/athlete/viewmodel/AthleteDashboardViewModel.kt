package com.sonielguedes.arenaaracoiabapro.presentation.athlete.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.sonielguedes.arenaaracoiabapro.data.model.*
import com.sonielguedes.arenaaracoiabapro.data.repository.AthleteRepository
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
        val notifications: List<AppNotification>
    ) : DashboardState()
    data class NoTeam(val profile: UserProfile) : DashboardState()
    data class Error(val message: String) : DashboardState()
}

class AthleteDashboardViewModel(
    private val repository: AthleteRepository = AthleteRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardState>(DashboardState.Loading)
    val uiState: StateFlow<DashboardState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

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
                    profile.championshipId?.let { repository.observeRanking(it) } ?: flowOf(emptyList()),
                    profile.championshipId?.let { repository.observeTopScorers(it) } ?: flowOf(emptyList()),
                    repository.observeNotifications(profile.uid)
                ) { liveMatch, matches, ranking, scorers, notifications ->
                    DashboardState.Success(
                        profile = profile,
                        liveMatch = liveMatch,
                        matches = matches,
                        ranking = ranking,
                        scorers = scorers,
                        notifications = notifications
                    )
                }.collect {
                    _uiState.value = it
                }

            } catch (e: Exception) {
                _uiState.value = DashboardState.Error(e.message ?: "Erro desconhecido")
            }
        }
    }
}
