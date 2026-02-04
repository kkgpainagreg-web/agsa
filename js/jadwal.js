// =====================================================
// JADWAL & KALENDER MODULE - jadwal.js
// =====================================================

import { db } from './firebase-config.js';
import { 
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
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getCurrentUserData, getCurrentSchoolData, getSchoolTeachers } from './auth.js';

// =====================================================
// CONSTANTS
// =====================================================

export const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const JAM_PELAJARAN = {
    SD: [
        { jam: 1, mulai: '07:00', selesai: '07:35' },
        { jam: 2, mulai: '07:35', selesai: '08:10' },
        { jam: 3, mulai: '08:10', selesai: '08:45' },
        { jam: 4, mulai: '08:45', selesai: '09:20' },
        { jam: 5, mulai: '09:35', selesai: '10:10' }, // After break
        { jam: 6, mulai: '10:10', selesai: '10:45' },
        { jam: 7, mulai: '10:45', selesai: '11:20' },
        { jam: 8, mulai: '11:20', selesai: '11:55' }
    ],
    SMP: [
        { jam: 1, mulai: '07:00', selesai: '07:40' },
        { jam: 2, mulai: '07:40', selesai: '08:20' },
        { jam: 3, mulai: '08:20', selesai: '09:00' },
        { jam: 4, mulai: '09:00', selesai: '09:40' },
        { jam: 5, mulai: '10:00', selesai: '10:40' }, // After break
        { jam: 6, mulai: '10:40', selesai: '11:20' },
        { jam: 7, mulai: '11:20', selesai: '12:00' },
        { jam: 8, mulai: '13:00', selesai: '13:40' }, // After lunch
        { jam: 9, mulai: '13:40', selesai: '14:20' },
        { jam: 10, mulai: '14:20', selesai: '15:00' }
    ],
    SMA: [
        { jam: 1, mulai: '07:00', selesai: '07:45' },
        { jam: 2, mulai: '07:45', selesai: '08:30' },
        { jam: 3, mulai: '08:30', selesai: '09:15' },
        { jam: 4, mulai: '09:15', selesai: '10:00' },
        { jam: 5, mulai: '10:15', selesai: '11:00' }, // After break
        { jam: 6, mulai: '11:00', selesai: '11:45' },
        { jam: 7, mulai: '11:45', selesai: '12:30' },
        { jam: 8, mulai: '13:00', selesai: '13:45' }, // After lunch
        { jam: 9, mulai: '13:45', selesai: '14:30' },
        { jam: 10, mulai: '14:30', selesai: '15:15' }
    ]
};

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
// KALENDER PENDIDIKAN FUNCTIONS
// =====================================================

// Get kalender by NPSN and tahun ajaran
export async function getKalenderPendidikan(npsn, tahunAjaran) {
    try {
        const q = query(
            collection(db, 'kalender_pendidikan'),
            where('npsn', '==', npsn),
            where('tahunAjaran', '==', tahunAjaran),
            orderBy('tanggal', 'asc')
        );
        const snapshot = await getDocs(q);
        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: events };
    } catch (error) {
        console.error('Get kalender error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Add kalender event
export async function addKalenderEvent(data) {
    try {
        const userData = getCurrentUserData();
        const eventData = {
            npsn: userData.npsn,
            tahunAjaran: data.tahunAjaran,
            tanggal: data.tanggal,
            tanggalSelesai: data.tanggalSelesai || data.tanggal,
            jenisKegiatan: data.jenisKegiatan,
            namaKegiatan: data.namaKegiatan,
            keterangan: data.keterangan || '',
            createdBy: userData.uid,
            createdByName: userData.namaGuru,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'kalender_pendidikan'), eventData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...eventData } };
    } catch (error) {
        console.error('Add kalender event error:', error);
        return { success: false, error: error.message };
    }
}

