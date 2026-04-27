package com.sonielguedes.arenaaracoiabapro.presentation.match

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.Match
import com.sonielguedes.arenaaracoiabapro.data.model.MatchEvent
import com.sonielguedes.arenaaracoiabapro.data.repository.MatchRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class MatchDetailUiState(
    val isLoading: Boolean = true,
    val match: Match? = null,
    val events: List<MatchEvent> = emptyList(),
    val isLive: Boolean = false,
    val elapsedSeconds: Int = 0,
    val error: String? = null,
    val showGoalAnimation: Boolean = false,
    val lastGoalEvent: MatchEvent? = null
)

class MatchDetailViewModel(
    private val matchId: String,
    private val repository: MatchRepository = MatchRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(MatchDetailUiState())
    val uiState: StateFlow<MatchDetailUiState> = _uiState.asStateFlow()

    private val knownGoalEvents = mutableSetOf<String>()

    init {
        // loadMatchDetails() // Comentado para simulação
        simulateMatch()
        startTimer()
    }

    private fun simulateMatch() {
        viewModelScope.launch {
            val mockMatch = Match(
                id = matchId,
                teamAName = "Leões do Norte",
                teamBName = "Guerreiros",
                scoreA = 0,
                scoreB = 0,
                status = "LIVE",
                period = "1T",
                startedAt = com.google.firebase.Timestamp.now()
            )
            
            _uiState.update { it.copy(isLoading = false, match = mockMatch, isLive = true) }

            delay(3000)
            // Simula Cartão Amarelo
            val yellowCard = MatchEvent(
                id = "e1",
                type = "CARD_YELLOW",
                minute = 15,
                playerName = "Carlos Silva",
                description = "Falta tática"
            )
            _uiState.update { it.copy(events = listOf(yellowCard)) }

            delay(5000)
            // Simula GOL
            val goal = MatchEvent(
                id = "e2",
                type = "GOAL",
                minute = 32,
                teamId = "", // Simulando para o time A
                playerName = "Roberto",
                description = "Golaço de fora da área!"
            )
            val updatedMatch = mockMatch.copy(scoreA = 1)
            detectNewGoals(listOf(goal))
            _uiState.update { it.copy(match = updatedMatch, events = listOf(goal, yellowCard)) }

            delay(5000)
            // Simula Segundo GOL
            val goal2 = MatchEvent(
                id = "e3",
                type = "GOAL",
                minute = 45,
                teamId = "away", // Simulando para o time B
                playerName = "Souza",
                description = "Empate no último minuto!"
            )
            val finalMatch = updatedMatch.copy(scoreB = 1)
            detectNewGoals(listOf(goal2, goal, yellowCard))
            _uiState.update { it.copy(match = finalMatch, events = listOf(goal2, goal, yellowCard)) }

            delay(5000)
            // Finaliza a partida
            val finishedMatch = finalMatch.copy(
                status = "FINISHED",
                period = "FIM",
                finishedAt = com.google.firebase.Timestamp.now()
            )
            _uiState.update { it.copy(match = finishedMatch, isLive = false) }
        }
    }

    private fun loadMatchDetails() {
        viewModelScope.launch {
            combine(
                repository.observeMatchDetail(matchId),
                repository.observeMatchEvents(matchId)
            ) { match, events ->
                if (match != null) {
                    detectNewGoals(events)
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            match = match,
                            events = events,
                            isLive = match.status == "LIVE"
                        )
                    }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "Partida não encontrada") }
                }
            }.catch { e ->
                _uiState.update { it.copy(isLoading = false, error = e.message ?: "Erro ao carregar detalhes") }
            }.collect()
        }
    }

    private fun startTimer() {
        viewModelScope.launch {
            while (true) {
                val match = _uiState.value.match
                val startedAt = match?.startedAt?.toDate()
                
                if (match?.status == "LIVE" && startedAt != null) {
                    val elapsed = (System.currentTimeMillis() - startedAt.time) / 1000
                    _uiState.update { it.copy(elapsedSeconds = elapsed.toInt()) }
                }
                delay(1000)
            }
        }
    }

    private fun detectNewGoals(events: List<MatchEvent>) {
        val newGoals = events.filter { it.type == "GOAL" && !knownGoalEvents.contains(it.id) }
        if (newGoals.isNotEmpty()) {
            val lastGoal = newGoals.maxByOrNull { it.minute }
            lastGoal?.let { triggerGoalAnimation(it) }
            newGoals.forEach { knownGoalEvents.add(it.id) }
        }
    }

    private fun triggerGoalAnimation(event: MatchEvent) {
        viewModelScope.launch {
            _uiState.update { it.copy(showGoalAnimation = true, lastGoalEvent = event) }
            delay(4000)
            _uiState.update { it.copy(showGoalAnimation = false) }
        }
    }
}
