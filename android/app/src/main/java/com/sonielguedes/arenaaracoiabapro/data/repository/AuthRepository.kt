package com.sonielguedes.arenaaracoiabapro.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.toObject
import com.sonielguedes.arenaaracoiabapro.data.model.UserProfile
import kotlinx.coroutines.tasks.await

class AuthRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    val currentUser get() = auth.currentUser
    val isUserLoggedIn get() = auth.currentUser != null

    suspend fun getUserProfile(uid: String): UserProfile? {
        val doc = firestore.collection("users").document(uid).get().await()
        return doc.toObject<UserProfile>()?.copy(uid = doc.id)
    }

    fun logout() {
        auth.signOut()
    }
}
