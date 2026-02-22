// Auth Functions

// Show/Hide Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle text-green-500 text-xl';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-times-circle text-red-500 text-xl';
    } else if (type === 'warning') {
        toastIcon.className = 'fas fa-exclamation-circle text-yellow-500 text-xl';
    } else if (type === 'info') {
        toastIcon.className = 'fas fa-info-circle text-blue-500 text-xl';
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Validate Gmail
function isGmail(email) {
    return email.toLowerCase().endsWith('@gmail.com');
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validate Gmail
    if (!isGmail(email)) {
        showToast('Hanya akun Gmail yang diizinkan!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user profile exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create basic profile
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                subscription: 'free',
                subscriptionExpiry: null,
                profileCompleted: false,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast('Login berhasil!', 'success');
        
        // Check if super admin
        if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Terjadi kesalahan saat login.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Kata sandi salah. Silakan coba lagi.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Format email tidak valid.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
                break;
        }
        
        showToast(errorMessage, 'error');
    }
    
    hideLoading();
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    // Validate Gmail
    if (!isGmail(email)) {
        showToast('Hanya akun Gmail yang diizinkan!', 'error');
        return;
    }
    
    // Validate password match
    if (password !== passwordConfirm) {
        showToast('Konfirmasi kata sandi tidak cocok!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showToast('Kata sandi minimal 6 karakter!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name
        await user.updateProfile({
            displayName: name
        });
        
        // Create user profile in Firestore
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            displayName: name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            subscription: 'free',
            subscriptionExpiry: null,
            profileCompleted: false,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            // Profile data to be completed
            nip: '',
            nuptk: '',
            tempatLahir: '',
            tanggalLahir: null,
            jenisKelamin: '',
            noHP: '',
            alamat: '',
            // Satuan Pendidikan
            namaSekolah: '',
            npsn: '',
            jenjang: '',
            alamatSekolah: '',
            kotaKabupaten: '',
            provinsi: '',
            namaKepalaSekolah: '',
            nipKepalaSekolah: '',
            // Mata Pelajaran
            mataPelajaran: [],
            // Settings
            whatsAppUpgrade: ''
        });
        
        showToast('Registrasi berhasil! Silakan lengkapi profil Anda.', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Register error:', error);
        
        let errorMessage = 'Terjadi kesalahan saat registrasi.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email sudah terdaftar. Silakan login.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Format email tidak valid.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Kata sandi terlalu lemah.';
                break;
        }
        
        showToast(errorMessage, 'error');
    }
    
    hideLoading();
}

// Handle Google Login
async function handleGoogleLogin() {
    showLoading();
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            hd: 'gmail.com' // Hanya gmail.com
        });
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Validate Gmail
        if (!isGmail(user.email)) {
            await auth.signOut();
            showToast('Hanya akun Gmail yang diizinkan!', 'error');
            hideLoading();
            return;
        }
        
        // Check if user exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create user profile
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                subscription: 'free',
                subscriptionExpiry: null,
                profileCompleted: false,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                nip: '',
                nuptk: '',
                tempatLahir: '',
                tanggalLahir: null,
                jenisKelamin: '',
                noHP: '',
                alamat: '',
                namaSekolah: '',
                npsn: '',
                jenjang: '',
                alamatSekolah: '',
                kotaKabupaten: '',
                provinsi: '',
                namaKepalaSekolah: '',
                nipKepalaSekolah: '',
                mataPelajaran: [],
                whatsAppUpgrade: ''
            });
        } else {
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast('Login berhasil!', 'success');
        
        // Check if super admin
        if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Google login error:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Login dibatalkan.', 'warning');
        } else {
            showToast('Terjadi kesalahan saat login dengan Google.', 'error');
        }
    }
    
    hideLoading();
}

// Handle Forgot Password
async function handleForgotPassword() {
    const email = document.getElementById('loginEmail').value.trim();
    
    if (!email) {
        showToast('Masukkan email terlebih dahulu!', 'warning');
        return;
    }
    
    if (!isGmail(email)) {
        showToast('Hanya akun Gmail yang diizinkan!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Link reset password telah dikirim ke email Anda.', 'success');
    } catch (error) {
        console.error('Forgot password error:', error);
        
        if (error.code === 'auth/user-not-found') {
            showToast('Email tidak terdaftar.', 'error');
        } else {
            showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        }
    }
    
    hideLoading();
}

// Handle Logout
async function handleLogout() {
    showLoading();
    
    try {
        await auth.signOut();
        showToast('Logout berhasil!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Terjadi kesalahan saat logout.', 'error');
    }
    
    hideLoading();
}

// Auth State Observer (for protected pages)
function requireAuth(callback) {
    auth.onAuthStateChanged(user => {
        if (user) {
            callback(user);
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Check Subscription
async function checkSubscription(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            const now = new Date();
            
            if (data.subscription === 'premium' && data.subscriptionExpiry) {
                const expiry = data.subscriptionExpiry.toDate();
                if (expiry > now) {
                    return 'premium';
                } else {
                    // Expired, update to free
                    await db.collection('users').doc(userId).update({
                        subscription: 'free'
                    });
                    return 'free';
                }
            }
            return data.subscription || 'free';
        }
        return 'free';
    } catch (error) {
        console.error('Check subscription error:', error);
        return 'free';
    }
}

// Check if feature is accessible
function canAccessFeature(feature, subscription) {
    if (subscription === 'premium') return true;
    return APP_CONFIG.freeFeatures.includes(feature);
}

console.log('Auth Module Loaded');