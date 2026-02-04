// =====================================================
// GURU SMART - MAIN APPLICATION (app.js)
// =====================================================

import { 
    db, 
    auth,
    googleProvider,
    collection, 
    doc, 
    addDoc, 
    setDoc,
    getDoc,
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    COLLECTIONS,
    DIMENSI_PROFIL_LULUSAN,
    JENJANG,
    DEFAULT_SUBJECTS,
    getFaseFromKelas,
    getKelasFromFase
} from './firebase-config.js';

// =====================================================
// GLOBAL STATE
// =====================================================
const APP_STATE = {
    // Auth
    authUser: null,
    
    // User Data
    currentUser: null,
    currentSchool: null,
    
    // App State
    currentTab: 'dashboard',
    isLoading: false,
    isProfileComplete: false,
    
    // Shared Data (per NPSN)
    masterData: [],
    subjects: [],
    schedules: [],
    calendarEvents: [],
    
    // Private Data (per User)
    modulAjar: [],
    lkpd: [],
    bankSoal: []
};

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing auth listener...');
    initAuthListener();
});

function initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? user.email : 'No user');
        
        const loadingScreen = document.getElementById('loadingScreen');
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (user) {
            // User is signed in
            APP_STATE.authUser = user;
            
            try {
                // Load user profile
                await loadUserProfile(user);
                
                // Check if profile is complete
                if (APP_STATE.currentUser?.npsn) {
                    APP_STATE.isProfileComplete = true;
                    await loadSchoolData(APP_STATE.currentUser.npsn);
                    await loadAllSharedData();
                }
                
                // Hide loading, show main app
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (loginScreen) loginScreen.classList.add('hidden');
                if (mainApp) mainApp.classList.remove('hidden');
                
                // Update UI after showing main app
                setTimeout(() => {
                    updateUserDisplay();
                    renderTabContent('dashboard');
                }, 100);
                
            } catch (error) {
                console.error('Error loading user data:', error);
                showToast('Gagal memuat data pengguna', 'error');
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (loginScreen) loginScreen.classList.remove('hidden');
                if (mainApp) mainApp.classList.add('hidden');
            }
        } else {
            // User is signed out
            APP_STATE.authUser = null;
            APP_STATE.currentUser = null;
            APP_STATE.currentSchool = null;
            APP_STATE.isProfileComplete = false;
            
            // Reset data
            APP_STATE.masterData = [];
            APP_STATE.subjects = [];
            APP_STATE.schedules = [];
            APP_STATE.calendarEvents = [];
            
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (mainApp) mainApp.classList.add('hidden');
        }
    });
}

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================
window.loginWithGoogle = async function() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    try {
        if (loadingScreen) loadingScreen.style.display = 'flex';
        
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Login successful:', result.user.email);
        showToast('Login berhasil!', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        if (loadingScreen) loadingScreen.style.display = 'none';
        
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Login dibatalkan', 'warning');
        } else if (error.code === 'auth/popup-blocked') {
            showToast('Popup diblokir oleh browser. Izinkan popup untuk login.', 'error');
        } else {
            showToast('Gagal login: ' + error.message, 'error');
        }
    }
};

