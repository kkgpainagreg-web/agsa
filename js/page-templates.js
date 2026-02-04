// =====================================================
// PAGE TEMPLATES - page-templates.js
// Templates for Prota, Promes, Modul Ajar, LKPD, Bank Soal
// =====================================================

import { DIMENSI_PROFIL_LULUSAN } from './master-data.js';
import { TIPE_SOAL, LEVEL_KOGNITIF } from './documents.js';

// =====================================================
// DASHBOARD PAGE
// =====================================================
export function renderDashboardPage(userData, schoolData, stats) {
    const greeting = getGreeting();
    
    return `
        <div class="animate-fadeIn">
            <!-- Welcome Section -->
            <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 lg:p-8 text-white mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p class="text-white/80 mb-1">${greeting}</p>
                        <h1 class="text-2xl lg:text-3xl font-bold">${userData?.namaGuru || 'Guru'}</h1>
                        <p class="text-white/80 mt-2">
                            <i class="fas fa-school mr-2"></i>${schoolData?.namaSekolah || '-'}
                        </p>
                    </div>
                    <div class="mt-4 lg:mt-0">
                        <p class="text-white/80 text-sm">Tahun Pelajaran</p>
                        <p class="text-xl font-bold">2024/2025</p>
                    </div>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Mata Pelajaran</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.mapel || 0}</p>
                        </div>
                        <div class="stats-icon bg-blue-100 text-blue-600">
                            <i class="fas fa-book"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Capaian Pembelajaran</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.cp || 0}</p>
                        </div>
                        <div class="stats-icon bg-green-100 text-green-600">
                            <i class="fas fa-bullseye"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Modul Ajar</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.modul || 0}</p>
                        </div>
                        <div class="stats-icon bg-purple-100 text-purple-600">
                            <i class="fas fa-file-alt"></i>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Bank Soal</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.soal || 0}</p>
                        </div>
                        <div class="stats-icon bg-orange-100 text-orange-600">
                            <i class="fas fa-question-circle"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions & Recent Activity -->
            <div class="grid lg:grid-cols-3 gap-6">
                <!-- Quick Actions -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="font-semibold text-gray-800 mb-4">
                            <i class="fas fa-bolt text-yellow-500 mr-2"></i>
                            Aksi Cepat
                        </h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <button onclick="navigateTo('cp')" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                <i class="fas fa-bullseye text-2xl mb-2"></i>
                                <span class="text-sm font-medium">Input CP</span>
                            </button>
                            <button onclick="navigateTo('atp')" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-green-50 hover:text-green-600 transition-all">
                                <i class="fas fa-chart-line text-2xl mb-2"></i>
                                <span class="text-sm font-medium">Buat ATP</span>
                            </button>
                            <button onclick="navigateTo('modul')" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-all">
                                <i class="fas fa-file-alt text-2xl mb-2"></i>
                                <span class="text-sm font-medium">Modul Ajar</span>
                            </button>
                            <button onclick="navigateTo('jadwal')" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-cyan-50 hover:text-cyan-600 transition-all">
                                <i class="fas fa-clock text-2xl mb-2"></i>
                                <span class="text-sm font-medium">Jadwal</span>
                            </button>
                            <button onclick="navigateTo('lkpd')" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-pink-50 hover:text-pink-600 transition-all">
                                <i class="fas fa-clipboard-list text-2xl mb-2"></i>
                                <span class="text-sm font-medium">Buat LKPD</span>
                            </button>
                            <button onclick="navigateTo('banksoal')" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-all">
                                <i class="fas fa-question-circle text-2xl mb-2"></i>
                                <span class="text-sm font-medium">Bank Soal</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 8 Dimensi Profil Lulusan -->
                    <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <h3 class="font-semibold text-gray-800 mb-4">
                            <i class="fas fa-star text-yellow-500 mr-2"></i>
                            8 Dimensi Profil Lulusan
                        </h3>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            ${DIMENSI_PROFIL_LULUSAN.map(d => `
                                <div class="dimension-card" style="border-left-color: ${d.warna}">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="fas ${d.icon}" style="color: ${d.warna}"></i>
                                        <span class="font-medium text-sm text-gray-800">${d.nama}</span>
                                    </div>
                                    <p class="text-xs text-gray-500">${d.deskripsi}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-semibold text-gray-800 mb-4">
                        <i class="fas fa-history text-gray-400 mr-2"></i>
                        Aktivitas Terbaru
                    </h3>
                    <div id="recentActivity" class="space-y-4">
                        <div class="text-center py-8 text-gray-400">
                            <i class="fas fa-inbox text-3xl mb-2"></i>
                            <p class="text-sm">Belum ada aktivitas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi,';
    if (hour < 15) return 'Selamat Siang,';
    if (hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
}

// =====================================================
// PROFIL PAGE
// =====================================================
export function renderProfilPage(userData, schoolData) {
    return `
        <div class="animate-fadeIn max-w-4xl mx-auto">
            <!-- Profile Header -->
            <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-6">
                <div class="flex flex-col sm:flex-row items-center gap-6">
                    <img src="${userData?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData?.namaGuru || 'G')}" 
                         alt="Profile" 
                         class="w-24 h-24 rounded-full border-4 border-white/30 object-cover">
                    <div class="text-center sm:text-left">
                        <h1 class="text-2xl font-bold">${userData?.namaGuru || '-'}</h1>
                        <p class="text-white/80">${userData?.email || '-'}</p>
                        <p class="text-white/80 mt-1">
                            <i class="fas fa-id-card mr-2"></i>NIP: ${userData?.nip || '-'}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Profile Details -->
            <div class="grid md:grid-cols-2 gap-6">
                <!-- Data Guru -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gray-800">
                            <i class="fas fa-user text-primary mr-2"></i>
                            Data Guru
                        </h3>
                        <button onclick="showEditProfilModal()" class="text-primary hover:text-primary/80 text-sm">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">Nama Lengkap</span>
                            <span class="font-medium text-gray-800">${userData?.namaGuru || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">NIP</span>
                            <span class="font-medium text-gray-800">${userData?.nip || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">Email</span>
                            <span class="font-medium text-gray-800">${userData?.email || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-500">Jenjang</span>
                            <span class="font-medium text-gray-800">${userData?.jenjang || '-'}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Data Sekolah -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gray-800">
                            <i class="fas fa-school text-primary mr-2"></i>
                            Data Sekolah
                        </h3>
                        <button onclick="showEditSekolahModal()" class="text-primary hover:text-primary/80 text-sm">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">NPSN</span>
                            <span class="font-medium text-gray-800">${userData?.npsn || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">Nama Sekolah</span>
                            <span class="font-medium text-gray-800">${schoolData?.namaSekolah || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">Alamat</span>
                            <span class="font-medium text-gray-800 text-right">${schoolData?.alamat || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100">
                            <span class="text-gray-500">Kepala Sekolah</span>
                            <span class="font-medium text-gray-800">${schoolData?.kepalaSekolah || '-'}</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-500">NIP Kepsek</span>
                            <span class="font-medium text-gray-800">${schoolData?.nipKepsek || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Guru Sesekolah -->
            <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-users text-primary mr-2"></i>
                    Guru Sesekolah (Pengguna Aplikasi)
                </h3>
                <div id="guruSesekolahList" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="text-center py-8 col-span-full">
                        <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                        <p class="text-gray-500 mt-2">Memuat data...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Edit Profil Modal -->
        <div id="editProfilModal" class="modal-overlay hidden">
            <div class="modal-content max-w-md">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold">Edit Profil</h3>
                    <button onclick="closeEditProfilModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="editProfilForm" onsubmit="saveEditProfil(event)" class="modal-body space-y-4">
                    <div>
                        <label class="form-label">Nama Lengkap</label>
                        <input type="text" id="editNamaGuru" value="${userData?.namaGuru || ''}" class="form-input" required>
                    </div>
                    <div>
                        <label class="form-label">NIP</label>
                        <input type="text" id="editNIP" value="${userData?.nip || ''}" class="form-input">
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closeEditProfilModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Edit Sekolah Modal -->
        <div id="editSekolahModal" class="modal-overlay hidden">
            <div class="modal-content max-w-md">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold">Edit Data Sekolah</h3>
                    <button onclick="closeEditSekolahModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="editSekolahForm" onsubmit="saveEditSekolah(event)" class="modal-body space-y-4">
                    <div>
                        <label class="form-label">Nama Sekolah</label>
                        <input type="text" id="editNamaSekolah" value="${schoolData?.namaSekolah || ''}" class="form-input" required>
                    </div>
                    <div>
                        <label class="form-label">Alamat</label>
                        <textarea id="editAlamatSekolah" rows="2" class="form-input">${schoolData?.alamat || ''}</textarea>
                    </div>
                    <div>
                        <label class="form-label">Kepala Sekolah</label>
                        <input type="text" id="editKepsek" value="${schoolData?.kepalaSekolah || ''}" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">NIP Kepala Sekolah</label>
                        <input type="text" id="editNIPKepsek" value="${schoolData?.nipKepsek || ''}" class="form-input">
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closeEditSekolahModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// =====================================================
// ATP PAGE
// =====================================================
export function renderATPPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Alur Tujuan Pembelajaran (ATP)</h1>
                    <p class="text-gray-500 mt-1">Generate dan kelola ATP dari Capaian Pembelajaran</p>
                </div>
            </div>
            
            <!-- Filter & Generate -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="atpMapel" onchange="loadATP()" class="form-input">
                            <option value="">Pilih Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="atpKelas" class="form-input">
                            <option value="">Pilih Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="atpTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                            <option value="2023/2024">2023/2024</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="generateNewATP()" class="btn-primary flex-1 flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i>
                            <span>Generate ATP</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- ATP Content -->
            <div id="atpContent">
                <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i class="fas fa-chart-line text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Pilih mata pelajaran dan kelas untuk melihat atau generate ATP</p>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// KKTP PAGE
// =====================================================
export function renderKKTPPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h1>
                    <p class="text-gray-500 mt-1">Generate dan kelola KKTP dari Tujuan Pembelajaran</p>
                </div>
            </div>
            
            <!-- Filter & Generate -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="kktpMapel" onchange="loadKKTP()" class="form-input">
                            <option value="">Pilih Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="kktpKelas" class="form-input">
                            <option value="">Pilih Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="kktpTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="generateNewKKTP()" class="btn-primary flex-1 flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i>
                            <span>Generate KKTP</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- KKTP Content -->
            <div id="kktpContent">
                <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i class="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Pilih mata pelajaran dan kelas untuk melihat atau generate KKTP</p>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// PROTA PAGE
// =====================================================
export function renderProtaPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Program Tahunan (Prota)</h1>
                    <p class="text-gray-500 mt-1">Generate dan kelola Program Tahunan</p>
                </div>
            </div>
            
            <!-- Filter & Generate -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="protaMapel" onchange="loadProta()" class="form-input">
                            <option value="">Pilih Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="protaKelas" class="form-input">
                            <option value="">Pilih Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="protaTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="generateNewProta()" class="btn-primary flex-1 flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i>
                            <span>Generate Prota</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Prota Content -->
            <div id="protaContent">
                <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i class="fas fa-calendar-check text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Pilih mata pelajaran untuk melihat atau generate Prota</p>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// PROMES PAGE
// =====================================================
export function renderPromesPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Program Semester (Promes)</h1>
                    <p class="text-gray-500 mt-1">Generate dan kelola Program Semester</p>
                </div>
            </div>
            
            <!-- Filter & Generate -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="promesMapel" onchange="loadPromes()" class="form-input">
                            <option value="">Pilih Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="promesKelas" class="form-input">
                            <option value="">Pilih Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="promesTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Semester</label>
                        <select id="promesSemester" class="form-input">
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button onclick="generateNewPromes()" class="btn-primary flex-1 flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i>
                            <span>Generate</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Promes Content -->
            <div id="promesContent">
                <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i class="fas fa-calendar-week text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Pilih mata pelajaran untuk melihat atau generate Promes</p>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// MODUL AJAR PAGE
// =====================================================
export function renderModulAjarPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Modul Ajar</h1>
                    <p class="text-gray-500 mt-1">Buat dan kelola modul ajar untuk pembelajaran</p>
                </div>
                <button onclick="showAddModulModal()" class="btn-primary flex items-center gap-2">
                    <i class="fas fa-plus"></i>
                    <span>Buat Modul Ajar</span>
                </button>
            </div>
            
            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="modulMapel" onchange="loadModulAjar()" class="form-input">
                            <option value="">Semua Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="modulKelas" onchange="filterModulAjar()" class="form-input">
                            <option value="">Semua Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cari</label>
                        <input type="text" id="modulSearch" onkeyup="filterModulAjar()" class="form-input" placeholder="Cari modul...">
                    </div>
                </div>
            </div>
            
            <!-- Modul List -->
            <div id="modulList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-gray-500 mt-4">Memuat data...</p>
                </div>
            </div>
        </div>
        
        <!-- Add/Edit Modul Modal -->
        ${renderModulAjarModal()}
    `;
}

function renderModulAjarModal() {
    return `
        <div id="modulModal" class="modal-overlay hidden">
            <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="modal-header sticky top-0 bg-white z-10">
                    <h3 id="modulModalTitle" class="text-lg font-semibold">Buat Modul Ajar</h3>
                    <button onclick="closeModulModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="modulForm" onsubmit="saveModulAjar(event)" class="modal-body">
                    <input type="hidden" id="modulId">
                    
                    <!-- Tabs -->
                    <div class="tabs mb-6">
                        <button type="button" class="tab-item active" onclick="switchModulTab('umum')">Informasi Umum</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('cp')">CP & TP</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('kegiatan')">Kegiatan</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('asesmen')">Asesmen</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('lainnya')">Lainnya</button>
                    </div>
                    
                    <!-- Tab: Informasi Umum -->
                    <div id="tabUmum" class="tab-content space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                                <select id="modulMapelInput" required class="form-input" onchange="loadElemenForModul()">
                                    <option value="">Pilih Mapel</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                                <select id="modulKelasInput" required class="form-input">
                                    <option value="">Pilih Kelas</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">Fase <span class="text-red-500">*</span></label>
                                <select id="modulFase" required class="form-input">
                                    <option value="">Pilih Fase</option>
                                    <option value="A">Fase A</option>
                                    <option value="B">Fase B</option>
                                    <option value="C">Fase C</option>
                                    <option value="D">Fase D</option>
                                    <option value="E">Fase E</option>
                                    <option value="F">Fase F</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Alokasi Waktu (JP)</label>
                                <input type="number" id="modulAlokasi" value="2" min="1" class="form-input">
                            </div>
                        </div>
                        
                        <div>
                            <label class="form-label">Model Pembelajaran</label>
                            <select id="modulModel" class="form-input">
                                <option value="">Pilih Model</option>
                                <option value="Problem Based Learning">Problem Based Learning</option>
                                <option value="Project Based Learning">Project Based Learning</option>
                                <option value="Discovery Learning">Discovery Learning</option>
                                <option value="Inquiry Learning">Inquiry Learning</option>
                                <option value="Cooperative Learning">Cooperative Learning</option>
                                <option value="Contextual Teaching Learning">Contextual Teaching Learning</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="form-label">Dimensi Profil Lulusan</label>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                ${DIMENSI_PROFIL_LULUSAN.map(d => `
                                    <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" name="modulDimensi" value="${d.id}" class="rounded border-gray-300 text-primary focus:ring-primary">
                                        <span class="text-sm">${d.nama}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tab: CP & TP -->
                    <div id="tabCp" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Capaian Pembelajaran <span class="text-red-500">*</span></label>
                            <textarea id="modulCP" rows="4" required class="form-input" placeholder="Tuliskan Capaian Pembelajaran..."></textarea>
                        </div>
                        
                        <div>
                            <label class="form-label">Tujuan Pembelajaran</label>
                            <div id="modulTPContainer" class="space-y-2">
                                <div class="flex gap-2">
                                    <input type="text" class="modul-tp-input form-input flex-1" placeholder="Tujuan Pembelajaran 1">
                                    <button type="button" onclick="addModulTPInput()" class="btn-secondary">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tab: Kegiatan -->
                    <div id="tabKegiatan" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Kegiatan Pendahuluan</label>
                            <div id="kegiatanPendahuluan" class="space-y-2">
                                <textarea class="kegiatan-input form-input" rows="1" placeholder="Kegiatan pendahuluan..."></textarea>
                            </div>
                            <button type="button" onclick="addKegiatanInput('Pendahuluan')" class="mt-2 text-sm text-primary">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                        
                        <div>
                            <label class="form-label">Kegiatan Inti</label>
                            <div id="kegiatanInti" class="space-y-2">
                                <textarea class="kegiatan-input form-input" rows="1" placeholder="Kegiatan inti..."></textarea>
                            </div>
                            <button type="button" onclick="addKegiatanInput('Inti')" class="mt-2 text-sm text-primary">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                        
                        <div>
                            <label class="form-label">Kegiatan Penutup</label>
                            <div id="kegiatanPenutup" class="space-y-2">
                                <textarea class="kegiatan-input form-input" rows="1" placeholder="Kegiatan penutup..."></textarea>
                            </div>
                            <button type="button" onclick="addKegiatanInput('Penutup')" class="mt-2 text-sm text-primary">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tab: Asesmen -->
                    <div id="tabAsesmen" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Asesmen Diagnostik</label>
                            <textarea id="asesmenDiagnostik" rows="2" class="form-input" placeholder="Cara mendiagnosis pengetahuan awal..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Asesmen Formatif</label>
                            <textarea id="asesmenFormatif" rows="2" class="form-input" placeholder="Penilaian selama proses pembelajaran..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Asesmen Sumatif</label>
                            <textarea id="asesmenSumatif" rows="2" class="form-input" placeholder="Penilaian akhir pembelajaran..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab: Lainnya -->
                    <div id="tabLainnya" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Pengayaan</label>
                            <textarea id="modulPengayaan" rows="2" class="form-input" placeholder="Kegiatan pengayaan untuk peserta didik..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Remedial</label>
                            <textarea id="modulRemedial" rows="2" class="form-input" placeholder="Kegiatan remedial untuk peserta didik..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Refleksi Guru</label>
                            <textarea id="modulRefleksiGuru" rows="2" class="form-input" placeholder="Refleksi setelah pembelajaran..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Refleksi Peserta Didik</label>
                            <textarea id="modulRefleksiSiswa" rows="2" class="form-input" placeholder="Pertanyaan refleksi untuk siswa..."></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer border-t pt-4 mt-6 sticky bottom-0 bg-white">
                        <button type="button" onclick="closeModulModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan Modul</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// =====================================================
// LKPD PAGE
// =====================================================
export function renderLKPDPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Lembar Kerja Peserta Didik (LKPD)</h1>
                    <p class="text-gray-500 mt-1">Buat dan kelola LKPD untuk pembelajaran</p>
                </div>
                <button onclick="showAddLKPDModal()" class="btn-primary flex items-center gap-2">
                    <i class="fas fa-plus"></i>
                    <span>Buat LKPD</span>
                </button>
            </div>
            
            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="lkpdMapel" onchange="loadLKPD()" class="form-input">
                            <option value="">Semua Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="lkpdKelas" onchange="filterLKPD()" class="form-input">
                            <option value="">Semua Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cari</label>
                        <input type="text" id="lkpdSearch" onkeyup="filterLKPD()" class="form-input" placeholder="Cari LKPD...">
                    </div>
                </div>
            </div>
            
            <!-- LKPD List -->
            <div id="lkpdList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-gray-500 mt-4">Memuat data...</p>
                </div>
            </div>
        </div>
        
        <!-- Add/Edit LKPD Modal -->
        ${renderLKPDModal()}
    `;
}

function renderLKPDModal() {
    return `
        <div id="lkpdModal" class="modal-overlay hidden">
            <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
                <div class="modal-header sticky top-0 bg-white z-10">
                    <h3 id="lkpdModalTitle" class="text-lg font-semibold">Buat LKPD</h3>
                    <button onclick="closeLKPDModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="lkpdForm" onsubmit="saveLKPD(event)" class="modal-body space-y-6">
                    <input type="hidden" id="lkpdId">
                    
                    <!-- Basic Info -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                            <select id="lkpdMapelInput" required class="form-input">
                                <option value="">Pilih Mapel</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                            <select id="lkpdKelasInput" required class="form-input">
                                <option value="">Pilih Kelas</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Judul LKPD <span class="text-red-500">*</span></label>
                        <input type="text" id="lkpdJudul" required class="form-input" placeholder="Judul LKPD...">
                    