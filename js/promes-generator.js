// js/promes-generator.js
import { db, auth } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const formGeneratePromes = document.getElementById('form-generate-promes');
const inputRombel = document.getElementById('input-rombel-promes');
const selectTingkat = document.getElementById('select-tingkat-promes');
const selectSemester = document.getElementById('select-semester-promes');
const inputJp = document.getElementById('input-jp-promes');
const btnGenerate = document.getElementById('btn-generate-promes');
const printArea = document.getElementById('print-area-promes');

const namaBulanGanjil = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const namaBulanGenap = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// --- CSS KHUSUS PRINT (Mengadopsi file referensi user) ---
const cssPrint = `
<style>
    @page { size: A4 landscape; margin: 10mm; }
    .print-container { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; color: black; background: white; padding: 20px;}
    .header-title { text-align: center; font-weight: bold; font-size: 13pt; margin-bottom: 15px; text-transform: uppercase; }
    .identity-table { width: 70%; margin-bottom: 15px; font-weight: bold; font-size: 10.5pt; text-align: left; }
    .identity-table td { padding: 2px 5px; vertical-align: top; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9.5pt; }
    .data-table th, .data-table td { border: 1px solid black; padding: 4px; vertical-align: middle; text-align: center; }
    .data-table th { background-color: #ecf0f1; font-weight: bold; }
    .data-table td.text-left { text-align: left; padding-left: 5px; }
    .cell-date { font-size: 7.5pt; color: #555; font-weight: bold; display: block; margin-top: 2px; }
    .cell-jp { font-size: 10pt; font-weight: bold; color: #000; }
    .signature-area { width: 100%; margin-top: 30px; display: table; page-break-inside: avoid; }
    .signature-box { display: table-cell; width: 50%; text-align: center; font-size: 11pt; }
    .signature-box.right { text-align: right; padding-right: 50px; }
    .signature-name { text-decoration: underline; font-weight: bold; margin-top: 70px; }
    .page-break { page-break-before: always; margin-top: 30px; padding-top: 30px; border-top: 1px dashed #ccc;}
</style>
`;

