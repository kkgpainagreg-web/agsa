// =====================================================
// MAIN APP MODULE - app.js
// Menghubungkan semua komponen aplikasi
// =====================================================

// =====================================================
// IMPORTS
// =====================================================
import { auth, db } from './firebase-config.js';
import { 
    initAuth, 
    loginWithGoogle, 
    logout, 
    checkNPSN, 
    saveUserProfile,
    updateUserProfile,
    updateSchoolData,
    getCurrentUser,
    getCurrentUserData,
    getCurrentSchoolData,
    getSchoolTeachers
} from './auth.js';

import {
    addDocument,
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument,
    subscribeToCollection
} from './database.js';

import {
    DIMENSI_PROFIL_LULUSAN,
    DEFAULT_MAPEL_TEMPLATES,
    getUserMapel,
    addUserMapel,
    updateUserMapel,
    deleteUserMapel,
    getCPByMapel,
    addCP,
    updateCP,
    deleteCP as deleteCPDoc,
    getTPByCP,
    addTP,
    updateTP,
    deleteTP,
    getATP,
    generateATP,
    getKKTP,
    generateKKTP,
    updateKKTP,
    getKelasByNPSN,
    addKelas,
    updateKelas,
    deleteKelas as deleteKelasDoc
} from './master-data.js';

import {
    HARI,
    JAM_PELAJARAN,
    JENIS_KEGIATAN,
    getKalenderPendidikan,
    addKalenderEvent,
    updateKalenderEvent,
    deleteKalenderEvent,
    generateDefaultKalender as generateDefaultKalenderFn,
    getJadwalByNPSN,
    getJadwalByGuru,
    checkScheduleConflict,
    addJadwal,
    updateJadwal,
    deleteJadwal,
    getJamPelajaranSettings,
    saveJamPelajaranSettings
} from './jadwal.js';

import {
    TIPE_SOAL,
    LEVEL_KOGNITIF,
    getProta,
    generateProta,
    updateProta,
    deleteProta,
    getPromes,
    generatePromes,
    updatePromes,
    getModulAjar,
    createModulAjar,
    updateModulAjar,
    deleteModulAjar,
    getLKPD,
    createLKPD,
    updateLKPD,
    deleteLKPD,
    getBankSoal,
    addSoal,
    updateSoal,
    deleteSoal,
    generatePaketSoal
} from './documents.js';

import {
    exportToPDF,
    exportMultiPagePDF,
    exportATPToWord,
    exportProtaToWord,
    exportModulAjarToWord,
    exportLKPDToWord,
    exportBankSoalToWord,
    printDocument
} from './export.js';

import {
    renderDashboardPage,
    renderProfilPage,
    renderMapelPage,
    renderCPPage,
    renderCPList,
    renderKelasPage,
    renderKalenderPage,
    renderJadwalPage,
    renderScheduleGrid,
    renderCalendarGrid,
    renderEventsList,
    renderATPPage,
    renderKKTPPage,
    renderProtaPage,
    renderPromesPage,
    renderModulAjarPage,
    renderLKPDPage,
    renderBankSoalPage,
    renderMapelCard,
    renderKelasCard,
    renderModulCard,
    renderLKPDCard,
    renderSoalCard
} from './page-templates.js';

// =====================================================
// GLOBAL STATE
// =====================================================
let currentPage = 'dashboard';
let appData = {
    mapel: [],
    kelas: [],
    cp: [],
    kalender: [],
    jadwal: [],
    modul: [],
    lkpd: [],
    soal: []
};

// Current filters/selections
let currentFilters = {
    mapelId: null,
    kelas: null,
    tahunAjaran: '2024/2025',
    semester: '1',
    bulan: new Date().getMonth(),
    tahun: new Date().getFullYear()
};

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Si Gumart App Starting...');
    initializeApp();
});

async function initializeApp() {
    // Set current date display
    updateCurrentDate();
    
    // Initialize auth observer
    initAuth(handleAuthStateChange);
    
    // Setup event listeners
    setupEventListeners();
}

function handleAuthStateChange(authState) {
    console.log('Auth state:', authState.status);
    
    const loginPage = document.getElementById('loginPage');
    const setupPage = document.getElementById('setupPage');
    const mainApp = document.getElementById('mainApp');
    
    switch (authState.status) {
        case 'unauthenticated':
            loginPage.classList.remove('hidden');
            setupPage.classList.add('hidden');
            mainApp.classList.add('hidden');
            break;
            
        case 'needSetup':
            loginPage.classList.add('hidden');
            setupPage.classList.remove('hidden');
            mainApp.classList.add('hidden');
            prefillSetupForm(authState.user);
            break;
            
        case 'authenticated':
            loginPage.classList.add('hidden');
            setupPage.classList.add('hidden');
            mainApp.classList.remove('hidden');
            initializeMainApp(authState.userData, authState.schoolData);
            break;
    }
}

