// js/jurnal.js
import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs, addDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const inputTanggal = document.getElementById('jurnal-tanggal');
const jadwalList = document.getElementById('jurnal-jadwal-list');
const formJurnal = document.getElementById('form-jurnal');
const selectTp = document.getElementById('jurnal-tp');
const tabelJurnalBody = document.getElementById('tabel-jurnal-body');
const btnPrintJurnal = document.getElementById('btn-print-jurnal');

// Konversi Hari JS ke Format Indonesia
const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// Set default tanggal hari ini saat diload
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    inputTanggal.value = today;
    
    // Delay sedikit agar auth Firebase siap
    setTimeout(() => {
        loadJadwalHarian(today);
        loadRekapJurnal();
    }, 1500);
});

// Event Listener saat tanggal diubah
inputTanggal.addEventListener('change', (e) => {
    loadJadwalHarian(e.target.value);
});

// --- FITUR 1: Tarik Jadwal Mengajar Sesuai Tanggal ---
async function loadJadwalHarian(dateString) {
    if (!auth.currentUser) return;
    
    jadwalList.innerHTML = '<p class="text-sm text-gray-500"><i class="fas fa-spinner fa-spin"></i> Mengecek jadwal...</p>';
    formJurnal.classList.add('hidden');
    
    const dateObj = new Date(dateString);
    const namaHari = daysIndo[dateObj.getDay()]; // cth: "Senin"

    try {
        const q = query(
            collection(db, "schedules"),
            where("teacherId", "==", auth.currentUser.uid),
            where("day", "==", namaHari)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            jadwalList.innerHTML = `<p class="text-sm text-red-500 font-medium">Tidak ada jadwal mengajar pada hari ${namaHari}.</p>`;
            return;
        }

        jadwalList.innerHTML = ''; // Bersihkan
        let schedules = [];
        snapshot.forEach(doc => schedules.push({ id: doc.id, ...doc.data() }));
        
        // Urutkan berdasarkan jam mulai
        schedules.sort((a, b) => a.startTime.localeCompare(b.startTime));

        schedules.forEach(sched => {
            const div = document.createElement('div');
            div.className = "p-3 border rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer transition flex justify-between items-center";
            div.innerHTML = `
                <div>
                    <p class="font-bold text-blue-700">${sched.rombel} <span class="text-xs text-gray-500 font-normal">(${sched.subject})</span></p>
                    <p class="text-xs text-gray-600"><i class="far fa-clock"></i> ${sched.startTime} - ${sched.endTime}</p>
                </div>
                <button class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Isi Jurnal</button>
            `;
            // Saat diklik, buka form dan siapkan dropdown TP
            div.addEventListener('click', () => bukaFormJurnal(sched, dateString, namaHari));
            jadwalList.appendChild(div);
        });

    } catch (error) {
        console.error("Error load jadwal:", error);
        jadwalList.innerHTML = `<p class="text-sm text-red-500">Gagal memuat jadwal.</p>`;
    }
}

// --- FITUR 2: Buka Form & Tarik TP Sesuai Kelas ---
async function bukaFormJurnal(sched, dateString, namaHari) {
    formJurnal.classList.remove('hidden');
    document.getElementById('jurnal-kelas-aktif').innerText = `Mengisi Jurnal: Kelas ${sched.rombel} (${sched.startTime})`;
    document.getElementById('jurnal-rombel-hidden').value = sched.rombel;
    document.getElementById('jurnal-hari-hidden').value = `${namaHari}, ${dateString}`;
    
    // Kosongkan isian
    document.getElementById('jurnal-materi').value = '';
    document.getElementById('jurnal-kehadiran').value = '';
    document.getElementById('jurnal-hasil').value = '';
    selectTp.innerHTML = '<option value="">Memuat TP...</option>';

    // Ekstrak angka kelas dari rombel (Contoh "7A" -> 7, "10 IPA" -> 10)
    const tingkatMatch = sched.rombel.match(/\d+/);
    const tingkat = tingkatMatch ? parseInt(tingkatMatch[0]) : null;

    if (!tingkat) {
        selectTp.innerHTML = '<option value="">Gagal deteksi tingkat kelas.</option>';
        return;
    }

    try {
        // Tarik TP dari database untuk kelas ini (Asumsi V1: load semua semester Ganjil & Genap)
        const q = query(
            collection(db, "cp_data"),
            where("kelas", "==", tingkat),
            where("mapel", "==", "PAI")
        );
        const snap = await getDocs(q);
        
        selectTp.innerHTML = '<option value="">-- Pilih TP yang diajarkan --</option>';
        
        snap.forEach(doc => {
            const data = doc.data();
            const option = document.createElement('option');
            // Simpan TP utuh di value agar mudah disalin ke textarea
            option.value = data.tujuanPembelajaran;
            option.setAttribute('data-elemen', data.elemen);
            option.textContent = `[${data.semester}] ${data.tujuanPembelajaran.substring(0, 50)}...`;
            selectTp.appendChild(option);
        });

        // Event: Saat TP dipilih, otomatis isi Materi dan Hasil (TIDAK PERLU NGETIK LAGI)
        selectTp.addEventListener('change', function() {
            if(this.value) {
                const selectedOption = this.options[this.selectedIndex];
                document.getElementById('jurnal-materi').value = selectedOption.getAttribute('data-elemen');
                document.getElementById('jurnal-hasil').value = "Tercapai: " + this.value;
            }
        });

    } catch (error) {
        console.error(error);
        selectTp.innerHTML = '<option value="">Error memuat TP.</option>';
    }
}

