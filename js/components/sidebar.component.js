/**
 * AGSA - Admin Guru Super App
 * Sidebar Navigation Component
 */

const AGSASidebar = {
    element: null,
    isCollapsed: false,
    isMobileOpen: false,
    currentPath: 'dashboard',
    userSubscription: 'free',

    /**
     * Initialize sidebar
     */
    init(container, options = {}) {
        this.userSubscription = options.subscription || 'free';
        this.currentPath = options.currentPath || 'dashboard';
        
        // Load collapsed state from localStorage
        const savedState = localStorage.getItem(AGSA_CONSTANTS.STORAGE_KEYS.SIDEBAR_STATE);
        this.isCollapsed = savedState === 'collapsed';

        this.render(container);
        this.attachEvents();
    },

    /**
     * Render sidebar
     */
    render(container) {
        const sidebarContainer = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;

        if (!sidebarContainer) return;

        sidebarContainer.innerHTML = this.getHTML();
        this.element = sidebarContainer.querySelector('#sidebar');
        
        // Apply initial state
        if (this.isCollapsed && window.innerWidth >= 1024) {
            this.element.classList.add('sidebar-collapsed');
        }
    },

    /**
     * Get sidebar HTML
     */
    getHTML() {
        const { MENU, PROFIL_LULUSAN } = AGSA_CONSTANTS;
        const isPremium = this.userSubscription === 'premium';

        return `
            <!-- Mobile Overlay -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden hidden"></div>
            
            <!-- Sidebar -->
            <aside id="sidebar" class="fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 w-64 -translate-x-full lg:translate-x-0">
                <!-- Header -->
                <div class="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <a href="#" class="sidebar-logo flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                            <span class="text-white font-bold text-xl">A</span>
                        </div>
                        <div class="sidebar-logo-text">
                            <h1 class="text-lg font-bold text-gray-900">AGSA</h1>
                            <p class="text-xs text-gray-500 -mt-1">Admin Guru Super App</p>
                        </div>
                    </a>
                    <button id="sidebar-collapse-btn" class="hidden lg:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5 sidebar-collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                        </svg>
                    </button>
                    <button id="sidebar-close-btn" class="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 overflow-y-auto p-4 space-y-2 h-[calc(100vh-180px)]">
                    <!-- Dashboard -->
                    ${this.renderMenuItem(MENU.DASHBOARD, isPremium)}

                    <!-- Input Data Section -->
                    ${this.renderSection('INPUT DATA', MENU.INPUT_DATA.items, isPremium)}

                    <!-- Dokumen Section -->
                    ${this.renderSection('DOKUMEN', MENU.DOKUMEN.items, isPremium)}

                    <!-- Penilaian Section -->
                    ${this.renderSection('PENILAIAN', MENU.PENILAIAN.items, isPremium)}

                    <!-- AI Assistant -->
                    ${this.renderMenuItem(MENU.AI, isPremium)}
                </nav>

                <!-- Footer -->
                <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                    <!-- Subscription Badge -->
                    <div class="sidebar-sub-badge mb-3 ${isPremium ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-100'} rounded-xl p-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="sidebar-sub-text text-xs font-medium ${isPremium ? 'text-white/80' : 'text-gray-500'}">Paket</span>
                                <p class="sidebar-sub-type font-semibold ${isPremium ? 'text-white' : 'text-gray-900'}">${isPremium ? 'Premium' : 'Gratis'}</p>
                            </div>
                            ${!isPremium ? `
                                <button id="btn-upgrade-sidebar" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                                    Upgrade
                                </button>
                            ` : `
                                <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Settings -->
                    ${this.renderMenuItem(MENU.SETTINGS, isPremium)}
                </div>
            </aside>
        `;
    },

    /**
     * Render menu section
     */
    renderSection(title, items, isPremium) {
        return `
            <div class="pt-4">
                <p class="sidebar-section-title px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">${title}</p>
                <div class="space-y-1">
                    ${items.map(item => this.renderMenuItem(item, isPremium)).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Render menu item
     */
    renderMenuItem(item, isPremium) {
        const isActive = this.currentPath === item.path;
        const isLocked = !item.free && !isPremium;
        const icons = this.getIcons();

        return `
            <a href="#${item.path}" 
               class="sidebar-menu-item group flex items-center px-3 py-2.5 rounded-xl transition-all ${
                   isActive 
                       ? 'bg-blue-50 text-blue-600' 
                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
               } ${isLocked ? 'opacity-60' : ''}"
               data-path="${item.path}"
               ${isLocked ? 'data-locked="true"' : ''}>
                <span class="sidebar-menu-icon w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}">
                    ${icons[item.icon] || icons.file}
                </span>
                <span class="sidebar-menu-label ml-3 font-medium">${item.label}</span>
                ${isLocked ? `
                    <span class="sidebar-lock-icon ml-auto">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </span>
                ` : ''}
            </a>
        `;
    },

    /**
     * Get icon SVGs
     */
    getIcons() {
        return {
            home: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
            user: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
            calendar: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
            clock: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            'file-text': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
            users: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
            target: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
            'calendar-range': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
            'calendar-days': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
            'book-open': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
            clipboard: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
            edit: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
            'check-circle': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            'bar-chart': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
            'help-circle': `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            cpu: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>`,
            settings: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
            file: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`
        };
    },

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Mobile toggle
        const overlay = document.getElementById('sidebar-overlay');
        const closeBtn = document.getElementById('sidebar-close-btn');
        const collapseBtn = document.getElementById('sidebar-collapse-btn');

        if (overlay) {
            overlay.addEventListener('click', () => this.closeMobile());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMobile());
        }

        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleCollapse());
        }

        // Menu items
        const menuItems = document.querySelectorAll('.sidebar-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const path = item.dataset.path;
                const isLocked = item.dataset.locked === 'true';

                if (isLocked) {
                    e.preventDefault();
                    this.showUpgradePrompt();
                    return;
                }

                this.setActive(path);
                this.closeMobile();
                
                // Dispatch navigation event
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { path } 
                }));
            });
        });

        // Upgrade button
        const upgradeBtn = document.getElementById('btn-upgrade-sidebar');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.showUpgradePrompt());
        }

        // Window resize
        window.addEventListener('resize', AGSAHelpers.debounce(() => {
            if (window.innerWidth >= 1024) {
                this.closeMobile();
            }
        }, 200));
    },

    /**
     * Toggle mobile sidebar
     */
    openMobile() {
        const sidebar = this.element;
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.remove('-translate-x-full');
        }
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
        this.isMobileOpen = true;
    },

    closeMobile() {
        const sidebar = this.element;
        const overlay = document.getElementById('sidebar-overlay');

        if (sidebar) {
            sidebar.classList.add('-translate-x-full');
        }
        if (overlay) {
            overlay.classList.add('hidden');
        }
        document.body.classList.remove('overflow-hidden');
        this.isMobileOpen = false;
    },

    /**
     * Toggle collapse (desktop)
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.element) {
            this.element.classList.toggle('sidebar-collapsed', this.isCollapsed);
        }

        // Save state
        localStorage.setItem(
            AGSA_CONSTANTS.STORAGE_KEYS.SIDEBAR_STATE, 
            this.isCollapsed ? 'collapsed' : 'expanded'
        );

        // Dispatch event
        window.dispatchEvent(new CustomEvent('sidebarToggle', { 
            detail: { collapsed: this.isCollapsed } 
        }));
    },

    /**
     * Set active menu item
     */
    setActive(path) {
        this.currentPath = path;
        
        const menuItems = document.querySelectorAll('.sidebar-menu-item');
        menuItems.forEach(item => {
            const itemPath = item.dataset.path;
            const isActive = itemPath === path;

            item.classList.toggle('bg-blue-50', isActive);
            item.classList.toggle('text-blue-600', isActive);
            item.classList.toggle('text-gray-600', !isActive);
            item.classList.toggle('hover:bg-gray-50', !isActive);
            item.classList.toggle('hover:text-gray-900', !isActive);

            const icon = item.querySelector('.sidebar-menu-icon');
            if (icon) {
                icon.classList.toggle('text-blue-600', isActive);
                icon.classList.toggle('text-gray-400', !isActive);
            }
        });

        // Save last module
        localStorage.setItem(AGSA_CONSTANTS.STORAGE_KEYS.LAST_MODULE, path);
    },

    /**
     * Show upgrade prompt
     */
    showUpgradePrompt() {
        AGSAModal.confirm({
            title: 'Fitur Premium',
            message: 'Fitur ini hanya tersedia untuk pengguna Premium. Upgrade sekarang untuk akses semua fitur AGSA!',
            confirmText: 'Upgrade Sekarang',
            cancelText: 'Nanti Saja'
        }).then(confirmed => {
            if (confirmed) {
                // Navigate to subscription page or WhatsApp
                window.dispatchEvent(new CustomEvent('navigate', { 
                    detail: { path: 'settings', tab: 'subscription' } 
                }));
            }
        });
    },

    /**
     * Update subscription status
     */
    updateSubscription(type) {
        this.userSubscription = type;
        const container = this.element?.parentElement;
        if (container) {
            this.render(container);
            this.attachEvents();
        }
    }
};

// Export
window.AGSASidebar = AGSASidebar;

console.log('📱 Sidebar component loaded successfully');