window.handleLogout = async function() {
    if (!confirm('Apakah Anda yakin ingin keluar?')) return;
    
    try {
        await signOut(auth);
        showToast('Logout berhasil', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Gagal logout', 'error');
    }
};

// =====================================================
// USER & SCHOOL DATA LOADING
// =====================================================
async function loadUserProfile(authUser) {
    console.log('Loading user profile for:', authUser.uid);
    
    const userDocRef = doc(db, COLLECTIONS.USERS, authUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
        APP_STATE.currentUser = {
            id: userDoc.id,
            ...userDoc.data()
        };
        console.log('User profile loaded:', APP_STATE.currentUser.nama);
    } else {
        // Create new user profile
        const newUser = {
            uid: authUser.uid,
            email: authUser.email,
            nama: authUser.displayName || '',
            photoURL: authUser.photoURL || '',
            npsn: '',
            nip: '',
            phone: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, newUser);
        APP_STATE.currentUser = { id: authUser.uid, ...newUser };
        console.log('New user profile created');
    }
}

async function loadSchoolData(npsn) {
    if (!npsn) return;
    
    console.log('Loading school data for NPSN:', npsn);
    
    const schoolDocRef = doc(db, COLLECTIONS.SCHOOLS, npsn);
    const schoolDoc = await getDoc(schoolDocRef);
    
    if (schoolDoc.exists()) {
        APP_STATE.currentSchool = {
            id: schoolDoc.id,
            ...schoolDoc.data()
        };
        console.log('School data loaded:', APP_STATE.currentSchool.schoolName);
        
        // Update school badge
        updateSchoolBadge();
    } else {
        APP_STATE.currentSchool = null;
        console.log('No school data found for NPSN:', npsn);
    }
}

function updateSchoolBadge() {
    const schoolBadge = document.getElementById('schoolBadge');
    const schoolNameBadge = document.getElementById('schoolNameBadge');
    
    if (schoolBadge && schoolNameBadge && APP_STATE.currentSchool?.schoolName) {
        schoolBadge.classList.remove('hidden');
        schoolNameBadge.textContent = APP_STATE.currentSchool.schoolName;
    }
}

async function loadAllSharedData() {
    if (!APP_STATE.currentUser?.npsn) {
        console.log('No NPSN, skipping shared data load');
        return;
    }
    
    const npsn = APP_STATE.currentUser.npsn;
    console.log('Loading shared data for NPSN:', npsn);
    
    try {
        // Load Subjects (shared per NPSN)
        const subjectsQuery = query(
            collection(db, COLLECTIONS.SUBJECTS),
            where('npsn', '==', npsn)
        );
        const subjectsSnapshot = await getDocs(subjectsQuery);
        APP_STATE.subjects = subjectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Subjects loaded:', APP_STATE.subjects.length);
        
        // Initialize default subjects if empty
        if (APP_STATE.subjects.length === 0 && APP_STATE.currentSchool?.jenjang) {
            console.log('Initializing default subjects...');
            await initializeDefaultSubjects(npsn, APP_STATE.currentSchool.jenjang);
            // Reload
            const subjectsSnapshot2 = await getDocs(subjectsQuery);
            APP_STATE.subjects = subjectsSnapshot2.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }
        
        // Load Master Data / CP (shared per NPSN)
        const masterQuery = query(
            collection(db, COLLECTIONS.MASTER_DATA),
            where('npsn', '==', npsn)
        );
        const masterSnapshot = await getDocs(masterQuery);
        APP_STATE.masterData = masterSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Master data loaded:', APP_STATE.masterData.length);
        
        // Load Schedules (shared per NPSN)
        const schedulesQuery = query(
            collection(db, COLLECTIONS.SCHEDULES),
            where('npsn', '==', npsn)
        );
        const schedulesSnapshot = await getDocs(schedulesQuery);
        APP_STATE.schedules = schedulesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Schedules loaded:', APP_STATE.schedules.length);
        
        // Load Calendar Events (shared per NPSN)
        const calendarQuery = query(
            collection(db, COLLECTIONS.CALENDAR),
            where('npsn', '==', npsn)
        );
        const calendarSnapshot = await getDocs(calendarQuery);
        APP_STATE.calendarEvents = calendarSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Calendar events loaded:', APP_STATE.calendarEvents.length);
        
    } catch (error) {
        console.error('Error loading shared data:', error);
        throw error;
    }
}

async function initializeDefaultSubjects(npsn, jenjang) {
    const subjects = DEFAULT_SUBJECTS[jenjang] || [];
    if (subjects.length === 0) return;
    
    console.log('Adding default subjects for:', jenjang);
    
    const batch = writeBatch(db);
    
    for (const subject of subjects) {
        const docRef = doc(collection(db, COLLECTIONS.SUBJECTS));
        batch.set(docRef, {
            ...subject,
            npsn,
            createdAt: serverTimestamp()
        });
    }
    
    await batch.commit();
    console.log('Default subjects added:', subjects.length);
}

function updateUserDisplay() {
    const user = APP_STATE.authUser;
    const profile = APP_STATE.currentUser;
    
    // Get elements
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userPhoto = document.getElementById('userPhoto');
    
    // Only update if elements exist
    if (user) {
        if (userName) {
            userName.textContent = profile?.nama || user.displayName || 'Guru';
        }
        if (userEmail) {
            userEmail.textContent = user.email || '';
        }
        if (userPhoto) {
            if (user.photoURL) {
                userPhoto.src = user.photoURL;
                userPhoto.onerror = function() {
                    this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nama || 'G')}&background=3b82f6&color=fff`;
                };
            } else {
                userPhoto.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nama || 'G')}&background=3b82f6&color=fff`;
            }
        }
    }
    
    // Update school badge
    updateSchoolBadge();
}

