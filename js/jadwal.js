// ============================================
// JADWAL MENGAJAR MODULE
// Admin PAI Super App
// Updated: Customizable Time Slots + Google Sheets Import
// ============================================

// === STATE ===
let schedules = [];
let classes = [];
let students = [];
let timeSlots = [];
let importData = [];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// === DEFAULT TIME SLOTS ===
const DEFAULT_TIME_SLOTS = [
    { id: 1, jamKe: 1, start: "07:00", end: "07:35", isBreak: false, label: "" },
    { id: 2, jamKe: 2, start: "07:35", end: "08:10", isBreak: false, label: "" },
    { id: 3, jamKe: 3, start: "08:10", end: "08:45", isBreak: false, label: "" },
    { id: 4, jamKe: 4, start: "08:45", end: "09:20", isBreak: false, label: "" },
    { id: 5, jamKe: 0, start: "09:20", end: "09:40", isBreak: true, label: "Istirahat 1" },
    { id: 6, jamKe: 5, start: "09:40", end: "10:15", isBreak: false, label: "" },
    { id: 7, jamKe: 6, start: "10:15", end: "10:50", isBreak: false, label: "" },
    { id: 8, jamKe: 7, start: "10:50", end: "11:25", isBreak: false, label: "" },
    { id: 9, jamKe: 8, start: "11:25", end: "12:00", isBreak: false, label: "" }
];

// === TEMPLATES ===
const TIME_SLOT_TEMPLATES = {
    'sd-reguler': [
        { id: 1, jamKe: 1, start: "07:00", end: "07:35", isBreak: false, label: "" },
        { id: 2, jamKe: 2, start: "07:35", end: "08:10", isBreak: false, label: "" },
        { id: 3, jamKe: 3, start: "08:10", end: "08:45", isBreak: false, label: "" },
        { id: 4, jamKe: 4, start: "08:45", end: "09:20", isBreak: false, label: "" },
        { id: 5, jamKe: 0, start: "09:20", end: "09:40", isBreak: true, label: "Istirahat 1" },
        { id: 6, jamKe: 5, start: "09:40", end: "10:15", isBreak: false, label: "" },
        { id: 7, jamKe: 6, start: "10:15", end: "10:50", isBreak: false, label: "" },
        { id: 8, jamKe: 0, start: "10:50", end: "11:05", isBreak: true, label: "Istirahat 2" },
        { id: 9, jamKe: 7, start: "11:05", end: "11:40", isBreak: false, label: "" },
        { id: 10, jamKe: 8, start: "11:40", end: "12:15", isBreak: false, label: "" }
    ],
    'sd-fullday': [
        { id: 1, jamKe: 1, start: "07:00", end: "07:35", isBreak: false, label: "" },
        { id: 2, jamKe: 2, start: "07:35", end: "08:10", isBreak: false, label: "" },
        { id: 3, jamKe: 3, start: "08:10", end: "08:45", isBreak: false, label: "" },
        { id: 4, jamKe: 4, start: "08:45", end: "09:20", isBreak: false, label: "" },
        { id: 5, jamKe: 0, start: "09:20", end: "09:40", isBreak: true, label: "Istirahat 1" },
        { id: 6, jamKe: 5, start: "09:40", end: "10:15", isBreak: false, label: "" },
        { id: 7, jamKe: 6, start: "10:15", end: "10:50", isBreak: false, label: "" },
        { id: 8, jamKe: 7, start: "10:50", end: "11:25", isBreak: false, label: "" },
        { id: 9, jamKe: 8, start: "11:25", end: "12:00", isBreak: false, label: "" },
        { id: 10, jamKe: 0, start: "12:00", end: "13:00", isBreak: true, label: "Istirahat + Makan Siang" },
        { id: 11, jamKe: 9, start: "13:00", end: "13:35", isBreak: false, label: "" },
        { id: 12, jamKe: 10, start: "13:35", end: "14:10", isBreak: false, label: "" }
    ],
    'mi': [
        { id: 1, jamKe: 1, start: "07:00", end: "07:35", isBreak: false, label: "" },
        { id: 2, jamKe: 2, start: "07:35", end: "08:10", isBreak: false, label: "" },
        { id: 3, jamKe: 3, start: "08:10", end: "08:45", isBreak: false, label: "" },
        { id: 4, jamKe: 0, start: "08:45", end: "09:15", isBreak: true, label: "Sholat Dhuha + Istirahat" },
        { id: 5, jamKe: 4, start: "09:15", end: "09:50", isBreak: false, label: "" },
        { id: 6, jamKe: 5, start: "09:50", end: "10:25", isBreak: false, label: "" },
        { id: 7, jamKe: 6, start: "10:25", end: "11:00", isBreak: false, label: "" },
        { id: 8, jamKe: 0, start: "11:00", end: "11:15", isBreak: true, label: "Istirahat 2" },
        { id: 9, jamKe: 7, start: "11:15", end: "11:50", isBreak: false, label: "" },
        { id: 10, jamKe: 8, start: "11:50", end: "12:25", isBreak: false, label: "" },
        { id: 11, jamKe: 0, start: "12:25", end: "13:00", isBreak: true, label: "Sholat Dzuhur" },
        { id: 12, jamKe: 9, start: "13:00", end: "13:35", isBreak: false, label: "" },
        { id: 13, jamKe: 10, start: "13:35", end: "14:10", isBreak: false, label: "" }
    ]
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initializeJadwalPage();
});