// Update kalender event
export async function updateKalenderEvent(eventId, data) {
    try {
        const docRef = doc(db, 'kalender_pendidikan', eventId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update kalender event error:', error);
        return { success: false, error: error.message };
    }
}

// Delete kalender event
export async function deleteKalenderEvent(eventId) {
    try {
        await deleteDoc(doc(db, 'kalender_pendidikan', eventId));
        return { success: true };
    } catch (error) {
        console.error('Delete kalender event error:', error);
        return { success: false, error: error.message };
    }
}

// Generate default kalender pendidikan
export async function generateDefaultKalender(tahunAjaran) {
    try {
        const userData = getCurrentUserData();
        const [tahunMulai, tahunSelesai] = tahunAjaran.split('/');
        
        // Default events (can be customized)
        const defaultEvents = [
            { tanggal: `${tahunMulai}-07-10`, jenisKegiatan: 'mpls', namaKegiatan: 'MPLS (Masa Pengenalan Lingkungan Sekolah)', keterangan: '3 hari' },
            { tanggal: `${tahunMulai}-08-17`, jenisKegiatan: 'libur_nasional', namaKegiatan: 'Hari Kemerdekaan RI', keterangan: '' },
            { tanggal: `${tahunMulai}-10-09`, tanggalSelesai: `${tahunMulai}-10-14`, jenisKegiatan: 'uts', namaKegiatan: 'Penilaian Tengah Semester 1', keterangan: '' },
            { tanggal: `${tahunMulai}-12-09`, tanggalSelesai: `${tahunMulai}-12-16`, jenisKegiatan: 'uas', namaKegiatan: 'Penilaian Akhir Semester 1', keterangan: '' },
            { tanggal: `${tahunMulai}-12-23`, jenisKegiatan: 'rapor', namaKegiatan: 'Pembagian Rapor Semester 1', keterangan: '' },
            { tanggal: `${tahunMulai}-12-25`, tanggalSelesai: `${tahunSelesai}-01-01`, jenisKegiatan: 'libur_sekolah', namaKegiatan: 'Libur Semester 1', keterangan: '' },
            { tanggal: `${tahunSelesai}-03-10`, tanggalSelesai: `${tahunSelesai}-03-15`, jenisKegiatan: 'uts', namaKegiatan: 'Penilaian Tengah Semester 2', keterangan: '' },
            { tanggal: `${tahunSelesai}-06-01`, tanggalSelesai: `${tahunSelesai}-06-08`, jenisKegiatan: 'uas', namaKegiatan: 'Penilaian Akhir Tahun', keterangan: '' },
            { tanggal: `${tahunSelesai}-06-15`, jenisKegiatan: 'rapor', namaKegiatan: 'Pembagian Rapor Semester 2', keterangan: '' },
            { tanggal: `${tahunSelesai}-06-17`, tanggalSelesai: `${tahunSelesai}-07-09`, jenisKegiatan: 'libur_sekolah', namaKegiatan: 'Libur Semester 2', keterangan: '' }
        ];
        
        const batch = writeBatch(db);
        
        defaultEvents.forEach(event => {
            const docRef = doc(collection(db, 'kalender_pendidikan'));
            batch.set(docRef, {
                npsn: userData.npsn,
                tahunAjaran: tahunAjaran,
                ...event,
                tanggalSelesai: event.tanggalSelesai || event.tanggal,
                createdBy: userData.uid,
                createdByName: userData.namaGuru,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('Generate default kalender error:', error);
        return { success: false, error: error.message };
    }
}

// Calculate effective days
export function calculateEffectiveDays(events, month, year) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let effectiveDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // Skip Sunday (0)
        if (dayOfWeek === 0) continue;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Check if it's a holiday or non-effective day
        const isHoliday = events.some(event => {
            if (event.jenisKegiatan === 'libur_nasional' || event.jenisKegiatan === 'libur_sekolah') {
                const start = new Date(event.tanggal);
                const end = new Date(event.tanggalSelesai || event.tanggal);
                const current = new Date(dateStr);
                return current >= start && current <= end;
            }
            return false;
        });
        
        if (!isHoliday) {
            effectiveDays++;
        }
    }
    
    return effectiveDays;
}

// =====================================================
// JADWAL PELAJARAN FUNCTIONS
// =====================================================

// Get jadwal by NPSN
export async function getJadwalByNPSN(npsn, tahunAjaran, semester) {
    try {
        let q = query(
            collection(db, 'jadwal_pelajaran'),
            where('npsn', '==', npsn),
            where('tahunAjaran', '==', tahunAjaran)
        );
        
        if (semester) {
            q = query(q, where('semester', '==', semester));
        }
        
        const snapshot = await getDocs(q);
        const jadwal = [];
        snapshot.forEach(doc => {
            jadwal.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: jadwal };
    } catch (error) {
        console.error('Get jadwal error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Get jadwal by teacher
export async function getJadwalByGuru(guruId, tahunAjaran, semester) {
    try {
        const q = query(
            collection(db, 'jadwal_pelajaran'),
            where('guruId', '==', guruId),
            where('tahunAjaran', '==', tahunAjaran),
            where('semester', '==', semester)
        );
        const snapshot = await getDocs(q);
        const jadwal = [];
        snapshot.forEach(doc => {
            jadwal.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: jadwal };
    } catch (error) {
        console.error('Get jadwal by guru error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Check for schedule conflicts
export async function checkScheduleConflict(data, excludeId = null) {
    try {
        const userData = getCurrentUserData();
        const conflicts = [];
        
        // Check 1: Same class, same day, same time (different teacher)
        const classConflictQuery = query(
            collection(db, 'jadwal_pelajaran'),
            where('npsn', '==', userData.npsn),
            where('tahunAjaran', '==', data.tahunAjaran),
            where('semester', '==', data.semester),
            where('hari', '==', data.hari),
            where('kelas', '==', data.kelas),
            where('rombel', '==', data.rombel)
        );
        
        const classSnapshot = await getDocs(classConflictQuery);
        classSnapshot.forEach(doc => {
            if (doc.id !== excludeId) {
                const jadwal = doc.data();
                // Check if jam overlaps
                const requestedJam = data.jamKe;
                const existingJam = jadwal.jamKe;
                const requestedEnd = data.jamKe + (data.durasi || 1) - 1;
                const existingEnd = jadwal.jamKe + (jadwal.durasi || 1) - 1;
                
                if (!(requestedEnd < existingJam || requestedJam > existingEnd)) {
                    conflicts.push({
                        type: 'class',
                        message: `Kelas ${data.kelas}${data.rombel} sudah memiliki jadwal ${jadwal.mapelNama} pada hari ${data.hari} jam ke-${existingJam}`,
                        data: jadwal
                    });
                }
            }
        });
        
        // Check 2: Same teacher, same day, same time (different class)
        const teacherConflictQuery = query(
            collection(db, 'jadwal_pelajaran'),
            where('npsn', '==', userData.npsn),
            where('tahunAjaran', '==', data.tahunAjaran),
            where('semester', '==', data.semester),
            where('guruId', '==', data.guruId),
            where('hari', '==', data.hari)
        );
        
        const teacherSnapshot = await getDocs(teacherConflictQuery);
        teacherSnapshot.forEach(doc => {
            if (doc.id !== excludeId) {
                const jadwal = doc.data();
                const requestedJam = data.jamKe;
                const existingJam = jadwal.jamKe;
                const requestedEnd = data.jamKe + (data.durasi || 1) - 1;
                const existingEnd = jadwal.jamKe + (jadwal.durasi || 1) - 1;
                
                if (!(requestedEnd < existingJam || requestedJam > existingEnd)) {
                    conflicts.push({
                        type: 'teacher',
                        message: `Guru ${data.guruNama} sudah mengajar di kelas ${jadwal.kelas}${jadwal.rombel} pada hari ${data.hari} jam ke-${existingJam}`,
                        data: jadwal
                    });
                }
            }
        });
        
        return { 
            success: true, 
            hasConflict: conflicts.length > 0, 
            conflicts: conflicts 
        };
    } catch (error) {
        console.error('Check conflict error:', error);
        return { success: false, error: error.message, hasConflict: false, conflicts: [] };
    }
}

// Add jadwal pelajaran
export async function addJadwal(data) {
    try {
        const userData = getCurrentUserData();
        
        // Check for conflicts first
        const conflictCheck = await checkScheduleConflict(data);
        if (conflictCheck.hasConflict) {
            return { 
                success: false, 
                error: 'Terdapat bentrok jadwal', 
                conflicts: conflictCheck.conflicts 
            };
        }
        
        const jadwalData = {
            npsn: userData.npsn,
            tahunAjaran: data.tahunAjaran,
            semester: data.semester,
            hari: data.hari,
            kelas: data.kelas,
            rombel: data.rombel,
            jamKe: parseInt(data.jamKe),
            durasi: parseInt(data.durasi) || 1,
            mapelId: data.mapelId,
            mapelNama: data.mapelNama,
            mapelKode: data.mapelKode,
            guruId: data.guruId,
            guruNama: data.guruNama,
            ruangan: data.ruangan || '',
            createdBy: userData.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'jadwal_pelajaran'), jadwalData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...jadwalData } };
    } catch (error) {
        console.error('Add jadwal error:', error);
        return { success: false, error: error.message };
    }
}

// Update jadwal
export async function updateJadwal(jadwalId, data) {
    try {
        // Check for conflicts first
        const conflictCheck = await checkScheduleConflict(data, jadwalId);
        if (conflictCheck.hasConflict) {
            return { 
                success: false, 
                error: 'Terdapat bentrok jadwal', 
                conflicts: conflictCheck.conflicts 
            };
        }
        
        const docRef = doc(db, 'jadwal_pelajaran', jadwalId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update jadwal error:', error);
        return { success: false, error: error.message };
    }
}

// Delete jadwal
export async function deleteJadwal(jadwalId) {
    try {
        await deleteDoc(doc(db, 'jadwal_pelajaran', jadwalId));
        return { success: true };
    } catch (error) {
        console.error('Delete jadwal error:', error);
        return { success: false, error: error.message };
    }
}

// Copy jadwal from previous semester
export async function copyJadwalFromSemester(fromTahunAjaran, fromSemester, toTahunAjaran, toSemester) {
    try {
        const userData = getCurrentUserData();
        
        const fromJadwal = await getJadwalByNPSN(userData.npsn, fromTahunAjaran, fromSemester);
        if (!fromJadwal.success || fromJadwal.data.length === 0) {
            return { success: false, error: 'Tidak ada jadwal dari semester sebelumnya' };
        }
        
        const batch = writeBatch(db);
        
        fromJadwal.data.forEach(jadwal => {
            const newDocRef = doc(collection(db, 'jadwal_pelajaran'));
            batch.set(newDocRef, {
                ...jadwal,
                id: undefined, // Remove old ID
                tahunAjaran: toTahunAjaran,
                semester: toSemester,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });
        
        await batch.commit();
        return { success: true, count: fromJadwal.data.length };
    } catch (error) {
        console.error('Copy jadwal error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// JAM PELAJARAN SETTINGS
// =====================================================

// Get jam pelajaran settings
export async function getJamPelajaranSettings(npsn) {
    try {
        const docRef = doc(db, 'settings', `jam_pelajaran_${npsn}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        
        // Return default if not set
        const schoolData = getCurrentSchoolData();
        return { 
            success: true, 
            data: { jam: JAM_PELAJARAN[schoolData.jenjang] || JAM_PELAJARAN.SMP }
        };
    } catch (error) {
        console.error('Get jam pelajaran error:', error);
        return { success: false, error: error.message };
    }
}

// Save jam pelajaran settings
export async function saveJamPelajaranSettings(npsn, jamSettings) {
    try {
        const docRef = doc(db, 'settings', `jam_pelajaran_${npsn}`);
        await setDoc(docRef, {
            npsn: npsn,
            jam: jamSettings,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Save jam pelajaran error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// JADWAL PAGE TEMPLATES
// =====================================================

// Render Kalender Pendidikan Page
export function renderKalenderPage() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Kalender Pendidikan</h1>
                    <p class="text-gray-500 mt-1">Kelola kegiatan dan hari efektif sekolah</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showAddKalenderModal()" class="btn-primary flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        <span>Tambah Kegiatan</span>
                    </button>
                    <button onclick="exportKalender()" class="btn-secondary flex items-center gap-2">
                        <i class="fas fa-file-export"></i>
                        <span class="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>
            
            <!-- Filter & Info -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="kalenderTahunAjaran" onchange="loadKalender()" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                            <option value="2023/2024">2023/2024</option>
                            <option value="2025/2026">2025/2026</option>
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
                            <option value="2026">2026</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="generateDefaultKalender()" class="btn-secondary w-full flex items-center justify-center gap-2">
                            <i class="fas fa-magic"></i>
                            <span>Generate Default</span>
                        </button>
                    </div>
                </div>
                
                <!-- Stats -->
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
            
            <!-- Calendar Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Calendar -->
                <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-6">
                        <button onclick="prevMonth()" class="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 id="calendarTitle" class="text-lg font-semibold text-gray-800">Juli 2024</h3>
                        <button onclick="nextMonth()" class="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <!-- Day Headers -->
                    <div class="grid grid-cols-7 gap-1 mb-2">
                        <div class="text-center text-sm font-semibold text-red-500 py-2">Min</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Sen</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Sel</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Rab</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Kam</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Jum</div>
                        <div class="text-center text-sm font-semibold text-gray-600 py-2">Sab</div>
                    </div>
                    
                    <!-- Calendar Days -->
                    <div id="calendarGrid" class="grid grid-cols-7 gap-1">
                        <!-- Will be populated -->
                    </div>
                </div>
                
                <!-- Events List -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-semibold text-gray-800 mb-4">Kegiatan Bulan Ini</h3>
                    <div id="eventsList" class="space-y-3 max-h-96 overflow-y-auto">
                        <!-- Will be populated -->
                    </div>
                </div>
            </div>
            
            <!-- Legend -->
            <div class="bg-white rounded-xl shadow-sm p-6 mt-6">
                <h3 class="font-semibold text-gray-800 mb-4">Keterangan</h3>
                <div class="flex flex-wrap gap-4">
                    ${JENIS_KEGIATAN.map(jenis => `
                        <div class="flex items-center gap-2">
                            <span class="w-4 h-4 rounded" style="background-color: ${jenis.warna}"></span>
                            <span class="text-sm text-gray-600">${jenis.nama}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- Add/Edit Event Modal -->
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
                        <label class="form-label">Jenis Kegiatan <span class="text-red-500">*</span></label>
                        <select id="kalenderJenis" required class="form-input">
                            <option value="">Pilih Jenis</option>
                            ${JENIS_KEGIATAN.map(j => `<option value="${j.id}">${j.nama}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="form-label">Nama Kegiatan <span class="text-red-500">*</span></label>
                        <input type="text" id="kalenderNama" required class="form-input" placeholder="Nama kegiatan...">
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
                        <textarea id="kalenderKeterangan" rows="2" class="form-input" placeholder="Keterangan tambahan..."></textarea>
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

// Render Jadwal Pelajaran Page
export function renderJadwalPage() {
    return `
        <div class="animate-fadeIn">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Jadwal Pelajaran</h1>
                    <p class="text-gray-500 mt-1">Kelola jadwal mengajar (kolaboratif dengan guru sesekolah)</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showAddJadwalModal()" class="btn-primary flex items-center gap-2">
                        <i class="fas fa-plus"></i>
                        <span>Tambah Jadwal</span>
                    </button>
                    <div class="dropdown">
                        <button onclick="toggleDropdown('exportDropdown')" class="btn-secondary flex items-center gap-2">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div id="exportDropdown" class="dropdown-menu hidden">
                            <a href="#" onclick="exportJadwal('pdf')" class="dropdown-item">
                                <i class="fas fa-file-pdf text-red-500"></i> Export PDF
                            </a>
                            <a href="#" onclick="exportJadwal('word')" class="dropdown-item">
                                <i class="fas fa-file-word text-blue-500"></i> Export Word
                            </a>
                            <a href="#" onclick="printJadwal()" class="dropdown-item">
                                <i class="fas fa-print text-gray-500"></i> Print
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Filter -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label class="form-label">Tahun Ajaran</label>
                        <select id="jadwalTahunAjaran" onchange="loadJadwal()" class="form-input">
                            <option value="2024/2025">2024/2025</option>
                            <option value="2023/2024">2023/2024</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Semester</label>
                        <select id="jadwalSemester" onchange="loadJadwal()" class="form-input">
                            <option value="1">Semester 1 (Ganjil)</option>
                            <option value="2">Semester 2 (Genap)</option>
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
                            <option value="mapel">Per Mapel</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="showJamPelajaranSettings()" class="btn-secondary w-full flex items-center justify-center gap-2">
                            <i class="fas fa-clock"></i>
                            <span>Atur Jam</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Schedule Grid -->
            <div id="jadwalContent" class="bg-white rounded-xl shadow-sm overflow-hidden">
                <div class="p-8 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
                    <p class="text-gray-500 mt-4">Memuat jadwal...</p>
                </div>
            </div>
            
            <!-- Conflict Warning -->
            <div id="conflictWarning" class="hidden mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start gap-3">
                    <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                    <div>
                        <h4 class="font-semibold text-red-800">Perhatian: Terdapat Bentrok Jadwal</h4>
                        <p id="conflictDetails" class="text-sm text-red-600 mt-1"></p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add/Edit Jadwal Modal -->
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
                                <option value="">Pilih Hari</option>
                                ${HARI.map(h => `<option value="${h}">${h}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Jam Ke <span class="text-red-500">*</span></label>
                            <select id="jadwalJamKe" required class="form-input">
                                <option value="">Pilih Jam</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Kelas <span class="text-red-500">*</span></label>
                            <select id="jadwalKelasInput" required class="form-input">
                                <option value="">Pilih Kelas</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Rombel <span class="text-red-500">*</span></label>
                            <select id="jadwalRombelInput" required class="form-input">
                                <option value="">Pilih Rombel</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="form-label">Mata Pelajaran <span class="text-red-500">*</span></label>
                        <select id="jadwalMapel" required class="form-input" onchange="updateGuruOptions()">
                            <option value="">Pilih Mapel</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="form-label">Guru Pengampu <span class="text-red-500">*</span></label>
                        <select id="jadwalGuru" required class="form-input">
                            <option value="">Pilih Guru</option>
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Durasi (Jam Pelajaran)</label>
                            <input type="number" id="jadwalDurasi" value="1" min="1" max="4" class="form-input">
                        </div>
                        <div>
                            <label class="form-label">Ruangan</label>
                            <input type="text" id="jadwalRuangan" class="form-input" placeholder="Opsional">
                        </div>
                    </div>
                    
                    <!-- Conflict Alert -->
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
        
        <!-- Jam Pelajaran Settings Modal -->
        <div id="jamPelajaranModal" class="modal-overlay hidden">
            <div class="modal-content max-w-2xl max-h-[80vh]">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold">Pengaturan Jam Pelajaran</h3>
                    <button onclick="closeJamPelajaranModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <form id="jamPelajaranForm" onsubmit="saveJamPelajaran(event)" class="modal-body">
                    <p class="text-sm text-gray-500 mb-4">Atur waktu mulai dan selesai setiap jam pelajaran</p>
                    
                    <div id="jamPelajaranList" class="space-y-3 max-h-96 overflow-y-auto">
                        <!-- Will be populated -->
                    </div>
                    
                    <button type="button" onclick="addJamPelajaran()" class="mt-4 text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                        <i class="fas fa-plus"></i> Tambah Jam Pelajaran
                    </button>
                    
                    <div class="modal-footer border-t pt-4 mt-4">
                        <button type="button" onclick="resetJamPelajaran()" class="btn-secondary">Reset ke Default</button>
                        <button type="submit" class="btn-primary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Render Schedule Grid
export function renderScheduleGrid(jadwalData, kelasData, jamPelajaran, viewType = 'kelas') {
    if (!jadwalData || jadwalData.length === 0) {
        return `
            <div class="p-8 text-center">
                <i class="fas fa-calendar-times text-gray-300 text-5xl mb-4"></i>
                <p class="text-gray-500 mb-4">Belum ada jadwal pelajaran</p>
                <button onclick="showAddJadwalModal()" class="btn-primary">
                    <i class="fas fa-plus mr-2"></i>Tambah Jadwal Pertama
                </button>
            </div>
        `;
    }
    
    // Group jadwal by kelas
    if (viewType === 'kelas') {
        const groupedByKelas = {};
        jadwalData.forEach(j => {
            const key = `${j.kelas}${j.rombel}`;
            if (!groupedByKelas[key]) {
                groupedByKelas[key] = [];
            }
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
                            <!-- Header Row -->
                            <div class="schedule-header">Jam</div>
                            ${HARI.map(h => `<div class="schedule-header">${h}</div>`).join('')}
                            
                            <!-- Schedule Rows -->
                            ${jamPelajaran.map(jam => `
                                <div class="schedule-cell text-center font-medium text-gray-600">
                                    <div>${jam.jam}</div>
                                    <div class="text-xs text-gray-400">${jam.mulai}-${jam.selesai}</div>
                                </div>
                                ${HARI.map(hari => {
                                    const slot = jadwalKelas.find(j => j.hari === hari && j.jamKe === jam.jam);
                                    if (slot) {
                                        return `
                                            <div class="schedule-cell cursor-pointer hover:bg-gray-50 transition-all" 
                                                onclick="editJadwal('${slot.id}')" 
                                                style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)">
                                                <div class="font-medium text-primary text-xs">${slot.mapelKode || slot.mapelNama.substring(0, 10)}</div>
                                                <div class="text-xs text-gray-500 truncate">${slot.guruNama}</div>
                                                ${slot.durasi > 1 ? `<span class="text-xs text-gray-400">(${slot.durasi} JP)</span>` : ''}
                                            </div>
                                        `;
                                    }
                                    return `
                                        <div class="schedule-cell cursor-pointer hover:bg-gray-100 transition-all"
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
    
    // View by Teacher
    if (viewType === 'guru') {
        const groupedByGuru = {};
        jadwalData.forEach(j => {
            if (!groupedByGuru[j.guruNama]) {
                groupedByGuru[j.guruNama] = [];
            }
            groupedByGuru[j.guruNama].push(j);
        });
        
        let html = '<div class="divide-y">';
        
        Object.keys(groupedByGuru).sort().forEach(guru => {
            const jadwalGuru = groupedByGuru[guru];
            
            html += `
                <div class="p-4">
                    <h4 class="font-semibold text-gray-800 mb-4">
                        <i class="fas fa-user-tie text-primary mr-2"></i>${guru}
                    </h4>
                    <div class="overflow-x-auto">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Hari</th>
                                    <th>Jam Ke</th>
                                    <th>Kelas</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Durasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${jadwalGuru.sort((a, b) => {
                                    const hariOrder = HARI.indexOf(a.hari) - HARI.indexOf(b.hari);
                                    if (hariOrder !== 0) return hariOrder;
                                    return a.jamKe - b.jamKe;
                                }).map(j => `
                                    <tr>
                                        <td>${j.hari}</td>
                                        <td>${j.jamKe}</td>
                                        <td>${j.kelas}${j.rombel}</td>
                                        <td>${j.mapelNama}</td>
                                        <td>${j.durasi} JP</td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button onclick="editJadwal('${j.id}')" class="p-1 text-primary hover:bg-primary/10 rounded">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="deleteJadwal('${j.id}')" class="p-1 text-red-500 hover:bg-red-50 rounded">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Summary -->
                    <div class="mt-4 flex gap-4 text-sm text-gray-500">
                        <span><strong>${jadwalGuru.reduce((sum, j) => sum + j.durasi, 0)}</strong> JP/minggu</span>
                        <span><strong>${new Set(jadwalGuru.map(j => `${j.kelas}${j.rombel}`)).size}</strong> kelas</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    return '<div class="p-8 text-center text-gray-500">Tampilan tidak tersedia</div>';
}

// Calendar Renderer
export function renderCalendarGrid(year, month, events) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    
    let html = '';
    
    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
        html += '<div class="calendar-day text-gray-300"></div>';
    }
    
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        
        // Check events for this day
        const dayEvents = events.filter(e => {
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
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''} 
                ${isSunday ? 'text-red-500' : ''}" 
                onclick="showDayEvents('${dateStr}')"
                ${hasEvent ? `style="background-color: ${eventColor}20; border-left: 3px solid ${eventColor}"` : ''}>
                <span class="${isToday ? 'text-white' : ''}">${day}</span>
                ${hasEvent && !isToday ? `
                    <div class="w-full mt-1 overflow-hidden">
                        <span class="text-xs truncate block" style="color: ${eventColor}">${dayEvents[0].namaKegiatan.substring(0, 8)}...</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    return html;
}

// Render Events List
export function renderEventsList(events, year, month) {
    const monthEvents = events.filter(e => {
        const eventDate = new Date(e.tanggal);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    if (monthEvents.length === 0) {
        return `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-calendar-check text-3xl mb-2 text-gray-300"></i>
                <p>Tidak ada kegiatan</p>
            </div>
        `;
    }
    
    return monthEvents.map(event => {
        const jenis = JENIS_KEGIATAN.find(j => j.id === event.jenisKegiatan);
        const tanggal = new Date(event.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const tanggalSelesai = event.tanggalSelesai !== event.tanggal 
            ? ` - ${new Date(event.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
            : '';
        
        return `
            <div class="p-3 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all"
                style="border-left-color: ${jenis?.warna || '#6B7280'}"
                onclick="editKalenderEvent('${event.id}')">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="font-medium text-gray-800 text-sm">${event.namaKegiatan}</p>
                        <p class="text-xs text-gray-500 mt-1">${tanggal}${tanggalSelesai}</p>
                        ${event.keterangan ? `<p class="text-xs text-gray-400 mt-1">${event.keterangan}</p>` : ''}
                    </div>
                    <button onclick="event.stopPropagation(); deleteKalenderEvent('${event.id}')" 
                        class="text-gray-400 hover:text-red-500 p-1">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}