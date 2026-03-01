/**
 * AGSA - Admin Guru Super App
 * Toast Notification Component
 * 
 * Menampilkan notifikasi popup
 */

const AGSAToast = {
    container: null,
    queue: [],
    isProcessing: false,

    /**
     * Initialize toast container
     */
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'agsa-toast-container';
        this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.container);
    },

    /**
     * Show toast notification
     * @param {Object} options
     * @param {string} options.type - 'success', 'error', 'warning', 'info'
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message
     * @param {number} options.duration - Duration in ms (default: 4000)
     * @param {boolean} options.closable - Show close button (default: true)
     * @param {Function} options.onClose - Callback when closed
     */
    show(options) {
        this.init();

        const {
            type = 'info',
            title = '',
            message = '',
            duration = 4000,
            closable = true,
            onClose = null
        } = options;

        const toast = this.createToast({ type, title, message, closable, onClose });
        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast, onClose);
            }, duration);
        }

        return toast;
    },

    /**
     * Create toast element
     * @param {Object} options 
     * @returns {HTMLElement}
     */
    createToast({ type, title, message, closable, onClose }) {
        const toast = document.createElement('div');
        toast.className = `
            transform transition-all duration-300 ease-out
            translate-x-full opacity-0
            bg-white rounded-xl shadow-lg border
            p-4 pointer-events-auto
            flex items-start gap-3
        `;

        // Type-specific styles
        const typeConfig = {
            success: {
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>`,
                iconClass: 'text-green-500',
                borderClass: 'border-green-200'
            },
            error: {
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>`,
                iconClass: 'text-red-500',
                borderClass: 'border-red-200'
            },
            warning: {
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>`,
                iconClass: 'text-yellow-500',
                borderClass: 'border-yellow-200'
            },
            info: {
                icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>`,
                iconClass: 'text-blue-500',
                borderClass: 'border-blue-200'
            }
        };

        const config = typeConfig[type] || typeConfig.info;
        toast.classList.add(config.borderClass);

        toast.innerHTML = `
            <div class="${config.iconClass} flex-shrink-0">
                ${config.icon}
            </div>
            <div class="flex-1 min-w-0">
                ${title ? `<p class="text-sm font-semibold text-gray-900">${title}</p>` : ''}
                ${message ? `<p class="text-sm text-gray-600 mt-0.5">${message}</p>` : ''}
            </div>
            ${closable ? `
                <button type="button" class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Tutup">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            ` : ''}
        `;

        // Close button handler
        if (closable) {
            const closeBtn = toast.querySelector('button');
            closeBtn.addEventListener('click', () => {
                this.dismiss(toast, onClose);
            });
        }

        return toast;
    },

    /**
     * Dismiss toast
     * @param {HTMLElement} toast 
     * @param {Function} onClose 
     */
    dismiss(toast, onClose = null) {
        if (!toast || toast.classList.contains('dismissing')) return;

        toast.classList.add('dismissing');
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (typeof onClose === 'function') {
                onClose();
            }
        }, 300);
    },

    /**
     * Shorthand methods
     */
    success(message, title = 'Berhasil') {
        return this.show({ type: 'success', title, message });
    },

    error(message, title = 'Error') {
        return this.show({ type: 'error', title, message, duration: 6000 });
    },

    warning(message, title = 'Perhatian') {
        return this.show({ type: 'warning', title, message });
    },

    info(message, title = 'Informasi') {
        return this.show({ type: 'info', title, message });
    },

    /**
     * Clear all toasts
     */
    clearAll() {
        if (!this.container) return;
        const toasts = this.container.querySelectorAll('div');
        toasts.forEach(toast => this.dismiss(toast));
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AGSAToast.init();
});

// Export
window.AGSAToast = AGSAToast;

console.log('🍞 Toast component loaded successfully');