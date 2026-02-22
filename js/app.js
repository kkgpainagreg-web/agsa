// Main Application Logic

// Global State
let currentUser = null;
let currentUserData = null;
let currentModule = 'dashboard';
let currentSubscription = 'free';
let whatsAppUpgrade = '6281234567890';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check authentication
    requireAuth(async (user) => {
        currentUser = user;
        
        // Load user data
        await loadUserData();
        
        // Setup academic year selector
        setupAcademicYearSelector();
        
        // Setup semester selector
        setupSemesterSelector();
        
        // Load default module
        loadModule('dashboard');
        
        // Update UI based on subscription
        updateSubscriptionUI();
    });
}

// Load User Data
async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (userDoc.exists) {
            currentUserData = userDoc.data();
            
            // Update header
            document.getElementById('userName').textContent = currentUserData.displayName || currentUser.email;
            
            // Check subscription
            currentSubscription = await checkSubscription(currentUser.uid);
            
            // Update subscription badge
            const badge = document.getElementById('userSubscription');
            if (currentSubscription === 'premium') {
                badge.innerHTML = `
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-500 text-white">
                        <i class="fas fa-crown mr-1"></i>Premium
                    </span>
                `;
            }
            
            // Get WhatsApp for upgrade
            const adminDoc = await db.collection('settings').doc('admin').get();
            if (adminDoc.exists) {
                whatsAppUpgrade = adminDoc.data().whatsAppUpgrade || whatsAppUpgrade;
            }
            
            // Update avatar if available
            if (currentUserData.photoURL) {
                document.getElementById('userAvatar').innerHTML = `
                    <img src="${currentUserData.photoURL}" alt="Avatar" class="w-full h-full rounded-full object-cover">
                `;
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Setup Academic Year Selector
function setupAcademicYearSelector() {
    const select = document.getElementById('academicYearSelect');
    const years = getAcademicYears();
    
    select.innerHTML = years.map(year => `
        <option value="${year}">${year}</option>
    `).join('');
    
    // Load saved preference
    const savedYear = localStorage.getItem('selectedAcademicYear');
    if (savedYear && years.includes(savedYear)) {
        select.value = savedYear;
    }
    
    select.addEventListener('change', (e) => {
        localStorage.setItem('selectedAcademicYear', e.target.value);
        // Reload current module
        loadModule(currentModule);
    });
}

// Setup Semester Selector
function setupSemesterSelector() {
    const select = document.getElementById('semesterSelect');
    
    // Set current semester
    select.value = getCurrentSemester();
    
    // Load saved preference
    const savedSemester = localStorage.getItem('selectedSemester');
    if (savedSemester) {
        select.value = savedSemester;
    }
    
    select.addEventListener('change', (e) => {
        localStorage.setItem('selectedSemester', e.target.value);
        // Reload current module
        loadModule(currentModule);
    });
}

// ============================================
// HELPER FUNCTIONS (di bagian atas app.js)
// ============================================

/**
 * Get selected academic year in document ID format (2025-2026)
 * @returns {string}
 */
function getSelectedAcademicYear() {
    const select = document.getElementById('academicYearSelect');
    if (!select) return getAcademicYears()[0];
    return select.value; // Already in "2025-2026" format
}

/**
 * Get selected academic year for display (2025/2026)
 * @returns {string}
 */
function getSelectedAcademicYearDisplay() {
    return formatAcademicYearDisplay(getSelectedAcademicYear());
}

/**
 * Get selected semester
 * @returns {string}
 */
function getSelectedSemester() {
    const select = document.getElementById('semesterSelect');
    if (!select) return getCurrentSemester();
    return select.value;
}

/**
 * Setup Academic Year Selector
 */
function setupAcademicYearSelector() {
    const select = document.getElementById('academicYearSelect');
    if (!select) return;
    
    const years = getAcademicYears();
    
    select.innerHTML = years.map(year => `
        <option value="${year}">${formatAcademicYearDisplay(year)}</option>
    `).join('');
    
    // Load saved preference
    const savedYear = localStorage.getItem('selectedAcademicYear');
    if (savedYear && years.includes(savedYear)) {
        select.value = savedYear;
    }
    
    select.addEventListener('change', (e) => {
        localStorage.setItem('selectedAcademicYear', e.target.value);
        loadModule(currentModule);
    });
}

/**
 * Setup Semester Selector
 */
function setupSemesterSelector() {
    const select = document.getElementById('semesterSelect');
    if (!select) return;
    
    // Set current semester as default
    const currentSem = getCurrentSemester();
    
    // Load saved preference
    const savedSemester = localStorage.getItem('selectedSemester');
    select.value = savedSemester || currentSem;
    
    select.addEventListener('change', (e) => {
        localStorage.setItem('selectedSemester', e.target.value);
        loadModule(currentModule);
    });
}

/**
 * Get all holidays as array of date strings
 * @param {Object} calendarData
 * @returns {Array<string>}
 */
function getAllHolidayDates(calendarData) {
    if (!calendarData) return [];
    
    const holidays = [];
    const tahunAjar = getSelectedAcademicYear();
    const startYear = getStartYear(tahunAjar);
    const endYear = getEndYear(tahunAjar);
    
    // Fixed holidays for both years
    HARI_LIBUR_BAKU.forEach(h => {
        holidays.push(`${startYear}-${h.tanggal}`);
        holidays.push(`${endYear}-${h.tanggal}`);
    });
    
    // Variable holidays
    if (calendarData.variableHolidays) {
        calendarData.variableHolidays.forEach(h => {
            if (h.tanggal) holidays.push(h.tanggal);
        });
    }
    
    return holidays;
}
// Get Selected Semester
function getSelectedSemester() {
    return document.getElementById('semesterSelect').value;
}

// Update Subscription UI
function updateSubscriptionUI() {
    const premiumFeatures = document.querySelectorAll('.premium-feature');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    if (currentSubscription === 'premium') {
        // Hide premium badges
        premiumFeatures.forEach(el => {
            const badge = el.querySelector('.premium-badge');
            if (badge) badge.classList.add('hidden');
        });
        // Hide upgrade button
        upgradeBtn.classList.add('hidden');
    } else {
        upgradeBtn.classList.remove('hidden');
    }
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// Load Module
function loadModule(moduleName) {
    // Check premium access
    if (!canAccessFeature(moduleName, currentSubscription)) {
        showUpgradeModal();
        return;
    }
    
    // Update active menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === moduleName) {
            item.classList.add('active');
        }
    });
    
    // Update breadcrumb
    const moduleNames = {
        'dashboard': 'Dashboard',
        'profile': 'Profil',
        'calendar': 'Kalender Pendidikan',
        'schedule': 'Jadwal Pelajaran',
        'curriculum': 'CP & TP',
        'atp': 'ATP',
        'prota': 'Prota',
        'promes': 'Promes',
        'modul-ajar': 'Modul Ajar',
        'lkpd': 'LKPD',
        'bank-soal': 'Bank Soal',
        'journal': 'Jurnal',
        'attendance': 'Absensi',
        'grades': 'Daftar Nilai',
        'kktp': 'KKTP',
        'ai-assistant': 'AI Assistant',
        'students': 'Data Siswa'
    };
    
    document.getElementById('currentModuleName').textContent = moduleNames[moduleName] || moduleName;
    currentModule = moduleName;
    
    // Close mobile sidebar
    if (window.innerWidth < 1024) {
        toggleSidebar();
    }
    
    // Load module content
    const contentArea = document.getElementById('contentArea');
    
    switch (moduleName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'profile':
            renderProfile();
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'schedule':
            renderSchedule();
            break;
        case 'curriculum':
            renderCurriculum();
            break;
        case 'atp':
            renderATP();
            break;
        case 'prota':
            renderProta();
            break;
        case 'promes':
            renderPromes();
            break;
        case 'modul-ajar':
            renderModulAjar();
            break;
        case 'lkpd':
            renderLKPD();
            break;
        case 'bank-soal':
            renderBankSoal();
            break;
        case 'journal':
            renderJournal();
            break;
        case 'attendance':
            renderAttendance();
            break;
        case 'grades':
            renderGrades();
            break;
        case 'kktp':
            renderKKTP();
            break;
        case 'ai-assistant':
            renderAIAssistant();
            break;
        case 'students':
            renderStudents();
            break;
        default:
            contentArea.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-hard-hat text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Modul dalam pengembangan</h3>
                    <p class="text-gray-500 mt-2">Fitur ini akan segera tersedia</p>
                </div>
            `;
    }
}

// Show Upgrade Modal
function showUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    const waLink = document.getElementById('upgradeWhatsAppLink');
    
    waLink.href = `https://wa.me/${whatsAppUpgrade}?text=Halo, saya ingin upgrade ADMIN GURU SUPER APP ke versi Premium.`;
    
    modal.classList.remove('hidden');
}

// Close Upgrade Modal
function closeUpgradeModal() {
    document.getElementById('upgradeModal').classList.add('hidden');
}

// =====================================================
// DASHBOARD MODULE
// =====================================================
function renderDashboard() {
    const contentArea = document.getElementById('contentArea');
    const tahunAjar = getSelectedAcademicYear();
    const semester = getSelectedSemester();
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Welcome Card -->
            <div class="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 text-white">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">Selamat Datang, ${currentUserData?.displayName || 'Guru'}!</h2>
                        <p class="text-blue-100">Tahun Ajaran ${tahunAjar} - Semester ${semester}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="bg-white/20 rounded-xl px-4 py-2 backdrop-blur">
                            <p class="text-sm text-blue-100">Tanggal</p>
                            <p class="font-semibold">${formatDateID(new Date(), 'full')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-xl p-4 shadow-sm card-hover transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <i class="fas fa-book text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-800" id="statMapel">0</p>
                            <p class="text-sm text-gray-500">Mata Pelajaran</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm card-hover transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <i class="fas fa-users text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-800" id="statKelas">0</p>
                            <p class="text-sm text-gray-500">Kelas Diampu</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm card-hover transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <i class="fas fa-clock text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-800" id="statJam">0</p>
                            <p class="text-sm text-gray-500">Jam/Minggu</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl p-4 shadow-sm card-hover transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <i class="fas fa-calendar-check text-orange-600 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-gray-800" id="statPertemuan">0</p>
                            <p class="text-sm text-gray-500">Pertemuan</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-bolt text-yellow-500 mr-2"></i>Aksi Cepat
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onclick="loadModule('profile')" class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <i class="fas fa-user-cog text-2xl text-gray-400"></i>
                        <span class="text-sm text-gray-600">Lengkapi Profil</span>
                    </button>
                    <button onclick="loadModule('calendar')" class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <i class="fas fa-calendar-alt text-2xl text-gray-400"></i>
                        <span class="text-sm text-gray-600">Atur Kalender</span>
                    </button>
                    <button onclick="loadModule('schedule')" class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <i class="fas fa-clock text-2xl text-gray-400"></i>
                        <span class="text-sm text-gray-600">Atur Jadwal</span>
                    </button>
                    <button onclick="loadModule('curriculum')" class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all">
                        <i class="fas fa-book text-2xl text-gray-400"></i>
                        <span class="text-sm text-gray-600">Input CP/TP</span>
                    </button>
                </div>
            </div>

            <!-- Workflow Guide -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-route text-primary mr-2"></i>Alur Kerja Single Input - Multi Output
                </h3>
                <div class="flex flex-wrap items-center justify-center gap-4">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <span class="text-sm">Profil</span>
                    </div>
                    <i class="fas fa-arrow-right text-gray-300"></i>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <span class="text-sm">Kalender</span>
                    </div>
                    <i class="fas fa-arrow-right text-gray-300"></i>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <span class="text-sm">Jadwal</span>
                    </div>
                    <i class="fas fa-arrow-right text-gray-300"></i>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <span class="text-sm">CP/TP</span>
                    </div>
                    <i class="fas fa-arrow-right text-gray-300"></i>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            <i class="fas fa-check"></i>
                        </div>
                        <span class="text-sm font-medium text-green-600">Dokumen Otomatis</span>
                    </div>
                </div>
                <p class="text-center text-gray-500 text-sm mt-4">
                    ATP, Prota, Promes, Modul Ajar, Jurnal, dan dokumen lainnya akan tergenerate otomatis
                </p>
            </div>

            <!-- Profile Completion -->
            <div id="profileCompletionCard" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 ${currentUserData?.profileCompleted ? 'hidden' : ''}">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-semibold text-yellow-800">Profil Belum Lengkap</h4>
                        <p class="text-yellow-700 text-sm mt-1">
                            Silakan lengkapi profil Anda terlebih dahulu untuk menggunakan semua fitur aplikasi.
                        </p>
                        <button onclick="loadModule('profile')" class="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-user-edit mr-2"></i>Lengkapi Profil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load statistics
    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        // Get mata pelajaran count
        const mapelCount = currentUserData?.mataPelajaran?.length || 0;
        document.getElementById('statMapel').textContent = mapelCount;
        
        // Get schedule data for other stats
        const scheduleDoc = await db.collection('users').doc(currentUser.uid)
            .collection('schedules').doc(getSelectedAcademicYear()).get();
        
        if (scheduleDoc.exists) {
            const data = scheduleDoc.data();
            const entries = data.entries || [];
            
            // Count unique classes
            const uniqueClasses = new Set(entries.map(e => `${e.kelas}-${e.rombel}`));
            document.getElementById('statKelas').textContent = uniqueClasses.size;
            
            // Count total jam per minggu
            let totalJam = 0;
            entries.forEach(e => {
                totalJam += parseInt(e.jamPelajaran) || 1;
            });
            document.getElementById('statJam').textContent = totalJam;
        }
        
        // Calculate pertemuan based on calendar
        // This would need calendar data to calculate accurately
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// =====================================================
// PROFILE MODULE
// =====================================================
function renderProfile() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Profile Header -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="bg-gradient-to-r from-primary to-accent h-32"></div>
                <div class="px-6 pb-6">
                    <div class="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
                        <div class="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                            ${currentUserData?.photoURL 
                                ? `<img src="${currentUserData.photoURL}" alt="Avatar" class="w-full h-full rounded-xl object-cover">`
                                : `<i class="fas fa-user text-4xl text-gray-400"></i>`
                            }
                        </div>
                        <div class="flex-1">
                            <h2 class="text-2xl font-bold text-gray-800">${currentUserData?.displayName || 'Nama Guru'}</h2>
                            <p class="text-gray-500">${currentUser.email}</p>
                        </div>
                        <div>
                            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${currentSubscription === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">
                                <i class="fas fa-crown mr-2"></i>${currentSubscription === 'premium' ? 'Premium' : 'Free'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Tabs -->
            <div class="bg-white rounded-xl shadow-sm">
                <div class="border-b">
                    <nav class="flex overflow-x-auto">
                        <button onclick="switchProfileTab('personal')" class="profile-tab px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary" data-tab="personal">
                            <i class="fas fa-user mr-2"></i>Data Pribadi
                        </button>
                        <button onclick="switchProfileTab('school')" class="profile-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="school">
                            <i class="fas fa-school mr-2"></i>Satuan Pendidikan
                        </button>
                        <button onclick="switchProfileTab('subjects')" class="profile-tab px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="subjects">
                            <i class="fas fa-book mr-2"></i>Mata Pelajaran
                        </button>
                    </nav>
                </div>

                <!-- Personal Data Tab -->
                <div id="personalTab" class="p-6">
                    <form onsubmit="savePersonalProfile(event)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                                <input type="text" id="profileName" required value="${currentUserData?.displayName || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                                <input type="text" id="profileNIP" value="${currentUserData?.nip || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">NUPTK</label>
                                <input type="text" id="profileNUPTK" value="${currentUserData?.nuptk || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                                <select id="profileGender" class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="">Pilih...</option>
                                    <option value="L" ${currentUserData?.jenisKelamin === 'L' ? 'selected' : ''}>Laki-laki</option>
                                    <option value="P" ${currentUserData?.jenisKelamin === 'P' ? 'selected' : ''}>Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
                                <input type="text" id="profileBirthPlace" value="${currentUserData?.tempatLahir || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                                <input type="date" id="profileBirthDate" value="${currentUserData?.tanggalLahir || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">No. HP/WhatsApp</label>
                                <input type="tel" id="profilePhone" value="${currentUserData?.noHP || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                                <textarea id="profileAddress" rows="2" class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none">${currentUserData?.alamat || ''}</textarea>
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button type="submit" class="px-6 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-all">
                                <i class="fas fa-save mr-2"></i>Simpan Data Pribadi
                            </button>
                        </div>
                    </form>
                </div>

                <!-- School Data Tab -->
                <div id="schoolTab" class="p-6 hidden">
                    <form onsubmit="saveSchoolProfile(event)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Sekolah *</label>
                                <input type="text" id="schoolName" required value="${currentUserData?.namaSekolah || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">NPSN</label>
                                <input type="text" id="schoolNPSN" value="${currentUserData?.npsn || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Jenjang *</label>
                                <select id="schoolLevel" required class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="">Pilih Jenjang...</option>
                                    <option value="SD" ${currentUserData?.jenjang === 'SD' ? 'selected' : ''}>SD/MI</option>
                                    <option value="SMP" ${currentUserData?.jenjang === 'SMP' ? 'selected' : ''}>SMP/MTs</option>
                                    <option value="SMA" ${currentUserData?.jenjang === 'SMA' ? 'selected' : ''}>SMA/MA/SMK</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten *</label>
                                <input type="text" id="schoolCity" required value="${currentUserData?.kotaKabupaten || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Untuk label tanda tangan">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                                <input type="text" id="schoolProvince" value="${currentUserData?.provinsi || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Alamat Sekolah</label>
                                <textarea id="schoolAddress" rows="2" class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none">${currentUserData?.alamatSekolah || ''}</textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Kepala Sekolah</label>
                                <input type="text" id="principalName" value="${currentUserData?.namaKepalaSekolah || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">NIP Kepala Sekolah</label>
                                <input type="text" id="principalNIP" value="${currentUserData?.nipKepalaSekolah || ''}"
                                    class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            </div>
                        </div>
                        <div class="mt-6 flex justify-end">
                            <button type="submit" class="px-6 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-all">
                                <i class="fas fa-save mr-2"></i>Simpan Data Sekolah
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Subjects Tab -->
                <div id="subjectsTab" class="p-6 hidden">
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="font-semibold text-gray-800">Mata Pelajaran yang Diampu</h4>
                            <button onclick="addSubject()" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-plus mr-2"></i>Tambah Mapel
                            </button>
                        </div>
                        <p class="text-sm text-gray-500 mb-4">
                            Tentukan mata pelajaran dan jumlah jam pelajaran per pertemuan dalam seminggu
                        </p>
                    </div>

                    <!-- Subjects List -->
                    <div id="subjectsList" class="space-y-4">
                        <!-- Subjects will be rendered here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Render subjects
    renderSubjectsList();
}

function switchProfileTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('text-primary', 'border-b-2', 'border-primary');
        tab.classList.add('text-gray-500');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-500');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('text-primary', 'border-b-2', 'border-primary');
    
    // Show/hide tab content
    document.getElementById('personalTab').classList.add('hidden');
    document.getElementById('schoolTab').classList.add('hidden');
    document.getElementById('subjectsTab').classList.add('hidden');
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
}

async function savePersonalProfile(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const data = {
            displayName: document.getElementById('profileName').value.trim(),
            nip: document.getElementById('profileNIP').value.trim(),
            nuptk: document.getElementById('profileNUPTK').value.trim(),
            jenisKelamin: document.getElementById('profileGender').value,
            tempatLahir: document.getElementById('profileBirthPlace').value.trim(),
            tanggalLahir: document.getElementById('profileBirthDate').value,
            noHP: document.getElementById('profilePhone').value.trim(),
            alamat: document.getElementById('profileAddress').value.trim(),
        };
        
        await db.collection('users').doc(currentUser.uid).update(data);
        
        // Update Firebase Auth display name
        await currentUser.updateProfile({ displayName: data.displayName });
        
        // Update local data
        currentUserData = { ...currentUserData, ...data };
        
        // Update UI
        document.getElementById('userName').textContent = data.displayName;
        
        showToast('Data pribadi berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving personal profile:', error);
        showToast('Gagal menyimpan data', 'error');
    }
    
    hideLoading();
}

async function saveSchoolProfile(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const data = {
            namaSekolah: document.getElementById('schoolName').value.trim(),
            npsn: document.getElementById('schoolNPSN').value.trim(),
            jenjang: document.getElementById('schoolLevel').value,
            kotaKabupaten: document.getElementById('schoolCity').value.trim(),
            provinsi: document.getElementById('schoolProvince').value.trim(),
            alamatSekolah: document.getElementById('schoolAddress').value.trim(),
            namaKepalaSekolah: document.getElementById('principalName').value.trim(),
            nipKepalaSekolah: document.getElementById('principalNIP').value.trim(),
        };
        
        await db.collection('users').doc(currentUser.uid).update(data);
        
        // Update local data
        currentUserData = { ...currentUserData, ...data };
        
        showToast('Data sekolah berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving school profile:', error);
        showToast('Gagal menyimpan data', 'error');
    }
    
    hideLoading();
}

function renderSubjectsList() {
    const container = document.getElementById('subjectsList');
    const subjects = currentUserData?.mataPelajaran || [];
    
    if (subjects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <i class="fas fa-book text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Belum ada mata pelajaran</p>
                <p class="text-sm text-gray-400 mt-1">Klik tombol "Tambah Mapel" untuk menambahkan</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = subjects.map((subject, index) => `
        <div class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Nama Mata Pelajaran</label>
                        <input type="text" value="${subject.nama}" onchange="updateSubject(${index}, 'nama', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Jam/Pertemuan</label>
                        <input type="number" min="1" max="10" value="${subject.jamPerPertemuan || 1}" onchange="updateSubject(${index}, 'jamPerPertemuan', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Pertemuan/Minggu</label>
                        <input type="number" min="1" max="7" value="${subject.pertemuanPerMinggu || 1}" onchange="updateSubject(${index}, 'pertemuanPerMinggu', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                    </div>
                </div>
                <button onclick="removeSubject(${index})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span><i class="fas fa-clock mr-1"></i>Total: ${(subject.jamPerPertemuan || 1) * (subject.pertemuanPerMinggu || 1)} jam/minggu</span>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" ${subject.isPAI ? 'checked' : ''} onchange="updateSubject(${index}, 'isPAI', this.checked)"
                        class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary">
                    <span>PAI (Data CP Default)</span>
                </label>
            </div>
        </div>
    `).join('');
}

function addSubject() {
    const subjects = currentUserData?.mataPelajaran || [];
    subjects.push({
        id: generateUID(),
        nama: 'Mata Pelajaran Baru',
        jamPerPertemuan: 2,
        pertemuanPerMinggu: 1,
        isPAI: false
    });
    
    saveSubjects(subjects);
}

function removeSubject(index) {
    if (!confirm('Yakin ingin menghapus mata pelajaran ini?')) return;
    
    const subjects = currentUserData?.mataPelajaran || [];
    subjects.splice(index, 1);
    saveSubjects(subjects);
}

function updateSubject(index, field, value) {
    const subjects = currentUserData?.mataPelajaran || [];
    
    if (field === 'jamPerPertemuan' || field === 'pertemuanPerMinggu') {
        value = parseInt(value) || 1;
    }
    
    subjects[index][field] = value;
    saveSubjects(subjects);
}

async function saveSubjects(subjects) {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            mataPelajaran: subjects
        });
        
        currentUserData.mataPelajaran = subjects;
        renderSubjectsList();
        
        showToast('Mata pelajaran berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving subjects:', error);
        showToast('Gagal menyimpan mata pelajaran', 'error');
    }
}

