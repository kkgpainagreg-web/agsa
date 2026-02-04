// =====================================================
// MASTER DATA MODULE - master-data.js
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
import { getCurrentUserData, getCurrentSchoolData } from './auth.js';

// =====================================================
// PROFIL LULUSAN - 8 DIMENSI
// =====================================================
export const DIMENSI_PROFIL_LULUSAN = [
    {
        id: 'keimanan',
        nama: 'Keimanan dan Ketakwaan',
        deskripsi: 'Keyakinan teguh pada Tuhan YME, menjalankan ajaran agama dengan konsisten.',
        warna: '#8B5CF6',
        icon: 'fa-pray'
    },
    {
        id: 'kewargaan',
        nama: 'Kewargaan',
        deskripsi: 'Cinta tanah air, sadar aturan, dan peduli sosial.',
        warna: '#EF4444',
        icon: 'fa-flag'
    },
    {
        id: 'penalaran',
        nama: 'Penalaran Kritis',
        deskripsi: 'Berpikir logis dan analitis dalam memecahkan masalah.',
        warna: '#3B82F6',
        icon: 'fa-brain'
    },
    {
        id: 'kreativitas',
        nama: 'Kreativitas',
        deskripsi: 'Inovatif dan fleksibel dalam menghasilkan ide-ide baru.',
        warna: '#F59E0B',
        icon: 'fa-lightbulb'
    },
    {
        id: 'kolaborasi',
        nama: 'Kolaborasi',
        deskripsi: 'Bekerja sama dengan orang lain untuk mencapai tujuan bersama.',
        warna: '#10B981',
        icon: 'fa-users'
    },
    {
        id: 'kemandirian',
        nama: 'Kemandirian',
        deskripsi: 'Mampu mengelola diri sendiri dan bertanggung jawab.',
        warna: '#6366F1',
        icon: 'fa-user-check'
    },
    {
        id: 'kesehatan',
        nama: 'Kesehatan',
        deskripsi: 'Fisik prima dan mental sehat untuk menjalani kehidupan.',
        warna: '#EC4899',
        icon: 'fa-heart'
    },
    {
        id: 'komunikasi',
        nama: 'Komunikasi',
        deskripsi: 'Efektif menyampaikan ide secara lisan maupun tulisan.',
        warna: '#14B8A6',
        icon: 'fa-comments'
    }
];