// =====================================================
// DATA REFRESH
// =====================================================
window.refreshData = async function() {
    showToast('Memuat ulang data...', 'info');
    
    try {
        if (APP_STATE.currentUser?.npsn) {
            await loadSchoolData(APP_STATE.currentUser.npsn);
            await loadAllSharedData();
        }
        
        renderTabContent(APP_STATE.currentTab);
        showToast('Data berhasil dimuat ulang', 'success');
    } catch (error) {
        console.error('Refresh error:', error);
        showToast('Gagal memuat ulang data', 'error');
    }
};

// =====================================================
// NAVIGATION
// =====================================================
window.switchTab = function(tabId) {
    APP_STATE.currentTab = tabId;
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'profil': 'Profil & Sekolah',
        'master-cp': 'Input CP (Master Data)',
        'mata-pelajaran': 'Mata Pelajaran',
        'atp': 'Alur Tujuan Pembelajaran',
        'kktp': 'Kriteria Ketercapaian Tujuan Pembelajaran',
        'prota': 'Program Tahunan',
        'promes': 'Program Semester',
        'kalender': 'Kalender Pendidikan',
        'jadwal': 'Jadwal Pelajaran',
        'modul-ajar': 'Modul Ajar',
        'lkpd': 'Lembar Kerja Peserta Didik',
        'bank-soal': 'Bank Soal'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[tabId] || 'Dashboard';
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
    
    // Render content
    renderTabContent(tabId);
};

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
};

