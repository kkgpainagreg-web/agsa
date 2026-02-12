// ============================================
// JADWAL MENGAJAR MODULE
// Admin PAI Super App
// Updated: Support Google Sheets CSV Import
// ============================================

// === STATE ===
let schedules = [];
let classes = [];
let students = [];
let currentEditId = null;
let importData = []; // Data untuk import

// === TIME SLOTS ===
const TIME_SLOTS = [
    { start: "07:00", end: "07:35", label: "07:00 - 07:35" },
    { start: "07:35", end: "08:10", label: "07:35 - 08:10" },
    { start: "08:10", end: "08:45", label: "08:10 - 08:45" },
    { start: "08:45", end: "09:20", label: "08:45 - 09:20" },
    { start: "09:20", end: "09:35", label: "09:20 - 09:35 (Istirahat)" },
    { start: "09:35", end: "10:10", label: "09:35 - 10:10" },
    { start: "10:10", end: "10:45", label: "10:10 - 10:45" },
    { start: "10:45", end: "11:20", label: "10:45 - 11:20" },
    { start: "11:20", end: "11:55", label: "11:20 - 11:55" },
    { start: "11:55", end: "12:30", label: "11:55 - 12:30 (Istirahat)" },
    { start: "12:30", end: "13:05", label: "12:30 - 13:05" },
    { start: "13:05", end: "13:40", label: "13:05 - 13:40" }
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initializeJadwalPage();
});

// === INITIALIZE PAGE ===
async function initializeJadwalPage() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadAllData();
            renderWeeklySchedule();
            renderClassesList();
            renderStudentsList();
            populateClassDropdowns();
            updateSidebarInfo();
            setupClassNameAutoUpdate();
        }
    });
}

// === UPDATE SIDEBAR INFO ===
async function updateSidebarInfo() {
    const userData = await getCurrentUserData();
    if (userData) {
        const name = userData.displayName || 'Guru PAI';
        const sidebarName = document.getElementById('sidebarName');
        const sidebarEmail = document.getElementById('sidebarEmail');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        
        if (sidebarName) sidebarName.textContent = name;
        if (sidebarEmail) sidebarEmail.textContent = userData.email;
        if (sidebarAvatar) sidebarAvatar.textContent = name.charAt(0).toUpperCase();
    }
}

// === LOAD ALL DATA ===
async function loadAllData() {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        // Load classes
        const classesSnapshot = await collections.classes
            .where('teacherId', '==', userId)
            .orderBy('level')
            .get();
        
        classes = [];
        classesSnapshot.forEach(doc => {
            classes.push({ id: doc.id, ...doc.data() });
        });
        
        // Load schedules
        const schedulesSnapshot = await collections.schedules
            .where('teacherId', '==', userId)
            .get();
        
        schedules = [];
        schedulesSnapshot.forEach(doc => {
            schedules.push({ id: doc.id, ...doc.data() });
        });
        
        // Load students
        const studentsSnapshot = await collections.students
            .where('teacherId', '==', userId)
            .orderBy('name')
            .get();
        
        students = [];
        studentsSnapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() });
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// === RENDER WEEKLY SCHEDULE ===
function renderWeeklySchedule() {
    const tbody = document.getElementById('weeklyScheduleBody');
    if (!tbody) return;
    
    let html = '';
    
    TIME_SLOTS.forEach(slot => {
        const isBreak = slot.label.includes('Istirahat');
        
        html += `<tr class="${isBreak ? 'bg-gray-100' : ''}">`;
        html += `<td class="font-medium text-sm ${isBreak ? 'text-gray-500' : ''}">${slot.label}</td>`;
        
        DAYS.forEach(day => {
            if (isBreak) {
                html += `<td class="text-center text-gray-400 text-sm">-</td>`;
            } else {
                const schedule = findScheduleForSlot(day, slot.start, slot.end);
                
                if (schedule) {
                    html += `
                        <td onclick="editSchedule('${schedule.id}')" 
                            class="cursor-pointer hover:bg-pai-light transition-colors">
                            <div class="bg-pai-green text-white rounded-lg p-2 text-xs">
                                <div class="font-semibold">${schedule.className}</div>
                                <div class="opacity-80">${schedule.room || 'PAI'}</div>
                            </div>
                        </td>
                    `;
                } else {
                    html += `
                        <td onclick="openScheduleModalWithTime('${day}', '${slot.start}', '${slot.end}')"
                            class="cursor-pointer hover:bg-gray-100 transition-colors text-center">
                            <span class="text-gray-300 text-xl">+</span>
                        </td>
                    `;
                }
            }
        });
        
        html += '</tr>';
    });
    
    tbody.innerHTML = html;
}

