class LanguageService {
  constructor() {
    // Language translations for the Tokay platform
    this.translations = {
      en: {
        // General
        app_name: 'Tokay Resilience Platform',
        welcome: 'Welcome',
        dashboard: 'Dashboard',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        
        // Navigation
        tokay_shield: 'Tokay Shield',
        tokay_pulse: 'Tokay Pulse',
        tokay_alerts: 'Tokay Alerts',
        tokay_reports: 'Tokay Reports',
        
        // Emergency Fund
        emergency_fund: 'Emergency Fund',
        current_balance: 'Current Balance',
        target_amount: 'Target Amount',
        completion_percentage: 'Completion',
        monthly_contribution: 'Monthly Contribution',
        contribute_now: 'Contribute Now',
        withdraw: 'Withdraw',
        transaction_history: 'Transaction History',
        auto_contribution: 'Auto-Contribution',
        
        // Risk Assessment
        risk_assessment: 'Risk Assessment',
        risk_level: 'Risk Level',
        risk_score: 'Risk Score',
        low_risk: 'Low Risk',
        medium_risk: 'Medium Risk',
        high_risk: 'High Risk',
        critical_risk: 'Critical Risk',
        analyze_risk: 'Analyze Risk',
        risk_factors: 'Risk Factors',
        mitigation_recommendations: 'Mitigation Recommendations',
        
        // Alerts
        alerts: 'Alerts',
        active_alerts: 'Active Alerts',
        resolved_alerts: 'Resolved Alerts',
        weather_alert: 'Weather Alert',
        government_alert: 'Government Alert',
        economic_alert: 'Economic Alert',
        operational_alert: 'Operational Alert',
        
        // Reports
        reports: 'Reports',
        resilience_score: 'Resilience Score',
        analytics: 'Analytics',
        benchmarking: 'Benchmarking',
        recommendations: 'Recommendations',
        export_report: 'Export Report',
        
        // Receipts
        receipts: 'Receipts',
        upload_receipt: 'Upload Receipt',
        scan_receipt: 'Scan Receipt',
        receipt_history: 'Receipt History',
        total_amount: 'Total Amount',
        category: 'Category',
        merchant: 'Merchant',
        date: 'Date',
        
        // Business
        business: 'Business',
        business_name: 'Business Name',
        business_type: 'Business Type',
        location: 'Location',
        add_business: 'Add Business',
        
        // Messages
        business_registered_successfully: 'Business registered successfully',
        emergency_fund_created: 'Emergency fund created successfully',
        contribution_added: 'Contribution added successfully',
        withdrawal_processed: 'Withdrawal processed successfully',
        risk_analysis_completed: 'Risk analysis completed',
        receipt_uploaded: 'Receipt uploaded successfully',
        
        // Errors
        error_occurred: 'An error occurred',
        please_try_again: 'Please try again',
        invalid_input: 'Invalid input',
        insufficient_funds: 'Insufficient funds',
        file_upload_failed: 'File upload failed',
        
        // Location-specific messages
        flood_risk_warning: 'Flood risk warning for your area',
        monsoon_season_alert: 'Monsoon season - take necessary precautions',
        haze_alert: 'Haze alert - limit outdoor activities',
        
        // Business types
        restaurant: 'Restaurant',
        retail: 'Retail',
        services: 'Services',
        manufacturing: 'Manufacturing',
        agriculture: 'Agriculture',
        construction: 'Construction',
        
        // Malaysian states
        kuala_lumpur: 'Kuala Lumpur',
        selangor: 'Selangor',
        penang: 'Penang',
        johor: 'Johor',
        kelantan: 'Kelantan',
        terengganu: 'Terengganu',
        pahang: 'Pahang',
        perak: 'Perak',
        kedah: 'Kedah',
        perlis: 'Perlis',
        negeri_sembilan: 'Negeri Sembilan',
        melaka: 'Melaka',
        sabah: 'Sabah',
        sarawak: 'Sarawak'
      },
      
      ms: {
        // Umum
        app_name: 'Platform Ketahanan Tokay',
        welcome: 'Selamat Datang',
        dashboard: 'Papan Pemuka',
        profile: 'Profil',
        settings: 'Tetapan',
        logout: 'Keluar',
        save: 'Simpan',
        cancel: 'Batal',
        delete: 'Padam',
        edit: 'Edit',
        view: 'Lihat',
        back: 'Kembali',
        next: 'Seterusnya',
        previous: 'Sebelumnya',
        submit: 'Hantar',
        loading: 'Memuatkan...',
        error: 'Ralat',
        success: 'Berjaya',
        warning: 'Amaran',
        info: 'Maklumat',
        
        // Navigasi
        tokay_shield: 'Perisai Tokay',
        tokay_pulse: 'Denyut Tokay',
        tokay_alerts: 'Amaran Tokay',
        tokay_reports: 'Laporan Tokay',
        
        // Kecemasan
        emergency_fund: 'Dana Kecemasan',
        current_balance: 'Baki Semasa',
        target_amount: 'Jumlah Sasaran',
        completion_percentage: 'Penyiapan',
        monthly_contribution: 'Sumbangan Bulanan',
        contribute_now: 'Sumbang Sekarang',
        withdraw: 'Wang Keluar',
        transaction_history: 'Sejarah Transaksi',
        auto_contribution: 'Sumbangan Auto',
        
        // Penilaian Risiko
        risk_assessment: 'Penilaian Risiko',
        risk_level: 'Aras Risiko',
        risk_score: 'Skor Risiko',
        low_risk: 'Risiko Rendah',
        medium_risk: 'Risiko Sederhana',
        high_risk: 'Risiko Tinggi',
        critical_risk: 'Risiko Kritikal',
        analyze_risk: 'Analisis Risiko',
        risk_factors: 'Faktor Risiko',
        mitigation_recommendations: 'Cadangan Mitigasi',
        
        // Amaran
        alerts: 'Amaran',
        active_alerts: 'Amaran Aktif',
        resolved_alerts: 'Amaran Diselesaikan',
        weather_alert: 'Amaran Cuaca',
        government_alert: 'Amaran Kerajaan',
        economic_alert: 'Amaran Ekonomi',
        operational_alert: 'Amaran Operasi',
        
        // Laporan
        reports: 'Laporan',
        resilience_score: 'Skor Ketahanan',
        analytics: 'Analitik',
        benchmarking: 'Penanda Aras',
        recommendations: 'Cadangan',
        export_report: 'Eksport Laporan',
        
        // Resit
        receipts: 'Resit',
        upload_receipt: 'Muat Naik Resit',
        scan_receipt: 'Imbas Resit',
        receipt_history: 'Sejarah Resit',
        total_amount: 'Jumlah Total',
        category: 'Kategori',
        merchant: 'Pedagang',
        date: 'Tarikh',
        
        // Perniagaan
        business: 'Perniagaan',
        business_name: 'Nama Perniagaan',
        business_type: 'Jenis Perniagaan',
        location: 'Lokasi',
        add_business: 'Tambah Perniagaan',
        
        // Mesej
        business_registered_successfully: 'Perniagaan didaftarkan dengan berjaya',
        emergency_fund_created: 'Dana kecemasan dicipta dengan berjaya',
        contribution_added: 'Sumbangan ditambah dengan berjaya',
        withdrawal_processed: 'Pengeluaran diproses dengan berjaya',
        risk_analysis_completed: 'Analisis rissi selesai',
        receipt_uploaded: 'Resit dimuat naik dengan berjaya',
        
        // Ralat
        error_occurred: 'Ralat telah berlaku',
        please_try_again: 'Sila cuba lagi',
        invalid_input: 'Input tidak sah',
        insufficient_funds: 'Dana tidak mencukupi',
        file_upload_failed: 'Muat naik fail gagal',
        
        // Mesej spesifik lokasi
        flood_risk_warning: 'Amaran risiko banjir untuk kawasan anda',
        monsoon_season_alert: 'Musim monsun - ambil langkah berjaga-jaga yang perlu',
        haze_alert: 'Amaran jerebu - hadkan aktiviti luar',
        
        // Jenis perniagaan
        restaurant: 'Restoran',
        retail: 'Runcit',
        services: 'Perkhidmatan',
        manufacturing: 'Pembuatan',
        agriculture: 'Pertanian',
        construction: 'Pembinaan',
        
        // Negeri-negeri Malaysia
        kuala_lumpur: 'Kuala Lumpur',
        selangor: 'Selangor',
        penang: 'Pulau Pinang',
        johor: 'Johor',
        kelantan: 'Kelantan',
        terengganu: 'Terengganu',
        pahang: 'Pahang',
        perak: 'Perak',
        kedah: 'Kedah',
        perlis: 'Perlis',
        negeri_sembilan: 'Negeri Sembilan',
        melaka: 'Melaka',
        sabah: 'Sabah',
        sarawak: 'Sarawak'
      }
    };
    
    // Default language
    this.defaultLanguage = 'en';
    
    // Supported languages
    this.supportedLanguages = ['en', 'ms'];
  }