// =====================================================
// TAB CONTENT RENDERER
// =====================================================
function renderTabContent(tabId) {
    const container = document.getElementById('contentContainer');
    if (!container) return;
    
    let content = '';
    
    switch(tabId) {
        case 'dashboard':
            content = renderDashboard();
            break;
        case 'profil':
            content = renderProfilPage();
            setTimeout(() => initProfilPage(), 100);
            break;
        case 'master-cp':
            content = renderMasterCPPage();
            setTimeout(() => initMasterCPPage(), 100);
            break;
        case 'mata-pelajaran':
            content = renderSubjectsPage();
            setTimeout(() => initSubjectsPage(), 100);
            break;
        case 'atp':
            content = renderATPPage();
            setTimeout(() => initATPPage(), 100);
            break;
        case 'kktp':
            content = renderKKTPPage();
            setTimeout(() => initKKTPPage(), 100);
            break;
        case 'prota':
            content = renderProtaPage();
            setTimeout(() => initProtaPage(), 100);
            break;
        case 'promes':
            content = renderPromesPage();
            setTimeout(() => initPromesPage(), 100);
            break;
        case 'kalender':
            content = renderKalenderPage();
            setTimeout(() => initKalenderPage(), 100);
            break;
        case 'jadwal':
            content = renderJadwalPage();
            setTimeout(() => initJadwalPage(), 100);
            break;
        case 'modul-ajar':
            content = renderModulAjarPage();
            setTimeout(() => initModulAjarPage(), 100);
            break;
        case 'lkpd':
            content = renderLKPDPage();
            setTimeout(() => initLKPDPage(), 100);
            break;
        case 'bank-soal':
            content = renderBankSoalPage();
            setTimeout(() => initBankSoalPage(), 100);
            break;
        default:
            content = renderDashboard();
    }
    
    container.innerHTML = content;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function generateTandaTangan(options = {}) {
    const user = APP_STATE.currentUser || {};
    const school = APP_STATE.currentSchool || {};
    const {
        guruLabel = 'Guru Mata Pelajaran',
        kepalaLabel = 'Kepala Sekolah'
    } = options;
    
    const lokasi = school.kabupatenKota || user.kabupatenKota || '.....................';
    
    return `
        <div class="mt-8 grid grid-cols-2 gap-8 text-center text-sm">
            <div>
                <p>Mengetahui,</p>
                <p>${kepalaLabel}</p>
                <div class="h-20"></div>
                <p class="font-bold border-t border-black pt-1 inline-block min-w-[180px]">
                    ${school.kepalaSekolahNama || '( ............................. )'}
                </p>
                <p>NIP. ${school.kepalaSekolahNip || '................................'}</p>
            </div>
            <div>
                <p>${lokasi}, ..................... 20....</p>
                <p>${guruLabel}</p>
                <div class="h-20"></div>
                <p class="font-bold border-t border-black pt-1 inline-block min-w-[180px]">
                    ${user.nama || '( ............................. )'}
                </p>
                <p>NIP. ${user.nip || '................................'}</p>
            </div>
        </div>
    `;
}

function generateKopDokumen(options = {}) {
    const school = APP_STATE.currentSchool || {};
    const {
        title = 'DOKUMEN',
        subtitle = ''
    } = options;
    
    return `
        <div class="border-b-2 border-black pb-4 mb-6">
            <div class="text-center">
                <p class="text-sm font-medium">${school.schoolName || 'NAMA SEKOLAH'}</p>
                <p class="text-xs text-gray-600">${school.schoolAddress || 'Alamat Sekolah'}</p>
                <p class="text-xs text-gray-600">${school.kabupatenKota ? school.kabupatenKota + ', ' : ''}${school.provinsi || ''}</p>
                <div class="border-t-2 border-black mt-2 pt-2">
                    <h2 class="text-xl font-bold uppercase">${title}</h2>
                    ${subtitle ? '<h3 class="text-lg font-semibold mt-1">' + subtitle + '</h3>' : ''}
                </div>
            </div>
        </div>
    `;
}

window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log('Toast:', type, message);
        return;
    }
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
    toast.innerHTML = `
        <i class="fas fa-${icons[type]} mr-2"></i>
        ${message}
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
};

function renderNeedProfileMessage() {
    return `
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
            <i class="fas fa-user-edit text-gray-300 text-5xl mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Lengkapi Profil Terlebih Dahulu</h3>
            <p class="text-gray-500 mb-4">Silakan lengkapi data profil dan NPSN sekolah untuk mengakses fitur ini</p>
            <button onclick="switchTab('profil')" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-user-edit mr-2"></i>
                Lengkapi Profil
            </button>
        </div>
    `;
}

// =====================================================
// DASHBOARD
// =====================================================
function renderDashboard() {
    const user = APP_STATE.currentUser;
    const school = APP_STATE.currentSchool;
    const authUser = APP_STATE.authUser;
    const isProfileComplete = !!user?.npsn;
    
    if (!isProfileComplete) {
        return `
            <div class="max-w-2xl mx-auto">
                <div class="bg-white rounded-xl shadow-lg p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-chalkboard-teacher text-blue-600 text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800">Selamat Datang, ${authUser?.displayName || 'Guru'}!</h2>
                        <p class="text-gray-600 mt-2">Sistem Administrasi Guru Terpadu</p>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-yellow-500 mt-0.5 mr-3"></i>
                            <p class="text-sm text-yellow-700">
                                Silakan lengkapi profil dan NPSN sekolah Anda untuk mengakses semua fitur.
                            </p>
                        </div>
                    </div>
                    
                    <button onclick="switchTab('profil')" class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <i class="fas fa-user-edit mr-2"></i>
                        Lengkapi Profil Sekarang
                    </button>
                </div>
            </div>
        `;
    }
    
    const dimensiContent = DIMENSI_PROFIL_LULUSAN.map((dim, index) => `
        <div class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    ${index + 1}
                </div>
                <h4 class="font-semibold text-gray-800 text-sm">${dim.nama}</h4>
            </div>
            <p class="text-xs text-gray-600">${dim.deskripsi}</p>
        </div>
    `).join('');
    
    return `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 class="text-2xl font-bold">Selamat Datang, ${user?.nama || authUser?.displayName || 'Guru'}!</h2>
                        <p class="text-blue-100 mt-1">${school?.schoolName || 'Sekolah'} - NPSN: ${user?.npsn || '-'}</p>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <span class="px-4 py-2 bg-white/20 rounded-lg text-sm">
                            ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Capaian Pembelajaran</p>
                            <p class="text-2xl font-bold text-gray-800 mt-1">${APP_STATE.masterData.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-database text-blue-600"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Mata Pelajaran</p>
                            <p class="text-2xl font-bold text-gray-800 mt-1">${APP_STATE.subjects.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-book text-green-600"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Jadwal Pelajaran</p>
                            <p class="text-2xl font-bold text-gray-800 mt-1">${APP_STATE.schedules.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-clock text-purple-600"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Event Kalender</p>
                            <p class="text-2xl font-bold text-gray-800 mt-1">${APP_STATE.calendarEvents.length}</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-calendar text-orange-600"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <button onclick="switchTab('master-cp')" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-plus-circle text-2xl text-blue-600 mb-2"></i>
                        <span class="text-sm text-gray-700 text-center">Input CP</span>
                    </button>
                    <button onclick="switchTab('atp')" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-sitemap text-2xl text-green-600 mb-2"></i>
                        <span class="text-sm text-gray-700 text-center">Buat ATP</span>
                    </button>
                    <button onclick="switchTab('modul-ajar')" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-file-alt text-2xl text-purple-600 mb-2"></i>
                        <span class="text-sm text-gray-700 text-center">Modul Ajar</span>
                    </button>
                    <button onclick="switchTab('jadwal')" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-clock text-2xl text-orange-600 mb-2"></i>
                        <span class="text-sm text-gray-700 text-center">Jadwal</span>
                    </button>
                    <button onclick="switchTab('lkpd')" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-file-signature text-2xl text-red-600 mb-2"></i>
                        <span class="text-sm text-gray-700 text-center">LKPD</span>
                    </button>
                    <button onclick="switchTab('bank-soal')" class="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-question-circle text-2xl text-indigo-600 mb-2"></i>
                        <span class="text-sm text-gray-700 text-center">Bank Soal</span>
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>
                    8 Dimensi Profil Lulusan
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    ${dimensiContent}
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// PROFIL PAGE
// =====================================================
function renderProfilPage() {
    const user = APP_STATE.currentUser || {};
    const school = APP_STATE.currentSchool || {};
    const authUser = APP_STATE.authUser || {};
    
    const jenjangOptions = Object.entries(JENJANG).map(([key, val]) => 
        `<option value="${key}" ${school.jenjang === key ? 'selected' : ''}>${val.nama}</option>`
    ).join('');
    
    const hasExistingSchool = !!APP_STATE.currentSchool?.schoolName;
    
    return `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center space-x-4 mb-6">
                    <img src="${authUser.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nama || 'G') + '&background=3b82f6&color=fff'}" 
                         alt="Profile" class="w-16 h-16 rounded-full" onerror="this.src='https://ui-avatars.com/api/?name=G&background=3b82f6&color=fff'">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${user.nama || authUser.displayName || 'Guru'}</h3>
                        <p class="text-gray-500">${authUser.email || ''}</p>
                        <span class="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs mt-1">
                            <i class="fas fa-check-circle mr-1"></i>
                            Terverifikasi dengan Google
                        </span>
                    </div>
                </div>
                
                <form id="userProfileForm" class="space-y-4">
                    <h4 class="font-semibold text-gray-800 flex items-center">
                        <i class="fas fa-user text-blue-600 mr-2"></i>
                        Data Pribadi Guru
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                            <input type="text" name="nama" value="${user.nama || authUser.displayName || ''}" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama lengkap">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                            <input type="text" name="nip" value="${user.nip || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nomor Induk Pegawai">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                            <input type="tel" name="phone" value="${user.phone || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="08xxxxxxxxxx">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">NPSN Sekolah *</label>
                            <input type="text" name="npsn" value="${user.npsn || ''}" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="8 digit NPSN" maxlength="8" pattern="[0-9]{8}"
                                id="npsnInput">
                            <p class="text-xs text-gray-500 mt-1">NPSN menghubungkan Anda dengan guru lain di sekolah yang sama</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>
                            Simpan Data Pribadi
                        </button>
                    </div>
                </form>
            </div>
            
            <div id="schoolInfoAlert" class="${hasExistingSchool ? '' : 'hidden'} bg-green-50 border border-green-200 rounded-xl p-4">
                <div class="flex items-start">
                    <i class="fas fa-check-circle text-green-500 text-xl mt-0.5 mr-3"></i>
                    <div>
                        <h4 class="font-semibold text-green-800">Data Sekolah Sudah Ada!</h4>
                        <p class="text-sm text-green-700 mt-1">
                            Data sekolah <strong id="existingSchoolName">${school.schoolName || ''}</strong> sudah diisi oleh guru lain. 
                            Anda tidak perlu mengisi ulang. Data akan otomatis tersinkronisasi.
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
                <form id="schoolDataForm" class="space-y-6">
                    <div class="flex items-center justify-between">
                        <h4 class="font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-school text-green-600 mr-2"></i>
                            Data Sekolah
                            <span class="ml-2 text-xs font-normal text-gray-500">(Shared dengan guru lain)</span>
                        </h4>
                        ${hasExistingSchool ? '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"><i class="fas fa-users mr-1"></i>Data Bersama</span>' : ''}
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah *</label>
                            <input type="text" name="schoolName" value="${school.schoolName || ''}" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama sekolah">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Jenjang Pendidikan *</label>
                            <select name="jenjang" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">Pilih Jenjang</option>
                                ${jenjangOptions}
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Alamat Sekolah</label>
                            <input type="text" name="schoolAddress" value="${school.schoolAddress || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Alamat lengkap sekolah">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kabupaten/Kota</label>
                            <input type="text" name="kabupatenKota" value="${school.kabupatenKota || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama kabupaten/kota">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                            <input type="text" name="provinsi" value="${school.provinsi || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama provinsi">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran *</label>
                            <input type="text" name="tahunAjaran" value="${school.tahunAjaran || ''}" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="2024/2025">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select name="semester"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="1" ${school.semester === '1' ? 'selected' : ''}>Semester 1 (Ganjil)</option>
                                <option value="2" ${school.semester === '2' ? 'selected' : ''}>Semester 2 (Genap)</option>
                            </select>
                        </div>
                    </div>
                    
                    <hr class="my-4">
                    
                    <h4 class="font-semibold text-gray-800 flex items-center">
                        <i class="fas fa-user-tie text-purple-600 mr-2"></i>
                        Data Kepala Sekolah
                        <span class="ml-2 text-xs font-normal text-gray-500">(untuk tanda tangan dokumen)</span>
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
                            <input type="text" name="kepalaSekolahNama" value="${school.kepalaSekolahNama || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nama lengkap kepala sekolah">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">NIP Kepala Sekolah</label>
                            <input type="text" name="kepalaSekolahNip" value="${school.kepalaSekolahNip || ''}"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="NIP kepala sekolah">
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-save mr-2"></i>
                            Simpan Data Sekolah
                        </button>
                    </div>
                </form>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-signature text-indigo-600 mr-2"></i>
                    Preview Tanda Tangan Dokumen
                </h4>
                <div class="border border-gray-200 rounded-lg p-6">
                    ${generateTandaTangan({ guruLabel: 'Guru Mata Pelajaran' })}
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-users text-teal-600 mr-2"></i>
                    Guru di Sekolah yang Sama
                </h4>
                <div id="teachersList" class="space-y-2">
                    <p class="text-gray-500 text-sm">Memuat data guru...</p>
                </div>
            </div>
        </div>
    `;
}

function initProfilPage() {
    // User profile form
    const userForm = document.getElementById('userProfileForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserProfileSubmit);
    }
    
    // School data form
    const schoolForm = document.getElementById('schoolDataForm');
    if (schoolForm) {
        schoolForm.addEventListener('submit', handleSchoolDataSubmit);
    }
    
    // NPSN change listener
    const npsnInput = document.getElementById('npsnInput');
    if (npsnInput) {
        npsnInput.addEventListener('blur', function() {
            if (this.value.length === 8) {
                checkExistingSchool(this.value);
            }
        });
    }
    
    // Load teachers
    if (APP_STATE.currentUser?.npsn) {
        loadSameSchoolTeachers(APP_STATE.currentUser.npsn);
    }
}

async function checkExistingSchool(npsn) {
    if (npsn.length !== 8) return;
    
    try {
        const schoolDocRef = doc(db, COLLECTIONS.SCHOOLS, npsn);
        const schoolDoc = await getDoc(schoolDocRef);
        
        const alert = document.getElementById('schoolInfoAlert');
        const existingSchoolName = document.getElementById('existingSchoolName');
        
        if (schoolDoc.exists()) {
            const schoolData = schoolDoc.data();
            APP_STATE.currentSchool = { id: npsn, ...schoolData };
            
            // Fill form with existing data
            const form = document.getElementById('schoolDataForm');
            if (form) {
                const fields = ['schoolName', 'jenjang', 'schoolAddress', 'kabupatenKota', 'provinsi', 'tahunAjaran', 'semester', 'kepalaSekolahNama', 'kepalaSekolahNip'];
                fields.forEach(field => {
                    const input = form.querySelector(`[name="${field}"]`);
                    if (input && schoolData[field]) {
                        input.value = schoolData[field];
                    }
                });
            }
            
            if (alert) alert.classList.remove('hidden');
            if (existingSchoolName) existingSchoolName.textContent = schoolData.schoolName || npsn;
            
            showToast('Data sekolah ditemukan!', 'success');
        } else {
            APP_STATE.currentSchool = null;
            if (alert) alert.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error checking school:', error);
    }
}

async function handleUserProfileSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const userData = {
        nama: formData.get('nama'),
        nip: formData.get('nip'),
        phone: formData.get('phone'),
        npsn: formData.get('npsn'),
        updatedAt: serverTimestamp()
    };
    
    try {
        const userDocRef = doc(db, COLLECTIONS.USERS, APP_STATE.authUser.uid);
        await updateDoc(userDocRef, userData);
        
        APP_STATE.currentUser = { ...APP_STATE.currentUser, ...userData };
        APP_STATE.isProfileComplete = !!userData.npsn;
        
        updateUserDisplay();
        
        // Load school data if NPSN provided
        if (userData.npsn) {
            await loadSchoolData(userData.npsn);
            await loadAllSharedData();
            loadSameSchoolTeachers(userData.npsn);
        }
        
        showToast('Data pribadi berhasil disimpan!', 'success');
        
    } catch (error) {
        console.error('Error saving user profile:', error);
        showToast('Gagal menyimpan data pribadi', 'error');
    }
}

async function handleSchoolDataSubmit(e) {
    e.preventDefault();
    
    if (!APP_STATE.currentUser?.npsn) {
        showToast('Simpan data pribadi dengan NPSN terlebih dahulu', 'warning');
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    
    const schoolData = {
        schoolName: formData.get('schoolName'),
        jenjang: formData.get('jenjang'),
        schoolAddress: formData.get('schoolAddress'),
        kabupatenKota: formData.get('kabupatenKota'),
        provinsi: formData.get('provinsi'),
        tahunAjaran: formData.get('tahunAjaran'),
        semester: formData.get('semester'),
        kepalaSekolahNama: formData.get('kepalaSekolahNama'),
        kepalaSekolahNip: formData.get('kepalaSekolahNip'),
        updatedAt: serverTimestamp(),
        updatedBy: APP_STATE.authUser.email
    };
    
    try {
        const npsn = APP_STATE.currentUser.npsn;
        const schoolDocRef = doc(db, COLLECTIONS.SCHOOLS, npsn);
        
        const schoolDoc = await getDoc(schoolDocRef);
        if (schoolDoc.exists()) {
            await updateDoc(schoolDocRef, schoolData);
        } else {
            await setDoc(schoolDocRef, {
                ...schoolData,
                npsn,
                createdAt: serverTimestamp(),
                createdBy: APP_STATE.authUser.email
            });
        }
        
        APP_STATE.currentSchool = { id: npsn, ...schoolData };
        
        // Initialize default subjects if new school
        if (!schoolDoc.exists() && schoolData.jenjang) {
            await initializeDefaultSubjects(npsn, schoolData.jenjang);
            await loadAllSharedData();
        }
        
        updateSchoolBadge();
        showToast('Data sekolah berhasil disimpan!', 'success');
        
    } catch (error) {
        console.error('Error saving school data:', error);
        showToast('Gagal menyimpan data sekolah', 'error');
    }
}

async function loadSameSchoolTeachers(npsn) {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    try {
        const teachersQuery = query(
            collection(db, COLLECTIONS.USERS),
            where('npsn', '==', npsn)
        );
        const snapshot = await getDocs(teachersQuery);
        
        if (snapshot.empty) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Belum ada guru lain terdaftar</p>';
            return;
        }
        
        const teachers = snapshot.docs.map(doc => doc.data());
        container.innerHTML = teachers.map(t => `
            <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                <img src="${t.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(t.nama || 'G') + '&background=3b82f6&color=fff'}" 
                     alt="${t.nama || 'Guru'}" class="w-10 h-10 rounded-full mr-3" 
                     onerror="this.src='https://ui-avatars.com/api/?name=G&background=3b82f6&color=fff'">
                <div class="flex-1">
                    <p class="font-medium text-gray-800">${t.nama || 'Guru'}</p>
                    <p class="text-sm text-gray-500">${t.email || '-'}</p>
                </div>
                ${t.uid === APP_STATE.authUser?.uid ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Anda</span>' : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading teachers:', error);
        container.innerHTML = '<p class="text-red-500 text-sm">Gagal memuat data guru</p>';
    }
}

// =====================================================
// PLACEHOLDER FUNCTIONS (untuk halaman lain)
// Pastikan semua fungsi ini ada di file app.js lengkap
// =====================================================

function renderMasterCPPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    // ... implementasi lengkap
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Master CP - Implementasi</h3><p class="text-gray-500 mt-2">Halaman ini sudah ada di kode sebelumnya.</p></div>';
}

function initMasterCPPage() {}

function renderSubjectsPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Mata Pelajaran</h3></div>';
}

function initSubjectsPage() {}

function renderATPPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">ATP</h3></div>';
}

function initATPPage() {}

function renderKKTPPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">KKTP</h3></div>';
}

function initKKTPPage() {}

function renderProtaPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Program Tahunan</h3></div>';
}

function initProtaPage() {}

function renderPromesPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Program Semester</h3></div>';
}

function initPromesPage() {}

function renderKalenderPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Kalender Pendidikan</h3></div>';
}

function initKalenderPage() {}

function renderJadwalPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Jadwal Pelajaran</h3></div>';
}

function initJadwalPage() {}

function renderModulAjarPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Modul Ajar</h3></div>';
}

function initModulAjarPage() {}

function renderLKPDPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">LKPD</h3></div>';
}

function initLKPDPage() {}

function renderBankSoalPage() {
    if (!APP_STATE.currentUser?.npsn) {
        return renderNeedProfileMessage();
    }
    return '<div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="text-lg font-semibold">Bank Soal</h3></div>';
}

function initBankSoalPage() {}

window.showExportModal = function() {
    showToast('Fitur export akan segera tersedia', 'info');
};

// =====================================================
// END OF FILE
// =====================================================
console.log('Guru Smart App loaded successfully!');
console.log('Firebase Project: si-gumart');
console.log('Version: 1.0.0');
