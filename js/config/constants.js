/**
 * AGSA - Admin Guru Super App
 * Application Constants
 * 
 * File ini berisi semua konstanta yang digunakan di aplikasi.
 * Tidak ada data yang di-hardcode di tempat lain.
 */

const AGSA_CONSTANTS = {
    // App Info
    APP: {
        NAME: 'AGSA',
        FULL_NAME: 'Admin Guru Super App',
        VERSION: '1.0.0',
        DESCRIPTION: 'Aplikasi administrasi guru dengan konsep Single Input Multi Output'
    },

    // Super Admin
    SUPER_ADMIN_EMAIL: 'afifaro@gmail.com',

    // WhatsApp Default (editable by super admin)
    WHATSAPP: {
        DEFAULT_NUMBER: '6281234567890',
        PREMIUM_MESSAGE: 'Halo, saya ingin upgrade ke AGSA Premium. Email: {email}',
        SCHOOL_MESSAGE: 'Halo, saya ingin informasi Paket Sekolah AGSA untuk {sekolah} (NPSN: {npsn})'
    },

    // Subscription Plans
    SUBSCRIPTION: {
        FREE: {
            type: 'free',
            features: ['calendar', 'schedule', 'atp', 'prota']
        },
        PREMIUM: {
            type: 'premium',
            features: ['calendar', 'schedule', 'atp', 'prota', 'promes', 'modul', 'lkpd', 'jurnal', 'kktp', 'nilai', 'soal', 'ai']
        }
    },

    // 8 Dimensi Profil Lulusan
    PROFIL_LULUSAN: [
        {
            id: 'keimanan',
            nama: 'Keimanan',
            icon: '🙏',
            deskripsi: 'Beriman dan bertakwa kepada Tuhan Yang Maha Esa',
            warna: '#8B5CF6'
        },
        {
            id: 'kewargaan',
            nama: 'Kewargaan',
            icon: '🏛️',
            deskripsi: 'Berkebinekaan global dan cinta tanah air',
            warna: '#EC4899'
        },
        {
            id: 'penalaran_kritis',
            nama: 'Penalaran Kritis',
            icon: '🧠',
            deskripsi: 'Mampu berpikir kritis dan memecahkan masalah',
            warna: '#3B82F6'
        },
        {
            id: 'kreativitas',
            nama: 'Kreativitas',
            icon: '💡',
            deskripsi: 'Mampu berinovasi dan berkreasi',
            warna: '#F59E0B'
        },
        {
            id: 'kolaborasi',
            nama: 'Kolaborasi',
            icon: '🤝',
            deskripsi: 'Mampu bekerja sama dalam tim',
            warna: '#10B981'
        },
        {
            id: 'kemandirian',
            nama: 'Kemandirian',
            icon: '🎯',
            deskripsi: 'Mampu mengambil keputusan secara mandiri',
            warna: '#6366F1'
        },
        {
            id: 'kesehatan',
            nama: 'Kesehatan',
            icon: '💪',
            deskripsi: 'Menjaga kesehatan jasmani dan rohani',
            warna: '#EF4444'
        },
        {
            id: 'komunikasi',
            nama: 'Komunikasi',
            icon: '💬',
            deskripsi: 'Mampu berkomunikasi secara efektif',
            warna: '#14B8A6'
        }
    ],

    // Jenjang Pendidikan
    JENJANG: {
        SD: {
            nama: 'Sekolah Dasar',
            singkatan: 'SD',
            kelas: ['1', '2', '3', '4', '5', '6'],
            kelasAkhir: ['6'],
            fase: {
                '1': 'A', '2': 'A',
                '3': 'B', '4': 'B',
                '5': 'C', '6': 'C'
            },
            durasiJam: 35, // menit
            rombelDefault: ['A', 'B', 'C']
        },
        SMP: {
            nama: 'Sekolah Menengah Pertama',
            singkatan: 'SMP',
            kelas: ['7', '8', '9'],
            kelasAkhir: ['9'],
            fase: {
                '7': 'D', '8': 'D', '9': 'D'
            },
            durasiJam: 40,
            rombelDefault: ['A', 'B', 'C', 'D']
        },
        SMA: {
            nama: 'Sekolah Menengah Atas',
            singkatan: 'SMA',
            kelas: ['10', '11', '12'],
            kelasAkhir: ['12'],
            fase: {
                '10': 'E', '11': 'F', '12': 'F'
            },
            durasiJam: 45,
            rombelDefault: ['A', 'B', 'C', 'D', 'E']
        },
        SMK: {
            nama: 'Sekolah Menengah Kejuruan',
            singkatan: 'SMK',
            kelas: ['10', '11', '12'],
            kelasAkhir: ['12'],
            fase: {
                '10': 'E', '11': 'F', '12': 'F'
            },
            durasiJam: 45,
            rombelDefault: ['A', 'B', 'C', 'D', 'E']
        }
    },

    // Hari
    HARI: [
        { id: 'senin', nama: 'Senin', singkatan: 'Sen', index: 1 },
        { id: 'selasa', nama: 'Selasa', singkatan: 'Sel', index: 2 },
        { id: 'rabu', nama: 'Rabu', singkatan: 'Rab', index: 3 },
        { id: 'kamis', nama: 'Kamis', singkatan: 'Kam', index: 4 },
        { id: 'jumat', nama: 'Jumat', singkatan: 'Jum', index: 5 },
        { id: 'sabtu', nama: 'Sabtu', singkatan: 'Sab', index: 6 }
    ],

    // Bulan
    BULAN: [
        { id: 1, nama: 'Januari', singkatan: 'Jan' },
        { id: 2, nama: 'Februari', singkatan: 'Feb' },
        { id: 3, nama: 'Maret', singkatan: 'Mar' },
        { id: 4, nama: 'April', singkatan: 'Apr' },
        { id: 5, nama: 'Mei', singkatan: 'Mei' },
        { id: 6, nama: 'Juni', singkatan: 'Jun' },
        { id: 7, nama: 'Juli', singkatan: 'Jul' },
        { id: 8, nama: 'Agustus', singkatan: 'Ags' },
        { id: 9, nama: 'September', singkatan: 'Sep' },
        { id: 10, nama: 'Oktober', singkatan: 'Okt' },
        { id: 11, nama: 'November', singkatan: 'Nov' },
        { id: 12, nama: 'Desember', singkatan: 'Des' }
    ],

    // Hari Libur Nasional Default (tanggal tetap)
    LIBUR_NASIONAL_DEFAULT: [
        { tanggal: 1, bulan: 1, nama: 'Tahun Baru Masehi', isFlexible: false },
        { tanggal: 1, bulan: 5, nama: 'Hari Buruh Internasional', isFlexible: false },
        { tanggal: 17, bulan: 8, nama: 'Hari Kemerdekaan RI', isFlexible: false },
        { tanggal: 1, bulan: 6, nama: 'Hari Lahir Pancasila', isFlexible: false },
        { tanggal: 25, bulan: 12, nama: 'Hari Natal', isFlexible: false },
        // Hari libur yang tanggalnya berubah (Islamic/lunar calendar)
        { tanggal: null, bulan: null, nama: 'Tahun Baru Imlek', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Isra Miraj', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Hari Raya Nyepi', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Wafat Isa Almasih', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Hari Raya Idul Fitri', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Hari Raya Waisak', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Kenaikan Isa Almasih', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Hari Raya Idul Adha', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Tahun Baru Islam', isFlexible: true },
        { tanggal: null, bulan: null, nama: 'Maulid Nabi Muhammad', isFlexible: true }
    ],

    // CSV Format
    CSV: {
        DELIMITER: ';',
        CP_HEADERS: ['Mata Pelajaran', 'Fase', 'Kelas', 'Semester', 'Bab', 'CP', 'TP', 'Profil Lulusan'],
        SISWA_HEADERS: ['NIS', 'NISN', 'Nama', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Alamat', 'Nama Orangtua', 'No HP Orangtua']
    },

    // Kriteria KKTP Default
    KRITERIA_KKTP: {
        belumBerkembang: {
            label: 'Belum Berkembang',
            singkatan: 'BB',
            min: 0,
            max: 49,
            warna: '#EF4444',
            deskripsi: 'Peserta didik belum menunjukkan kemampuan sesuai tujuan pembelajaran'
        },
        mulaiBerkembang: {
            label: 'Mulai Berkembang',
            singkatan: 'MB',
            min: 50,
            max: 69,
            warna: '#F59E0B',
            deskripsi: 'Peserta didik mulai menunjukkan kemampuan sesuai tujuan pembelajaran'
        },
        berkembangSesuaiHarapan: {
            label: 'Berkembang Sesuai Harapan',
            singkatan: 'BSH',
            min: 70,
            max: 89,
            warna: '#10B981',
            deskripsi: 'Peserta didik menunjukkan kemampuan sesuai tujuan pembelajaran'
        },
        sangatBerkembang: {
            label: 'Sangat Berkembang',
            singkatan: 'SB',
            min: 90,
            max: 100,
            warna: '#3B82F6',
            deskripsi: 'Peserta didik menunjukkan kemampuan melebihi tujuan pembelajaran'
        }
    },

    // Predikat Nilai
    PREDIKAT: {
        A: { min: 90, max: 100, label: 'Sangat Baik' },
        B: { min: 80, max: 89, label: 'Baik' },
        C: { min: 70, max: 79, label: 'Cukup' },
        D: { min: 0, max: 69, label: 'Perlu Bimbingan' }
    },

    // Tipe Soal Bank Soal
    TIPE_SOAL: [
        { id: 'PG', nama: 'Pilihan Ganda', icon: '🔘' },
        { id: 'BS', nama: 'Benar/Salah', icon: '✓✗' },
        { id: 'MJ', nama: 'Menjodohkan', icon: '↔️' },
        { id: 'IS', nama: 'Isian Singkat', icon: '📝' },
        { id: 'ES', nama: 'Essay/Uraian', icon: '📄' }
    ],

    // Status Absensi
    STATUS_ABSENSI: [
        { id: 'H', nama: 'Hadir', warna: '#10B981' },
        { id: 'S', nama: 'Sakit', warna: '#F59E0B' },
        { id: 'I', nama: 'Izin', warna: '#3B82F6' },
        { id: 'A', nama: 'Alpha', warna: '#EF4444' }
    ],

    // Sidebar Menu
    MENU: {
        DASHBOARD: {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'home',
            path: 'dashboard',
            free: true
        },
        INPUT_DATA: {
            label: 'Input Data',
            items: [
                { id: 'profile', label: 'Profil & Sekolah', icon: 'user', path: 'profile', free: true },
                { id: 'calendar', label: 'Kalender', icon: 'calendar', path: 'calendar', free: true },
                { id: 'schedule', label: 'Jadwal', icon: 'clock', path: 'schedule', free: true },
                { id: 'cp', label: 'Data CP', icon: 'file-text', path: 'cp', free: true },
                { id: 'siswa', label: 'Data Siswa', icon: 'users', path: 'siswa', free: true }
            ]
        },
        DOKUMEN: {
            label: 'Dokumen',
            items: [
                { id: 'atp', label: 'ATP', icon: 'target', path: 'atp', free: true },
                { id: 'prota', label: 'Prota', icon: 'calendar-range', path: 'prota', free: true },
                { id: 'promes', label: 'Promes', icon: 'calendar-days', path: 'promes', free: false },
                { id: 'modul', label: 'Modul Ajar', icon: 'book-open', path: 'modul', free: false },
                { id: 'lkpd', label: 'LKPD', icon: 'clipboard', path: 'lkpd', free: false },
                { id: 'jurnal', label: 'Jurnal', icon: 'edit', path: 'jurnal', free: false }
            ]
        },
        PENILAIAN: {
            label: 'Penilaian',
            items: [
                { id: 'kktp', label: 'KKTP', icon: 'check-circle', path: 'kktp', free: false },
                { id: 'nilai', label: 'Daftar Nilai', icon: 'bar-chart', path: 'nilai', free: false },
                { id: 'soal', label: 'Bank Soal', icon: 'help-circle', path: 'soal', free: false }
            ]
        },
        AI: {
            id: 'ai',
            label: 'AI Assistant',
            icon: 'cpu',
            path: 'ai',
            free: false
        },
        SETTINGS: {
            id: 'settings',
            label: 'Pengaturan',
            icon: 'settings',
            path: 'settings',
            free: true
        }
    },

    // Firestore Collections
    COLLECTIONS: {
        USERS: 'users',
        PROFILES: 'profiles',
        CALENDARS: 'calendars',
        SCHEDULES: 'schedules',
        CP: 'cp',
        SISWA: 'siswa',
        ATP: 'atp',
        PROTA: 'prota',
        PROMES: 'promes',
        MODUL_AJAR: 'modulAjar',
        LKPD: 'lkpd',
        JURNAL: 'jurnal',
        KKTP: 'kktp',
        DAFTAR_NILAI: 'daftarNilai',
        BANK_SOAL: 'bankSoal',
        SETTINGS: 'settings',
        SUBSCRIPTIONS: 'subscriptions'
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        THEME: 'agsa_theme',
        SIDEBAR_STATE: 'agsa_sidebar',
        LAST_MODULE: 'agsa_last_module',
        DRAFT_PREFIX: 'agsa_draft_'
    },

    // Date Formats
    DATE_FORMAT: {
        DISPLAY: 'DD MMMM YYYY',
        SHORT: 'DD/MM/YYYY',
        INPUT: 'YYYY-MM-DD',
        TIMESTAMP: 'DD-MM-YYYY HH:mm:ss'
    },

    // Toast Types
    TOAST: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    // Document Status
    DOC_STATUS: {
        DRAFT: 'draft',
        COMPLETED: 'completed',
        ARCHIVED: 'archived'
    }
};

// Freeze constants to prevent modification
Object.freeze(AGSA_CONSTANTS);

// Export for use
window.AGSA_CONSTANTS = AGSA_CONSTANTS;

console.log('📋 Constants loaded successfully');