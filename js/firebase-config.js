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
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Super Admin Email
const SUPER_ADMIN_EMAIL = 'afifaro@gmail.com';

// App Constants
const APP_CONFIG = {
    version: '1.0.0',
    appName: 'ADMIN GURU SUPER APP',
    defaultWhatsApp: '6281234567890',
    freeFeatures: ['calendar', 'schedule', 'atp', 'prota', 'profile', 'curriculum', 'dashboard', 'ai-assistant', 'students'],
    premiumFeatures: ['promes', 'modul-ajar', 'lkpd', 'bank-soal', 'journal', 'attendance', 'grades', 'kktp'],
};

// Jenjang Pendidikan
const JENJANG_PENDIDIKAN = {
    SD: {
        name: 'SD/MI',
        kelas: [1, 2, 3, 4, 5, 6],
        kelasAkhir: 6,
        durasiJam: 35,
        faseMapping: { 1: 'A', 2: 'A', 3: 'B', 4: 'B', 5: 'C', 6: 'C' }
    },
    SMP: {
        name: 'SMP/MTs',
        kelas: [7, 8, 9],
        kelasAkhir: 9,
        durasiJam: 40,
        faseMapping: { 7: 'D', 8: 'D', 9: 'D' }
    },
    SMA: {
        name: 'SMA/MA/SMK',
        kelas: [10, 11, 12],
        kelasAkhir: 12,
        durasiJam: 45,
        faseMapping: { 10: 'E', 11: 'F', 12: 'F' }
    }
};

// 8 Dimensi Profil Lulusan
const DIMENSI_PROFIL_LULUSAN = [
    { id: 'keimanan', name: 'Keimanan', icon: 'fa-mosque', color: 'green' },
    { id: 'kewargaan', name: 'Kewargaan', icon: 'fa-flag', color: 'red' },
    { id: 'penalaran-kritis', name: 'Penalaran Kritis', icon: 'fa-brain', color: 'purple' },
    { id: 'kreativitas', name: 'Kreativitas', icon: 'fa-lightbulb', color: 'yellow' },
    { id: 'kolaborasi', name: 'Kolaborasi', icon: 'fa-users', color: 'blue' },
    { id: 'kemandirian', name: 'Kemandirian', icon: 'fa-user-check', color: 'indigo' },
    { id: 'kesehatan', name: 'Kesehatan', icon: 'fa-heart', color: 'pink' },
    { id: 'komunikasi', name: 'Komunikasi', icon: 'fa-comments', color: 'cyan' }
];

// Hari dalam Seminggu
const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const HARI_INDEX = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 0 };

// Nama Bulan
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const NAMA_BULAN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Elemen PAI
const ELEMEN_PAI = [
    'Al-Qur\'an Hadis',
    'Akidah',
    'Akhlak',
    'Fikih',
    'Sejarah Peradaban Islam'
];

// ============================================
// HELPER FUNCTIONS - ACADEMIC YEAR (FIXED)
// ============================================

/**
 * Get available academic years based on current date
 * @returns {Array} Array of academic year strings like ["2024-2025", "2025-2026"]
 */
function getAcademicYears() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    let years = [];
    
    if (currentMonth >= 7) {
        // Setelah Juli: tahun ini/tahun depan aktif
        years.push(`${currentYear}-${currentYear + 1}`);
        years.push(`${currentYear + 1}-${currentYear + 2}`);
    } else if (currentMonth >= 6) {
        // Juni: transisi, tampilkan dua opsi
        years.push(`${currentYear - 1}-${currentYear}`);
        years.push(`${currentYear}-${currentYear + 1}`);
    } else {
        // Januari-Mei: tahun lalu/tahun ini masih aktif
        years.push(`${currentYear - 1}-${currentYear}`);
        years.push(`${currentYear}-${currentYear + 1}`);
    }
    
    return years;
}

/**
 * Get display format for academic year (untuk tampilan UI)
 * @param {string} yearId - Format "2025-2026"
 * @returns {string} Format "2025/2026" untuk display
 */
function formatAcademicYearDisplay(yearId) {
    return yearId.replace('-', '/');
}

/**
 * Get document ID format for academic year (untuk Firestore)
 * @param {string} yearDisplay - Format "2025/2026" atau "2025-2026"
 * @returns {string} Format "2025-2026" untuk document ID
 */
function formatAcademicYearDocId(yearDisplay) {
    return yearDisplay.replace('/', '-');
}

/**
 * Get start year from academic year string
 * @param {string} academicYear - "2025-2026" atau "2025/2026"
 * @returns {number} 2025
 */