async function initializeMainApp(userData, schoolData) {
    // Update user info in sidebar
    document.getElementById('userPhoto').src = userData.photoURL || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.namaGuru)}`;
    document.getElementById('userName').textContent = userData.namaGuru;
    document.getElementById('userSchool').textContent = schoolData?.namaSekolah || '-';
    
    // Load initial data
    await loadInitialData();
    
    // Render dashboard
    navigateTo('dashboard');
}

async function loadInitialData() {
    const userData = getCurrentUserData();
    
    try {
        // Load mata pelajaran
        const mapelResult = await getUserMapel(userData.uid);
        if (mapelResult.success) {
            appData.mapel = mapelResult.data;
        }
        
        // Load kelas
        const kelasResult = await getKelasByNPSN(userData.npsn);
        if (kelasResult.success) {
            appData.kelas = kelasResult.data;
        }
        
        console.log('Initial data loaded:', appData);
    } catch (error) {
        console.error('Load initial data error:', error);
    }
}

// =====================================================
// EVENT LISTENERS SETUP
// =====================================================
function setupEventListeners() {
    // Google Login Button
    document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleLogin);
    
    // Setup Form
    document.getElementById('setupForm')?.addEventListener('submit', handleSetupSubmit);
    document.getElementById('cekNPSNBtn')?.addEventListener('click', handleCheckNPSN);
    document.getElementById('setupJenjang')?.addEventListener('change', handleJenjangChange);
    
    // Logout Button
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    // Menu Toggle (Mobile)
    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
    
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
}

// =====================================================
// AUTHENTICATION HANDLERS
// =====================================================
async function handleGoogleLogin() {
    showLoading();
    const result = await loginWithGoogle();
    hideLoading();
    
    if (!result.success) {
        showToast('error', 'Login Gagal', result.error);
    }
}

async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        showLoading();
        await logout();
        hideLoading();
    }
}

function prefillSetupForm(user) {
    document.getElementById('setupNamaGuru').value = user.displayName || '';
}

async function handleCheckNPSN() {
    const npsn = document.getElementById('setupNPSN').value.trim();
    const statusEl = document.getElementById('npsnStatus');
    
    if (npsn.length !== 8) {
        statusEl.textContent = 'NPSN harus 8 digit';
        statusEl.className = 'mt-2 text-sm text-red-500';
        statusEl.classList.remove('hidden');
        return;
    }
    
    showLoading();
    const result = await checkNPSN(npsn);
    hideLoading();
    
    const sekolahSection = document.getElementById('sekolahInputSection');
    const alamatSection = document.getElementById('alamatSekolahSection');
    const kepsekSection = document.getElementById('kepsekSection');
    const nipKepsekSection = document.getElementById('nipKepsekSection');
    
    if (result.exists) {
        statusEl.textContent = `✓ Sekolah ditemukan: ${result.data.namaSekolah}`;
        statusEl.className = 'mt-2 text-sm text-green-600';
        
        document.getElementById('setupNamaSekolah').value = result.data.namaSekolah;
        document.getElementById('setupNamaSekolah').readOnly = true;
        
        sekolahSection.classList.remove('hidden');
        alamatSection.classList.add('hidden');
        kepsekSection.classList.add('hidden');
        nipKepsekSection.classList.add('hidden');
    } else {
        statusEl.textContent = 'Sekolah belum terdaftar. Silakan lengkapi data sekolah.';
        statusEl.className = 'mt-2 text-sm text-yellow-600';
        
        document.getElementById('setupNamaSekolah').value = '';
        document.getElementById('setupNamaSekolah').readOnly = false;
        
        sekolahSection.classList.remove('hidden');
        alamatSection.classList.remove('hidden');
        kepsekSection.classList.remove('hidden');
        nipKepsekSection.classList.remove('hidden');
    }
    
    statusEl.classList.remove('hidden');
}

function handleJenjangChange() {
    const jenjang = document.getElementById('setupJenjang').value;
    populateTingkatOptions(jenjang);
}

async function handleSetupSubmit(e) {
    e.preventDefault();
    
    const data = {
        namaGuru: document.getElementById('setupNamaGuru').value.trim(),
        nip: document.getElementById('setupNIP').value.trim(),
        jenjang: document.getElementById('setupJenjang').value,
        npsn: document.getElementById('setupNPSN').value.trim(),
        namaSekolah: document.getElementById('setupNamaSekolah').value.trim(),
        alamatSekolah: document.getElementById('setupAlamatSekolah')?.value.trim() || '',
        kepalaSekolah: document.getElementById('setupKepsek')?.value.trim() || '',
        nipKepsek: document.getElementById('setupNIPKepsek')?.value.trim() || ''
    };
    
    showLoading();
    const result = await saveUserProfile(data);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Profil berhasil disimpan');
    } else {
        showToast('error', 'Gagal', result.error);
    }
}

// =====================================================
// NAVIGATION
// =====================================================
window.navigateTo = function(page) {
    currentPage = page;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        profil: 'Profil',
        mapel: 'Mata Pelajaran',
        cp: 'Capaian Pembelajaran',
        kelas: 'Kelas & Rombel',
        kalender: 'Kalender Pendidikan',
        jadwal: 'Jadwal Pelajaran',
        atp: 'Alur Tujuan Pembelajaran',
        kktp: 'KKTP',
        prota: 'Program Tahunan',
        promes: 'Program Semester',
        modul: 'Modul Ajar',
        lkpd: 'LKPD',
        banksoal: 'Bank Soal'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    
    // Render page content
    renderPage(page);
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
        closeSidebar();
    }
};

async function renderPage(page) {
    const container = document.getElementById('pageContent');
    const userData = getCurrentUserData();
    const schoolData = getCurrentSchoolData();
    
    switch (page) {
        case 'dashboard':
            const stats = {
                mapel: appData.mapel.length,
                cp: appData.cp.length,
                modul: appData.modul.length,
                soal: appData.soal.length
            };
            container.innerHTML = renderDashboardPage(userData, schoolData, stats);
            break;
            
        case 'profil':
            container.innerHTML = renderProfilPage(userData, schoolData);
            loadSchoolTeachers();
            break;
            
        case 'mapel':
            container.innerHTML = renderMapelPage();
            loadMapelList();
            break;
            
        case 'cp':
            container.innerHTML = renderCPPage();
            populateMapelDropdown('filterMapel');
            populateDimensiCheckboxes();
            break;
            
        case 'kelas':
            container.innerHTML = renderKelasPage();
            loadKelasList();
            break;
            
        case 'kalender':
            container.innerHTML = renderKalenderPage();
            loadKalender();
            break;
            
        case 'jadwal':
            container.innerHTML = renderJadwalPage();
            populateJadwalDropdowns();
            loadJadwal();
            break;
            
        case 'atp':
            container.innerHTML = renderATPPage();
            populateMapelDropdown('atpMapel');
            populateKelasDropdown('atpKelas');
            break;
            
        case 'kktp':
            container.innerHTML = renderKKTPPage();
            populateMapelDropdown('kktpMapel');
            populateKelasDropdown('kktpKelas');
            break;
            
        case 'prota':
            container.innerHTML = renderProtaPage();
            populateMapelDropdown('protaMapel');
            populateKelasDropdown('protaKelas');
            break;
            
        case 'promes':
            container.innerHTML = renderPromesPage();
            populateMapelDropdown('promesMapel');
            populateKelasDropdown('promesKelas');
            break;
            
        case 'modul':
            container.innerHTML = renderModulAjarPage();
            populateMapelDropdown('modulMapel');
            populateMapelDropdown('modulMapelInput');
            populateKelasDropdown('modulKelas');
            populateKelasDropdown('modulKelasInput');
            loadModulAjar();
            break;
            
        case 'lkpd':
            container.innerHTML = renderLKPDPage();
            populateMapelDropdown('lkpdMapel');
            populateMapelDropdown('lkpdMapelInput');
            populateKelasDropdown('lkpdKelas');
            populateKelasDropdown('lkpdKelasInput');
            loadLKPD();
            initLKPDModal();
            break;
            
        case 'banksoal':
            container.innerHTML = renderBankSoalPage();
            populateMapelDropdown('bankSoalMapel');
            populateMapelDropdown('soalMapel');
            populateMapelDropdown('paketMapel');
            populateKelasDropdown('bankSoalKelas');
            populateKelasDropdown('soalKelas');
            populateKelasDropdown('paketKelas');
            loadBankSoal();
            break;
            
        default:
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-tools text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Halaman dalam pengembangan</p>
                </div>
            `;
    }
}

// =====================================================
// SIDEBAR FUNCTIONS
// =====================================================
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
};

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function updateCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

window.showLoading = function(message = 'Memproses...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
    }
};

window.hideLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
};

window.showToast = function(type, title, message) {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const titleEl = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');
    
    const icons = {
        success: '<i class="fas fa-check-circle text-green-500"></i>',
        error: '<i class="fas fa-times-circle text-red-500"></i>',
        warning: '<i class="fas fa-exclamation-circle text-yellow-500"></i>',
        info: '<i class="fas fa-info-circle text-blue-500"></i>'
    };
    
    icon.innerHTML = icons[type] || icons.info;
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    toast.classList.remove('hidden', 'translate-x-full');
    
    setTimeout(() => {
        hideToast();
    }, 5000);
};

window.hideToast = function() {
    const toast = document.getElementById('toast');
    toast.classList.add('translate-x-full');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 300);
};

window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    dropdown?.classList.toggle('hidden');
};

// =====================================================
// POPULATE DROPDOWNS
// =====================================================
function populateMapelDropdown(elementId) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    
    appData.mapel.forEach(m => {
        select.innerHTML += `<option value="${m.id}">${m.nama}</option>`;
    });
    
    if (currentValue) select.value = currentValue;
}

function populateKelasDropdown(elementId) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    const userData = getCurrentUserData();
    const jenjang = userData?.jenjang || 'SMP';
    
    const tingkat = {
        'SD': [1, 2, 3, 4, 5, 6],
        'SMP': [7, 8, 9],
        'SMA': [10, 11, 12]
    };
    
    select.innerHTML = '<option value="">Pilih Kelas</option>';
    
    (tingkat[jenjang] || tingkat.SMP).forEach(t => {
        select.innerHTML += `<option value="${t}">${t}</option>`;
    });
}

function populateTingkatOptions(jenjang) {
    const tingkatCheckboxes = document.getElementById('tingkatCheckboxes');
    if (!tingkatCheckboxes) return;
    
    const tingkat = {
        'SD': [1, 2, 3, 4, 5, 6],
        'SMP': [7, 8, 9],
        'SMA': [10, 11, 12]
    };
    
    const levels = tingkat[jenjang] || [];
    
    tingkatCheckboxes.innerHTML = levels.map(t => `
        <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" name="mapelTingkat" value="${t}" class="rounded border-gray-300 text-primary focus:ring-primary">
            <span>Kelas ${t}</span>
        </label>
    `).join('');
}

function populateDimensiCheckboxes() {
    const container = document.getElementById('dimensiCheckboxes');
    if (!container) return;
    
    container.innerHTML = DIMENSI_PROFIL_LULUSAN.map(d => `
        <label class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
            <input type="checkbox" name="cpDimensi" value="${d.id}" class="mt-1 rounded border-gray-300 text-primary focus:ring-primary">
            <div>
                <div class="flex items-center gap-2">
                    <i class="fas ${d.icon}" style="color: ${d.warna}"></i>
                    <span class="font-medium text-gray-800">${d.nama}</span>
                </div>
                <p class="text-xs text-gray-500 mt-1">${d.deskripsi}</p>
            </div>
        </label>
    `).join('');
}

async function populateJadwalDropdowns() {
    const userData = getCurrentUserData();
    
    // Populate kelas dropdown
    const kelasSelect = document.getElementById('jadwalKelas');
    if (kelasSelect) {
        kelasSelect.innerHTML = '<option value="">Semua Kelas</option>';
        appData.kelas.forEach(k => {
            kelasSelect.innerHTML += `<option value="${k.tingkat}${k.rombel}">${k.tingkat}${k.rombel}</option>`;
        });
    }
    
    // Populate jam pelajaran
    const jamSettings = await getJamPelajaranSettings(userData.npsn);
    const jamList = jamSettings.data?.jam || JAM_PELAJARAN[userData.jenjang] || JAM_PELAJARAN.SMP;
    
    const jamSelect = document.getElementById('jadwalJamKe');
    if (jamSelect) {
        jamSelect.innerHTML = '<option value="">Pilih Jam</option>';
        jamList.forEach(j => {
            jamSelect.innerHTML += `<option value="${j.jam}">Jam ke-${j.jam} (${j.mulai}-${j.selesai})</option>`;
        });
    }
}