// --- FITUR 3: Simpan Jurnal ke Firestore ---
formJurnal.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const dataJurnal = {
        teacherId: auth.currentUser.uid,
        tanggalInput: inputTanggal.value,
        hariTanggal: document.getElementById('jurnal-hari-hidden').value,
        rombel: document.getElementById('jurnal-rombel-hidden').value,
        materi: document.getElementById('jurnal-materi').value,
        tp: selectTp.value,
        kehadiran: document.getElementById('jurnal-kehadiran').value,
        hasil: document.getElementById('jurnal-hasil').value,
        timestamp: new Date()
    };

    try {
        const btn = formJurnal.querySelector('button[type="submit"]');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        
        await addDoc(collection(db, "journals"), dataJurnal);
        
        alert("Jurnal berhasil disimpan!");
        formJurnal.reset();
        formJurnal.classList.add('hidden');
        loadRekapJurnal(); // Refresh tabel

        btn.innerHTML = `<i class="fas fa-save mr-2"></i> Simpan Jurnal`;
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan jurnal.");
    }
});

// --- FITUR 4: Tampilkan Rekap Jurnal ---
async function loadRekapJurnal() {
    if (!auth.currentUser) return;
    
    tabelJurnalBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Memuat data...</td></tr>';
    
    try {
        const q = query(
            collection(db, "journals"),
            where("teacherId", "==", auth.currentUser.uid),
            orderBy("tanggalInput", "desc")
        );
        const snap = await getDocs(q);
        
        tabelJurnalBody.innerHTML = '';
        if (snap.empty) {
            tabelJurnalBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-gray-500">Belum ada catatan jurnal.</td></tr>';
            return;
        }

        let no = 1;
        snap.forEach(doc => {
            const d = doc.data();
            const tr = document.createElement('tr');
            tr.className = "bg-white border-b hover:bg-gray-50";
            tr.innerHTML = `
                <td class="px-3 py-2 text-center">${no++}</td>
                <td class="px-3 py-2 whitespace-nowrap text-xs">${d.hariTanggal}</td>
                <td class="px-3 py-2 font-bold">${d.rombel}</td>
                <td class="px-3 py-2 text-xs">${d.materi}</td>
                <td class="px-3 py-2 text-xs truncate max-w-xs" title="${d.tp}">${d.tp}</td>
                <td class="px-3 py-2 text-xs">${d.kehadiran}</td>
                <td class="px-3 py-2 text-xs truncate max-w-xs" title="${d.hasil}">${d.hasil}</td>
            `;
            tabelJurnalBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tabelJurnalBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-red-500">Gagal memuat rekap. Pastikan index Firestore dibuat jika error (Cek Console).</td></tr>';
    }
}

// --- FITUR 5: Cetak Jurnal Format Resmi (Landscape) ---
btnPrintJurnal.addEventListener('click', async () => {
    // Tarik semua data jurnal dari database
    const q = query(
        collection(db, "journals"),
        where("teacherId", "==", auth.currentUser.uid),
        orderBy("tanggalInput", "asc")
    );
    const snap = await getDocs(q);
    
    let tableRows = '';
    let no = 1;
    snap.forEach(doc => {
        const d = doc.data();
        tableRows += `
            <tr>
                <td style="text-align: center;">${no++}</td>
                <td style="white-space: nowrap; text-align: center;">${d.hariTanggal}</td>
                <td style="text-align: center; font-weight: bold;">${d.rombel}</td>
                <td>${d.materi}</td>
                <td style="text-align: justify;">${d.tp}</td>
                <td style="text-align: center;">${d.kehadiran}</td>
                <td style="text-align: justify;">${d.hasil}</td>
            </tr>
        `;
    });

    // Ambil Identitas dari UI Profil
    const namaSekolah = document.getElementById('input-sekolah')?.value || "Nama Sekolah";
    const kepsek = document.getElementById('input-kepsek')?.value || "_________________________";
    const nipKepsek = document.getElementById('input-nip-kepsek')?.value || "_________________________";
    const guru = document.getElementById('input-guru')?.value || auth.currentUser.displayName || "_________________________";
    const nipGuru = document.getElementById('input-nip-guru')?.value || "_________________________";
    const kota = document.getElementById('input-kota')?.value || "Tasikmalaya";
    
    // Penentuan Tahun Ajaran Otomatis
    const now = new Date();
    const year = now.getFullYear();
    const isGanjil = now.getMonth() >= 6; // Juli - Des
    const tahunAjar = isGanjil ? `${year}/${year+1}` : `${year-1}/${year}`;
    const semesterTeks = isGanjil ? "Ganjil" : "Genap";

    // Format CSS Print (Landscape & Styling identik dengan Promes)
    const cssPrint = `
    <style>
        @page { size: A4 landscape; margin: 10mm; }
        .print-container { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: black; background: white; padding: 20px; }
        .header-title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 20px; text-transform: uppercase; border-bottom: 2px solid black; padding-bottom: 10px; }
        .identity-table { width: 100%; margin-bottom: 15px; font-weight: bold; font-size: 11pt; }
        .identity-table td { padding: 3px 5px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10.5pt; }
        .data-table th, .data-table td { border: 1px solid black; padding: 8px; vertical-align: top; }
        .data-table th { background-color: #ecf0f1; text-align: center; font-weight: bold; vertical-align: middle; }
        .signature-area { width: 100%; margin-top: 40px; display: table; page-break-inside: avoid; }
        .signature-box { display: table-cell; width: 50%; text-align: center; font-size: 11pt; }
        .signature-box.right { text-align: right; padding-right: 50px; }
        .signature-name { text-decoration: underline; font-weight: bold; margin-top: 70px; }
    </style>
    `;

    const printHTML = `
        ${cssPrint}
        <div class="print-container">
            <div class="header-title">
                Buku Agenda / Jurnal Pembelajaran Harian<br>
                Pendidikan Agama Islam dan Budi Pekerti
            </div>
            
            <table class="identity-table">
                <tr>
                    <td width="150">Satuan Pendidikan</td><td width="10">:</td><td width="300">${namaSekolah}</td>
                    <td width="150">Semester</td><td width="10">:</td><td>${semesterTeks}</td>
                </tr>
                <tr>
                    <td>Mata Pelajaran</td><td>:</td><td>Pendidikan Agama Islam & BP</td>
                    <td>Tahun Pelajaran</td><td>:</td><td>${tahunAjar}</td>
                </tr>
            </table>

            <table class="data-table">
                <thead>
                    <tr>
                        <th width="3%">No</th>
                        <th width="12%">Hari, Tanggal</th>
                        <th width="8%">Kelas</th>
                        <th width="15%">Materi / Elemen</th>
                        <th width="30%">Tujuan Pembelajaran</th>
                        <th width="10%">Absensi</th>
                        <th width="22%">Hasil / Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>

            <div class="signature-area">
                <div class="signature-box">
                    Mengetahui,<br>Kepala Sekolah
                    <div class="signature-name">${kepsek}</div>
                    NIP. ${nipKepsek}
                </div>
                <div class="signature-box right" style="text-align: center; display: inline-block; float: right; width: 40%;">
                    ${kota}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}<br>Guru Mata Pelajaran
                    <div class="signature-name">${guru}</div>
                    NIP. ${nipGuru}
                </div>
            </div>
        </div>
    `;

    // Proses Print
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printHTML;
    window.print();
    
    // Restore UI
    document.body.innerHTML = originalContents;
    window.location.reload();
});