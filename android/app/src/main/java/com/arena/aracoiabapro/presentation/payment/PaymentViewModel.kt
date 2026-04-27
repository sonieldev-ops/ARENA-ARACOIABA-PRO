package com.sonielguedes.arenaaracoiabapro.presentation.payment

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sonielguedes.arenaaracoiabapro.data.model.TeamPayment
import com.sonielguedes.arenaaracoiabapro.data.repository.PaymentRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class PaymentViewModel : ViewModel() {
    private val repository = PaymentRepository()
    
    private val _uiState = MutableStateFlow<List<TeamPayment>>(emptyList())
    val uiState: StateFlow<List<TeamPayment>> = _uiState.asStateFlow()

    init {
        loadPayments()
    }

    private fun loadPayments() {
        viewModelScope.launch {
            repository.getTeamPayments().collect {
                _uiState.value = it
            }
        }
    }
}
