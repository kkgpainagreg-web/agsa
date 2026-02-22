// js/atp-generator.js
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const formGenerateATP = document.getElementById('form-generate-atp');
const selectKelas = document.getElementById('select-kelas-atp');
const btnGenerate = document.getElementById('btn-generate-atp');
const atpOutputContainer = document.getElementById('atp-output-container');
const labelAtpKelas = document.getElementById('label-atp-kelas');
const tabelAtpBody = document.getElementById('tabel-atp-body');
const btnPrintAtp = document.getElementById('btn-print-atp');

// State untuk menyimpan hasil query sementara
let currentAtpData = [];

// --- CORE ENGINE: Fetch & Sort Data ---
async function generateATP(kelas) {
    try {
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;

        // 1. Tarik data dari Firestore berdasarkan Kelas (Mapel PAI default)
        const q = query(
            collection(db, "cp_data"), 
            where("kelas", "==", parseInt(kelas)),
            where("mapel", "==", "PAI")
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            alert("Data Tujuan Pembelajaran untuk kelas ini kosong. Pastikan Anda sudah melakukan sinkronisasi pai.csv di menu Profil & Dasar.");
            atpOutputContainer.classList.add('hidden');
            return;
        }

        const rawData = [];
        snapshot.forEach(doc => {
            rawData.push({ id: doc.id, ...doc.data() });
        });

        // 2. Client-Side Sorting: Pisahkan Ganjil dan Genap agar menjadi "Alur" yang benar
        const ganjil = rawData.filter(item => item.semester.toLowerCase() === 'ganjil');
        const genap = rawData.filter(item => item.semester.toLowerCase() === 'genap');

        // Optional: Sort by Elemen jika diperlukan (Alfabetis)
        const sortByElemen = (a, b) => a.elemen.localeCompare(b.elemen);
        ganjil.sort(sortByElemen);
        genap.sort(sortByElemen);

        // Gabungkan kembali menjadi satu alur utuh
        currentAtpData = [...ganjil, ...genap];

        // 3. Render ke UI Table
        renderATPTable(kelas, currentAtpData);

    } catch (error) {
        console.error("Gagal men-generate ATP:", error);
        alert("Terjadi kesalahan saat memproses ATP.");
    } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<i class="fas fa-cogs"></i> Generate ATP`;
    }
}

// --- UI RENDERER ---
function renderATPTable(kelas, data) {
    tabelAtpBody.innerHTML = '';
    labelAtpKelas.innerText = `ATP Kelas ${kelas} (Mata Pelajaran: PAI)`;
    
    let currentSemester = '';

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-gray-50";

        // Logika Rowspan Visual Sederhana (Hanya tampilkan teks semester di baris pertama semester tersebut)
        let semesterText = '';
        if (item.semester !== currentSemester) {
            semesterText = `<span class="font-bold text-blue-700 uppercase">${item.semester}</span>`;
            currentSemester = item.semester;
        }

        tr.innerHTML = `
            <td class="px-4 py-3 border-r align-top text-center">${semesterText}</td>
            <td class="px-4 py-3 border-r align-top font-medium text-gray-800">${item.elemen}</td>
            <td class="px-4 py-3 align-top leading-relaxed text-gray-700 text-justify">
                <span class="font-bold mr-1">${index + 1}.</span> ${item.tujuanPembelajaran}
            </td>
        `;
        tabelAtpBody.appendChild(tr);
    });

    // Tampilkan Container
    atpOutputContainer.classList.remove('hidden');
}

// --- EVENT LISTENERS ---
formGenerateATP.addEventListener('submit', (e) => {
    e.preventDefault();
    const kelasSelected = selectKelas.value;
    generateATP(kelasSelected);
});

// Fitur Print Sederhana
btnPrintAtp.addEventListener('click', () => {
    // Sembunyikan elemen lain, print hanya tabel
    const printContents = document.getElementById('atp-output-container').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
        <div class="p-8">
            <h1 class="text-2xl font-bold mb-4 text-center">ALUR TUJUAN PEMBELAJARAN (ATP)</h1>
            ${printContents}
        </div>
    `;
    
    window.print();
    
    // Kembalikan ke tampilan semula lalu reload scripts
    document.body.innerHTML = originalContents;
    window.location.reload(); 
});