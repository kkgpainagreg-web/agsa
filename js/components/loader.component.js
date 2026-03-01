/**
 * AGSA - Admin Guru Super App
 * Loader Component
 * 
 * Loading states untuk berbagai konteks
 */

const AGSALoader = {
    /**
     * Full page loader
     */
    fullPage: {
        show(message = 'Memuat...') {
            let loader = document.getElementById('agsa-fullpage-loader');
            
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'agsa-fullpage-loader';
                loader.className = 'fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300';
                loader.innerHTML = `
                    <div class="text-center">
                        <div class="relative w-16 h-16 mx-auto mb-4">
                            <div class="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                            <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p class="loader-message text-gray-600 font-medium">${message}</p>
                    </div>
                `;
                document.body.appendChild(loader);
            } else {
                const msgEl = loader.querySelector('.loader-message');
                if (msgEl) msgEl.textContent = message;
                loader.classList.remove('hidden', 'opacity-0');
            }

            document.body.classList.add('overflow-hidden');
            return loader;
        },

        hide() {
            const loader = document.getElementById('agsa-fullpage-loader');
            if (loader) {
                loader.classList.add('opacity-0');
                setTimeout(() => {
                    loader.classList.add('hidden');
                    document.body.classList.remove('overflow-hidden');
                }, 300);
            }
        },

        updateMessage(message) {
            const loader = document.getElementById('agsa-fullpage-loader');
            if (loader) {
                const msgEl = loader.querySelector('.loader-message');
                if (msgEl) msgEl.textContent = message;
            }
        }
    },

    /**
     * Button loader
     */
    button: {
        start(button, loadingText = 'Memproses...') {
            if (!button || button.disabled) return;

            button.disabled = true;
            button.dataset.originalContent = button.innerHTML;
            button.dataset.originalWidth = button.style.width;
            button.style.width = button.offsetWidth + 'px';
            
            button.innerHTML = `
                <span class="inline-flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ${loadingText}
                </span>
            `;
        },

        stop(button) {
            if (!button) return;

            button.disabled = false;
            if (button.dataset.originalContent) {
                button.innerHTML = button.dataset.originalContent;
                delete button.dataset.originalContent;
            }
            if (button.dataset.originalWidth) {
                button.style.width = button.dataset.originalWidth;
                delete button.dataset.originalWidth;
            }
        }
    },

    /**
     * Inline loader (for containers)
     */
    inline: {
        show(container, message = 'Memuat...', size = 'md') {
            if (!container) return;

            const sizes = {
                sm: { spinner: 'w-6 h-6', text: 'text-sm' },
                md: { spinner: 'w-10 h-10', text: 'text-base' },
                lg: { spinner: 'w-16 h-16', text: 'text-lg' }
            };

            const sizeConfig = sizes[size] || sizes.md;

            container.dataset.originalContent = container.innerHTML;
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12">
                    <div class="${sizeConfig.spinner} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-500 ${sizeConfig.text}">${message}</p>
                </div>
            `;
        },

        hide(container) {
            if (!container) return;

            if (container.dataset.originalContent) {
                container.innerHTML = container.dataset.originalContent;
                delete container.dataset.originalContent;
            }
        }
    },

    /**
     * Skeleton loader
     */
    skeleton: {
        /**
         * Generate skeleton HTML
         */
        generate(type = 'card', count = 1) {
            const templates = {
                card: `
                    <div class="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                        <div class="flex items-center space-x-4 mb-4">
                            <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div class="flex-1">
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="h-3 bg-gray-200 rounded"></div>
                            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
                            <div class="h-3 bg-gray-200 rounded w-4/6"></div>
                        </div>
                    </div>
                `,
                table: `
                    <div class="animate-pulse">
                        <div class="h-10 bg-gray-100 rounded-t-xl mb-1"></div>
                        ${Array(5).fill(`
                            <div class="flex space-x-4 p-4 border-b border-gray-100">
                                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div class="h-4 bg-gray-200 rounded w-2/6"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div class="h-4 bg-gray-200 rounded w-2/6"></div>
                            </div>
                        `).join('')}
                    </div>
                `,
                list: `
                    <div class="space-y-3 animate-pulse">
                        ${Array(5).fill(`
                            <div class="flex items-center space-x-4 p-3">
                                <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div class="flex-1">
                                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `,
                form: `
                    <div class="space-y-6 animate-pulse">
                        ${Array(4).fill(`
                            <div>
                                <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div class="h-10 bg-gray-200 rounded-xl"></div>
                            </div>
                        `).join('')}
                        <div class="h-10 bg-gray-300 rounded-xl w-1/3"></div>
                    </div>
                `,
                stats: `
                    <div class="grid grid-cols-4 gap-4 animate-pulse">
                        ${Array(4).fill(`
                            <div class="bg-white rounded-xl border border-gray-100 p-4">
                                <div class="h-8 w-8 bg-gray-200 rounded-lg mb-3"></div>
                                <div class="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        `).join('')}
                    </div>
                `
            };

            const template = templates[type] || templates.card;
            return Array(count).fill(template).join('');
        },

        /**
         * Show skeleton in container
         */
        show(container, type = 'card', count = 1) {
            if (!container) return;
            container.dataset.originalContent = container.innerHTML;
            container.innerHTML = this.generate(type, count);
        },

        /**
         * Hide skeleton
         */
        hide(container) {
            if (!container || !container.dataset.originalContent) return;
            container.innerHTML = container.dataset.originalContent;
            delete container.dataset.originalContent;
        }
    },

    /**
     * Progress loader
     */
    progress: {
        element: null,

        show(message = 'Memproses...') {
            if (this.element) this.hide();

            this.element = document.createElement('div');
            this.element.id = 'agsa-progress-loader';
            this.element.className = 'fixed top-0 left-0 right-0 z-[9999]';
            this.element.innerHTML = `
                <div class="h-1 bg-gray-200">
                    <div class="progress-bar h-full bg-blue-600 transition-all duration-300" style="width: 0%"></div>
                </div>
                <div class="bg-white shadow-lg border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                    <span class="progress-message text-sm text-gray-600">${message}</span>
                    <span class="progress-percent text-sm font-medium text-blue-600">0%</span>
                </div>
            `;
            document.body.appendChild(this.element);
        },

        update(percent, message = null) {
            if (!this.element) return;

            const bar = this.element.querySelector('.progress-bar');
            const percentEl = this.element.querySelector('.progress-percent');
            const msgEl = this.element.querySelector('.progress-message');

            if (bar) bar.style.width = `${percent}%`;
            if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
            if (message && msgEl) msgEl.textContent = message;
        },

        hide() {
            if (this.element) {
                this.element.remove();
                this.element = null;
            }
        }
    }
};

// Export
window.AGSALoader = AGSALoader;

console.log('⏳ Loader component loaded successfully');