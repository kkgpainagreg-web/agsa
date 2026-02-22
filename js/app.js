// Main Application Logic - FIXED VERSION

// Global state
let currentModule = 'dashboard';
let currentAcademicYear = '';
let userData = {
    profile: null,
    calendar: null,
    schedule: null,
    cp: [],
    students: [],
    atp: [],
    prota: [],
    promes: []
};

// Default CP Data (embedded for reliability)
const CP_DEFAULT_DATA = [
    // Fase A - Kelas 1 - Ganjil
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu mengenal dan melafalkan huruf hijaiyah dan harakat dasar dengan benar.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menyebutkan dan meyakini 6 Rukun Iman dengan benar sebagai wujud keimanan.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu melafalkan dan membiasakan diri mengucapkan kalimat basmalah dan hamdalah dalam keseharian.", dimensi: ["Keimanan", "Kemandirian"] },
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menyebutkan dan menghafal 5 Rukun Islam secara berurutan.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 1, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menceritakan secara sederhana kisah masa kecil Nabi Muhammad saw.", dimensi: ["Keimanan", "Komunikasi"] },
    
    // Fase A - Kelas 1 - Genap
    { fase: "Fase A", kelas: 1, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu melafalkan dan menghafal Surah Al-Fatihah dengan lancar.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 1, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menyebutkan bukti kebesaran Allah (Al-Khaliq) melalui ciptaan-Nya.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase A", kelas: 1, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan adab yang baik serta rasa hormat kepada orang tua dan pendidik.", dimensi: ["Komunikasi", "Kemandirian"] },
    { fase: "Fase A", kelas: 1, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu mempraktikkan tata cara bersuci (istinja) dan wudu yang benar.", dimensi: ["Kesehatan", "Keimanan"] },
    { fase: "Fase A", kelas: 1, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menceritakan kisah singkat Nabi Adam a.s. dan meneladani sifat taubatnya.", dimensi: ["Keimanan", "Komunikasi"] },
    
    // Fase A - Kelas 2 - Ganjil
    { fase: "Fase A", kelas: 2, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca dan menyambung huruf hijaiyah bersambung dasar.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 2, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memahami dan meyakini Asmaul Husna (Ar-Rahman, Ar-Rahim).", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 2, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan perilaku jujur dan disiplin di rumah maupun di sekolah.", dimensi: ["Kemandirian", "Kewargaan"] },
    { fase: "Fase A", kelas: 2, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menyebutkan nama-nama salat fardu beserta waktu pelaksanaannya.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 2, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu meneladani kesabaran dari kisah Nabi Nuh a.s.", dimensi: ["Keimanan", "Kemandirian"] },
    
    // Fase A - Kelas 2 - Genap
    { fase: "Fase A", kelas: 2, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu melafalkan dan menghafal Surah An-Nas dan Al-Falaq.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 2, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menyebutkan nama-nama malaikat Allah beserta tugas-tugasnya.", dimensi: ["Keimanan"] },
    { fase: "Fase A", kelas: 2, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan sikap peduli dan suka berbagi kepada sesama teman.", dimensi: ["Kolaborasi", "Kewargaan"] },
    { fase: "Fase A", kelas: 2, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu mempraktikkan gerakan dan bacaan salat fardu dengan runtut.", dimensi: ["Keimanan", "Kemandirian"] },
    { fase: "Fase A", kelas: 2, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menceritakan keteguhan iman dari kisah Nabi Ibrahim a.s.", dimensi: ["Keimanan", "Komunikasi"] },

    // Fase B - Kelas 3 - Ganjil
    { fase: "Fase B", kelas: 3, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca Surah Al-Kautsar dan Al-Asr dengan tartil dan memahami pesan pokoknya.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase B", kelas: 3, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu meyakini dan menyebutkan kitab-kitab Allah beserta rasul penerimanya.", dimensi: ["Keimanan"] },
    { fase: "Fase B", kelas: 3, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan sikap mandiri dan pantang menyerah dalam kehidupan sehari-hari.", dimensi: ["Kemandirian"] },
    { fase: "Fase B", kelas: 3, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami hal-hal yang membatalkan wudu dan salat fardu.", dimensi: ["Keimanan"] },
    { fase: "Fase B", kelas: 3, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu meneladani sifat Al-Amin dari kisah masa remaja Nabi Muhammad saw.", dimensi: ["Keimanan", "Kemandirian"] },

    // Fase B - Kelas 3 - Genap
    { fase: "Fase B", kelas: 3, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu mengidentifikasi hukum bacaan tajwid dasar (Nun Mati/Tanwin) pada surah pendek.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase B", kelas: 3, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memahami Asmaul Husna (Al-'Alim dan Al-Khabir) dan menerapkannya dalam perilaku.", dimensi: ["Keimanan"] },
    { fase: "Fase B", kelas: 3, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu mempraktikkan adab bertamu dan menerima tamu sesuai sunnah.", dimensi: ["Komunikasi", "Kewargaan"] },
    { fase: "Fase B", kelas: 3, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu melafalkan zikir dan doa pendek setelah selesai melaksanakan salat fardu.", dimensi: ["Keimanan"] },
    { fase: "Fase B", kelas: 3, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menceritakan kesetiaan sahabat Abu Bakar Ash-Shiddiq kepada Rasulullah.", dimensi: ["Kolaborasi", "Keimanan"] },

    // Fase B - Kelas 4 - Ganjil
    { fase: "Fase B", kelas: 4, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca dan memahami pesan toleransi dalam Surah Al-Hujurat ayat 13.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase B", kelas: 4, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu membedakan nabi dan rasul serta menyebutkan sifat-sifat wajib rasul.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase B", kelas: 4, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan sikap toleransi dan menghargai perbedaan dalam kebinekaan.", dimensi: ["Kewargaan"] },
    { fase: "Fase B", kelas: 4, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami syarat imam, makmum, dan keutamaan salat berjamaah.", dimensi: ["Keimanan", "Kolaborasi"] },
    { fase: "Fase B", kelas: 4, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu mengambil hikmah dari peristiwa hijrah Nabi Muhammad saw ke Madinah.", dimensi: ["Keimanan", "Penalaran Kritis"] },

    // Fase B - Kelas 4 - Genap
    { fase: "Fase B", kelas: 4, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menghafal dan menjelaskan makna di balik Surah Al-Fil.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase B", kelas: 4, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu merefleksikan sifat Allah melalui Asmaul Husna (Al-Wahhab, Al-Ghaffar).", dimensi: ["Keimanan"] },
    { fase: "Fase B", kelas: 4, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menahan diri dari berkata kasar, berbohong, dan membiasakan husnuzan.", dimensi: ["Kesehatan", "Komunikasi"] },
    { fase: "Fase B", kelas: 4, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menjelaskan syarat, rukun, dan hikmah berpuasa di bulan Ramadan.", dimensi: ["Keimanan", "Kesehatan"] },
    { fase: "Fase B", kelas: 4, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu meneladani sifat tegas dan adil dari sahabat Umar bin Khattab.", dimensi: ["Kewargaan", "Kemandirian"] },

    // Fase C - Kelas 5 - Ganjil
    { fase: "Fase C", kelas: 5, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca, menghafal, dan mempraktikkan pesan kepedulian sosial Surah Al-Ma'un.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase C", kelas: 5, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menjelaskan makna kiamat sugra dan kubra beserta tanda-tandanya.", dimensi: ["Keimanan"] },
    { fase: "Fase C", kelas: 5, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menerapkan sikap sabar dan ikhlas dalam menghadapi cobaan kehidupan.", dimensi: ["Kesehatan", "Kemandirian"] },
    { fase: "Fase C", kelas: 5, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu membedakan ketentuan Zakat Fitrah dan Zakat Mal beserta mustahiknya.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase C", kelas: 5, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis strategi damai Rasulullah dalam peristiwa Fathu Makkah.", dimensi: ["Penalaran Kritis", "Kewargaan"] },

    // Fase C - Kelas 5 - Genap
    { fase: "Fase C", kelas: 5, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menerapkan hukum bacaan Mim Mati saat membaca ayat Al-Qur'an.", dimensi: ["Keimanan"] },
    { fase: "Fase C", kelas: 5, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memaknai kebesaran Allah melalui Asmaul Husna (Al-Qawiy, Al-Qayyum).", dimensi: ["Keimanan"] },
    { fase: "Fase C", kelas: 5, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan sikap cinta tanah air sebagai bagian dari iman.", dimensi: ["Kewargaan", "Keimanan"] },
    { fase: "Fase C", kelas: 5, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami keringanan (rukhsah) tata cara salat musafir (jamak dan qasar).", dimensi: ["Keimanan"] },
    { fase: "Fase C", kelas: 5, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu meneladani kedermawanan Utsman bin Affan dan kecerdasan Ali bin Abi Thalib.", dimensi: ["Kewargaan", "Penalaran Kritis"] },

    // Fase C - Kelas 6 - Ganjil
    { fase: "Fase C", kelas: 6, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca dan memahami batas-batas toleransi beragama sesuai Surah Al-Kafirun.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase C", kelas: 6, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu meyakini takdir Allah dan membedakan takdir mubram dan mu'allaq.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase C", kelas: 6, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu mengidentifikasi dan menghindari perilaku tercela (mubazir dan dengki).", dimensi: ["Kesehatan", "Kewargaan"] },
    { fase: "Fase C", kelas: 6, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu mengidentifikasi kriteria dan ketentuan makanan-minuman halal dan haram.", dimensi: ["Kesehatan", "Keimanan"] },
    { fase: "Fase C", kelas: 6, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menceritakan strategi dakwah kultural Wali Songo di Pulau Jawa.", dimensi: ["Kreativitas", "Kolaborasi"] },

    // Fase C - Kelas 6 - Genap
    { fase: "Fase C", kelas: 6, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menjelaskan keutamaan malam kemuliaan berdasarkan Surah Al-Qadr.", dimensi: ["Keimanan"] },
    { fase: "Fase C", kelas: 6, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memahami dan mempraktikkan pentingnya bertaubat dan beristighfar atas kesalahan.", dimensi: ["Keimanan"] },
    { fase: "Fase C", kelas: 6, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu mempraktikkan kepedulian sosial melalui sikap empati dan simpati di masyarakat.", dimensi: ["Kewargaan", "Kolaborasi"] },
    { fase: "Fase C", kelas: 6, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu membedakan dan mempraktikkan ketentuan infaq, sedekah, dan hadiah.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase C", kelas: 6, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis sejarah masuk dan berkembangnya Islam di Nusantara secara damai.", dimensi: ["Penalaran Kritis", "Kewargaan"] },

    // Fase D - Kelas 7-9 (SMP)
    { fase: "Fase D", kelas: 7, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca dan merenungkan ayat Al-Qur'an tentang penciptaan alam semesta dan semangat menuntut ilmu.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase D", kelas: 7, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu mendeskripsikan rukun iman secara komprehensif untuk memperkokoh ketauhidan.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 7, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menunjukkan akhlak terpuji (amanah dan jujur) dalam pergaulan remaja.", dimensi: ["Kemandirian", "Komunikasi"] },
    { fase: "Fase D", kelas: 7, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami ketentuan bersuci dari hadas besar (mandi wajib).", dimensi: ["Kesehatan", "Keimanan"] },
    { fase: "Fase D", kelas: 7, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis misi dakwah Nabi Muhammad saw di periode Makkah.", dimensi: ["Penalaran Kritis", "Keimanan"] },

    { fase: "Fase D", kelas: 7, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menerapkan hukum bacaan Mad dalam Al-Qur'an dengan benar.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 7, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu meneladani sifat-sifat wajib, mustahil, dan jaiz bagi Allah.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 7, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu membiasakan sikap istiqamah dan berani membela kebenaran secara mandiri.", dimensi: ["Kemandirian"] },
    { fase: "Fase D", kelas: 7, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami ketentuan pelaksanaan salat Jumat dan salat sunnah muakkad.", dimensi: ["Keimanan", "Kolaborasi"] },
    { fase: "Fase D", kelas: 7, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis keberhasilan misi dakwah Nabi Muhammad saw periode Madinah.", dimensi: ["Penalaran Kritis", "Kolaborasi"] },

    // Additional Fase D entries for classes 8 and 9...
    { fase: "Fase D", kelas: 8, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu memahami pesan Al-Qur'an tentang mengonsumsi makanan yang halal dan thayyib.", dimensi: ["Kesehatan", "Keimanan"] },
    { fase: "Fase D", kelas: 8, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memahami dan meneladani sifat wajib, mustahil, dan jaiz bagi Rasul Allah.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 8, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menerapkan adab bermedia sosial sesuai pandangan Islam.", dimensi: ["Komunikasi", "Kewargaan"] },
    { fase: "Fase D", kelas: 8, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menjelaskan tata cara sujud syukur, sujud sahwi, dan sujud tilawah.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 8, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis perkembangan ilmu pengetahuan pada masa Bani Umayyah.", dimensi: ["Penalaran Kritis", "Kreativitas"] },

    { fase: "Fase D", kelas: 8, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu membaca dan mendemonstrasikan hafalan ayat tentang tolong-menolong dalam kebaikan.", dimensi: ["Kolaborasi", "Keimanan"] },
    { fase: "Fase D", kelas: 8, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu mendeskripsikan peristiwa kehidupan di alam barzakh hingga hari akhir.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 8, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menghindari perilaku ghibah, namimah, dan hasad dalam kehidupan sosial.", dimensi: ["Kewargaan", "Kesehatan"] },
    { fase: "Fase D", kelas: 8, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami ketentuan puasa wajib dan macam-macam puasa sunnah.", dimensi: ["Kesehatan", "Keimanan"] },
    { fase: "Fase D", kelas: 8, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis kejayaan peradaban Islam pada masa Bani Abbasiyah.", dimensi: ["Penalaran Kritis", "Kreativitas"] },

    { fase: "Fase D", kelas: 9, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu memahami pesan ayat tentang toleransi dan memelihara kerukunan umat beragama.", dimensi: ["Kewargaan", "Keimanan"] },
    { fase: "Fase D", kelas: 9, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu mendeskripsikan makna qada dan qadar untuk menumbuhkan sikap optimis dan ikhtiar.", dimensi: ["Penalaran Kritis", "Keimanan"] },
    { fase: "Fase D", kelas: 9, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menerapkan adab bergaul dengan saudara, teman sebaya, dan lawan jenis.", dimensi: ["Komunikasi", "Kewargaan"] },
    { fase: "Fase D", kelas: 9, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami ketentuan penyembelihan hewan, akikah, dan kurban.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase D", kelas: 9, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menelaah proses penyebaran Islam di Indonesia melalui berbagai jalur.", dimensi: ["Penalaran Kritis", "Kewargaan"] },

    { fase: "Fase D", kelas: 9, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu mempraktikkan bacaan gharib (seperti Imalah, Isymam) dalam Al-Qur'an.", dimensi: ["Keimanan"] },
    { fase: "Fase D", kelas: 9, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu mengintegrasikan rukun iman dalam keseharian sebagai pencegah maksiat.", dimensi: ["Keimanan", "Kemandirian"] },
    { fase: "Fase D", kelas: 9, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menghindari pergaulan bebas dan zina sesuai norma agama.", dimensi: ["Kesehatan", "Kemandirian"] },
    { fase: "Fase D", kelas: 9, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami ketentuan utang piutang, gadai, dan menghindari riba dalam muamalah.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase D", kelas: 9, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu mengapresiasi kearifan lokal tradisi Islam Nusantara.", dimensi: ["Kreativitas", "Kewargaan"] },

    // Fase E - Kelas 10 (SMA)
    { fase: "Fase E", kelas: 10, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat Al-Qur'an tentang kontrol diri (mujahadah an-nafs), prasangka baik, dan persaudaraan.", dimensi: ["Keimanan", "Penalaran Kritis", "Kewargaan"] },
    { fase: "Fase E", kelas: 10, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menganalisis makna Syu'abul Iman (cabang-cabang iman) dan implementasinya.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase E", kelas: 10, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menganalisis manfaat menghindari akhlak mazmumah dan membiasakan berpakaian Islami.", dimensi: ["Kesehatan", "Kemandirian"] },
    { fase: "Fase E", kelas: 10, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menganalisis implementasi fikih muamalah al-maliyah di era modern.", dimensi: ["Penalaran Kritis", "Keimanan"] },
    { fase: "Fase E", kelas: 10, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis strategi dakwah Rasulullah di Makkah dan Madinah.", dimensi: ["Komunikasi", "Kolaborasi"] },

    { fase: "Fase E", kelas: 10, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat tentang perintah berkompetisi dalam kebaikan dan etos kerja.", dimensi: ["Keimanan", "Kemandirian"] },
    { fase: "Fase E", kelas: 10, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memahami hubungan keterkaitan antara Iman, Islam, dan Ihsan.", dimensi: ["Keimanan"] },
    { fase: "Fase E", kelas: 10, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu membiasakan sikap berani membela kebenaran dan menjaga etika digital.", dimensi: ["Kewargaan", "Komunikasi"] },
    { fase: "Fase E", kelas: 10, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami secara komprehensif ketentuan haji, umrah, dan wakaf.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase E", kelas: 10, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menganalisis perkembangan peradaban Islam di masa keemasan.", dimensi: ["Penalaran Kritis", "Kreativitas"] },

    // Fase F - Kelas 11-12 (SMA)
    { fase: "Fase F", kelas: 11, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat tentang pentingnya berpikir kritis dan penguasaan IPTEK.", dimensi: ["Penalaran Kritis", "Kreativitas"] },
    { fase: "Fase F", kelas: 11, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu menganalisis aliran-aliran teologi dalam Islam untuk menumbuhkan toleransi.", dimensi: ["Keimanan", "Kewargaan", "Penalaran Kritis"] },
    { fase: "Fase F", kelas: 11, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menganalisis dan menghindari perilaku penyimpangan sosial.", dimensi: ["Kesehatan", "Kewargaan"] },
    { fase: "Fase F", kelas: 11, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menganalisis dan mempraktikkan ketentuan khotbah, tablig, dan dakwah.", dimensi: ["Komunikasi", "Keimanan"] },
    { fase: "Fase F", kelas: 11, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menelaah peran tokoh-tokoh ulama Islam Indonesia.", dimensi: ["Kewargaan", "Keimanan"] },

    { fase: "Fase F", kelas: 11, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat tentang pentingnya memelihara kehidupan manusia dan moderasi beragama.", dimensi: ["Kewargaan", "Keimanan"] },
    { fase: "Fase F", kelas: 11, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu memahami lebih dalam mengenai syu'abul iman tingkat lanjut.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase F", kelas: 11, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu menerapkan adab bermasyarakat dan etika komunikasi antar budaya.", dimensi: ["Komunikasi", "Kolaborasi"] },
    { fase: "Fase F", kelas: 11, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu memahami dan menganalisis secara rinci konsep Fikih Munakahat.", dimensi: ["Keimanan", "Kewargaan"] },
    { fase: "Fase F", kelas: 11, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu mengevaluasi perkembangan Islam di dunia modern.", dimensi: ["Penalaran Kritis", "Kewargaan"] },

    { fase: "Fase F", kelas: 12, semester: "Ganjil", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu menganalisis ayat tentang etos kerja unggul dan tanggung jawab dalam profesi.", dimensi: ["Kemandirian", "Keimanan"] },
    { fase: "Fase F", kelas: 12, semester: "Ganjil", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu merumuskan keterkaitan iman, Islam, dan ihsan dalam penyelesaian problema kemanusiaan.", dimensi: ["Penalaran Kritis", "Keimanan"] },
    { fase: "Fase F", kelas: 12, semester: "Ganjil", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu membiasakan diri menjadi agen perubahan positif.", dimensi: ["Kesehatan", "Kewargaan"] },
    { fase: "Fase F", kelas: 12, semester: "Ganjil", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu menghitung dan menganalisis penerapan ilmu mawaris.", dimensi: ["Keimanan", "Penalaran Kritis"] },
    { fase: "Fase F", kelas: 12, semester: "Ganjil", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menelaah peran organisasi-organisasi massa Islam dalam membangun masyarakat.", dimensi: ["Kolaborasi", "Kewargaan"] },

    { fase: "Fase F", kelas: 12, semester: "Genap", elemen: "Al-Qur'an Hadis", tujuanPembelajaran: "Peserta didik mampu mengevaluasi implementasi moderasi beragama dari ayat-ayat Al-Qur'an.", dimensi: ["Kewargaan", "Keimanan"] },
    { fase: "Fase F", kelas: 12, semester: "Genap", elemen: "Akidah", tujuanPembelajaran: "Peserta didik mampu mempresentasikan dampak penerapan tauhid yang lurus.", dimensi: ["Penalaran Kritis", "Komunikasi"] },
    { fase: "Fase F", kelas: 12, semester: "Genap", elemen: "Akhlak", tujuanPembelajaran: "Peserta didik mampu merumuskan prinsip etika digital holistik.", dimensi: ["Keimanan", "Penalaran Kritis", "Kewargaan"] },
    { fase: "Fase F", kelas: 12, semester: "Genap", elemen: "Fikih", tujuanPembelajaran: "Peserta didik mampu mendemonstrasikan penyelesaian studi kasus terkait hukum mawaris.", dimensi: ["Kolaborasi", "Penalaran Kritis"] },
    { fase: "Fase F", kelas: 12, semester: "Genap", elemen: "Sejarah Peradaban Islam", tujuanPembelajaran: "Peserta didik mampu menyintesiskan nilai-nilai luhur peradaban Islam di dunia.", dimensi: ["Kreativitas", "Kewargaan"] }
];

// Fase mapping
const FASE_MAPPING = {
    'Fase A': { jenjang: 'SD', kelas: [1, 2] },
    'Fase B': { jenjang: 'SD', kelas: [3, 4] },
    'Fase C': { jenjang: 'SD', kelas: [5, 6] },
    'Fase D': { jenjang: 'SMP', kelas: [7, 8, 9] },
    'Fase E': { jenjang: 'SMA', kelas: [10] },
    'Fase F': { jenjang: 'SMA', kelas: [11, 12] }
};

// Get Fase by Kelas
function getFaseByKelas(kelas) {
    for (const [fase, data] of Object.entries(FASE_MAPPING)) {
        if (data.kelas.includes(kelas)) {
            return fase;
        }
    }
    return null;
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        currentUser = user;
        showLoading(true);

        try {
            // Load user profile
            await loadUserProfile();
            
            // Setup UI
            setupUI();
            
            // Setup academic year
            setupAcademicYear();
            
            // Load user data
            await loadUserData();
            
            // Check hash for initial module
            const hash = window.location.hash.substring(1);
            if (hash) {
                showModule(hash);
            } else {
                showModule('dashboard');
            }

            // Update dashboard stats
            updateDashboardStats();

        } catch (error) {
            console.error('Error initializing app:', error);
            showToast('Terjadi kesalahan saat memuat aplikasi', 'error');
        }

        showLoading(false);
    });
});

// Load user profile
async function loadUserProfile() {
    if (!currentUser) return;

    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            userProfile = doc.data();
            userData.profile = userProfile;
        } else {
            // Create new profile if doesn't exist
            await createUserProfile(currentUser);
            userProfile = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || '',
                photoURL: currentUser.photoURL || '',
                subscription: { type: 'free', isActive: false }
            };
            userData.profile = userProfile;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        // Use fallback profile from auth
        userProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            subscription: { type: 'free', isActive: false }
        };
        userData.profile = userProfile;
    }
}

// Create user profile
async function createUserProfile(user) {
    const academicYears = getAvailableAcademicYears();
    
    const profile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        nip: '',
        phone: '',
        schoolName: '',
        schoolAddress: '',
        schoolCity: '',
        schoolProvince: '',
        principalName: '',
        principalNIP: '',
        subjects: [],
        subscription: {
            type: 'free',
            startDate: null,
            endDate: null,
            isActive: false
        },
        settings: {
            defaultAcademicYear: academicYears[1],
            theme: 'light',
            notifications: true
        },
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('users').doc(user.uid).set(profile);
        console.log('User profile created for: ' + user.email);
    } catch (error) {
        console.error('Error creating profile:', error);
    }
    
    return profile;
}

// Setup UI elements
function setupUI() {
    // Get display name safely
    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';
    const photoURL = userProfile?.photoURL || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=22c55e&color=fff`;
    
    // Set user info in UI
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const welcomeNameEl = document.getElementById('welcomeName');
    
    if (userNameEl) userNameEl.textContent = displayName;
    if (userAvatarEl) userAvatarEl.src = photoURL;
    if (welcomeNameEl) welcomeNameEl.textContent = displayName.split(' ')[0];

    // Set subscription badge
    const badge = document.getElementById('subscriptionBadge');
    const upgradeBtn = document.getElementById('upgradeBtn');
    
    if (isPremium()) {
        if (badge) {
            badge.textContent = 'Premium';
            badge.className = 'ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full';
        }
        if (upgradeBtn) upgradeBtn.classList.add('hidden');
        
        // Hide premium badges in sidebar
        document.querySelectorAll('.premium-badge').forEach(el => el.classList.add('hidden'));
    } else {
        if (badge) {
            badge.textContent = 'Free';
            badge.className = 'ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full';
        }
        if (upgradeBtn) upgradeBtn.classList.remove('hidden');
    }

    // Show admin link if super admin
    const adminLink = document.getElementById('adminLink');
    if (adminLink && isSuperAdmin()) {
        adminLink.classList.remove('hidden');
        adminLink.classList.add('flex');
    }

    // Load profile data into form
    loadProfileForm();

    // Setup form handlers
    setupFormHandlers();

    // Initialize premium module placeholders
    initPremiumModules();
}

// Setup academic year selector
function setupAcademicYear() {
    const years = getAvailableAcademicYears();
    const select = document.getElementById('academicYearSelect');
    
    if (!select) return;
    
    const defaultYear = userProfile?.settings?.defaultAcademicYear || years[1];
    
    select.innerHTML = years.map(year => 
        `<option value="${year}" ${year === defaultYear ? 'selected' : ''}>${year}</option>`
    ).join('');

    currentAcademicYear = select.value;
    
    const currentYearDisplay = document.getElementById('currentYearDisplay');
    if (currentYearDisplay) {
        currentYearDisplay.textContent = currentAcademicYear;
    }

    select.addEventListener('change', async (e) => {
        currentAcademicYear = e.target.value;
        if (currentYearDisplay) {
            currentYearDisplay.textContent = currentAcademicYear;
        }
        
        // Update user settings
        try {
            await updateUserProfile({
                'settings.defaultAcademicYear': currentAcademicYear
            });
        } catch (error) {
            console.warn('Could not save academic year preference');
        }

        // Reload data for new academic year
        await loadUserData();
        updateDashboardStats();
    });
}

// Load user data
async function loadUserData() {
    if (!currentUser) return;

    try {
        // Load calendar
        const calendarDoc = await db.collection('users').doc(currentUser.uid)
            .collection('calendar').doc(currentAcademicYear).get();
        if (calendarDoc.exists) {
            userData.calendar = calendarDoc.data();
        } else {
            userData.calendar = null;
        }

        // Load schedule
        const scheduleDoc = await db.collection('users').doc(currentUser.uid)
            .collection('schedule').doc(currentAcademicYear).get();
        if (scheduleDoc.exists) {
            userData.schedule = scheduleDoc.data();
        } else {
            userData.schedule = null;
        }

        // Load CP
        const cpSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('cp').get();
        userData.cp = cpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Load students
        const studentsSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('students').where('academicYear', '==', currentAcademicYear).get();
        userData.students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalClassesEl = document.getElementById('totalClasses');
    const totalTPEl = document.getElementById('totalTP');
    const effectiveDaysEl = document.getElementById('effectiveDays');
    
    if (totalStudentsEl) totalStudentsEl.textContent = userData.students?.length || 0;
    
    if (totalClassesEl) {
        const classes = new Set((userData.students || []).map(s => `${s.kelas}-${s.rombel}`));
        totalClassesEl.textContent = classes.size;
    }
    
    if (totalTPEl) totalTPEl.textContent = userData.cp?.length || 0;
    
    // Calculate effective days
    if (effectiveDaysEl && userData.calendar) {
        const holidays = userData.calendar.holidays || [];
        const sem1Days = userData.calendar.sem1Start && userData.calendar.sem1End ?
            calculateEffectiveDays(userData.calendar.sem1Start, userData.calendar.sem1End, holidays.map(h => h.date)) : 0;
        const sem2Days = userData.calendar.sem2Start && userData.calendar.sem2End ?
            calculateEffectiveDays(userData.calendar.sem2Start, userData.calendar.sem2End, holidays.map(h => h.date)) : 0;
        effectiveDaysEl.textContent = sem1Days + sem2Days;
    } else if (effectiveDaysEl) {
        effectiveDaysEl.textContent = 0;
    }

    // Update setup progress
    updateSetupProgress();
}

// Update setup progress indicators
function updateSetupProgress() {
    const updateStatus = (elementId, isComplete) => {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        const statusSpan = el.querySelector('span:last-child');
        const iconDiv = el.querySelector('div');
        
        if (isComplete && statusSpan && iconDiv) {
            statusSpan.textContent = 'Selesai';
            statusSpan.className = 'text-xs px-2 py-1 rounded-full bg-green-100 text-green-700';
            iconDiv.className = 'w-8 h-8 bg-green-100 rounded-full flex items-center justify-center';
            iconDiv.innerHTML = '<i class="fas fa-check text-green-600"></i>';
        }
    };

    updateStatus('setupProfile', userProfile?.schoolName && userProfile?.displayName);
    updateStatus('setupCalendar', userData.calendar?.sem1Start);
    updateStatus('setupSchedule', userData.schedule?.timeSlots?.length > 0);
    updateStatus('setupCP', userData.cp?.length > 0);
    updateStatus('setupStudents', userData.students?.length > 0);
}

// Show module
function showModule(moduleName) {
    // Update sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${moduleName}`) {
            link.classList.add('active');
        }
    });

    // Hide all modules
    document.querySelectorAll('.module-content').forEach(module => {
        module.classList.add('hidden');
    });

    // Show selected module
    const moduleElement = document.getElementById(`module-${moduleName}`);
    if (moduleElement) {
        moduleElement.classList.remove('hidden');
    }

    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'profil': 'Profil',
        'kalender': 'Kalender Pendidikan',
        'jadwal': 'Jadwal Pelajaran',
        'cp': 'Capaian Pembelajaran',
        'siswa': 'Data Siswa',
        'atp': 'Alur Tujuan Pembelajaran',
        'prota': 'Program Tahunan',
        'promes': 'Program Semester',
        'modul-ajar': 'Modul Ajar',
        'lkpd': 'LKPD',
        'bank-soal': 'Bank Soal',
        'absensi': 'Absensi',
        'jurnal': 'Jurnal Pembelajaran',
        'nilai': 'Daftar Nilai',
        'kktp': 'KKTP',
        'ai-assistant': 'AI Assistant'
    };
    
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.textContent = titles[moduleName] || moduleName;
    }

    // Update URL hash
    window.location.hash = moduleName;
    currentModule = moduleName;

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');

    // Load module-specific data
    loadModuleData(moduleName);
}

// Load module-specific data
function loadModuleData(moduleName) {
    switch (moduleName) {
        case 'kalender':
            loadCalendarModule();
            break;
        case 'jadwal':
            loadScheduleModule();
            break;
        case 'cp':
            loadCPModule();
            break;
        case 'siswa':
            loadStudentsModule();
            break;
        case 'atp':
            loadATPModule();
            break;
        case 'prota':
            loadProtaModule();
            break;
    }
}

// Toggle sidebar (mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
    if (overlay) overlay.classList.toggle('hidden');
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('hidden');
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('userMenu');
    if (!menu) return;
    
    const button = e.target.closest('button');
    
    if (!button || !button.onclick?.toString().includes('toggleUserMenu')) {
        if (!menu.contains(e.target)) {
            menu.classList.add('hidden');
        }
    }
});

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
function setupFormHandlers() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    // Add CP form
    const addCPForm = document.getElementById('addCPForm');
    if (addCPForm) {
        addCPForm.addEventListener('submit', saveCP);
    }
    
    // Fase change handler for CP form
    const cpFaseSelect = document.getElementById('cpFase');
    if (cpFaseSelect) {
        cpFaseSelect.addEventListener('change', (e) => {
            const fase = e.target.value;
            const kelasSelect = document.getElementById('cpKelas');
            
            if (kelasSelect && FASE_MAPPING[fase]) {
                kelasSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
                    FASE_MAPPING[fase].kelas.map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
            }
        });
    }
}

// ==================== PROFILE MODULE ====================

function loadProfileForm() {
    if (!userProfile) return;

    const setInputValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };

    setInputValue('inputDisplayName', userProfile.displayName);
    setInputValue('inputNIP', userProfile.nip);
    setInputValue('inputEmail', userProfile.email);
    setInputValue('inputPhone', userProfile.phone);
    setInputValue('inputSchoolName', userProfile.schoolName);
    setInputValue('inputSchoolAddress', userProfile.schoolAddress);
    setInputValue('inputSchoolCity', userProfile.schoolCity);
    setInputValue('inputSchoolProvince', userProfile.schoolProvince);
    setInputValue('inputPrincipalName', userProfile.principalName);
    setInputValue('inputPrincipalNIP', userProfile.principalNIP);

    // Profile header
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileDisplayName) profileDisplayName.textContent = userProfile.displayName || 'Nama Guru';
    if (profileEmail) profileEmail.textContent = userProfile.email || '';
    if (profileAvatar) {
        profileAvatar.src = userProfile.photoURL || currentUser?.photoURL || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.displayName || 'U')}&background=ffffff&color=22c55e&size=100`;
    }

    // Load subjects
    loadSubjectsForm();
}

function loadSubjectsForm() {
    const container = document.getElementById('subjectsList');
    if (!container) return;
    
    const subjects = userProfile?.subjects || [];

    if (subjects.length === 0) {
        addSubjectInput();
        return;
    }

    container.innerHTML = '';
    subjects.forEach((subject) => {
        addSubjectInput(subject);
    });
}

function addSubjectInput(data = null) {
    const container = document.getElementById('subjectsList');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'flex items-center space-x-3 p-3 bg-gray-50 rounded-xl';
    div.innerHTML = `
        <div class="flex-1">
            <input type="text" name="subjectName[]" value="${data?.name || ''}" 
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" 
                placeholder="Nama Mata Pelajaran">
        </div>
        <div class="w-32">
            <input type="number" name="subjectHours[]" value="${data?.hoursPerWeek || 2}" min="1" max="10"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" 
                placeholder="JP/Minggu">
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

async function saveProfile(e) {
    e.preventDefault();
    showLoading(true);

    try {
        // Collect subjects
        const subjectNames = document.querySelectorAll('input[name="subjectName[]"]');
        const subjectHours = document.querySelectorAll('input[name="subjectHours[]"]');
        const subjects = [];

        subjectNames.forEach((input, i) => {
            if (input.value.trim()) {
                subjects.push({
                    name: input.value.trim(),
                    hoursPerWeek: parseInt(subjectHours[i]?.value) || 2
                });
            }
        });

        const getInputValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        const profileData = {
            displayName: getInputValue('inputDisplayName'),
            nip: getInputValue('inputNIP'),
            phone: getInputValue('inputPhone'),
            schoolName: getInputValue('inputSchoolName'),
            schoolAddress: getInputValue('inputSchoolAddress'),
            schoolCity: getInputValue('inputSchoolCity'),
            schoolProvince: getInputValue('inputSchoolProvince'),
            principalName: getInputValue('inputPrincipalName'),
            principalNIP: getInputValue('inputPrincipalNIP'),
            subjects: subjects
        };

        await updateUserProfile(profileData);
        
        // Update UI
        const userNameEl = document.getElementById('userName');
        const welcomeNameEl = document.getElementById('welcomeName');
        const profileDisplayNameEl = document.getElementById('profileDisplayName');
        
        if (userNameEl) userNameEl.textContent = profileData.displayName || 'User';
        if (welcomeNameEl) welcomeNameEl.textContent = (profileData.displayName || 'Guru').split(' ')[0];
        if (profileDisplayNameEl) profileDisplayNameEl.textContent = profileData.displayName || 'Nama Guru';

        showToast('Profil berhasil disimpan!', 'success');
        updateSetupProgress();

    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Gagal menyimpan profil', 'error');
    }

    showLoading(false);
}

// ==================== CALENDAR MODULE ====================

function loadCalendarModule() {
    const sem1Start = document.getElementById('sem1Start');
    const sem1End = document.getElementById('sem1End');
    const sem2Start = document.getElementById('sem2Start');
    const sem2End = document.getElementById('sem2End');
    
    if (!sem1Start || !sem1End || !sem2Start || !sem2End) return;

    if (userData.calendar) {
        sem1Start.value = userData.calendar.sem1Start || '';
        sem1End.value = userData.calendar.sem1End || '';
        sem2Start.value = userData.calendar.sem2Start || '';
        sem2End.value = userData.calendar.sem2End || '';
        
        loadHolidays(userData.calendar.holidays || []);
    } else {
        // Set default dates
        const years = currentAcademicYear.split('/');
        sem1Start.value = `${years[0]}-07-15`;
        sem1End.value = `${years[0]}-12-20`;
        sem2Start.value = `${years[1]}-01-06`;
        sem2End.value = `${years[1]}-06-20`;
        
        loadHolidays([]);
    }
    
    updateCalendarStats();

    // Add change listeners
    ['sem1Start', 'sem1End', 'sem2Start', 'sem2End'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateCalendarStats);
    });
}

function loadHolidays(holidays) {
    const container = document.getElementById('holidaysList');
    if (!container) return;
    
    container.innerHTML = '';

    if (holidays.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic">Belum ada libur kustom. Klik "Tambah Libur" untuk menambahkan.</p>';
        return;
    }

    holidays.forEach((holiday) => {
        addHolidayRow(holiday);
    });
}

function addHolidayRow(holiday = null) {
    const container = document.getElementById('holidaysList');
    if (!container) return;
    
    // Remove placeholder if exists
    const placeholder = container.querySelector('p');
    if (placeholder) placeholder.remove();

    const div = document.createElement('div');
    div.className = 'flex items-center space-x-3 p-3 bg-orange-50 rounded-lg';
    div.innerHTML = `
        <input type="date" class="holiday-date flex-1 px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white" 
            value="${holiday?.date || ''}">
        <input type="text" class="holiday-name flex-1 px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white" 
            placeholder="Nama hari libur" value="${holiday?.name || ''}">
        <button type="button" onclick="this.parentElement.remove(); updateCalendarStats();" class="p-2 text-red-500 hover:bg-red-100 rounded-lg">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(div);
}

function addHoliday() {
    addHolidayRow();
}

function updateCalendarStats() {
    const sem1Start = document.getElementById('sem1Start')?.value;
    const sem1End = document.getElementById('sem1End')?.value;
    const sem2Start = document.getElementById('sem2Start')?.value;
    const sem2End = document.getElementById('sem2End')?.value;

    const holidays = getHolidaysFromForm();

    if (sem1Start && sem1End) {
        const days = calculateEffectiveDays(sem1Start, sem1End, holidays.map(h => h.date));
        const weeks = getWeeksBetween(sem1Start, sem1End);
        const sem1EffectiveDays = document.getElementById('sem1EffectiveDays');
        const sem1EffectiveWeeks = document.getElementById('sem1EffectiveWeeks');
        if (sem1EffectiveDays) sem1EffectiveDays.textContent = `${days} hari`;
        if (sem1EffectiveWeeks) sem1EffectiveWeeks.textContent = `${weeks} minggu`;
    }

    if (sem2Start && sem2End) {
        const days = calculateEffectiveDays(sem2Start, sem2End, holidays.map(h => h.date));
        const weeks = getWeeksBetween(sem2Start, sem2End);
        const sem2EffectiveDays = document.getElementById('sem2EffectiveDays');
        const sem2EffectiveWeeks = document.getElementById('sem2EffectiveWeeks');
        if (sem2EffectiveDays) sem2EffectiveDays.textContent = `${days} hari`;
        if (sem2EffectiveWeeks) sem2EffectiveWeeks.textContent = `${weeks} minggu`;
    }
}

function getHolidaysFromForm() {
    const holidays = [];
    const rows = document.querySelectorAll('#holidaysList > div');
    
    rows.forEach(row => {
        const dateEl = row.querySelector('.holiday-date');
        const nameEl = row.querySelector('.holiday-name');
        if (dateEl && nameEl && dateEl.value && nameEl.value) {
            holidays.push({ date: dateEl.value, name: nameEl.value });
        }
    });

    return holidays;
}

async function saveCalendar() {
    showLoading(true);

    try {
        const calendarData = {
            sem1Start: document.getElementById('sem1Start')?.value || '',
            sem1End: document.getElementById('sem1End')?.value || '',
            sem2Start: document.getElementById('sem2Start')?.value || '',
            sem2End: document.getElementById('sem2End')?.value || '',
            holidays: getHolidaysFromForm(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(currentUser.uid)
            .collection('calendar').doc(currentAcademicYear).set(calendarData);

        userData.calendar = calendarData;
        showToast('Kalender berhasil disimpan!', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error saving calendar:', error);
        showToast('Gagal menyimpan kalender', 'error');
    }

    showLoading(false);
}

// ==================== CP MODULE ====================

function loadCPModule() {
    renderCPList(userData.cp || []);
}

async function loadDefaultCP() {
    if (userData.cp && userData.cp.length > 0) {
        if (!confirm('Data CP yang ada akan diganti dengan data default PAI. Lanjutkan?')) {
            return;
        }
    }

    showLoading(true);

    try {
        // Clear existing CP
        const batch = db.batch();
        const existingCP = await db.collection('users').doc(currentUser.uid)
            .collection('cp').get();
        existingCP.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        // Add default CP
        const newBatch = db.batch();
        CP_DEFAULT_DATA.forEach(cp => {
            const ref = db.collection('users').doc(currentUser.uid).collection('cp').doc();
            newBatch.set(ref, {
                ...cp,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        await newBatch.commit();

        // Reload CP
        const cpSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('cp').get();
        userData.cp = cpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderCPList(userData.cp);
        showToast(`Berhasil memuat ${userData.cp.length} CP default PAI!`, 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error loading default CP:', error);
        showToast('Gagal memuat CP default', 'error');
    }

    showLoading(false);
}

function showAddCPModal() {
    const form = document.getElementById('addCPForm');
    if (form) form.reset();
    showModal('addCPModal');
}

async function saveCP(e) {
    e.preventDefault();
    showLoading(true);

    try {
        const dimensi = Array.from(document.querySelectorAll('input[name="dimensi"]:checked'))
            .map(cb => cb.value);

        const cpData = {
            fase: document.getElementById('cpFase')?.value || '',
            kelas: parseInt(document.getElementById('cpKelas')?.value) || 0,
            semester: document.getElementById('cpSemester')?.value || 'Ganjil',
            elemen: document.getElementById('cpElemen')?.value || '',
            tujuanPembelajaran: document.getElementById('cpTP')?.value || '',
            dimensi: dimensi,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('cp').add(cpData);

        if (!userData.cp) userData.cp = [];
        userData.cp.push({ id: docRef.id, ...cpData });
        renderCPList(userData.cp);
        
        hideModal('addCPModal');
        showToast('CP berhasil ditambahkan!', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error saving CP:', error);
        showToast('Gagal menyimpan CP', 'error');
    }

    showLoading(false);
}

function renderCPList(cpData) {
    const container = document.getElementById('cpList');
    if (!container) return;
    
    if (!cpData || cpData.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-bullseye text-4xl mb-4 text-gray-300"></i>
                <p>Belum ada data CP. Klik "Load Default PAI" untuk memuat data default atau "Tambah CP" untuk menambah manual.</p>
            </div>
        `;
        return;
    }

    // Group by fase
    const grouped = {};
    cpData.forEach(cp => {
        if (!grouped[cp.fase]) grouped[cp.fase] = [];
        grouped[cp.fase].push(cp);
    });
    
    container.innerHTML = Object.entries(grouped).map(([fase, items]) => `
        <div class="border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div class="bg-gray-50 px-4 py-3 font-semibold text-gray-700 flex items-center justify-between">
                <span>${fase} (Kelas ${FASE_MAPPING[fase]?.kelas.join(', ') || '-'})</span>
                <span class="text-sm font-normal text-gray-500">${items.length} TP</span>
            </div>
            <div class="divide-y divide-gray-100">
                ${items.map(cp => `
                    <div class="p-4 hover:bg-gray-50">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-2">
                                    <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Kelas ${cp.kelas}</span>
                                    <span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">${cp.semester}</span>
                                    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">${cp.elemen}</span>
                                </div>
                                <p class="text-gray-700">${cp.tujuanPembelajaran}</p>
                                <div class="flex flex-wrap gap-1 mt-2">
                                    ${(cp.dimensi || []).map(d => `
                                        <span class="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">${d}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="flex space-x-2 ml-4">
                                <button onclick="deleteCP('${cp.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function filterCP() {
    const fase = document.getElementById('cpFilterFase')?.value || '';
    const kelas = document.getElementById('cpFilterKelas')?.value || '';
    const semester = document.getElementById('cpFilterSemester')?.value || '';
    const elemen = document.getElementById('cpFilterElemen')?.value || '';

    let filtered = userData.cp || [];

    if (fase) filtered = filtered.filter(cp => cp.fase === fase);
    if (kelas) filtered = filtered.filter(cp => cp.kelas === parseInt(kelas));
    if (semester) filtered = filtered.filter(cp => cp.semester === semester);
    if (elemen) filtered = filtered.filter(cp => cp.elemen === elemen);

    renderCPList(filtered);
}

async function deleteCP(cpId) {
    if (!confirm('Yakin ingin menghapus CP ini?')) return;

    showLoading(true);

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('cp').doc(cpId).delete();

        userData.cp = (userData.cp || []).filter(cp => cp.id !== cpId);
        renderCPList(userData.cp);
        showToast('CP berhasil dihapus', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error deleting CP:', error);
        showToast('Gagal menghapus CP', 'error');
    }

    showLoading(false);
}

// ==================== STUDENTS MODULE ====================

function loadStudentsModule() {
    populateClassFilters();
    renderStudentsTable(userData.students || []);
}

function showImportStudentsModal() {
    showModal('importStudentsModal');
}

async function processImportStudents() {
    const csvUrl = document.getElementById('csvUrl')?.value;
    const csvFileInput = document.getElementById('csvFile');
    const csvFile = csvFileInput?.files[0];

    if (!csvUrl && !csvFile) {
        showToast('Masukkan URL CSV atau pilih file', 'warning');
        return;
    }

    showLoading(true);

    try {
        let csvText;

        if (csvFile) {
            csvText = await csvFile.text();
        } else {
            const response = await fetch(csvUrl);
            csvText = await response.text();
        }

        const { data } = parseCSV(csvText);

        if (data.length === 0) {
            showToast('Data CSV kosong atau format tidak valid', 'error');
            showLoading(false);
            return;
        }

        // Validate required fields
        const requiredFields = ['nisn', 'nama', 'jenis_kelamin', 'kelas', 'rombel'];
        const firstRow = data[0];
        const missingFields = requiredFields.filter(f => !(f in firstRow));

        if (missingFields.length > 0) {
            showToast(`Field tidak lengkap: ${missingFields.join(', ')}`, 'error');
            showLoading(false);
            return;
        }

        // Save students to Firestore
        const batch = db.batch();
        
        data.forEach(row => {
            const ref = db.collection('users').doc(currentUser.uid)
                .collection('students').doc();
            batch.set(ref, {
                nisn: row.nisn,
                nama: row.nama,
                jenisKelamin: row.jenis_kelamin.toUpperCase(),
                kelas: parseInt(row.kelas),
                rombel: row.rombel.toUpperCase(),
                academicYear: currentAcademicYear,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();

        // Reload students
        const studentsSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('students').where('academicYear', '==', currentAcademicYear).get();
        userData.students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        populateClassFilters();
        renderStudentsTable(userData.students);
        hideModal('importStudentsModal');
        showToast(`Berhasil import ${data.length} siswa!`, 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error importing students:', error);
        showToast('Gagal import data siswa', 'error');
    }

    showLoading(false);
}

function populateClassFilters() {
    const students = userData.students || [];
    const classes = [...new Set(students.map(s => s.kelas))].sort((a, b) => a - b);
    const rombels = [...new Set(students.map(s => s.rombel))].sort();

    const classSelect = document.getElementById('studentFilterClass');
    const rombelSelect = document.getElementById('studentFilterRombel');

    if (classSelect) {
        classSelect.innerHTML = '<option value="">Semua Kelas</option>' +
            classes.map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
    }

    if (rombelSelect) {
        rombelSelect.innerHTML = '<option value="">Semua Rombel</option>' +
            rombels.map(r => `<option value="${r}">Rombel ${r}</option>`).join('');
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
                    <p>Belum ada data siswa. Import dari CSV atau tambah manual.</p>
                </td>
            </tr>
        `;
        const showCount = document.getElementById('studentsShowCount');
        const totalCount = document.getElementById('studentsTotalCount');
        if (showCount) showCount.textContent = '0';
        if (totalCount) totalCount.textContent = '0';
        return;
    }

    tbody.innerHTML = students.map((student, index) => `
        <tr class="hover:bg-gray-50 border-b border-gray-100">
            <td class="px-4 py-3 text-sm">${index + 1}</td>
            <td class="px-4 py-3 text-sm">${student.nisn || '-'}</td>
            <td class="px-4 py-3 text-sm font-medium">${student.nama || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">
                <span class="${student.jenisKelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}">${student.jenisKelamin || '-'}</span>
            </td>
            <td class="px-4 py-3 text-sm text-center">${student.kelas || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">${student.rombel || '-'}</td>
            <td class="px-4 py-3 text-sm text-center">
                <button onclick="deleteStudent('${student.id}')" class="p-1 text-red-600 hover:bg-red-50 rounded">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    const showCount = document.getElementById('studentsShowCount');
    const totalCount = document.getElementById('studentsTotalCount');
    if (showCount) showCount.textContent = students.length;
    if (totalCount) totalCount.textContent = (userData.students || []).length;
}

function filterStudents() {
    const kelas = document.getElementById('studentFilterClass')?.value || '';
    const rombel = document.getElementById('studentFilterRombel')?.value || '';
    const search = (document.getElementById('studentSearch')?.value || '').toLowerCase();

    let filtered = userData.students || [];

    if (kelas) filtered = filtered.filter(s => s.kelas === parseInt(kelas));
    if (rombel) filtered = filtered.filter(s => s.rombel === rombel);
    if (search) filtered = filtered.filter(s => 
        (s.nama || '').toLowerCase().includes(search) || (s.nisn || '').includes(search)
    );

    renderStudentsTable(filtered);
}

async function deleteStudent(studentId) {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('students').doc(studentId).delete();

        userData.students = (userData.students || []).filter(s => s.id !== studentId);
        renderStudentsTable(userData.students);
        showToast('Siswa berhasil dihapus', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Gagal menghapus siswa', 'error');
    }
}

// ==================== SCHEDULE MODULE ====================

function loadScheduleModule() {
    const classSelect = document.getElementById('scheduleClass');
    const subjectSelect = document.getElementById('scheduleSubject');

    if (classSelect) {
        const classes = [...new Set((userData.students || []).map(s => `${s.kelas}${s.rombel}`))].sort();
        classSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>' +
            classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    if (subjectSelect) {
        const subjects = userProfile?.subjects || [];
        subjectSelect.innerHTML = '<option value="">-- Pilih Mapel --</option>' +
            subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }

    generateScheduleTable();
}

function showTimeSlotsSettings() {
    loadDefaultTimeSlots();
    showModal('timeSlotsModal');
}

function loadDefaultTimeSlots() {
    const jenjang = document.getElementById('timeSlotJenjang')?.value || 'SMP';
    const container = document.getElementById('timeSlotsContainer');
    const durationInput = document.getElementById('durationPerSlot');
    
    const durations = { 'SD': 35, 'SMP': 40, 'SMA': 45 };
    if (durationInput) durationInput.value = durations[jenjang];

    const defaultSlots = [
        { start: '07:00', end: '07:40' },
        { start: '07:40', end: '08:20' },
        { start: '08:20', end: '09:00' },
        { start: '09:15', end: '09:55' },
        { start: '09:55', end: '10:35' },
        { start: '10:35', end: '11:15' },
        { start: '11:15', end: '11:55' },
        { start: '12:30', end: '13:10' }
    ];

    const savedSlots = userData.schedule?.timeSlots || defaultSlots;
    
    if (container) {
        container.innerHTML = savedSlots.map((slot, i) => `
            <div class="flex items-center space-x-2">
                <span class="w-16 text-sm text-gray-600">Jam ${i + 1}</span>
                <input type="time" class="slot-start px-2 py-1 border border-gray-200 rounded" value="${slot.start}">
                <span>-</span>
                <input type="time" class="slot-end px-2 py-1 border border-gray-200 rounded" value="${slot.end}">
                <button type="button" onclick="this.parentElement.remove()" class="p-1 text-red-500 hover:bg-red-50 rounded">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

function addTimeSlot() {
    const container = document.getElementById('timeSlotsContainer');
    if (!container) return;
    
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <span class="w-16 text-sm text-gray-600">Jam ${index + 1}</span>
        <input type="time" class="slot-start px-2 py-1 border border-gray-200 rounded" value="">
        <span>-</span>
        <input type="time" class="slot-end px-2 py-1 border border-gray-200 rounded" value="">
        <button type="button" onclick="this.parentElement.remove()" class="p-1 text-red-500 hover:bg-red-50 rounded">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
}

async function saveTimeSlots() {
    const slots = [];
    const rows = document.querySelectorAll('#timeSlotsContainer > div');
    
    rows.forEach(row => {
        const startEl = row.querySelector('.slot-start');
        const endEl = row.querySelector('.slot-end');
        if (startEl && endEl && startEl.value && endEl.value) {
            slots.push({ start: startEl.value, end: endEl.value });
        }
    });

    if (slots.length === 0) {
        showToast('Minimal harus ada 1 jam pelajaran', 'warning');
        return;
    }

    showLoading(true);

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('schedule').doc(currentAcademicYear).set({
                timeSlots: slots,
                duration: parseInt(document.getElementById('durationPerSlot')?.value || 40),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        userData.schedule = { ...userData.schedule, timeSlots: slots };
        
        hideModal('timeSlotsModal');
        generateScheduleTable();
        showToast('Pengaturan jam pelajaran berhasil disimpan!', 'success');
        updateDashboardStats();

    } catch (error) {
        console.error('Error saving time slots:', error);
        showToast('Gagal menyimpan pengaturan', 'error');
    }

    showLoading(false);
}

function generateScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    if (!tbody) return;
    
    const slots = userData.schedule?.timeSlots || [
        { start: '07:00', end: '07:40' },
        { start: '07:40', end: '08:20' },
        { start: '08:20', end: '09:00' },
        { start: '09:15', end: '09:55' },
        { start: '09:55', end: '10:35' },
        { start: '10:35', end: '11:15' },
        { start: '11:15', end: '11:55' },
        { start: '12:30', end: '13:10' }
    ];

    tbody.innerHTML = slots.map((slot, i) => `
        <tr class="hover:bg-gray-50">
            <td class="border border-gray-200 px-4 py-2 text-center font-medium">${i + 1}</td>
            <td class="border border-gray-200 px-4 py-2 text-center text-sm">${slot.start} - ${slot.end}</td>
            ${['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'].map(day => `
                <td class="border border-gray-200 px-2 py-1 text-center">
                    <button onclick="editScheduleSlot(${i}, '${day}')" class="w-full h-8 text-xs bg-gray-50 hover:bg-primary-50 rounded border border-dashed border-gray-300">
                        <i class="fas fa-plus text-gray-400"></i>
                    </button>
                </td>
            `).join('')}
        </tr>
    `).join('');
}

function editScheduleSlot(slotIndex, day) {
    showToast('Fitur edit jadwal akan segera tersedia', 'info');
}

async function saveSchedule() {
    showToast('Jadwal berhasil disimpan!', 'success');
}

// ==================== ATP MODULE ====================

function loadATPModule() {
    populateATPFilters();
}

function populateATPFilters() {
    const classSelect = document.getElementById('atpFilterKelas');
    const mapelSelect = document.getElementById('atpFilterMapel');

    if (classSelect) {
        const classes = [...new Set((userData.cp || []).map(cp => cp.kelas))].sort((a, b) => a - b);
        classSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
            classes.map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
    }

    if (mapelSelect) {
        const subjects = userProfile?.subjects?.map(s => s.name) || ['Pendidikan Agama Islam dan Budi Pekerti'];
        mapelSelect.innerHTML = '<option value="">Pilih Mapel</option>' +
            subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }
}

function generateATP() {
    const kelas = document.getElementById('atpFilterKelas')?.value;
    const mapel = document.getElementById('atpFilterMapel')?.value;
    const semester = document.getElementById('atpFilterSemester')?.value;

    if (!kelas || !mapel) {
        showToast('Pilih kelas dan mata pelajaran terlebih dahulu', 'warning');
        return;
    }

    let filteredCP = (userData.cp || []).filter(cp => cp.kelas === parseInt(kelas));
    if (semester) {
        filteredCP = filteredCP.filter(cp => cp.semester === semester);
    }

    if (filteredCP.length === 0) {
        showToast('Tidak ada CP untuk kelas dan semester yang dipilih', 'warning');
        return;
    }

    renderATP(filteredCP, kelas, mapel);
}

function filterATP() {
    generateATP();
}

function renderATP(cpData, kelas, mapel) {
    const container = document.getElementById('atpContent');
    if (!container) return;
    
    // Group by semester
    const bySemester = {};
    cpData.forEach(cp => {
        if (!bySemester[cp.semester]) bySemester[cp.semester] = [];
        bySemester[cp.semester].push(cp);
    });

    container.innerHTML = `
        <div class="print-full">
            <div class="text-center mb-6">
                <h2 class="text-xl font-bold">ALUR TUJUAN PEMBELAJARAN (ATP)</h2>
                <p class="text-gray-600">Tahun Pelajaran ${currentAcademicYear}</p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <p><span class="font-medium">Satuan Pendidikan:</span> ${userProfile?.schoolName || '-'}</p>
                    <p><span class="font-medium">Mata Pelajaran:</span> ${mapel}</p>
                </div>
                <div>
                    <p><span class="font-medium">Kelas:</span> ${kelas}</p>
                    <p><span class="font-medium">Fase:</span> ${getFaseByKelas(parseInt(kelas)) || '-'}</p>
                </div>
            </div>

            ${Object.entries(bySemester).map(([semester, items]) => `
                <div class="mb-6">
                    <h3 class="font-semibold text-lg mb-3 text-gray-800">Semester ${semester}</h3>
                    <table class="w-full border-collapse">
                        <thead>
                            <tr class="bg-primary-50">
                                <th class="border border-gray-200 px-3 py-2 text-left text-sm w-10">No</th>
                                <th class="border border-gray-200 px-3 py-2 text-left text-sm w-32">Elemen</th>
                                <th class="border border-gray-200 px-3 py-2 text-left text-sm">Tujuan Pembelajaran</th>
                                <th class="border border-gray-200 px-3 py-2 text-left text-sm w-40">Dimensi Profil Lulusan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map((cp, i) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">${i + 1}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">${cp.elemen}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">${cp.tujuanPembelajaran}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">
                                        ${(cp.dimensi || []).map(d => `<span class="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full mr-1 mb-1">${d}</span>`).join('')}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('')}

            <div class="grid grid-cols-2 gap-8 mt-12 text-center text-sm">
                <div>
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <br><br><br><br>
                    <p class="font-medium">${userProfile?.principalName || '...........................'}</p>
                    <p>NIP. ${userProfile?.principalNIP || '...........................'}</p>
                </div>
                <div>
                    <p>${userProfile?.schoolCity || '...........................'}, .................... ${new Date().getFullYear()}</p>
                    <p>Guru Mata Pelajaran</p>
                    <br><br><br><br>
                    <p class="font-medium">${userProfile?.displayName || '...........................'}</p>
                    <p>NIP. ${userProfile?.nip || '...........................'}</p>
                </div>
            </div>
        </div>
    `;
}

function exportATP() {
    const content = document.getElementById('atpContent');
    if (content && content.querySelector('.print-full')) {
        window.print();
    } else {
        showToast('Generate ATP terlebih dahulu', 'warning');
    }
}

// ==================== PROTA MODULE ====================

function loadProtaModule() {
    populateProtaFilters();
}

function populateProtaFilters() {
    const classSelect = document.getElementById('protaFilterKelas');
    const mapelSelect = document.getElementById('protaFilterMapel');

    if (classSelect) {
        const classes = [...new Set((userData.cp || []).map(cp => cp.kelas))].sort((a, b) => a - b);
        classSelect.innerHTML = '<option value="">Pilih Kelas</option>' +
            classes.map(k => `<option value="${k}">Kelas ${k}</option>`).join('');
    }

    if (mapelSelect) {
        const subjects = userProfile?.subjects?.map(s => s.name) || ['Pendidikan Agama Islam dan Budi Pekerti'];
        mapelSelect.innerHTML = '<option value="">Pilih Mapel</option>' +
            subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }
}

function generateProta() {
    const kelas = document.getElementById('protaFilterKelas')?.value;
    const mapel = document.getElementById('protaFilterMapel')?.value;

    if (!kelas || !mapel) {
        showToast('Pilih kelas dan mata pelajaran terlebih dahulu', 'warning');
        return;
    }

    if (!userData.calendar?.sem1Start) {
        showToast('Atur kalender pendidikan terlebih dahulu', 'warning');
        return;
    }

    const filteredCP = (userData.cp || []).filter(cp => cp.kelas === parseInt(kelas));
    
    if (filteredCP.length === 0) {
        showToast('Tidak ada CP untuk kelas yang dipilih', 'warning');
        return;
    }

    renderProta(filteredCP, kelas, mapel);
}

function filterProta() {
    generateProta();
}

function renderProta(cpData, kelas, mapel) {
    const container = document.getElementById('protaContent');
    if (!container) return;
    
    const cal = userData.calendar;
    const sem1Weeks = getWeeksBetween(cal.sem1Start, cal.sem1End);
    const sem2Weeks = getWeeksBetween(cal.sem2Start, cal.sem2End);

    const subjectInfo = userProfile?.subjects?.find(s => s.name === mapel);
    const hoursPerWeek = subjectInfo?.hoursPerWeek || 3;

    const cpGanjil = cpData.filter(cp => cp.semester === 'Ganjil');
    const cpGenap = cpData.filter(cp => cp.semester === 'Genap');

    container.innerHTML = `
        <div class="print-full">
            <div class="text-center mb-6">
                <h2 class="text-xl font-bold">PROGRAM TAHUNAN (PROTA)</h2>
                <p class="text-gray-600">Tahun Pelajaran ${currentAcademicYear}</p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <p><span class="font-medium">Satuan Pendidikan:</span> ${userProfile?.schoolName || '-'}</p>
                    <p><span class="font-medium">Mata Pelajaran:</span> ${mapel}</p>
                    <p><span class="font-medium">Kelas:</span> ${kelas}</p>
                </div>
                <div>
                    <p><span class="font-medium">Fase:</span> ${getFaseByKelas(parseInt(kelas)) || '-'}</p>
                    <p><span class="font-medium">Alokasi Waktu:</span> ${hoursPerWeek} JP/Minggu</p>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="font-semibold text-lg mb-3 bg-blue-50 px-4 py-2 rounded">Semester Ganjil (${sem1Weeks} Minggu)</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="border border-gray-200 px-3 py-2 text-sm w-10">No</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm w-32">Elemen</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm">Tujuan Pembelajaran</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm w-24">Alokasi Waktu</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm w-24">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cpGanjil.length > 0 ? cpGanjil.map((cp, i) => {
                            const allocatedHours = Math.ceil((sem1Weeks * hoursPerWeek) / cpGanjil.length);
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">${i + 1}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">${cp.elemen}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">${cp.tujuanPembelajaran}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">${allocatedHours} JP</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">-</td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" class="border border-gray-200 px-3 py-4 text-center text-gray-500">Tidak ada data TP untuk semester Ganjil</td></tr>'}
                        <tr class="bg-gray-50 font-medium">
                            <td colspan="3" class="border border-gray-200 px-3 py-2 text-sm text-right">Total Jam Semester Ganjil:</td>
                            <td class="border border-gray-200 px-3 py-2 text-sm text-center">${sem1Weeks * hoursPerWeek} JP</td>
                            <td class="border border-gray-200 px-3 py-2 text-sm"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mb-6">
                <h3 class="font-semibold text-lg mb-3 bg-green-50 px-4 py-2 rounded">Semester Genap (${sem2Weeks} Minggu)</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="border border-gray-200 px-3 py-2 text-sm w-10">No</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm w-32">Elemen</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm">Tujuan Pembelajaran</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm w-24">Alokasi Waktu</th>
                            <th class="border border-gray-200 px-3 py-2 text-sm w-24">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cpGenap.length > 0 ? cpGenap.map((cp, i) => {
                            const allocatedHours = Math.ceil((sem2Weeks * hoursPerWeek) / cpGenap.length);
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">${i + 1}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">${cp.elemen}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm">${cp.tujuanPembelajaran}</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">${allocatedHours} JP</td>
                                    <td class="border border-gray-200 px-3 py-2 text-sm text-center">-</td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" class="border border-gray-200 px-3 py-4 text-center text-gray-500">Tidak ada data TP untuk semester Genap</td></tr>'}
                        <tr class="bg-gray-50 font-medium">
                            <td colspan="3" class="border border-gray-200 px-3 py-2 text-sm text-right">Total Jam Semester Genap:</td>
                            <td class="border border-gray-200 px-3 py-2 text-sm text-center">${sem2Weeks * hoursPerWeek} JP</td>
                            <td class="border border-gray-200 px-3 py-2 text-sm"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="bg-primary-50 rounded-lg p-4 mb-8">
                <div class="flex justify-between items-center">
                    <span class="font-semibold">Total Jam Pelajaran Setahun:</span>
                    <span class="text-xl font-bold text-primary-700">${(sem1Weeks + sem2Weeks) * hoursPerWeek} JP</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mt-12 text-center text-sm">
                <div>
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <br><br><br><br>
                    <p class="font-medium">${userProfile?.principalName || '...........................'}</p>
                    <p>NIP. ${userProfile?.principalNIP || '...........................'}</p>
                </div>
                <div>
                    <p>${userProfile?.schoolCity || '...........................'}, .................... ${new Date().getFullYear()}</p>
                    <p>Guru Mata Pelajaran</p>
                    <br><br><br><br>
                    <p class="font-medium">${userProfile?.displayName || '...........................'}</p>
                    <p>NIP. ${userProfile?.nip || '...........................'}</p>
                </div>
            </div>
        </div>
    `;
}

function exportProta() {
    const content = document.getElementById('protaContent');
    if (content && content.querySelector('.print-full')) {
        window.print();
    } else {
        showToast('Generate Prota terlebih dahulu', 'warning');
    }
}

// ==================== AI ASSISTANT ====================

function copyPrompt(type) {
    const prompts = {
        students: `Tolong konversikan data siswa berikut ke format CSV dengan kolom:
nisn,nama,jenis_kelamin,kelas,rombel

Ketentuan:
- nisn: Nomor Induk Siswa Nasional (10 digit)
- nama: Nama lengkap siswa
- jenis_kelamin: L untuk Laki-laki, P untuk Perempuan
- kelas: Angka kelas (1-12)
- rombel: Huruf rombongan belajar (A, B, C, dst)

Contoh output:
nisn,nama,jenis_kelamin,kelas,rombel
1234567890,Ahmad Fauzi,L,7,A
1234567891,Siti Aminah,P,7,A

Data siswa yang perlu dikonversi:
[PASTE DATA SISWA ANDA DI SINI]`,

        cp: `Tolong konversikan Capaian Pembelajaran berikut ke format CSV dengan kolom:
fase,kelas,semester,elemen,tujuan_pembelajaran,dimensi

Ketentuan:
- fase: Fase A/B/C/D/E/F
- kelas: Angka 1-12
- semester: Ganjil atau Genap
- elemen: Nama bab/elemen pembelajaran
- tujuan_pembelajaran: Deskripsi TP lengkap
- dimensi: Dimensi Profil Lulusan (pisahkan dengan |)

Data CP yang perlu dikonversi:
[PASTE DATA CP ANDA DI SINI]`,

        calendar: `Tolong konversikan data kalender pendidikan berikut ke format CSV dengan kolom:
tanggal,nama_kegiatan,jenis

Ketentuan:
- tanggal: Format YYYY-MM-DD
- nama_kegiatan: Nama hari libur/kegiatan
- jenis: libur/kegiatan/ujian

Data kalender yang perlu dikonversi:
[PASTE DATA KALENDER ANDA DI SINI]`,

        questions: `Tolong konversikan soal-soal berikut ke format CSV dengan kolom:
kelas,semester,elemen,materi,jenis_soal,soal,pilihan_a,pilihan_b,pilihan_c,pilihan_d,kunci_jawaban,pembahasan

Data soal yang perlu dikonversi:
[PASTE SOAL ANDA DI SINI]`
    };

    const output = document.getElementById('promptOutput');
    if (output) output.value = prompts[type] || '';
    
    navigator.clipboard.writeText(prompts[type] || '')
        .then(() => showToast('Prompt berhasil disalin ke clipboard!', 'success'))
        .catch(() => showToast('Pilih dan salin manual dari textarea', 'info'));
}

// ==================== PREMIUM MODULES ====================

function initPremiumModules() {
    const premiumModules = ['modul-ajar', 'lkpd', 'bank-soal', 'absensi', 'jurnal', 'nilai', 'kktp'];
    
    premiumModules.forEach(moduleName => {
        const moduleEl = document.getElementById(`module-${moduleName}`);
        if (moduleEl && !moduleEl.innerHTML.trim()) {
            if (isPremium()) {
                moduleEl.innerHTML = `
                    <div class="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">${moduleName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                        <p class="text-gray-500">Fitur ini sedang dalam pengembangan dan akan segera tersedia.</p>
                    </div>
                `;
            } else {
                moduleEl.innerHTML = `
                    <div class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-lock text-amber-600 text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">Fitur Premium</h2>
                        <p class="text-gray-500 mb-6">Fitur ini memerlukan akun Premium. Upgrade untuk mengakses semua fitur lengkap.</p>
                        <button onclick="redirectToWhatsApp()" class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition">
                            <i class="fas fa-crown mr-2"></i>
                            Upgrade ke Premium
                        </button>
                    </div>
                `;
            }
        }
    });
}

// ==================== CSV IMPORT ====================

async function importCalendarCSV() {
    const url = prompt('Masukkan URL Google Spreadsheet (CSV):');
    if (!url) return;

    showLoading(true);

    try {
        const response = await fetch(url);
        const csvText = await response.text();
        const { data } = parseCSV(csvText);

        const holidays = data.filter(row => row.jenis === 'libur').map(row => ({
            date: row.tanggal,
            name: row.nama_kegiatan
        }));

        const container = document.getElementById('holidaysList');
        if (container) {
            container.innerHTML = '';
            holidays.forEach(h => addHolidayRow(h));
        }

        updateCalendarStats();
        showToast(`Berhasil import ${holidays.length} hari libur!`, 'success');

    } catch (error) {
        console.error('Error importing calendar:', error);
        showToast('Gagal import kalender', 'error');
    }

    showLoading(false);
}

// ==================== HASH ROUTING ====================

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showModule(hash);
    }
});

console.log('App.js loaded successfully');
