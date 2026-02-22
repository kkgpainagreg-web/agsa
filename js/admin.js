// Admin Panel Logic - FIXED COMPLETE VERSION

let allUsers = [];

// FASE MAPPING untuk admin
const FASE_MAPPING_ADMIN = {
    'Fase A': { jenjang: 'SD', kelas: [1, 2] },
    'Fase B': { jenjang: 'SD', kelas: [3, 4] },
    'Fase C': { jenjang: 'SD', kelas: [5, 6] },
    'Fase D': { jenjang: 'SMP', kelas: [7, 8, 9] },
    'Fase E': { jenjang: 'SMA', kelas: [10] },
    'Fase F': { jenjang: 'SMA', kelas: [11, 12] }
};

// Default CP Data untuk tampilan admin (sample)
const CP_SAMPLE_DATA = [
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu mengenal dan melafalkan huruf hijaiyah dan harakat dasar dengan benar.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menyebutkan dan meyakini 6 Rukun Iman dengan benar sebagai wujud keimanan.", dimensi: ["Keimanan"] },
    { fase: "Fase B", kelas: 3, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca Surah Al-Kautsar dan Al-Asr dengan tartil dan memahami pesan pokoknya.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase C", kelas: 5, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca, menghafal, dan mempraktikkan pesan kepedulian sosial Surah Al-Ma'un.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase D", kelas: 7, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca dan merenungkan ayat Al-Qur'an tentang penciptaan alam semesta.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase E", kelas: 10, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat Al-Qur'an tentang kontrol diri dan persaudaraan.", dimensi: ["Keimanan", "Penalaran Kritis", "Kewargaan"] },
    { fase: "Fase F", kelas: 11, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat tentang pentingnya berpikir kritis dan penguasaan IPTEK.", dimensi: ["Penalaran Kritis", "Kreativitas"] },
];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page loaded, waiting for auth...');
    
    // Hide loading after timeout as fallback
    setTimeout(() => {
        const loadingState = document.getElementById('loadingState');
        if (loadingState && !loadingState.classList.contains('hidden')) {
            console.log('Auth timeout, checking manually...');
        }
    }, 5000);

    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? user.email : 'No user');
        
        const loadingState = document.getElementById('loadingState');
        const accessDenied = document.getElementById('accessDenied');
        const adminContent = document.getElementById('adminContent');

        // Hide loading
        if (loadingState) loadingState.classList.add('hidden');

        if (!user) {
            console.log('No user, redirecting to index...');
            window.location.href = 'index.html';
            return;
        }

        // Simpan current user
        currentUser = user;

        // Check if super admin
        console.log('Checking admin access for:', user.email);
        console.log('SUPER_ADMIN_EMAIL:', typeof SUPER_ADMIN_EMAIL !== 'undefined' ? SUPER_ADMIN_EMAIL : 'NOT DEFINED');
        
        // Pastikan SUPER_ADMIN_EMAIL sudah terdefinisi
        const adminEmail = typeof SUPER_ADMIN_EMAIL !== 'undefined' ? SUPER_ADMIN_EMAIL : 'afifaro@gmail.com';
        
        if (user.email !== adminEmail) {
            console.log('Access denied for:', user.email);
            if (accessDenied) accessDenied.classList.remove('hidden');
            if (adminContent) adminContent.classList.add('hidden');
            return;
        }

        console.log('Admin access granted!');
        if (accessDenied) accessDenied.classList.add('hidden');
        if (adminContent) adminContent.classList.remove('hidden');
        
        showLoading(true);
        
        try {
            await loadAdminData();
        } catch (error) {
            console.error('Error in loadAdminData:', error);
            showToast('Gagal memuat data: ' + error.message, 'error');
        }
        
        showLoading(false);
    });
});

// Load admin data
async function loadAdminData() {
    console.log('Loading admin data...');
    
    try {
        // Load all users
        const usersSnapshot = await db.collection('users').get();
        allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Loaded', allUsers.length, 'users');

        // Update stats
        updateAdminStats();
        
        // Render users table
        renderUsersTable(allUsers);

        // Load settings
        await loadAdminAppSettings();

        // Render default CP
        renderDefaultCPList();

    } catch (error) {
        console.error('Error loading admin data:', error);
        throw error;
    }
}