// =====================================================
// CALENDAR MODULE (UPDATED - dengan Kelas Akhir Jenjang)
// =====================================================
function renderCalendar() {
    const contentArea = document.getElementById('contentArea');
    const tahunAjar = getSelectedAcademicYear();
    const jenjang = currentUserData?.jenjang || 'SD';
    const kelasAkhir = getKelasAkhirJenjang(jenjang);
    
    contentArea.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Kalender Pendidikan</h2>
                        <p class="text-gray-500 text-sm mt-1">Tahun Ajaran ${tahunAjar}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="importCalendarCSV()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-file-import mr-2"></i>Import CSV
                        </button>
                        <button onclick="exportCalendarCSV()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-file-export mr-2"></i>Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="border-b">
                    <nav class="flex">
                        <button onclick="switchCalendarTab('regular')" class="calendar-tab flex-1 px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary" data-tab="regular">
                            <i class="fas fa-calendar-alt mr-2"></i>Kelas Reguler
                        </button>
                        <button onclick="switchCalendarTab('final')" class="calendar-tab flex-1 px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="final">
                            <i class="fas fa-graduation-cap mr-2"></i>Kelas Akhir (${kelasAkhir})
                            <span class="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">Khusus</span>
                        </button>
                        <button onclick="switchCalendarTab('holidays')" class="calendar-tab flex-1 px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700" data-tab="holidays">
                            <i class="fas fa-calendar-times mr-2"></i>Hari Libur
                        </button>
                    </nav>
                </div>

                <!-- Regular Classes Tab -->
                <div id="regularTab" class="p-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p class="text-blue-800 text-sm">
                            <i class="fas fa-info-circle mr-2"></i>
                            Pengaturan untuk kelas <strong>1-${kelasAkhir - 1}</strong> (kelas reguler, bukan kelas akhir jenjang)
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Semester Ganjil -->
                        <div class="border border-gray-200 rounded-xl p-5">
                            <h3 class="font-semibold text-gray-800 mb-4">
                                <i class="fas fa-leaf text-orange-500 mr-2"></i>Semester Ganjil
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                                    <input type="date" id="ganjilStart"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                                    <input type="date" id="ganjilEnd"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div class="pt-2 border-t">
                                    <p class="text-sm text-gray-500">
                                        <i class="fas fa-calculator mr-1"></i>
                                        Minggu efektif: <span id="ganjilWeeks" class="font-semibold text-primary">-</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Semester Genap -->
                        <div class="border border-gray-200 rounded-xl p-5">
                            <h3 class="font-semibold text-gray-800 mb-4">
                                <i class="fas fa-snowflake text-blue-500 mr-2"></i>Semester Genap
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                                    <input type="date" id="genapStart"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                                    <input type="date" id="genapEnd"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div class="pt-2 border-t">
                                    <p class="text-sm text-gray-500">
                                        <i class="fas fa-calculator mr-1"></i>
                                        Minggu efektif: <span id="genapWeeks" class="font-semibold text-primary">-</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Final Class Tab (Kelas Akhir Jenjang) -->
                <div id="finalTab" class="p-6 hidden">
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p class="text-yellow-800 text-sm">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            <strong>Pengaturan khusus untuk Kelas ${kelasAkhir}</strong> - Semester genap biasanya lebih pendek karena pelaksanaan ujian akhir/kelulusan yang dipercepat.
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Semester Ganjil Kelas Akhir -->
                        <div class="border border-gray-200 rounded-xl p-5">
                            <h3 class="font-semibold text-gray-800 mb-4">
                                <i class="fas fa-leaf text-orange-500 mr-2"></i>Semester Ganjil (Kelas ${kelasAkhir})
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                                    <input type="date" id="finalGanjilStart"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                                    <input type="date" id="finalGanjilEnd"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div class="pt-2 border-t">
                                    <p class="text-sm text-gray-500">
                                        <i class="fas fa-calculator mr-1"></i>
                                        Minggu efektif: <span id="finalGanjilWeeks" class="font-semibold text-primary">-</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Semester Genap Kelas Akhir (DIPERCEPAT) -->
                        <div class="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-5">
                            <h3 class="font-semibold text-gray-800 mb-4">
                                <i class="fas fa-graduation-cap text-yellow-600 mr-2"></i>Semester Genap (Kelas ${kelasAkhir})
                                <span class="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs">Dipercepat</span>
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                                    <input type="date" id="finalGenapStart"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal Selesai Efektif
                                        <span class="text-yellow-600 text-xs">(sebelum ujian akhir)</span>
                                    </label>
                                    <input type="date" id="finalGenapEnd"
                                        class="w-full px-4 py-2.5 rounded-lg border border-yellow-300 bg-yellow-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Ujian Akhir/Kelulusan</label>
                                    <input type="date" id="finalExamDate"
                                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div class="pt-2 border-t">
                                    <p class="text-sm text-gray-500">
                                        <i class="fas fa-calculator mr-1"></i>
                                        Minggu efektif: <span id="finalGenapWeeks" class="font-semibold text-yellow-600">-</span>
                                        <span class="text-yellow-600">(lebih pendek dari kelas reguler)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Comparison Info -->
                    <div class="mt-6 bg-gray-50 rounded-xl p-4">
                        <h4 class="font-medium text-gray-800 mb-3">
                            <i class="fas fa-balance-scale mr-2"></i>Perbandingan Waktu Efektif
                        </h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div class="bg-white rounded-lg p-3 border">
                                <p class="text-gray-500">Kelas Reguler (Genap)</p>
                                <p class="text-lg font-bold text-primary" id="compareRegularWeeks">- minggu</p>
                            </div>
                            <div class="bg-yellow-100 rounded-lg p-3 border border-yellow-300">
                                <p class="text-gray-500">Kelas ${kelasAkhir} (Genap)</p>
                                <p class="text-lg font-bold text-yellow-600" id="compareFinalWeeks">- minggu</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Holidays Tab -->
                <div id="holidaysTab" class="p-6 hidden">
                    <!-- Fixed Holidays -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-gray-800 mb-3">
                            <i class="fas fa-lock text-gray-400 mr-2"></i>Libur Nasional Tetap (Otomatis)
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${HARI_LIBUR_BAKU.map(h => `
                                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <i class="fas fa-check-circle text-green-500"></i>
                                    <span class="text-sm flex-1">${h.nama}</span>
                                    <span class="text-xs text-gray-400">${h.tanggal}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Variable Holidays -->
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold text-gray-800">
                                <i class="fas fa-edit text-blue-500 mr-2"></i>Libur Tidak Tetap (Bisa Diubah)
                            </h4>
                            <button onclick="addHoliday()" class="px-3 py-1.5 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-plus mr-1"></i>Tambah
                            </button>
                        </div>
                        <div id="variableHolidaysList" class="space-y-2">
                            <!-- Will be rendered -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end gap-3">
                <button onclick="calculateAllWeeks()" class="px-6 py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-all">
                    <i class="fas fa-calculator mr-2"></i>Hitung Minggu Efektif
                </button>
                <button onclick="saveCalendar()" class="px-6 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-medium transition-all shadow-lg">
                    <i class="fas fa-save mr-2"></i>Simpan Kalender
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners for auto-calculate
    ['ganjilStart', 'ganjilEnd', 'genapStart', 'genapEnd', 
     'finalGanjilStart', 'finalGanjilEnd', 'finalGenapStart', 'finalGenapEnd'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', calculateAllWeeks);
        }
    });
    
    // Load calendar data
    loadCalendarData();
}

function getKelasAkhirJenjang(jenjang) {
    switch(jenjang) {
        case 'SD': return 6;
        case 'SMP': return 9;
        case 'SMA': return 12;
        default: return 6;
    }
}

function switchCalendarTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.calendar-tab').forEach(tab => {
        tab.classList.remove('text-primary', 'border-b-2', 'border-primary');
        tab.classList.add('text-gray-500');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.remove('text-gray-500');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('text-primary', 'border-b-2', 'border-primary');
    
    // Show/hide tab content
    document.getElementById('regularTab').classList.add('hidden');
    document.getElementById('finalTab').classList.add('hidden');
    document.getElementById('holidaysTab').classList.add('hidden');
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
}

async function loadCalendarData() {
    const tahunAjar = getSelectedAcademicYear();
    const jenjang = currentUserData?.jenjang || 'SD';
    
    try {
        const calendarDoc = await db.collection('users').doc(currentUser.uid)
            .collection('calendars').doc(tahunAjar).get();
        
        if (calendarDoc.exists) {
            const data = calendarDoc.data();
            
            // Set regular semester dates
            document.getElementById('ganjilStart').value = data.ganjilStart || '';
            document.getElementById('ganjilEnd').value = data.ganjilEnd || '';
            document.getElementById('genapStart').value = data.genapStart || '';
            document.getElementById('genapEnd').value = data.genapEnd || '';
            
            // Set final class dates
            document.getElementById('finalGanjilStart').value = data.finalGanjilStart || data.ganjilStart || '';
            document.getElementById('finalGanjilEnd').value = data.finalGanjilEnd || data.ganjilEnd || '';
            document.getElementById('finalGenapStart').value = data.finalGenapStart || data.genapStart || '';
            document.getElementById('finalGenapEnd').value = data.finalGenapEnd || '';
            document.getElementById('finalExamDate').value = data.finalExamDate || '';
            
            // Render variable holidays
            renderVariableHolidays(data.variableHolidays || getDefaultLiburTidakTetap(tahunAjar));
            
            // Calculate weeks
            calculateAllWeeks();
        } else {
            // Set defaults
            const tahunAwal = parseInt(tahunAjar.split('/')[0]);
            
            // Regular classes
            document.getElementById('ganjilStart').value = `${tahunAwal}-07-15`;
            document.getElementById('ganjilEnd').value = `${tahunAwal}-12-20`;
            document.getElementById('genapStart').value = `${tahunAwal + 1}-01-06`;
            document.getElementById('genapEnd').value = `${tahunAwal + 1}-06-20`;
            
            // Final class (semester genap lebih pendek)
            document.getElementById('finalGanjilStart').value = `${tahunAwal}-07-15`;
            document.getElementById('finalGanjilEnd').value = `${tahunAwal}-12-20`;
            document.getElementById('finalGenapStart').value = `${tahunAwal + 1}-01-06`;
            document.getElementById('finalGenapEnd').value = `${tahunAwal + 1}-04-15`; // Lebih awal
            document.getElementById('finalExamDate').value = `${tahunAwal + 1}-04-20`;
            
            renderVariableHolidays(getDefaultLiburTidakTetap(tahunAjar));
            calculateAllWeeks();
        }
    } catch (error) {
        console.error('Error loading calendar:', error);
    }
}

function calculateAllWeeks() {
    // Regular semesters
    const ganjilStart = document.getElementById('ganjilStart').value;
    const ganjilEnd = document.getElementById('ganjilEnd').value;
    const genapStart = document.getElementById('genapStart').value;
    const genapEnd = document.getElementById('genapEnd').value;
    
    if (ganjilStart && ganjilEnd) {
        const weeks = calculateWeeksBetween(ganjilStart, ganjilEnd);
        document.getElementById('ganjilWeeks').textContent = weeks;
    }
    
    if (genapStart && genapEnd) {
        const weeks = calculateWeeksBetween(genapStart, genapEnd);
        document.getElementById('genapWeeks').textContent = weeks;
        document.getElementById('compareRegularWeeks').textContent = weeks + ' minggu';
    }
    
    // Final class semesters
    const finalGanjilStart = document.getElementById('finalGanjilStart').value;
    const finalGanjilEnd = document.getElementById('finalGanjilEnd').value;
    const finalGenapStart = document.getElementById('finalGenapStart').value;
    const finalGenapEnd = document.getElementById('finalGenapEnd').value;
    
    if (finalGanjilStart && finalGanjilEnd) {
        const weeks = calculateWeeksBetween(finalGanjilStart, finalGanjilEnd);
        document.getElementById('finalGanjilWeeks').textContent = weeks;
    }
    
    if (finalGenapStart && finalGenapEnd) {
        const weeks = calculateWeeksBetween(finalGenapStart, finalGenapEnd);
        document.getElementById('finalGenapWeeks').textContent = weeks;
        document.getElementById('compareFinalWeeks').textContent = weeks + ' minggu';
    }
}

function calculateWeeksBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
}

function renderVariableHolidays(holidays) {
    const container = document.getElementById('variableHolidaysList');
    
    if (holidays.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 text-gray-500">
                <p>Belum ada hari libur tidak tetap</p>
            </div>
        `;
        window.tempHolidays = [];
        return;
    }
    
    container.innerHTML = holidays.map((holiday, index) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="date" value="${holiday.tanggal}" onchange="updateHoliday(${index}, 'tanggal', this.value)"
                class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm">
            <input type="text" value="${holiday.nama}" onchange="updateHoliday(${index}, 'nama', this.value)"
                class="flex-1 px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm"
                placeholder="Nama hari libur">
            <button onclick="removeHoliday(${index})" class="p-2 text-red-500 hover:bg-red-100 rounded transition-all">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Store in temp
    window.tempHolidays = holidays;
}

function addHoliday() {
    const holidays = window.tempHolidays || [];
    holidays.push({ tanggal: '', nama: 'Libur Baru' });
    renderVariableHolidays(holidays);
}

function updateHoliday(index, field, value) {
    window.tempHolidays[index][field] = value;
}

function removeHoliday(index) {
    window.tempHolidays.splice(index, 1);
    renderVariableHolidays(window.tempHolidays);
}

async function saveCalendar() {
    showLoading();
    const tahunAjar = getSelectedAcademicYear();
    
    try {
        const data = {
            // Regular classes
            ganjilStart: document.getElementById('ganjilStart').value,
            ganjilEnd: document.getElementById('ganjilEnd').value,
            genapStart: document.getElementById('genapStart').value,
            genapEnd: document.getElementById('genapEnd').value,
            
            // Final class (kelas akhir jenjang)
            finalGanjilStart: document.getElementById('finalGanjilStart').value,
            finalGanjilEnd: document.getElementById('finalGanjilEnd').value,
            finalGenapStart: document.getElementById('finalGenapStart').value,
            finalGenapEnd: document.getElementById('finalGenapEnd').value,
            finalExamDate: document.getElementById('finalExamDate').value,
            
            // Holidays
            variableHolidays: window.tempHolidays || [],
            fixedHolidays: HARI_LIBUR_BAKU,
            
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(currentUser.uid)
            .collection('calendars').doc(tahunAjar).set(data);
        
        showToast('Kalender berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving calendar:', error);
        showToast('Gagal menyimpan kalender', 'error');
    }
    
    hideLoading();
}

// Helper function to get calendar dates based on class
async function getCalendarDatesForClass(kelas) {
    const tahunAjar = getSelectedAcademicYear();
    const jenjang = currentUserData?.jenjang || 'SD';
    const kelasAkhir = getKelasAkhirJenjang(jenjang);
    
    try {
        const calendarDoc = await db.collection('users').doc(currentUser.uid)
            .collection('calendars').doc(tahunAjar).get();
        
        if (calendarDoc.exists) {
            const data = calendarDoc.data();
            
            // Check if this is the final class
            if (parseInt(kelas) === kelasAkhir) {
                return {
                    ganjilStart: data.finalGanjilStart || data.ganjilStart,
                    ganjilEnd: data.finalGanjilEnd || data.ganjilEnd,
                    genapStart: data.finalGenapStart || data.genapStart,
                    genapEnd: data.finalGenapEnd || data.genapEnd,
                    isFinalClass: true
                };
            } else {
                return {
                    ganjilStart: data.ganjilStart,
                    ganjilEnd: data.ganjilEnd,
                    genapStart: data.genapStart,
                    genapEnd: data.genapEnd,
                    isFinalClass: false
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting calendar dates:', error);
        return null;
    }
}
// =====================================================
// SCHEDULE MODULE
// =====================================================
function renderSchedule() {
    const contentArea = document.getElementById('contentArea');
    const tahunAjar = getSelectedAcademicYear();
    const jenjang = currentUserData?.jenjang || 'SD';
    const jenjangInfo = JENJANG_PENDIDIKAN[jenjang] || JENJANG_PENDIDIKAN.SD;
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Jadwal Pelajaran</h2>
                        <p class="text-gray-500 text-sm mt-1">Tahun Ajaran ${tahunAjar} | Durasi default: ${jenjangInfo.durasiJam} menit/jam</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="showTimeSlotSettings()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-clock mr-2"></i>Atur Jam Pelajaran
                        </button>
                        <button onclick="addScheduleEntry()" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-plus mr-2"></i>Tambah Jadwal
                        </button>
                    </div>
                </div>
            </div>

            <!-- Time Slot Settings (Hidden by default) -->
            <div id="timeSlotSettings" class="bg-white rounded-xl shadow-sm p-6 hidden">
                <h3 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-clock text-primary mr-2"></i>Pengaturan Jam Pelajaran
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Durasi per Jam (menit)</label>
                        <input type="number" id="lessonDuration" value="${jenjangInfo.durasiJam}" min="30" max="60"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                        <input type="time" id="startTime" value="07:00"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>
                </div>
                <div id="timeSlotsList" class="space-y-2 mb-4">
                    <!-- Time slots will be rendered here -->
                </div>
                <div class="flex gap-2">
                    <button onclick="addTimeSlot()" class="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-all">
                        <i class="fas fa-plus mr-2"></i>Tambah Jam
                    </button>
                    <button onclick="generateTimeSlots()" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                        <i class="fas fa-magic mr-2"></i>Generate Otomatis
                    </button>
                </div>
            </div>

            <!-- Schedule Table -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hari</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jam Ke</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mata Pelajaran</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kelas</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rombel</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="scheduleTableBody" class="divide-y divide-gray-100">
                            <!-- Schedule entries will be rendered here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Conflict Warning -->
            <div id="conflictWarning" class="hidden bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                    <div>
                        <h4 class="font-semibold text-red-800">Konflik Jadwal Terdeteksi</h4>
                        <ul id="conflictList" class="mt-2 text-sm text-red-700 list-disc list-inside">
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
                <button onclick="saveSchedule()" class="px-6 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-medium transition-all shadow-lg">
                    <i class="fas fa-save mr-2"></i>Simpan Jadwal
                </button>
            </div>
        </div>
    `;
    
    // Load schedule data
    loadScheduleData();
}

async function loadScheduleData() {
    const tahunAjar = getSelectedAcademicYear();
    
    try {
        const scheduleDoc = await db.collection('users').doc(currentUser.uid)
            .collection('schedules').doc(tahunAjar).get();
        
        if (scheduleDoc.exists) {
            const data = scheduleDoc.data();
            window.scheduleEntries = data.entries || [];
            window.timeSlots = data.timeSlots || generateDefaultTimeSlots();
        } else {
            window.scheduleEntries = [];
            window.timeSlots = generateDefaultTimeSlots();
        }
        
        renderScheduleTable();
        renderTimeSlots();
    } catch (error) {
        console.error('Error loading schedule:', error);
        window.scheduleEntries = [];
        window.timeSlots = generateDefaultTimeSlots();
        renderScheduleTable();
    }
}

function generateDefaultTimeSlots() {
    const jenjang = currentUserData?.jenjang || 'SD';
    const duration = JENJANG_PENDIDIKAN[jenjang]?.durasiJam || 40;
    const slots = [];
    let currentTime = 7 * 60; // 07:00 in minutes
    
    for (let i = 1; i <= 8; i++) {
        const start = minutesToTime(currentTime);
        const end = minutesToTime(currentTime + duration);
        slots.push({ jam: i, mulai: start, selesai: end });
        currentTime += duration;
        
        // Add break after jam 4
        if (i === 4) currentTime += 15;
    }
    
    return slots;
}

function renderTimeSlots() {
    const container = document.getElementById('timeSlotsList');
    const slots = window.timeSlots || [];
    
    container.innerHTML = slots.map((slot, index) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span class="w-16 text-sm font-medium text-gray-600">Jam ${slot.jam}</span>
            <input type="time" value="${slot.mulai}" onchange="updateTimeSlot(${index}, 'mulai', this.value)"
                class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm">
            <span class="text-gray-400">-</span>
            <input type="time" value="${slot.selesai}" onchange="updateTimeSlot(${index}, 'selesai', this.value)"
                class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm">
            <button onclick="removeTimeSlot(${index})" class="p-2 text-red-500 hover:bg-red-100 rounded transition-all">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function showTimeSlotSettings() {
    document.getElementById('timeSlotSettings').classList.toggle('hidden');
}

function addTimeSlot() {
    const slots = window.timeSlots || [];
    const lastSlot = slots[slots.length - 1];
    const lastEnd = lastSlot ? timeToMinutes(lastSlot.selesai) : 7 * 60;
    const duration = parseInt(document.getElementById('lessonDuration')?.value) || 40;
    
    slots.push({
        jam: slots.length + 1,
        mulai: minutesToTime(lastEnd),
        selesai: minutesToTime(lastEnd + duration)
    });
    
    window.timeSlots = slots;
    renderTimeSlots();
}

function removeTimeSlot(index) {
    window.timeSlots.splice(index, 1);
    // Renumber
    window.timeSlots.forEach((slot, i) => slot.jam = i + 1);
    renderTimeSlots();
}

function updateTimeSlot(index, field, value) {
    window.timeSlots[index][field] = value;
}

function generateTimeSlots() {
    const duration = parseInt(document.getElementById('lessonDuration').value) || 40;
    const startTime = document.getElementById('startTime').value || '07:00';
    const slots = [];
    let currentTime = timeToMinutes(startTime);
    
    for (let i = 1; i <= 10; i++) {
        const start = minutesToTime(currentTime);
        const end = minutesToTime(currentTime + duration);
        slots.push({ jam: i, mulai: start, selesai: end });
        currentTime += duration;
        
        // Add break after certain hours
        if (i === 3) currentTime += 15; // Istirahat 1
        if (i === 6) currentTime += 15; // Istirahat 2
    }
    
    window.timeSlots = slots;
    renderTimeSlots();
    showToast('Jam pelajaran berhasil di-generate', 'success');
}

function renderScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    const entries = window.scheduleEntries || [];
    const subjects = currentUserData?.mataPelajaran || [];
    const jenjang = currentUserData?.jenjang || 'SD';
    const kelasList = JENJANG_PENDIDIKAN[jenjang]?.kelas || [1, 2, 3, 4, 5, 6];
    
    if (entries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                    <i class="fas fa-calendar-plus text-4xl text-gray-300 mb-3 block"></i>
                    Belum ada jadwal. Klik "Tambah Jadwal" untuk menambahkan.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by day and jam
    const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 };
    entries.sort((a, b) => {
        if (dayOrder[a.hari] !== dayOrder[b.hari]) return dayOrder[a.hari] - dayOrder[b.hari];
        return a.jamKe - b.jamKe;
    });
    
    tbody.innerHTML = entries.map((entry, index) => {
        const timeSlot = window.timeSlots?.find(t => t.jam === parseInt(entry.jamKe));
        const waktu = timeSlot ? `${timeSlot.mulai} - ${timeSlot.selesai}` : '-';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <select value="${entry.hari}" onchange="updateScheduleEntry(${index}, 'hari', this.value)"
                        class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm w-full">
                        ${HARI.map(h => `<option value="${h}" ${entry.hari === h ? 'selected' : ''}>${h}</option>`).join('')}
                    </select>
                </td>
                <td class="px-4 py-3">
                    <select value="${entry.jamKe}" onchange="updateScheduleEntry(${index}, 'jamKe', this.value)"
                        class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm w-full">
                        ${(window.timeSlots || []).map(t => `<option value="${t.jam}" ${entry.jamKe == t.jam ? 'selected' : ''}>${t.jam}</option>`).join('')}
                    </select>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">${waktu}</td>
                <td class="px-4 py-3">
                    <select value="${entry.mataPelajaran}" onchange="updateScheduleEntry(${index}, 'mataPelajaran', this.value)"
                        class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm w-full">
                        <option value="">Pilih...</option>
                        ${subjects.map(s => `<option value="${s.nama}" ${entry.mataPelajaran === s.nama ? 'selected' : ''}>${s.nama}</option>`).join('')}
                    </select>
                </td>
                <td class="px-4 py-3">
                    <select value="${entry.kelas}" onchange="updateScheduleEntry(${index}, 'kelas', this.value)"
                        class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm w-full">
                        ${kelasList.map(k => `<option value="${k}" ${entry.kelas == k ? 'selected' : ''}>${k}</option>`).join('')}
                    </select>
                </td>
                <td class="px-4 py-3">
                    <input type="text" value="${entry.rombel || ''}" onchange="updateScheduleEntry(${index}, 'rombel', this.value)"
                        class="px-3 py-1.5 rounded border border-gray-200 focus:border-primary outline-none text-sm w-20"
                        placeholder="A/B/C">
                </td>
                <td class="px-4 py-3 text-center">
                    <button onclick="duplicateScheduleEntry(${index})" class="p-2 text-blue-500 hover:bg-blue-50 rounded transition-all" title="Duplikat">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="removeScheduleEntry(${index})" class="p-2 text-red-500 hover:bg-red-50 rounded transition-all" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Check for conflicts
    checkScheduleConflicts();
}

function addScheduleEntry() {
    const entries = window.scheduleEntries || [];
    entries.push({
        id: generateUID(),
        hari: 'Senin',
        jamKe: 1,
        jamPelajaran: 2,
        mataPelajaran: '',
        kelas: 1,
        rombel: 'A'
    });
    window.scheduleEntries = entries;
    renderScheduleTable();
}

function duplicateScheduleEntry(index) {
    const entries = window.scheduleEntries;
    const entry = { ...entries[index], id: generateUID() };
    entries.push(entry);
    window.scheduleEntries = entries;
    renderScheduleTable();
}

function removeScheduleEntry(index) {
    window.scheduleEntries.splice(index, 1);
    renderScheduleTable();
}

function updateScheduleEntry(index, field, value) {
    window.scheduleEntries[index][field] = value;
    checkScheduleConflicts();
}

function checkScheduleConflicts() {
    const entries = window.scheduleEntries || [];
    const conflicts = [];
    
    for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
            const a = entries[i];
            const b = entries[j];
            
            // Same day and same jam
            if (a.hari === b.hari && a.jamKe === b.jamKe) {
                // Conflict 1: Same class and rombel with different teacher/subject
                if (a.kelas === b.kelas && a.rombel === b.rombel) {
                    conflicts.push(`Kelas ${a.kelas}${a.rombel} memiliki 2 jadwal di ${a.hari} jam ke-${a.jamKe}`);
                }
                
                // Conflict 2: Same subject (same teacher) at different class at same time
                if (a.mataPelajaran === b.mataPelajaran && a.mataPelajaran !== '') {
                    conflicts.push(`${a.mataPelajaran} dijadwalkan di 2 kelas berbeda pada ${a.hari} jam ke-${a.jamKe}`);
                }
            }
        }
    }
    
    const warningDiv = document.getElementById('conflictWarning');
    const conflictList = document.getElementById('conflictList');
    
    if (conflicts.length > 0) {
        warningDiv.classList.remove('hidden');
        conflictList.innerHTML = conflicts.map(c => `<li>${c}</li>`).join('');
    } else {
        warningDiv.classList.add('hidden');
    }
    
    return conflicts.length === 0;
}

async function saveSchedule() {
    // Check conflicts first
    if (!checkScheduleConflicts()) {
        if (!confirm('Terdapat konflik jadwal. Yakin ingin menyimpan?')) {
            return;
        }
    }
    
    showLoading();
    const tahunAjar = getSelectedAcademicYear();
    
    try {
        const data = {
            entries: window.scheduleEntries || [],
            timeSlots: window.timeSlots || [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(currentUser.uid)
            .collection('schedules').doc(tahunAjar).set(data);
        
        showToast('Jadwal berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving schedule:', error);
        showToast('Gagal menyimpan jadwal', 'error');
    }
    
    hideLoading();
}

// =====================================================
// CURRICULUM MODULE (CP & TP)
// =====================================================
function renderCurriculum() {
    const contentArea = document.getElementById('contentArea');
    const subjects = currentUserData?.mataPelajaran || [];
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Capaian Pembelajaran & Tujuan Pembelajaran</h2>
                        <p class="text-gray-500 text-sm mt-1">Single Input untuk generate ATP, Prota, Promes, dan dokumen lainnya</p>
                    </div>
                </div>
            </div>

            <!-- Subject Selector -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row gap-4 items-start md:items-end">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Mata Pelajaran</label>
                        <select id="curriculumSubject" onchange="loadCurriculumData()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih Mata Pelajaran...</option>
                            ${subjects.map(s => `<option value="${s.nama}" data-ispai="${s.isPAI}">${s.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="loadDefaultPAI()" id="loadPAIBtn" class="px-4 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-all hidden">
                            <i class="fas fa-download mr-2"></i>Load Data PAI Default
                        </button>
                        <button onclick="showImportCPModal()" class="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-file-import mr-2"></i>Import CSV
                        </button>
                    </div>
                </div>
            </div>

            <!-- CP/TP Content -->
            <div id="curriculumContent">
                <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                    <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran</h3>
                    <p class="text-gray-500 mt-2">Pilih mata pelajaran untuk mengelola CP dan TP</p>
                </div>
            </div>
        </div>

        <!-- Import CP Modal -->
        <div id="importCPModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] hidden">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 modal-enter max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b sticky top-0 bg-white">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-gray-800">Import CP/TP dari CSV</h3>
                        <button onclick="closeImportCPModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="mb-6">
                        <h4 class="font-medium text-gray-800 mb-2">Format CSV yang Diterima:</h4>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <p class="text-gray-600">Fase;Kelas;Semester;Elemen;Tujuan Pembelajaran</p>
                            <p class="text-gray-500">Fase A;1;Ganjil;Al-Qur'an Hadis;Peserta didik mampu...</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Upload File CSV</label>
                            <input type="file" id="cpFileInput" accept=".csv" 
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none">
                        </div>
                        
                        <div class="text-center text-gray-500">atau</div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL Google Spreadsheet (Published CSV)</label>
                            <input type="url" id="cpURLInput" placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end gap-3">
                        <button onclick="closeImportCPModal()" class="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            Batal
                        </button>
                        <button onclick="importCP()" class="px-4 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-upload mr-2"></i>Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showImportCPModal() {
    document.getElementById('importCPModal').classList.remove('hidden');
}

function closeImportCPModal() {
    document.getElementById('importCPModal').classList.add('hidden');
}

async function loadCurriculumData() {
    const subject = document.getElementById('curriculumSubject').value;
    const option = document.getElementById('curriculumSubject').selectedOptions[0];
    const isPAI = option?.dataset.ispai === 'true';
    
    if (!subject) {
        document.getElementById('curriculumContent').innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran</h3>
                <p class="text-gray-500 mt-2">Pilih mata pelajaran untuk mengelola CP dan TP</p>
            </div>
        `;
        document.getElementById('loadPAIBtn').classList.add('hidden');
        return;
    }
    
    // Show/hide PAI default button
    if (isPAI) {
        document.getElementById('loadPAIBtn').classList.remove('hidden');
    } else {
        document.getElementById('loadPAIBtn').classList.add('hidden');
    }
    
    showLoading();
    
    try {
        const jenjang = currentUserData?.jenjang || 'SD';
        const kelasList = JENJANG_PENDIDIKAN[jenjang]?.kelas || [];
        
        // Load saved CP data
        const cpDoc = await db.collection('users').doc(currentUser.uid)
            .collection('curriculum').doc(subject.replace(/[\/\\]/g, '_')).get();
        
        let cpData = [];
        if (cpDoc.exists) {
            cpData = cpDoc.data().items || [];
        }
        
        renderCurriculumEditor(subject, kelasList, cpData);
    } catch (error) {
        console.error('Error loading curriculum:', error);
        showToast('Gagal memuat data CP', 'error');
    }
    
    hideLoading();
}

function renderCurriculumEditor(subject, kelasList, cpData) {
    const container = document.getElementById('curriculumContent');
    const semester = getSelectedSemester();
    
    // Group by kelas
    const groupedData = {};
    kelasList.forEach(kelas => {
        groupedData[kelas] = cpData.filter(cp => cp.Kelas == kelas && cp.Semester === semester);
    });
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Tabs for each Kelas -->
            <div class="bg-white rounded-xl shadow-sm">
                <div class="border-b overflow-x-auto">
                    <nav class="flex">
                        ${kelasList.map((kelas, index) => `
                            <button onclick="switchKelasTab(${kelas})" 
                                class="kelas-tab px-6 py-4 text-sm font-medium whitespace-nowrap ${index === 0 ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}"
                                data-kelas="${kelas}">
                                Kelas ${kelas}
                                <span class="ml-2 px-2 py-0.5 rounded-full text-xs ${groupedData[kelas].length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                                    ${groupedData[kelas].length} TP
                                </span>
                            </button>
                        `).join('')}
                    </nav>
                </div>
                
                <!-- Content for each Kelas -->
                ${kelasList.map((kelas, index) => `
                    <div id="kelasContent${kelas}" class="p-6 ${index !== 0 ? 'hidden' : ''}">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h4 class="font-semibold text-gray-800">Kelas ${kelas} - Semester ${semester}</h4>
                                <p class="text-sm text-gray-500">Fase ${getFaseFromKelas(kelas)}</p>
                            </div>
                            <button onclick="addTP(${kelas})" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-plus mr-2"></i>Tambah TP
                            </button>
                        </div>
                        
                        <div id="tpList${kelas}" class="space-y-4">
                            ${renderTPList(groupedData[kelas], kelas)}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Save Button -->
            <div class="flex justify-end">
                <button onclick="saveCurriculum('${subject}')" class="px-6 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-medium transition-all shadow-lg">
                    <i class="fas fa-save mr-2"></i>Simpan CP/TP
                </button>
            </div>
        </div>
    `;
    
    // Store current data
    window.currentCPData = cpData;
    window.currentSubject = subject;
}

function renderTPList(items, kelas) {
    if (items.length === 0) {
        return `
            <div class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <i class="fas fa-file-alt text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Belum ada Tujuan Pembelajaran</p>
                <p class="text-sm text-gray-400 mt-1">Klik "Tambah TP" atau "Load Data PAI Default" untuk menambahkan</p>
            </div>
        `;
    }
    
    return items.map((item, index) => `
        <div class="border border-gray-200 rounded-xl p-4 tp-item" data-index="${index}" data-kelas="${kelas}">
            <div class="flex items-start gap-4">
                <div class="flex-1 space-y-3">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Elemen</label>
                            <select onchange="updateTPField(${kelas}, ${index}, 'Elemen', this.value)"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm">
                                <option value="">Pilih Elemen...</option>
                                ${ELEMEN_PAI.map(e => `<option value="${e}" ${item.Elemen === e ? 'selected' : ''}>${e}</option>`).join('')}
                                <option value="Lainnya" ${!ELEMEN_PAI.includes(item.Elemen) && item.Elemen ? 'selected' : ''}>Lainnya</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-medium text-gray-500 mb-1">Dimensi Profil Lulusan</label>
                            <div class="flex flex-wrap gap-2">
                                ${DIMENSI_PROFIL_LULUSAN.map(d => `
                                    <label class="inline-flex items-center gap-1 text-xs cursor-pointer">
                                        <input type="checkbox" ${(item.dimensi || []).includes(d.id) ? 'checked' : ''} 
                                            onchange="toggleDimensi(${kelas}, ${index}, '${d.id}')"
                                            class="w-3 h-3 text-primary rounded">
                                        <span>${d.name}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Tujuan Pembelajaran</label>
                        <textarea rows="2" onchange="updateTPField(${kelas}, ${index}, 'Tujuan Pembelajaran', this.value)"
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm resize-none">${item['Tujuan Pembelajaran'] || ''}</textarea>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Alokasi Waktu (JP)</label>
                            <input type="number" min="1" value="${item.alokasiWaktu || 2}" onchange="updateTPField(${kelas}, ${index}, 'alokasiWaktu', this.value)"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Pertemuan</label>
                            <input type="number" min="1" value="${item.pertemuan || 1}" onchange="updateTPField(${kelas}, ${index}, 'pertemuan', this.value)"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Urutan</label>
                            <input type="number" min="1" value="${item.urutan || index + 1}" onchange="updateTPField(${kelas}, ${index}, 'urutan', this.value)"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-gray-500 mb-1">Materi Pokok</label>
                            <input type="text" value="${item.materiPokok || ''}" onchange="updateTPField(${kelas}, ${index}, 'materiPokok', this.value)"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                                placeholder="Materi...">
                        </div>
                    </div>
                </div>
                <button onclick="removeTP(${kelas}, ${index})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function switchKelasTab(kelas) {
    const jenjang = currentUserData?.jenjang || 'SD';
    const kelasList = JENJANG_PENDIDIKAN[jenjang]?.kelas || [];
    
    // Update tabs
    document.querySelectorAll('.kelas-tab').forEach(tab => {
        tab.classList.remove('text-primary', 'border-b-2', 'border-primary');
        tab.classList.add('text-gray-500');
    });
    document.querySelector(`[data-kelas="${kelas}"]`).classList.remove('text-gray-500');
    document.querySelector(`[data-kelas="${kelas}"]`).classList.add('text-primary', 'border-b-2', 'border-primary');
    
    // Show/hide content
    kelasList.forEach(k => {
        document.getElementById(`kelasContent${k}`).classList.add('hidden');
    });
    document.getElementById(`kelasContent${kelas}`).classList.remove('hidden');
}

function addTP(kelas) {
    const semester = getSelectedSemester();
    const newTP = {
        Fase: getFaseFromKelas(kelas),
        Kelas: kelas,
        Semester: semester,
        Elemen: '',
        'Tujuan Pembelajaran': '',
        alokasiWaktu: 2,
        pertemuan: 1,
        urutan: (window.currentCPData || []).filter(cp => cp.Kelas == kelas && cp.Semester === semester).length + 1,
        dimensi: [],
        materiPokok: ''
    };
    
    window.currentCPData = window.currentCPData || [];
    window.currentCPData.push(newTP);
    
    // Re-render the TP list for this kelas
    const items = window.currentCPData.filter(cp => cp.Kelas == kelas && cp.Semester === semester);
    document.getElementById(`tpList${kelas}`).innerHTML = renderTPList(items, kelas);
    
    // Update tab badge
    updateKelasTabBadge(kelas, items.length);
}

function removeTP(kelas, index) {
    if (!confirm('Yakin ingin menghapus Tujuan Pembelajaran ini?')) return;
    
    const semester = getSelectedSemester();
    const items = window.currentCPData.filter(cp => cp.Kelas == kelas && cp.Semester === semester);
    const itemToRemove = items[index];
    
    // Find and remove from main array
    const mainIndex = window.currentCPData.indexOf(itemToRemove);
    if (mainIndex > -1) {
        window.currentCPData.splice(mainIndex, 1);
    }
    
    // Re-render
    const newItems = window.currentCPData.filter(cp => cp.Kelas == kelas && cp.Semester === semester);
    document.getElementById(`tpList${kelas}`).innerHTML = renderTPList(newItems, kelas);
    updateKelasTabBadge(kelas, newItems.length);
}

function updateTPField(kelas, index, field, value) {
    const semester = getSelectedSemester();
    const items = window.currentCPData.filter(cp => cp.Kelas == kelas && cp.Semester === semester);
    
    if (items[index]) {
        if (field === 'alokasiWaktu' || field === 'pertemuan' || field === 'urutan') {
            value = parseInt(value) || 1;
        }
        items[index][field] = value;
    }
}

function toggleDimensi(kelas, index, dimensiId) {
    const semester = getSelectedSemester();
    const items = window.currentCPData.filter(cp => cp.Kelas == kelas && cp.Semester === semester);
    
    if (items[index]) {
        items[index].dimensi = items[index].dimensi || [];
        const idx = items[index].dimensi.indexOf(dimensiId);
        if (idx > -1) {
            items[index].dimensi.splice(idx, 1);
        } else {
            items[index].dimensi.push(dimensiId);
        }
    }
}

function updateKelasTabBadge(kelas, count) {
    const tab = document.querySelector(`[data-kelas="${kelas}"]`);
    const badge = tab.querySelector('span');
    badge.textContent = `${count} TP`;
    badge.className = `ml-2 px-2 py-0.5 rounded-full text-xs ${count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`;
}

async function loadDefaultPAI() {
    showLoading();
    
    try {
        // Load PAI data from the embedded data or fetch from server
        const paiData = await loadPAIDefaultData();
        
        if (paiData && paiData.length > 0) {
            // Filter for current jenjang
            const jenjang = currentUserData?.jenjang || 'SD';
            const kelasList = JENJANG_PENDIDIKAN[jenjang]?.kelas || [];
            
            const filteredData = paiData.filter(item => kelasList.includes(parseInt(item.Kelas)));
            
            // Merge with existing data (avoid duplicates)
            window.currentCPData = window.currentCPData || [];
            
            filteredData.forEach(newItem => {
                const exists = window.currentCPData.some(
                    existing => existing.Kelas == newItem.Kelas && 
                               existing.Semester === newItem.Semester && 
                               existing.Elemen === newItem.Elemen &&
                               existing['Tujuan Pembelajaran'] === newItem['Tujuan Pembelajaran']
                );
                
                if (!exists) {
                    window.currentCPData.push({
                        ...newItem,
                        alokasiWaktu: 2,
                        pertemuan: 1,
                        urutan: window.currentCPData.filter(cp => cp.Kelas == newItem.Kelas && cp.Semester === newItem.Semester).length + 1,
                        dimensi: [],
                        materiPokok: ''
                    });
                }
            });
            
            // Re-render
            const subject = window.currentSubject;
            renderCurriculumEditor(subject, kelasList, window.currentCPData);
            
            showToast(`${filteredData.length} TP PAI berhasil dimuat`, 'success');
        }
    } catch (error) {
        console.error('Error loading PAI default:', error);
        showToast('Gagal memuat data PAI default', 'error');
    }
    
    hideLoading();
}

// PAI Default Data
async function loadPAIDefaultData() {
    // This would normally load from a CSV file or Firestore
    // For now, returning the embedded data
    return [
        { Fase: 'Fase A', Kelas: '1', Semester: 'Ganjil', Elemen: 'Al-Qur\'an Hadis', 'Tujuan Pembelajaran': 'Peserta didik mampu mengenal dan melafalkan huruf hijaiyah dan harakat dasar dengan benar.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Ganjil', Elemen: 'Akidah', 'Tujuan Pembelajaran': 'Peserta didik mampu menyebutkan dan meyakini 6 Rukun Iman dengan benar sebagai wujud keimanan.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Ganjil', Elemen: 'Akhlak', 'Tujuan Pembelajaran': 'Peserta didik mampu melafalkan dan membiasakan diri mengucapkan kalimat basmalah dan hamdalah dalam keseharian.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Ganjil', Elemen: 'Fikih', 'Tujuan Pembelajaran': 'Peserta didik mampu menyebutkan dan menghafal 5 Rukun Islam secara berurutan.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Ganjil', Elemen: 'Sejarah Peradaban Islam', 'Tujuan Pembelajaran': 'Peserta didik mampu menceritakan secara sederhana kisah masa kecil Nabi Muhammad saw.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Genap', Elemen: 'Al-Qur\'an Hadis', 'Tujuan Pembelajaran': 'Peserta didik mampu melafalkan dan menghafal Surah Al-Fatihah dengan lancar.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Genap', Elemen: 'Akidah', 'Tujuan Pembelajaran': 'Peserta didik mampu menyebutkan bukti kebesaran Allah (Al-Khaliq) melalui ciptaan-Nya.' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Genap', Elemen: 'Akhlak', 'Tujuan Pembelajaran': 'Peserta didik mampu menunjukkan adab yang baik serta rasa hormat kepada orang tua dan pendidik (Komunikasi yang santun).' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Genap', Elemen: 'Fikih', 'Tujuan Pembelajaran': 'Peserta didik mampu mempraktikkan tata cara bersuci (istinja) dan wudu yang benar demi menjaga kebersihan (Kesehatan).' },
        { Fase: 'Fase A', Kelas: '1', Semester: 'Genap', Elemen: 'Sejarah Peradaban Islam', 'Tujuan Pembelajaran': 'Peserta didik mampu menceritakan kisah singkat Nabi Adam a.s. dan meneladani sifat taubatnya.' },
        // Add more data as needed - this is a sample
    ];
}

async function saveCurriculum(subject) {
    showLoading();
    
    try {
        const docId = subject.replace(/[\/\\]/g, '_');
        
        await db.collection('users').doc(currentUser.uid)
            .collection('curriculum').doc(docId).set({
                subject: subject,
                items: window.currentCPData || [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        showToast('CP/TP berhasil disimpan', 'success');
    } catch (error) {
        console.error('Error saving curriculum:', error);
        showToast('Gagal menyimpan CP/TP', 'error');
    }
    
    hideLoading();
}

async function importCP() {
    const fileInput = document.getElementById('cpFileInput');
    const urlInput = document.getElementById('cpURLInput');
    
    showLoading();
    
    try {
        let csvText = '';
        
        if (fileInput.files.length > 0) {
            csvText = await fileInput.files[0].text();
        } else if (urlInput.value) {
            const response = await fetch(urlInput.value);
            csvText = await response.text();
        } else {
            showToast('Pilih file atau masukkan URL', 'warning');
            hideLoading();
            return;
        }
        
        const parsed = parseCSV(csvText);
        
        if (parsed.data.length > 0) {
            // Add default fields
            parsed.data.forEach((item, index) => {
                item.alokasiWaktu = item.alokasiWaktu || 2;
                item.pertemuan = item.pertemuan || 1;
                item.urutan = index + 1;
                item.dimensi = [];
                item.materiPokok = item.materiPokok || '';
            });
            
            window.currentCPData = parsed.data;
            
            const jenjang = currentUserData?.jenjang || 'SD';
            const kelasList = JENJANG_PENDIDIKAN[jenjang]?.kelas || [];
            
            renderCurriculumEditor(window.currentSubject, kelasList, window.currentCPData);
            closeImportCPModal();
            
            showToast(`${parsed.data.length} data berhasil diimport`, 'success');
        } else {
            showToast('Tidak ada data yang dapat diimport', 'warning');
        }
    } catch (error) {
        console.error('Error importing CP:', error);
        showToast('Gagal mengimport data', 'error');
    }
    
    hideLoading();
}

// =====================================================
// ATP MODULE
// =====================================================
function renderATP() {
    const contentArea = document.getElementById('contentArea');
    const subjects = currentUserData?.mataPelajaran || [];
    const tahunAjar = getSelectedAcademicYear();
    const semester = getSelectedSemester();
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Alur Tujuan Pembelajaran (ATP)</h2>
                        <p class="text-gray-500 text-sm mt-1">Generate otomatis dari data CP/TP yang sudah diinput</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="printElement('atpPrintArea', 'ATP')" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-print mr-2"></i>Cetak
                        </button>
                        <button onclick="downloadATPWord()" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-file-word mr-2"></i>Download
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                        <select id="atpSubject" onchange="generateATP()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih Mata Pelajaran...</option>
                            ${subjects.map(s => `<option value="${s.nama}">${s.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <select id="atpKelas" onchange="generateATP()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Semua Kelas</option>
                            ${(JENJANG_PENDIDIKAN[currentUserData?.jenjang]?.kelas || []).map(k => `<option value="${k}">Kelas ${k}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                        <select id="atpSemester" onchange="generateATP()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Semua Semester</option>
                            <option value="Ganjil" ${semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option>
                            <option value="Genap" ${semester === 'Genap' ? 'selected' : ''}>Genap</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- ATP Content -->
            <div id="atpContent" class="bg-white rounded-xl shadow-sm">
                <div class="p-12 text-center">
                    <i class="fas fa-route text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran</h3>
                    <p class="text-gray-500 mt-2">ATP akan di-generate otomatis dari data CP/TP</p>
                </div>
            </div>
        </div>
    `;
}

async function generateATP() {
    const subject = document.getElementById('atpSubject').value;
    const kelas = document.getElementById('atpKelas').value;
    const semester = document.getElementById('atpSemester').value;
    
    if (!subject) {
        document.getElementById('atpContent').innerHTML = `
            <div class="p-12 text-center">
                <i class="fas fa-route text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran</h3>
                <p class="text-gray-500 mt-2">ATP akan di-generate otomatis dari data CP/TP</p>
            </div>
        `;
        return;
    }
    
    showLoading();
    
    try {
        const docId = subject.replace(/[\/\\]/g, '_');
        const cpDoc = await db.collection('users').doc(currentUser.uid)
            .collection('curriculum').doc(docId).get();
        
        let cpData = [];
        if (cpDoc.exists) {
            cpData = cpDoc.data().items || [];
        }
        
        // Filter data
        let filteredData = cpData;
        if (kelas) {
            filteredData = filteredData.filter(item => item.Kelas == kelas);
        }
        if (semester) {
            filteredData = filteredData.filter(item => item.Semester === semester);
        }
        
        // Sort by kelas, semester, urutan
        filteredData.sort((a, b) => {
            if (a.Kelas !== b.Kelas) return parseInt(a.Kelas) - parseInt(b.Kelas);
            if (a.Semester !== b.Semester) return a.Semester === 'Ganjil' ? -1 : 1;
            return (a.urutan || 0) - (b.urutan || 0);
        });
        
        renderATPDocument(subject, filteredData);
    } catch (error) {
        console.error('Error generating ATP:', error);
        showToast('Gagal generate ATP', 'error');
    }
    
    hideLoading();
}

function renderATPDocument(subject, data) {
    const container = document.getElementById('atpContent');
    const tahunAjar = getSelectedAcademicYear();
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center">
                <i class="fas fa-exclamation-circle text-6xl text-yellow-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600">Data CP/TP Belum Tersedia</h3>
                <p class="text-gray-500 mt-2">Silakan input CP/TP terlebih dahulu di menu CP & TP</p>
                <button onclick="loadModule('curriculum')" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                    <i class="fas fa-arrow-right mr-2"></i>Ke Menu CP & TP
                </button>
            </div>
        `;
        return;
    }
    
    // Group by Fase
    const groupedByFase = {};
    data.forEach(item => {
        const fase = item.Fase || `Fase ${getFaseFromKelas(item.Kelas)}`;
        if (!groupedByFase[fase]) {
            groupedByFase[fase] = [];
        }
        groupedByFase[fase].push(item);
    });
    
    container.innerHTML = `
        <div id="atpPrintArea" class="p-6">
            <!-- Document Header -->
            <div class="text-center mb-8">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">ALUR TUJUAN PEMBELAJARAN (ATP)</h1>
                <h2 class="text-lg text-gray-600">${subject}</h2>
                <p class="text-gray-500">Tahun Ajaran ${tahunAjar}</p>
                <p class="text-gray-500">${currentUserData?.namaSekolah || ''}</p>
            </div>

            <!-- ATP Table -->
            ${Object.entries(groupedByFase).map(([fase, items]) => `
                <div class="mb-8">
                    <h3 class="text-lg font-bold text-primary mb-4">${fase}</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold w-12">No</th>
                                    <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold w-20">Kelas</th>
                                    <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold w-24">Semester</th>
                                    <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold w-32">Elemen</th>
                                    <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Tujuan Pembelajaran</th>
                                    <th class="border border-gray-300 px-3 py-2 text-center text-sm font-semibold w-20">JP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map((item, index) => `
                                    <tr>
                                        <td class="border border-gray-300 px-3 py-2 text-sm text-center">${index + 1}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-sm text-center">${item.Kelas}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-sm">${item.Semester}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-sm">${item.Elemen || '-'}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-sm">${item['Tujuan Pembelajaran'] || '-'}</td>
                                        <td class="border border-gray-300 px-3 py-2 text-sm text-center">${item.alokasiWaktu || 2}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('')}

            <!-- Signature -->
            <div class="mt-12 flex justify-between">
                <div class="text-center">
                    <p class="text-sm text-gray-600">Mengetahui,</p>
                    <p class="text-sm text-gray-600">Kepala Sekolah</p>
                    <div class="h-20"></div>
                    <p class="text-sm font-semibold border-b border-gray-400 pb-1">${currentUserData?.namaKepalaSekolah || '.........................'}</p>
                    <p class="text-sm text-gray-600">NIP. ${currentUserData?.nipKepalaSekolah || '.........................'}</p>
                </div>
                <div class="text-center">
                    <p class="text-sm text-gray-600">${currentUserData?.kotaKabupaten || '...........'}, ${formatDateID(new Date())}</p>
                    <p class="text-sm text-gray-600">Guru Mata Pelajaran</p>
                    <div class="h-20"></div>
                    <p class="text-sm font-semibold border-b border-gray-400 pb-1">${currentUserData?.displayName || '.........................'}</p>
                    <p class="text-sm text-gray-600">NIP. ${currentUserData?.nip || '.........................'}</p>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// PROTA MODULE
// =====================================================
function renderProta() {
    const contentArea = document.getElementById('contentArea');
    const subjects = currentUserData?.mataPelajaran || [];
    const tahunAjar = getSelectedAcademicYearDisplay();
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Program Tahunan (PROTA)</h2>
                        <p class="text-gray-500 text-sm mt-1">Generate otomatis dari ATP dan Kalender Pendidikan</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="printProta()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-print mr-2"></i>Cetak
                        </button>
                        <button onclick="downloadProtaCSV()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-file-csv mr-2"></i>Download CSV
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                        <select id="protaSubject" onchange="generateProta()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih Mata Pelajaran...</option>
                            ${subjects.map(s => `<option value="${s.nama}">${s.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <select id="protaKelas" onchange="generateProta()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih Kelas...</option>
                            ${(JENJANG_PENDIDIKAN[currentUserData?.jenjang]?.kelas || []).map(k => `<option value="${k}">Kelas ${k}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rombel</label>
                        <input type="text" id="protaRombel" value="A" onchange="generateProta()"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="A/B/C">
                    </div>
                </div>
            </div>

            <!-- Prota Content -->
            <div id="protaContent" class="bg-white rounded-xl shadow-sm">
                <div class="p-12 text-center">
                    <i class="fas fa-calendar-check text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran dan Kelas</h3>
                    <p class="text-gray-500 mt-2">PROTA akan di-generate otomatis dari data CP/TP</p>
                </div>
            </div>
        </div>
    `;
}

async function generateProta() {
    const subject = document.getElementById('protaSubject').value;
    const kelas = document.getElementById('protaKelas').value;
    const rombel = document.getElementById('protaRombel').value || 'A';
    
    if (!subject || !kelas) {
        document.getElementById('protaContent').innerHTML = `
            <div class="p-12 text-center">
                <i class="fas fa-calendar-check text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran dan Kelas</h3>
            </div>
        `;
        return;
    }
    
    showLoading();
    
    try {
        const tahunAjar = getSelectedAcademicYear();
        const docId = subject.replace(/[\/\\]/g, '_');
        
        // Load CP data
        const cpDoc = await db.collection('users').doc(currentUser.uid)
            .collection('curriculum').doc(docId).get();
        
        // Load Calendar data
        const calendarDoc = await db.collection('users').doc(currentUser.uid)
            .collection('calendars').doc(tahunAjar).get();
        
        let cpData = [];
        let calendarData = null;
        
        if (cpDoc.exists) {
            cpData = cpDoc.data().items || [];
            cpData = cpData.filter(item => item.Kelas == kelas);
        }
        
        if (calendarDoc.exists) {
            calendarData = calendarDoc.data();
        }
        
        // Calculate weeks
        let ganjilWeeks = 0, genapWeeks = 0;
        
        if (calendarData) {
            const jenjang = currentUserData?.jenjang || 'SD';
            const kelasAkhir = JENJANG_PENDIDIKAN[jenjang]?.kelasAkhir || 6;
            const isKelasAkhir = parseInt(kelas) === kelasAkhir;
            
            // Get appropriate dates based on class type
            const gStart = new Date(isKelasAkhir && calendarData.finalGanjilStart ? calendarData.finalGanjilStart : calendarData.ganjilStart);
            const gEnd = new Date(isKelasAkhir && calendarData.finalGanjilEnd ? calendarData.finalGanjilEnd : calendarData.ganjilEnd);
            const gnStart = new Date(isKelasAkhir && calendarData.finalGenapStart ? calendarData.finalGenapStart : calendarData.genapStart);
            const gnEnd = new Date(isKelasAkhir && calendarData.finalGenapEnd ? calendarData.finalGenapEnd : calendarData.genapEnd);
            
            if (!isNaN(gStart) && !isNaN(gEnd)) {
                ganjilWeeks = Math.ceil((gEnd - gStart) / (7 * 24 * 60 * 60 * 1000));
            }
            if (!isNaN(gnStart) && !isNaN(gnEnd)) {
                genapWeeks = Math.ceil((gnEnd - gnStart) / (7 * 24 * 60 * 60 * 1000));
            }
        }
        
        renderProtaDocument(subject, kelas, rombel, cpData, calendarData, ganjilWeeks, genapWeeks);
        
    } catch (error) {
        console.error('Error generating Prota:', error);
        showToast('Gagal generate PROTA: ' + error.message, 'error');
    }
    
    hideLoading();
}

function renderProtaDocument(subject, kelas, rombel, cpData, calendarData, ganjilWeeks, genapWeeks) {
    const container = document.getElementById('protaContent');
    const tahunAjar = getSelectedAcademicYearDisplay();
    const fase = getFaseFromKelas(kelas);
    
    // Group CP by semester
    const ganjilData = cpData.filter(item => item.Semester === 'Ganjil').sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    const genapData = cpData.filter(item => item.Semester === 'Genap').sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    
    // Calculate total JP
    const totalGanjilJP = ganjilData.reduce((sum, item) => sum + (parseInt(item.alokasiWaktu) || 2), 0);
    const totalGenapJP = genapData.reduce((sum, item) => sum + (parseInt(item.alokasiWaktu) || 2), 0);
    
    // Group by Elemen (Bab)
    const ganjilByElemen = groupByElemen(ganjilData);
    const genapByElemen = groupByElemen(genapData);
    
    container.innerHTML = `
        <div id="protaPrintArea" class="p-8" style="font-family: 'Times New Roman', serif;">
            <!-- Document Header -->
            <div class="text-center mb-6">
                <h1 class="text-lg font-bold" style="font-size: 14pt;">PROGRAM TAHUNAN (PROTA)</h1>
                <h2 class="text-base font-bold" style="font-size: 12pt;">${subject.toUpperCase()}</h2>
            </div>

            <!-- Identity Table -->
            <table class="mb-6" style="font-size: 11pt;">
                <tr>
                    <td style="width: 150px; padding: 2px 0;">Satuan Pendidikan</td>
                    <td style="width: 10px;">:</td>
                    <td><strong>${currentUserData?.namaSekolah || '-'}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Mata Pelajaran</td>
                    <td>:</td>
                    <td>${subject}</td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Fase / Kelas</td>
                    <td>:</td>
                    <td>Fase ${fase} / Kelas ${kelas} / ${rombel}</td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Tahun Pelajaran</td>
                    <td>:</td>
                    <td>${tahunAjar}</td>
                </tr>
            </table>

            <!-- Prota Table -->
            <table class="w-full border-collapse mb-6" style="font-size: 10pt;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th class="border border-gray-400 px-2 py-2 text-center" style="width: 5%;">No</th>
                        <th class="border border-gray-400 px-2 py-2 text-center" style="width: 10%;">Semester</th>
                        <th class="border border-gray-400 px-2 py-2 text-left" style="width: 25%;">Bab / Elemen</th>
                        <th class="border border-gray-400 px-2 py-2 text-left" style="width: 50%;">Capaian Pembelajaran / Materi</th>
                        <th class="border border-gray-400 px-2 py-2 text-center" style="width: 10%;">Alokasi JP</th>
                    </tr>
                </thead>
                <tbody>
                    ${renderProtaSemesterRows('Ganjil', ganjilByElemen)}
                    <tr style="background-color: #e8f4fc;">
                        <td colspan="4" class="border border-gray-400 px-3 py-2 text-right font-bold">Jumlah JP Semester Ganjil</td>
                        <td class="border border-gray-400 px-3 py-2 text-center font-bold">${totalGanjilJP} JP</td>
                    </tr>
                    <tr><td colspan="5" class="py-2"></td></tr>
                    ${renderProtaSemesterRows('Genap', genapByElemen)}
                    <tr style="background-color: #e8f4fc;">
                        <td colspan="4" class="border border-gray-400 px-3 py-2 text-right font-bold">Jumlah JP Semester Genap</td>
                        <td class="border border-gray-400 px-3 py-2 text-center font-bold">${totalGenapJP} JP</td>
                    </tr>
                    <tr style="background-color: #d4edda;">
                        <td colspan="4" class="border border-gray-400 px-3 py-2 text-right font-bold">TOTAL JP TAHUN PELAJARAN</td>
                        <td class="border border-gray-400 px-3 py-2 text-center font-bold">${totalGanjilJP + totalGenapJP} JP</td>
                    </tr>
                </tbody>
            </table>

            <!-- Info Minggu Efektif -->
            <div class="mb-8 p-4 bg-gray-50 rounded-lg" style="font-size: 10pt;">
                <p><strong>Keterangan Minggu Efektif:</strong></p>
                <ul class="list-disc list-inside mt-2">
                    <li>Semester Ganjil: ± ${ganjilWeeks} minggu</li>
                    <li>Semester Genap: ± ${genapWeeks} minggu</li>
                </ul>
            </div>

            <!-- Signature Area -->
            <div class="flex justify-between mt-12" style="font-size: 11pt;">
                <div class="text-center" style="width: 45%;">
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <div style="height: 70px;"></div>
                    <p class="font-bold" style="text-decoration: underline;">${currentUserData?.namaKepalaSekolah || '................................'}</p>
                    <p>NIP. ${currentUserData?.nipKepalaSekolah || '................................'}</p>
                </div>
                <div class="text-center" style="width: 45%;">
                    <p>${currentUserData?.kotaKabupaten || '..............'}, ${formatDateID(new Date())}</p>
                    <p>Guru Mata Pelajaran</p>
                    <div style="height: 70px;"></div>
                    <p class="font-bold" style="text-decoration: underline;">${currentUserData?.displayName || '................................'}</p>
                    <p>NIP. ${currentUserData?.nip || '................................'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Store data for export
    window.protaData = { subject, kelas, rombel, ganjilByElemen, genapByElemen };
}

function groupByElemen(data) {
    const grouped = {};
    data.forEach(item => {
        const elemen = item.Elemen || item.materiPokok || 'Lainnya';
        if (!grouped[elemen]) {
            grouped[elemen] = [];
        }
        grouped[elemen].push(item);
    });
    return grouped;
}

function renderProtaSemesterRows(semester, groupedData) {
    let html = '';
    let no = 1;
    
    Object.entries(groupedData).forEach(([elemen, items]) => {
        const totalJP = items.reduce((sum, item) => sum + (parseInt(item.alokasiWaktu) || 2), 0);
        
        items.forEach((item, idx) => {
            html += `<tr>`;
            
            // No and Semester columns (only first row of each elemen)
            if (idx === 0) {
                html += `<td rowspan="${items.length}" class="border border-gray-400 px-2 py-2 text-center align-top">${no}</td>`;
                html += `<td rowspan="${items.length}" class="border border-gray-400 px-2 py-2 text-center align-top">${semester}</td>`;
                html += `<td rowspan="${items.length}" class="border border-gray-400 px-2 py-2 text-left align-top font-medium">${elemen}</td>`;
            }
            
            // TP/Materi
            html += `<td class="border border-gray-400 px-2 py-2 text-left">${item['Tujuan Pembelajaran'] || '-'}</td>`;
            
            // JP (only first row shows total)
            if (idx === 0) {
                html += `<td rowspan="${items.length}" class="border border-gray-400 px-2 py-2 text-center align-top font-bold">${totalJP} JP</td>`;
            }
            
            html += `</tr>`;
        });
        
        no++;
    });
    
    return html;
}

function printProta() {
    printElement('protaPrintArea', 'Program Tahunan');
}

function downloadProtaCSV() {
    if (!window.protaData) {
        showToast('Generate PROTA terlebih dahulu', 'warning');
        return;
    }
    
    const { subject, kelas, ganjilByElemen, genapByElemen } = window.protaData;
    const rows = [];
    
    // Add header
    rows.push(['No', 'Semester', 'Bab/Elemen', 'Tujuan Pembelajaran', 'Alokasi JP']);
    
    let no = 1;
    
    // Ganjil
    Object.entries(ganjilByElemen).forEach(([elemen, items]) => {
        items.forEach(item => {
            rows.push([no, 'Ganjil', elemen, item['Tujuan Pembelajaran'] || '', item.alokasiWaktu || 2]);
        });
        no++;
    });
    
    // Genap
    Object.entries(genapByElemen).forEach(([elemen, items]) => {
        items.forEach(item => {
            rows.push([no, 'Genap', elemen, item['Tujuan Pembelajaran'] || '', item.alokasiWaktu || 2]);
        });
        no++;
    });
    
    const csv = rows.map(row => row.join(';')).join('\n');
    downloadFile(csv, `PROTA_${subject}_Kelas${kelas}.csv`);
    showToast('PROTA berhasil di-download', 'success');
}
// =====================================================
// AI ASSISTANT MODULE (UPDATED - dengan Generate Mapel CSV)
// =====================================================
function renderAIAssistant() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <i class="fas fa-robot text-3xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold">AI Assistant</h2>
                        <p class="text-purple-100 mt-1">Bantu generate data untuk format CSV yang bisa diimport ke sistem</p>
                    </div>
                </div>
            </div>

            <!-- Info Box -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <i class="fas fa-lightbulb text-blue-500 text-xl mt-0.5"></i>
                    <div>
                        <h4 class="font-semibold text-blue-800">Cara Menggunakan</h4>
                        <ol class="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                            <li>Pilih template prompt yang sesuai kebutuhan</li>
                            <li>Klik "Copy" untuk menyalin prompt</li>
                            <li>Paste ke ChatGPT, Claude, atau Gemini</li>
                            <li>Ganti placeholder [...] dengan data Anda</li>
                            <li>Copy hasil CSV dari AI</li>
                            <li>Import ke aplikasi melalui menu terkait</li>
                        </ol>
                    </div>
                </div>
            </div>

            <!-- Prompt Templates -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-magic text-purple-500 mr-2"></i>Template Prompt
                </h3>
                
                <div class="space-y-6">
                    <!-- Generate Mapel CSV (NEW) -->
                    <div class="border-2 border-purple-200 bg-purple-50 rounded-xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h4 class="font-medium text-gray-800">Generate Mapel.csv (Pecah CP Jadi TP)</h4>
                                    <span class="px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full text-xs font-medium">Recommended</span>
                                </div>
                                <p class="text-sm text-gray-500 mt-1">Pecah CP/Materi global menjadi 3-4 Tujuan Pembelajaran rinci yang siap diimport</p>
                            </div>
                            <button onclick="copyPrompt('mapelcsv')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-copy mr-1"></i>Copy Prompt
                            </button>
                        </div>
                        <div class="bg-white rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap border border-purple-200 max-h-64 overflow-y-auto" id="promptMapelCSV">Saya sedang menyusun Tujuan Pembelajaran (TP) Kurikulum Merdeka.

Tolong pecah materi/CP global berikut ini menjadi 3 sampai 4 Tujuan Pembelajaran yang lebih spesifik, rinci, dan operasional (menggunakan Kata Kerja Operasional/KKO) untuk diajarkan dalam beberapa kali pertemuan.

Mata Pelajaran: [NAMA MATA PELAJARAN]
Fase: [FASE A/B/C/D/E/F]
Kelas: [KELAS]
Semester: [Ganjil/Genap]
Elemen: [NAMA ELEMEN/BAB]

Materi/CP Global:
[MASUKKAN MATERI / CP GLOBAL DI SINI]

Ketentuan:
1. Setiap TP harus dimulai dengan "Peserta didik mampu..."
2. Gunakan kata kerja operasional yang terukur (mengidentifikasi, menjelaskan, menganalisis, mempraktikkan, dll)
3. TP harus spesifik dan dapat dicapai dalam 1-2 pertemuan
4. Urutkan dari yang paling dasar ke yang lebih kompleks

Sajikan hasil akhirnya SAJA dalam format CSV murni dengan pemisah titik koma (;) dengan urutan kolom persis seperti ini:
Fase;Kelas;Semester;Elemen;Tujuan Pembelajaran

Contoh output:
Fase D;7;Ganjil;Akidah;Peserta didik mampu mengidentifikasi pengertian dan dalil tentang iman kepada Allah.
Fase D;7;Ganjil;Akidah;Peserta didik mampu menjelaskan bukti-bukti keberadaan Allah melalui ciptaan-Nya.
Fase D;7;Ganjil;Akidah;Peserta didik mampu menganalisis dampak beriman kepada Allah dalam kehidupan sehari-hari.
Fase D;7;Ganjil;Akidah;Peserta didik mampu mempraktikkan perilaku yang mencerminkan keimanan kepada Allah.</div>
                        <div class="mt-3 flex items-center gap-2 text-xs text-purple-600">
                            <i class="fas fa-info-circle"></i>
                            <span>Output bisa langsung diimport ke menu CP & TP</span>
                        </div>
                    </div>

                    <!-- Generate Full Mapel (Multiple CP) -->
                    <div class="border border-gray-200 rounded-xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h4 class="font-medium text-gray-800">Generate Mapel Lengkap (Semua Elemen)</h4>
                                <p class="text-sm text-gray-500 mt-1">Generate TP untuk seluruh elemen/bab dalam 1 semester sekaligus</p>
                            </div>
                            <button onclick="copyPrompt('mapelfull')" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto" id="promptMapelFull">Saya sedang menyusun Tujuan Pembelajaran (TP) Kurikulum Merdeka untuk 1 semester penuh.

Mata Pelajaran: [NAMA MATA PELAJARAN]
Fase: [FASE]
Kelas: [KELAS]  
Semester: [Ganjil/Genap]

Berikut daftar Elemen/Bab dan Capaian Pembelajaran (CP) global untuk semester ini:

1. Elemen: [NAMA ELEMEN 1]
   CP: [CP GLOBAL 1]

2. Elemen: [NAMA ELEMEN 2]
   CP: [CP GLOBAL 2]

3. Elemen: [NAMA ELEMEN 3]
   CP: [CP GLOBAL 3]

(tambahkan sesuai kebutuhan)

Tolong pecah SETIAP CP di atas menjadi 3-4 Tujuan Pembelajaran yang spesifik dan operasional.

Ketentuan:
1. Setiap TP dimulai dengan "Peserta didik mampu..."
2. Gunakan KKO yang terukur
3. Total JP per elemen sekitar 4-8 JP
4. Urutkan dari dasar ke kompleks

Sajikan hasil akhirnya SAJA dalam format CSV murni (pemisah ;) dengan kolom:
Fase;Kelas;Semester;Elemen;Tujuan Pembelajaran

Jangan sertakan header, langsung data saja.</div>
                    </div>

                    <!-- CP/TP dari Materi Mentah -->
                    <div class="border border-gray-200 rounded-xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h4 class="font-medium text-gray-800">Generate CP/TP dari Materi Mentah</h4>
                                <p class="text-sm text-gray-500 mt-1">Ubah materi mentah (dari buku/silabus) menjadi format CP/TP terstruktur</p>
                            </div>
                            <button onclick="copyPrompt('cptp')" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto" id="promptCPTP">Saya memiliki materi pembelajaran berikut yang perlu diubah menjadi Tujuan Pembelajaran Kurikulum Merdeka:

[PASTE MATERI ANDA DI SINI - bisa dari buku, silabus, atau catatan]

Informasi tambahan:
- Mata Pelajaran: [NAMA MAPEL]
- Jenjang: [SD/SMP/SMA]
- Kelas: [1-12]
- Semester: [Ganjil/Genap]

Tolong bantu saya:
1. Identifikasi elemen/bab dari materi tersebut
2. Rumuskan Tujuan Pembelajaran yang spesifik dan terukur
3. Setiap elemen pecah menjadi 2-4 TP

Ketentuan Fase:
- Fase A: Kelas 1-2 SD
- Fase B: Kelas 3-4 SD  
- Fase C: Kelas 5-6 SD
- Fase D: Kelas 7-9 SMP
- Fase E: Kelas 10 SMA
- Fase F: Kelas 11-12 SMA

Setiap TP harus:
1. Dimulai dengan "Peserta didik mampu..."
2. Menggunakan kata kerja operasional yang dapat diukur
3. Jelas dan spesifik

Output dalam format CSV (pemisah ;) dengan kolom:
Fase;Kelas;Semester;Elemen;Tujuan Pembelajaran

Output CSV saja tanpa penjelasan.</div>
                    </div>

                    <!-- Soal Generator -->
                    <div class="border border-gray-200 rounded-xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h4 class="font-medium text-gray-800">Generate Bank Soal</h4>
                                <p class="text-sm text-gray-500 mt-1">Buat soal-soal berdasarkan Tujuan Pembelajaran</p>
                            </div>
                            <button onclick="copyPrompt('soal')" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto" id="promptSoal">Berdasarkan Tujuan Pembelajaran berikut:

[PASTE TP ANDA DI SINI]

Mata Pelajaran: [NAMA MAPEL]
Kelas: [KELAS]

Buatkan soal-soal dalam format CSV dengan struktur:
Nomor;Jenis;Pertanyaan;PilihanA;PilihanB;PilihanC;PilihanD;Kunci;Pembahasan

Ketentuan:
- Jenis: PG (Pilihan Ganda) atau Uraian
- Untuk PG: sediakan 4 pilihan (A-D) dan kunci jawaban
- Untuk Uraian: kolom PilihanA-D dan Kunci dikosongkan
- Tingkat kesulitan bervariasi sesuai Taksonomi Bloom (C1-C6)
- Sertakan pembahasan singkat untuk setiap soal
- Untuk PAI: sertakan dalil Al-Qur'an/Hadis jika relevan

Buatkan:
- 5 soal Pilihan Ganda
- 2 soal Uraian

Output CSV saja tanpa header.</div>
                    </div>

                    <!-- LKPD Generator -->
                    <div class="border border-gray-200 rounded-xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h4 class="font-medium text-gray-800">Generate LKPD</h4>
                                <p class="text-sm text-gray-500 mt-1">Buat Lembar Kerja Peserta Didik berdasarkan TP</p>
                            </div>
                            <button onclick="copyPrompt('lkpd')" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto" id="promptLKPD">Berdasarkan Tujuan Pembelajaran berikut:

[PASTE TP ANDA DI SINI]

Mata Pelajaran: [NAMA MAPEL]
Kelas: [KELAS]
Alokasi Waktu: [JUMLAH JP] x [DURASI] menit

Buatkan LKPD (Lembar Kerja Peserta Didik) dengan struktur:

1. IDENTITAS LKPD
   - Judul yang menarik
   - Mata Pelajaran, Kelas, Semester
   - Alokasi Waktu

2. TUJUAN PEMBELAJARAN
   - TP yang akan dicapai

3. PETUNJUK PENGERJAAN
   - Langkah-langkah jelas untuk siswa

4. KEGIATAN PEMBELAJARAN
   - Kegiatan 1: Mengamati/Membaca (stimulus)
   - Kegiatan 2: Menanya/Berdiskusi
   - Kegiatan 3: Mengerjakan tugas

5. LEMBAR KERJA
   - Soal/tugas yang harus dikerjakan siswa
   - Ruang untuk jawaban

6. REFLEKSI DIRI
   - Pertanyaan refleksi untuk siswa

Ketentuan:
- Bahasa sesuai jenjang (mudah dipahami siswa)
- Untuk PAI: sertakan teks Arab jika diperlukan dengan format: [Arab: النص العربي]
- Desain yang menarik dengan instruksi jelas</div>
                    </div>

                    <!-- Data Siswa Generator -->
                    <div class="border border-gray-200 rounded-xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <h4 class="font-medium text-gray-800">Format Data Siswa untuk Import</h4>
                                <p class="text-sm text-gray-500 mt-1">Panduan format CSV untuk import data siswa</p>
                            </div>
                            <button onclick="copyPrompt('siswa')" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto" id="promptSiswa">Format CSV untuk import data siswa:

nisn;nama;jenis_kelamin;kelas;rombel

Contoh:
0012345678;Ahmad Fauzi;L;7;A
0012345679;Siti Aisyah;P;7;A
0012345680;Budi Santoso;L;7;B
0012345681;Dewi Lestari;P;7;B

Keterangan:
- nisn: Nomor Induk Siswa Nasional (10 digit)
- nama: Nama lengkap siswa
- jenis_kelamin: L (Laki-laki) atau P (Perempuan)
- kelas: Angka kelas (1-12)
- rombel: Huruf rombel (A, B, C, dst)

Tips:
1. Buka file Excel data siswa Anda
2. Pastikan kolom sesuai urutan di atas
3. Simpan sebagai CSV (Save As > CSV UTF-8)
4. Atau gunakan Google Spreadsheet > File > Share > Publish to web > CSV</div>
                    </div>
                </div>
            </div>

            <!-- Quick Tips -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 class="font-semibold text-green-800 mb-2">
                        <i class="fas fa-check-circle mr-2"></i>Tips Prompt Efektif
                    </h4>
                    <ul class="text-sm text-green-700 space-y-1">
                        <li>• Berikan konteks lengkap (mapel, kelas, semester)</li>
                        <li>• Jelaskan format output yang diinginkan</li>
                        <li>• Minta AI untuk tidak menambahkan penjelasan</li>
                        <li>• Review dan edit hasil sebelum import</li>
                    </ul>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 class="font-semibold text-yellow-800 mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Perhatian
                    </h4>
                    <ul class="text-sm text-yellow-700 space-y-1">
                        <li>• Selalu periksa keakuratan hasil AI</li>
                        <li>• Sesuaikan dengan kondisi sekolah/daerah</li>
                        <li>• Pastikan format CSV benar sebelum import</li>
                        <li>• Backup data sebelum import massal</li>
                    </ul>
                </div>
            </div>

            <!-- AI Recommendations -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-semibold text-gray-800 mb-4">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>Rekomendasi AI
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="https://chat.openai.com" target="_blank" class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" alt="ChatGPT" class="w-10 h-10">
                        <div>
                            <p class="font-medium text-gray-800">ChatGPT</p>
                            <p class="text-xs text-gray-500">OpenAI</p>
                        </div>
                    </a>
                    <a href="https://claude.ai" target="_blank" class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all">
                        <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span class="text-orange-600 font-bold">C</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">Claude</p>
                            <p class="text-xs text-gray-500">Anthropic</p>
                        </div>
                    </a>
                    <a href="https://gemini.google.com" target="_blank" class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">G</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">Gemini</p>
                            <p class="text-xs text-gray-500">Google</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function copyPrompt(type) {
    let text = '';
    let promptId = '';
    
    switch(type) {
        case 'mapelcsv':
            promptId = 'promptMapelCSV';
            break;
        case 'mapelfull':
            promptId = 'promptMapelFull';
            break;
        case 'cptp':
            promptId = 'promptCPTP';
            break;
        case 'soal':
            promptId = 'promptSoal';
            break;
        case 'lkpd':
            promptId = 'promptLKPD';
            break;
        case 'siswa':
            promptId = 'promptSiswa';
            break;
        default:
            return;
    }
    
    text = document.getElementById(promptId).textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Prompt berhasil dicopy! Paste ke AI pilihan Anda.', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Prompt berhasil dicopy!', 'success');
    });
}
// =====================================================
// STUDENTS MODULE
// =====================================================
function renderStudents() {
    const contentArea = document.getElementById('contentArea');
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Data Siswa</h2>
                        <p class="text-gray-500 text-sm mt-1">Kelola data siswa per kelas dan rombel</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="showImportStudentsModal()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-file-import mr-2"></i>Import CSV
                        </button>
                        <button onclick="addStudent()" class="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-plus mr-2"></i>Tambah Siswa
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <select id="studentKelas" onchange="loadStudents()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Semua Kelas</option>
                            ${(JENJANG_PENDIDIKAN[currentUserData?.jenjang]?.kelas || []).map(k => `<option value="${k}">Kelas ${k}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rombel</label>
                        <select id="studentRombel" onchange="loadStudents()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Semua Rombel</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Cari</label>
                        <input type="text" id="studentSearch" placeholder="Cari nama/NISN..." oninput="loadStudents()"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>
                </div>
            </div>

            <!-- Students Table -->
            <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-12">No</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NISN</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Siswa</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-16">L/P</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-20">Kelas</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-20">Rombel</th>
                                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="studentsTableBody" class="divide-y divide-gray-100">
                            <tr>
                                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                                    <i class="fas fa-users text-4xl text-gray-300 mb-3 block"></i>
                                    Memuat data siswa...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Import Students Modal -->
        <div id="importStudentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] hidden">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 modal-enter">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-gray-800">Import Data Siswa</h3>
                        <button onclick="closeImportStudentsModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="mb-6">
                        <h4 class="font-medium text-gray-800 mb-2">Format CSV yang Diterima:</h4>
                        <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                            <p class="text-gray-600">nisn;nama;jenis_kelamin;kelas;rombel</p>
                            <p class="text-gray-500">0012345678;Ahmad Fauzi;L;7;A</p>
                            <p class="text-gray-500">0012345679;Siti Aisyah;P;7;A</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL Google Spreadsheet (Published CSV)</label>
                            <input type="url" id="studentsURLInput" placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <p class="text-xs text-gray-500 mt-1">Publish spreadsheet sebagai CSV: File > Share > Publish to web > CSV</p>
                        </div>
                        
                        <div class="text-center text-gray-500">atau</div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Upload File CSV</label>
                            <input type="file" id="studentsFileInput" accept=".csv" 
                                class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none">
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end gap-3">
                        <button onclick="closeImportStudentsModal()" class="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            Batal
                        </button>
                        <button onclick="importStudents()" class="px-4 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-upload mr-2"></i>Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadStudents();
}

function showImportStudentsModal() {
    document.getElementById('importStudentsModal').classList.remove('hidden');
}

function closeImportStudentsModal() {
    document.getElementById('importStudentsModal').classList.add('hidden');
}

async function loadStudents() {
    const kelas = document.getElementById('studentKelas')?.value;
    const rombel = document.getElementById('studentRombel')?.value;
    const search = document.getElementById('studentSearch')?.value?.toLowerCase();
    const tahunAjar = getSelectedAcademicYear();
    
    try {
        let query = db.collection('users').doc(currentUser.uid)
            .collection('students');
        
        const snapshot = await query.get();
        let students = [];
        
        snapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() });
        });
        
        // Filter
        if (kelas) {
            students = students.filter(s => s.kelas == kelas);
        }
        if (rombel) {
            students = students.filter(s => s.rombel === rombel);
        }
        if (search) {
            students = students.filter(s => 
                s.nama?.toLowerCase().includes(search) || 
                s.nisn?.toLowerCase().includes(search)
            );
        }
        
        // Sort
        students.sort((a, b) => {
            if (a.kelas !== b.kelas) return parseInt(a.kelas) - parseInt(b.kelas);
            if (a.rombel !== b.rombel) return a.rombel.localeCompare(b.rombel);
            return a.nama.localeCompare(b.nama);
        });
        
        renderStudentsTable(students);
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Gagal memuat data siswa', 'error');
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-12 text-center text-gray-500">
                    <i class="fas fa-users text-4xl text-gray-300 mb-3 block"></i>
                    Belum ada data siswa
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = students.map((student, index) => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-600">${index + 1}</td>
            <td class="px-4 py-3 text-sm text-gray-800">${student.nisn || '-'}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-800">${student.nama}</td>
            <td class="px-4 py-3 text-sm text-center">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${student.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}">
                    ${student.jenis_kelamin}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-center">${student.kelas}</td>
            <td class="px-4 py-3 text-sm text-center">${student.rombel}</td>
            <td class="px-4 py-3 text-center">
                <button onclick="editStudent('${student.id}')" class="p-2 text-blue-500 hover:bg-blue-50 rounded transition-all" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded transition-all" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function importStudents() {
    const urlInput = document.getElementById('studentsURLInput');
    const fileInput = document.getElementById('studentsFileInput');
    
    showLoading();
    
    try {
        let csvText = '';
        
        if (urlInput.value) {
            const response = await fetch(urlInput.value);
            csvText = await response.text();
        } else if (fileInput.files.length > 0) {
            csvText = await fileInput.files[0].text();
        } else {
            showToast('Masukkan URL atau pilih file', 'warning');
            hideLoading();
            return;
        }
        
        const parsed = parseCSV(csvText);
        
        if (parsed.data.length > 0) {
            // Batch write to Firestore
            const batch = db.batch();
            
            parsed.data.forEach(student => {
                const docRef = db.collection('users').doc(currentUser.uid)
                    .collection('students').doc();
                
                batch.set(docRef, {
                    nisn: student.nisn || '',
                    nama: student.nama || student['nama siswa'] || '',
                    jenis_kelamin: student.jenis_kelamin || student['L/P'] || '',
                    kelas: student.kelas || '',
                    rombel: student.rombel || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            
            closeImportStudentsModal();
            loadStudents();
            
            showToast(`${parsed.data.length} siswa berhasil diimport`, 'success');
        } else {
            showToast('Tidak ada data yang dapat diimport', 'warning');
        }
    } catch (error) {
        console.error('Error importing students:', error);
        showToast('Gagal mengimport data', 'error');
    }
    
    hideLoading();
}

async function deleteStudent(studentId) {
    if (!confirm('Yakin ingin menghapus data siswa ini?')) return;
    
    showLoading();
    
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('students').doc(studentId).delete();
        
        loadStudents();
        showToast('Data siswa berhasil dihapus', 'success');
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Gagal menghapus data', 'error');
    }
    
    hideLoading();
}

// =====================================================
// PROMES MODULE (dengan Tanggal Pertemuan Reel)
// =====================================================
function renderPromes() {
    const contentArea = document.getElementById('contentArea');
    const subjects = currentUserData?.mataPelajaran || [];
    const semester = getSelectedSemester();
    const tahunAjar = getSelectedAcademicYearDisplay();
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Program Semester (PROMES)</h2>
                        <p class="text-gray-500 text-sm mt-1">
                            Sinkron dengan Kalender, Jadwal, dan TP - <strong>Semester ${semester}</strong>
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="printPromes()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
                            <i class="fas fa-print mr-2"></i>Cetak
                        </button>
                        <button onclick="downloadPromesCSV()" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all">
                            <i class="fas fa-file-csv mr-2"></i>Download CSV
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                        <select id="promesSubject" onchange="generatePromes()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih Mata Pelajaran...</option>
                            ${subjects.map(s => `<option value="${s.nama}">${s.nama}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                        <select id="promesKelas" onchange="generatePromes()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih Kelas...</option>
                            ${(JENJANG_PENDIDIKAN[currentUserData?.jenjang]?.kelas || []).map(k => `<option value="${k}">Kelas ${k}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Rombel</label>
                        <input type="text" id="promesRombel" value="A" onchange="generatePromes()"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Hari Mengajar</label>
                        <select id="promesHari" onchange="generatePromes()" 
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                            <option value="">Pilih dari Jadwal...</option>
                            ${HARI.map(h => `<option value="${h}">${h}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Alokasi JP per Pertemuan</label>
                        <input type="number" id="promesJPPertemuan" value="4" min="1" max="8" onchange="generatePromes()"
                            class="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>
                    <div class="flex items-end">
                        <button onclick="loadScheduleForPromes()" class="px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all">
                            <i class="fas fa-sync mr-2"></i>Load dari Jadwal
                        </button>
                    </div>
                </div>
            </div>

            <!-- Promes Content -->
            <div id="promesContent" class="bg-white rounded-xl shadow-sm overflow-x-auto">
                <div class="p-12 text-center">
                    <i class="fas fa-calendar-week text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Pilih Mata Pelajaran, Kelas, dan Hari Mengajar</h3>
                    <p class="text-gray-500 mt-2">PROMES akan di-generate dengan distribusi tanggal pertemuan yang reel</p>
                </div>
            </div>
        </div>
    `;
}

async function loadScheduleForPromes() {
    const subject = document.getElementById('promesSubject').value;
    const kelas = document.getElementById('promesKelas').value;
    
    if (!subject || !kelas) {
        showToast('Pilih Mata Pelajaran dan Kelas terlebih dahulu', 'warning');
        return;
    }
    
    try {
        const tahunAjar = getSelectedAcademicYear();
        const scheduleDoc = await db.collection('users').doc(currentUser.uid)
            .collection('schedules').doc(tahunAjar).get();
        
        if (scheduleDoc.exists) {
            const data = scheduleDoc.data();
            const entries = (data.entries || []).filter(e => 
                e.mataPelajaran === subject && e.kelas == kelas
            );
            
            if (entries.length > 0) {
                // Get the day from schedule
                const firstEntry = entries[0];
                document.getElementById('promesHari').value = firstEntry.hari;
                document.getElementById('promesJPPertemuan').value = firstEntry.jamPelajaran || 4;
                document.getElementById('promesRombel').value = firstEntry.rombel || 'A';
                
                generatePromes();
                showToast('Data jadwal berhasil dimuat', 'success');
            } else {
                showToast('Tidak ditemukan jadwal untuk mata pelajaran dan kelas ini', 'warning');
            }
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
        showToast('Gagal memuat jadwal', 'error');
    }
}

async function generatePromes() {
    const subject = document.getElementById('promesSubject').value;
    const kelas = document.getElementById('promesKelas').value;
    const rombel = document.getElementById('promesRombel').value || 'A';
    const hariMengajar = document.getElementById('promesHari').value;
    const jpPerPertemuan = parseInt(document.getElementById('promesJPPertemuan').value) || 4;
    const semester = getSelectedSemester();
    
    if (!subject || !kelas || !hariMengajar) {
        return;
    }
    
    showLoading();
    
    try {
        const tahunAjar = getSelectedAcademicYear();
        const docId = subject.replace(/[\/\\]/g, '_');
        const startYear = getStartYear(tahunAjar);
        
        // Load CP data
        const cpDoc = await db.collection('users').doc(currentUser.uid)
            .collection('curriculum').doc(docId).get();
        
        // Load Calendar data
        const calendarDoc = await db.collection('users').doc(currentUser.uid)
            .collection('calendars').doc(tahunAjar).get();
        
        let cpData = [];
        let calendarData = null;
        
        if (cpDoc.exists) {
            cpData = cpDoc.data().items || [];
            cpData = cpData.filter(item => item.Kelas == kelas && item.Semester === semester);
            cpData.sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
        }
        
        if (calendarDoc.exists) {
            calendarData = calendarDoc.data();
        }
        
        if (cpData.length === 0) {
            document.getElementById('promesContent').innerHTML = `
                <div class="p-12 text-center">
                    <i class="fas fa-exclamation-triangle text-6xl text-yellow-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600">Data TP Belum Tersedia</h3>
                    <p class="text-gray-500 mt-2">Silakan input CP/TP untuk semester ${semester} di menu CP & TP</p>
                    <button onclick="loadModule('curriculum')" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
                        <i class="fas fa-arrow-right mr-2"></i>Ke Menu CP & TP
                    </button>
                </div>
            `;
            hideLoading();
            return;
        }
        
        // Get semester dates
        const jenjang = currentUserData?.jenjang || 'SD';
        const kelasAkhir = JENJANG_PENDIDIKAN[jenjang]?.kelasAkhir || 6;
        const isKelasAkhir = parseInt(kelas) === kelasAkhir;
        
        let semesterStart, semesterEnd;
        
        if (semester === 'Ganjil') {
            semesterStart = isKelasAkhir && calendarData?.finalGanjilStart 
                ? calendarData.finalGanjilStart 
                : (calendarData?.ganjilStart || `${startYear}-07-15`);
            semesterEnd = isKelasAkhir && calendarData?.finalGanjilEnd 
                ? calendarData.finalGanjilEnd 
                : (calendarData?.ganjilEnd || `${startYear}-12-20`);
        } else {
            semesterStart = isKelasAkhir && calendarData?.finalGenapStart 
                ? calendarData.finalGenapStart 
                : (calendarData?.genapStart || `${startYear + 1}-01-06`);
            semesterEnd = isKelasAkhir && calendarData?.finalGenapEnd 
                ? calendarData.finalGenapEnd 
                : (calendarData?.genapEnd || `${startYear + 1}-06-20`);
        }
        
        // Get all holidays
        const holidays = getAllHolidayDates(calendarData);
        
        // Get all teaching dates for this day
        const dayIndex = getDayIndex(hariMengajar);
        const teachingDates = getTeachingDates([dayIndex], semesterStart, semesterEnd, holidays);
        
        // Distribute TP across teaching dates
        const promesData = distributeTPToMeetings(cpData, teachingDates, jpPerPertemuan);
        
        renderPromesDocument(
            subject, kelas, rombel, semester, hariMengajar, jpPerPertemuan,
            promesData, teachingDates, semesterStart, semesterEnd, startYear, isKelasAkhir
        );
        
    } catch (error) {
        console.error('Error generating Promes:', error);
        showToast('Gagal generate PROMES: ' + error.message, 'error');
    }
    
    hideLoading();
}

/**
 * Distribute TP to meetings based on JP allocation
 * @param {Array} tpData - Array of TP objects
 * @param {Array} teachingDates - Array of Date objects
 * @param {number} jpPerMeeting - JP per meeting
 * @returns {Array} Array of meeting allocations
 */
function distributeTPToMeetings(tpData, teachingDates, jpPerMeeting) {
    const meetings = [];
    let dateIndex = 0;
    let remainingJPInMeeting = jpPerMeeting;
    
    // Skip first few dates (biasanya untuk orientasi)
    dateIndex = Math.min(1, teachingDates.length - 1);
    
    tpData.forEach(tp => {
        let remainingTPJP = parseInt(tp.alokasiWaktu) || 2;
        const tpMeetings = [];
        
        while (remainingTPJP > 0 && dateIndex < teachingDates.length) {
            if (remainingJPInMeeting <= 0) {
                dateIndex++;
                remainingJPInMeeting = jpPerMeeting;
                if (dateIndex >= teachingDates.length) break;
            }
            
            const currentDate = teachingDates[dateIndex];
            const jpToAllocate = Math.min(remainingTPJP, remainingJPInMeeting);
            
            tpMeetings.push({
                date: currentDate,
                jp: jpToAllocate
            });
            
            remainingTPJP -= jpToAllocate;
            remainingJPInMeeting -= jpToAllocate;
        }
        
        meetings.push({
            tp: tp,
            allocations: tpMeetings,
            totalJP: parseInt(tp.alokasiWaktu) || 2
        });
    });
    
    return meetings;
}

function renderPromesDocument(subject, kelas, rombel, semester, hari, jpPerPertemuan, promesData, teachingDates, semesterStart, semesterEnd, startYear, isKelasAkhir) {
    const container = document.getElementById('promesContent');
    const tahunAjar = getSelectedAcademicYearDisplay();
    const fase = getFaseFromKelas(kelas);
    
    // Get months for this semester
    const months = getMonthsInSemester(semester, startYear);
    
    // Build header with weeks per month
    let headerRow1 = `
        <th rowspan="2" class="border border-gray-400 px-2 py-2 text-center bg-gray-100" style="width: 4%;">No</th>
        <th rowspan="2" class="border border-gray-400 px-2 py-2 text-left bg-gray-100" style="width: 30%;">Capaian / Tujuan Pembelajaran</th>
        <th rowspan="2" class="border border-gray-400 px-2 py-2 text-center bg-gray-100" style="width: 4%;">JP</th>
    `;
    let headerRow2 = '';
    
    months.forEach(m => {
        headerRow1 += `<th colspan="5" class="border border-gray-400 px-2 py-1 text-center bg-gray-100">${m.shortName}</th>`;
        for (let w = 1; w <= 5; w++) {
            headerRow2 += `<th class="border border-gray-400 px-1 py-1 text-center bg-gray-50" style="width: 2%;">${w}</th>`;
        }
    });
    
    // Build body rows
    let bodyRows = '';
    let no = 1;
    
    promesData.forEach(item => {
        const tp = item.tp;
        const allocations = item.allocations;
        
        bodyRows += `<tr>`;
        bodyRows += `<td class="border border-gray-400 px-2 py-2 text-center align-top">${no}</td>`;
        bodyRows += `<td class="border border-gray-400 px-2 py-2 text-left align-top">
            <div class="font-medium text-sm">${tp.Elemen || tp.materiPokok || '-'}</div>
            <div class="text-xs text-gray-600 mt-1">${tp['Tujuan Pembelajaran'] || '-'}</div>
        </td>`;
        bodyRows += `<td class="border border-gray-400 px-2 py-2 text-center align-top font-bold">${item.totalJP}</td>`;
        
        // Fill cells for each week of each month
        months.forEach(m => {
            for (let w = 1; w <= 5; w++) {
                // Find allocations in this month and week
                const cellAllocations = allocations.filter(a => {
                    const aMonth = a.date.getMonth();
                    const aYear = a.date.getFullYear();
                    const aWeek = getWeekOfMonth(a.date);
                    return aMonth === m.month && aYear === m.year && aWeek === w;
                });
                
                if (cellAllocations.length > 0) {
                    const totalJP = cellAllocations.reduce((sum, a) => sum + a.jp, 0);
                    const dates = cellAllocations.map(a => a.date.getDate()).join(',');
                    
                    bodyRows += `
                        <td class="border border-gray-400 px-1 py-1 text-center" style="background-color: #e3f2fd;">
                            <span class="font-bold text-blue-800" style="font-size: 10pt;">${totalJP}</span>
                            <span class="block text-red-600 font-bold" style="font-size: 7pt;">(${dates})</span>
                        </td>
                    `;
                } else {
                    bodyRows += `<td class="border border-gray-400 px-1 py-1"></td>`;
                }
            }
        });
        
        bodyRows += `</tr>`;
        no++;
    });
    
    // Add summary row
    const totalJP = promesData.reduce((sum, item) => sum + item.totalJP, 0);
    const totalMeetings = teachingDates.length;
    
    bodyRows += `
        <tr style="background-color: #f8f9fa;">
            <td colspan="3" class="border border-gray-400 px-3 py-2 text-left font-bold">
                Total: ${totalJP} JP | Pertemuan Efektif: ${totalMeetings} hari
            </td>
            <td colspan="${months.length * 5}" class="border border-gray-400 px-3 py-2 text-left text-xs text-gray-600">
                <em>Tanggal (merah) = tanggal pertemuan reel berdasarkan kalender dan jadwal. Sesuaikan dengan kalender sekolah.</em>
            </td>
        </tr>
    `;
    
    container.innerHTML = `
        <div id="promesPrintArea" class="p-6" style="font-family: 'Times New Roman', serif; font-size: 10pt;">
            <!-- Document Header -->
            <div class="text-center mb-4">
                <h1 class="font-bold" style="font-size: 13pt;">PROGRAM SEMESTER (PROMES)</h1>
                <h2 class="font-bold" style="font-size: 12pt;">SEMESTER ${semester.toUpperCase()}</h2>
            </div>

            <!-- Identity Table -->
            <table class="mb-4" style="font-size: 10pt;">
                <tr>
                    <td style="width: 140px; padding: 2px 0;">Satuan Pendidikan</td>
                    <td style="width: 10px;">:</td>
                    <td><strong>${currentUserData?.namaSekolah || '-'}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Mata Pelajaran</td>
                    <td>:</td>
                    <td>${subject}</td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Fase / Kelas</td>
                    <td>:</td>
                    <td>Fase ${fase} / Kelas ${kelas} / ${rombel}</td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Tahun Pelajaran</td>
                    <td>:</td>
                    <td>${tahunAjar}</td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Hari Efektif KBM</td>
                    <td>:</td>
                    <td style="color: #c0392b;"><strong>Setiap Hari ${hari} (${jpPerPertemuan} JP/pertemuan)</strong></td>
                </tr>
                ${isKelasAkhir ? `
                <tr>
                    <td style="padding: 2px 0;">Catatan</td>
                    <td>:</td>
                    <td style="color: #e67e22;"><em>Kelas akhir jenjang - waktu efektif dipercepat</em></td>
                </tr>
                ` : ''}
            </table>

            <!-- Promes Table -->
            <table class="w-full border-collapse" style="font-size: 9pt;">
                <thead>
                    <tr>${headerRow1}</tr>
                    <tr>${headerRow2}</tr>
                </thead>
                <tbody>
                    ${bodyRows}
                </tbody>
            </table>

            <!-- Signature Area -->
            <div class="flex justify-between mt-8" style="font-size: 10pt;">
                <div class="text-center" style="width: 45%;">
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <div style="height: 60px;"></div>
                    <p class="font-bold" style="text-decoration: underline;">${currentUserData?.namaKepalaSekolah || '...........................'}</p>
                    <p>NIP. ${currentUserData?.nipKepalaSekolah || '...........................'}</p>
                </div>
                <div class="text-center" style="width: 45%;">
                    <p>${currentUserData?.kotaKabupaten || '............'}, ${formatDateID(new Date())}</p>
                    <p>Guru Mata Pelajaran</p>
                    <div style="height: 60px;"></div>
                    <p class="font-bold" style="text-decoration: underline;">${currentUserData?.displayName || '...........................'}</p>
                    <p>NIP. ${currentUserData?.nip || '...........................'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Store data for export
    window.promesData = { subject, kelas, rombel, semester, promesData, teachingDates, months };
}

function printPromes() {
    printElement('promesPrintArea', 'Program Semester');
}

function downloadPromesCSV() {
    if (!window.promesData) {
        showToast('Generate PROMES terlebih dahulu', 'warning');
        return;
    }
    
    const { subject, kelas, rombel, semester, promesData, teachingDates, months } = window.promesData;
    const rows = [];
    
    // Header
    let header = ['No', 'Elemen/Bab', 'Tujuan Pembelajaran', 'Total JP'];
    months.forEach(m => {
        for (let w = 1; w <= 5; w++) {
            header.push(`${m.shortName}-M${w}`);
        }
    });
    rows.push(header);
    
    // Data
    let no = 1;
    promesData.forEach(item => {
        const tp = item.tp;
        let row = [
            no,
            tp.Elemen || tp.materiPokok || '',
            tp['Tujuan Pembelajaran'] || '',
            item.totalJP
        ];
        
        months.forEach(m => {
            for (let w = 1; w <= 5; w++) {
                const cellAllocations = item.allocations.filter(a => {
                    const aMonth = a.date.getMonth();
                    const aYear = a.date.getFullYear();
                    const aWeek = getWeekOfMonth(a.date);
                    return aMonth === m.month && aYear === m.year && aWeek === w;
                });
                
                if (cellAllocations.length > 0) {
                    const jp = cellAllocations.reduce((sum, a) => sum + a.jp, 0);
                    const dates = cellAllocations.map(a => a.date.getDate()).join('/');
                    row.push(`${jp}JP (tgl ${dates})`);
                } else {
                    row.push('');
                }
            }
        });
        
        rows.push(row);
        no++;
    });
    
    const csv = rows.map(row => row.join(';')).join('\n');
    downloadFile(csv, `PROMES_${subject}_Kelas${kelas}_${semester}.csv`);
    showToast('PROMES berhasil di-download', 'success');
}
function renderModulAjar() {
    renderPremiumPlaceholder('Modul Ajar', 'Modul Ajar terintegrasi dengan Jurnal dan LKPD');
}

function renderLKPD() {
    renderPremiumPlaceholder('LKPD', 'Lembar Kerja Peserta Didik dengan dukungan teks Arab');
}

function renderBankSoal() {
    renderPremiumPlaceholder('Bank Soal', 'Bank Soal terintegrasi dengan ATP');
}

function renderJournal() {
    renderPremiumPlaceholder('Jurnal', 'Jurnal Pembelajaran sinkron dengan absen dan promes');
}

function renderAttendance() {
    renderPremiumPlaceholder('Absensi', 'Absensi manual yang otomatis menjadi data jurnal');
}

function renderGrades() {
    renderPremiumPlaceholder('Daftar Nilai', 'PH, PTS, PAS hingga Nilai Raport');
}

function renderKKTP() {
    renderPremiumPlaceholder('KKTP', 'Kriteria Ketercapaian Tujuan Pembelajaran');
}

function renderPremiumPlaceholder(title, description) {
    const contentArea = document.getElementById('contentArea');
    
    if (currentSubscription === 'premium') {
        // Show actual content for premium users
        contentArea.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">${title}</h2>
                <p class="text-gray-600">Fitur ${title} - dalam pengembangan</p>
            </div>
        `;
    } else {
        // Show upgrade prompt for free users
        contentArea.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <div class="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-crown text-white text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${title}</h2>
                <p class="text-gray-600 mb-6">${description}</p>
                <p class="text-gray-500 mb-8">Fitur ini tersedia untuk pengguna Premium</p>
                <button onclick="showUpgradeModal()" class="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg">
                    <i class="fas fa-crown mr-2"></i>Upgrade ke Premium
                </button>
            </div>
        `;
    }
}

console.log('App Module Loaded');