/**
 * AGSA - Admin Guru Super App
 * Modal Dialog Component
 * 
 * Reusable modal component untuk konfirmasi, form, dan konten
 */

const AGSAModal = {
    activeModals: [],
    zIndexBase: 9000,

    /**
     * Show modal
     * @param {Object} options
     * @returns {Object} Modal instance
     */
    show(options) {
        const {
            id = 'modal-' + Date.now(),
            title = '',
            content = '',
            size = 'md',
            closable = true,
            closeOnBackdrop = true,
            closeOnEscape = true,
            showHeader = true,
            showFooter = false,
            footerContent = '',
            onOpen = null,
            onClose = null,
            customClass = ''
        } = options;

        const sizeClasses = {
            sm: 'max-w-sm',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl',
            full: 'max-w-full mx-4'
        };

        const zIndex = this.zIndexBase + (this.activeModals.length * 10);

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'fixed inset-0 overflow-y-auto';
        modal.style.zIndex = zIndex;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${id}-title`);

        modal.innerHTML = `
            <div class="flex min-h-screen items-center justify-center p-4">
                <div class="modal-backdrop fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity opacity-0"></div>
                <div class="modal-panel relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} ${customClass} transform transition-all scale-95 opacity-0">
                    ${showHeader ? `
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 id="${id}-title" class="text-lg font-semibold text-gray-900">${title}</h3>
                            ${closable ? `
                                <button type="button" class="modal-close-btn text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg" aria-label="Tutup">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                    <div class="modal-content px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        ${content}
                    </div>
                    ${showFooter ? `
                        <div class="modal-footer px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            ${footerContent}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.classList.add('overflow-hidden');

        requestAnimationFrame(() => {
            const backdrop = modal.querySelector('.modal-backdrop');
            const panel = modal.querySelector('.modal-panel');
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            panel.classList.remove('scale-95', 'opacity-0');
            panel.classList.add('scale-100', 'opacity-100');
        });

        const closeModal = () => {
            this.close(id, onClose);
        };

        if (closable) {
            const closeBtn = modal.querySelector('.modal-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }
        }

        if (closeOnBackdrop) {
            const backdrop = modal.querySelector('.modal-backdrop');
            backdrop.addEventListener('click', closeModal);
        }

        if (closeOnEscape) {
            const escapeHandler = (e) => {
                if (e.key === 'Escape' && this.activeModals[this.activeModals.length - 1] === id) {
                    closeModal();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            modal._escapeHandler = escapeHandler;
        }

        this.activeModals.push(id);

        if (typeof onOpen === 'function') {
            onOpen(modal);
        }

        setTimeout(() => {
            const focusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }, 100);

        return {
            id,
            element: modal,
            close: () => this.close(id, onClose),
            setContent: (html) => {
                const contentEl = modal.querySelector('.modal-content');
                if (contentEl) contentEl.innerHTML = html;
            },
            setFooter: (html) => {
                const footerEl = modal.querySelector('.modal-footer');
                if (footerEl) footerEl.innerHTML = html;
            }
        };
    },

    /**
     * Close modal by ID
     */
    close(id, onClose = null) {
        const modal = document.getElementById(id);
        if (!modal) return;

        const backdrop = modal.querySelector('.modal-backdrop');
        const panel = modal.querySelector('.modal-panel');
        
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            if (modal._escapeHandler) {
                document.removeEventListener('keydown', modal._escapeHandler);
            }
            modal.remove();
            const index = this.activeModals.indexOf(id);
            if (index > -1) {
                this.activeModals.splice(index, 1);
            }
            if (this.activeModals.length === 0) {
                document.body.classList.remove('overflow-hidden');
            }
            if (typeof onClose === 'function') {
                onClose();
            }
        }, 200);
    },

    /**
     * Close all modals
     */
    closeAll() {
        [...this.activeModals].forEach(id => this.close(id));
    },

    /**
     * Confirm dialog
     */
    confirm(options) {
        return new Promise((resolve) => {
            const {
                title = 'Konfirmasi',
                message = 'Apakah Anda yakin?',
                confirmText = 'Ya',
                cancelText = 'Batal',
                confirmClass = 'bg-blue-600 hover:bg-blue-700 text-white',
                cancelClass = 'bg-gray-100 hover:bg-gray-200 text-gray-700',
                danger = false
            } = options;

            const finalConfirmClass = danger 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : confirmClass;

            const modal = this.show({
                title,
                content: `<p class="text-gray-600">${message}</p>`,
                size: 'sm',
                showFooter: true,
                footerContent: `
                    <div class="flex justify-end gap-3">
                        <button type="button" class="modal-cancel-btn px-4 py-2 rounded-xl font-medium transition-colors ${cancelClass}">
                            ${cancelText}
                        </button>
                        <button type="button" class="modal-confirm-btn px-4 py-2 rounded-xl font-medium transition-colors ${finalConfirmClass}">
                            ${confirmText}
                        </button>
                    </div>
                `,
                closeOnBackdrop: false
            });

            const cancelBtn = modal.element.querySelector('.modal-cancel-btn');
            const confirmBtn = modal.element.querySelector('.modal-confirm-btn');

            cancelBtn.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });
        });
    },

    /**
     * Alert dialog
     */
    alert(options) {
        return new Promise((resolve) => {
            const {
                title = 'Informasi',
                message = '',
                buttonText = 'OK',
                type = 'info'
            } = options;

            const icons = {
                info: `<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>`,
                success: `<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>`,
                warning: `<div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4 mx-auto">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>`,
                error: `<div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </div>`
            };

            const modal = this.show({
                title: '',
                content: `
                    <div class="text-center py-4">
                        ${icons[type] || icons.info}
                        <h4 class="text-lg font-semibold text-gray-900 mb-2">${title}</h4>
                        <p class="text-gray-600">${message}</p>
                    </div>
                `,
                size: 'sm',
                showHeader: false,
                showFooter: true,
                footerContent: `
                    <div class="flex justify-center">
                        <button type="button" class="modal-ok-btn px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                            ${buttonText}
                        </button>
                    </div>
                `,
                closeOnBackdrop: false,
                closable: false
            });

            const okBtn = modal.element.querySelector('.modal-ok-btn');
            okBtn.addEventListener('click', () => {
                modal.close();
                resolve();
            });
        });
    },

    /**
     * Prompt dialog
     */
    prompt(options) {
        return new Promise((resolve) => {
            const {
                title = 'Input',
                message = '',
                placeholder = '',
                defaultValue = '',
                inputType = 'text',
                confirmText = 'OK',
                cancelText = 'Batal',
                required = true
            } = options;

            const modal = this.show({
                title,
                content: `
                    <div class="space-y-4">
                        ${message ? `<p class="text-gray-600">${message}</p>` : ''}
                        <input 
                            type="${inputType}" 
                            class="prompt-input w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="${placeholder}"
                            value="${defaultValue}"
                            ${required ? 'required' : ''}
                        >
                    </div>
                `,
                size: 'sm',
                showFooter: true,
                footerContent: `
                    <div class="flex justify-end gap-3">
                        <button type="button" class="modal-cancel-btn px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors">
                            ${cancelText}
                        </button>
                        <button type="button" class="modal-confirm-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                            ${confirmText}
                        </button>
                    </div>
                `,
                closeOnBackdrop: false
            });

            const input = modal.element.querySelector('.prompt-input');
            const cancelBtn = modal.element.querySelector('.modal-cancel-btn');
            const confirmBtn = modal.element.querySelector('.modal-confirm-btn');

            input.focus();
            input.select();

            const submit = () => {
                const value = input.value.trim();
                if (required && !value) {
                    input.classList.add('border-red-500');
                    input.focus();
                    return;
                }
                modal.close();
                resolve(value);
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submit();
                }
            });

            cancelBtn.addEventListener('click', () => {
                modal.close();
                resolve(null);
            });

            confirmBtn.addEventListener('click', submit);
        });
    },

    /**
     * Loading modal
     */
    loading(message = 'Memproses...') {
        return this.show({
            id: 'modal-loading',
            content: `
                <div class="flex flex-col items-center justify-center py-8">
                    <div class="loading-spinner w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-600">${message}</p>
                </div>
            `,
            size: 'sm',
            showHeader: false,
            closable: false,
            closeOnBackdrop: false,
            closeOnEscape: false
        });
    }
};

// Export
window.AGSAModal = AGSAModal;

console.log('🪟 Modal component loaded successfully');