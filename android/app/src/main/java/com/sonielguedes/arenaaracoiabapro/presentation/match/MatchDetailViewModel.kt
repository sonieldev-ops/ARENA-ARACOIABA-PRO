package com.sonielguedes.arenaaracoiabapro.presentation.match

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.Match
import com.sonielguedes.arenaaracoiabapro.data.model.MatchEvent
import com.sonielguedes.arenaaracoiabapro.data.repository.MatchRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed class MatchDetailState {
    object Loading : MatchDetailState()
    data class Success(val match: Match, val events: List<MatchEvent>) : MatchDetailState()
    data class Error(val message: String) : MatchDetailState()
}

class MatchDetailViewModel(
    private val matchId: String,
    private val repository: MatchRepository = MatchRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow<MatchDetailState>(MatchDetailState.Loading)
    val uiState: StateFlow<MatchDetailState> = _uiState.asStateFlow()

    init {
        loadMatchDetails()
    }

    private fun loadMatchDetails() {
        viewModelScope.launch {
            combine(
                repository.observeMatchDetail(matchId),
                repository.observeMatchEvents(matchId)
            ) { match, events ->
                if (match != null) {
                    MatchDetailState.Success(match, events)
                } else {
                    MatchDetailState.Error("Partida não encontrada")
                }
            }.collect {
                _uiState.value = it
            }
        }
    }
}