// Update admin statistics
function updateAdminStats() {
    const statTotalUsers = document.getElementById('statTotalUsers');
    const statPremiumUsers = document.getElementById('statPremiumUsers');
    const statActiveToday = document.getElementById('statActiveToday');
    const statSchoolPackages = document.getElementById('statSchoolPackages');
    
    if (statTotalUsers) statTotalUsers.textContent = allUsers.length;
    
    const premiumUsers = allUsers.filter(u => 
        u.subscription?.type === 'premium' || u.subscription?.type === 'school'
    );
    if (statPremiumUsers) statPremiumUsers.textContent = premiumUsers.length;

    // Active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = allUsers.filter(u => {
        if (!u.lastLoginAt) return false;
        try {
            const lastLogin = u.lastLoginAt.toDate ? u.lastLoginAt.toDate() : new Date(u.lastLoginAt);
            return lastLogin >= today;
        } catch (e) {
            return false;
        }
    });
    if (statActiveToday) statActiveToday.textContent = activeToday.length;

    const schoolPackages = allUsers.filter(u => u.subscription?.type === 'school');
    if (statSchoolPackages) statSchoolPackages.textContent = schoolPackages.length;
}

// Show admin tab
function showAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active', 'border-primary-600', 'text-primary-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Find clicked tab and activate it
    const clickedTab = event?.target?.closest('.admin-tab');
    if (clickedTab) {
        clickedTab.classList.add('active', 'border-primary-600', 'text-primary-600');
        clickedTab.classList.remove('border-transparent', 'text-gray-500');
    }

    // Show/hide tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
}

// Render users table
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">Tidak ada data pengguna</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const subType = user.subscription?.type || 'free';
        const endDate = user.subscription?.endDate;
        let endDateStr = '-';
        
        if (endDate) {
            try {
                const date = endDate.toDate ? endDate.toDate() : new Date(endDate);
                endDateStr = date.toLocaleDateString('id-ID');
            } catch (e) {
                endDateStr = '-';
            }
        }
        
        const statusBadge = {
            'free': '<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Free</span>',
            'premium': '<span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Premium</span>',
            'school': '<span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Sekolah</span>'
        };

        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">${user.email || '-'}</td>
                <td class="px-4 py-3 text-sm font-medium">${user.displayName || '-'}</td>
                <td class="px-4 py-3 text-sm">${user.schoolName || '-'}</td>
                <td class="px-4 py-3 text-center">${statusBadge[subType] || statusBadge['free']}</td>
                <td class="px-4 py-3 text-sm text-center">${endDateStr}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="showSetPremiumModal('${user.id}', '${(user.email || '').replace(/'/g, "\\'")}')" 
                        class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Search users
function searchUsers() {
    const searchInput = document.getElementById('searchUser');
    const query = (searchInput?.value || '').toLowerCase();
    
    if (!query) {
        renderUsersTable(allUsers);
        return;
    }
    
    const filtered = allUsers.filter(u => 
        (u.email || '').toLowerCase().includes(query) ||
        (u.displayName || '').toLowerCase().includes(query) ||
        (u.schoolName || '').toLowerCase().includes(query)
    );
    renderUsersTable(filtered);
}

// Show set premium modal
function showSetPremiumModal(userId, email) {
    const premiumUserId = document.getElementById('premiumUserId');
    const premiumUserEmail = document.getElementById('premiumUserEmail');
    const premiumType = document.getElementById('premiumType');
    const premiumEndDate = document.getElementById('premiumEndDate');
    
    if (premiumUserId) premiumUserId.value = userId;
    if (premiumUserEmail) premiumUserEmail.value = email;
    
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        if (premiumType) premiumType.value = user.subscription?.type || 'free';
        
        if (user.subscription?.endDate && premiumEndDate) {
            try {
                const endDate = user.subscription.endDate.toDate ? 
                    user.subscription.endDate.toDate() : new Date(user.subscription.endDate);
                premiumEndDate.value = endDate.toISOString().split('T')[0];
            } catch (e) {
                setDefaultEndDate();
            }
        } else {
            setDefaultEndDate();
        }
    } else {
        setDefaultEndDate();
    }
    
    showModal('setPremiumModal');
}

function setDefaultEndDate() {
    const premiumEndDate = document.getElementById('premiumEndDate');
    if (premiumEndDate) {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        premiumEndDate.value = nextYear.toISOString().split('T')[0];
    }
}

// Handle set premium form
async function handleSetPremium(e) {
    e.preventDefault();
    showLoading(true);

    try {
        const userId = document.getElementById('premiumUserId')?.value;
        const type = document.getElementById('premiumType')?.value || 'free';
        const endDate = document.getElementById('premiumEndDate')?.value;

        if (!userId) {
            showToast('User ID tidak ditemukan', 'error');
            showLoading(false);
            return;
        }

        const updateData = {
            'subscription.type': type,
            'subscription.isActive': type !== 'free',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (type !== 'free' && endDate) {
            updateData['subscription.endDate'] = new Date(endDate);
            updateData['subscription.startDate'] = firebase.firestore.FieldValue.serverTimestamp();
        } else {
            updateData['subscription.endDate'] = null;
            updateData['subscription.startDate'] = null;
        }

        await db.collection('users').doc(userId).update(updateData);

        // Update local data
        const userIndex = allUsers.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            allUsers[userIndex].subscription = {
                type,
                endDate: type !== 'free' && endDate ? new Date(endDate) : null,
                isActive: type !== 'free'
            };
        }

        hideModal('setPremiumModal');
        renderUsersTable(allUsers);
        updateAdminStats();
        showToast('Status premium berhasil diupdate!', 'success');

    } catch (error) {
        console.error('Error updating premium status:', error);
        showToast('Gagal mengupdate status: ' + error.message, 'error');
    }

    showLoading(false);
}

