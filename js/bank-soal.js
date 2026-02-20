// Bank Soal Management

let bankSoalData = [];

// Load Bank Soal Data
async function loadBankSoalData() {
    const bankSoalList = document.getElementById('bankSoalList');
    
    if (!bankSoalList) return;

    if (!checkPremiumAccess('banksoal')) {
        bankSoalList.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-lock text-4xl text-yellow-500 mb-4"></i>
                <p class="text-gray-600">Fitur Premium</p>
                <button onclick="showUpgradeModal()" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                    <i class="fas fa-crown mr-2"></i>Upgrade
                </button>
            </div>
        `;
        return;
    }

    try {
        const soalSnap = await db.collection('users').doc(currentUser.uid)
            .collection('banksoal')
            .where('tahunAjaran', '==', currentTahunAjaran)
            .get();
        
        bankSoalData = [];
        soalSnap.forEach(doc => bankSoalData.push({ id: doc.id, ...doc.data() }));

        renderBankSoalList();

    } catch (error) {
        console.error('Error loading bank soal:', error);
        if (bankSoalList) bankSoalList.innerHTML = `<div class="text-center py-8 text-gray-500">Gagal memuat data</div>`;
    }
}

// Render Bank Soal List
function renderBankSoalList() {
    const container = document.getElementById('bankSoalList');
    if (!container) return;
    
    const faseFilter = document.getElementById('soalFase')?.value || '';
    const tipeFilter = document.getElementById('soalTipe')?.value || '';
    const searchFilter = (document.getElementById('soalSearch')?.value || '').toLowerCase();
    
    let filtered = bankSoalData;
    if (faseFilter) filtered = filtered.filter(s => s.fase === faseFilter);
    if (tipeFilter) filtered = filtered.filter(s => s.tipe === tipeFilter);
    if (searchFilter) filtered = filtered.filter(s => (s.soal || '').toLowerCase().includes(searchFilter));

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <i class="fas fa-database text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Belum ada soal</p>
                <button onclick="tambahSoal()" class="text-primary hover:underline mt-2">Tambah soal</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map((soal, index) => `
        <div class="bg-white border rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Fase ${soal.fase || '-'}</span>
                    <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">${soal.tipe || '-'}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editSoal('${soal.id}')" class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
                    <button onclick="hapusSoal('${soal.id}')" class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            ${soal.teksArab ? `<p dir="rtl" class="text-lg mb-2" style="font-family: 'Amiri', serif;">${soal.teksArab}</p>` : ''}
            <p class="text-gray-800 mb-2">${index + 1}. ${soal.soal || '-'}</p>
            ${soal.tipe === 'pilgan' && soal.opsi ? `
                <div class="ml-4 text-sm text-gray-600">
                    ${soal.opsi.map((o, i) => `<p class="${soal.jawaban === i ? 'text-green-600 font-medium' : ''}">${String.fromCharCode(65 + i)}. ${o}</p>`).join('')}
                </div>
            ` : ''}
            ${soal.tipe !== 'pilgan' && soal.jawaban ? `<p class="text-sm text-green-600 mt-2"><strong>Jawaban:</strong> ${soal.jawaban}</p>` : ''}
        </div>
    `).join('');
}

// Tambah Soal
function tambahSoal() {
    const modal = `
        <div id="modalSoal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onclick="closeModal('modalSoal')">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onclick="event.stopPropagation()">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Tambah Soal</h3>
                <form onsubmit="saveSoal(event)">
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                            <select id="soalInputFase" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                                <option value="A">Fase A</option>
                                <option value="B">Fase B</option>
                                <option value="C">Fase C</option>
                                <option value="D">Fase D</option>
                                <option value="E">Fase E</option>
                                <option value="F">Fase F</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                            <select id="soalInputKelas" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                ${getKelasOptions()}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
                            <select id="soalInputTipe" class="w-full border border-gray-300 rounded-lg px-3 py-2" required onchange="toggleOpsiSection()">
                                <option value="pilgan">Pilihan Ganda</option>
                                <option value="essay">Essay</option>
                                <option value="isian">Isian Singkat</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran (TP)</label>
                        <input type="text" id="soalInputTP" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="TP yang diukur">
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Teks Arab (opsional)</label>
                        <textarea id="soalInputArab" rows="2" dir="rtl" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg" placeholder="أدخل النص العربي هنا..." style="font-family: 'Amiri', serif;"></textarea>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Soal</label>
                        <textarea id="soalInputSoal" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Tulis soal..." required></textarea>
                    </div>
                    
                    <!-- Opsi Pilihan Ganda -->
                    <div id="opsiSection" class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Opsi Jawaban</label>
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="w-6 text-center font-medium">A.</span>
                                <input type="text" id="soalOpsiA" class="flex-1 border border-gray-300 rounded-lg px-3 py-2">
                                <input type="radio" name="jawaban" value="0" class="w-4 h-4" checked> <span class="text-sm">Benar</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-6 text-center font-medium">B.</span>
                                <input type="text" id="soalOpsiB" class="flex-1 border border-gray-300 rounded-lg px-3 py-2">
                                <input type="radio" name="jawaban" value="1" class="w-4 h-4"> <span class="text-sm">Benar</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-6 text-center font-medium">C.</span>
                                <input type="text" id="soalOpsiC" class="flex-1 border border-gray-300 rounded-lg px-3 py-2">
                                <input type="radio" name="jawaban" value="2" class="w-4 h-4"> <span class="text-sm">Benar</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="w-6 text-center font-medium">D.</span>
                                <input type="text" id="soalOpsiD" class="flex-1 border border-gray-300 rounded-lg px-3 py-2">
                                <input type="radio" name="jawaban" value="3" class="w-4 h-4"> <span class="text-sm">Benar</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Jawaban Essay/Isian -->
                    <div id="jawabanSection" class="hidden mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Kunci Jawaban</label>
                        <textarea id="soalInputJawaban" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Kunci jawaban..."></textarea>
                    </div>
                    
                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="closeModal('modalSoal')" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Batal</button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"><i class="fas fa-save mr-2"></i>Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modalContainer').innerHTML = modal;
}

// Toggle Opsi Section
function toggleOpsiSection() {
    const tipe = document.getElementById('soalInputTipe')?.value;
    const opsiSection = document.getElementById('opsiSection');
    const jawabanSection = document.getElementById('jawabanSection');
    
    if (tipe === 'pilgan') {
        if (opsiSection) opsiSection.classList.remove('hidden');
        if (jawabanSection) jawabanSection.classList.add('hidden');
    } else {
        if (opsiSection) opsiSection.classList.add('hidden');
        if (jawabanSection) jawabanSection.classList.remove('hidden');
    }
}

// Save Soal
async function saveSoal(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const tipe = document.getElementById('soalInputTipe')?.value || 'pilgan';
        
        const data = {
            fase: document.getElementById('soalInputFase')?.value || 'A',
            kelas: document.getElementById('soalInputKelas')?.value || '',
            tipe: tipe,
            tp: document.getElementById('soalInputTP')?.value.trim() || '',
            teksArab: document.getElementById('soalInputArab')?.value.trim() || '',
            soal: document.getElementById('soalInputSoal')?.value.trim() || '',
            tahunAjaran: currentTahunAjaran,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (tipe === 'pilgan') {
            data.opsi = [
                document.getElementById('soalOpsiA')?.value.trim() || '',
                document.getElementById('soalOpsiB')?.value.trim() || '',
                document.getElementById('soalOpsiC')?.value.trim() || '',
                document.getElementById('soalOpsiD')?.value.trim() || ''
            ];
            const jawabanRadio = document.querySelector('input[name="jawaban"]:checked');
            data.jawaban = jawabanRadio ? parseInt(jawabanRadio.value) : 0;
        } else {
            data.jawaban = document.getElementById('soalInputJawaban')?.value.trim() || '';
        }

        const editId = document.getElementById('soalInputSoal')?.dataset.editId;

        if (editId) {
            await db.collection('users').doc(currentUser.uid).collection('banksoal').doc(editId).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('users').doc(currentUser.uid).collection('banksoal').add(data);
        }

        closeModal('modalSoal');
        showToast('Soal berhasil disimpan', 'success');
        loadBankSoalData();

    } catch (error) {
        console.error('Error saving soal:', error);
        showToast('Gagal menyimpan soal', 'error');
    }

    showLoading(false);
}

// Edit Soal
function editSoal(id) {
    const soal = bankSoalData.find(s => s.id === id);
    if (!soal) return;

    tambahSoal();

    setTimeout(() => {
        const faseEl = document.getElementById('soalInputFase');
        if (faseEl) faseEl.value = soal.fase || 'A';
        
        const kelasEl = document.getElementById('soalInputKelas');
        if (kelasEl) kelasEl.value = soal.kelas || '';
        
        const tipeEl = document.getElementById('soalInputTipe');
        if (tipeEl) tipeEl.value = soal.tipe || 'pilgan';
        
        const tpEl = document.getElementById('soalInputTP');
        if (tpEl) tpEl.value = soal.tp || '';
        
        const arabEl = document.getElementById('soalInputArab');
        if (arabEl) arabEl.value = soal.teksArab || '';
        
        const soalEl = document.getElementById('soalInputSoal');
        if (soalEl) {
            soalEl.value = soal.soal || '';
            soalEl.dataset.editId = id;
        }
        
        toggleOpsiSection();
        
        if (soal.tipe === 'pilgan' && soal.opsi) {
            const opsiA = document.getElementById('soalOpsiA');
            const opsiB = document.getElementById('soalOpsiB');
            const opsiC = document.getElementById('soalOpsiC');
            const opsiD = document.getElementById('soalOpsiD');
            if (opsiA) opsiA.value = soal.opsi[0] || '';
            if (opsiB) opsiB.value = soal.opsi[1] || '';
            if (opsiC) opsiC.value = soal.opsi[2] || '';
            if (opsiD) opsiD.value = soal.opsi[3] || '';
            
            const jawabanRadio = document.querySelector(`input[name="jawaban"][value="${soal.jawaban}"]`);
            if (jawabanRadio) jawabanRadio.checked = true;
        } else {
            const jawabanEl = document.getElementById('soalInputJawaban');
            if (jawabanEl) jawabanEl.value = soal.jawaban || '';
        }
    }, 100);
}

// Hapus Soal
async function hapusSoal(id) {
    if (!confirm('Hapus soal ini?')) return;

    showLoading(true);
    try {
        await db.collection('users').doc(currentUser.uid).collection('banksoal').doc(id).delete();
        showToast('Soal dihapus', 'success');
        loadBankSoalData();
    } catch (error) {
        showToast('Gagal menghapus', 'error');
    }
    showLoading(false);
}