  /**
   * Get translation for a key
   */
  translate(key, language = 'en') {
    const lang = language || this.defaultLanguage;
    const translations = this.translations[lang] || this.translations[this.defaultLanguage];
    
    // Support nested keys with dot notation
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        const englishTranslations = this.translations[this.defaultLanguage];
        value = englishTranslations;
        for (const ek of keys) {
          if (value && typeof value === 'object' && ek in value) {
            value = value[ek];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  /**
   * Get all translations for a language
   */
  getTranslations(language = 'en') {
    const lang = language || this.defaultLanguage;
    return this.translations[lang] || this.translations[this.defaultLanguage];
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(language) {
    return this.supportedLanguages.includes(language);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Format currency based on language
   */
  formatCurrency(amount, language = 'en') {
    const formatter = new Intl.NumberFormat(language === 'ms' ? 'ms-MY' : 'en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  }

  /**
   * Format date based on language
   */
  formatDate(date, language = 'en') {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    const locale = language === 'ms' ? 'ms-MY' : 'en-MY';
    return new Date(date).toLocaleDateString(locale, options);
  }

  /**
   * Get localized business type
   */
  getLocalizedBusinessType(businessType, language = 'en') {
    const key = businessType.toLowerCase().replace(' ', '_');
    return this.translate(key, language);
  }

  /**
   * Get localized state name
   */
  getLocalizedStateName(state, language = 'en') {
    const key = state.toLowerCase().replace(' ', '_');
    return this.translate(key, language);
  }

  /**
   * Get localized risk level
   */
  getLocalizedRiskLevel(riskLevel, language = 'en') {
    const key = riskLevel.toLowerCase().replace(' ', '_');
    return this.translate(key, language);
  }

  /**
   * Get localized alert type
   */
  getLocalizedAlertType(alertType, language = 'en') {
    const key = alertType.toLowerCase().replace(' ', '_');
    return this.translate(key, language);
  }
}

module.exports = new LanguageService();