function getStartYear(academicYear) {
    return parseInt(academicYear.split(/[-\/]/)[0]);
}

/**
 * Get end year from academic year string
 * @param {string} academicYear - "2025-2026" atau "2025/2026"
 * @returns {number} 2026
 */
function getEndYear(academicYear) {
    return parseInt(academicYear.split(/[-\/]/)[1]);
}

/**
 * Get current semester based on date
 * @returns {string} "Ganjil" atau "Genap"
 */
function getCurrentSemester() {
    const now = new Date();
    const month = now.getMonth() + 1;
    // Ganjil: Juli-Desember, Genap: Januari-Juni
    return (month >= 7 && month <= 12) ? 'Ganjil' : 'Genap';
}

// ============================================
// HARI LIBUR
// ============================================

// Hari Libur Nasional Tetap (Baku) - format MM-DD
const HARI_LIBUR_BAKU = [
    { tanggal: '01-01', nama: 'Tahun Baru Masehi' },
    { tanggal: '05-01', nama: 'Hari Buruh Internasional' },
    { tanggal: '06-01', nama: 'Hari Lahir Pancasila' },
    { tanggal: '08-17', nama: 'Hari Kemerdekaan RI' },
    { tanggal: '12-25', nama: 'Hari Natal' },
    { tanggal: '12-26', nama: 'Cuti Bersama Natal' }
];

/**
 * Get default variable holidays for academic year
 * @param {string} tahunAjar - Format "2025-2026"
 * @returns {Array} Array of holiday objects
 */
function getDefaultLiburTidakTetap(tahunAjar) {
    const tahunAwal = getStartYear(tahunAjar);
    const tahunAkhir = getEndYear(tahunAjar);
    
    return [
        // Semester Ganjil (tahun awal)
        { tanggal: `${tahunAwal}-07-14`, nama: 'Libur Sebelum Tahun Ajaran Baru' },
        { tanggal: `${tahunAwal}-08-10`, nama: 'Hari Raya Kurban (perkiraan)' },
        { tanggal: `${tahunAwal}-08-11`, nama: 'Cuti Bersama Idul Adha' },
        { tanggal: `${tahunAwal}-09-01`, nama: 'Tahun Baru Hijriyah (perkiraan)' },
        { tanggal: `${tahunAwal}-11-10`, nama: 'Maulid Nabi Muhammad SAW (perkiraan)' },
        // Semester Genap (tahun akhir)
        { tanggal: `${tahunAkhir}-01-29`, nama: 'Tahun Baru Imlek (perkiraan)' },
        { tanggal: `${tahunAkhir}-03-14`, nama: 'Hari Raya Nyepi' },
        { tanggal: `${tahunAkhir}-03-29`, nama: 'Wafat Isa Al-Masih' },
        { tanggal: `${tahunAkhir}-03-31`, nama: 'Hari Raya Idul Fitri (perkiraan)' },
        { tanggal: `${tahunAkhir}-04-01`, nama: 'Hari Raya Idul Fitri (perkiraan)' },
        { tanggal: `${tahunAkhir}-04-02`, nama: 'Cuti Bersama Idul Fitri' },
        { tanggal: `${tahunAkhir}-04-03`, nama: 'Cuti Bersama Idul Fitri' },
        { tanggal: `${tahunAkhir}-04-04`, nama: 'Cuti Bersama Idul Fitri' },
        { tanggal: `${tahunAkhir}-05-01`, nama: 'Hari Buruh' },
        { tanggal: `${tahunAkhir}-05-12`, nama: 'Hari Raya Waisak (perkiraan)' },
        { tanggal: `${tahunAkhir}-05-29`, nama: 'Kenaikan Isa Almasih' }
    ];
}

/**
 * Check if a date is a holiday
 * @param {Date} date - Date object
 * @param {Array} holidays - Array of holiday date strings (YYYY-MM-DD)
 * @returns {boolean}
 */
function isHoliday(date, holidays = []) {
    const dateStr = formatDateISO(date);
    const mmdd = dateStr.substring(5); // MM-DD
    
    // Check fixed holidays
    if (HARI_LIBUR_BAKU.some(h => h.tanggal === mmdd)) {
        return true;
    }
    
    // Check variable holidays
    if (holidays.includes(dateStr)) {
        return true;
    }
    
    return false;
}

/**
 * Check if date is Sunday
 * @param {Date} date
 * @returns {boolean}
 */
function isSunday(date) {
    return date.getDay() === 0;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

console.log('Firebase Config Loaded Successfully');
console.log('Academic Years Available:', getAcademicYears());
console.log('Current Semester:', getCurrentSemester());