// === INITIALIZE PAGE ===
async function initializeJadwalPage() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadTimeSlots();
            await loadAllData();
            renderWeeklySchedule();
            renderClassesList();
            renderStudentsList();
            renderTimeSlotsSettings();
            populateClassDropdowns();
            populateTimeSlotDropdown();
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
        const el = (id) => document.getElementById(id);
        if (el('sidebarName')) el('sidebarName').textContent = name;
        if (el('sidebarEmail')) el('sidebarEmail').textContent = userData.email;
        if (el('sidebarAvatar')) el('sidebarAvatar').textContent = name.charAt(0).toUpperCase();
    }
}

// ============================================
// TIME SLOTS MANAGEMENT
// ============================================

// === LOAD TIME SLOTS ===
async function loadTimeSlots() {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            timeSlots = [...DEFAULT_TIME_SLOTS];
            return;
        }
        
        const doc = await db.collection('settings').doc(userId).get();
        
        if (doc.exists && doc.data().timeSlots) {
            timeSlots = doc.data().timeSlots;
        } else {
            timeSlots = [...DEFAULT_TIME_SLOTS];
        }
    } catch (error) {
        console.error('Error loading time slots:', error);
        timeSlots = [...DEFAULT_TIME_SLOTS];
    }
}

// === SAVE TIME SLOTS ===
async function saveTimeSlots() {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        // Recalculate jamKe
        let jamKe = 1;
        timeSlots.forEach(slot => {
            if (!slot.isBreak) {
                slot.jamKe = jamKe++;
            } else {
                slot.jamKe = 0;
            }
        });
        
        await db.collection('settings').doc(userId).set({
            timeSlots: timeSlots,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        showToast('Pengaturan jam berhasil disimpan!', 'success');
        
        renderWeeklySchedule();
        renderTimeSlotsSettings();
        populateTimeSlotDropdown();
        
    } catch (error) {
        console.error('Error saving time slots:', error);
        showToast('Gagal menyimpan pengaturan', 'error');
    }
}

// === SAVE AND CLOSE MODAL ===
async function saveTimeSlotsAndClose() {
    await saveTimeSlots();
    closeTimeSettingsModal();
}

// === RENDER TIME SLOTS SETTINGS ===
function renderTimeSlotsSettings() {
    const container = document.getElementById('timeSlotsContainer');
    const modalContainer = document.getElementById('modalTimeSlotsContainer');
    
    const html = timeSlots.map((slot, index) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${slot.isBreak ? 'border-l-4 border-yellow-500' : 'border-l-4 border-pai-green'}" data-index="${index}">
            <div class="cursor-move text-gray-400 hover:text-gray-600" title="Drag untuk pindahkan">
                ⋮⋮
            </div>
            
            <div class="flex-shrink-0 w-16 text-center">
                ${slot.isBreak 
                    ? '<span class="text-yellow-600 font-bold">☕</span>' 
                    : `<span class="bg-pai-green text-white px-2 py-1 rounded text-sm font-bold">Jam ${slot.jamKe}</span>`
                }
            </div>
            
            <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                <input type="time" value="${slot.start}" 
                    onchange="updateTimeSlot(${index}, 'start', this.value)"
                    class="form-input text-sm py-1">
                    
                <input type="time" value="${slot.end}" 
                    onchange="updateTimeSlot(${index}, 'end', this.value)"
                    class="form-input text-sm py-1">
                    
                <input type="text" value="${slot.label || ''}" 
                    placeholder="${slot.isBreak ? 'Nama istirahat' : 'Label (opsional)'}"
                    onchange="updateTimeSlot(${index}, 'label', this.value)"
                    class="form-input text-sm py-1">
                    
                <div class="flex items-center gap-2">
                    <label class="flex items-center gap-1 text-sm cursor-pointer">
                        <input type="checkbox" ${slot.isBreak ? 'checked' : ''} 
                            onchange="updateTimeSlot(${index}, 'isBreak', this.checked)"
                            class="w-4 h-4">
                        <span>Istirahat</span>
                    </label>
                </div>
            </div>
            
            <button onclick="removeTimeSlot(${index})" class="text-red-500 hover:text-red-700 p-1" title="Hapus">
                🗑️
            </button>
        </div>
    `).join('');
    
    if (container) container.innerHTML = html;
    if (modalContainer) modalContainer.innerHTML = html;
}

// === UPDATE TIME SLOT ===
function updateTimeSlot(index, field, value) {
    if (timeSlots[index]) {
        timeSlots[index][field] = value;
        
        // If changing isBreak, recalculate jamKe
        if (field === 'isBreak') {
            recalculateJamKe();
        }
        
        renderTimeSlotsSettings();
    }
}

// === RECALCULATE JAM KE ===
function recalculateJamKe() {
    let jamKe = 1;
    timeSlots.forEach(slot => {
        if (!slot.isBreak) {
            slot.jamKe = jamKe++;
        } else {
            slot.jamKe = 0;
        }
    });
}

// === ADD NEW TIME SLOT ===
function addNewTimeSlot() {
    const lastSlot = timeSlots[timeSlots.length - 1];
    const newStart = lastSlot ? lastSlot.end : "07:00";
    
    // Calculate new end time (35 minutes later)
    const [hours, minutes] = newStart.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 35;
    const newEndHours = Math.floor(totalMinutes / 60);
    const newEndMinutes = totalMinutes % 60;
    const newEnd = `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`;
    
    const newId = Math.max(...timeSlots.map(s => s.id), 0) + 1;
    
    timeSlots.push({
        id: newId,
        jamKe: 0,
        start: newStart,
        end: newEnd,
        isBreak: false,
        label: ""
    });
    
    recalculateJamKe();
    renderTimeSlotsSettings();
}

function addNewTimeSlotModal() {
    addNewTimeSlot();
}

// === REMOVE TIME SLOT ===
function removeTimeSlot(index) {
    if (timeSlots.length <= 1) {
        showToast('Minimal harus ada 1 jam pelajaran!', 'warning');
        return;
    }
    
    timeSlots.splice(index, 1);
    recalculateJamKe();
    renderTimeSlotsSettings();
}

// === RESET TO DEFAULT ===
function resetToDefaultTimeSlots() {
    if (!confirm('Reset ke pengaturan jam default?')) return;
    
    timeSlots = [...DEFAULT_TIME_SLOTS];
    renderTimeSlotsSettings();
    showToast('Pengaturan jam direset ke default', 'info');
}

// === APPLY TEMPLATE ===
function applyTemplate(templateId) {
    if (!TIME_SLOT_TEMPLATES[templateId]) return;
    
    if (!confirm('Terapkan template ini? Pengaturan jam saat ini akan diganti.')) return;
    
    timeSlots = JSON.parse(JSON.stringify(TIME_SLOT_TEMPLATES[templateId]));
    renderTimeSlotsSettings();
    saveTimeSlots();
    
    showToast('Template berhasil diterapkan!', 'success');
}

// === POPULATE TIME SLOT DROPDOWN ===
function populateTimeSlotDropdown() {
    const select = document.getElementById('scheduleTimeSlot');
    if (!select) return;
    
    const options = timeSlots
        .filter(slot => !slot.isBreak)
        .map(slot => `<option value="${slot.id}">Jam ${slot.jamKe} (${slot.start} - ${slot.end})</option>`)
        .join('');
    
    select.innerHTML = '<option value="">Pilih jam</option>' + options;
}

// === TIME SETTINGS MODAL ===
function openTimeSettingsModal() {
    renderTimeSlotsSettings();
    document.getElementById('timeSettingsModal').classList.add('active');
}

function closeTimeSettingsModal() {
    document.getElementById('timeSettingsModal').classList.remove('active');
}

// ============================================
// LOAD ALL DATA
// ============================================

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

// ============================================
// RENDER WEEKLY SCHEDULE
// ============================================

function renderWeeklySchedule() {
    const tbody = document.getElementById('weeklyScheduleBody');
    if (!tbody) return;
    
    let html = '';
    
    timeSlots.forEach((slot) => {
        const isBreak = slot.isBreak;
        const jamLabel = isBreak ? '☕' : `Jam ${slot.jamKe}`;
        const timeLabel = `${slot.start} - ${slot.end}`;
        const displayLabel = slot.label || (isBreak ? 'Istirahat' : '');
        
        html += `<tr class="${isBreak ? 'bg-yellow-50' : ''}">`;
        html += `<td class="text-center font-medium ${isBreak ? 'text-yellow-600' : 'text-pai-green'}">${jamLabel}</td>`;
        html += `<td class="text-xs ${isBreak ? 'text-yellow-600' : 'text-gray-600'}">
            ${timeLabel}
            ${displayLabel ? `<br><span class="text-xs">${displayLabel}</span>` : ''}
        </td>`;
        
        DAYS.forEach(day => {
            if (isBreak) {
                html += `<td class="text-center text-yellow-500 text-sm bg-yellow-50">-</td>`;
            } else {
                const schedule = findScheduleForSlot(day, slot.id);
                
                if (schedule) {
                    html += `
                        <td onclick="editSchedule('${schedule.id}')" 
                            class="cursor-pointer hover:bg-pai-light transition-colors p-1">
                            <div class="bg-pai-green text-white rounded-lg p-2 text-xs">
                                <div class="font-semibold">${schedule.className}</div>
                                <div class="opacity-80">${schedule.room || 'PAI'}</div>
                            </div>
                        </td>
                    `;
                } else {
                    html += `
                        <td onclick="openScheduleModalWithSlot('${day}', ${slot.id})"
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
function findScheduleForSlot(day, slotId) {
    return schedules.find(s => s.day === day && s.timeSlotId === slotId);
}

// ============================================
// CLASSES, STUDENTS, SCHEDULES CRUD
// ============================================

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
                        <button onclick="editClass('${cls.id}')" class="p-1 hover:bg-gray-100 rounded">✏️</button>
                        <button onclick="deleteClass('${cls.id}')" class="p-1 hover:bg-gray-100 rounded">🗑️</button>
                    </div>
                </div>
                <h4 class="font-bold text-lg text-gray-800">${cls.name}</h4>
                <p class="text-sm text-gray-500 mb-3">Fase ${cls.fase || '-'} • ${cls.wali || '-'}</p>
                <div class="flex gap-4 text-sm">
                    <span>👨‍🎓 ${studentCount}</span>
                    <span>📅 ${scheduleCount}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderStudentsList(filterClassId = '') {
    const tbody = document.getElementById('studentsBody');
    if (!tbody) return;
    
    let filtered = filterClassId ? students.filter(s => s.classId === filterClassId) : students;
    
    if (filtered.length === 0) {
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
    
    tbody.innerHTML = filtered.map((student, index) => {
        const cls = classes.find(c => c.id === student.classId);
        return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${student.nis || '-'}</td>
                <td class="font-medium">${student.name}</td>
                <td>${cls?.name || '-'}</td>
                <td class="text-center">
                    <span class="badge ${student.gender === 'L' ? 'badge-info' : 'badge-warning'}">${student.gender}</span>
                </td>
                <td>
                    <div class="flex gap-1">
                        <button onclick="editStudent('${student.id}')" class="p-1 hover:bg-gray-100 rounded">✏️</button>
                        <button onclick="deleteStudent('${student.id}')" class="p-1 hover:bg-gray-100 rounded">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function populateClassDropdowns() {
    const options = classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');
    
    ['scheduleClass', 'studentClass', 'importUrlClass', 'importFileClass', 'filterClass'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const first = el.querySelector('option:first-child');
            el.innerHTML = (first ? first.outerHTML : '<option value="">Pilih</option>') + options;
        }
    });
}

// === TAB SWITCHING ===
function switchJadwalTab(tab) {
    ['Weekly', 'Classes', 'Students', 'Settings'].forEach(t => {
        const btn = document.getElementById(`tab${t}`);
        const content = document.getElementById(`content${t}`);
        const isActive = t.toLowerCase() === tab.toLowerCase();
        
        if (btn) btn.classList.toggle('active', isActive);
        if (content) content.classList.toggle('active', isActive);
    });
}

// === SCHEDULE MODAL ===
function openScheduleModal() {
    document.getElementById('scheduleModalTitle').textContent = 'Tambah Jadwal';
    document.getElementById('formSchedule').reset();
    document.getElementById('scheduleId').value = '';
    populateTimeSlotDropdown();
    document.getElementById('scheduleModal').classList.add('active');
}

function openScheduleModalWithSlot(day, slotId) {
    openScheduleModal();
    document.getElementById('scheduleDay').value = day;
    document.getElementById('scheduleTimeSlot').value = slotId;
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

async function saveSchedule() {
    const scheduleId = document.getElementById('scheduleId').value;
    const classId = document.getElementById('scheduleClass').value;
    const day = document.getElementById('scheduleDay').value;
    const timeSlotId = parseInt(document.getElementById('scheduleTimeSlot').value);
    const room = document.getElementById('scheduleRoom').value.trim();
    const note = document.getElementById('scheduleNote').value.trim();
    
    if (!classId || !day || !timeSlotId) {
        showToast('Lengkapi data wajib!', 'error');
        return;
    }
    
    const selectedClass = classes.find(c => c.id === classId);
    const selectedSlot = timeSlots.find(s => s.id === timeSlotId);
    
    const data = {
        classId,
        className: selectedClass?.name || '',
        day,
        timeSlotId,
        startTime: selectedSlot?.start || '',
        endTime: selectedSlot?.end || '',
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
    
    populateTimeSlotDropdown();
    document.getElementById('scheduleTimeSlot').value = schedule.timeSlotId;
    
    document.getElementById('scheduleRoom').value = schedule.room || '';
    document.getElementById('scheduleNote').value = schedule.note || '';
    
    document.getElementById('scheduleModal').classList.add('active');
}

async function deleteSchedule(id) {
    if (!confirm('Hapus jadwal ini?')) return;
    
    try {
        await collections.schedules.doc(id).delete();
        showToast('Jadwal dihapus!', 'success');
        await loadAllData();
        renderWeeklySchedule();
    } catch (error) {
        showToast('Gagal menghapus', 'error');
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
    const level = document.getElementById('classLevel');
    const rombel = document.getElementById('classRombel');
    
    const update = () => {
        const l = level?.value || '';
        const r = rombel?.value?.trim().toUpperCase() || '';
        const name = document.getElementById('className');
        if (name && l && r) name.value = `Kelas ${l}${r}`;
    };
    
    level?.addEventListener('change', update);
    rombel?.addEventListener('input', update);
}

function updateFase() {
    const level = document.getElementById('classLevel')?.value;
    const fase = document.getElementById('classFase');
    if (fase && typeof getFaseByKelas === 'function') {
        const f = getFaseByKelas(level);
        fase.value = f ? `Fase ${f}` : '';
    }
}

async function saveClass() {
    const classId = document.getElementById('classId').value;
    const level = document.getElementById('classLevel').value;
    const rombel = document.getElementById('classRombel').value.trim().toUpperCase();
    const studentCount = parseInt(document.getElementById('classStudentCount').value) || 0;
    const wali = document.getElementById('classWali').value.trim();
    
    if (!level || !rombel) {
        showToast('Lengkapi data!', 'error');
        return;
    }
    
    const name = `Kelas ${level}${rombel}`;
    const fase = typeof getFaseByKelas === 'function' ? getFaseByKelas(level) : '';
    
    const data = {
        name, level: parseInt(level), rombel, fase, studentCount, wali,
        teacherId: auth.currentUser.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (classId) {
            await collections.classes.doc(classId).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await collections.classes.add(data);
        }
        showToast('Kelas berhasil disimpan!', 'success');
        closeClassModal();
        await loadAllData();
        renderClassesList();
        populateClassDropdowns();
    } catch (error) {
        showToast('Gagal menyimpan', 'error');
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
    document.getElementById('classFase').value = `Fase ${cls.fase || ''}`;
    document.getElementById('classStudentCount').value = cls.studentCount || 0;
    document.getElementById('classWali').value = cls.wali || '';
    document.getElementById('classModal').classList.add('active');
}

async function deleteClass(id) {
    const studentCount = students.filter(s => s.classId === id).length;
    if (studentCount > 0) {
        showToast(`Tidak bisa menghapus, ada ${studentCount} siswa!`, 'error');
        return;
    }
    if (!confirm('Hapus kelas ini?')) return;
    
    try {
        // Delete related schedules
        const relatedSchedules = schedules.filter(s => s.classId === id);
        for (const s of relatedSchedules) {
            await collections.schedules.doc(s.id).delete();
        }
        await collections.classes.doc(id).delete();
        showToast('Kelas dihapus!', 'success');
        await loadAllData();
        renderClassesList();
        renderWeeklySchedule();
        populateClassDropdowns();
    } catch (error) {
        showToast('Gagal menghapus', 'error');
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
        showToast('Lengkapi data wajib!', 'error');
        return;
    }
    
    const data = {
        nis, name, classId, gender, birthPlace, birthDate, parent,
        teacherId: auth.currentUser.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (studentId) {
            await collections.students.doc(studentId).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await collections.students.add(data);
        }
        showToast('Siswa berhasil disimpan!', 'success');
        closeStudentModal();
        await loadAllData();
        renderStudentsList();
        renderClassesList();
    } catch (error) {
        showToast('Gagal menyimpan', 'error');
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
    if (!confirm(`Hapus ${student?.name}?`)) return;
    
    try {
        await collections.students.doc(id).delete();
        showToast('Siswa dihapus!', 'success');
        await loadAllData();
        renderStudentsList();
        renderClassesList();
    } catch (error) {
        showToast('Gagal menghapus', 'error');
    }
}

function filterStudentsByClass() {
    const classId = document.getElementById('filterClass').value;
    renderStudentsList(classId);
}

// ============================================
// IMPORT FUNCTIONS
// ============================================

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
        tabUrl?.classList.add('border-pai-green', 'text-pai-green');
        tabUrl?.classList.remove('border-transparent', 'text-gray-500');
        tabFile?.classList.remove('border-pai-green', 'text-pai-green');
        tabFile?.classList.add('border-transparent', 'text-gray-500');
        contentUrl?.classList.remove('hidden');
        contentFile?.classList.add('hidden');
    } else {
        tabFile?.classList.add('border-pai-green', 'text-pai-green');
        tabFile?.classList.remove('border-transparent', 'text-gray-500');
        tabUrl?.classList.remove('border-pai-green', 'text-pai-green');
        tabUrl?.classList.add('border-transparent', 'text-gray-500');
        contentFile?.classList.remove('hidden');
        contentUrl?.classList.add('hidden');
    }
}

async function fetchFromGoogleSheets() {
    const url = document.getElementById('importUrl').value.trim();
    const classId = document.getElementById('importUrlClass').value;
    
    if (!classId) { showToast('Pilih kelas!', 'error'); return; }
    if (!url) { showToast('Masukkan URL!', 'error'); return; }
    
    showLoading('Mengambil data...');
    
    try {
        let csvUrl = url;
        if (url.includes('/edit')) {
            const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match) csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
        } else if (!url.includes('output=csv')) {
            csvUrl = url.includes('?') ? url + '&output=csv' : url + '?output=csv';
        }
        
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(csvUrl));
        const csvText = await response.text();
        
        if (csvText.includes('<!DOCTYPE')) throw new Error('Spreadsheet tidak bisa diakses');
        
        const parsed = parseCSV(csvText);
        importData = parsed.map(row => ({ ...row, classId }));
        
        showImportPreview(importData);
        hideLoading();
        showToast(`${importData.length} siswa ditemukan!`, 'success');
    } catch (error) {
        hideLoading();
        showToast(error.message || 'Gagal mengambil data', 'error');
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.toLowerCase().trim().replace(/"/g, ''));
    
    const findCol = (names) => headers.findIndex(h => names.some(n => h.includes(n)));
    
    const nisIdx = findCol(['nis', 'nisn', 'induk']);
    const namaIdx = findCol(['nama', 'name']);
    const genderIdx = findCol(['l/p', 'jk', 'kelamin', 'gender']);
    const tempatIdx = findCol(['tempat']);
    const tanggalIdx = findCol(['tanggal', 'lahir']);
    const ortuIdx = findCol(['orang tua', 'ortu', 'wali']);
    
    if (namaIdx === -1) { showToast('Kolom Nama tidak ditemukan!', 'error'); return []; }
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        const nama = vals[namaIdx];
        if (!nama) continue;
        
        let gender = 'L';
        if (genderIdx !== -1) {
            const g = vals[genderIdx]?.toUpperCase();
            if (['P', 'PEREMPUAN', 'WANITA', 'F'].includes(g)) gender = 'P';
        }
        
        result.push({
            nis: nisIdx !== -1 ? vals[nisIdx] || '' : '',
            name: nama,
            gender,
            birthPlace: tempatIdx !== -1 ? vals[tempatIdx] || '' : '',
            birthDate: tanggalIdx !== -1 ? formatDate(vals[tanggalIdx]) : '',
            parent: ortuIdx !== -1 ? vals[ortuIdx] || '' : ''
        });
    }
    return result;
}

function formatDate(str) {
    if (!str) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    return '';
}

async function previewFileImport() {
    const file = document.getElementById('importFile').files[0];
    const classId = document.getElementById('importFileClass').value;
    
    if (!classId) { showToast('Pilih kelas!', 'error'); return; }
    if (!file) return;
    
    const text = await file.text();
    const parsed = parseCSV(text);
    importData = parsed.map(row => ({ ...row, classId }));
    showImportPreview(importData);
}

function showImportPreview(data) {
    document.getElementById('importPreview').classList.remove('hidden');
    document.getElementById('previewCount').textContent = data.length;
    document.getElementById('importCountBtn').textContent = data.length;
    document.getElementById('btnProcessImport').disabled = false;
    
    document.getElementById('previewTableBody').innerHTML = data.map((r, i) => `
        <tr class="${i % 2 ? 'bg-gray-50' : ''}">
            <td class="p-2">${i + 1}</td>
            <td class="p-2">${r.nis || '-'}</td>
            <td class="p-2">${r.name}</td>
            <td class="p-2">${r.gender}</td>
        </tr>
    `).join('');
}

function clearPreview() {
    document.getElementById('importPreview')?.classList.add('hidden');
    document.getElementById('previewTableBody').innerHTML = '';
    document.getElementById('btnProcessImport').disabled = true;
    document.getElementById('importCountBtn').textContent = '0';
    importData = [];
    
    const url = document.getElementById('importUrl');
    const file = document.getElementById('importFile');
    if (url) url.value = '';
    if (file) file.value = '';
}

async function processImport() {
    if (!importData.length) return;
    
    showLoading(`Mengimport ${importData.length} siswa...`);
    
    try {
        const userId = auth.currentUser.uid;
        const batch = db.batch();
        
        importData.forEach(row => {
            const ref = collections.students.doc();
            batch.set(ref, {
                ...row,
                teacherId: userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        hideLoading();
        showToast(`${importData.length} siswa berhasil diimport!`, 'success');
        closeImportModal();
        await loadAllData();
        renderStudentsList();
        renderClassesList();
    } catch (error) {
        hideLoading();
        showToast('Gagal import', 'error');
    }
}

function downloadTemplate() {
    const csv = "NIS,Nama Lengkap,Jenis Kelamin (L/P),Tempat Lahir,Tanggal Lahir,Nama Orang Tua\n12345,Ahmad,L,Jakarta,15/05/2015,Budi\n";
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'template_siswa.csv';
    a.click();
    showToast('Template diunduh!', 'success');
}

// === UTILITIES ===
function showLoading(text = 'Memproses...') {
    const el = document.getElementById('loadingOverlay');
    const txt = document.getElementById('loadingText');
    if (txt) txt.textContent = text;
    if (el) el.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
}

function printSchedule() { window.print(); }

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('open');
    sidebar?.classList.toggle('collapsed');
}

console.log('✅ Jadwal module initialized (customizable time slots)');
