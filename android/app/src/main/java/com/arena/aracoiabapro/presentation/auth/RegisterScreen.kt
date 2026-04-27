package com.sonielguedes.arenaaracoiabapro.presentation.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sonielguedes.arenaaracoiabapro.ui.theme.*

@Composable
fun RegisterScreen(
    onRegisterSuccess: () -> Unit,
    onBackToLogin: () -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf("USER") } // USER ou OWNER
    
    val authState by viewModel.authState.collectAsState()

    LaunchedEffect(authState) {
        if (authState is AuthState.Success) {
            onRegisterSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ArenaBlack)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "CRIAR CONTA", style = MaterialTheme.typography.headlineMedium, color = ArenaGold, fontWeight = FontWeight.Black)
        
        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nome Completo", color = ArenaMuted) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = ArenaGold, unfocusedBorderColor = ArenaCard, focusedTextColor = ArenaText, unfocusedTextColor = ArenaText),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("E-mail", color = ArenaMuted) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = ArenaGold, unfocusedBorderColor = ArenaCard, focusedTextColor = ArenaText, unfocusedTextColor = ArenaText),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Senha", color = ArenaMuted) },
            modifier = Modifier.fillMaxWidth(),
            visualTransformation = PasswordVisualTransformation(),
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = ArenaGold, unfocusedBorderColor = ArenaCard, focusedTextColor = ArenaText, unfocusedTextColor = ArenaText),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text("Eu sou:", color = ArenaText, modifier = Modifier.align(Alignment.Start))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            RoleOption("Torcedor", selectedRole == "USER", Modifier.weight(1f)) { selectedRole = "USER" }
            RoleOption("Dono de Time", selectedRole == "OWNER", Modifier.weight(1f)) { selectedRole = "OWNER" }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { viewModel.register(email, password, name, selectedRole) },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = ArenaGold),
            shape = RoundedCornerShape(12.dp),
            enabled = authState !is AuthState.Loading
        ) {
            if (authState is AuthState.Loading) {
                CircularProgressIndicator(color = ArenaBlack, modifier = Modifier.size(24.dp))
            } else {
                Text("CADASTRAR", color = ArenaBlack, fontWeight = FontWeight.Bold)
            }
        }

        TextButton(onClick = onBackToLogin) {
            Text("Já tenho conta. Entrar", color = ArenaMuted)
        }

        if (authState is AuthState.Error) {
            Text(text = (authState as AuthState.Error).message, color = Color.Red, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun RoleOption(label: String, isSelected: Boolean, modifier: Modifier, onClick: () -> Unit) {
    Surface(
        modifier = modifier.clickable { onClick() },
        color = if (isSelected) ArenaGold else ArenaCard,
        shape = RoundedCornerShape(8.dp)
    ) {
        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(12.dp)) {
            Text(label, color = if (isSelected) ArenaBlack else ArenaText, fontWeight = FontWeight.Bold)
        }
    }
}
