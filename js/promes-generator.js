// js/promes-generator.js
import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const formGeneratePromes = document.getElementById('form-generate-promes');
const inputRombel = document.getElementById('input-rombel-promes');
const selectTingkat = document.getElementById('select-tingkat-promes');
const selectSemester = document.getElementById('select-semester-promes');
const btnGeneratePromes = document.getElementById('btn-generate-promes');
const promesOutputContainer = document.getElementById('promes-output-container');
const labelPromesKelas = document.getElementById('label-promes-kelas');
const tabelPromesBody = document.getElementById('tabel-promes-body');
const btnPrintPromes = document.getElementById('btn-print-promes');

// Mapping Hari ke Index Date JS (Minggu = 0, Senin = 1, dst)
const dayMap = { "Minggu": 0, "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6 };
const reverseDayMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// --- UTILITY: Penentuan Tanggal Mulai Semester ---
function getSemesterStartDate(semester) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    // Asumsi V1: Ganjil mulai pertengahan Juli, Genap mulai awal Januari
    if (semester === 'Ganjil') {
        // Jika sedang bulan Jan-Jun, Ganjil artinya tahun lalu
        const startYear = (month < 5) ? year - 1 : year;
        return new Date(startYear, 6, 15); // 15 Juli
    } else {
        // Jika sedang bulan Jul-Des, Genap artinya tahun depan
        const startYear = (month >= 5) ? year + 1 : year;
        return new Date(startYear, 0, 8); // 8 Januari
    }
}

// --- CORE ENGINE: Generator Promes ---
async function generatePromes(rombel, tingkat, semester) {
    if (!auth.currentUser) {
        alert("Sesi habis. Silakan login kembali.");
        return;
    }

    try {
        btnGeneratePromes.disabled = true;
        btnGeneratePromes.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;

        // 1. Ambil Jadwal Mengajar Guru untuk Rombel ini
        const qJadwal = query(
            collection(db, "schedules"),
            where("teacherId", "==", auth.currentUser.uid),
            where("rombel", "==", rombel)
        );
        const snapJadwal = await getDocs(qJadwal);
        
        if (snapJadwal.empty) {
            alert(`Jadwal untuk kelas ${rombel} belum ditemukan. Silakan isi jadwal mengajar Anda di menu Jadwal terlebih dahulu agar sistem bisa memetakan tanggal.`);
            btnGeneratePromes.disabled = false;
            btnGeneratePromes.innerHTML = `<i class="fas fa-magic"></i> Generate Promes`;
            promesOutputContainer.classList.add('hidden');
            return;
        }

        // Simpan hari apa saja guru ini mengajar di kelas tersebut (diurutkan harinya)
        let hariMengajar = [];
        snapJadwal.forEach(doc => {
            const data = doc.data();
            hariMengajar.push({
                hari: data.day,
                dayIndex: dayMap[data.day],
                waktu: `${data.startTime} - ${data.endTime}`
            });
        });
        // Urutkan jadwal berdasarkan hari (Senin -> Sabtu)
        hariMengajar.sort((a, b) => a.dayIndex - b.dayIndex);

        // 2. Ambil Tujuan Pembelajaran (TP) untuk Kelas & Semester ini
        const qCP = query(
            collection(db, "cp_data"),
            where("kelas", "==", parseInt(tingkat)),
            where("semester", "==", semester),
            where("mapel", "==", "PAI")
        );
        const snapCP = await getDocs(qCP);

        if (snapCP.empty) {
            alert("Data Tujuan Pembelajaran kosong untuk kelas dan semester ini.");
            btnGeneratePromes.disabled = false;
            btnGeneratePromes.innerHTML = `<i class="fas fa-magic"></i> Generate Promes`;
            return;
        }

        let tpData = [];
        snapCP.forEach(doc => tpData.push(doc.data()));
        
        // 3. MESIN SINKRONISASI TANGGAL (Auto-Mapping)
        let currentDate = getSemesterStartDate(semester);
        let hasilPromes = [];
        let tpIndex = 0;
        let pertemuanKe = 1;

        // Looping selama masih ada TP yang belum dipetakan
        while (tpIndex < tpData.length) {
            const currentDayIndex = currentDate.getDay();
            
            // Cek apakah hari ini ada jadwal mengajar di rombel ini?
            const jadwalHariIni = hariMengajar.find(h => h.dayIndex === currentDayIndex);

            if (jadwalHariIni) {
                // Mapping TP ke Tanggal ini
                hasilPromes.push({
                    pertemuan: pertemuanKe,
                    tanggal: new Date(currentDate), // Clone date
                    hari: reverseDayMap[currentDayIndex],
                    waktu: jadwalHariIni.waktu,
                    tp: tpData[tpIndex].tujuanPembelajaran,
                    elemen: tpData[tpIndex].elemen
                });
                
                tpIndex++; // Maju ke TP berikutnya
                pertemuanKe++;
            }
            
            // Lanjut ke besoknya
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 4. Render ke Layar
        renderPromesTable(rombel, semester, hasilPromes);

    } catch (error) {
        console.error("Promes Error:", error);
        alert("Terjadi kesalahan saat men-generate Promes.");
    } finally {
        btnGeneratePromes.disabled = false;
        btnGeneratePromes.innerHTML = `<i class="fas fa-magic"></i> Generate Promes`;
    }
}

// --- UI RENDERER ---
function renderPromesTable(rombel, semester, data) {
    tabelPromesBody.innerHTML = '';
    labelPromesKelas.innerText = `Program Semester - Kelas ${rombel} (${semester})`;
    
    data.forEach((item) => {
        // Format Tanggal: DD/MM/YYYY
        const tglStr = `${item.tanggal.getDate().toString().padStart(2, '0')}/${(item.tanggal.getMonth() + 1).toString().padStart(2, '0')}/${item.tanggal.getFullYear()}`;

        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-gray-50";

        tr.innerHTML = `
            <td class="px-4 py-3 border-r align-top text-center font-bold text-gray-700">${item.pertemuan}</td>
            <td class="px-4 py-3 border-r align-top text-gray-800 font-medium">
                ${item.hari}<br>
                <span class="text-xs text-blue-600">${tglStr}</span>
            </td>
            <td class="px-4 py-3 border-r align-top leading-relaxed text-gray-700 text-justify">
                <span class="text-xs font-bold text-gray-400 uppercase block mb-1">${item.elemen}</span>
                ${item.tp}
            </td>
            <td class="px-4 py-3 align-top text-gray-600 text-sm">
                Sesuai Jadwal:<br>${item.waktu}
            </td>
        `;
        tabelPromesBody.appendChild(tr);
    });

    promesOutputContainer.classList.remove('hidden');
}

// --- EVENT LISTENERS ---
formGeneratePromes.addEventListener('submit', (e) => {
    e.preventDefault();
    const rombel = inputRombel.value.trim();
    const tingkat = selectTingkat.value;
    const semester = selectSemester.value;
    generatePromes(rombel, tingkat, semester);
});

// Fitur Print PROMES
btnPrintPromes.addEventListener('click', () => {
    const printContents = document.getElementById('promes-output-container').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
        <div class="p-8">
            <h1 class="text-2xl font-bold mb-2 text-center">PROGRAM SEMESTER (PROMES)</h1>
            <h2 class="text-lg mb-6 text-center text-gray-600">${labelPromesKelas.innerText}</h2>
            ${printContents}
        </div>
    `;
    
    window.print();
    
    document.body.innerHTML = originalContents;
    window.location.reload(); 
});