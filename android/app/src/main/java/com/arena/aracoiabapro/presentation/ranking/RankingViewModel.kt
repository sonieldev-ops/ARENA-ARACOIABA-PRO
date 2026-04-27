package com.sonielguedes.arenaaracoiabapro.presentation.ranking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.RankingTeam
import com.sonielguedes.arenaaracoiabapro.data.model.Scorer
import com.sonielguedes.arenaaracoiabapro.data.repository.RankingRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed class RankingState {
    object Loading : RankingState()
    data class Success(val ranking: List<RankingTeam>, val scorers: List<Scorer>) : RankingState()
    data class Error(val message: String) : RankingState()
}

class RankingViewModel(
    private val championshipId: String,
    private val repository: RankingRepository = RankingRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<RankingState>(RankingState.Loading)
    val uiState: StateFlow<RankingState> = _uiState.asStateFlow()

    init {
        loadRanking()
    }

    private fun loadRanking() {
        viewModelScope.launch {
            combine(
                repository.observeRanking(championshipId),
                repository.observeTopScorers(championshipId)
            ) { ranking, scorers ->
                RankingState.Success(ranking, scorers)
            }.catch { e ->
                _uiState.value = RankingState.Error(e.message ?: "Erro ao carregar ranking")
            }.collect {
                _uiState.value = it
            }
        }
    }
}
