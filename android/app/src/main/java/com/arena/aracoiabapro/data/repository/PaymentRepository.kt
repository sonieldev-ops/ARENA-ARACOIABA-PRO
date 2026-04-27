package com.sonielguedes.arenaaracoiabapro.data.repository

import com.sonielguedes.arenaaracoiabapro.data.model.TeamPayment
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class PaymentRepository {
    fun getTeamPayments(): Flow<List<TeamPayment>> = flow {
        val payments = listOf(
            TeamPayment(
                id = "1",
                teamName = "VILA REAL",
                championshipName = "SONIELPRO",
                amount = "R$ 500,00",
                status = "PAID"
            ),
            TeamPayment(
                id = "2",
                teamName = "SONIELPC",
                championshipName = "SONIELPRO",
                amount = "R$ 500,00",
                status = "PENDING"
            )
        )
        emit(payments)
    }
}
