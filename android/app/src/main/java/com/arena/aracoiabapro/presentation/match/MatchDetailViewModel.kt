package com.sonielguedes.arenaaracoiabapro.presentation.match

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.Match
import com.sonielguedes.arenaaracoiabapro.data.model.MatchEvent
import com.sonielguedes.arenaaracoiabapro.data.repository.MatchRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

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

    /**
     * Calcula o minuto atual da partida baseado nos segundos decorridos.
     * Futebol: 0-59s é o minuto 1, 60-119s é o minuto 2, etc.
     */
    private fun getCurrentMatchMinute(): Int {
        return (uiState.value.elapsedSeconds / 60) + 1
    }

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
                scoreA = 0,
                scoreB = 0,
                status = "LIVE",
                period = "1T",
                championshipId = "TRABALHADORES",
                startedAt = com.google.firebase.Timestamp.now()
            )
            
            _uiState.update { it.copy(isLoading = false, match = mockMatch, isLive = true) }

            delay(3000)
            // Simula Cartão Amarelo
            handleEventAction("CARD_YELLOW", "Carlos Silva", "Falta tática")

            delay(5000)
            // Simula GOL
            _uiState.update { it.copy(match = it.match?.copy(scoreA = 1)) }
            handleEventAction(
                type = "GOAL",
                playerName = "Roberto",
                description = "Golaço de fora da área!",
                teamId = "home"
            )

            delay(5000)
            // Simula Segundo GOL
            _uiState.update { it.copy(match = it.match?.copy(scoreB = 1)) }

            handleEventAction(
                type = "GOAL",
                playerName = "Souza",
                description = "Empate no último minuto!",
                teamId = "away"
            )

            delay(5000)
            // Finaliza a partida
            _uiState.update { it.copy(match = it.match?.copy(
                status = "FINISHED",
                period = "FIM",
                finishedAt = com.google.firebase.Timestamp.now()
            ), isLive = false) }
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
     * Função chamada pela UI quando o usuário aperta um botão de ação (Gol, Cartão, etc).
     * Ela captura automaticamente o minuto da partida no momento do clique.
     */
    fun handleEventAction(
        type: String,
        playerName: String,
        description: String,
        teamId: String = ""
    ) {
        val currentMinute = getCurrentMatchMinute()
        val newEvent = MatchEvent(
            id = UUID.randomUUID().toString(),
            type = type,
            minute = currentMinute,
            playerName = playerName,
            description = description,
            teamId = teamId
        )

        // Em produção, aqui você chamaria o repository para salvar no Firestore
        // repository.addMatchEvent(matchId, newEvent)
        
        updateEvents(uiState.value.events + newEvent)
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
