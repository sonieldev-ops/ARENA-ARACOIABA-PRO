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
    val lastGoalEvent: MatchEvent? = null,
    val activeAlert: MatchEvent? = null
)

class MatchDetailViewModel(
    private val matchId: String,
    private val repository: MatchRepository = MatchRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(MatchDetailUiState())
    val uiState: StateFlow<MatchDetailUiState> = _uiState.asStateFlow()

    private val knownEvents = mutableSetOf<String>()

    init {
        // loadMatchDetails() // Comentado para simulação
        simulateMatch()
        startTimer()
    }

    private fun simulateMatch() {
        viewModelScope.launch {
            val mockMatch = Match(
                id = matchId,
                teamAName = "Vila",
                teamBName = "Sonifc",
                scoreA = 1,
                scoreB = 0,
                status = "LIVE",
                period = "1T",
                championshipId = "TRABALHADORES",
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
            _uiState.update { it.copy(match = updatedMatch) }
            updateEvents(listOf(goal, yellowCard))

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
            _uiState.update { it.copy(match = finalMatch) }
            updateEvents(listOf(goal2, goal, yellowCard))

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
                    _uiState.update { it.copy(
                        isLoading = false,
                        match = match,
                        isLive = match.status == "LIVE"
                    )}
                    updateEvents(events)
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
            // Otimização: O loop do timer só é ativado quando a partida está AO VIVO
            // Isso reduz a carga no Looper do Android e evita conflitos de sincronização.
            _uiState.map { it.isLive }.distinctUntilChanged().collectLatest { isLive ->
                if (isLive) {
                    while (true) {
                        val match = _uiState.value.match
                        val startedAt = match?.startedAt?.toDate()
                        if (startedAt != null) {
                            val elapsed = (System.currentTimeMillis() - startedAt.time) / 1000
                            _uiState.update { it.copy(elapsedSeconds = elapsed.toInt()) }
                        }
                        delay(1000)
                    }
                }
            }
        }
    }

    /**
     * Centraliza a atualização de eventos, garantindo ordenação e detecção de gols.
     * A ordenação decrescente (mais recentes primeiro) evita que os cards se sobreponham visualmente.
     */
    private fun updateEvents(events: List<MatchEvent>) {
        val sortedEvents = events.sortedByDescending { it.minute }
        
        val newImportantEvents = sortedEvents.filter { 
            (it.type == "GOAL" || it.type.startsWith("CARD_")) && !knownEvents.contains(it.id) 
        }

        if (newImportantEvents.isNotEmpty()) {
            // Pegamos o evento mais recente (o primeiro da lista ordenada) para exibir o alerta
            val latestEvent = newImportantEvents.first()
            triggerEventAlert(latestEvent)
            newImportantEvents.forEach { knownEvents.add(it.id) }
        }

        _uiState.update { it.copy(events = sortedEvents) }
    }

    private fun triggerEventAlert(event: MatchEvent) {
        viewModelScope.launch {
            if (event.type == "GOAL") {
                _uiState.update { it.copy(showGoalAnimation = true, lastGoalEvent = event) }
                delay(4000)
                _uiState.update { it.copy(showGoalAnimation = false) }
            } else if (event.type.startsWith("CARD_")) {
                // Exibe um alerta visual para cartões amarelos e vermelhos
                _uiState.update { it.copy(activeAlert = event) }
                delay(3000)
                _uiState.update { it.copy(activeAlert = null) }
            }
        }
    }
}
