// Jurnal Pembelajaran Management

let jurnalData = [];

// Load Jurnal Data
async function loadJurnalData() {
    const jurnalKelas = document.getElementById('jurnalKelas');
    const tableJurnal = document.getElementById('tableJurnal');
    
    try {
        // Populate kelas filter
        const jadwalSnap = await db.collection('users').doc(currentUser.uid)
            .collection('jadwal')
            .where('type', '==', 'jadwal')
            .get();
        
        const kelasList = new Set();
        jadwalSnap.forEach(doc => {
            const data = doc.data();
            if (data.kelas) kelasList.add(data.kelas);
        });

        if (jurnalKelas) {
            jurnalKelas.innerHTML = '<option value="">Semua Kelas</option>' +
                [...kelasList].sort((a,b) => a-b).map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
        }

        // Load jurnal
        const jurnalSnap = await db.collection('users').doc(currentUser.uid)
            .collection('jurnal')
            .where('tahunAjaran', '==', currentTahunAjaran)
            .get();
        
        jurnalData = [];
        jurnalSnap.forEach(doc => {
            const data = doc.data();
            if (data.semester === currentSemester) {
                jurnalData.push({ id: doc.id, ...data });
            }
        });

        jurnalData.sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
        renderJurnalTable();

    } catch (error) {
        console.error('Error loading jurnal:', error);
        if (tableJurnal) {
            tableJurnal.innerHTML = `<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">Gagal memuat data</td></tr>`;
        }
    }
}

// Load Jurnal with Filter
function loadJurnal() {
    renderJurnalTable();
}

