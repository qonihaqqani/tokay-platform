import React, { createContext, useContext, useState } from 'react';

const translations = {
  ms: {
    welcome_back: 'Selamat datang kembali',
    dashboard: 'Papan Pemuka',
    risk_assessment: 'Penilaian Risiko',
    emergency_fund: 'Dana Kecemasan',
    alerts: 'Amaran',
    reports: 'Laporan',
    analytics: 'Analitik',
    weather_monitor: 'Pemantau Cuaca',
    e_invoicing: 'E-Invois',
    receipt_upload: 'Muat Naik Resit',
    payments: 'Pembayaran',
    create_invoice: 'Cipta Invois',
    upload_receipt: 'Muat Naik Resit',
    add_to_fund: 'Tambah ke Dana',
    run_risk_assessment: 'Jalankan Penilaian Risiko',
    recent_invoices: 'Invois Terkini',
    active_alerts: 'Amaran Aktif',
    quick_actions: 'Tindakan Pantas',
    manage_invoices: 'Urus Invois',
    view_all: 'Lihat Semua',
    view_all_alerts: 'Lihat Semua Amaran',
    logout: 'Keluar'
  },
  en: {
    welcome_back: 'Welcome back',
    dashboard: 'Dashboard',
    risk_assessment: 'Risk Assessment',
    emergency_fund: 'Emergency Fund',
    alerts: 'Alerts',
    reports: 'Reports',
    analytics: 'Analytics',
    weather_monitor: 'Weather Monitor',
    e_invoicing: 'E-Invoicing',
    receipt_upload: 'Receipt Upload',
    payments: 'Payments',
    create_invoice: 'Create Invoice',
    upload_receipt: 'Upload Receipt',
    add_to_fund: 'Add to Fund',
    run_risk_assessment: 'Run Risk Assessment',
    recent_invoices: 'Recent Invoices',
    active_alerts: 'Active Alerts',
    quick_actions: 'Quick Actions',
    manage_invoices: 'Manage Invoices',
    view_all: 'View All',
    view_all_alerts: 'View All Alerts',
    logout: 'Logout'
  },
  zh: {
    welcome_back: '欢迎回来',
    dashboard: '仪表板',
    risk_assessment: '风险评估',
    emergency_fund: '应急基金',
    alerts: '警报',
    reports: '报告',
    analytics: '分析',
    weather_monitor: '天气监控',
    e_invoicing: '电子发票',
    receipt_upload: '收据上传',
    payments: '付款',
    create_invoice: '创建发票',
    upload_receipt: '上传收据',
    add_to_fund: '添加到基金',
    run_risk_assessment: '运行风险评估',
    recent_invoices: '最近发票',
    active_alerts: '活动警报',
    quick_actions: '快速操作',
    manage_invoices: '管理发票',
    view_all: '查看全部',
    view_all_alerts: '查看所有警报',
    logout: '登出'
  },
  ta: {
    welcome_back: 'வரவேற்பு',
    dashboard: 'டாஷ்போர்டு',
    risk_assessment: 'ஆபத்து மதிப்பீடு',
    emergency_fund: 'அவசர நிதி',
    alerts: 'எச்சரிக்கைகள்',
    reports: 'அறிக்கைகள்',
    analytics: 'பகுப்பாய்வு',
    weather_monitor: 'வானிலை கண்காணிப்பு',
    e_invoicing: 'மின் விலைப்பட்டியல்',
    receipt_upload: 'ரசீது பதிவேற்றம்',
    payments: 'கட்டணங்கள்',
    create_invoice: 'விலைப்பட்டியல் உருவாக்கு',
    upload_receipt: 'ரசீது பதிவேற்று',
    add_to_fund: 'நிதியில் சேர்',
    run_risk_assessment: 'ஆபத்து மதிப்பீட்டை இயக்கு',
    recent_invoices: 'சமீபத்திய விலைப்பட்டியல்கள்',
    active_alerts: 'செயலில் உள்ள எச்சரிக்கைகள்',
    quick_actions: 'விரைவான செயல்கள்',
    manage_invoices: 'விலைப்பட்டியல்களை நிர்வகி',
    view_all: 'அனைத்தையும் காண்',
    view_all_alerts: 'அனைத்து எச்சரிக்கைகளையும் காண்',
    logout: 'வெளியேறு'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ms');

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};