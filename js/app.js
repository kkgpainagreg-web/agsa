// Page Templates
export const DIMENSI_PROFIL = [
    { id: 'keimanan', nama: 'Keimanan dan Ketakwaan', warna: '#8B5CF6', icon: 'fa-pray' },
    { id: 'kewargaan', nama: 'Kewargaan', warna: '#EF4444', icon: 'fa-flag' },
    { id: 'penalaran', nama: 'Penalaran Kritis', warna: '#3B82F6', icon: 'fa-brain' },
    { id: 'kreativitas', nama: 'Kreativitas', warna: '#F59E0B', icon: 'fa-lightbulb' },
    { id: 'kolaborasi', nama: 'Kolaborasi', warna: '#10B981', icon: 'fa-users' },
    { id: 'kemandirian', nama: 'Kemandirian', warna: '#6366F1', icon: 'fa-user-check' },
    { id: 'kesehatan', nama: 'Kesehatan', warna: '#EC4899', icon: 'fa-heart' },
    { id: 'komunikasi', nama: 'Komunikasi', warna: '#14B8A6', icon: 'fa-comments' }
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi,';
    if (h < 15) return 'Selamat Siang,';
    if (h < 18) return 'Selamat Sore,';
    return 'Selamat Malam,';
}

export function renderDashboard(userData, schoolData, stats) {
    return `
        <div class="animate-fadeIn">
            <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 lg:p-8 text-white mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p class="text-white/80 mb-1">${getGreeting()}</p>
                        <h1 class="text-2xl lg:text-3xl font-bold">${userData?.namaGuru || 'Guru'}</h1>
                        <p class="text-white/80 mt-2"><i class="fas fa-school mr-2"></i>${schoolData?.namaSekolah || '-'}</p>
                    </div>
                    <div class="mt-4 lg:mt-0">
                        <p class="text-white/80 text-sm">Tahun Pelajaran</p>
                        <p class="text-xl font-bold">2024/2025</p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Mata Pelajaran</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.mapel || 0}</p>
                        </div>
                        <div class="stats-icon bg-blue-100 text-blue-600"><i class="fas fa-book"></i></div>
                    </div>
                </div>
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Capaian Pembelajaran</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.cp || 0}</p>
                        </div>
                        <div class="stats-icon bg-green-100 text-green-600"><i class="fas fa-bullseye"></i></div>
                    </div>
                </div>
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Modul Ajar</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.modul || 0}</p>
                        </div>
                        <div class="stats-icon bg-purple-100 text-purple-600"><i class="fas fa-file-alt"></i></div>
                    </div>
                </div>
                <div class="stats-card card-hover">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Bank Soal</p>
                            <p class="text-2xl font-bold text-gray-800">${stats?.soal || 0}</p>
                        </div>
                        <div class="stats-icon bg-orange-100 text-orange-600"><i class="fas fa-question-circle"></i></div>
                    </div>
                </div>
            </div>
            
            <div class="grid lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-bolt text-yellow-500 mr-2"></i>Aksi Cepat</h3>
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
                    
                    <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-star text-yellow-500 mr-2"></i>8 Dimensi Profil Lulusan</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            ${DIMENSI_PROFIL.map(d => `
                                <div class="dimension-card" style="border-left-color: ${d.warna}">
                                    <div class="flex items-center gap-2 mb-1">
                                        <i class="fas ${d.icon}" style="color: ${d.warna}"></i>
                                        <span class="font-medium text-xs text-gray-800">${d.nama}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-history text-gray-400 mr-2"></i>Aktivitas</h3>
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-inbox text-3xl mb-2"></i>
                        <p class="text-sm">Belum ada aktivitas</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderProfil(userData, schoolData) {
    return `
        <div class="animate-fadeIn max-w-4xl mx-auto">
            <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-6">
                <div class="flex flex-col sm:flex-row items-center gap-6">
                    <img src="${userData?.photoURL || 'https://ui-avatars.com/api/?name=G'}" class="w-24 h-24 rounded-full border-4 border-white/30">
                    <div class="text-center sm:text-left">
                        <h1 class="text-2xl font-bold">${userData?.namaGuru || '-'}</h1>
                        <p class="text-white/80">${userData?.email || '-'}</p>
                        <p class="text-white/80 mt-1"><i class="fas fa-id-card mr-2"></i>NIP: ${userData?.nip || '-'}</p>
                    </div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-user text-primary mr-2"></i>Data Guru</h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between py-2 border-b"><span class="text-gray-500">Nama</span><span class="text-gray-800">${userData?.namaGuru || '-'}</span></div>
                        <div class="flex justify-between py-2 border-b"><span class="text-gray-500">NIP</span><span class="text-gray-800">${userData?.nip || '-'}</span></div>
                        <div class="flex justify-between py-2 border-b"><span class="text-gray-500">Email</span><span class="text-gray-800">${userData?.email || '-'}</span></div>
                        <div class="flex justify-between py-2"><span class="text-gray-500">Jenjang</span><span class="text-gray-800">${userData?.jenjang || '-'}</span></div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-school text-primary mr-2"></i>Data Sekolah</h3>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between py-2 border-b"><span class="text-gray-500">NPSN</span><span class="text-gray-800">${userData?.npsn || '-'}</span></div>
                        <div class="flex justify-between py-2 border-b"><span class="text-gray-500">Nama Sekolah</span><span class="text-gray-800">${schoolData?.namaSekolah || '-'}</span></div>
                        <div class="flex justify-between py-2 border-b"><span class="text-gray-500">Kepala Sekolah</span><span class="text-gray-800">${schoolData?.kepalaSekolah || '-'}</span></div>
                        <div class="flex justify-between py-2"><span class="text-gray-500">NIP Kepsek</span><span class="text-gray-800">${schoolData?.nipKepsek || '-'}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderMapel() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
                    <p class="text-gray-500">Kelola mata pelajaran yang diampu</p>
                </div>
                <button onclick="showAddMapelModal()" class="btn-primary"><i class="fas fa-plus mr-2"></i>Tambah</button>
            </div>
            <div id="mapelList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-book-open text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Belum ada mata pelajaran</p>
                </div>
            </div>
        </div>
    `;
}

export function renderCP() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Capaian Pembelajaran</h1>
                    <p class="text-gray-500">Input CP berdasarkan elemen</p>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label class="form-label">Mata Pelajaran</label>
                        <select id="filterMapel" class="form-input"><option value="">Pilih Mapel</option></select>
                    </div>
                    <div>
                        <label class="form-label">Fase</label>
                        <select id="filterFase" class="form-input">
                            <option value="">Semua Fase</option>
                            <option value="A">Fase A</option>
                            <option value="B">Fase B</option>
                            <option value="C">Fase C</option>
                            <option value="D">Fase D</option>
                            <option value="E">Fase E</option>
                            <option value="F">Fase F</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button class="btn-primary w-full"><i class="fas fa-plus mr-2"></i>Tambah CP</button>
                    </div>
                </div>
            </div>
            <div id="cpContent" class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-book-open text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Pilih mata pelajaran</p>
            </div>
        </div>
    `;
}

export function renderKelas() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Kelas & Rombel</h1>
                    <p class="text-gray-500">Kelola data kelas</p>
                </div>
                <button class="btn-primary"><i class="fas fa-plus mr-2"></i>Tambah</button>
            </div>
            <div id="kelasList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-users text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Belum ada kelas</p>
                </div>
            </div>
        </div>
    `;
}