// --- UTILITY: Auto School Year ---
function getTahunAjar() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    return month >= 5 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// --- CORE ENGINE: Generator Prota & Promes ---
async function generateProtaPromes(rombel, tingkat, semester, jpPerTP) {
    try {
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menghitung Kalender...`;

        // 1. Ambil Identitas dari Profil
        const namaSekolah = document.getElementById('input-sekolah')?.value || "Nama Sekolah";
        const kepsek = document.getElementById('input-kepsek')?.value || ".............................";
        const nipKepsek = document.getElementById('input-nip-kepsek')?.value || ".............................";
        const guru = document.getElementById('input-guru')?.value || auth.currentUser?.displayName || ".............................";
        const nipGuru = document.getElementById('input-nip-guru')?.value || ".............................";
        const kota = document.getElementById('input-kota')?.value || "Kota";
        const tanggalPenetapan = `${kota}, 15 ${semester === 'Ganjil' ? 'Juli' : 'Januari'} ${new Date().getFullYear()}`;

        // 2. Cek Jadwal Mengajar (Hari apa saja di kelas ini?)
        const qJadwal = query(collection(db, "schedules"), where("teacherId", "==", auth.currentUser.uid), where("rombel", "==", rombel));
        const snapJadwal = await getDocs(qJadwal);
        
        let hariMengajarIndices = [];
        let teksHari = [];
        snapJadwal.forEach(doc => {
            const dayIdx = namaHari.indexOf(doc.data().day);
            if(dayIdx !== -1 && !hariMengajarIndices.includes(dayIdx)) {
                hariMengajarIndices.push(dayIdx);
                teksHari.push(doc.data().day);
            }
        });

        if (hariMengajarIndices.length === 0) {
            alert(`Sistem tidak menemukan jadwal mengajar Anda untuk Rombel ${rombel}. Pastikan Anda sudah mengisi menu Jadwal.`);
            return;
        }

        // 3. Tarik TP dari Database
        const qCP = query(collection(db, "cp_data"), where("kelas", "==", parseInt(tingkat)), where("semester", "==", semester));
        const snapCP = await getDocs(qCP);
        
        if (snapCP.empty) {
            alert(`Data CP/TP untuk Kelas ${tingkat} ${semester} kosong.`);
            return;
        }

        let tpData = [];
        snapCP.forEach(doc => tpData.push(doc.data()));
        // Group by Elemen (sebagai Bab)
        const groupedData = tpData.reduce((acc, curr) => {
            if (!acc[curr.elemen]) acc[curr.elemen] = [];
            acc[curr.elemen].push(curr.tujuanPembelajaran);
            return acc;
        }, {});

        // 4. Bangun Array Tanggal Mengajar Real (Kalender)
        const thnAktif = new Date().getFullYear();
        const thnOperasional = (semester === "Ganjil") ? thnAktif : thnAktif + 1; // Asumsi sederhana
        const blnAwal = (semester === "Ganjil") ? 6 : 0; // Juli = 6, Jan = 0
        
        let semuaTanggal = [];
        for (let i = 0; i < 6; i++) {
            let blnSekarang = blnAwal + i;
            let jmlHari = new Date(thnOperasional, blnSekarang + 1, 0).getDate();
            for (let tgl = 1; tgl <= jmlHari; tgl++) {
                let tglObj = new Date(thnOperasional, blnSekarang, tgl);
                if (hariMengajarIndices.includes(tglObj.getDay())) {
                    semuaTanggal.push(tglObj);
                }
            }
        }

        // 5. Distribusikan TP ke Tanggal (Logic Promes)
        let htmlProta = "";
        let barisPromes = [];
        let idxTgl = 0;
        let noBab = 1;

        for (const [elemen, arrTP] of Object.entries(groupedData)) {
            const rowspanBab = arrTP.length;
            const totalJPBab = rowspanBab * jpPerTP;

            arrTP.forEach((tp, indexSub) => {
                // Susun baris untuk PROTA
                htmlProta += `<tr>`;
                if (indexSub === 0) {
                    htmlProta += `<td rowspan="${rowspanBab}">${noBab}</td>`;
                    htmlProta += `<td rowspan="${rowspanBab}">${semester}</td>`;
                    htmlProta += `<td rowspan="${rowspanBab}" class="text-left">${elemen}</td>`;
                }
                htmlProta += `<td class="text-left">${tp}</td>`;
                if (indexSub === 0) htmlProta += `<td rowspan="${rowspanBab}">${totalJPBab} JP</td>`;
                htmlProta += `</tr>`;

                // Kalkulasi Tanggal untuk PROMES
                let alokasiPromes = [];
                let sisaJpTP = jpPerTP;

                // Loop hingga JP untuk TP ini habis dibagikan ke hari mengajar
                while (sisaJpTP > 0 && idxTgl < semuaTanggal.length) {
                    let tglAktif = semuaTanggal[idxTgl];
                    
                    // Asumsi: 1 hari mengajar = max JP per pertemuan yang diinput user
                    let jpHariIni = sisaJpTP; // Untuk V1, kita habiskan JP TP di hari tersebut
                    
                    alokasiPromes.push({ date: tglAktif, jp: jpHariIni });
                    sisaJpTP -= jpHariIni;
                    idxTgl++; // Pindah ke pertemuan berikutnya untuk TP selanjutnya
                }

                barisPromes.push({
                    namaBab: indexSub === 0 ? noBab : "",
                    namaSub: tp,
                    totalJp: jpPerTP,
                    alokasi: alokasiPromes,
                    rowspan: indexSub === 0 ? rowspanBab : 0
                });
            });
            noBab++;
        }

        // 6. RENDER PROMES HEADER & BODY (Matriks 6 Bulan x 5 Minggu)
        const arrBulan = (semester === "Ganjil") ? namaBulanGanjil : namaBulanGenap;
        let headPromes = `<tr><th rowspan="2" width="3%">No</th><th rowspan="2" width="22%">Tujuan Pembelajaran</th><th rowspan="2" width="4%">JP</th>`;
        arrBulan.forEach(b => headPromes += `<th colspan="5">${b}</th>`);
        headPromes += `</tr><tr>`;
        for(let i=0; i<6; i++) {
            headPromes += `<th>1</th><th>2</th><th>3</th><th>4</th><th>5</th>`;
        }
        headPromes += `</tr>`;

        let htmlPromesBody = "";
        barisPromes.forEach(row => {
            htmlPromesBody += `<tr>`;
            if(row.rowspan > 0) htmlPromesBody += `<td rowspan="${row.rowspan}">${row.namaBab}</td>`;
            htmlPromesBody += `<td class="text-left text-xs">${row.namaSub}</td><td>${row.totalJp}</td>`;

            for (let b = 0; b < 6; b++) {
                for (let w = 1; w <= 5; w++) {
                    let bulanTarget = blnAwal + b;
                    // Filter apakah ada alokasi di bulan & minggu ini (Minggu 1-5)
                    let alokasiSelIni = row.alokasi.filter(a => {
                        let aMonth = a.date.getMonth();
                        let aWeek = Math.ceil(a.date.getDate() / 7);
                        if(aWeek > 5) aWeek = 5;
                        return (aMonth === bulanTarget) && (aWeek === w);
                    });

                    if(alokasiSelIni.length > 0) {
                        let totalJpSel = alokasiSelIni.reduce((sum, a) => sum + a.jp, 0);
                        let labelTgl = alokasiSelIni.map(a => a.date.getDate()).join(',');
                        htmlPromesBody += `<td style="background-color:#eaf2ff;">
                            <span class="cell-jp">${totalJpSel}</span>
                            <span class="cell-date">(${labelTgl})</span>
                        </td>`;
                    } else {
                        htmlPromesBody += `<td></td>`;
                    }
                }
            }
            htmlPromesBody += `</tr>`;
        });

        // 7. GABUNGKAN SEMUA KE TEMPLATE PRINT
        const dokumenCetak = `
            ${cssPrint}
            <div class="print-container">
                
                <div class="header-title">PROGRAM TAHUNAN (PROTA)<br>PENDIDIKAN AGAMA ISLAM DAN BUDI PEKERTI</div>
                <table class="identity-table">
                    <tr><td width="160">Satuan Pendidikan</td><td width="10">:</td><td>${namaSekolah}</td></tr>
                    <tr><td>Mata Pelajaran</td><td>:</td><td>Pendidikan Agama Islam & BP</td></tr>
                    <tr><td>Fase / Kelas / Rombel</td><td>:</td><td>Fase ${tingkat >= 7 ? 'D' : tingkat} / Kelas ${tingkat} / ${rombel}</td></tr>
                    <tr><td>Tahun Ajaran</td><td>:</td><td>${getTahunAjar()}</td></tr>
                </table>
                
                <table class="data-table">
                    <thead>
                        <tr><th width="5%">No</th><th width="10%">Semester</th><th width="30%">Elemen / Bab</th><th width="45%">Tujuan Pembelajaran (Sub Materi)</th><th width="10%">Alokasi Waktu</th></tr>
                    </thead>
                    <tbody>${htmlProta}</tbody>
                </table>
                <div class="signature-area">
                    <div class="signature-box">Mengetahui,<br>Kepala Sekolah<div class="signature-name">${kepsek}</div>NIP. ${nipKepsek}</div>
                    <div class="signature-box right">${tanggalPenetapan}<br>Guru Mata Pelajaran<div class="signature-name">${guru}</div>NIP. ${nipGuru}</div>
                </div>

                <div class="page-break"></div>

                <div class="header-title">PROGRAM SEMESTER (PROSEM)<br>SEMESTER ${semester.toUpperCase()}</div>
                <table class="identity-table">
                    <tr><td width="160">Satuan Pendidikan</td><td width="10">:</td><td>${namaSekolah}</td></tr>
                    <tr><td>Mata Pelajaran</td><td>:</td><td>Pendidikan Agama Islam & BP</td></tr>
                    <tr><td>Kelas / Rombel</td><td>:</td><td>Kelas ${tingkat} / ${rombel}</td></tr>
                    <tr><td>Tahun Ajaran</td><td>:</td><td>${getTahunAjar()}</td></tr>
                    <tr><td>Hari Efektif KBM</td><td>:</td><td style="color:#c0392b;">Setiap Hari ${teksHari.join(', ')}</td></tr>
                </table>

                <table class="data-table">
                    <thead>${headPromes}</thead>
                    <tbody>${htmlPromesBody}</tbody>
                </table>
                <div class="signature-area">
                    <div class="signature-box">Mengetahui,<br>Kepala Sekolah<div class="signature-name">${kepsek}</div>NIP. ${nipKepsek}</div>
                    <div class="signature-box right">${tanggalPenetapan}<br>Guru Mata Pelajaran<div class="signature-name">${guru}</div>NIP. ${nipGuru}</div>
                </div>

            </div>
        `;

        // 8. Cetak Dokumen
        printArea.innerHTML = dokumenCetak;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = printArea.innerHTML;
        window.print();
        
        // Kembalikan antarmuka setelah print window ditutup
        document.body.innerHTML = originalBody;
        window.location.reload();

    } catch (error) {
        console.error(error);
        alert("Gagal men-generate dokumen. Cek Console.");
    } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<i class="fas fa-magic"></i> Generate & Cetak`;
    }
}

// --- Event Listener ---
formGeneratePromes.addEventListener('submit', (e) => {
    e.preventDefault();
    const rombel = inputRombel.value.trim();
    const tingkat = selectTingkat.value;
    const semester = selectSemester.value;
    const jp = parseInt(inputJp.value);
    generateProtaPromes(rombel, tingkat, semester, jp);
});