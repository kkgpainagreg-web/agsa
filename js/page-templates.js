// =====================================================
// PAGE TEMPLATES - page-templates.js
// Templates for all pages
// =====================================================

import { DIMENSI_PROFIL_LULUSAN } from './master-data.js';

// =====================================================
// TIPE SOAL & LEVEL KOGNITIF (moved here to avoid circular dependency)
// =====================================================
export const TIPE_SOAL = [
    { id: 'pilgan', nama: 'Pilihan Ganda', icon: 'fa-list-ol' },
    { id: 'pilgan_kompleks', nama: 'Pilihan Ganda Kompleks', icon: 'fa-tasks' },
    { id: 'isian', nama: 'Isian Singkat', icon: 'fa-i-cursor' },
    { id: 'uraian', nama: 'Uraian', icon: 'fa-align-left' },
    { id: 'menjodohkan', nama: 'Menjodohkan', icon: 'fa-random' },
    { id: 'benar_salah', nama: 'Benar/Salah', icon: 'fa-check-circle' }
];

export const LEVEL_KOGNITIF = [
    { id: 'C1', nama: 'Mengingat (C1)', deskripsi: 'Mengenali, mengingat kembali' },
    { id: 'C2', nama: 'Memahami (C2)', deskripsi: 'Menafsirkan, memberi contoh, merangkum' },
    { id: 'C3', nama: 'Mengaplikasikan (C3)', deskripsi: 'Menggunakan prosedur dalam situasi tertentu' },
    { id: 'C4', nama: 'Menganalisis (C4)', deskripsi: 'Menguraikan, membedakan, mengorganisir' },
    { id: 'C5', nama: 'Mengevaluasi (C5)', deskripsi: 'Memeriksa, mengkritik' },
    { id: 'C6', nama: 'Mencipta (C6)', deskripsi: 'Merumuskan, merencanakan, memproduksi' }
];