// =====================================================
// DEFAULT MATA PELAJARAN TEMPLATES
// =====================================================
export const DEFAULT_MAPEL_TEMPLATES = {
    SD: [
        { 
            nama: 'Pendidikan Agama Islam dan Budi Pekerti', 
            kode: 'PAI',
            elemen: ['Al-Quran dan Hadis', 'Aqidah', 'Akhlak', 'Fikih', 'Sejarah Peradaban Islam']
        },
        { 
            nama: 'Pendidikan Agama Kristen dan Budi Pekerti', 
            kode: 'PAK',
            elemen: ['Allah Berkarya', 'Manusia dan Nilai-nilai Kristiani', 'Gereja dan Masyarakat']
        },
        { 
            nama: 'Pendidikan Agama Katolik dan Budi Pekerti', 
            kode: 'PAKat',
            elemen: ['Pribadi Peserta Didik', 'Yesus Kristus', 'Gereja', 'Masyarakat']
        },
        { 
            nama: 'Pendidikan Agama Hindu dan Budi Pekerti', 
            kode: 'PAH',
            elemen: ['Kitab Suci Weda', 'Tattwa', 'Susila', 'Acara', 'Sejarah']
        },
        { 
            nama: 'Pendidikan Agama Buddha dan Budi Pekerti', 
            kode: 'PAB',
            elemen: ['Sejarah', 'Dhamma', 'Tipitaka', 'Ritual/Tradisi']
        },
        { 
            nama: 'Pendidikan Agama Khonghucu dan Budi Pekerti', 
            kode: 'PAKh',
            elemen: ['Kitab Suci', 'Keimanan', 'Perilaku Junzi', 'Tata Ibadah']
        },
        { 
            nama: 'Pendidikan Pancasila', 
            kode: 'PPKn',
            elemen: ['Pancasila', 'Undang-Undang Dasar 1945', 'Bhinneka Tunggal Ika', 'NKRI']
        },
        { 
            nama: 'Bahasa Indonesia', 
            kode: 'BI',
            elemen: ['Menyimak', 'Membaca dan Memirsa', 'Berbicara dan Mempresentasikan', 'Menulis']
        },
        { 
            nama: 'Matematika', 
            kode: 'MTK',
            elemen: ['Bilangan', 'Aljabar', 'Pengukuran', 'Geometri', 'Analisis Data dan Peluang']
        },
        { 
            nama: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)', 
            kode: 'IPAS',
            elemen: ['Pemahaman IPA', 'Keterampilan Proses', 'Pemahaman IPS', 'Keterampilan Sosial']
        },
        { 
            nama: 'Seni Budaya', 
            kode: 'SB',
            elemen: ['Seni Musik', 'Seni Rupa', 'Seni Tari', 'Seni Teater']
        },
        { 
            nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 
            kode: 'PJOK',
            elemen: ['Keterampilan Gerak', 'Pengetahuan Gerak', 'Pemanfaatan Gerak', 'Pengembangan Karakter']
        },
        { 
            nama: 'Bahasa Inggris', 
            kode: 'BING',
            elemen: ['Menyimak-Berbicara', 'Membaca-Memirsa', 'Menulis-Mempresentasikan']
        },
        { 
            nama: 'Muatan Lokal', 
            kode: 'MULOK',
            elemen: ['Pengetahuan Lokal', 'Keterampilan Lokal', 'Sikap dan Nilai Lokal']
        }
    ],
    SMP: [
        { 
            nama: 'Pendidikan Agama Islam dan Budi Pekerti', 
            kode: 'PAI',
            elemen: ['Al-Quran dan Hadis', 'Aqidah', 'Akhlak', 'Fikih', 'Sejarah Peradaban Islam']
        },
        { 
            nama: 'Pendidikan Pancasila', 
            kode: 'PPKn',
            elemen: ['Pancasila', 'Undang-Undang Dasar 1945', 'Bhinneka Tunggal Ika', 'NKRI']
        },
        { 
            nama: 'Bahasa Indonesia', 
            kode: 'BI',
            elemen: ['Menyimak', 'Membaca dan Memirsa', 'Berbicara dan Mempresentasikan', 'Menulis']
        },
        { 
            nama: 'Matematika', 
            kode: 'MTK',
            elemen: ['Bilangan', 'Aljabar', 'Pengukuran', 'Geometri', 'Analisis Data dan Peluang']
        },
        { 
            nama: 'Ilmu Pengetahuan Alam', 
            kode: 'IPA',
            elemen: ['Pemahaman Sains', 'Keterampilan Proses Sains']
        },
        { 
            nama: 'Ilmu Pengetahuan Sosial', 
            kode: 'IPS',
            elemen: ['Pemahaman Konsep', 'Keterampilan Sosial']
        },
        { 
            nama: 'Bahasa Inggris', 
            kode: 'BING',
            elemen: ['Menyimak-Berbicara', 'Membaca-Memirsa', 'Menulis-Mempresentasikan']
        },
        { 
            nama: 'Seni Budaya', 
            kode: 'SB',
            elemen: ['Seni Musik', 'Seni Rupa', 'Seni Tari', 'Seni Teater']
        },
        { 
            nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 
            kode: 'PJOK',
            elemen: ['Keterampilan Gerak', 'Pengetahuan Gerak', 'Pemanfaatan Gerak', 'Pengembangan Karakter']
        },
        { 
            nama: 'Prakarya', 
            kode: 'PKWU',
            elemen: ['Kerajinan', 'Rekayasa', 'Budidaya', 'Pengolahan']
        },
        { 
            nama: 'Informatika', 
            kode: 'INF',
            elemen: ['Berpikir Komputasional', 'Teknologi Informasi dan Komunikasi', 'Sistem Komputer', 'Jaringan Komputer', 'Analisis Data', 'Praktik Lintas Bidang']
        },
        { 
            nama: 'Muatan Lokal', 
            kode: 'MULOK',
            elemen: ['Pengetahuan Lokal', 'Keterampilan Lokal', 'Sikap dan Nilai Lokal']
        }
    ],
    SMA: [
        { 
            nama: 'Pendidikan Agama Islam dan Budi Pekerti', 
            kode: 'PAI',
            elemen: ['Al-Quran dan Hadis', 'Aqidah', 'Akhlak', 'Fikih', 'Sejarah Peradaban Islam']
        },
        { 
            nama: 'Pendidikan Pancasila', 
            kode: 'PPKn',
            elemen: ['Pancasila', 'Undang-Undang Dasar 1945', 'Bhinneka Tunggal Ika', 'NKRI']
        },
        { 
            nama: 'Bahasa Indonesia', 
            kode: 'BI',
            elemen: ['Menyimak', 'Membaca dan Memirsa', 'Berbicara dan Mempresentasikan', 'Menulis']
        },
        { 
            nama: 'Matematika', 
            kode: 'MTK',
            elemen: ['Bilangan', 'Aljabar', 'Fungsi', 'Trigonometri', 'Geometri', 'Kalkulus', 'Statistika', 'Peluang']
        },
        { 
            nama: 'Fisika', 
            kode: 'FIS',
            elemen: ['Pemahaman Fisika', 'Keterampilan Proses']
        },
        { 
            nama: 'Kimia', 
            kode: 'KIM',
            elemen: ['Pemahaman Kimia', 'Keterampilan Proses']
        },
        { 
            nama: 'Biologi', 
            kode: 'BIO',
            elemen: ['Pemahaman Biologi', 'Keterampilan Proses']
        },
        { 
            nama: 'Sejarah', 
            kode: 'SEJ',
            elemen: ['Pemahaman Konsep', 'Keterampilan Sejarah']
        },
        { 
            nama: 'Geografi', 
            kode: 'GEO',
            elemen: ['Pengetahuan', 'Keterampilan']
        },
        { 
            nama: 'Ekonomi', 
            kode: 'EKO',
            elemen: ['Pemahaman Konsep', 'Keterampilan Ekonomi']
        },
        { 
            nama: 'Sosiologi', 
            kode: 'SOS',
            elemen: ['Pemahaman Konsep', 'Keterampilan Sosial']
        },
        { 
            nama: 'Bahasa Inggris', 
            kode: 'BING',
            elemen: ['Menyimak-Berbicara', 'Membaca-Memirsa', 'Menulis-Mempresentasikan']
        },
        { 
            nama: 'Seni Budaya', 
            kode: 'SB',
            elemen: ['Seni Musik', 'Seni Rupa', 'Seni Tari', 'Seni Teater']
        },
        { 
            nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 
            kode: 'PJOK',
            elemen: ['Keterampilan Gerak', 'Pengetahuan Gerak', 'Pemanfaatan Gerak', 'Pengembangan Karakter']
        },
        { 
            nama: 'Prakarya dan Kewirausahaan', 
            kode: 'PKWU',
            elemen: ['Kerajinan', 'Rekayasa', 'Budidaya', 'Pengolahan']
        },
        { 
            nama: 'Informatika', 
            kode: 'INF',
            elemen: ['Berpikir Komputasional', 'Teknologi Informasi dan Komunikasi', 'Sistem Komputer', 'Jaringan Komputer', 'Analisis Data', 'Praktik Lintas Bidang']
        },
        { 
            nama: 'Muatan Lokal', 
            kode: 'MULOK',
            elemen: ['Pengetahuan Lokal', 'Keterampilan Lokal', 'Sikap dan Nilai Lokal']
        }
    ]
};