export function renderKalender() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Kalender Pendidikan</h1>
                    <p class="text-gray-500">Kelola kegiatan sekolah</p>
                </div>
                <button class="btn-primary"><i class="fas fa-plus mr-2"></i>Tambah</button>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
                <p class="text-center text-gray-500 py-12">Kalender akan ditampilkan di sini</p>
            </div>
        </div>
    `;
}

export function renderJadwal() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Jadwal Pelajaran</h1>
                    <p class="text-gray-500">Kelola jadwal mengajar</p>
                </div>
                <button class="btn-primary"><i class="fas fa-plus mr-2"></i>Tambah</button>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
                <p class="text-center text-gray-500 py-12">Jadwal akan ditampilkan di sini</p>
            </div>
        </div>
    `;
}

export function renderATP() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">ATP</h1>
                    <p class="text-gray-500">Alur Tujuan Pembelajaran</p>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div><label class="form-label">Mapel</label><select class="form-input"><option>Pilih</option></select></div>
                    <div><label class="form-label">Kelas</label><select class="form-input"><option>Pilih</option></select></div>
                    <div><label class="form-label">Tahun</label><select class="form-input"><option>2024/2025</option></select></div>
                    <div class="flex items-end"><button class="btn-primary w-full"><i class="fas fa-magic mr-2"></i>Generate</button></div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-8 text-center">
                <i class="fas fa-chart-line text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500">Generate ATP dari CP</p>
            </div>
        </div>
    `;
}

export function renderModul() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Modul Ajar</h1>
                    <p class="text-gray-500">Buat dan kelola modul ajar</p>
                </div>
                <button class="btn-primary"><i class="fas fa-plus mr-2"></i>Buat Modul</button>
            </div>
            <div id="modulList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-file-alt text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Belum ada modul</p>
                </div>
            </div>
        </div>
    `;
}

export function renderLKPD() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">LKPD</h1>
                    <p class="text-gray-500">Lembar Kerja Peserta Didik</p>
                </div>
                <button class="btn-primary"><i class="fas fa-plus mr-2"></i>Buat LKPD</button>
            </div>
            <div id="lkpdList" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-clipboard-list text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Belum ada LKPD</p>
                </div>
            </div>
        </div>
    `;
}

export function renderBankSoal() {
    return `
        <div class="animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Bank Soal</h1>
                    <p class="text-gray-500">Kelola koleksi soal</p>
                </div>
                <button class="btn-primary"><i class="fas fa-plus mr-2"></i>Tambah Soal</button>
            </div>
            <div id="soalList" class="space-y-4">
                <div class="text-center py-12">
                    <i class="fas fa-question-circle text-gray-300 text-5xl mb-4"></i>
                    <p class="text-gray-500">Belum ada soal</p>
                </div>
            </div>
        </div>
    `;
}

export function renderComingSoon(title) {
    return `
        <div class="animate-fadeIn text-center py-20">
            <i class="fas fa-tools text-gray-300 text-6xl mb-4"></i>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">${title}</h2>
            <p class="text-gray-500">Fitur ini sedang dalam pengembangan</p>
        </div>
    `;
}