export const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const JENIS_KEGIATAN = [
    { id: 'efektif', nama: 'Hari Efektif', warna: '#10B981' },
    { id: 'libur_nasional', nama: 'Libur Nasional', warna: '#EF4444' },
    { id: 'libur_sekolah', nama: 'Libur Sekolah', warna: '#F59E0B' },
    { id: 'uts', nama: 'UTS/PTS', warna: '#8B5CF6' },
    { id: 'uas', nama: 'UAS/PAS', warna: '#6366F1' },
    { id: 'rapor', nama: 'Pembagian Rapor', warna: '#EC4899' },
    { id: 'mpls', nama: 'MPLS', warna: '#14B8A6' },
    { id: 'class_meeting', nama: 'Class Meeting', warna: '#06B6D4' },
    { id: 'lainnya', nama: 'Kegiatan Lainnya', warna: '#6B7280' }
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi,';
    if (hour < 15) return 'Selamat Siang,';
    if (hour < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
}

function getLevelColor(level) {
    const colors = {
        'C1': '#10B981',
        'C2': '#3B82F6',
        'C3': '#8B5CF6',
        'C4': '#F59E0B',
        'C5': '#EF4444',
        'C6': '#EC4899'
    };
    return colors[level] || '#6B7280';
}

function getDimensiColor(id) {
    const dimensi = DIMENSI_PROFIL_LULUSAN.find(d => d.id === id);
    return dimensi ? dimensi.warna : '#6B7280';
}

function getDimensiNama(id) {
    const dimensi = DIMENSI_PROFIL_LULUSAN.find(d => d.id === id);
    return dimensi ? dimensi.nama : id;
}

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
            
            <!-- Quick Actions & 8 Dimensi -->
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
                                        <span class="font-medium text-xs text-gray-800">${d.nama}</span>
                                    </div>
                                    <p class="text-xs text-gray-500 line-clamp-2">${d.deskripsi}</p>
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
                            <i class="fas fa-user text-primary mr-2"></i>Data Guru
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
                            <i class="fas fa-school text-primary mr-2"></i>Data Sekolah
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
                    <i class="fas fa-users text-primary mr-2"></i>Guru Sesekolah
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
// MAPEL PAGE
// =====================================================
export function renderMapelPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
                    <p class="text-gray-500 mt-1">Kelola mata pelajaran yang Anda ampu</p>
                </div>
                <button onclick="showAddMapelModal()" class="btn-primary flex items-center gap-2">
                    <i class="fas fa-plus"></i>
                    <span>Tambah Mapel</span>
                </button>
            </div>
            
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <h3 class="font-semibold text-gray-800 mb-3">
                    <i class="fas fa-magic text-primary mr-2"></i>Tambah Cepat dari Template
                </h3>
                <p class="text-sm text-gray-600 mb-4">Pilih mata pelajaran standar sesuai jenjang</p>
                <button onclick="showTemplateModal()" class="bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all">
                    <i class="fas fa-list-alt mr-2"></i>Pilih dari Template
                </button>
            </div>
            
            <div id="mapelList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-gray-500 mt-4">Memuat data...</p>
                </div>
            </div>
        </div>
        
        <!-- Mapel Modal -->
        <div id="mapelModal" class="modal-overlay hidden">
            <div class="modal-content max-w-lg">
                <div class="modal-header">
                    <h3 id="mapelModalTitle" class="text-lg font-semibold">Tambah Mata Pelajaran</h3>
                    <button onclick="closeMapelModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="mapelForm" onsubmit="saveMapel(event)" class="modal-body space-y-4">
                    <input type="hidden" id="mapelId">
                    <div>
                        <label class="form-label">Nama Mata Pelajaran <span class="text-red-500">*</span></label>
                        <input type="text" id="mapelNama" required class="form-input" placeholder="Contoh: Matematika">
                    </div>
                    <div>
                        <label class="form-label">Kode <span class="text-red-500">*</span></label>
                        <input type="text" id="mapelKode" required class="form-input" placeholder="Contoh: MTK">
                    </div>
                    <div>
                        <label class="form-label">Kelas yang Diampu</label>
                        <div id="tingkatCheckboxes" class="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2"></div>
                    </div>
                    <div>
                        <label class="form-label">Elemen Mata Pelajaran</label>
                        <div id="elemenContainer" class="space-y-2">
                            <div class="flex gap-2 elemen-row">
                                <input type="text" class="elemen-input form-input flex-1" placeholder="Nama Elemen">
                                <button type="button" onclick="removeElemenInput(this)" class="text-red-500 hover:text-red-700 px-2">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <button type="button" onclick="addElemenInput()" class="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                            <i class="fas fa-plus"></i> Tambah Elemen
                        </button>
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closeMapelModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Template Modal -->
        <div id="templateModal" class="modal-overlay hidden">
            <div class="modal-content max-w-2xl max-h-[80vh]">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold">Pilih dari Template</h3>
                    <button onclick="closeTemplateModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="mb-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="selectAllTemplates" onchange="toggleAllTemplates()" class="w-5 h-5 rounded border-gray-300 text-primary">
                            <span class="font-medium">Pilih Semua</span>
                        </label>
                    </div>
                    <div id="templateList" class="space-y-2 max-h-96 overflow-y-auto"></div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeTemplateModal()" class="btn-secondary">Batal</button>
                    <button onclick="addFromTemplate()" class="btn-primary">Tambahkan</button>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// CP PAGE
// =====================================================
export function renderCPPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Capaian Pembelajaran</h1>
                    <p class="text-gray-500 mt-1">Input CP berdasarkan elemen mata pelajaran</p>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="filterMapel" onchange="loadCPByMapel()" class="form-input">
                            <option value="">Pilih Mata Pelajaran</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Fase</label>
                        <select id="filterFase" onchange="filterCP()" class="form-input">
                            <option value="">Semua Fase</option>
                            <option value="A">Fase A (Kelas 1-2 SD)</option>
                            <option value="B">Fase B (Kelas 3-4 SD)</option>
                            <option value="C">Fase C (Kelas 5-6 SD)</option>
                            <option value="D">Fase D (Kelas 7-9 SMP)</option>
                            <option value="E">Fase E (Kelas 10 SMA)</option>
                            <option value="F">Fase F (Kelas 11-12 SMA)</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="showAddCPModal()" class="btn-primary w-full flex items-center justify-center gap-2" id="btnAddCP" disabled>
                            <i class="fas fa-plus"></i>
                            <span>Tambah CP</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="cpContent">
                <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i class="fas fa-book-open text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Pilih mata pelajaran untuk melihat CP</p>
                </div>
            </div>
        </div>
        
        <!-- CP Modal -->
        <div id="cpModal" class="modal-overlay hidden">
            <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
                <div class="modal-header sticky top-0 bg-white z-10">
                    <h3 id="cpModalTitle" class="text-lg font-semibold">Tambah Capaian Pembelajaran</h3>
                    <button onclick="closeCPModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="cpForm" onsubmit="saveCP(event)" class="modal-body space-y-6">
                    <input type="hidden" id="cpId">
                    <input type="hidden" id="cpMapelId">
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Fase <span class="text-red-500">*</span></label>
                            <select id="cpFase" required class="form-input">
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
                            <label class="form-label">Elemen <span class="text-red-500">*</span></label>
                            <select id="cpElemen" required class="form-input">
                                <option value="">Pilih Elemen</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Deskripsi CP <span class="text-red-500">*</span></label>
                        <textarea id="cpDeskripsi" required rows="4" class="form-input" placeholder="Tuliskan CP..."></textarea>
                    </div>
                    
                    <div>
                        <label class="form-label">Dimensi Profil Lulusan</label>
                        <div id="dimensiCheckboxes" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"></div>
                    </div>
                    
                    <div>
                        <label class="form-label">Tujuan Pembelajaran</label>
                        <div id="tpContainer" class="space-y-3">
                            <div class="bg-gray-50 rounded-lg p-4 tp-row">
                                <div class="flex gap-2 mb-2">
                                    <span class="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    <input type="text" class="tp-input form-input flex-1" placeholder="Tujuan Pembelajaran">
                                </div>
                                <div class="flex gap-2 ml-8">
                                    <input type="number" class="tp-alokasi form-input w-24" placeholder="JP" value="2" min="1">
                                    <button type="button" onclick="removeTPInput(this)" class="text-red-500 hover:text-red-700 px-2">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="button" onclick="addTPInput()" class="mt-3 text-sm text-primary">
                            <i class="fas fa-plus mr-1"></i>Tambah TP
                        </button>
                    </div>
                    
                    <div class="modal-footer border-t pt-4 sticky bottom-0 bg-white">
                        <button type="button" onclick="closeCPModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Render CP List
export function renderCPList(cpList, mapelData) {
    if (!cpList || cpList.length === 0) {
        return `
            <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-clipboard-list text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada Capaian Pembelajaran</p>
                <button onclick="showAddCPModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Tambah CP Pertama
                </button>
            </div>
        `;
    }
    
    const cpByElemen = {};
    cpList.forEach(cp => {
        if (!cpByElemen[cp.elemen]) {
            cpByElemen[cp.elemen] = [];
        }
        cpByElemen[cp.elemen].push(cp);
    });
    
    let html = '<div class="space-y-6">';
    
    Object.keys(cpByElemen).forEach(elemen => {
        html += `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-primary to-secondary px-6 py-4">
                    <h3 class="text-white font-semibold flex items-center gap-2">
                        <i class="fas fa-layer-group"></i>Elemen: ${elemen}
                    </h3>
                </div>
                <div class="divide-y">
        `;
        
        cpByElemen[elemen].forEach(cp => {
            const dimensiBadges = (cp.dimensiProfil || []).map(d => {
                return `<span class="badge" style="background: ${getDimensiColor(d)}20; color: ${getDimensiColor(d)}">${getDimensiNama(d)}</span>`;
            }).join('');
            
            html += `
                <div class="p-6 hover:bg-gray-50 transition-all">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex flex-wrap items-center gap-2 mb-2">
                                <span class="badge badge-primary">Fase ${cp.fase}</span>
                                ${dimensiBadges}
                            </div>
                            <p class="text-gray-700 mb-4">${cp.deskripsiCP}</p>
                            ${cp.tujuanPembelajaran && cp.tujuanPembelajaran.length > 0 ? `
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p class="text-sm font-medium text-gray-600 mb-2">Tujuan Pembelajaran:</p>
                                    <ul class="space-y-2">
                                        ${cp.tujuanPembelajaran.map((tp, idx) => `
                                            <li class="flex items-start gap-2 text-sm text-gray-600">
                                                <span class="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">${idx + 1}</span>
                                                <span>${tp}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="editCP('${cp.id}')" class="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteCP('${cp.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    return html;
}

// =====================================================
// KELAS PAGE
// =====================================================
export function renderKelasPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Kelas & Rombel</h1>
                    <p class="text-gray-500 mt-1">Kelola data kelas di sekolah</p>
                </div>
                <button onclick="showAddKelasModal()" class="btn-primary flex items-center gap-2">
                    <i class="fas fa-plus"></i>
                    <span>Tambah Kelas</span>
                </button>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-6">
                <h3 class="font-semibold text-gray-800 mb-3">
                    <i class="fas fa-magic text-green-600 mr-2"></i>Generate Otomatis
                </h3>
                <button onclick="generateKelasOtomatis()" class="bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200">
                    <i class="fas fa-cogs mr-2"></i>Generate Semua Kelas
                </button>
            </div>
            
            <div id="kelasList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-gray-500 mt-4">Memuat data...</p>
                </div>
            </div>
        </div>
        
        <!-- Kelas Modal -->
        <div id="kelasModal" class="modal-overlay hidden">
            <div class="modal-content max-w-md">
                <div class="modal-header">
                    <h3 id="kelasModalTitle" class="text-lg font-semibold">Tambah Kelas</h3>
                    <button onclick="closeKelasModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="kelasForm" onsubmit="saveKelas(event)" class="modal-body space-y-4">
                    <input type="hidden" id="kelasId">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Tingkat <span class="text-red-500">*</span></label>
                            <select id="kelasTingkat" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Rombel <span class="text-red-500">*</span></label>
                            <input type="text" id="kelasRombel" required class="form-input" placeholder="A, B, C...">
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Wali Kelas</label>
                        <input type="text" id="kelasWali" class="form-input" placeholder="Nama wali kelas">
                    </div>
                    <div>
                        <label class="form-label">Jumlah Siswa</label>
                        <input type="number" id="kelasJumlahSiswa" class="form-input" placeholder="0" min="0">
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closeKelasModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// =====================================================
// KALENDER PAGE
// =====================================================
export function renderKalenderPage() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Kalender Pendidikan</h1>
                    <p class="text-gray-500 mt-1">Kelola kegiatan dan hari efektif</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showAddKalenderModal()" class="btn-primary flex items-center gap-2">
                        <i class="fas fa-plus"></i><span>Tambah</span>
                    </button>
                    <button onclick="exportKalender()" class="btn-secondary flex items-center gap-2">
                        <i class="fas fa-file-export"></i>
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="kalenderTahunAjaran" onchange="loadKalender()" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                            <option value="2023/2024">2023/2024</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Bulan</label>
                        <select id="kalenderBulan" onchange="changeMonth()" class="form-input">
                            <option value="0">Januari</option>
                            <option value="1">Februari</option>
                            <option value="2">Maret</option>
                            <option value="3">April</option>
                            <option value="4">Mei</option>
                            <option value="5">Juni</option>
                            <option value="6" ${currentMonth === 6 ? 'selected' : ''}>Juli</option>
                            <option value="7" ${currentMonth === 7 ? 'selected' : ''}>Agustus</option>
                            <option value="8">September</option>
                            <option value="9">Oktober</option>
                            <option value="10">November</option>
                            <option value="11">Desember</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun</label>
                        <select id="kalenderTahun" onchange="changeMonth()" class="form-input">
                            <option value="2024" ${currentYear === 2024 ? 'selected' : ''}>2024</option>
                            <option value="2025" ${currentYear === 2025 ? 'selected' : ''}>2025</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="generateDefaultKalender()" class="btn-secondary w-full">
                            <i class="fas fa-magic mr-2"></i>Generate
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-primary" id="hariEfektif">-</p>
                        <p class="text-sm text-gray-500">Hari Efektif</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-red-500" id="hariLibur">-</p>
                        <p class="text-sm text-gray-500">Hari Libur</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-purple-500" id="hariUjian">-</p>
                        <p class="text-sm text-gray-500">Hari Ujian</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-gray-800" id="totalKegiatan">-</p>
                        <p class="text-sm text-gray-500">Total Kegiatan</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-6">
                        <button onclick="prevMonth()" class="p-2 hover:bg-gray-100 rounded-lg">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 id="calendarTitle" class="text-lg font-semibold text-gray-800">Juli 2024</h3>
                        <button onclick="nextMonth()" class="p-2 hover:bg-gray-100 rounded-lg">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-7 gap-1 mb-2">
                        <div class="text-center text-sm font-semibold text-red-500 py-2">Min</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Sen</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Sel</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Rab</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Kam</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Jum</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Sab</div>
                    </div>
                    
                    <div id="calendarGrid" class="grid grid-cols-7 gap-1"></div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-semibold text-gray-800 mb-4">Kegiatan Bulan Ini</h3>
                    <div id="eventsList" class="space-y-3 max-h-96 overflow-y-auto"></div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 class="font-semibold text-gray-800 mb-4">Keterangan</h3>
                <div class="flex flex-wrap gap-4">
                    ${JENIS_KEGIATAN.map(j => `
                        <div class="flex items-center gap-2">
                            <span class="w-4 h-4 rounded" style="background-color: ${j.warna}"></span>
                            <span class="text-sm text-gray-600">${j.nama}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- Kalender Modal -->
        <div id="kalenderModal" class="modal-overlay hidden">
            <div class="modal-content max-w-lg">
                <div class="modal-header">
                    <h3 id="kalenderModalTitle" class="text-lg font-semibold">Tambah Kegiatan</h3>
                    <button onclick="closeKalenderModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="kalenderForm" onsubmit="saveKalenderEvent(event)" class="modal-body space-y-4">
                    <input type="hidden" id="kalenderEventId">
                    <div>
                        <label class="form-label">Jenis <span class="text-red-500">*</span></label>
                        <select id="kalenderJenis" required class="form-input">
                            <option value="">Pilih</option>
                            ${JENIS_KEGIATAN.map(j => `<option value="${j.id}">${j.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Nama Kegiatan <span class="text-red-500">*</span></label>
                        <input type="text" id="kalenderNama" required class="form-input">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Tanggal Mulai <span class="text-red-500">*</span></label>
                            <input type="date" id="kalenderTanggalMulai" required class="form-input">
                        </div>
                        <div>
                            <label class="form-label">Tanggal Selesai</label>
                            <input type="date" id="kalenderTanggalSelesai" class="form-input">
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Keterangan</label>
                        <textarea id="kalenderKeterangan" rows="2" class="form-input"></textarea>
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closeKalenderModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Calendar Grid Renderer
export function renderCalendarGrid(year, month, events) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    
    let html = '';
    
    for (let i = 0; i < startPadding; i++) {
        html += '<div class="calendar-day text-gray-300"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        
        const dayEvents = (events || []).filter(e => {
            const start = new Date(e.tanggal);
            const end = new Date(e.tanggalSelesai || e.tanggal);
            return currentDate >= start && currentDate <= end;
        });
        
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        const isSunday = dayOfWeek === 0;
        const hasEvent = dayEvents.length > 0;
        
        let eventColor = '';
        if (hasEvent) {
            const jenis = JENIS_KEGIATAN.find(j => j.id === dayEvents[0].jenisKegiatan);
            eventColor = jenis ? jenis.warna : '#6B7280';
        }
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSunday ? 'text-red-500' : ''}" 
                onclick="showDayEvents('${dateStr}')"
                ${hasEvent ? `style="background-color: ${eventColor}20; border-left: 3px solid ${eventColor}"` : ''}>
                <span class="${isToday ? 'text-white' : ''}">${day}</span>
            </div>
        `;
    }
    
    return html;
}

// Events List Renderer
export function renderEventsList(events, year, month) {
    const monthEvents = (events || []).filter(e => {
        const eventDate = new Date(e.tanggal);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    if (monthEvents.length === 0) {
        return `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-calendar-check text-3xl mb-2"></i>
                <p class="text-sm">Tidak ada kegiatan</p>
            </div>
        `;
    }
    
    return monthEvents.map(event => {
        const jenis = JENIS_KEGIATAN.find(j => j.id === event.jenisKegiatan);
        const tanggal = new Date(event.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        return `
            <div class="p-3 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                style="border-left-color: ${jenis?.warna || '#6B7280'}"
                onclick="editKalenderEvent('${event.id}')">
                <p class="font-medium text-gray-800 text-sm">${event.namaKegiatan}</p>
                <p class="text-xs text-gray-500 mt-1">${tanggal}</p>
            </div>
        `;
    }).join('');
}

// =====================================================
// JADWAL PAGE
// =====================================================
export function renderJadwalPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Jadwal Pelajaran</h1>
                    <p class="text-gray-500 mt-1">Kelola jadwal mengajar</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showAddJadwalModal()" class="btn-primary flex items-center gap-2">
                        <i class="fas fa-plus"></i><span>Tambah</span>
                    </button>
                    <button onclick="printJadwal()" class="btn-secondary">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="jadwalTahunAjaran" onchange="loadJadwal()" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Semester</label>
                        <select id="jadwalSemester" onchange="loadJadwal()" class="form-input">
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="jadwalKelas" onchange="filterJadwal()" class="form-input">
                            <option value="">Semua Kelas</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tampilan</label>
                        <select id="jadwalTampilan" onchange="changeJadwalView()" class="form-input">
                            <option value="kelas">Per Kelas</option>
                            <option value="guru">Per Guru</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="jadwalContent" class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="p-8 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-gray-500 mt-4">Memuat jadwal...</p>
                </div>
            </div>
        </div>
        
        <!-- Jadwal Modal -->
        <div id="jadwalModal" class="modal-overlay hidden">
            <div class="modal-content max-w-lg">
                <div class="modal-header">
                    <h3 id="jadwalModalTitle" class="text-lg font-semibold">Tambah Jadwal</h3>
                    <button onclick="closeJadwalModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="jadwalForm" onsubmit="saveJadwal(event)" class="modal-body space-y-4">
                    <input type="hidden" id="jadwalId">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Hari <span class="text-red-500">*</span></label>
                            <select id="jadwalHari" required class="form-input">
                                <option value="">Pilih</option>
                                ${HARI.map(h => `<option value="${h}">${h}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Jam Ke <span class="text-red-500">*</span></label>
                            <select id="jadwalJamKe" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                            <select id="jadwalKelasInput" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Rombel <span class="text-red-500">*</span></label>
                            <select id="jadwalRombelInput" required class="form-input">
                                <option value="">Pilih</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                        <select id="jadwalMapel" required class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Guru <span class="text-red-500">*</span></label>
                        <select id="jadwalGuru" required class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Durasi (JP)</label>
                            <input type="number" id="jadwalDurasi" value="1" min="1" max="4" class="form-input">
                        </div>
                        <div>
                            <label class="form-label">Ruangan</label>
                            <input type="text" id="jadwalRuangan" class="form-input">
                        </div>
                    </div>
                    <div id="modalConflictAlert" class="hidden bg-red-50 border border-red-200 rounded-lg p-3">
                        <p class="text-sm text-red-600" id="modalConflictMessage"></p>
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closeJadwalModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Schedule Grid Renderer
export function renderScheduleGrid(jadwalData, kelasData, jamPelajaran, viewType) {
    if (!jadwalData || jadwalData.length === 0) {
        return `
            <div class="p-8 text-center">
                <i class="fas fa-calendar-times text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada jadwal</p>
                <button onclick="showAddJadwalModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Tambah Jadwal
                </button>
            </div>
        `;
    }
    
    if (viewType === 'guru') {
        return renderJadwalByGuru(jadwalData);
    }
    
    return renderJadwalByKelas(jadwalData, jamPelajaran);
}

function renderJadwalByKelas(jadwalData, jamPelajaran) {
    const groupedByKelas = {};
    jadwalData.forEach(j => {
        const key = `${j.kelas}${j.rombel}`;
        if (!groupedByKelas[key]) groupedByKelas[key] = [];
        groupedByKelas[key].push(j);
    });
    
    let html = '<div class="divide-y">';
    
    Object.keys(groupedByKelas).sort().forEach(kelas => {
        const jadwalKelas = groupedByKelas[kelas];
        
        html += `
            <div class="p-4">
                <h4 class="font-semibold text-gray-800 mb-4">Kelas ${kelas}</h4>
                <div class="overflow-x-auto">
                    <div class="schedule-grid min-w-[800px]">
                        <div class="schedule-header">Jam</div>
                        ${HARI.map(h => `<div class="schedule-header">${h}</div>`).join('')}
                        
                        ${(jamPelajaran || []).map(jam => `
                            <div class="schedule-cell text-center font-medium text-gray-600">
                                <div>${jam.jam}</div>
                                <div class="text-xs text-gray-400">${jam.mulai}-${jam.selesai}</div>
                            </div>
                            ${HARI.map(hari => {
                                const slot = jadwalKelas.find(j => j.hari === hari && j.jamKe === jam.jam);
                                if (slot) {
                                    return `
                                        <div class="schedule-cell cursor-pointer hover:bg-gray-50" onclick="editJadwal('${slot.id}')"
                                            style="background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))">
                                            <div class="font-medium text-primary text-xs">${slot.mapelKode || slot.mapelNama?.substring(0, 8)}</div>
                                            <div class="text-xs text-gray-500 truncate">${slot.guruNama}</div>
                                        </div>
                                    `;
                                }
                                return `
                                    <div class="schedule-cell cursor-pointer hover:bg-gray-100" 
                                        onclick="quickAddJadwal('${hari}', ${jam.jam}, '${kelas.replace(/[A-Z]$/, '')}', '${kelas.slice(-1)}')">
                                        <span class="text-gray-300 text-xs">+</span>
                                    </div>
                                `;
                            }).join('')}
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function renderJadwalByGuru(jadwalData) {
    const groupedByGuru = {};
    jadwalData.forEach(j => {
        if (!groupedByGuru[j.guruNama]) groupedByGuru[j.guruNama] = [];
        groupedByGuru[j.guruNama].push(j);
    });
    
    let html = '<div class="divide-y">';
    
    Object.keys(groupedByGuru).sort().forEach(guru => {
        const jadwalGuru = groupedByGuru[guru];
        const totalJP = jadwalGuru.reduce((sum, j) => sum + (j.durasi || 1), 0);
        
        html += `
            <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-gray-800">
                        <i class="fas fa-user-tie text-primary mr-2"></i>${guru}
                    </h4>
                    <span class="badge badge-primary">${totalJP} JP/minggu</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Hari</th>
                                <th>Jam</th>
                                <th>Kelas</th>
                                <th>Mapel</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jadwalGuru.sort((a, b) => HARI.indexOf(a.hari) - HARI.indexOf(b.hari) || a.jamKe - b.jamKe)
                                .map(j => `
                                    <tr>
                                        <td>${j.hari}</td>
                                        <td>${j.jamKe}</td>
                                        <td>${j.kelas}${j.rombel}</td>
                                        <td>${j.mapelNama}</td>
                                        <td>
                                            <button onclick="editJadwal('${j.id}')" class="p-1 text-primary hover:bg-primary/10 rounded">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="deleteJadwal('${j.id}')" class="p-1 text-red-500 hover:bg-red-50 rounded">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

// =====================================================
// ATP, KKTP, PROTA, PROMES PAGES
// =====================================================
export function renderATPPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Alur Tujuan Pembelajaran (ATP)</h1>
                    <p class="text-gray-500 mt-1">Generate ATP dari Capaian Pembelajaran</p>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="atpMapel" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="atpKelas" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="atpTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="generateNewATP()" class="btn-primary w-full">
                            <i class="fas fa-magic mr-2"></i>Generate ATP
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="atpContent" class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-chart-line text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Pilih mapel dan kelas untuk generate ATP</p>
            </div>
        </div>
    `;
}

export function renderKKTPPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">KKTP</h1>
                    <p class="text-gray-500 mt-1">Kriteria Ketercapaian Tujuan Pembelajaran</p>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="kktpMapel" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="kktpKelas" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="kktpTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="generateNewKKTP()" class="btn-primary w-full">
                            <i class="fas fa-magic mr-2"></i>Generate
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="kktpContent" class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-check-circle text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Pilih mapel dan kelas untuk generate KKTP</p>
            </div>
        </div>
    `;
}

export function renderProtaPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Program Tahunan (Prota)</h1>
                    <p class="text-gray-500 mt-1">Generate Prota dari Tujuan Pembelajaran</p>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="protaMapel" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="protaKelas" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="protaTahunAjaran" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="generateNewProta()" class="btn-primary w-full">
                            <i class="fas fa-magic mr-2"></i>Generate
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="protaContent" class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-calendar-check text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Pilih mapel dan kelas untuk generate Prota</p>
            </div>
        </div>
    `;
}

export function renderPromesPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Program Semester (Promes)</h1>
                    <p class="text-gray-500 mt-1">Generate Promes dari Prota</p>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="promesMapel" class="form-input">
                            <option value="">Pilih</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="promesKelas" class="form-input">
                            <option value="">Pilih</option>
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
                    <div class="flex items-end">
                        <button onclick="generateNewPromes()" class="btn-primary w-full">
                            <i class="fas fa-magic mr-2"></i>Generate
                        </button>
                    </div>
                </div>
            </div>
            
            <div id="promesContent" class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-calendar-week text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Pilih opsi untuk generate Promes</p>
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
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Modul Ajar</h1>
                    <p class="text-gray-500 mt-1">Buat dan kelola modul ajar</p>
                </div>
                <button onclick="showAddModulModal()" class="btn-primary flex items-center gap-2">
                    <i class="fas fa-plus"></i><span>Buat Modul</span>
                </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="modulMapel" onchange="loadModulAjar()" class="form-input">
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="modulKelas" onchange="filterModulAjar()" class="form-input">
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cari</label>
                        <input type="text" id="modulSearch" onkeyup="filterModulAjar()" class="form-input" placeholder="Cari...">
                    </div>
                </div>
            </div>
            
            <div id="modulList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                </div>
            </div>
        </div>
        
        ${renderModulModal()}
    `;
}

function renderModulModal() {
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
                    
                    <div class="tabs mb-6">
                        <button type="button" class="tab-item active" onclick="switchModulTab('umum')">Umum</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('cp')">CP & TP</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('kegiatan')">Kegiatan</button>
                        <button type="button" class="tab-item" onclick="switchModulTab('asesmen')">Asesmen</button>
                    </div>
                    
                    <div id="tabUmum" class="tab-content space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                                <select id="modulMapelInput" required class="form-input">
                                    <option value="">Pilih</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                                <select id="modulKelasInput" required class="form-input">
                                    <option value="">Pilih</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="form-label">Fase <span class="text-red-500">*</span></label>
                                <select id="modulFase" required class="form-input">
                                    <option value="">Pilih</option>
                                    <option value="A">Fase A</option>
                                    <option value="B">Fase B</option>
                                    <option value="C">Fase C</option>
                                    <option value="D">Fase D</option>
                                    <option value="E">Fase E</option>
                                    <option value="F">Fase F</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Alokasi (JP)</label>
                                <input type="number" id="modulAlokasi" value="2" min="1" class="form-input">
                            </div>
                        </div>
                        <div>
                            <label class="form-label">Model Pembelajaran</label>
                            <select id="modulModel" class="form-input">
                                <option value="">Pilih</option>
                                <option value="Problem Based Learning">Problem Based Learning</option>
                                <option value="Project Based Learning">Project Based Learning</option>
                                <option value="Discovery Learning">Discovery Learning</option>
                                <option value="Cooperative Learning">Cooperative Learning</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Dimensi Profil Lulusan</label>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                ${DIMENSI_PROFIL_LULUSAN.map(d => `
                                    <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input type="checkbox" name="modulDimensi" value="${d.id}" class="rounded border-gray-300 text-primary">
                                        <span class="text-sm">${d.nama}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div id="tabCp" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Capaian Pembelajaran <span class="text-red-500">*</span></label>
                            <textarea id="modulCP" rows="4" required class="form-input" placeholder="CP..."></textarea>
                        </div>
                        <div>
                            <label class="form-label">Tujuan Pembelajaran</label>
                            <div id="modulTPContainer" class="space-y-2">
                                <div class="flex gap-2">
                                    <input type="text" class="modul-tp-input form-input flex-1" placeholder="TP 1">
                                    <button type="button" onclick="addModulTPInput()" class="btn-secondary"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="tabKegiatan" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Pendahuluan</label>
                            <div id="kegiatanPendahuluan" class="space-y-2">
                                <textarea class="kegiatan-input form-input" rows="1" placeholder="..."></textarea>
                            </div>
                            <button type="button" onclick="addKegiatanInput('Pendahuluan')" class="mt-2 text-sm text-primary">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                        <div>
                            <label class="form-label">Inti</label>
                            <div id="kegiatanInti" class="space-y-2">
                                <textarea class="kegiatan-input form-input" rows="1" placeholder="..."></textarea>
                            </div>
                            <button type="button" onclick="addKegiatanInput('Inti')" class="mt-2 text-sm text-primary">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                        <div>
                            <label class="form-label">Penutup</label>
                            <div id="kegiatanPenutup" class="space-y-2">
                                <textarea class="kegiatan-input form-input" rows="1" placeholder="..."></textarea>
                            </div>
                            <button type="button" onclick="addKegiatanInput('Penutup')" class="mt-2 text-sm text-primary">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                    </div>
                    
                    <div id="tabAsesmen" class="tab-content space-y-4 hidden">
                        <div>
                            <label class="form-label">Asesmen Diagnostik</label>
                            <textarea id="asesmenDiagnostik" rows="2" class="form-input"></textarea>
                        </div>
                        <div>
                            <label class="form-label">Asesmen Formatif</label>
                            <textarea id="asesmenFormatif" rows="2" class="form-input"></textarea>
                        </div>
                        <div>
                            <label class="form-label">Asesmen Sumatif</label>
                            <textarea id="asesmenSumatif" rows="2" class="form-input"></textarea>
                        </div>
                        <div>
                            <label class="form-label">Pengayaan</label>
                            <textarea id="modulPengayaan" rows="2" class="form-input"></textarea>
                        </div>
                        <div>
                            <label class="form-label">Remedial</label>
                            <textarea id="modulRemedial" rows="2" class="form-input"></textarea>
                        </div>
                        <div>
                            <label class="form-label">Refleksi Guru</label>
                            <textarea id="modulRefleksiGuru" rows="2" class="form-input"></textarea>
                        </div>
                        <div>
                            <label class="form-label">Refleksi Peserta Didik</label>
                            <textarea id="modulRefleksiSiswa" rows="2" class="form-input"></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-footer border-t pt-4 mt-6 sticky bottom-0 bg-white">
                        <button type="button" onclick="closeModulModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
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
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">LKPD</h1>
                    <p class="text-gray-500 mt-1">Lembar Kerja Peserta Didik</p>
                </div>
                <button onclick="showAddLKPDModal()" class="btn-primary flex items-center gap-2">
                    <i class="fas fa-plus"></i><span>Buat LKPD</span>
                </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="lkpdMapel" onchange="loadLKPD()" class="form-input">
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="lkpdKelas" onchange="filterLKPD()" class="form-input">
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cari</label>
                        <input type="text" id="lkpdSearch" onkeyup="filterLKPD()" class="form-input" placeholder="Cari...">
                    </div>
                </div>
            </div>
            
            <div id="lkpdList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                </div>
            </div>
        </div>
        
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
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                            <select id="lkpdMapelInput" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                            <select id="lkpdKelasInput" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Judul LKPD <span class="text-red-500">*</span></label>
                        <input type="text" id="lkpdJudul" required class="form-input" placeholder="Judul...">
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="form-label">Semester</label>
                            <select id="lkpdSemester" class="form-input">
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Alokasi (menit)</label>
                            <input type="number" id="lkpdAlokasi" value="40" min="10" class="form-input">
                        </div>
                        <div>
                            <label class="form-label">Jenis</label>
                            <select id="lkpdJenis" class="form-input">
                                <option value="individu">Individu</option>
                                <option value="kelompok">Kelompok</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Tujuan Pembelajaran</label>
                        <div id="lkpdTPContainer" class="space-y-2">
                            <div class="flex gap-2">
                                <input type="text" class="lkpd-tp-input form-input flex-1" placeholder="TP 1">
                                <button type="button" onclick="addLKPDTPInput()" class="btn-secondary"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Materi Singkat</label>
                        <textarea id="lkpdMateri" rows="3" class="form-input" placeholder="Materi..."></textarea>
                    </div>
                    
                    <div>
                        <label class="form-label">Kegiatan/Soal</label>
                        <div id="lkpdKegiatanContainer" class="space-y-4"></div>
                        <button type="button" onclick="addLKPDKegiatan()" class="mt-3 text-sm text-primary">
                            <i class="fas fa-plus mr-1"></i>Tambah Kegiatan
                        </button>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <input type="checkbox" id="lkpdShowKesimpulan" checked class="rounded border-gray-300 text-primary">
                        <label for="lkpdShowKesimpulan" class="text-sm">Tampilkan bagian kesimpulan</label>
                    </div>
                    
                    <div class="modal-footer border-t pt-4 sticky bottom-0 bg-white">
                        <button type="button" onclick="closeLKPDModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// =====================================================
// BANK SOAL PAGE
// =====================================================
export function renderBankSoalPage() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Bank Soal</h1>
                    <p class="text-gray-500 mt-1">Kelola koleksi soal</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showAddSoalModal()" class="btn-primary flex items-center gap-2">
                        <i class="fas fa-plus"></i><span>Tambah</span>
                    </button>
                    <button onclick="showGeneratePaketModal()" class="btn-secondary flex items-center gap-2">
                        <i class="fas fa-file-alt"></i><span class="hidden sm:inline">Paket</span>
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                ${LEVEL_KOGNITIF.slice(0, 4).map(level => `
                    <div class="bg-white rounded-xl shadow-sm p-4">
                        <p class="text-sm text-gray-500">${level.nama}</p>
                        <p class="text-2xl font-bold text-gray-800" id="stat${level.id}">0</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="bankSoalMapel" onchange="loadBankSoal()" class="form-input">
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Kelas</label>
                        <select id="bankSoalKelas" onchange="filterBankSoal()" class="form-input">
                            <option value="">Semua</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tipe</label>
                        <select id="bankSoalTipe" onchange="filterBankSoal()" class="form-input">
                            <option value="">Semua</option>
                            ${TIPE_SOAL.map(t => `<option value="${t.id}">${t.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Level</label>
                        <select id="bankSoalLevel" onchange="filterBankSoal()" class="form-input">
                            <option value="">Semua</option>
                            ${LEVEL_KOGNITIF.map(l => `<option value="${l.id}">${l.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cari</label>
                        <input type="text" id="bankSoalSearch" onkeyup="filterBankSoal()" class="form-input" placeholder="Cari...">
                    </div>
                </div>
            </div>
            
            <div id="bankSoalList" class="space-y-4">
                <div class="text-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                </div>
            </div>
        </div>
        
        ${renderSoalModal()}
        ${renderPaketModal()}
    `;
}

function renderSoalModal() {
    return `
        <div id="soalModal" class="modal-overlay hidden">
            <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
                <div class="modal-header sticky top-0 bg-white z-10">
                    <h3 id="soalModalTitle" class="text-lg font-semibold">Tambah Soal</h3>
                    <button onclick="closeSoalModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="soalForm" onsubmit="saveSoal(event)" class="modal-body space-y-4">
                    <input type="hidden" id="soalId">
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                            <select id="soalMapel" required class="form-input" onchange="loadElemenForSoal()">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                            <select id="soalKelas" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Elemen</label>
                            <select id="soalElemen" class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Tipe <span class="text-red-500">*</span></label>
                            <select id="soalTipe" required class="form-input" onchange="toggleSoalOptions()">
                                <option value="">Pilih</option>
                                ${TIPE_SOAL.map(t => `<option value="${t.id}">${t.nama}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Level <span class="text-red-500">*</span></label>
                            <select id="soalLevel" required class="form-input">
                                <option value="">Pilih</option>
                                ${LEVEL_KOGNITIF.map(l => `<option value="${l.id}">${l.nama}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Kesulitan</label>
                            <select id="soalKesulitan" class="form-input">
                                <option value="mudah">Mudah</option>
                                <option value="sedang" selected>Sedang</option>
                                <option value="sulit">Sulit</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Pertanyaan <span class="text-red-500">*</span></label>
                        <textarea id="soalPertanyaan" required rows="4" class="form-input" placeholder="Soal..."></textarea>
                    </div>
                    
                    <div id="opsiContainer" class="hidden">
                        <label class="form-label">Opsi Jawaban</label>
                        <div id="opsiList" class="space-y-2">
                            ${['A', 'B', 'C', 'D', 'E'].map(label => `
                                <div class="flex items-center gap-2">
                                    <input type="radio" name="opsiBenar" value="${label}" class="text-primary">
                                    <span class="font-medium w-6">${label}.</span>
                                    <input type="text" class="opsi-input form-input flex-1" placeholder="Opsi ${label}" data-label="${label}">
                                </div>
                            `).join('')}
                        </div>
                        <p class="text-sm text-gray-500 mt-2">Pilih radio untuk jawaban benar</p>
                    </div>
                    
                    <div id="kunciContainer">
                        <label class="form-label">Kunci Jawaban</label>
                        <textarea id="soalKunci" rows="2" class="form-input" placeholder="Kunci..."></textarea>
                    </div>
                    
                    <div>
                        <label class="form-label">Pembahasan</label>
                        <textarea id="soalPembahasan" rows="3" class="form-input" placeholder="Pembahasan..."></textarea>
                    </div>
                    
                    <div>
                        <label class="form-label">Skor</label>
                        <input type="number" id="soalSkor" value="1" min="1" class="form-input w-32">
                    </div>
                    
                    <div class="modal-footer border-t pt-4 sticky bottom-0 bg-white">
                        <button type="button" onclick="closeSoalModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderPaketModal() {
    return `
        <div id="paketModal" class="modal-overlay hidden">
            <div class="modal-content max-w-lg">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold">Generate Paket Soal</h3>
                    <button onclick="closePaketModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="paketForm" onsubmit="generatePaket(event)" class="modal-body space-y-4">
                    <div>
                        <label class="form-label">Nama Paket <span class="text-red-500">*</span></label>
                        <input type="text" id="paketNama" required class="form-input" placeholder="UTS Ganjil 2024">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Mapel <span class="text-red-500">*</span></label>
                            <select id="paketMapel" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                            <select id="paketKelas" required class="form-input">
                                <option value="">Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Jenis</label>
                            <select id="paketJenis" class="form-input">
                                <option value="UH">Ulangan Harian</option>
                                <option value="PTS">PTS</option>
                                <option value="PAS">PAS</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Waktu (menit)</label>
                            <input type="number" id="paketWaktu" value="60" min="10" class="form-input">
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Jumlah Soal</label>
                        <input type="number" id="paketJumlah" value="20" min="5" max="100" class="form-input w-32">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="paketIncludeKey" checked class="rounded border-gray-300 text-primary">
                        <label for="paketIncludeKey" class="text-sm">Sertakan kunci jawaban</label>
                    </div>
                    <div class="modal-footer border-t pt-4">
                        <button type="button" onclick="closePaketModal()" class="btn-secondary">Batal</button>
                        <button type="submit" class="btn-primary">Generate</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// =====================================================
// CARD RENDERERS
// =====================================================
export function renderMapelCard(mapel) {
    return `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span class="text-white font-bold">${mapel.kode?.substring(0, 2) || 'MP'}</span>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${mapel.nama}</h4>
                        <p class="text-sm text-gray-500">Kode: ${mapel.kode || '-'}</p>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="editMapel('${mapel.id}')" class="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteMapelConfirm('${mapel.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${mapel.elemen && mapel.elemen.length > 0 ? `
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <p class="text-sm text-gray-500 mb-2">Elemen:</p>
                    <div class="flex flex-wrap gap-2">
                        ${mapel.elemen.map(el => `<span class="badge badge-primary">${el}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

export function renderKelasCard(kelas) {
    return `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <span class="text-white font-bold text-xl">${kelas.tingkat}${kelas.rombel}</span>
                </div>
                <div class="flex gap-1">
                    <button onclick="editKelas('${kelas.id}')" class="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteKelasConfirm('${kelas.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-500">Wali Kelas</span>
                    <span class="text-gray-800">${kelas.waliKelas || '-'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">Jumlah Siswa</span>
                    <span class="text-gray-800">${kelas.jumlahSiswa || 0}</span>
                </div>
            </div>
        </div>
    `;
}

export function renderModulCard(modul) {
    return `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
            <div class="h-2 bg-gradient-to-r from-primary to-secondary"></div>
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <span class="badge badge-primary">${modul.informasiUmum?.kelas || '-'}</span>
                    <div class="flex gap-1">
                        <button onclick="editModul('${modul.id}')" class="p-1 text-gray-400 hover:text-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteModulConfirm('${modul.id}')" class="p-1 text-gray-400 hover:text-red-500">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h4 class="font-semibold text-gray-800 mb-2">${modul.mapelNama}</h4>
                <p class="text-sm text-gray-500 line-clamp-2 mb-4">${modul.tujuanPembelajaran?.[0] || '-'}</p>
                <div class="flex gap-2 pt-4 border-t border-gray-100">
                    <button onclick="exportModulWord('${modul.id}')" class="flex-1 btn-secondary text-sm py-2">
                        <i class="fas fa-file-word mr-1"></i>Word
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function renderLKPDCard(lkpd) {
    return `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden card-hover">
            <div class="h-2 bg-gradient-to-r from-pink-500 to-rose-600"></div>
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex gap-2">
                        <span class="badge badge-primary">${lkpd.kelas}</span>
                        <span class="badge ${lkpd.jenisLKPD === 'kelompok' ? 'badge-success' : 'badge-warning'}">${lkpd.jenisLKPD}</span>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="editLKPD('${lkpd.id}')" class="p-1 text-gray-400 hover:text-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteLKPDConfirm('${lkpd.id}')" class="p-1 text-gray-400 hover:text-red-500">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <h4 class="font-semibold text-gray-800 mb-2">${lkpd.judul}</h4>
                <p class="text-sm text-gray-500 mb-4">${lkpd.mapelNama}</p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                    <span><i class="fas fa-clock mr-1"></i>${lkpd.alokasi} menit</span>
                    <span><i class="fas fa-tasks mr-1"></i>${lkpd.kegiatan?.length || 0} soal</span>
                </div>
                <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onclick="exportLKPDWord('${lkpd.id}')" class="flex-1 btn-secondary text-sm py-2">
                        <i class="fas fa-file-word mr-1"></i>Word
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function renderSoalCard(soal, index) {
    const levelBadge = LEVEL_KOGNITIF.find(l => l.id === soal.levelKognitif);
    const tipeBadge = TIPE_SOAL.find(t => t.id === soal.tipeSoal);
    
    return `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                    ${index + 1}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="badge badge-primary">${soal.kelas}</span>
                        <span class="badge" style="background-color: ${getLevelColor(soal.levelKognitif)}20; color: ${getLevelColor(soal.levelKognitif)}">${levelBadge?.id || '-'}</span>
                        <span class="badge badge-secondary">${tipeBadge?.nama || '-'}</span>
                    </div>
                    <p class="text-gray-800 mb-3">${soal.pertanyaan}</p>
                    ${soal.tipeSoal === 'pilgan' && soal.opsi ? `
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            ${soal.opsi.map(o => `
                                <div class="flex items-center gap-2 p-2 rounded-lg ${o.benar ? 'bg-green-50 text-green-700' : 'bg-gray-50'}">
                                    <span class="font-medium">${o.label}.</span>
                                    <span>${o.teks}</span>
                                    ${o.benar ? '<i class="fas fa-check text-green-500 ml-auto"></i>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span class="text-sm text-gray-500">
                            <i class="fas fa-layer-group mr-1"></i>${soal.elemen || 'Umum'}
                        </span>
                        <div class="flex gap-1">
                            <button onclick="editSoal('${soal.id}')" class="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteSoalConfirm('${soal.id}')" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