// =====================================================
// MATA PELAJARAN FUNCTIONS
// =====================================================
async function loadMapelList() {
    const container = document.getElementById('mapelList');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const result = await getUserMapel(userData.uid);
    
    if (result.success && result.data.length > 0) {
        appData.mapel = result.data;
        container.innerHTML = result.data.map(m => renderMapelCard(m)).join('');
    } else {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-book-open text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada mata pelajaran</p>
                <button onclick="showAddMapelModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Tambah Mata Pelajaran
                </button>
            </div>
        `;
    }
}

window.showAddMapelModal = function() {
    document.getElementById('mapelModalTitle').textContent = 'Tambah Mata Pelajaran';
    document.getElementById('mapelId').value = '';
    document.getElementById('mapelForm').reset();
    
    const userData = getCurrentUserData();
    populateTingkatOptions(userData.jenjang);
    
    // Reset elemen container
    document.getElementById('elemenContainer').innerHTML = `
        <div class="flex gap-2 elemen-row">
            <input type="text" class="elemen-input form-input flex-1" placeholder="Nama Elemen">
            <button type="button" onclick="removeElemenInput(this)" class="text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('mapelModal').classList.remove('hidden');
};

window.closeMapelModal = function() {
    document.getElementById('mapelModal').classList.add('hidden');
};

window.addElemenInput = function() {
    const container = document.getElementById('elemenContainer');
    const div = document.createElement('div');
    div.className = 'flex gap-2 elemen-row';
    div.innerHTML = `
        <input type="text" class="elemen-input form-input flex-1" placeholder="Nama Elemen">
        <button type="button" onclick="removeElemenInput(this)" class="text-red-500 hover:text-red-700 px-2">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
};

window.removeElemenInput = function(btn) {
    btn.closest('.elemen-row').remove();
};

window.saveMapel = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('mapelId').value;
    const nama = document.getElementById('mapelNama').value.trim();
    const kode = document.getElementById('mapelKode').value.trim();
    
    // Get selected tingkat
    const tingkat = Array.from(document.querySelectorAll('input[name="mapelTingkat"]:checked'))
        .map(cb => parseInt(cb.value));
    
    // Get elemen
    const elemen = Array.from(document.querySelectorAll('.elemen-input'))
        .map(input => input.value.trim())
        .filter(v => v);
    
    const data = { nama, kode, tingkat, elemen };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateUserMapel(id, data);
    } else {
        result = await addUserMapel(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', id ? 'Mata pelajaran diperbarui' : 'Mata pelajaran ditambahkan');
        closeMapelModal();
        loadMapelList();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.editMapel = async function(id) {
    const mapel = appData.mapel.find(m => m.id === id);
    if (!mapel) return;
    
    document.getElementById('mapelModalTitle').textContent = 'Edit Mata Pelajaran';
    document.getElementById('mapelId').value = id;
    document.getElementById('mapelNama').value = mapel.nama;
    document.getElementById('mapelKode').value = mapel.kode || '';
    
    const userData = getCurrentUserData();
    populateTingkatOptions(userData.jenjang);
    
    // Check tingkat checkboxes
    setTimeout(() => {
        (mapel.tingkat || []).forEach(t => {
            const cb = document.querySelector(`input[name="mapelTingkat"][value="${t}"]`);
            if (cb) cb.checked = true;
        });
    }, 100);
    
    // Populate elemen
    const container = document.getElementById('elemenContainer');
    container.innerHTML = (mapel.elemen || []).map(el => `
        <div class="flex gap-2 elemen-row">
            <input type="text" class="elemen-input form-input flex-1" value="${el}" placeholder="Nama Elemen">
            <button type="button" onclick="removeElemenInput(this)" class="text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('') || `
        <div class="flex gap-2 elemen-row">
            <input type="text" class="elemen-input form-input flex-1" placeholder="Nama Elemen">
            <button type="button" onclick="removeElemenInput(this)" class="text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('mapelModal').classList.remove('hidden');
};

window.deleteMapelConfirm = async function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
        showLoading();
        const result = await deleteUserMapel(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'Mata pelajaran dihapus');
            loadMapelList();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

// Template Modal
window.showTemplateModal = function() {
    const userData = getCurrentUserData();
    const templates = DEFAULT_MAPEL_TEMPLATES[userData.jenjang] || [];
    
    const container = document.getElementById('templateList');
    container.innerHTML = templates.map(t => `
        <label class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
            <input type="checkbox" name="templateMapel" value="${t.nama}" data-kode="${t.kode}" data-elemen='${JSON.stringify(t.elemen)}' class="mt-1 rounded border-gray-300 text-primary focus:ring-primary">
            <div>
                <p class="font-medium text-gray-800">${t.nama}</p>
                <p class="text-xs text-gray-500">${t.elemen.join(', ')}</p>
            </div>
        </label>
    `).join('');
    
    document.getElementById('templateModal').classList.remove('hidden');
};

window.closeTemplateModal = function() {
    document.getElementById('templateModal').classList.add('hidden');
};

window.toggleAllTemplates = function() {
    const selectAll = document.getElementById('selectAllTemplates').checked;
    document.querySelectorAll('input[name="templateMapel"]').forEach(cb => {
        cb.checked = selectAll;
    });
};

window.addFromTemplate = async function() {
    const selected = Array.from(document.querySelectorAll('input[name="templateMapel"]:checked'));
    
    if (selected.length === 0) {
        showToast('warning', 'Perhatian', 'Pilih minimal satu mata pelajaran');
        return;
    }
    
    showLoading();
    
    for (const cb of selected) {
        const nama = cb.value;
        const kode = cb.dataset.kode;
        const elemen = JSON.parse(cb.dataset.elemen);
        
        await addUserMapel({ nama, kode, elemen, tingkat: [], custom: false });
    }
    
    hideLoading();
    showToast('success', 'Berhasil', `${selected.length} mata pelajaran ditambahkan`);
    closeTemplateModal();
    loadMapelList();
};

// =====================================================
// CAPAIAN PEMBELAJARAN FUNCTIONS
// =====================================================
window.loadCPByMapel = async function() {
    const mapelId = document.getElementById('filterMapel').value;
    const container = document.getElementById('cpContent');
    const btnAdd = document.getElementById('btnAddCP');
    
    if (!mapelId) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-book-open text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Pilih mata pelajaran untuk melihat Capaian Pembelajaran</p>
            </div>
        `;
        btnAdd.disabled = true;
        return;
    }
    
    currentFilters.mapelId = mapelId;
    btnAdd.disabled = false;
    
    container.innerHTML = `
        <div class="text-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
            <p class="text-gray-500 mt-4">Memuat data...</p>
        </div>
    `;
    
    const result = await getCPByMapel(mapelId);
    const mapel = appData.mapel.find(m => m.id === mapelId);
    
    if (result.success) {
        appData.cp = result.data;
        container.innerHTML = renderCPList(result.data, mapel);
    } else {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-exclamation-circle text-red-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Gagal memuat data: ${result.error}</p>
            </div>
        `;
    }
    
    // Populate elemen dropdown in modal
    populateElemenDropdown(mapel?.elemen || []);
};

function populateElemenDropdown(elemen) {
    const select = document.getElementById('cpElemen');
    if (!select) return;
    
    select.innerHTML = '<option value="">Pilih Elemen</option>';
    elemen.forEach(el => {
        select.innerHTML += `<option value="${el}">${el}</option>`;
    });
}

window.showAddCPModal = function() {
    document.getElementById('cpModalTitle').textContent = 'Tambah Capaian Pembelajaran';
    document.getElementById('cpId').value = '';
    document.getElementById('cpMapelId').value = currentFilters.mapelId;
    document.getElementById('cpForm').reset();
    
    // Reset TP container
    document.getElementById('tpContainer').innerHTML = `
        <div class="bg-gray-50 rounded-lg p-4 tp-row">
            <div class="flex gap-2 mb-2">
                <span class="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                <input type="text" class="tp-input form-input flex-1" placeholder="Deskripsi Tujuan Pembelajaran">
            </div>
            <div class="flex gap-2 ml-8">
                <input type="number" class="tp-alokasi form-input w-24" placeholder="JP" value="2" min="1">
                <button type="button" onclick="removeTPInput(this)" class="text-red-500 hover:text-red-700 px-2">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Reset dimensi checkboxes
    document.querySelectorAll('input[name="cpDimensi"]').forEach(cb => cb.checked = false);
    
    document.getElementById('cpModal').classList.remove('hidden');
};

window.closeCPModal = function() {
    document.getElementById('cpModal').classList.add('hidden');
};

window.addTPInput = function() {
    const container = document.getElementById('tpContainer');
    const count = container.querySelectorAll('.tp-row').length + 1;
    
    const div = document.createElement('div');
    div.className = 'bg-gray-50 rounded-lg p-4 tp-row';
    div.innerHTML = `
        <div class="flex gap-2 mb-2">
            <span class="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">${count}</span>
            <input type="text" class="tp-input form-input flex-1" placeholder="Deskripsi Tujuan Pembelajaran">
        </div>
        <div class="flex gap-2 ml-8">
            <input type="number" class="tp-alokasi form-input w-24" placeholder="JP" value="2" min="1">
            <button type="button" onclick="removeTPInput(this)" class="text-red-500 hover:text-red-700 px-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
};

