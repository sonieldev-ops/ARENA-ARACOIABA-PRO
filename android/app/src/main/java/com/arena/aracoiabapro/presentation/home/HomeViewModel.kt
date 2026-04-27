package com.sonielguedes.arenaaracoiabapro.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.*
import com.sonielguedes.arenaaracoiabapro.data.repository.AthleteRepository
import com.sonielguedes.arenaaracoiabapro.data.repository.PublicRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed class HomeState {
    object Loading : HomeState()
    data class Success(
        val activeChampionship: Championship?,
        val liveMatches: List<Match>,
        val recentMatches: List<Match>,
        val ranking: List<RankingTeam>,
        val scorers: List<Scorer>
    ) : HomeState()
    data class Error(val message: String) : HomeState()
}

class HomeViewModel(
    private val publicRepository: PublicRepository = PublicRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeState>(HomeState.Loading)
    val uiState: StateFlow<HomeState> = _uiState.asStateFlow()

    init {
        loadHomeData()
    }

    fun loadHomeData() {
        viewModelScope.launch {
            publicRepository.observeActiveChampionships().collectLatest { championships ->
                val activeChamp = championships.firstOrNull()
                if (activeChamp != null) {
                    combine(
                        publicRepository.observeAllLiveMatches(),
                        publicRepository.observeAllMatches(),
                        publicRepository.observeRanking(activeChamp.id),
                        publicRepository.observeTopScorers(activeChamp.id)
                    ) { live, recent, ranking, scorers ->
                        HomeState.Success(
                            activeChampionship = activeChamp,
                            liveMatches = live,
                            recentMatches = recent,
                            ranking = ranking.take(5),
                            scorers = scorers.take(5)
                        )
                    }.collect {
                        _uiState.value = it
                    }
                } else {
                    _uiState.value = HomeState.Success(null, emptyList(), emptyList(), emptyList(), emptyList())
                }
            }
        }
    }
}
