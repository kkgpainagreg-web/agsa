/**
 * AGSA - Admin Guru Super App
 * Dashboard Module
 * 
 * Main dashboard with overview and quick actions
 */

const DashboardModule = {
    container: null,
    profileData: null,
    stats: null,

    /**
     * Initialize module
     * @param {HTMLElement} container 
     */
    async init(container) {
        this.container = container;
        AGSALoader.inline.show(container, 'Memuat dashboard...');

        try {
            // Load data
            await this.loadData();
            
            // Render
            this.render();
            
            // Attach events
            this.attachEvents();
        } catch (error) {
            AGSAHelpers.error('Dashboard', 'Init failed:', error);
            this.renderError(error);
        }
    },

    /**
     * Load dashboard data
     */
    async loadData() {
        // Load profile
        this.profileData = await ProfileService.getProfile();
        
        // Load stats
        this.stats = await this.calculateStats();
    },

    /**
     * Calculate dashboard stats
     */
    async calculateStats() {
        const stats = {
            profile: { complete: false, percent: 0 },
            calendar: { ready: false },
            schedule: { ready: false },
            cp: { count: 0, ready: false },
            siswa: { count: 0, kelasCount: 0 },
            atp: { count: 0 },
            prota: { count: 0 },
            promes: { count: 0 },
            modul: { count: 0 },
            jurnal: { count: 0 }
        };

        try {
            // Profile completion
            const profileCheck = await ProfileService.checkProfileCompletion();
            stats.profile.complete = profileCheck.isComplete;
            stats.profile.percent = profileCheck.completionPercent;

            // Calendar - check if exists
            // stats.calendar.ready = await CalendarService.hasCalendar();

            // Schedule - check if exists
            // stats.schedule.ready = await ScheduleService.hasSchedule();

            // CP count
            // const cpData = await CPService.getCP();
            // stats.cp.count = cpData?.items?.length || 0;
            // stats.cp.ready = stats.cp.count > 0;

            // Siswa count
            // const siswaData = await SiswaService.getAllKelas();
            // stats.siswa.kelasCount = Object.keys(siswaData?.kelas || {}).length;

            // Document counts would be loaded here
        } catch (error) {
            AGSAHelpers.error('Dashboard', 'Stats calculation error:', error);
        }

        return stats;
    },

    /**
     * Render dashboard
     */
    render() {
        const isPremium = AuthService.isPremium();
        const userName = AuthService.getUserDisplayName();
        const greeting = this.getGreeting();

        this.container.innerHTML = `
            <div class="space-y-6 animate-fadeIn">
                <!-- Welcome Section -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <p class="text-blue-100 text-sm mb-1">${greeting}</p>
                            <h1 class="text-2xl font-bold mb-2">${userName}</h1>
                            <p class="text-blue-100 text-sm">
                                ${this.profileData?.namaSatuan || 'Lengkapi profil untuk memulai'}
                            </p>
                        </div>
                        <div class="mt-4 md:mt-0 flex items-center space-x-3">
                            ${!isPremium ? `
                                <button id="btn-upgrade" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
                                    ⭐ Upgrade Premium
                                </button>
                            ` : `
                                <span class="px-3 py-1.5 bg-yellow-400/20 text-yellow-100 rounded-lg text-sm font-medium">
                                    ⭐ Premium Active
                                </span>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Setup Checklist -->
                ${this.renderSetupChecklist()}

                <!-- Quick Stats -->
                ${this.renderQuickStats()}

                <!-- Quick Actions -->
                ${this.renderQuickActions()}

                <!-- Recent Activity -->
                ${this.renderRecentActivity()}

                <!-- 8 Dimensi Profil Lulusan -->
                ${this.renderProfilLulusan()}
            </div>
        `;
    },

    /**
     * Render setup checklist
     */
    renderSetupChecklist() {
        const items = [
            {
                id: 'profile',
                label: 'Profil Guru & Sekolah',
                description: 'Lengkapi data guru dan sekolah',
                done: this.stats.profile.complete,
                path: 'profile',
                icon: '👤'
            },
            {
                id: 'calendar',
                label: 'Kalender Pendidikan',
                description: 'Atur hari libur dan semester',
                done: this.stats.calendar.ready,
                path: 'calendar',
                icon: '📅'
            },
            {
                id: 'cp',
                label: 'Data CP (CSV)',
                description: 'Import Capaian Pembelajaran',
                done: this.stats.cp.ready,
                path: 'cp',
                icon: '📄'
            },
            {
                id: 'schedule',
                label: 'Jadwal Pelajaran',
                description: 'Atur jadwal mengajar',
                done: this.stats.schedule.ready,
                path: 'schedule',
                icon: '⏰'
            },
            {
                id: 'siswa',
                label: 'Data Siswa',
                description: 'Import data peserta didik',
                done: this.stats.siswa.kelasCount > 0,
                path: 'siswa',
                icon: '👥'
            }
        ];

        const completedCount = items.filter(i => i.done).length;
        const allComplete = completedCount === items.length;

        if (allComplete) {
            return `
                <div class="bg-green-50 border border-green-100 rounded-2xl p-6">
                    <div class="flex items-center">
                        <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mr-4">✅</div>
                        <div>
                            <h3 class="font-semibold text-green-900">Setup Lengkap!</h3>
                            <p class="text-sm text-green-700">Semua data awal sudah diisi. Anda siap generate dokumen.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 class="font-semibold text-gray-900">📋 Checklist Setup</h2>
                        <p class="text-sm text-gray-500">Lengkapi data untuk mulai generate dokumen</p>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-bold text-blue-600">${completedCount}</span>
                        <span class="text-gray-400">/ ${items.length}</span>
                    </div>
                </div>
                <div class="p-4 space-y-2">
                    ${items.map(item => `
                        <a href="#${item.path}" 
                           class="checklist-item flex items-center p-3 rounded-xl transition-colors ${item.done ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}"
                           data-path="${item.path}">
                            <span class="text-xl mr-3">${item.icon}</span>
                            <div class="flex-1">
                                <p class="font-medium ${item.done ? 'text-green-700' : 'text-gray-900'}">${item.label}</p>
                                <p class="text-xs ${item.done ? 'text-green-600' : 'text-gray-500'}">${item.description}</p>
                            </div>
                            ${item.done ? `
                                <span class="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </span>
                            ` : `
                                <span class="text-blue-600 text-sm font-medium">Atur →</span>
                            `}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render quick stats
     */
    renderQuickStats() {
        const stats = [
            {
                label: 'ATP',
                value: this.stats.atp.count,
                icon: '🎯',
                color: 'blue',
                path: 'atp'
            },
            {
                label: 'Prota',
                value: this.stats.prota.count,
                icon: '📅',
                color: 'green',
                path: 'prota'
            },
            {
                label: 'Promes',
                value: this.stats.promes.count,
                icon: '📆',
                color: 'purple',
                path: 'promes',
                premium: true
            },
            {
                label: 'Modul Ajar',
                value: this.stats.modul.count,
                icon: '📚',
                color: 'orange',
                path: 'modul',
                premium: true
            }
        ];

        const isPremium = AuthService.isPremium();

        return `
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                ${stats.map(stat => `
                    <a href="#${stat.path}" 
                       class="stat-card bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all ${stat.premium && !isPremium ? 'opacity-60' : ''}"
                       data-path="${stat.path}"
                       ${stat.premium && !isPremium ? 'data-locked="true"' : ''}>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-2xl">${stat.icon}</span>
                            ${stat.premium && !isPremium ? `
                                <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🔒</span>
                            ` : ''}
                        </div>
                        <p class="text-2xl font-bold text-gray-900">${stat.value}</p>
                        <p class="text-sm text-gray-500">${stat.label}</p>
                    </a>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render quick actions
     */
    renderQuickActions() {
        const isPremium = AuthService.isPremium();

        const actions = [
            {
                label: 'Generate ATP',
                description: 'Buat ATP dari data CP',
                icon: '🎯',
                path: 'atp',
                color: 'blue'
            },
            {
                label: 'Generate Prota',
                description: 'Buat Program Tahunan',
                icon: '📅',
                path: 'prota',
                color: 'green'
            },
            {
                label: 'Generate Promes',
                description: 'Buat Program Semester',
                icon: '📆',
                path: 'promes',
                color: 'purple',
                premium: true
            },
            {
                label: 'Isi Jurnal',
                description: 'Catat jurnal harian',
                icon: '📝',
                path: 'jurnal',
                color: 'orange',
                premium: true
            },
            {
                label: 'Input Nilai',
                description: 'Masukkan nilai siswa',
                icon: '📊',
                path: 'nilai',
                color: 'red',
                premium: true
            },
            {
                label: 'AI Assistant',
                description: 'Generate dengan AI',
                icon: '🤖',
                path: 'ai',
                color: 'indigo',
                premium: true
            }
        ];

        return `
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-900">⚡ Aksi Cepat</h2>
                    <p class="text-sm text-gray-500">Generate dokumen dengan sekali klik</p>
                </div>
                <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    ${actions.map(action => {
                        const isLocked = action.premium && !isPremium;
                        return `
                            <button class="action-btn flex flex-col items-center p-4 rounded-xl transition-all ${
                                isLocked 
                                    ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                                    : `bg-${action.color}-50 hover:bg-${action.color}-100`
                            }"
                                data-path="${action.path}"
                                ${isLocked ? 'data-locked="true"' : ''}>
                                <span class="text-3xl mb-2">${action.icon}</span>
                                <span class="text-sm font-medium text-gray-900">${action.label}</span>
                                <span class="text-xs text-gray-500 text-center mt-1">${action.description}</span>
                                ${isLocked ? `<span class="text-xs text-gray-400 mt-1">🔒 Premium</span>` : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render recent activity
     */
    renderRecentActivity() {
        // Placeholder - would show actual activity
        return `
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-900">🕐 Aktivitas Terbaru</h2>
                </div>
                <div class="p-6">
                    <div class="text-center py-8">
                        <span class="text-4xl mb-3 block">📭</span>
                        <p class="text-gray-500">Belum ada aktivitas</p>
                        <p class="text-sm text-gray-400 mt-1">Aktivitas Anda akan muncul di sini</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render 8 Dimensi Profil Lulusan
     */
    renderProfilLulusan() {
        const { PROFIL_LULUSAN } = AGSA_CONSTANTS;

        return `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div class="text-center mb-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-1">8 Dimensi Profil Lulusan</h2>
                    <p class="text-sm text-gray-600">Terintegrasi di setiap Tujuan Pembelajaran</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    ${PROFIL_LULUSAN.map(profil => `
                        <div class="bg-white rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
                            <span class="text-2xl block mb-1">${profil.icon}</span>
                            <p class="text-sm font-medium text-gray-900">${profil.nama}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Get greeting based on time
     */
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return '🌅 Selamat Pagi';
        if (hour < 15) return '☀️ Selamat Siang';
        if (hour < 18) return '🌤️ Selamat Sore';
        return '🌙 Selamat Malam';
    },

    /**
     * Render error state
     */
    renderError(error) {
        this.container.innerHTML = `
            <div class="text-center py-12">
                <span class="text-6xl block mb-4">😵</span>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Dashboard</h2>
                <p class="text-gray-500 mb-6">${error.message}</p>
                <button onclick="DashboardModule.init(document.getElementById('page-content'))" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    Coba Lagi
                </button>
            </div>
        `;
    },

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Checklist items
        this.container.querySelectorAll('.checklist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const path = item.dataset.path;
                window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
            });
        });

        // Stat cards
        this.container.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                if (card.dataset.locked === 'true') {
                    this.showUpgradePrompt();
                    return;
                }
                const path = card.dataset.path;
                window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
            });
        });

        // Action buttons
        this.container.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.locked === 'true') {
                    this.showUpgradePrompt();
                    return;
                }
                const path = btn.dataset.path;
                window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
            });
        });

        // Upgrade button
        const upgradeBtn = this.container.querySelector('#btn-upgrade');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { path: 'settings', tab: 'subscription' } 
                }));
            });
        }
    },

    /**
     * Show upgrade prompt
     */
    showUpgradePrompt() {
        AGSAModal.confirm({
            title: '⭐ Fitur Premium',
            message: 'Fitur ini hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk akses semua fitur!',
            confirmText: 'Upgrade Sekarang',
            cancelText: 'Nanti'
        }).then(confirmed => {
            if (confirmed) {
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { path: 'settings', tab: 'subscription' } 
                }));
            }
        });
    },

    /**
     * Refresh dashboard
     */
    async refresh() {
        await this.loadData();
        this.render();
        this.attachEvents();
    }
};

// Export
window.DashboardModule = DashboardModule;

console.log('📊 Dashboard Module loaded successfully');