// Load app settings
async function loadAdminAppSettings() {
    try {
        const doc = await db.collection('settings').doc('app').get();
        if (doc.exists) {
            const settings = doc.data();
            const settingWhatsapp = document.getElementById('settingWhatsapp');
            const settingPremiumPrice = document.getElementById('settingPremiumPrice');
            const settingAppVersion = document.getElementById('settingAppVersion');
            const settingMaintenance = document.getElementById('settingMaintenance');
            
            if (settingWhatsapp) settingWhatsapp.value = settings.whatsappNumber || '';
            if (settingPremiumPrice) settingPremiumPrice.value = settings.premiumPrice || 99000;
            if (settingAppVersion) settingAppVersion.value = settings.appVersion || '1.0.0';
            if (settingMaintenance) settingMaintenance.checked = settings.maintenanceMode || false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Handle settings form
async function handleSettingsSubmit(e) {
    e.preventDefault();
    showLoading(true);

    try {
        const settings = {
            whatsappNumber: document.getElementById('settingWhatsapp')?.value || '',
            premiumPrice: parseInt(document.getElementById('settingPremiumPrice')?.value) || 99000,
            appVersion: document.getElementById('settingAppVersion')?.value || '1.0.0',
            maintenanceMode: document.getElementById('settingMaintenance')?.checked || false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('settings').doc('app').set(settings, { merge: true });
        
        // Update global settings
        if (typeof APP_SETTINGS !== 'undefined') {
            Object.assign(APP_SETTINGS, settings);
        }
        
        showToast('Pengaturan berhasil disimpan!', 'success');

    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Gagal menyimpan pengaturan: ' + error.message, 'error');
    }

    showLoading(false);
}

// Render default CP list
function renderDefaultCPList() {
    const container = document.getElementById('defaultCPList');
    if (!container) return;
    
    // Group by Fase
    const grouped = {};
    CP_SAMPLE_DATA.forEach(cp => {
        if (!grouped[cp.fase]) grouped[cp.fase] = [];
        grouped[cp.fase].push(cp);
    });
    
    container.innerHTML = Object.entries(grouped).map(([fase, items]) => `
        <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-gray-50 px-4 py-3 font-semibold text-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition" onclick="toggleCPGroup(this)">
                <span><i class="fas fa-folder mr-2 text-amber-500"></i>${fase} (Kelas ${FASE_MAPPING_ADMIN[fase]?.kelas.join(', ') || '-'})</span>
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-normal text-gray-500">${items.length} TP (sample)</span>
                    <i class="fas fa-chevron-down transition-transform"></i>
                </div>
            </div>
            <div class="hidden divide-y divide-gray-100 max-h-96 overflow-y-auto">
                ${items.map((cp, i) => `
                    <div class="p-4 text-sm hover:bg-gray-50">
                        <div class="flex items-center space-x-2 mb-2">
                            <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Kelas ${cp.kelas}</span>
                            <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">${cp.semester}</span>
                            <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">${cp.elemen}</span>
                        </div>
                        <p class="text-gray-700 mb-2">${cp.tujuanPembelajaran}</p>
                        <div class="flex flex-wrap gap-1">
                            ${(cp.dimensi || []).map(d => `
                                <span class="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">${d}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Add info about full data
    container.innerHTML += `
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
            <p class="text-green-800 text-sm">
                <i class="fas fa-check-circle mr-2"></i>
                <strong>Data CP Default PAI Lengkap</strong> (60 TP dari Kelas 1-12) sudah tersedia di aplikasi utama. 
                Guru dapat memuat data ini dengan mengklik tombol "Load Default PAI" di menu Capaian Pembelajaran.
            </p>
        </div>
    `;
}

// Toggle CP group
function toggleCPGroup(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('i.fa-chevron-down');
    
    if (content) {
        content.classList.toggle('hidden');
    }
    if (icon) {
        icon.classList.toggle('rotate-180');
    }
}

// Show add default CP modal
function showAddDefaultCPModal() {
    showToast('Fitur tambah CP default akan segera tersedia', 'info');
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

// Hide modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// Setup form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Set premium form
    const setPremiumForm = document.getElementById('setPremiumForm');
    if (setPremiumForm) {
        setPremiumForm.addEventListener('submit', handleSetPremium);
    }

    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
});

console.log('Admin.js loaded successfully');
