// Nilai Management

let nilaiSiswaList = [];
let nilaiRombelMap = {};
let komponenNilai = ['PH1', 'PH2', 'PH3', 'PTS', 'PAS'];
let bobotNilai = { PH: 50, PTS: 25, PAS: 25 };

// Initialize Nilai Form
async function initNilaiForm() {
    const nilaiKelas = document.getElementById('nilaiKelas');
    
    if (!nilaiKelas) return;
    
    try {
        const jadwalSnap = await db.collection('users').doc(currentUser.uid)
            .collection('jadwal').where('type', '==', 'jadwal').get();
        
        const kelasSet = new Set();
        nilaiRombelMap = {};
        
        jadwalSnap.forEach(doc => {
            const data = doc.data();
            if (data.kelas) {
                kelasSet.add(data.kelas);
                if (!nilaiRombelMap[data.kelas]) nilaiRombelMap[data.kelas] = new Set();
                if (data.rombel) nilaiRombelMap[data.kelas].add(data.rombel);
            }
        });

        nilaiKelas.innerHTML = '<option value="">Pilih Kelas</option>' +
            [...kelasSet].sort((a,b) => a-b).map(k => `<option value="${k}">Kelas ${k}</option>`).join('');

        // Load settings
        const settingsDoc = await db.collection('users').doc(currentUser.uid)
            .collection('nilai').doc('settings').get();
        
        if (settingsDoc.exists) {
            const s = settingsDoc.data();
            if (s.komponen) komponenNilai = s.komponen;
            if (s.bobot) bobotNilai = s.bobot;
        }

    } catch (error) {
        console.error('Error init nilai:', error);
    }
}

// Load Nilai Rombel
function loadNilaiRombel() {
    const kelas = document.getElementById('nilaiKelas')?.value;
    const nilaiRombel = document.getElementById('nilaiRombel');
    
    if (nilaiRombel && kelas && nilaiRombelMap[kelas]) {
        nilaiRombel.innerHTML = '<option value="">Pilih Rombel</option>' +
            [...nilaiRombelMap[kelas]].sort().map(r => `<option value="${r}">${r}</option>`).join('');
    } else if (nilaiRombel) {
        nilaiRombel.innerHTML = '<option value="">Pilih Rombel</option>';
    }
}

// Load Nilai
async function loadNilai() {
    const kelas = document.getElementById('nilaiKelas')?.value;
    const rombel = document.getElementById('nilaiRombel')?.value;
    const tbody = document.getElementById('tableNilai');
    
    if (!kelas || !rombel || !tbody) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">Pilih kelas dan rombel</td></tr>`;
        return;
    }

    showLoading(true);

    try {
        const siswaSnap = await db.collection('users').doc(currentUser.uid)
            .collection('siswa')
            .where('kelas', '==', kelas)
            .where('rombel', '==', rombel)
            .where('tahunAjaran', '==', currentTahunAjaran)
            .get();
        
        nilaiSiswaList = [];
        siswaSnap.forEach(doc => nilaiSiswaList.push({ id: doc.id, ...doc.data() }));
        nilaiSiswaList.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));

        const nilaiSnap = await db.collection('users').doc(currentUser.uid)
            .collection('nilai')
            .where('kelas', '==', kelas)
            .where('rombel', '==', rombel)
            .where('semester', '==', currentSemester)
            .get();
        
        const nilaiMap = {};
        nilaiSnap.forEach(doc => {
            const d = doc.data();
            nilaiMap[d.siswaId] = d.nilai || {};
        });

        renderNilaiTable(nilaiMap);

    } catch (error) {
        console.error('Error loading nilai:', error);
    }

    showLoading(false);
}