// =====================================================
// MATA PELAJARAN FUNCTIONS
// =====================================================

// Get user's mata pelajaran
export async function getUserMapel(userId) {
    try {
        const q = query(
            collection(db, 'user_mapel'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const mapel = [];
        snapshot.forEach(doc => {
            mapel.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: mapel };
    } catch (error) {
        console.error('Get user mapel error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Add mata pelajaran to user
export async function addUserMapel(data) {
    try {
        const userData = getCurrentUserData();
        const mapelData = {
            userId: userData.uid,
            npsn: userData.npsn,
            nama: data.nama,
            kode: data.kode,
            elemen: data.elemen || [],
            tingkat: data.tingkat || [], // Kelas yang diampu
            custom: data.custom || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'user_mapel'), mapelData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...mapelData } };
    } catch (error) {
        console.error('Add mapel error:', error);
        return { success: false, error: error.message };
    }
}

// Update mata pelajaran
export async function updateUserMapel(mapelId, data) {
    try {
        const docRef = doc(db, 'user_mapel', mapelId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update mapel error:', error);
        return { success: false, error: error.message };
    }
}

// Delete mata pelajaran
export async function deleteUserMapel(mapelId) {
    try {
        await deleteDoc(doc(db, 'user_mapel', mapelId));
        return { success: true };
    } catch (error) {
        console.error('Delete mapel error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// CAPAIAN PEMBELAJARAN (CP) FUNCTIONS
// =====================================================

// Get CP by mapel
export async function getCPByMapel(mapelId) {
    try {
        const q = query(
            collection(db, 'capaian_pembelajaran'),
            where('mapelId', '==', mapelId),
            orderBy('fase', 'asc')
        );
        const snapshot = await getDocs(q);
        const cpList = [];
        snapshot.forEach(doc => {
            cpList.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: cpList };
    } catch (error) {
        console.error('Get CP error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Add CP
export async function addCP(data) {
    try {
        const userData = getCurrentUserData();
        const cpData = {
            userId: userData.uid,
            npsn: userData.npsn,
            mapelId: data.mapelId,
            mapelNama: data.mapelNama,
            fase: data.fase,
            elemen: data.elemen,
            deskripsiCP: data.deskripsiCP,
            tujuanPembelajaran: data.tujuanPembelajaran || [],
            dimensiProfil: data.dimensiProfil || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'capaian_pembelajaran'), cpData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...cpData } };
    } catch (error) {
        console.error('Add CP error:', error);
        return { success: false, error: error.message };
    }
}

// Update CP
export async function updateCP(cpId, data) {
    try {
        const docRef = doc(db, 'capaian_pembelajaran', cpId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update CP error:', error);
        return { success: false, error: error.message };
    }
}

// Delete CP
export async function deleteCP(cpId) {
    try {
        await deleteDoc(doc(db, 'capaian_pembelajaran', cpId));
        return { success: true };
    } catch (error) {
        console.error('Delete CP error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// TUJUAN PEMBELAJARAN (TP) FUNCTIONS
// =====================================================

// Get TP by CP
export async function getTPByCP(cpId) {
    try {
        const q = query(
            collection(db, 'tujuan_pembelajaran'),
            where('cpId', '==', cpId),
            orderBy('urutan', 'asc')
        );
        const snapshot = await getDocs(q);
        const tpList = [];
        snapshot.forEach(doc => {
            tpList.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: tpList };
    } catch (error) {
        console.error('Get TP error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Add TP
export async function addTP(data) {
    try {
        const userData = getCurrentUserData();
        const tpData = {
            userId: userData.uid,
            cpId: data.cpId,
            mapelId: data.mapelId,
            urutan: data.urutan,
            kode: data.kode,
            deskripsi: data.deskripsi,
            indikator: data.indikator || [],
            alokasi: data.alokasi || 0, // Jam pelajaran
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'tujuan_pembelajaran'), tpData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...tpData } };
    } catch (error) {
        console.error('Add TP error:', error);
        return { success: false, error: error.message };
    }
}

// Update TP
export async function updateTP(tpId, data) {
    try {
        const docRef = doc(db, 'tujuan_pembelajaran', tpId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update TP error:', error);
        return { success: false, error: error.message };
    }
}

// Delete TP
export async function deleteTP(tpId) {
    try {
        await deleteDoc(doc(db, 'tujuan_pembelajaran', tpId));
        return { success: true };
    } catch (error) {
        console.error('Delete TP error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// ATP (Alur Tujuan Pembelajaran) FUNCTIONS
// =====================================================

// Get ATP by User and Mapel
export async function getATP(userId, mapelId, tahunAjaran) {
    try {
        const q = query(
            collection(db, 'atp'),
            where('userId', '==', userId),
            where('mapelId', '==', mapelId),
            where('tahunAjaran', '==', tahunAjaran)
        );
        const snapshot = await getDocs(q);
        const atpList = [];
        snapshot.forEach(doc => {
            atpList.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: atpList };
    } catch (error) {
        console.error('Get ATP error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Generate ATP from CP and TP
export async function generateATP(mapelId, tahunAjaran, kelas) {
    try {
        const userData = getCurrentUserData();
        const schoolData = getCurrentSchoolData();
        
        // Get all CP for this mapel
        const cpResult = await getCPByMapel(mapelId);
        if (!cpResult.success || cpResult.data.length === 0) {
            return { success: false, error: 'Belum ada CP untuk mata pelajaran ini' };
        }
        
        // Get Mapel data
        const mapelDoc = await getDoc(doc(db, 'user_mapel', mapelId));
        const mapelData = mapelDoc.data();
        
        // Create ATP document
        const atpData = {
            userId: userData.uid,
            npsn: userData.npsn,
            mapelId: mapelId,
            mapelNama: mapelData.nama,
            tahunAjaran: tahunAjaran,
            kelas: kelas,
            namaSekolah: schoolData.namaSekolah,
            namaGuru: userData.namaGuru,
            kepalaSekolah: schoolData.kepalaSekolah,
            nipKepsek: schoolData.nipKepsek,
            capaianPembelajaran: cpResult.data.map(cp => ({
                cpId: cp.id,
                fase: cp.fase,
                elemen: cp.elemen,
                deskripsiCP: cp.deskripsiCP
            })),
            alurTP: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Get TP for each CP and add to alur
        for (const cp of cpResult.data) {
            const tpResult = await getTPByCP(cp.id);
            if (tpResult.success && tpResult.data.length > 0) {
                tpResult.data.forEach(tp => {
                    atpData.alurTP.push({
                        tpId: tp.id,
                        cpId: cp.id,
                        elemen: cp.elemen,
                        kode: tp.kode,
                        deskripsi: tp.deskripsi,
                        urutan: tp.urutan,
                        alokasi: tp.alokasi
                    });
                });
            }
        }
        
        // Sort alur by urutan
        atpData.alurTP.sort((a, b) => a.urutan - b.urutan);
        
        const docRef = await addDoc(collection(db, 'atp'), atpData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...atpData } };
    } catch (error) {
        console.error('Generate ATP error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) FUNCTIONS
// =====================================================

// Get KKTP
export async function getKKTP(userId, mapelId, tahunAjaran) {
    try {
        const q = query(
            collection(db, 'kktp'),
            where('userId', '==', userId),
            where('mapelId', '==', mapelId),
            where('tahunAjaran', '==', tahunAjaran)
        );
        const snapshot = await getDocs(q);
        const kktpList = [];
        snapshot.forEach(doc => {
            kktpList.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: kktpList };
    } catch (error) {
        console.error('Get KKTP error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Generate KKTP from TP
export async function generateKKTP(mapelId, tahunAjaran, kelas) {
    try {
        const userData = getCurrentUserData();
        const schoolData = getCurrentSchoolData();
        
        // Get mapel data
        const mapelDoc = await getDoc(doc(db, 'user_mapel', mapelId));
        const mapelData = mapelDoc.data();
        
        // Get all CP for this mapel
        const cpResult = await getCPByMapel(mapelId);
        if (!cpResult.success || cpResult.data.length === 0) {
            return { success: false, error: 'Belum ada CP untuk mata pelajaran ini' };
        }
        
        // Create KKTP document
        const kktpData = {
            userId: userData.uid,
            npsn: userData.npsn,
            mapelId: mapelId,
            mapelNama: mapelData.nama,
            tahunAjaran: tahunAjaran,
            kelas: kelas,
            namaSekolah: schoolData.namaSekolah,
            namaGuru: userData.namaGuru,
            kepalaSekolah: schoolData.kepalaSekolah,
            kriteria: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Get TP for each CP
        for (const cp of cpResult.data) {
            const tpResult = await getTPByCP(cp.id);
            if (tpResult.success && tpResult.data.length > 0) {
                tpResult.data.forEach(tp => {
                    kktpData.kriteria.push({
                        tpId: tp.id,
                        kodeTP: tp.kode,
                        deskripsiTP: tp.deskripsi,
                        indikator: tp.indikator || [],
                        // Default kriteria levels
                        levelKetercapaian: {
                            mulai: 'Peserta didik baru mulai memahami konsep dasar',
                            berkembang: 'Peserta didik sudah memahami sebagian konsep',
                            cakap: 'Peserta didik sudah memahami dan dapat menerapkan',
                            mahir: 'Peserta didik sangat memahami dan dapat mengembangkan'
                        },
                        teknikPenilaian: ['Observasi', 'Tes Tertulis', 'Unjuk Kerja']
                    });
                });
            }
        }
        
        const docRef = await addDoc(collection(db, 'kktp'), kktpData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...kktpData } };
    } catch (error) {
        console.error('Generate KKTP error:', error);
        return { success: false, error: error.message };
    }
}

// Update KKTP
export async function updateKKTP(kktpId, data) {
    try {
        const docRef = doc(db, 'kktp', kktpId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update KKTP error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// KELAS & ROMBEL FUNCTIONS
// =====================================================

// Get kelas by NPSN
export async function getKelasByNPSN(npsn) {
    try {
        const q = query(
            collection(db, 'kelas'),
            where('npsn', '==', npsn),
            orderBy('tingkat', 'asc')
        );
        const snapshot = await getDocs(q);
        const kelasList = [];
        snapshot.forEach(doc => {
            kelasList.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: kelasList };
    } catch (error) {
        console.error('Get kelas error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Add kelas
export async function addKelas(data) {
    try {
        const userData = getCurrentUserData();
        const kelasData = {
            npsn: userData.npsn,
            tingkat: data.tingkat, // 1-6 for SD, 7-9 for SMP, 10-12 for SMA
            namaKelas: data.namaKelas, // e.g., "1A", "7B"
            rombel: data.rombel || 'A', // A, B, C, etc
            waliKelas: data.waliKelas || '',
            jumlahSiswa: data.jumlahSiswa || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'kelas'), kelasData);
        return { success: true, id: docRef.id, data: { id: docRef.id, ...kelasData } };
    } catch (error) {
        console.error('Add kelas error:', error);
        return { success: false, error: error.message };
    }
}

// Update kelas
export async function updateKelas(kelasId, data) {
    try {
        const docRef = doc(db, 'kelas', kelasId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update kelas error:', error);
        return { success: false, error: error.message };
    }
}

// Delete kelas
export async function deleteKelas(kelasId) {
    try {
        await deleteDoc(doc(db, 'kelas', kelasId));
        return { success: true };
    } catch (error) {
        console.error('Delete kelas error:', error);
        return { success: false, error: error.message };
    }
}

// =====================================================
// AUTO-GENERATE FROM MASTER DATA
// =====================================================

// Sync data across all documents when CP is updated
export async function syncMasterData(cpId) {
    try {
        const cpDoc = await getDoc(doc(db, 'capaian_pembelajaran', cpId));
        if (!cpDoc.exists()) {
            return { success: false, error: 'CP not found' };
        }
        
        const cpData = cpDoc.data();
        
        // Update related ATP documents
        const atpQuery = query(
            collection(db, 'atp'),
            where('userId', '==', cpData.userId),
            where('mapelId', '==', cpData.mapelId)
        );
        const atpSnapshot = await getDocs(atpQuery);
        
        const batch = writeBatch(db);
        
        atpSnapshot.forEach((atpDoc) => {
            const atpData = atpDoc.data();
            const updatedCP = atpData.capaianPembelajaran.map(cp => {
                if (cp.cpId === cpId) {
                    return {
                        ...cp,
                        fase: cpData.fase,
                        elemen: cpData.elemen,
                        deskripsiCP: cpData.deskripsiCP
                    };
                }
                return cp;
            });
            
            batch.update(doc(db, 'atp', atpDoc.id), {
                capaianPembelajaran: updatedCP,
                updatedAt: new Date().toISOString()
            });
        });
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('Sync master data error:', error);
        return { success: false, error: error.message };
    }
}