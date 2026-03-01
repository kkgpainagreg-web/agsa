/**
 * AGSA - Admin Guru Super App
 * Profile Module
 * 
 * Teacher and school profile management
 */

const ProfileModule = {
    container: null,
    profileData: null,
    isEditing: false,

    /**
     * Initialize module
     * @param {HTMLElement} container 
     */
    async init(container) {
        this.container = container;
        this.isEditing = false;
        
        AGSALoader.inline.show(container, 'Memuat profil...');

        try {
            // Load profile data
            this.profileData = await ProfileService.getProfile();
            
            // Render
            this.render();
            
            // Attach events
            this.attachEvents();
        } catch (error) {
            AGSAHelpers.error('Profile', 'Init failed:', error);
            this.renderError(error);
        }
    },

    /**
     * Render profile
     */
    render() {
        const profile = this.profileData;
        const tahunAjar = profile?.tahunAwalAjar ? 
            AGSAHelpers.formatTahunAjar(profile.tahunAwalAjar) : 
            AGSAHelpers.getCurrentTahunAjar().tahunAjar;

        this.container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Profil Guru & Sekolah</h1>
                        <p class="text-gray-500 mt-1">Data ini akan digunakan di semua dokumen yang di-generate</p>
                    </div>
                    <div class="flex gap-3">
                        ${profile ? `
                            <button id="btn-edit-profile" class="btn btn-secondary">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Edit Profil
                            </button>
                        ` : ''}
                    </div>
                </div>

                ${profile ? this.renderViewMode(profile, tahunAjar) : this.renderEditMode(profile, tahunAjar)}
            </div>
        `;
    },

    /**
     * Render view mode
     */
    renderViewMode(profile, tahunAjar) {
        return `
            <!-- Profile Cards -->
            <div class="grid md:grid-cols-2 gap-6">
                <!-- Guru Card -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                        <h2 class="text-lg font-semibold text-white flex items-center">
                            <span class="mr-2">👤</span> Data Guru
                        </h2>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="text-xs text-gray-500 uppercase tracking-wider">Nama Guru</label>
                            <p class="text-gray-900 font-medium">${profile.namaGuru || '-'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500 uppercase tracking-wider">NIP</label>
                            <p class="text-gray-900 font-medium font-mono">${profile.nipGuru || '-'}</p>
                        </div>
                    </div>
                </div>

                <!-- Kepala Sekolah Card -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
                        <h2 class="text-lg font-semibold text-white flex items-center">
                            <span class="mr-2">🎓</span> Kepala Sekolah
                        </h2>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="text-xs text-gray-500 uppercase tracking-wider">Nama Kepala Sekolah</label>
                            <p class="text-gray-900 font-medium">${profile.namaKepsek || '-'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500 uppercase tracking-wider">NIP</label>
                            <p class="text-gray-900 font-medium font-mono">${profile.nipKepsek || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sekolah Card -->
            <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700">
                    <h2 class="text-lg font-semibold text-white flex items-center">
                        <span class="mr-2">🏫</span> Satuan Pendidikan
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-gray-500 uppercase tracking-wider">Nama Satuan Pendidikan</label>
                                <p class="text-gray-900 font-medium">${profile.namaSatuan || '-'}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 uppercase tracking-wider">NPSN</label>
                                <p class="text-gray-900 font-medium font-mono">${profile.npsn || '-'}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 uppercase tracking-wider">Jenjang</label>
                                <p class="text-gray-900 font-medium">${profile.jenjang || '-'}</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs text-gray-500 uppercase tracking-wider">Alamat</label>
                                <p class="text-gray-900">${profile.alamatLengkap || '-'}</p>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 uppercase tracking-wider">Lokasi</label>
                                <p class="text-gray-900">
                                    ${[profile.desa, profile.kecamatan, profile.kabupaten, profile.provinsi]
                                        .filter(Boolean).join(', ') || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tahun Ajar & Pengesahan -->
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
                        <h2 class="text-lg font-semibold text-white flex items-center">
                            <span class="mr-2">📅</span> Tahun Ajar
                        </h2>
                    </div>
                    <div class="p-6">
                        <p class="text-3xl font-bold text-gray-900">${tahunAjar}</p>
                        <p class="text-gray-500 text-sm mt-1">Tahun pelajaran aktif</p>
                    </div>
                </div>

                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
                        <h2 class="text-lg font-semibold text-white flex items-center">
                            <span class="mr-2">📝</span> Tanggal Pengesahan
                        </h2>
                    </div>
                    <div class="p-6 space-y-3">
                        <div>
                            <label class="text-xs text-gray-500 uppercase tracking-wider">Dokumen ATP/Prota/dll</label>
                            <p class="text-gray-900 font-medium">
                                ${profile.tanggalPengesahan ? AGSADateUtils.format(profile.tanggalPengesahan) : '-'}
                            </p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500 uppercase tracking-wider">Jurnal & Absensi</label>
                            <p class="text-gray-900 font-medium">
                                ${profile.tanggalPengesahanJurnal ? AGSADateUtils.format(profile.tanggalPengesahanJurnal) : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logo Preview -->
            ${profile.logoUrl ? `
                <div class="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Logo Sekolah</h3>
                    <img src="${profile.logoUrl}" alt="Logo Sekolah" class="h-24 object-contain" 
                         onerror="this.style.display='none'">
                </div>
            ` : ''}
        `;
    },

    /**
     * Render edit mode
     */
    renderEditMode(profile, tahunAjar) {
        const currentYear = new Date().getFullYear();
        const jenjangOptions = Object.keys(AGSA_CONSTANTS.JENJANG);

        return `
            <form id="profile-form" class="space-y-6">
                <!-- Guru Section -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <span class="mr-2">👤</span> Data Guru
                        </h2>
                    </div>
                    <div class="p-6 grid md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label required">Nama Guru</label>
                            <input type="text" name="namaGuru" class="form-input" 
                                   value="${profile?.namaGuru || ''}" 
                                   placeholder="Nama lengkap dengan gelar">
                        </div>
                        <div class="form-group">
                            <label class="form-label">NIP</label>
                            <input type="text" name="nipGuru" class="form-input" 
                                   value="${profile?.nipGuru || ''}" 
                                   placeholder="18 digit NIP"
                                   maxlength="18">
                            <p class="form-help">Kosongkan jika tidak memiliki NIP</p>
                        </div>
                    </div>
                </div>

                <!-- Kepala Sekolah Section -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <span class="mr-2">🎓</span> Kepala Sekolah
                        </h2>
                    </div>
                    <div class="p-6 grid md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Nama Kepala Sekolah</label>
                            <input type="text" name="namaKepsek" class="form-input" 
                                   value="${profile?.namaKepsek || ''}" 
                                   placeholder="Nama lengkap dengan gelar">
                        </div>
                        <div class="form-group">
                            <label class="form-label">NIP Kepala Sekolah</label>
                            <input type="text" name="nipKepsek" class="form-input" 
                                   value="${profile?.nipKepsek || ''}" 
                                   placeholder="18 digit NIP"
                                   maxlength="18">
                        </div>
                    </div>
                </div>

                <!-- Satuan Pendidikan Section -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <span class="mr-2">🏫</span> Satuan Pendidikan
                        </h2>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="form-label required">Nama Satuan Pendidikan</label>
                                <input type="text" name="namaSatuan" class="form-input" 
                                       value="${profile?.namaSatuan || ''}" 
                                       placeholder="Contoh: SMP Negeri 1 Jakarta">
                            </div>
                            <div class="form-group">
                                <label class="form-label required">NPSN</label>
                                <input type="text" name="npsn" class="form-input" 
                                       value="${profile?.npsn || ''}" 
                                       placeholder="8 digit NPSN"
                                       maxlength="8">
                            </div>
                        </div>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="form-label required">Jenjang</label>
                                <select name="jenjang" class="form-select">
                                    <option value="">Pilih Jenjang</option>
                                    ${jenjangOptions.map(j => `
                                        <option value="${j}" ${profile?.jenjang === j ? 'selected' : ''}>
                                            ${AGSA_CONSTANTS.JENJANG[j].nama} (${j})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Logo Sekolah (URL)</label>
                                <input type="url" name="logoUrl" class="form-input" 
                                       value="${profile?.logoUrl || ''}" 
                                       placeholder="https://...">
                                <p class="form-help">Gunakan link gambar logo sekolah</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Alamat Lengkap</label>
                            <textarea name="alamatLengkap" class="form-input" rows="2" 
                                      placeholder="Jalan, nomor, RT/RW">${profile?.alamatLengkap || ''}</textarea>
                        </div>
                        <div class="grid md:grid-cols-4 gap-4">
                            <div class="form-group">
                                <label class="form-label">Desa/Kelurahan</label>
                                <input type="text" name="desa" class="form-input" 
                                       value="${profile?.desa || ''}" placeholder="Desa">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Kecamatan</label>
                                <input type="text" name="kecamatan" class="form-input" 
                                       value="${profile?.kecamatan || ''}" placeholder="Kecamatan">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Kabupaten/Kota</label>
                                <input type="text" name="kabupaten" class="form-input" 
                                       value="${profile?.kabupaten || ''}" placeholder="Kabupaten">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Provinsi</label>
                                <input type="text" name="provinsi" class="form-input" 
                                       value="${profile?.provinsi || ''}" placeholder="Provinsi">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tahun Ajar Section -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <span class="mr-2">📅</span> Tahun Ajar
                        </h2>
                    </div>
                    <div class="p-6">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="form-label required">Tahun Awal</label>
                                <select name="tahunAwalAjar" class="form-select" id="tahunAwalAjar">
                                    ${Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(y => `
                                        <option value="${y}" ${profile?.tahunAwalAjar === y ? 'selected' : ''}>
                                            ${y}
                                        </option>
                                    `).join('')}
                                </select>
                                <p class="form-help">Pilih tahun awal. Tahun akhir akan dihitung otomatis.</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tahun Ajar</label>
                                <div class="form-input bg-gray-50" id="tahunAjarPreview">
                                    ${tahunAjar}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tanggal Pengesahan Section -->
                <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <span class="mr-2">📝</span> Tanggal Pengesahan
                        </h2>
                    </div>
                    <div class="p-6 grid md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Dokumen (ATP, Prota, dll)</label>
                            <input type="date" name="tanggalPengesahan" class="form-input" 
                                   value="${profile?.tanggalPengesahan ? AGSADateUtils.formatInput(profile.tanggalPengesahan) : ''}">
                            <p class="form-help">Tanggal pengesahan untuk dokumen administrasi</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Jurnal & Absensi</label>
                            <input type="date" name="tanggalPengesahanJurnal" class="form-input" 
                                   value="${profile?.tanggalPengesahanJurnal ? AGSADateUtils.formatInput(profile.tanggalPengesahanJurnal) : ''}">
                            <p class="form-help">Akhir bulan, bukan hari libur</p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3">
                    ${profile ? `
                        <button type="button" id="btn-cancel" class="btn btn-secondary">
                            Batal
                        </button>
                    ` : ''}
                    <button type="submit" class="btn btn-primary">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Simpan Profil
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Render error state
     */
    renderError(error) {
        this.container.innerHTML = `
            <div class="text-center py-12">
                <span class="text-6xl block mb-4">😵</span>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Profil</h2>
                <p class="text-gray-500 mb-6">${error.message}</p>
                <button onclick="ProfileModule.init(document.getElementById('page-content'))" 
                        class="btn btn-primary">
                    Coba Lagi
                </button>
            </div>
        `;
    },

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Edit button
        const editBtn = this.container.querySelector('#btn-edit-profile');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.isEditing = true;
                this.container.innerHTML = '';
                this.container.innerHTML = `
                    <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                        <div class="flex items-center gap-4 mb-6">
                            <button id="btn-back" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-900">Edit Profil</h1>
                                <p class="text-gray-500">Perbarui data guru dan sekolah</p>
                            </div>
                        </div>
                        ${this.renderEditMode(this.profileData, 
                            this.profileData?.tahunAwalAjar ? 
                            AGSAHelpers.formatTahunAjar(this.profileData.tahunAwalAjar) : 
                            AGSAHelpers.getCurrentTahunAjar().tahunAjar
                        )}
                    </div>
                `;
                this.attachFormEvents();
            });
        }

        // If in edit mode (no profile yet), attach form events
        const form = this.container.querySelector('#profile-form');
        if (form) {
            this.attachFormEvents();
        }
    },

    /**
     * Attach form events
     */
    attachFormEvents() {
        const form = this.container.querySelector('#profile-form');
        const tahunSelect = this.container.querySelector('#tahunAwalAjar');
        const tahunPreview = this.container.querySelector('#tahunAjarPreview');
        const cancelBtn = this.container.querySelector('#btn-cancel');
        const backBtn = this.container.querySelector('#btn-back');

        // Tahun ajar preview
        if (tahunSelect && tahunPreview) {
            tahunSelect.addEventListener('change', () => {
                const tahunAwal = parseInt(tahunSelect.value);
                tahunPreview.textContent = AGSAHelpers.formatTahunAjar(tahunAwal);
            });
        }

        // Cancel/Back button
        const goBack = () => {
            this.isEditing = false;
            this.render();
            this.attachEvents();
        };

        if (cancelBtn) {
            cancelBtn.addEventListener('click', goBack);
        }
        if (backBtn) {
            backBtn.addEventListener('click', goBack);
        }

        // Form submit
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmit(form);
            });
        }
    },

    /**
     * Handle form submit
     */
    async handleSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        const validation = Validators.validateForm(data, {
            namaGuru: [{ validator: 'required', params: ['Nama Guru'] }],
            namaSatuan: [{ validator: 'required', params: ['Nama Satuan Pendidikan'] }],
            jenjang: [{ validator: 'required', params: ['Jenjang'] }]
        });

        if (!validation.valid) {
            const firstError = Object.values(validation.errors)[0];
            AGSAToast.error(firstError);
            return;
        }

        // NPSN validation
        if (data.npsn && !Validators.npsn(data.npsn).valid) {
            AGSAToast.error('NPSN harus 8 digit angka');
            return;
        }

        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        AGSALoader.button.start(submitBtn, 'Menyimpan...');

        try {
            // Convert dates
            if (data.tanggalPengesahan) {
                data.tanggalPengesahan = new Date(data.tanggalPengesahan);
            }
            if (data.tanggalPengesahanJurnal) {
                data.tanggalPengesahanJurnal = new Date(data.tanggalPengesahanJurnal);
            }

            // Convert tahunAwalAjar to number
            data.tahunAwalAjar = parseInt(data.tahunAwalAjar);

            // Save profile
            await ProfileService.saveProfile(data);

            // Refresh data
            this.profileData = await ProfileService.getProfile(true);

            AGSAToast.success('Profil berhasil disimpan');

            // Render view mode
            this.isEditing = false;
            this.render();
            this.attachEvents();

        } catch (error) {
            AGSAHelpers.error('Profile', 'Save failed:', error);
            AGSAToast.error('Gagal menyimpan: ' + error.message);
        } finally {
            AGSALoader.button.stop(submitBtn);
        }
    },

    /**
     * Refresh module
     */
    async refresh() {
        this.profileData = await ProfileService.getProfile(true);
        this.render();
        this.attachEvents();
    }
};

// Export
window.ProfileModule = ProfileModule;

console.log('👤 Profile Module loaded successfully');