// === FIND SCHEDULE FOR SLOT ===
function findScheduleForSlot(day, start, end) {
    return schedules.find(s => 
        s.day === day && 
        s.startTime === start && 
        s.endTime === end
    );
}

// === RENDER CLASSES LIST ===
function renderClassesList() {
    const container = document.getElementById('classesList');
    if (!container) return;
    
    if (classes.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500 col-span-full">
                <span class="text-4xl block mb-2">🏫</span>
                <p>Belum ada kelas</p>
                <button onclick="openClassModal()" class="text-pai-green hover:underline text-sm mt-2">
                    + Tambah Kelas Baru
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = classes.map(cls => {
        const studentCount = students.filter(s => s.classId === cls.id).length;
        const scheduleCount = schedules.filter(s => s.classId === cls.id).length;
        
        return `
            <div class="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-12 h-12 bg-pai-light rounded-xl flex items-center justify-center">
                        <span class="text-2xl">🏫</span>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="editClass('${cls.id}')" class="p-1 hover:bg-gray-100 rounded" title="Edit">
                            ✏️
                        </button>
                        <button onclick="deleteClass('${cls.id}')" class="p-1 hover:bg-gray-100 rounded" title="Hapus">
                            🗑️
                        </button>
                    </div>
                </div>
                <h4 class="font-bold text-lg text-gray-800">${cls.name}</h4>
                <p class="text-sm text-gray-500 mb-3">Fase ${cls.fase} • ${cls.wali || 'Wali belum diisi'}</p>
                <div class="flex gap-4 text-sm">
                    <div class="flex items-center gap-1">
                        <span>👨‍🎓</span>
                        <span>${studentCount} siswa</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span>📅</span>
                        <span>${scheduleCount} jadwal</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// === RENDER STUDENTS LIST ===
function renderStudentsList(filterClassId = '') {
    const tbody = document.getElementById('studentsBody');
    if (!tbody) return;
    
    let filteredStudents = students;
    if (filterClassId) {
        filteredStudents = students.filter(s => s.classId === filterClassId);
    }
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-gray-500">
                    <span class="text-4xl block mb-2">👨‍🎓</span>
                    <p>Belum ada data siswa</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredStudents.map((student, index) => {
        const cls = classes.find(c => c.id === student.classId);
        
        return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${student.nis || '-'}</td>
                <td class="font-medium">${student.name}</td>
                <td>${cls?.name || '-'}</td>
                <td class="text-center">
                    <span class="badge ${student.gender === 'L' ? 'badge-info' : 'badge-warning'}">
                        ${student.gender}
                    </span>
                </td>
                <td>
                    <div class="flex gap-1">
                        <button onclick="editStudent('${student.id}')" class="p-1 hover:bg-gray-100 rounded" title="Edit">
                            ✏️
                        </button>
                        <button onclick="deleteStudent('${student.id}')" class="p-1 hover:bg-gray-100 rounded" title="Hapus">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// === POPULATE CLASS DROPDOWNS ===
function populateClassDropdowns() {
    const options = classes.map(cls => 
        `<option value="${cls.id}">${cls.name}</option>`
    ).join('');
    
    const dropdowns = ['scheduleClass', 'studentClass', 'importUrlClass', 'importFileClass', 'filterClass'];
    
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const firstOption = select.querySelector('option:first-child');
            const firstOptionHTML = firstOption ? firstOption.outerHTML : '<option value="">Pilih kelas</option>';
            select.innerHTML = firstOptionHTML + options;
        }
    });
}

// === TAB SWITCHING ===
function switchJadwalTab(tab) {
    const tabs = ['Weekly', 'Classes', 'Students'];
    
    tabs.forEach(t => {
        const tabBtn = document.getElementById(`tab${t}`);
        const content = document.getElementById(`content${t}`);
        
        if (tabBtn) {
            if (t.toLowerCase() === tab.toLowerCase()) {
                tabBtn.classList.add('active');
            } else {
                tabBtn.classList.remove('active');
            }
        }
        
        if (content) {
            if (t.toLowerCase() === tab.toLowerCase()) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        }
    });
}

// === SCHEDULE MODAL ===
function openScheduleModal() {
    document.getElementById('scheduleModalTitle').textContent = 'Tambah Jadwal';
    document.getElementById('formSchedule').reset();
    document.getElementById('scheduleId').value = '';
    document.getElementById('scheduleModal').classList.add('active');
}

function openScheduleModalWithTime(day, start, end) {
    openScheduleModal();
    document.getElementById('scheduleDay').value = day;
    document.getElementById('scheduleStart').value = start;
    document.getElementById('scheduleEnd').value = end;
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

async function saveSchedule() {
    const scheduleId = document.getElementById('scheduleId').value;
    const classId = document.getElementById('scheduleClass').value;
    const day = document.getElementById('scheduleDay').value;
    const startTime = document.getElementById('scheduleStart').value;
    const endTime = document.getElementById('scheduleEnd').value;
    const room = document.getElementById('scheduleRoom').value.trim();
    const note = document.getElementById('scheduleNote').value.trim();
    
    if (!classId || !day || !startTime || !endTime) {
        showToast('Lengkapi semua data yang wajib!', 'error');
        return;
    }
    
    const selectedClass = classes.find(c => c.id === classId);
    
    const data = {
        classId,
        className: selectedClass?.name || '',
        day,
        startTime,
        endTime,
        room,
        note,
        teacherId: auth.currentUser.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (scheduleId) {
            await collections.schedules.doc(scheduleId).update(data);
            showToast('Jadwal berhasil diperbarui!', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await collections.schedules.add(data);
            showToast('Jadwal berhasil ditambahkan!', 'success');
        }
        
        closeScheduleModal();
        await loadAllData();
        renderWeeklySchedule();
        renderClassesList();
        
    } catch (error) {
        console.error('Error saving schedule:', error);
        showToast('Gagal menyimpan jadwal', 'error');
    }
}

function editSchedule(id) {
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;
    
    document.getElementById('scheduleModalTitle').textContent = 'Edit Jadwal';
    document.getElementById('scheduleId').value = schedule.id;
    document.getElementById('scheduleClass').value = schedule.classId;
    document.getElementById('scheduleDay').value = schedule.day;
    document.getElementById('scheduleStart').value = schedule.startTime;
    document.getElementById('scheduleEnd').value = schedule.endTime;
    document.getElementById('scheduleRoom').value = schedule.room || '';
    document.getElementById('scheduleNote').value = schedule.note || '';
    
    document.getElementById('scheduleModal').classList.add('active');
}

async function deleteSchedule(id) {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
    
    try {
        await collections.schedules.doc(id).delete();
        showToast('Jadwal berhasil dihapus!', 'success');
        
        await loadAllData();
        renderWeeklySchedule();
        renderClassesList();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        showToast('Gagal menghapus jadwal', 'error');
    }
}

// === CLASS MODAL ===
function openClassModal() {
    document.getElementById('classModalTitle').textContent = 'Tambah Kelas';
    document.getElementById('formClass').reset();
    document.getElementById('classId').value = '';
    document.getElementById('className').value = '';
    document.getElementById('classFase').value = '';
    document.getElementById('classModal').classList.add('active');
}

function closeClassModal() {
    document.getElementById('classModal').classList.remove('active');
}

function setupClassNameAutoUpdate() {
    const levelInput = document.getElementById('classLevel');
    const rombelInput = document.getElementById('classRombel');
    
    const updateClassName = () => {
        const level = levelInput?.value || '';
        const rombel = rombelInput?.value?.trim().toUpperCase() || '';
        
        const classNameInput = document.getElementById('className');
        if (classNameInput && level && rombel) {
            classNameInput.value = `Kelas ${level}${rombel}`;
        }
    };
    
    if (levelInput) levelInput.addEventListener('change', updateClassName);
    if (rombelInput) rombelInput.addEventListener('input', updateClassName);
}

function updateFase() {
    const level = document.getElementById('classLevel')?.value;
    const classFase = document.getElementById('classFase');
    
    if (classFase && typeof getFaseByKelas === 'function') {
        const fase = getFaseByKelas(level);
        classFase.value = fase ? `Fase ${fase}` : '';
    }
}

async function saveClass() {
    const classId = document.getElementById('classId').value;
    const level = document.getElementById('classLevel').value;
    const rombel = document.getElementById('classRombel').value.trim().toUpperCase();
    const studentCount = parseInt(document.getElementById('classStudentCount').value) || 0;
    const wali = document.getElementById('classWali').value.trim();
    
    if (!level || !rombel) {
        showToast('Lengkapi tingkat dan rombel!', 'error');
        return;
    }
    
    const name = `Kelas ${level}${rombel}`;
    const fase = typeof getFaseByKelas === 'function' ? getFaseByKelas(level) : '';
    
    const data = {
        name,
        level: parseInt(level),
        rombel,
        fase,
        studentCount,
        wali,
        teacherId: auth.currentUser.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (classId) {
            await collections.classes.doc(classId).update(data);
            showToast('Kelas berhasil diperbarui!', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await collections.classes.add(data);
            showToast('Kelas berhasil ditambahkan!', 'success');
        }
        
        closeClassModal();
        await loadAllData();
        renderClassesList();
        populateClassDropdowns();
        
    } catch (error) {
        console.error('Error saving class:', error);
        showToast('Gagal menyimpan kelas', 'error');
    }
}

function editClass(id) {
    const cls = classes.find(c => c.id === id);
    if (!cls) return;
    
    document.getElementById('classModalTitle').textContent = 'Edit Kelas';
    document.getElementById('classId').value = cls.id;
    document.getElementById('classLevel').value = cls.level;
    document.getElementById('classRombel').value = cls.rombel;
    document.getElementById('className').value = cls.name;
    document.getElementById('classFase').value = `Fase ${cls.fase}`;
    document.getElementById('classStudentCount').value = cls.studentCount || 0;
    document.getElementById('classWali').value = cls.wali || '';
    
    document.getElementById('classModal').classList.add('active');
}

async function deleteClass(id) {
    const cls = classes.find(c => c.id === id);
    const studentCount = students.filter(s => s.classId === id).length;
    
    if (studentCount > 0) {
        showToast(`Tidak bisa menghapus kelas yang memiliki ${studentCount} siswa!`, 'error');
        return;
    }
    
    if (!confirm(`Yakin ingin menghapus ${cls?.name}?`)) return;
    
    try {
        const schedulesToDelete = schedules.filter(s => s.classId === id);
        for (const schedule of schedulesToDelete) {
            await collections.schedules.doc(schedule.id).delete();
        }
        
        await collections.classes.doc(id).delete();
        showToast('Kelas berhasil dihapus!', 'success');
        
        await loadAllData();
        renderClassesList();
        renderWeeklySchedule();
        populateClassDropdowns();
    } catch (error) {
        console.error('Error deleting class:', error);
        showToast('Gagal menghapus kelas', 'error');
    }
}

// === STUDENT MODAL ===
function openStudentModal() {
    document.getElementById('studentModalTitle').textContent = 'Tambah Siswa';
    document.getElementById('formStudent').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentModal').classList.add('active');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
}

async function saveStudent() {
    const studentId = document.getElementById('studentId').value;
    const nis = document.getElementById('studentNis').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const classId = document.getElementById('studentClass').value;
    const gender = document.getElementById('studentGender').value;
    const birthPlace = document.getElementById('studentBirthPlace').value.trim();
    const birthDate = document.getElementById('studentBirthDate').value;
    const parent = document.getElementById('studentParent').value.trim();
    
    if (!name || !classId || !gender) {
        showToast('Lengkapi data yang wajib!', 'error');
        return;
    }
    
    const data = {
        nis,
        name,
        classId,
        gender,
        birthPlace,
        birthDate,
        parent,
        teacherId: auth.currentUser.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (studentId) {
            await collections.students.doc(studentId).update(data);
            showToast('Siswa berhasil diperbarui!', 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await collections.students.add(data);
            showToast('Siswa berhasil ditambahkan!', 'success');
        }
        
        closeStudentModal();
        await loadAllData();
        renderStudentsList();
        renderClassesList();
        
    } catch (error) {
        console.error('Error saving student:', error);
        showToast('Gagal menyimpan data siswa', 'error');
    }
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    document.getElementById('studentModalTitle').textContent = 'Edit Siswa';
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentNis').value = student.nis || '';
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentClass').value = student.classId;
    document.getElementById('studentGender').value = student.gender;
    document.getElementById('studentBirthPlace').value = student.birthPlace || '';
    document.getElementById('studentBirthDate').value = student.birthDate || '';
    document.getElementById('studentParent').value = student.parent || '';
    
    document.getElementById('studentModal').classList.add('active');
}

async function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    if (!confirm(`Yakin ingin menghapus data ${student?.name}?`)) return;
    
    try {
        await collections.students.doc(id).delete();
        showToast('Siswa berhasil dihapus!', 'success');
        
        await loadAllData();
        renderStudentsList();
        renderClassesList();
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Gagal menghapus siswa', 'error');
    }
}

function filterStudentsByClass() {
    const classId = document.getElementById('filterClass').value;
    renderStudentsList(classId);
}

// ============================================
// IMPORT FUNCTIONS - GOOGLE SHEETS & FILE
// ============================================

// === IMPORT MODAL ===
function openImportModal() {
    document.getElementById('importModal').classList.add('active');
    clearPreview();
    switchImportTab('url');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
    clearPreview();
}

function switchImportTab(tab) {
    const tabUrl = document.getElementById('tabImportUrl');
    const tabFile = document.getElementById('tabImportFile');
    const contentUrl = document.getElementById('contentImportUrl');
    const contentFile = document.getElementById('contentImportFile');
    
    if (tab === 'url') {
        tabUrl.classList.add('border-pai-green', 'text-pai-green');
        tabUrl.classList.remove('border-transparent', 'text-gray-500');
        tabFile.classList.remove('border-pai-green', 'text-pai-green');
        tabFile.classList.add('border-transparent', 'text-gray-500');
        contentUrl.classList.remove('hidden');
        contentFile.classList.add('hidden');
    } else {
        tabFile.classList.add('border-pai-green', 'text-pai-green');
        tabFile.classList.remove('border-transparent', 'text-gray-500');
        tabUrl.classList.remove('border-pai-green', 'text-pai-green');
        tabUrl.classList.add('border-transparent', 'text-gray-500');
        contentFile.classList.remove('hidden');
        contentUrl.classList.add('hidden');
    }
}

// === FETCH FROM GOOGLE SHEETS ===
async function fetchFromGoogleSheets() {
    const url = document.getElementById('importUrl').value.trim();
    const classId = document.getElementById('importUrlClass').value;
    
    if (!classId) {
        showToast('Pilih kelas tujuan terlebih dahulu!', 'error');
        return;
    }
    
    if (!url) {
        showToast('Masukkan URL Google Sheets!', 'error');
        return;
    }
    
    // Validate URL
    if (!url.includes('docs.google.com/spreadsheets')) {
        showToast('URL tidak valid! Gunakan link dari Google Sheets.', 'error');
        return;
    }
    
    showLoading('Mengambil data dari Google Sheets...');
    
    try {
        // Convert URL to CSV export format if needed
        let csvUrl = url;
        
        // Handle different Google Sheets URL formats
        if (url.includes('/edit')) {
            // Convert edit URL to export CSV
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match) {
                const sheetId = match[1];
                csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
            }
        } else if (url.includes('/pubhtml')) {
            // Convert pubhtml to pub?output=csv
            csvUrl = url.replace('/pubhtml', '/pub?output=csv');
        } else if (!url.includes('output=csv') && !url.includes('format=csv')) {
            // Try to add output=csv if not present
            if (url.includes('pub?')) {
                csvUrl = url + '&output=csv';
            } else if (url.includes('/pub')) {
                csvUrl = url + '?output=csv';
            }
        }
        
        // Use CORS proxy for cross-origin requests
        // You can use your own proxy or a public one
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const fetchUrl = proxyUrl + encodeURIComponent(csvUrl);
        
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data. Pastikan spreadsheet sudah dipublikasikan.');
        }
        
        const csvText = await response.text();
        
        // Check if response is HTML (error page)
        if (csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
            throw new Error('Spreadsheet tidak ditemukan atau belum dipublikasikan sebagai CSV.');
        }
        
        // Parse CSV
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
            throw new Error('Tidak ada data ditemukan dalam spreadsheet.');
        }
        
        // Store import data with class ID
        importData = parsedData.map(row => ({
            ...row,
            classId: classId
        }));
        
        // Show preview
        showImportPreview(importData);
        
        hideLoading();
        showToast(`${importData.length} data siswa ditemukan!`, 'success');
        
    } catch (error) {
        hideLoading();
        console.error('Error fetching from Google Sheets:', error);
        showToast(error.message || 'Gagal mengambil data dari Google Sheets', 'error');
    }
}

// === PARSE CSV ===
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
        return [];
    }
    
    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Find column indices
    const findColumn = (names) => {
        for (const name of names) {
            const idx = headers.findIndex(h => h.includes(name));
            if (idx !== -1) return idx;
        }
        return -1;
    };
    
    const nisIdx = findColumn(['nis', 'nisn', 'no induk', 'nomor induk']);
    const namaIdx = findColumn(['nama', 'name', 'nama lengkap', 'nama siswa']);
    const genderIdx = findColumn(['l/p', 'jk', 'jenis kelamin', 'gender', 'kelamin']);
    const tempatIdx = findColumn(['tempat', 'tempat lahir', 'ttl']);
    const tanggalIdx = findColumn(['tanggal', 'tanggal lahir', 'tgl lahir']);
    const ortuIdx = findColumn(['orang tua', 'ortu', 'wali', 'nama ortu', 'nama orang tua']);
    
    if (namaIdx === -1) {
        showToast('Kolom "Nama" tidak ditemukan dalam spreadsheet!', 'error');
        return [];
    }
    
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        const nama = values[namaIdx]?.trim();
        if (!nama) continue; // Skip empty rows
        
        // Parse gender
        let gender = 'L';
        if (genderIdx !== -1) {
            const g = values[genderIdx]?.trim().toUpperCase();
            if (g === 'P' || g === 'PEREMPUAN' || g === 'WANITA' || g === 'F' || g === 'FEMALE') {
                gender = 'P';
            }
        }
        
        result.push({
            nis: nisIdx !== -1 ? values[nisIdx]?.trim() || '' : '',
            name: nama,
            gender: gender,
            birthPlace: tempatIdx !== -1 ? values[tempatIdx]?.trim() || '' : '',
            birthDate: tanggalIdx !== -1 ? formatDateValue(values[tanggalIdx]?.trim()) : '',
            parent: ortuIdx !== -1 ? values[ortuIdx]?.trim() || '' : '',
            status: 'valid'
        });
    }
    
    return result;
}

// === PARSE CSV LINE (Handle quoted values) ===
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result.map(val => val.replace(/^"|"$/g, '').trim());
}

// === FORMAT DATE VALUE ===
function formatDateValue(dateStr) {
    if (!dateStr) return '';
    
    // Try to parse various date formats
    // DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // DD/MM/YYYY or DD-MM-YYYY
    const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
        const [, day, month, year] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return '';
}

// === PREVIEW FILE IMPORT ===
async function previewFileImport() {
    const fileInput = document.getElementById('importFile');
    const classId = document.getElementById('importFileClass').value;
    const file = fileInput.files[0];
    
    if (!classId) {
        showToast('Pilih kelas tujuan terlebih dahulu!', 'error');
        fileInput.value = '';
        return;
    }
    
    if (!file) return;
    
    showLoading('Membaca file...');
    
    try {
        const text = await file.text();
        const parsedData = parseCSV(text);
        
        if (parsedData.length === 0) {
            throw new Error('Tidak ada data valid dalam file.');
        }
        
        importData = parsedData.map(row => ({
            ...row,
            classId: classId
        }));
        
        showImportPreview(importData);
        
        hideLoading();
        showToast(`${importData.length} data siswa ditemukan!`, 'success');
        
    } catch (error) {
        hideLoading();
        console.error('Error reading file:', error);
        showToast(error.message || 'Gagal membaca file', 'error');
    }
}

// === SHOW IMPORT PREVIEW ===
function showImportPreview(data) {
    const previewContainer = document.getElementById('importPreview');
    const previewBody = document.getElementById('previewTableBody');
    const previewCount = document.getElementById('previewCount');
    const importCountBtn = document.getElementById('importCountBtn');
    const btnProcess = document.getElementById('btnProcessImport');
    
    previewContainer.classList.remove('hidden');
    previewCount.textContent = data.length;
    importCountBtn.textContent = data.length;
    btnProcess.disabled = false;
    
    previewBody.innerHTML = data.map((row, idx) => `
        <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
            <td class="p-2">${idx + 1}</td>
            <td class="p-2">${row.nis || '-'}</td>
            <td class="p-2">${row.name}</td>
            <td class="p-2">${row.gender}</td>
            <td class="p-2">
                <span class="text-green-600">✓ Valid</span>
            </td>
        </tr>
    `).join('');
}

// === CLEAR PREVIEW ===
function clearPreview() {
    const previewContainer = document.getElementById('importPreview');
    const previewBody = document.getElementById('previewTableBody');
    const btnProcess = document.getElementById('btnProcessImport');
    const importCountBtn = document.getElementById('importCountBtn');
    
    previewContainer.classList.add('hidden');
    previewBody.innerHTML = '';
    btnProcess.disabled = true;
    importCountBtn.textContent = '0';
    importData = [];
    
    // Clear inputs
    const urlInput = document.getElementById('importUrl');
    const fileInput = document.getElementById('importFile');
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
}

// === PROCESS IMPORT ===
async function processImport() {
    if (importData.length === 0) {
        showToast('Tidak ada data untuk diimport!', 'error');
        return;
    }
    
    const classId = importData[0].classId;
    if (!classId) {
        showToast('Kelas tujuan tidak valid!', 'error');
        return;
    }
    
    showLoading(`Mengimport ${importData.length} siswa...`);
    
    try {
        const userId = auth.currentUser.uid;
        let imported = 0;
        let failed = 0;
        
        // Use batch for better performance
        const batchSize = 500; // Firestore limit
        let batch = db.batch();
        let batchCount = 0;
        
        for (const row of importData) {
            try {
                const data = {
                    nis: row.nis || '',
                    name: row.name,
                    gender: row.gender,
                    birthPlace: row.birthPlace || '',
                    birthDate: row.birthDate || '',
                    parent: row.parent || '',
                    classId: classId,
                    teacherId: userId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                const docRef = collections.students.doc();
                batch.set(docRef, data);
                batchCount++;
                imported++;
                
                // Commit batch if it reaches the limit
                if (batchCount >= batchSize) {
                    await batch.commit();
                    batch = db.batch();
                    batchCount = 0;
                }
                
            } catch (e) {
                console.error('Error importing row:', e);
                failed++;
            }
        }
        
        // Commit remaining items
        if (batchCount > 0) {
            await batch.commit();
        }
        
        hideLoading();
        
        if (failed > 0) {
            showToast(`${imported} siswa berhasil diimport, ${failed} gagal`, 'warning');
        } else {
            showToast(`${imported} siswa berhasil diimport!`, 'success');
        }
        
        closeImportModal();
        await loadAllData();
        renderStudentsList();
        renderClassesList();
        
    } catch (error) {
        hideLoading();
        console.error('Error processing import:', error);
        showToast('Gagal mengimport data', 'error');
    }
}

// === DOWNLOAD TEMPLATE ===
function downloadTemplate() {
    const csvContent = "NIS,Nama Lengkap,Jenis Kelamin (L/P),Tempat Lahir,Tanggal Lahir (DD/MM/YYYY),Nama Orang Tua\n" +
        "12345,Ahmad Fauzi,L,Jakarta,15/05/2015,Budi Santoso\n" +
        "12346,Siti Aisyah,P,Bandung,20/08/2015,Ahmad Hidayat\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_siswa.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Template berhasil diunduh!', 'success');
}

// === LOADING OVERLAY ===
function showLoading(text = 'Memproses...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingText) loadingText.textContent = text;
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

// === PRINT ===
function printSchedule() {
    window.print();
}

// === SIDEBAR TOGGLE ===
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        sidebar.classList.toggle('collapsed');
    }
}

console.log('✅ Jadwal module initialized (with Google Sheets import)');
