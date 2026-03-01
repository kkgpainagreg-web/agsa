/**
 * AGSA - Admin Guru Super App
 * Main Application Entry Point
 * 
 * Initializes the application and handles routing
 */

const AGSAApp = {
    currentModule: null,
    currentPath: 'dashboard',
    isInitialized: false,

    /**
     * Initialize application
     */
    async init() {
        console.log('🚀 Initializing AGSA...');

        try {
            // Check authentication
            const user = await AuthService.init();

            if (!user) {
                // Redirect to login
                window.location.href = 'index.html';
                return;
            }

            // Hide loading, show app
            document.getElementById('app-loading').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');

            // Initialize UI components
            await this.initializeUI();

            // Set up routing
            this.setupRouting();

            // Navigate to initial path
            const initialPath = this.getInitialPath();
            await this.navigate(initialPath);

            this.isInitialized = true;
            console.log('✅ AGSA initialized successfully');

        } catch (error) {
            console.error('❌ AGSA initialization failed:', error);
            this.showFatalError(error);
        }
    },

    /**
     * Initialize UI components
     */
    async initializeUI() {
        const user = AuthService.getUser();
        const userProfile = AuthService.getProfile();
        const subscription = AuthService.getSubscriptionType();

        // Initialize Sidebar
        AGSASidebar.init('#sidebar-container', {
            subscription,
            currentPath: this.currentPath
        });

        // Initialize Header
        AGSAHeader.init('#header-container', {
            user: {
                displayName: user?.displayName,
                email: user?.email,
                photoURL: user?.photoURL
            }
        });

        // Listen for sidebar collapse
        window.addEventListener('sidebarToggle', (e) => {
            const mainContent = document.getElementById('main-content-wrapper');
            if (mainContent) {
                mainContent.classList.toggle('sidebar-collapsed', e.detail.collapsed);
            }
        });

        // Listen for auth state changes
        AuthService.onAuthStateChange((user, profile) => {
            if (!user) {
                window.location.href = 'index.html';
            }
        });
    },

    /**
     * Set up routing
     */
    setupRouting() {
        // Listen for navigation events
        window.addEventListener('navigate', (e) => {
            const { path, tab } = e.detail;
            this.navigate(path, { tab });
        });

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const path = window.location.hash.slice(1) || 'dashboard';
            if (path !== this.currentPath) {
                this.navigate(path);
            }
        });

        // Listen for popstate
        window.addEventListener('popstate', () => {
            const path = window.location.hash.slice(1) || 'dashboard';
            this.navigate(path, { pushState: false });
        });
    },

    /**
     * Get initial path
     */
    getInitialPath() {
        // Check hash
        if (window.location.hash) {
            return window.location.hash.slice(1);
        }

        // Check last visited
        const lastModule = localStorage.getItem(AGSA_CONSTANTS.STORAGE_KEYS.LAST_MODULE);
        if (lastModule) {
            return lastModule;
        }

        return 'dashboard';
    },

    /**
     * Navigate to path
     * @param {string} path 
     * @param {Object} options 
     */
    async navigate(path, options = {}) {
        const { tab, pushState = true } = options;

        // Check feature access
        if (!this.checkFeatureAccess(path)) {
            AGSASidebar.showUpgradePrompt();
            return;
        }

        // Update URL
        if (pushState) {
            window.location.hash = path;
        }

        // Update state
        this.currentPath = path;

        // Update sidebar
        AGSASidebar.setActive(path);

        // Update header title
        const pageTitle = this.getPageTitle(path);
        AGSAHeader.setTitle(pageTitle.title, pageTitle.subtitle);

        // Load module
        await this.loadModule(path, { tab });

        // Save to localStorage
        localStorage.setItem(AGSA_CONSTANTS.STORAGE_KEYS.LAST_MODULE, path);
    },

    /**
     * Check feature access
     * @param {string} path 
     * @returns {boolean}
     */
    checkFeatureAccess(path) {
        return AuthService.hasFeatureAccess(path);
    },

    /**
     * Get page title
     * @param {string} path 
     * @returns {Object}
     */
    getPageTitle(path) {
        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Selamat datang di AGSA' },
            profile: { title: 'Profil', subtitle: 'Data guru dan sekolah' },
            calendar: { title: 'Kalender Pendidikan', subtitle: 'Kelola hari efektif dan libur' },
            schedule: { title: 'Jadwal Pelajaran', subtitle: 'Atur jadwal mengajar' },
            cp: { title: 'Data CP', subtitle: 'Capaian Pembelajaran dari CSV' },
            siswa: { title: 'Data Siswa', subtitle: 'Kelola peserta didik' },
            atp: { title: 'ATP', subtitle: 'Alur Tujuan Pembelajaran' },
            prota: { title: 'Program Tahunan', subtitle: 'Distribusi materi per tahun' },
            promes: { title: 'Program Semester', subtitle: 'Detail per minggu' },
            modul: { title: 'Modul Ajar', subtitle: 'Rencana pembelajaran' },
            lkpd: { title: 'LKPD', subtitle: 'Lembar Kerja Peserta Didik' },
            jurnal: { title: 'Jurnal Harian', subtitle: 'Catatan mengajar' },
            kktp: { title: 'KKTP', subtitle: 'Kriteria Ketercapaian TP' },
            nilai: { title: 'Daftar Nilai', subtitle: 'Nilai siswa' },
            soal: { title: 'Bank Soal', subtitle: 'Kumpulan soal' },
            ai: { title: 'AI Assistant', subtitle: 'Generate dengan bantuan AI' },
            settings: { title: 'Pengaturan', subtitle: 'Konfigurasi aplikasi' }
        };

        return titles[path] || { title: 'AGSA', subtitle: '' };
    },

    /**
     * Load module
     * @param {string} path 
     * @param {Object} options 
     */
    async loadModule(path, options = {}) {
        const pageContent = document.getElementById('page-content');
        
        // Show loading
        AGSALoader.inline.show(pageContent, 'Memuat...');

        try {
            // Get module
            const module = this.getModule(path);

            if (module && typeof module.init === 'function') {
                this.currentModule = module;
                await module.init(pageContent, options);
            } else {
                this.renderModulePlaceholder(pageContent, path);
            }
        } catch (error) {
            AGSAHelpers.error('App', `Failed to load module ${path}:`, error);
            this.renderModuleError(pageContent, error);
        }
    },

    /**
     * Get module by path
     * @param {string} path 
     * @returns {Object}
     */
    getModule(path) {
        const modules = {
            dashboard: window.DashboardModule,
            profile: window.ProfileModule,
            calendar: window.CalendarModule,
            schedule: window.ScheduleModule,
            cp: window.CPModule,
            siswa: window.SiswaModule,
            atp: window.ATPModule,
            prota: window.ProtaModule,
            promes: window.PromesModule,
            modul: window.ModulModule,
            lkpd: window.LKPDModule,
            jurnal: window.JurnalModule,
            kktp: window.KKTPModule,
            nilai: window.NilaiModule,
            soal: window.SoalModule,
            ai: window.AIModule,
            settings: window.SubscriptionModule
        };

        return modules[path] || null;
    },

    /**
     * Render module placeholder (for modules not yet implemented)
     * @param {HTMLElement} container 
     * @param {string} path 
     */
    renderModulePlaceholder(container, path) {
        const pageTitle = this.getPageTitle(path);
        
        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">🚧</span>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">${pageTitle.title}</h2>
                <p class="text-gray-500 mb-6">Modul ini sedang dalam pengembangan</p>
                <button onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: {path: 'dashboard'}}))" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    Kembali ke Dashboard
                </button>
            </div>
        `;
    },

    /**
     * Render module error
     * @param {HTMLElement} container 
     * @param {Error} error 
     */
    renderModuleError(container, error) {
        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-red-100 p-8 text-center">
                <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">❌</span>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat</h2>
                <p class="text-gray-500 mb-2">Terjadi kesalahan saat memuat halaman</p>
                <p class="text-sm text-red-500 mb-6">${error.message}</p>
                <div class="flex justify-center gap-3">
                    <button onclick="location.reload()" 
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                        Refresh
                    </button>
                    <button onclick="window.dispatchEvent(new CustomEvent('navigate', {detail: {path: 'dashboard'}}))" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Ke Dashboard
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Show fatal error
     * @param {Error} error 
     */
    showFatalError(error) {
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Aplikasi Error</h1>
                    <p class="text-gray-500 mb-4">Terjadi kesalahan yang tidak dapat dipulihkan</p>
                    <p class="text-sm text-red-500 bg-red-50 rounded-lg p-3 mb-6 text-left font-mono">${error.message}</p>
                    <div class="flex gap-3 justify-center">
                        <button onclick="location.reload()" 
                                class="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                            Refresh Halaman
                        </button>
                        <a href="index.html" 
                           class="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                            Ke Beranda
                        </a>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get current module
     * @returns {Object}
     */
    getCurrentModule() {
        return this.currentModule;
    },

    /**
     * Get current path
     * @returns {string}
     */
    getCurrentPath() {
        return this.currentPath;
    },

    /**
     * Refresh current module
     */
    async refreshCurrentModule() {
        if (this.currentModule && typeof this.currentModule.refresh === 'function') {
            await this.currentModule.refresh();
        } else {
            await this.navigate(this.currentPath, { pushState: false });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AGSAApp.init();
});

// Export
window.AGSAApp = AGSAApp;

console.log('🎯 AGSA App loaded successfully');