// Render Jurnal Table
function renderJurnalTable() {
    const tbody = document.getElementById('tableJurnal');
    if (!tbody) return;
    
    const kelasFilter = document.getElementById('jurnalKelas')?.value || '';
    const bulanFilter = document.getElementById('jurnalBulan')?.value || '';
    
    let filtered = jurnalData;
    if (kelasFilter) filtered = filtered.filter(j => j.kelas === kelasFilter);
    if (bulanFilter) {
        filtered = filtered.filter(j => {
            const month = new Date(j.tanggal).getMonth() + 1;
            return month === parseInt(bulanFilter);
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">Belum ada data jurnal</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((jurnal, index) => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-3 py-3 text-center">${index + 1}</td>
            <td class="px-3 py-3 text-center">${jurnal.kelas || ''}${jurnal.rombel || ''}</td>
            <td class="px-3 py-3 text-sm">${jurnal.materi || '-'}</td>
            <td class="px-3 py-3 text-sm">${jurnal.tp || '-'}</td>
            <td class="px-3 py-3 text-center text-sm">
                <span class="text-green-600">H:${jurnal.hadir || 0}</span>
                <span class="text-red-600 ml-1">A:${jurnal.alpha || 0}</span>
            </td>
            <td class="px-3 py-3 text-sm">${formatDate(jurnal.tanggal, 'short')}</td>
            <td class="px-3 py-3 text-sm">${jurnal.hasil || '-'}</td>
            <td class="px-3 py-3 text-center">
                <button onclick="editJurnal('${jurnal.id}')" class="text-blue-500 hover:text-blue-700 mr-2"><i class="fas fa-edit"></i></button>
                <button onclick="hapusJurnal('${jurnal.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Tambah Jurnal
async function tambahJurnal() {
    // Get kelas from jadwal
    const jadwalSnap = await db.collection('users').doc(currentUser.uid)
        .collection('jadwal').where('type', '==', 'jadwal').get();
    
    const kelasRombelList = [];
    jadwalSnap.forEach(doc => {
        const data = doc.data();
        if (data.kelas && data.rombel) {
            kelasRombelList.push({ kelas: data.kelas, rombel: data.rombel });
        }
    });

    const modal = `
        <div id="modalJurnal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onclick="closeModal('modalJurnal')">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 modal-content" onclick="event.stopPropagation()">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Tambah Jurnal</h3>
                <form onsubmit="saveJurnal(event)">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                            <input type="date" id="jurnalTanggal" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kelas/Rombel</label>
                            <select id="jurnalKelasRombel" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                <option value="">Pilih</option>
                                ${kelasRombelList.map(kr => `<option value="${kr.kelas}-${kr.rombel}">Kelas ${kr.kelas}${kr.rombel}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Materi</label>
                        <input type="text" id="jurnalMateri" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Materi pembelajaran" required>
                    </div>
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran</label>
                        <textarea id="jurnalTP" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="TP"></textarea>
                    </div>
                    <div class="grid grid-cols-4 gap-4 mt-4">
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Hadir</label><input type="number" id="jurnalHadir" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="0" min="0"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Izin</label><input type="number" id="jurnalIzin" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="0" min="0"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Sakit</label><input type="number" id="jurnalSakit" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="0" min="0"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Alpha</label><input type="number" id="jurnalAlpha" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="0" min="0"></div>
                    </div>
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Hasil Pembelajaran</label>
                        <textarea id="jurnalHasil" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Catatan"></textarea>
                    </div>
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="closeModal('modalJurnal')" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

// Save Jurnal
async function saveJurnal(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const kelasRombelVal = document.getElementById('jurnalKelasRombel')?.value || '';
        const kelasRombel = kelasRombelVal.split('-');
        
        const data = {
            tanggal: document.getElementById('jurnalTanggal')?.value || '',
            kelas: kelasRombel[0] || '',
            rombel: kelasRombel[1] || '',
            materi: document.getElementById('jurnalMateri')?.value.trim() || '',
            tp: document.getElementById('jurnalTP')?.value.trim() || '',
            hadir: parseInt(document.getElementById('jurnalHadir')?.value) || 0,
            izin: parseInt(document.getElementById('jurnalIzin')?.value) || 0,
            sakit: parseInt(document.getElementById('jurnalSakit')?.value) || 0,
            alpha: parseInt(document.getElementById('jurnalAlpha')?.value) || 0,
            hasil: document.getElementById('jurnalHasil')?.value.trim() || '',
            semester: currentSemester,
            tahunAjaran: currentTahunAjaran,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const editId = document.getElementById('jurnalTanggal')?.dataset.editId;

        if (editId) {
            await db.collection('users').doc(currentUser.uid).collection('jurnal').doc(editId).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('users').doc(currentUser.uid).collection('jurnal').add(data);
        }

        closeModal('modalJurnal');
        showToast('Jurnal berhasil disimpan', 'success');
        loadJurnalData();

    } catch (error) {
        console.error('Error saving jurnal:', error);
        showToast('Gagal menyimpan jurnal', 'error');
    }

    showLoading(false);
}

// Edit Jurnal
async function editJurnal(id) {
    const jurnal = jurnalData.find(j => j.id === id);
    if (!jurnal) return;

    await tambahJurnal();

    setTimeout(() => {
        const tanggalEl = document.getElementById('jurnalTanggal');
        if (tanggalEl) {
            tanggalEl.value = jurnal.tanggal || '';
            tanggalEl.dataset.editId = id;
        }
        const kelasRombelEl = document.getElementById('jurnalKelasRombel');
        if (kelasRombelEl) kelasRombelEl.value = `${jurnal.kelas}-${jurnal.rombel}`;
        
        const materiEl = document.getElementById('jurnalMateri');
        if (materiEl) materiEl.value = jurnal.materi || '';
        
        const tpEl = document.getElementById('jurnalTP');
        if (tpEl) tpEl.value = jurnal.tp || '';
        
        const hadirEl = document.getElementById('jurnalHadir');
        if (hadirEl) hadirEl.value = jurnal.hadir || 0;
        
        const izinEl = document.getElementById('jurnalIzin');
        if (izinEl) izinEl.value = jurnal.izin || 0;
        
        const sakitEl = document.getElementById('jurnalSakit');
        if (sakitEl) sakitEl.value = jurnal.sakit || 0;
        
        const alphaEl = document.getElementById('jurnalAlpha');
        if (alphaEl) alphaEl.value = jurnal.alpha || 0;
        
        const hasilEl = document.getElementById('jurnalHasil');
        if (hasilEl) hasilEl.value = jurnal.hasil || '';
    }, 100);
}

// Hapus Jurnal
async function hapusJurnal(id) {
    if (!confirm('Hapus jurnal ini?')) return;

    showLoading(true);
    try {
        await db.collection('users').doc(currentUser.uid).collection('jurnal').doc(id).delete();
        showToast('Jurnal dihapus', 'success');
        loadJurnalData();
    } catch (error) {
        showToast('Gagal menghapus', 'error');
    }
    showLoading(false);
}

// Print Jurnal
function printJurnal() {
    const content = document.getElementById('tableJurnal')?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>Jurnal Pembelajaran</title>
        <style>body{font-family:'Times New Roman',serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #000;padding:6px;}</style>
        </head><body>
        <h2 style="text-align:center;">JURNAL PEMBELAJARAN</h2>
        <p>Semester: ${currentSemester} | Tahun: ${currentTahunAjaran}</p>
        <table><thead><tr><th>No</th><th>Kelas</th><th>Materi</th><th>TP</th><th>Kehadiran</th><th>Tanggal</th><th>Hasil</th></tr></thead>
        <tbody>${content.replace(/<button[^>]*>.*?<\/button>/g, '')}</tbody></table>
        </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
}