window.removeTPInput = function(btn) {
    btn.closest('.tp-row').remove();
    // Re-number
    document.querySelectorAll('#tpContainer .tp-row').forEach((row, idx) => {
        row.querySelector('span').textContent = idx + 1;
    });
};

window.saveCP = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('cpId').value;
    const mapelId = document.getElementById('cpMapelId').value;
    const mapel = appData.mapel.find(m => m.id === mapelId);
    
    const fase = document.getElementById('cpFase').value;
    const elemen = document.getElementById('cpElemen').value;
    const deskripsiCP = document.getElementById('cpDeskripsi').value.trim();
    
    // Get dimensi
    const dimensiProfil = Array.from(document.querySelectorAll('input[name="cpDimensi"]:checked'))
        .map(cb => cb.value);
    
    // Get TP
    const tujuanPembelajaran = Array.from(document.querySelectorAll('.tp-input'))
        .map(input => input.value.trim())
        .filter(v => v);
    
    const data = {
        mapelId,
        mapelNama: mapel?.nama || '',
        fase,
        elemen,
        deskripsiCP,
        dimensiProfil,
        tujuanPembelajaran
    };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateCP(id, data);
    } else {
        result = await addCP(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', id ? 'CP diperbarui' : 'CP ditambahkan');
        closeCPModal();
        loadCPByMapel();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.editCP = async function(id) {
    const cp = appData.cp.find(c => c.id === id);
    if (!cp) return;
    
    document.getElementById('cpModalTitle').textContent = 'Edit Capaian Pembelajaran';
    document.getElementById('cpId').value = id;
    document.getElementById('cpMapelId').value = cp.mapelId;
    document.getElementById('cpFase').value = cp.fase;
    document.getElementById('cpElemen').value = cp.elemen;
    document.getElementById('cpDeskripsi').value = cp.deskripsiCP;
    
    // Set dimensi checkboxes
    document.querySelectorAll('input[name="cpDimensi"]').forEach(cb => {
        cb.checked = (cp.dimensiProfil || []).includes(cb.value);
    });
    
    // Populate TP
    const container = document.getElementById('tpContainer');
    const tpList = cp.tujuanPembelajaran || [];
    
    if (tpList.length > 0) {
        container.innerHTML = tpList.map((tp, idx) => `
            <div class="bg-gray-50 rounded-lg p-4 tp-row">
                <div class="flex gap-2 mb-2">
                    <span class="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">${idx + 1}</span>
                    <input type="text" class="tp-input form-input flex-1" value="${tp}" placeholder="Deskripsi Tujuan Pembelajaran">
                </div>
                <div class="flex gap-2 ml-8">
                    <input type="number" class="tp-alokasi form-input w-24" placeholder="JP" value="2" min="1">
                    <button type="button" onclick="removeTPInput(this)" class="text-red-500 hover:text-red-700 px-2">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('cpModal').classList.remove('hidden');
};

window.deleteCP = async function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus CP ini?')) {
        showLoading();
        const result = await deleteCPDoc(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'CP dihapus');
            loadCPByMapel();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

// =====================================================
// KELAS FUNCTIONS
// =====================================================
async function loadKelasList() {
    const container = document.getElementById('kelasList');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const result = await getKelasByNPSN(userData.npsn);
    
    if (result.success && result.data.length > 0) {
        appData.kelas = result.data;
        container.innerHTML = result.data.map(k => renderKelasCard(k)).join('');
    } else {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-users text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada kelas</p>
                <button onclick="showAddKelasModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Tambah Kelas
                </button>
            </div>
        `;
    }
}

window.showAddKelasModal = function() {
    document.getElementById('kelasModalTitle').textContent = 'Tambah Kelas';
    document.getElementById('kelasId').value = '';
    document.getElementById('kelasForm').reset();
    
    const userData = getCurrentUserData();
    populateKelasTingkatOptions(userData.jenjang);
    
    document.getElementById('kelasModal').classList.remove('hidden');
};

function populateKelasTingkatOptions(jenjang) {
    const select = document.getElementById('kelasTingkat');
    if (!select) return;
    
    const tingkat = {
        'SD': [1, 2, 3, 4, 5, 6],
        'SMP': [7, 8, 9],
        'SMA': [10, 11, 12]
    };
    
    select.innerHTML = '<option value="">Pilih</option>';
    (tingkat[jenjang] || []).forEach(t => {
        select.innerHTML += `<option value="${t}">Kelas ${t}</option>`;
    });
}

window.closeKelasModal = function() {
    document.getElementById('kelasModal').classList.add('hidden');
};

window.saveKelas = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('kelasId').value;
    const tingkat = parseInt(document.getElementById('kelasTingkat').value);
    const rombel = document.getElementById('kelasRombel').value.trim().toUpperCase();
    const waliKelas = document.getElementById('kelasWali').value.trim();
    const jumlahSiswa = parseInt(document.getElementById('kelasJumlahSiswa').value) || 0;
    
    const data = {
        tingkat,
        namaKelas: `${tingkat}${rombel}`,
        rombel,
        waliKelas,
        jumlahSiswa
    };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateKelas(id, data);
    } else {
        result = await addKelas(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', id ? 'Kelas diperbarui' : 'Kelas ditambahkan');
        closeKelasModal();
        loadKelasList();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.editKelas = function(id) {
    const kelas = appData.kelas.find(k => k.id === id);
    if (!kelas) return;
    
    document.getElementById('kelasModalTitle').textContent = 'Edit Kelas';
    document.getElementById('kelasId').value = id;
    
    const userData = getCurrentUserData();
    populateKelasTingkatOptions(userData.jenjang);
    
    setTimeout(() => {
        document.getElementById('kelasTingkat').value = kelas.tingkat;
        document.getElementById('kelasRombel').value = kelas.rombel;
        document.getElementById('kelasWali').value = kelas.waliKelas || '';
        document.getElementById('kelasJumlahSiswa').value = kelas.jumlahSiswa || 0;
    }, 100);
    
    document.getElementById('kelasModal').classList.remove('hidden');
};

window.deleteKelasConfirm = async function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
        showLoading();
        const result = await deleteKelasDoc(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'Kelas dihapus');
            loadKelasList();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

window.generateKelasOtomatis = async function() {
    const userData = getCurrentUserData();
    const jenjang = userData.jenjang;
    
    const tingkat = {
        'SD': [1, 2, 3, 4, 5, 6],
        'SMP': [7, 8, 9],
        'SMA': [10, 11, 12]
    };
    
    const rombel = ['A', 'B'];
    
    if (!confirm(`Generate kelas untuk jenjang ${jenjang}?\nAkan dibuat: ${(tingkat[jenjang] || []).length * rombel.length} kelas`)) {
        return;
    }
    
    showLoading();
    
    for (const t of (tingkat[jenjang] || [])) {
        for (const r of rombel) {
            // Check if already exists
            const exists = appData.kelas.find(k => k.tingkat === t && k.rombel === r);
            if (!exists) {
                await addKelas({
                    tingkat: t,
                    namaKelas: `${t}${r}`,
                    rombel: r,
                    waliKelas: '',
                    jumlahSiswa: 0
                });
            }
        }
    }
    
    hideLoading();
    showToast('success', 'Berhasil', 'Kelas berhasil digenerate');
    loadKelasList();
};

// =====================================================
// KALENDER FUNCTIONS
// =====================================================
async function loadKalender() {
    const userData = getCurrentUserData();
    const tahunAjaran = document.getElementById('kalenderTahunAjaran')?.value || '2024/2025';
    
    const result = await getKalenderPendidikan(userData.npsn, tahunAjaran);
    
    if (result.success) {
        appData.kalender = result.data;
        updateCalendarDisplay();
        updateKalenderStats();
    }
}

function updateCalendarDisplay() {
    const bulan = parseInt(document.getElementById('kalenderBulan')?.value || currentFilters.bulan);
    const tahun = parseInt(document.getElementById('kalenderTahun')?.value || currentFilters.tahun);
    
    currentFilters.bulan = bulan;
    currentFilters.tahun = tahun;
    
    // Update title
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    document.getElementById('calendarTitle').textContent = `${months[bulan]} ${tahun}`;
    
    // Render calendar
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = renderCalendarGrid(tahun, bulan, appData.kalender);
    
    // Render events list
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = renderEventsList(appData.kalender, tahun, bulan);
}

function updateKalenderStats() {
    // Count by type
    let hariLibur = 0;
    let hariUjian = 0;
    
    appData.kalender.forEach(e => {
        if (e.jenisKegiatan === 'libur_nasional' || e.jenisKegiatan === 'libur_sekolah') {
            hariLibur++;
        }
        if (e.jenisKegiatan === 'uts' || e.jenisKegiatan === 'uas') {
            hariUjian++;
        }
    });
    
    document.getElementById('hariEfektif').textContent = '-';
    document.getElementById('hariLibur').textContent = hariLibur;
    document.getElementById('hariUjian').textContent = hariUjian;
    document.getElementById('totalKegiatan').textContent = appData.kalender.length;
}

window.changeMonth = function() {
    updateCalendarDisplay();
};

window.prevMonth = function() {
    let bulan = currentFilters.bulan - 1;
    let tahun = currentFilters.tahun;
    
    if (bulan < 0) {
        bulan = 11;
        tahun--;
    }
    
    document.getElementById('kalenderBulan').value = bulan;
    document.getElementById('kalenderTahun').value = tahun;
    updateCalendarDisplay();
};

window.nextMonth = function() {
    let bulan = currentFilters.bulan + 1;
    let tahun = currentFilters.tahun;
    
    if (bulan > 11) {
        bulan = 0;
        tahun++;
    }
    
    document.getElementById('kalenderBulan').value = bulan;
    document.getElementById('kalenderTahun').value = tahun;
    updateCalendarDisplay();
};

window.showAddKalenderModal = function() {
    document.getElementById('kalenderModalTitle').textContent = 'Tambah Kegiatan';
    document.getElementById('kalenderEventId').value = '';
    document.getElementById('kalenderForm').reset();
    document.getElementById('kalenderModal').classList.remove('hidden');
};

window.closeKalenderModal = function() {
    document.getElementById('kalenderModal').classList.add('hidden');
};

window.saveKalenderEvent = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('kalenderEventId').value;
    const tahunAjaran = document.getElementById('kalenderTahunAjaran').value;
    const jenisKegiatan = document.getElementById('kalenderJenis').value;
    const namaKegiatan = document.getElementById('kalenderNama').value.trim();
    const tanggal = document.getElementById('kalenderTanggalMulai').value;
    const tanggalSelesai = document.getElementById('kalenderTanggalSelesai').value || tanggal;
    const keterangan = document.getElementById('kalenderKeterangan').value.trim();
    
    const data = { tahunAjaran, jenisKegiatan, namaKegiatan, tanggal, tanggalSelesai, keterangan };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateKalenderEvent(id, data);
    } else {
        result = await addKalenderEvent(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Kegiatan disimpan');
        closeKalenderModal();
        loadKalender();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.editKalenderEvent = function(id) {
    const event = appData.kalender.find(e => e.id === id);
    if (!event) return;
    
    document.getElementById('kalenderModalTitle').textContent = 'Edit Kegiatan';
    document.getElementById('kalenderEventId').value = id;
    document.getElementById('kalenderJenis').value = event.jenisKegiatan;
    document.getElementById('kalenderNama').value = event.namaKegiatan;
    document.getElementById('kalenderTanggalMulai').value = event.tanggal;
    document.getElementById('kalenderTanggalSelesai').value = event.tanggalSelesai;
    document.getElementById('kalenderKeterangan').value = event.keterangan || '';
    
    document.getElementById('kalenderModal').classList.remove('hidden');
};

window.deleteKalenderEvent = async function(id) {
    if (confirm('Hapus kegiatan ini?')) {
        showLoading();
        const result = await deleteKalenderEvent(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'Kegiatan dihapus');
            loadKalender();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

window.showDayEvents = function(dateStr) {
    const events = appData.kalender.filter(e => {
        const start = new Date(e.tanggal);
        const end = new Date(e.tanggalSelesai || e.tanggal);
        const current = new Date(dateStr);
        return current >= start && current <= end;
    });
    
    if (events.length === 0) {
        // Open add modal with date prefilled
        document.getElementById('kalenderModalTitle').textContent = 'Tambah Kegiatan';
        document.getElementById('kalenderEventId').value = '';
        document.getElementById('kalenderForm').reset();
        document.getElementById('kalenderTanggalMulai').value = dateStr;
        document.getElementById('kalenderModal').classList.remove('hidden');
    } else if (events.length === 1) {
        editKalenderEvent(events[0].id);
    } else {
        // Show list of events
        alert('Kegiatan pada tanggal ini:\n' + events.map(e => '- ' + e.namaKegiatan).join('\n'));
    }
};

window.generateDefaultKalender = async function() {
    const tahunAjaran = document.getElementById('kalenderTahunAjaran').value;
    
    if (!confirm(`Generate kalender default untuk tahun ajaran ${tahunAjaran}?`)) {
        return;
    }
    
    showLoading();
    const result = await generateDefaultKalenderFn(tahunAjaran);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Kalender default berhasil digenerate');
        loadKalender();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

// =====================================================
// JADWAL FUNCTIONS
// =====================================================
async function loadJadwal() {
    const container = document.getElementById('jadwalContent');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const tahunAjaran = document.getElementById('jadwalTahunAjaran')?.value || '2024/2025';
    const semester = document.getElementById('jadwalSemester')?.value || '1';
    
    const result = await getJadwalByNPSN(userData.npsn, tahunAjaran, semester);
    const jamSettings = await getJamPelajaranSettings(userData.npsn);
    
    if (result.success) {
        appData.jadwal = result.data;
        const jamList = jamSettings.data?.jam || JAM_PELAJARAN[userData.jenjang] || JAM_PELAJARAN.SMP;
        container.innerHTML = renderScheduleGrid(result.data, appData.kelas, jamList, 'kelas');
    } else {
        container.innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-exclamation-circle text-red-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Gagal memuat jadwal</p>
            </div>
        `;
    }
}

window.changeJadwalView = function() {
    const view = document.getElementById('jadwalTampilan').value;
    const container = document.getElementById('jadwalContent');
    const userData = getCurrentUserData();
    const jamList = JAM_PELAJARAN[userData.jenjang] || JAM_PELAJARAN.SMP;
    
    container.innerHTML = renderScheduleGrid(appData.jadwal, appData.kelas, jamList, view);
};

window.showAddJadwalModal = function() {
    document.getElementById('jadwalModalTitle').textContent = 'Tambah Jadwal';
    document.getElementById('jadwalId').value = '';
    document.getElementById('jadwalForm').reset();
    
    // Populate dropdowns
    populateJadwalFormDropdowns();
    
    document.getElementById('modalConflictAlert').classList.add('hidden');
    document.getElementById('jadwalModal').classList.remove('hidden');
};

async function populateJadwalFormDropdowns() {
    const userData = getCurrentUserData();
    
    // Kelas
    const kelasSelect = document.getElementById('jadwalKelasInput');
    const rombelSelect = document.getElementById('jadwalRombelInput');
    
    const tingkat = { 'SD': [1,2,3,4,5,6], 'SMP': [7,8,9], 'SMA': [10,11,12] };
    
    kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>';
    (tingkat[userData.jenjang] || []).forEach(t => {
        kelasSelect.innerHTML += `<option value="${t}">Kelas ${t}</option>`;
    });
    
    rombelSelect.innerHTML = '<option value="">Pilih Rombel</option>';
    ['A', 'B', 'C', 'D'].forEach(r => {
        rombelSelect.innerHTML += `<option value="${r}">${r}</option>`;
    });
    
    // Mapel
    const mapelSelect = document.getElementById('jadwalMapel');
    mapelSelect.innerHTML = '<option value="">Pilih Mapel</option>';
    appData.mapel.forEach(m => {
        mapelSelect.innerHTML += `<option value="${m.id}" data-nama="${m.nama}" data-kode="${m.kode}">${m.nama}</option>`;
    });
    
    // Guru - load from school teachers
    const teachers = await getSchoolTeachers(userData.npsn);
    const guruSelect = document.getElementById('jadwalGuru');
    guruSelect.innerHTML = '<option value="">Pilih Guru</option>';
    teachers.forEach(t => {
        guruSelect.innerHTML += `<option value="${t.uid}" data-nama="${t.namaGuru}">${t.namaGuru}</option>`;
    });
}

window.closeJadwalModal = function() {
    document.getElementById('jadwalModal').classList.add('hidden');
};

window.quickAddJadwal = function(hari, jamKe, kelas, rombel) {
    showAddJadwalModal();
    
    setTimeout(() => {
        document.getElementById('jadwalHari').value = hari;
        document.getElementById('jadwalJamKe').value = jamKe;
        document.getElementById('jadwalKelasInput').value = kelas;
        document.getElementById('jadwalRombelInput').value = rombel;
    }, 200);
};

window.saveJadwal = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('jadwalId').value;
    const tahunAjaran = document.getElementById('jadwalTahunAjaran').value;
    const semester = document.getElementById('jadwalSemester').value;
    
    const mapelSelect = document.getElementById('jadwalMapel');
    const guruSelect = document.getElementById('jadwalGuru');
    
    const data = {
        tahunAjaran,
        semester,
        hari: document.getElementById('jadwalHari').value,
        kelas: document.getElementById('jadwalKelasInput').value,
        rombel: document.getElementById('jadwalRombelInput').value,
        jamKe: parseInt(document.getElementById('jadwalJamKe').value),
        durasi: parseInt(document.getElementById('jadwalDurasi').value) || 1,
        mapelId: mapelSelect.value,
        mapelNama: mapelSelect.options[mapelSelect.selectedIndex]?.dataset.nama || '',
        mapelKode: mapelSelect.options[mapelSelect.selectedIndex]?.dataset.kode || '',
        guruId: guruSelect.value,
        guruNama: guruSelect.options[guruSelect.selectedIndex]?.dataset.nama || '',
        ruangan: document.getElementById('jadwalRuangan').value
    };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateJadwal(id, data);
    } else {
        result = await addJadwal(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Jadwal disimpan');
        closeJadwalModal();
        loadJadwal();
    } else {
        if (result.conflicts) {
            document.getElementById('modalConflictAlert').classList.remove('hidden');
            document.getElementById('modalConflictMessage').textContent = 
                result.conflicts.map(c => c.message).join('\n');
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

window.editJadwal = function(id) {
    const jadwal = appData.jadwal.find(j => j.id === id);
    if (!jadwal) return;
    
    document.getElementById('jadwalModalTitle').textContent = 'Edit Jadwal';
    document.getElementById('jadwalId').value = id;
    
    populateJadwalFormDropdowns();
    
    setTimeout(() => {
        document.getElementById('jadwalHari').value = jadwal.hari;
        document.getElementById('jadwalJamKe').value = jadwal.jamKe;
        document.getElementById('jadwalKelasInput').value = jadwal.kelas;
        document.getElementById('jadwalRombelInput').value = jadwal.rombel;
        document.getElementById('jadwalMapel').value = jadwal.mapelId;
        document.getElementById('jadwalGuru').value = jadwal.guruId;
        document.getElementById('jadwalDurasi').value = jadwal.durasi || 1;
        document.getElementById('jadwalRuangan').value = jadwal.ruangan || '';
    }, 200);
    
    document.getElementById('modalConflictAlert').classList.add('hidden');
    document.getElementById('jadwalModal').classList.remove('hidden');
};

window.deleteJadwal = async function(id) {
    if (confirm('Hapus jadwal ini?')) {
        showLoading();
        const result = await deleteJadwal(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'Jadwal dihapus');
            loadJadwal();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

// =====================================================
// PROFIL FUNCTIONS
// =====================================================
async function loadSchoolTeachers() {
    const container = document.getElementById('guruSesekolahList');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const teachers = await getSchoolTeachers(userData.npsn);
    
    if (teachers.length > 0) {
        container.innerHTML = teachers.map(t => `
            <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                <img src="${t.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(t.namaGuru)}" 
                     alt="${t.namaGuru}" 
                     class="w-10 h-10 rounded-full object-cover">
                <div>
                    <p class="font-medium text-gray-800">${t.namaGuru}</p>
                    <p class="text-sm text-gray-500">${t.email}</p>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-400">
                <p>Belum ada guru lain yang terdaftar</p>
            </div>
        `;
    }
}

window.showEditProfilModal = function() {
    document.getElementById('editProfilModal').classList.remove('hidden');
};

window.closeEditProfilModal = function() {
    document.getElementById('editProfilModal').classList.add('hidden');
};

window.saveEditProfil = async function(e) {
    e.preventDefault();
    
    const data = {
        namaGuru: document.getElementById('editNamaGuru').value.trim(),
        nip: document.getElementById('editNIP').value.trim()
    };
    
    showLoading();
    const result = await updateUserProfile(data);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Profil diperbarui');
        closeEditProfilModal();
        navigateTo('profil');
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.showEditSekolahModal = function() {
    document.getElementById('editSekolahModal').classList.remove('hidden');
};

window.closeEditSekolahModal = function() {
    document.getElementById('editSekolahModal').classList.add('hidden');
};

window.saveEditSekolah = async function(e) {
    e.preventDefault();
    
    const userData = getCurrentUserData();
    const data = {
        namaSekolah: document.getElementById('editNamaSekolah').value.trim(),
        alamat: document.getElementById('editAlamatSekolah').value.trim(),
        kepalaSekolah: document.getElementById('editKepsek').value.trim(),
        nipKepsek: document.getElementById('editNIPKepsek').value.trim()
    };
    
    showLoading();
    const result = await updateSchoolData(userData.npsn, data);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Data sekolah diperbarui');
        closeEditSekolahModal();
        navigateTo('profil');
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

// =====================================================
// MODUL AJAR FUNCTIONS
// =====================================================
async function loadModulAjar() {
    const container = document.getElementById('modulList');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const mapelId = document.getElementById('modulMapel')?.value || '';
    
    if (!mapelId && appData.mapel.length > 0) {
        // Load all moduls
        let allModuls = [];
        for (const mapel of appData.mapel) {
            const result = await getModulAjar(userData.uid, mapel.id);
            if (result.success) {
                allModuls = [...allModuls, ...result.data];
            }
        }
        appData.modul = allModuls;
    } else if (mapelId) {
        const result = await getModulAjar(userData.uid, mapelId);
        if (result.success) {
            appData.modul = result.data;
        }
    }
    
    if (appData.modul.length > 0) {
        container.innerHTML = appData.modul.map(m => renderModulCard(m)).join('');
    } else {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-file-alt text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada modul ajar</p>
                <button onclick="showAddModulModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Buat Modul Ajar
                </button>
            </div>
        `;
    }
}

window.showAddModulModal = function() {
    document.getElementById('modulModalTitle').textContent = 'Buat Modul Ajar';
    document.getElementById('modulId').value = '';
    document.getElementById('modulForm').reset();
    
    // Reset containers
    resetModulForm();
    
    document.getElementById('modulModal').classList.remove('hidden');
};

function resetModulForm() {
    // Reset TP container
    document.getElementById('modulTPContainer').innerHTML = `
        <div class="flex gap-2">
            <input type="text" class="modul-tp-input form-input flex-1" placeholder="Tujuan Pembelajaran 1">
            <button type="button" onclick="addModulTPInput()" class="btn-secondary">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    // Reset kegiatan containers
    ['Pendahuluan', 'Inti', 'Penutup'].forEach(type => {
        document.getElementById(`kegiatan${type}`).innerHTML = `
            <textarea class="kegiatan-input form-input" rows="1" placeholder="Kegiatan ${type.toLowerCase()}..."></textarea>
        `;
    });
    
    // Reset dimensi checkboxes
    document.querySelectorAll('input[name="modulDimensi"]').forEach(cb => cb.checked = false);
}

window.closeModulModal = function() {
    document.getElementById('modulModal').classList.add('hidden');
};

window.switchModulTab = function(tab) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    
    event.target.classList.add('active');
    document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');
};

window.addModulTPInput = function() {
    const container = document.getElementById('modulTPContainer');
    const count = container.querySelectorAll('.modul-tp-input').length + 1;
    
    const div = document.createElement('div');
    div.className = 'flex gap-2 mt-2';
    div.innerHTML = `
        <input type="text" class="modul-tp-input form-input flex-1" placeholder="Tujuan Pembelajaran ${count}">
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700 px-2">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
};

window.addKegiatanInput = function(type) {
    const container = document.getElementById(`kegiatan${type}`);
    const textarea = document.createElement('textarea');
    textarea.className = 'kegiatan-input form-input mt-2';
    textarea.rows = 1;
    textarea.placeholder = `Kegiatan ${type.toLowerCase()}...`;
    container.appendChild(textarea);
};

window.saveModulAjar = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('modulId').value;
    const mapelSelect = document.getElementById('modulMapelInput');
    
    // Gather TP
    const tujuanPembelajaran = Array.from(document.querySelectorAll('.modul-tp-input'))
        .map(input => input.value.trim())
        .filter(v => v);
    
    // Gather kegiatan
    const kegiatan = {
        pendahuluan: Array.from(document.querySelectorAll('#kegiatanPendahuluan .kegiatan-input'))
            .map(t => t.value.trim()).filter(v => v),
        inti: Array.from(document.querySelectorAll('#kegiatanInti .kegiatan-input'))
            .map(t => t.value.trim()).filter(v => v),
        penutup: Array.from(document.querySelectorAll('#kegiatanPenutup .kegiatan-input'))
            .map(t => t.value.trim()).filter(v => v)
    };
    
    // Gather dimensi
    const profilLulusan = Array.from(document.querySelectorAll('input[name="modulDimensi"]:checked'))
        .map(cb => cb.value);
    
    const data = {
        mapelId: mapelSelect.value,
        mapelNama: mapelSelect.options[mapelSelect.selectedIndex]?.text || '',
        kelas: document.getElementById('modulKelasInput').value,
        fase: document.getElementById('modulFase').value,
        alokasi: parseInt(document.getElementById('modulAlokasi').value) || 2,
        modelPembelajaran: document.getElementById('modulModel').value,
        capaianPembelajaran: document.getElementById('modulCP').value.trim(),
        tujuanPembelajaran,
        profilLulusan,
        kegiatan,
        asesmen: {
            diagnostik: document.getElementById('asesmenDiagnostik').value.trim(),
            formatif: document.getElementById('asesmenFormatif').value.trim(),
            sumatif: document.getElementById('asesmenSumatif').value.trim()
        },
        pengayaan: document.getElementById('modulPengayaan').value.trim(),
        remedial: document.getElementById('modulRemedial').value.trim(),
        refleksiGuru: document.getElementById('modulRefleksiGuru').value.trim(),
        refleksiPesertaDidik: document.getElementById('modulRefleksiSiswa').value.trim()
    };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateModulAjar(id, data);
    } else {
        result = await createModulAjar(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Modul ajar disimpan');
        closeModulModal();
        loadModulAjar();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.deleteModulConfirm = async function(id) {
    if (confirm('Hapus modul ajar ini?')) {
        showLoading();
        const result = await deleteModulAjar(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'Modul ajar dihapus');
            loadModulAjar();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

window.exportModulWord = async function(id) {
    const modul = appData.modul.find(m => m.id === id);
    if (!modul) return;
    
    await exportModulAjarToWord(modul);
};

// =====================================================
// LKPD FUNCTIONS
// =====================================================
async function loadLKPD() {
    const container = document.getElementById('lkpdList');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const mapelId = document.getElementById('lkpdMapel')?.value || '';
    
    if (!mapelId && appData.mapel.length > 0) {
        let allLKPD = [];
        for (const mapel of appData.mapel) {
            const result = await getLKPD(userData.uid, mapel.id);
            if (result.success) {
                allLKPD = [...allLKPD, ...result.data];
            }
        }
        appData.lkpd = allLKPD;
    } else if (mapelId) {
        const result = await getLKPD(userData.uid, mapelId);
        if (result.success) {
            appData.lkpd = result.data;
        }
    }
    
    if (appData.lkpd.length > 0) {
        container.innerHTML = appData.lkpd.map(l => renderLKPDCard(l)).join('');
    } else {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-clipboard-list text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada LKPD</p>
                <button onclick="showAddLKPDModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Buat LKPD
                </button>
            </div>
        `;
    }
}

function initLKPDModal() {
    // Add initial kegiatan
    if (document.getElementById('lkpdKegiatanContainer')) {
        addLKPDKegiatan();
    }
}

window.showAddLKPDModal = function() {
    document.getElementById('lkpdModalTitle').textContent = 'Buat LKPD';
    document.getElementById('lkpdId').value = '';
    document.getElementById('lkpdForm').reset();
    
    // Reset kegiatan container
    document.getElementById('lkpdKegiatanContainer').innerHTML = '';
    addLKPDKegiatan();
    
    // Reset TP container
    document.getElementById('lkpdTPContainer').innerHTML = `
        <div class="flex gap-2">
            <input type="text" class="lkpd-tp-input form-input flex-1" placeholder="Tujuan Pembelajaran 1">
            <button type="button" onclick="addLKPDTPInput()" class="btn-secondary">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    
    document.getElementById('lkpdModal').classList.remove('hidden');
};

window.closeLKPDModal = function() {
    document.getElementById('lkpdModal').classList.add('hidden');
};

window.addLKPDTPInput = function() {
    const container = document.getElementById('lkpdTPContainer');
    const count = container.querySelectorAll('.lkpd-tp-input').length + 1;
    
    const div = document.createElement('div');
    div.className = 'flex gap-2 mt-2';
    div.innerHTML = `
        <input type="text" class="lkpd-tp-input form-input flex-1" placeholder="Tujuan Pembelajaran ${count}">
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700 px-2">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
};

window.addLKPDKegiatan = function() {
    const container = document.getElementById('lkpdKegiatanContainer');
    const count = container.querySelectorAll('.lkpd-kegiatan-item').length + 1;
    
    const div = document.createElement('div');
    div.className = 'lkpd-kegiatan-item bg-gray-50 rounded-lg p-4';
    div.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-gray-700">Kegiatan ${count}</span>
            <button type="button" onclick="this.closest('.lkpd-kegiatan-item').remove()" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="space-y-3">
            <div>
                <label class="text-sm text-gray-600">Instruksi/Soal</label>
                <textarea class="lkpd-instruksi form-input" rows="2" placeholder="Tuliskan instruksi atau soal..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-sm text-gray-600">Jenis</label>
                    <select class="lkpd-jenis form-input">
                        <option value="uraian">Uraian</option>
                        <option value="isian">Isian Singkat</option>
                        <option value="tabel">Tabel</option>
                        <option value="gambar">Gambar</option>
                    </select>
                </div>
                <div>
                    <label class="text-sm text-gray-600">Skor</label>
                    <input type="number" class="lkpd-skor form-input" value="10" min="1">
                </div>
            </div>
        </div>
    `;
    container.appendChild(div);
};

window.saveLKPD = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('lkpdId').value;
    const mapelSelect = document.getElementById('lkpdMapelInput');
    
    // Gather TP
    const tujuanPembelajaran = Array.from(document.querySelectorAll('.lkpd-tp-input'))
        .map(input => input.value.trim())
        .filter(v => v);
    
    // Gather kegiatan
    const kegiatan = Array.from(document.querySelectorAll('.lkpd-kegiatan-item')).map((item, idx) => ({
        nomor: idx + 1,
        instruksi: item.querySelector('.lkpd-instruksi').value.trim(),
        jenis: item.querySelector('.lkpd-jenis').value,
        skor: parseInt(item.querySelector('.lkpd-skor').value) || 10
    }));
    
    const data = {
        mapelId: mapelSelect.value,
        mapelNama: mapelSelect.options[mapelSelect.selectedIndex]?.text || '',
        judul: document.getElementById('lkpdJudul').value.trim(),
        kelas: document.getElementById('lkpdKelasInput').value,
        semester: document.getElementById('lkpdSemester').value,
        alokasi: parseInt(document.getElementById('lkpdAlokasi').value) || 40,
        jenisLKPD: document.getElementById('lkpdJenis').value,
        tujuanPembelajaran,
        materiSingkat: document.getElementById('lkpdMateri').value.trim(),
        kegiatan,
        showKesimpulan: document.getElementById('lkpdShowKesimpulan').checked
    };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateLKPD(id, data);
    } else {
        result = await createLKPD(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'LKPD disimpan');
        closeLKPDModal();
        loadLKPD();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.deleteLKPDConfirm = async function(id) {
    if (confirm('Hapus LKPD ini?')) {
        showLoading();
        const result = await deleteLKPD(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'LKPD dihapus');
            loadLKPD();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

window.exportLKPDWord = async function(id) {
    const lkpd = appData.lkpd.find(l => l.id === id);
    if (!lkpd) return;
    
    await exportLKPDToWord(lkpd);
};

// =====================================================
// BANK SOAL FUNCTIONS
// =====================================================
async function loadBankSoal() {
    const container = document.getElementById('bankSoalList');
    if (!container) return;
    
    const userData = getCurrentUserData();
    const mapelId = document.getElementById('bankSoalMapel')?.value || '';
    
    if (!mapelId && appData.mapel.length > 0) {
        let allSoal = [];
        for (const mapel of appData.mapel) {
            const result = await getBankSoal(userData.uid, mapel.id);
            if (result.success) {
                allSoal = [...allSoal, ...result.data];
            }
        }
        appData.soal = allSoal;
    } else if (mapelId) {
        const result = await getBankSoal(userData.uid, mapelId);
        if (result.success) {
            appData.soal = result.data;
        }
    }
    
    updateBankSoalStats();
    
    if (appData.soal.length > 0) {
        container.innerHTML = appData.soal.map((s, idx) => renderSoalCard(s, idx)).join('');
    } else {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-question-circle text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada soal</p>
                <button onclick="showAddSoalModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Tambah Soal
                </button>
            </div>
        `;
    }
}

function updateBankSoalStats() {
    LEVEL_KOGNITIF.slice(0, 4).forEach(level => {
        const count = appData.soal.filter(s => s.levelKognitif === level.id).length;
        const el = document.getElementById(`stat${level.id}`);
        if (el) el.textContent = count;
    });
}

window.showAddSoalModal = function() {
    document.getElementById('soalModalTitle').textContent = 'Tambah Soal';
    document.getElementById('soalId').value = '';
    document.getElementById('soalForm').reset();
    
    toggleSoalOptions();
    
    document.getElementById('soalModal').classList.remove('hidden');
};

window.closeSoalModal = function() {
    document.getElementById('soalModal').classList.add('hidden');
};

window.toggleSoalOptions = function() {
    const tipe = document.getElementById('soalTipe').value;
    const opsiContainer = document.getElementById('opsiContainer');
    const kunciContainer = document.getElementById('kunciContainer');
    
    if (tipe === 'pilgan' || tipe === 'pilgan_kompleks') {
        opsiContainer.classList.remove('hidden');
        kunciContainer.classList.add('hidden');
    } else {
        opsiContainer.classList.add('hidden');
        kunciContainer.classList.remove('hidden');
    }
};

window.loadElemenForSoal = async function() {
    const mapelId = document.getElementById('soalMapel').value;
    const mapel = appData.mapel.find(m => m.id === mapelId);
    
    const select = document.getElementById('soalElemen');
    select.innerHTML = '<option value="">Pilih Elemen</option>';
    
    if (mapel?.elemen) {
        mapel.elemen.forEach(el => {
            select.innerHTML += `<option value="${el}">${el}</option>`;
        });
    }
};

window.saveSoal = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('soalId').value;
    const mapelSelect = document.getElementById('soalMapel');
    const tipe = document.getElementById('soalTipe').value;
    
    // Get opsi for pilihan ganda
    let opsi = [];
    let kunciJawaban = '';
    
    if (tipe === 'pilgan' || tipe === 'pilgan_kompleks') {
        const benarRadio = document.querySelector('input[name="opsiBenar"]:checked');
        opsi = Array.from(document.querySelectorAll('.opsi-input')).map(input => ({
            label: input.dataset.label,
            teks: input.value.trim(),
            benar: benarRadio?.value === input.dataset.label
        })).filter(o => o.teks);
        
        kunciJawaban = benarRadio?.value || '';
    } else {
        kunciJawaban = document.getElementById('soalKunci').value.trim();
    }
    
    const data = {
        mapelId: mapelSelect.value,
        mapelNama: mapelSelect.options[mapelSelect.selectedIndex]?.text || '',
        kelas: document.getElementById('soalKelas').value,
        elemen: document.getElementById('soalElemen').value,
        tipeSoal: tipe,
        levelKognitif: document.getElementById('soalLevel').value,
        tingkatKesulitan: document.getElementById('soalKesulitan').value,
        pertanyaan: document.getElementById('soalPertanyaan').value.trim(),
        opsi,
        kunciJawaban,
        pembahasan: document.getElementById('soalPembahasan').value.trim(),
        skorMaksimal: parseInt(document.getElementById('soalSkor').value) || 1
    };
    
    showLoading();
    
    let result;
    if (id) {
        result = await updateSoal(id, data);
    } else {
        result = await addSoal(data);
    }
    
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Soal disimpan');
        closeSoalModal();
        loadBankSoal();
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.editSoal = function(id) {
    const soal = appData.soal.find(s => s.id === id);
    if (!soal) return;
    
    document.getElementById('soalModalTitle').textContent = 'Edit Soal';
    document.getElementById('soalId').value = id;
    
    document.getElementById('soalMapel').value = soal.mapelId;
    document.getElementById('soalKelas').value = soal.kelas;
    document.getElementById('soalTipe').value = soal.tipeSoal;
    document.getElementById('soalLevel').value = soal.levelKognitif;
    document.getElementById('soalKesulitan').value = soal.tingkatKesulitan || 'sedang';
    document.getElementById('soalPertanyaan').value = soal.pertanyaan;
    document.getElementById('soalPembahasan').value = soal.pembahasan || '';
    document.getElementById('soalSkor').value = soal.skorMaksimal || 1;
    
    loadElemenForSoal();
    setTimeout(() => {
        document.getElementById('soalElemen').value = soal.elemen || '';
    }, 100);
    
    toggleSoalOptions();
    
    // Fill opsi for PG
    if ((soal.tipeSoal === 'pilgan' || soal.tipeSoal === 'pilgan_kompleks') && soal.opsi) {
        soal.opsi.forEach(o => {
            const input = document.querySelector(`.opsi-input[data-label="${o.label}"]`);
            if (input) input.value = o.teks;
            
            if (o.benar) {
                const radio = document.querySelector(`input[name="opsiBenar"][value="${o.label}"]`);
                if (radio) radio.checked = true;
            }
        });
    } else {
        document.getElementById('soalKunci').value = soal.kunciJawaban || '';
    }
    
    document.getElementById('soalModal').classList.remove('hidden');
};

window.deleteSoalConfirm = async function(id) {
    if (confirm('Hapus soal ini?')) {
        showLoading();
        const result = await deleteSoal(id);
        hideLoading();
        
        if (result.success) {
            showToast('success', 'Berhasil', 'Soal dihapus');
            loadBankSoal();
        } else {
            showToast('error', 'Gagal', result.error);
        }
    }
};

window.showGeneratePaketModal = function() {
    document.getElementById('paketModal').classList.remove('hidden');
};

window.closePaketModal = function() {
    document.getElementById('paketModal').classList.add('hidden');
};

window.generatePaket = async function(e) {
    e.preventDefault();
    
    const config = {
        namaPaket: document.getElementById('paketNama').value.trim(),
        mapelId: document.getElementById('paketMapel').value,
        kelas: document.getElementById('paketKelas').value,
        jenisUjian: document.getElementById('paketJenis').value,
        waktu: parseInt(document.getElementById('paketWaktu').value) || 60,
        jumlahSoal: parseInt(document.getElementById('paketJumlah').value) || 20,
        includeKey: document.getElementById('paketIncludeKey').checked
    };
    
    showLoading();
    
    const result = await generatePaketSoal(config.mapelId, config);
    
    if (result.success) {
        // Get mapel name
        const mapelSelect = document.getElementById('paketMapel');
        const mapelNama = mapelSelect.options[mapelSelect.selectedIndex]?.text || '';
        
        // Export to Word
        await exportBankSoalToWord(result.data.soal.map(s => ({
            ...appData.soal.find(x => x.id === s.soalId),
            ...s
        })), {
            ...config,
            mapelNama,
            filename: config.namaPaket.replace(/\s+/g, '_')
        });
        
        closePaketModal();
    } else {
        showToast('error', 'Gagal', result.error);
    }
    
    hideLoading();
};

// =====================================================
// ATP/KKTP/PROTA/PROMES GENERATION FUNCTIONS
// =====================================================
window.generateNewATP = async function() {
    const mapelId = document.getElementById('atpMapel').value;
    const kelas = document.getElementById('atpKelas').value;
    const tahunAjaran = document.getElementById('atpTahunAjaran').value;
    
    if (!mapelId || !kelas) {
        showToast('warning', 'Perhatian', 'Pilih mata pelajaran dan kelas');
        return;
    }
    
    showLoading();
    const result = await generateATP(mapelId, tahunAjaran, kelas);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'ATP berhasil digenerate');
        // Offer to export
        if (confirm('ATP berhasil dibuat. Export ke Word?')) {
            await exportATPToWord(result.data);
        }
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.generateNewKKTP = async function() {
    const mapelId = document.getElementById('kktpMapel').value;
    const kelas = document.getElementById('kktpKelas').value;
    const tahunAjaran = document.getElementById('kktpTahunAjaran').value;
    
    if (!mapelId || !kelas) {
        showToast('warning', 'Perhatian', 'Pilih mata pelajaran dan kelas');
        return;
    }
    
    showLoading();
    const result = await generateKKTP(mapelId, tahunAjaran, kelas);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'KKTP berhasil digenerate');
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.generateNewProta = async function() {
    const mapelId = document.getElementById('protaMapel').value;
    const kelas = document.getElementById('protaKelas').value;
    const tahunAjaran = document.getElementById('protaTahunAjaran').value;
    
    if (!mapelId || !kelas) {
        showToast('warning', 'Perhatian', 'Pilih mata pelajaran dan kelas');
        return;
    }
    
    showLoading();
    const result = await generateProta(mapelId, tahunAjaran, kelas);
    hideLoading();
    
    if (result.success) {
        showToast('success', 'Berhasil', 'Prota berhasil digenerate');
        if (confirm('Prota berhasil dibuat. Export ke Word?')) {
            await exportProtaToWord(result.data);
        }
    } else {
        showToast('error', 'Gagal', result.error);
    }
};

window.generateNewPromes = async function() {
    // First need to have Prota
    showToast('info', 'Info', 'Fitur Promes akan segera tersedia');
};

// =====================================================
// PRINT & EXPORT FUNCTIONS
// =====================================================
window.printJadwal = function() {
    printDocument('jadwalContent');
};

window.exportJadwal = async function(format) {
    if (format === 'pdf') {
        await exportToPDF('jadwalContent', 'Jadwal_Pelajaran');
    } else if (format === 'word') {
        showToast('info', 'Info', 'Export Word untuk jadwal akan segera tersedia');
    }
};

window.exportKalender = async function() {
    await exportToPDF('pageContent', 'Kalender_Pendidikan');
};

// =====================================================
// INITIALIZATION COMPLETE
// =====================================================
console.log('✅ App.js loaded successfully');