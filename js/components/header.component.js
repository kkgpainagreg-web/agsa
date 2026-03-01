/**
 * AGSA - Admin Guru Super App
 * Header Component
 */

const AGSAHeader = {
    element: null,
    user: null,

    /**
     * Initialize header
     */
    init(container, options = {}) {
        this.user = options.user || null;
        this.render(container);
        this.attachEvents();
    },

    /**
     * Render header
     */
    render(container) {
        const headerContainer = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;

        if (!headerContainer) return;

        headerContainer.innerHTML = this.getHTML();
        this.element = headerContainer.querySelector('#app-header');
    },

    /**
     * Get header HTML
     */
    getHTML() {
        const user = this.user;
        const displayName = user?.displayName || 'Pengguna';
        const email = user?.email || '';
        const photoURL = user?.photoURL || this.getDefaultAvatar(displayName);
        const initials = AGSAHelpers.getInitials(displayName);

        return `
            <header id="app-header" class="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 transition-all duration-300">
                <div class="flex items-center justify-between h-full px-4 lg:px-6">
                    <!-- Left Section -->
                    <div class="flex items-center space-x-4">
                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-btn" class="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                        </button>

                        <!-- Page Title -->
                        <div id="header-title-section">
                            <h1 id="header-title" class="text-lg font-semibold text-gray-900">Dashboard</h1>
                            <p id="header-subtitle" class="text-sm text-gray-500 hidden sm:block"></p>
                        </div>
                    </div>

                    <!-- Right Section -->
                    <div class="flex items-center space-x-3">
                        <!-- Quick Actions -->
                        <div class="hidden md:flex items-center space-x-2">
                            <!-- Help Button -->
                            <button id="btn-help" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" title="Bantuan">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </button>

                            <!-- Notification Button -->
                            <button id="btn-notification" class="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors" title="Notifikasi">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                </svg>
                                <span id="notification-badge" class="hidden absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>

                        <!-- Divider -->
                        <div class="hidden md:block w-px h-8 bg-gray-200"></div>

                        <!-- User Profile Dropdown -->
                        <div class="relative" id="user-dropdown-container">
                            <button id="user-dropdown-btn" class="flex items-center space-x-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                                <div class="relative">
                                    ${photoURL ? `
                                        <img src="${photoURL}" alt="${displayName}" class="w-9 h-9 rounded-xl object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                        <div class="w-9 h-9 rounded-xl bg-blue-600 items-center justify-center text-white font-medium text-sm hidden">
                                            ${initials}
                                        </div>
                                    ` : `
                                        <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                            ${initials}
                                        </div>
                                    `}
                                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div class="hidden sm:block text-left">
                                    <p class="text-sm font-medium text-gray-900 truncate max-w-[120px]">${displayName}</p>
                                    <p class="text-xs text-gray-500 truncate max-w-[120px]">${email}</p>
                                </div>
                                <svg class="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>

                            <!-- Dropdown Menu -->
                            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                <div class="px-4 py-2 border-b border-gray-100">
                                    <p class="text-sm font-medium text-gray-900">${displayName}</p>
                                    <p class="text-xs text-gray-500">${email}</p>
                                </div>
                                
                                <div class="py-1">
                                    <a href="#profile" class="dropdown-item flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" data-action="profile">
                                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        Profil Saya
                                    </a>
                                    <a href="#settings" class="dropdown-item flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" data-action="settings">
                                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        Pengaturan
                                    </a>
                                </div>

                                <div class="border-t border-gray-100 py-1">
                                    <button class="dropdown-item w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors" data-action="logout">
                                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                        </svg>
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * Get default avatar URL
     */
    getDefaultAvatar(name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=128`;
    },

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Mobile menu button
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                AGSASidebar.openMobile();
            });
        }

        // User dropdown
        const dropdownBtn = document.getElementById('user-dropdown-btn');
        const dropdownMenu = document.getElementById('user-dropdown-menu');

        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });

            // Dropdown items
            const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = item.dataset.action;
                    dropdownMenu.classList.add('hidden');

                    switch (action) {
                        case 'profile':
                            window.dispatchEvent(new CustomEvent('navigate', { detail: { path: 'profile' } }));
                            break;
                        case 'settings':
                            window.dispatchEvent(new CustomEvent('navigate', { detail: { path: 'settings' } }));
                            break;
                        case 'logout':
                            this.handleLogout();
                            break;
                    }
                });
            });
        }

        // Help button
        const helpBtn = document.getElementById('btn-help');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }

        // Listen for sidebar collapse
        window.addEventListener('sidebarToggle', (e) => {
            const header = document.getElementById('app-header');
            if (header) {
                if (e.detail.collapsed) {
                    header.classList.remove('lg:left-64');
                    header.classList.add('lg:left-16');
                } else {
                    header.classList.remove('lg:left-16');
                    header.classList.add('lg:left-64');
                }
            }
        });
    },

    /**
     * Set page title
     */
    setTitle(title, subtitle = '') {
        const titleEl = document.getElementById('header-title');
        const subtitleEl = document.getElementById('header-subtitle');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) {
            subtitleEl.textContent = subtitle;
            subtitleEl.classList.toggle('hidden', !subtitle);
        }
    },

    /**
     * Show notification badge
     */
    showNotificationBadge(show = true) {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.classList.toggle('hidden', !show);
        }
    },

    /**
     * Handle logout
     */
    async handleLogout() {
        const confirmed = await AGSAModal.confirm({
            title: 'Keluar',
            message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
            confirmText: 'Ya, Keluar',
            cancelText: 'Batal',
            danger: true
        });

        if (confirmed) {
            try {
                AGSALoader.fullPage.show('Keluar...');
                await firebase.auth().signOut();
                window.location.href = 'index.html';
            } catch (error) {
                AGSALoader.fullPage.hide();
                AGSAToast.error('Gagal keluar: ' + error.message);
            }
        }
    },

    /**
     * Show help modal
     */
    showHelpModal() {
        AGSAModal.show({
            title: 'Bantuan & Panduan',
            content: `
                <div class="space-y-4">
                    <div class="bg-blue-50 rounded-xl p-4">
                        <h4 class="font-semibold text-blue-900 mb-2">🚀 Cara Memulai</h4>
                        <ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Lengkapi profil guru dan sekolah</li>
                            <li>Atur kalender pendidikan</li>
                            <li>Import data CP (CSV)</li>
                            <li>Atur jadwal pelajaran</li>
                            <li>Generate dokumen!</li>
                        </ol>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <a href="#" class="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                            <span class="text-2xl mr-3">📖</span>
                            <div>
                                <p class="font-medium text-gray-900">Panduan Lengkap</p>
                                <p class="text-xs text-gray-500">Dokumentasi fitur</p>
                            </div>
                        </a>
                        <a href="#" class="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                            <span class="text-2xl mr-3">🎬</span>
                            <div>
                                <p class="font-medium text-gray-900">Video Tutorial</p>
                                <p class="text-xs text-gray-500">Langkah demi langkah</p>
                            </div>
                        </a>
                        <a href="#" class="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                            <span class="text-2xl mr-3">❓</span>
                            <div>
                                <p class="font-medium text-gray-900">FAQ</p>
                                <p class="text-xs text-gray-500">Pertanyaan umum</p>
                            </div>
                        </a>
                        <a href="#" class="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                            <span class="text-2xl mr-3">💬</span>
                            <div>
                                <p class="font-medium text-gray-900">Hubungi Kami</p>
                                <p class="text-xs text-gray-500">WhatsApp support</p>
                            </div>
                        </a>
                    </div>
                </div>
            `,
            size: 'md'
        });
    },

    /**
     * Update user info
     */
    updateUser(user) {
        this.user = user;
        const container = this.element?.parentElement;
        if (container) {
            this.render(container);
            this.attachEvents();
        }
    }
};

// Export
window.AGSAHeader = AGSAHeader;

console.log('📌 Header component loaded successfully');