// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCyRKvngA1EqlQmgxgxU4465qgRw8TdT08",
    authDomain: "si-gumart.firebaseapp.com",
    projectId: "si-gumart",
    storageBucket: "si-gumart.firebasestorage.app",
    messagingSenderId: "544375918988",
    appId: "1:544375918988:web:3375b3025b7d51ea2546a9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
