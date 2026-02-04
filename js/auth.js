// =====================================================
// AUTH MODULE - auth.js
// =====================================================

import { auth, db, googleProvider } from './firebase-config.js';
import { 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Current User Data
let currentUser = null;
let currentUserData = null;
let currentSchoolData = null;

// Auth State Observer
export function initAuth(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // Check if user has profile
            const userData = await getUserData(user.uid);
            if (userData) {
                currentUserData = userData;
                // Get school data
                currentSchoolData = await getSchoolData(userData.npsn);
                callback({ status: 'authenticated', user, userData, schoolData: currentSchoolData });
            } else {
                callback({ status: 'needSetup', user });
            }
        } else {
            currentUser = null;
            currentUserData = null;
            currentSchoolData = null;
            callback({ status: 'unauthenticated' });
        }
    });
}

// Google Login
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Get User Data from Firestore
export async function getUserData(uid) {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Get user data error:', error);
        return null;
    }
}

// Check if NPSN exists (school already registered)
export async function checkNPSN(npsn) {
    try {
        const schoolRef = doc(db, 'schools', npsn);
        const schoolSnap = await getDoc(schoolRef);
        if (schoolSnap.exists()) {
            return { exists: true, data: schoolSnap.data() };
        }
        return { exists: false };
    } catch (error) {
        console.error('Check NPSN error:', error);
        return { exists: false, error: error.message };
    }
}

// Get School Data
export async function getSchoolData(npsn) {
    try {
        const schoolRef = doc(db, 'schools', npsn);
        const schoolSnap = await getDoc(schoolRef);
        if (schoolSnap.exists()) {
            return { id: schoolSnap.id, ...schoolSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Get school data error:', error);
        return null;
    }
}

// Save User Profile (First Time Setup)
export async function saveUserProfile(data) {
    try {
        const uid = auth.currentUser.uid;
        const email = auth.currentUser.email;
        const photoURL = auth.currentUser.photoURL;
        
        // Check if school exists
        const schoolCheck = await checkNPSN(data.npsn);
        
        // Prepare user data
        const userData = {
            uid: uid,
            email: email,
            photoURL: photoURL,
            namaGuru: data.namaGuru,
            nip: data.nip || '',
            npsn: data.npsn,
            jenjang: data.jenjang,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save user data
        await setDoc(doc(db, 'users', uid), userData);
        
        // If school doesn't exist, create it
        if (!schoolCheck.exists) {
            const schoolData = {
                npsn: data.npsn,
                namaSekolah: data.namaSekolah,
                alamat: data.alamatSekolah || '',
                jenjang: data.jenjang,
                kepalaSekolah: data.kepalaSekolah || '',
                nipKepsek: data.nipKepsek || '',
                createdAt: new Date().toISOString(),
                createdBy: uid
            };
            await setDoc(doc(db, 'schools', data.npsn), schoolData);
            currentSchoolData = schoolData;
        } else {
            currentSchoolData = schoolCheck.data;
        }
        
        currentUserData = userData;
        return { success: true, userData, schoolData: currentSchoolData };
    } catch (error) {
        console.error('Save profile error:', error);
        return { success: false, error: error.message };
    }
}

// Update User Profile
export async function updateUserProfile(data) {
    try {
        const uid = auth.currentUser.uid;
        const userRef = doc(db, 'users', uid);
        
        await setDoc(userRef, {
            ...currentUserData,
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        currentUserData = { ...currentUserData, ...data };
        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

// Update School Data (Only for authorized users)
export async function updateSchoolData(npsn, data) {
    try {
        const schoolRef = doc(db, 'schools', npsn);
        await setDoc(schoolRef, {
            ...data,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        currentSchoolData = { ...currentSchoolData, ...data };
        return { success: true };
    } catch (error) {
        console.error('Update school error:', error);
        return { success: false, error: error.message };
    }
}

// Get all teachers from same school
export async function getSchoolTeachers(npsn) {
    try {
        const q = query(collection(db, 'users'), where('npsn', '==', npsn));
        const querySnapshot = await getDocs(q);
        const teachers = [];
        querySnapshot.forEach((doc) => {
            teachers.push({ id: doc.id, ...doc.data() });
        });
        return teachers;
    } catch (error) {
        console.error('Get teachers error:', error);
        return [];
    }
}

// Getters
export function getCurrentUser() {
    return currentUser;
}

export function getCurrentUserData() {
    return currentUserData;
}

export function getCurrentSchoolData() {
    return currentSchoolData;
}