// Render Nilai Table
function renderNilaiTable(nilaiMap = {}) {
    const tbody = document.getElementById('tableNilai');
    if (!tbody) return;

    if (nilaiSiswaList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">Tidak ada siswa</td></tr>`;
        return;
    }

    tbody.innerHTML = nilaiSiswaList.map((siswa, index) => {
        const nilai = nilaiMap[siswa.id] || {};
        let totalPH = 0, countPH = 0;
        komponenNilai.forEach(k => {
            if (k.startsWith('PH') && nilai[k]) { totalPH += parseFloat(nilai[k]) || 0; countPH++; }
        });
        const avgPH = countPH > 0 ? totalPH / countPH : 0;
        const pts = parseFloat(nilai.PTS) || 0;
        const pas = parseFloat(nilai.PAS) || 0;
        const nr = Math.round((avgPH * bobotNilai.PH/100) + (pts * bobotNilai.PTS/100) + (pas * bobotNilai.PAS/100));

        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-3 py-2 text-center">${index + 1}</td>
                <td class="px-3 py-2">${siswa.nama || '-'}</td>
                ${komponenNilai.map(k => `
                    <td class="px-1 py-2 text-center">
                        <input type="number" id="nilai_${siswa.id}_${k}" value="${nilai[k] || ''}" min="0" max="100"
                            class="w-14 border border-gray-300 rounded px-1 py-1 text-center text-sm" onchange="calculateNR('${siswa.id}')">
                    </td>
                `).join('')}
                <td class="px-3 py-2 text-center font-bold bg-blue-50" id="nr_${siswa.id}">${nr || '-'}</td>
            </tr>
        `;
    }).join('');
}

// Calculate NR
function calculateNR(siswaId) {
    let totalPH = 0, countPH = 0;
    komponenNilai.forEach(k => {
        const el = document.getElementById(`nilai_${siswaId}_${k}`);
        if (k.startsWith('PH') && el?.value) { totalPH += parseFloat(el.value) || 0; countPH++; }
    });
    const avgPH = countPH > 0 ? totalPH / countPH : 0;
    const pts = parseFloat(document.getElementById(`nilai_${siswaId}_PTS`)?.value) || 0;
    const pas = parseFloat(document.getElementById(`nilai_${siswaId}_PAS`)?.value) || 0;
    const nr = Math.round((avgPH * bobotNilai.PH/100) + (pts * bobotNilai.PTS/100) + (pas * bobotNilai.PAS/100));
    const nrEl = document.getElementById(`nr_${siswaId}`);
    if (nrEl) nrEl.textContent = nr || '-';
}

// Save Nilai
async function saveNilai() {
    const kelas = document.getElementById('nilaiKelas')?.value;
    const rombel = document.getElementById('nilaiRombel')?.value;
    
    if (!kelas || !rombel) { showToast('Pilih kelas dan rombel', 'warning'); return; }

    showLoading(true);
    try {
        const batch = db.batch();

        const existingSnap = await db.collection('users').doc(currentUser.uid)
            .collection('nilai')
            .where('kelas', '==', kelas)
            .where('rombel', '==', rombel)
            .where('semester', '==', currentSemester)
            .get();
        existingSnap.forEach(doc => batch.delete(doc.ref));

        nilaiSiswaList.forEach(siswa => {
            const nilai = {};
            komponenNilai.forEach(k => {
                const el = document.getElementById(`nilai_${siswa.id}_${k}`);
                if (el?.value) nilai[k] = parseFloat(el.value);
            });

            if (Object.keys(nilai).length > 0) {
                const docRef = db.collection('users').doc(currentUser.uid).collection('nilai').doc();
                batch.set(docRef, { siswaId: siswa.id, siswaName: siswa.nama, kelas, rombel, nilai, semester: currentSemester, tahunAjaran: currentTahunAjaran, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            }
        });

        await batch.commit();
        showToast('Nilai disimpan', 'success');
    } catch (error) {
        showToast('Gagal menyimpan', 'error');
    }
    showLoading(false);
}

// Setting Komponen
function settingKomponen() {
    const modal = `
        <div id="modalKomponen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onclick="closeModal('modalKomponen')">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onclick="event.stopPropagation()">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Setting Komponen Nilai</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Komponen (pisah koma)</label>
                        <input type="text" id="settingKomponen" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${komponenNilai.join(', ')}">
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Bobot PH (%)</label><input type="number" id="settingBobotPH" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${bobotNilai.PH}"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Bobot PTS (%)</label><input type="number" id="settingBobotPTS" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${bobotNilai.PTS}"></div>
                        <div><label class="block text-sm font-medium text-gray-700 mb-1">Bobot PAS (%)</label><input type="number" id="settingBobotPAS" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${bobotNilai.PAS}"></div>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="closeModal('modalKomponen')" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                    <button onclick="saveSettingKomponen()" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">Simpan</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

// Save Setting Komponen
async function saveSettingKomponen() {
    const komponenStr = document.getElementById('settingKomponen')?.value || '';
    const bobotPH = parseInt(document.getElementById('settingBobotPH')?.value) || 0;
    const bobotPTS = parseInt(document.getElementById('settingBobotPTS')?.value) || 0;
    const bobotPAS = parseInt(document.getElementById('settingBobotPAS')?.value) || 0;

    if (bobotPH + bobotPTS + bobotPAS !== 100) { showToast('Total bobot harus 100%', 'warning'); return; }

    komponenNilai = komponenStr.split(',').map(k => k.trim()).filter(k => k);
    bobotNilai = { PH: bobotPH, PTS: bobotPTS, PAS: bobotPAS };

    try {
        await db.collection('users').doc(currentUser.uid).collection('nilai').doc('settings').set({ komponen: komponenNilai, bobot: bobotNilai, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        closeModal('modalKomponen');
        showToast('Pengaturan disimpan', 'success');
        loadNilai();
    } catch (error) {
        showToast('Gagal menyimpan', 'error');
    }
}
