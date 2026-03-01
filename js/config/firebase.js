/**
 * AGSA - Admin Guru Super App
 * Firebase Configuration
 * 
 * File ini berisi konfigurasi Firebase dan inisialisasi services.
 * JANGAN UBAH konfigurasi ini kecuali diminta.
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDe4ie2wSPEpNbAgWP-q03vTuHyxc9Jj3E",
    authDomain: "agsa-e5b08.firebaseapp.com",
    projectId: "agsa-e5b08",
    storageBucket: "agsa-e5b08.firebasestorage.app",
    messagingSenderId: "916052746331",
    appId: "1:916052746331:web:357cbadbfd8658f1689f7e",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore Settings
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence not available');
        }
    });

// Auth State Observer
let currentUser = null;

auth.onAuthStateChanged((user) => {
    currentUser = user;
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
});

// Export Firebase services
window.firebaseServices = {
    auth,
    db,
    getCurrentUser: () => currentUser,
    isAuthenticated: () => !!currentUser,
    serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
    arrayUnion: (...elements) => firebase.firestore.FieldValue.arrayUnion(...elements),
    arrayRemove: (...elements) => firebase.firestore.FieldValue.arrayRemove(...elements),
    increment: (n) => firebase.firestore.FieldValue.increment(n),
    deleteField: () => firebase.firestore.FieldValue.delete()
};

console.log('🔥 Firebase initialized successfully');