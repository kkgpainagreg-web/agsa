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
    defaultWhatsApp: '6281234567890', // Default WhatsApp for upgrade
    freeFeatures: ['calendar', 'schedule', 'atp', 'prota', 'profile'],
    premiumFeatures: ['promes', 'modul-ajar', 'lkpd', 'bank-soal', 'journal', 'attendance', 'grades', 'kktp'],
};

// Jenjang Pendidikan
const JENJANG_PENDIDIKAN = {
    SD: {
        name: 'SD/MI',
        kelas: [1, 2, 3, 4, 5, 6],
        durasiJam: 35, // menit
        faseMapping: { 1: 'A', 2: 'A', 3: 'B', 4: 'B', 5: 'C', 6: 'C' }
    },
    SMP: {
        name: 'SMP/MTs',
        kelas: [7, 8, 9],
        durasiJam: 40, // menit
        faseMapping: { 7: 'D', 8: 'D', 9: 'D' }
    },
    SMA: {
        name: 'SMA/MA/SMK',
        kelas: [10, 11, 12],
        durasiJam: 45, // menit
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

// Elemen PAI
const ELEMEN_PAI = [
    'Al-Qur\'an Hadis',
    'Akidah',
    'Akhlak',
    'Fikih',
    'Sejarah Peradaban Islam'
];

// Helper Functions for Academic Year
function getAcademicYears() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    let years = [];
    
    if (currentMonth >= 7) {
        // Setelah Juli: tahun ini/tahun depan
        years.push(`${currentYear}/${currentYear + 1}`);
        years.push(`${currentYear + 1}/${currentYear + 2}`);
    } else if (currentMonth >= 6) {
        // Juni: transisi
        years.push(`${currentYear - 1}/${currentYear}`);
        years.push(`${currentYear}/${currentYear + 1}`);
    } else {
        // Januari-Mei: tahun lalu/tahun ini
        years.push(`${currentYear - 1}/${currentYear}`);
        years.push(`${currentYear}/${currentYear + 1}`);
    }
    
    return years;
}

function getCurrentSemester() {
    const now = new Date();
    const month = now.getMonth() + 1;
    // Ganjil: Juli-Desember, Genap: Januari-Juni
    return (month >= 7 && month <= 12) ? 'Ganjil' : 'Genap';
}

// Hari Libur Nasional Tetap (Baku)
const HARI_LIBUR_BAKU = [
    { tanggal: '01-01', nama: 'Tahun Baru Masehi' },
    { tanggal: '05-01', nama: 'Hari Buruh Internasional' },
    { tanggal: '06-01', nama: 'Hari Lahir Pancasila' },
    { tanggal: '08-17', nama: 'Hari Kemerdekaan RI' },
    { tanggal: '12-25', nama: 'Hari Natal' }
];

// Hari Libur Default Tidak Tetap (Bisa diubah)
function getDefaultLiburTidakTetap(tahunAjar) {
    const tahunAwal = parseInt(tahunAjar.split('/')[0]);
    return [
        { tanggal: `${tahunAwal}-01-22`, nama: 'Tahun Baru Imlek' },
        { tanggal: `${tahunAwal}-03-29`, nama: 'Hari Raya Nyepi' },
        { tanggal: `${tahunAwal}-03-31`, nama: 'Idul Fitri 1446 H' },
        { tanggal: `${tahunAwal}-04-01`, nama: 'Idul Fitri 1446 H' },
        { tanggal: `${tahunAwal}-04-18`, nama: 'Jumat Agung' },
        { tanggal: `${tahunAwal}-05-12`, nama: 'Hari Raya Waisak' },
        { tanggal: `${tahunAwal}-05-29`, nama: 'Kenaikan Isa Almasih' },
        { tanggal: `${tahunAwal}-06-07`, nama: 'Idul Adha 1446 H' },
        { tanggal: `${tahunAwal}-06-27`, nama: 'Tahun Baru Hijriyah 1447 H' },
        { tanggal: `${tahunAwal}-09-05`, nama: 'Maulid Nabi Muhammad SAW' },
    ];
}

console.log('Firebase Config Loaded Successfully');
console.log('Academic Years Available:', getAcademicYears());
console.log('Current Semester:', getCurrentSemester());