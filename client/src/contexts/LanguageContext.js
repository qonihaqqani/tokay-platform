import React, { createContext, useContext, useState, useEffect } from 'react';

// Language translations
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.riskMonitor': 'Risk Monitor',
    'nav.emergencyFund': 'Emergency Fund',
    'nav.alerts': 'Alerts',
    'nav.reports': 'Reports',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.close': 'Close',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.phoneNumber': 'Phone Number',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    'auth.loginSuccess': 'Login successful!',
    'auth.loginFailed': 'Login failed',
    'auth.registerSuccess': 'Registration successful!',
    'auth.registerFailed': 'Registration failed',
    'auth.phoneVerification': 'Phone Verification',
    'auth.verificationCode': 'Verification Code',
    'auth.sendCode': 'Send Code',
    'auth.verify': 'Verify',
    'auth.resendCode': 'Resend Code',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.riskLevel': 'Risk Level',
    'dashboard.emergencyFund': 'Emergency Fund',
    'dashboard.recentAlerts': 'Recent Alerts',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.businessHealth': 'Business Health',
    'dashboard.cashRunway': 'Cash Runway',
    'dashboard.days': 'days',
    'dashboard.low': 'Low',
    'dashboard.medium': 'Medium',
    'dashboard.high': 'High',
    'dashboard.critical': 'Critical',
    
    // Risk Monitor
    'riskMonitor.title': 'Risk Monitor',
    'riskMonitor.currentRisks': 'Current Risks',
    'riskMonitor.riskAssessment': 'Risk Assessment',
    'riskMonitor.floodRisk': 'Flood Risk',
    'riskMonitor.supplyChain': 'Supply Chain',
    'riskMonitor.healthEmergency': 'Health Emergency',
    'riskMonitor.economicDownturn': 'Economic Downturn',
    'riskMonitor.mitigation': 'Mitigation',
    'riskMonitor.recommendations': 'Recommendations',
    
    // Emergency Fund
    'emergencyFund.title': 'Emergency Fund',
    'emergencyFund.currentBalance': 'Current Balance',
    'emergencyFund.targetBalance': 'Target Balance',
    'emergencyFund.monthlyContribution': 'Monthly Contribution',
    'emergencyFund.autoContribution': 'Auto Contribution',
    'emergencyFund.withdraw': 'Withdraw',
    'emergencyFund.contribute': 'Contribute',
    'emergencyFund.history': 'Transaction History',
    'emergencyFund.recommendations': 'Fund Recommendations',
    
    // Alerts
    'alerts.title': 'Alerts',
    'alerts.active': 'Active',
    'alerts.read': 'Read',
    'alerts.unread': 'Unread',
    'alerts.all': 'All',
    'alerts.markAsRead': 'Mark as Read',
    'alerts.delete': 'Delete',
    'alerts.noAlerts': 'No alerts',
    'alerts.floodWarning': 'Flood Warning',
    'alerts.weatherAlert': 'Weather Alert',
    'alerts.emergency': 'Emergency',
    
    // Reports
    'reports.title': 'Reports',
    'reports.generate': 'Generate Report',
    'reports.impactAssessment': 'Impact Assessment',
    'reports.resilienceScore': 'Resilience Score',
    'reports.historicalData': 'Historical Data',
    'reports.exportPDF': 'Export PDF',
    'reports.exportExcel': 'Export Excel',
    
    // Business Setup
    'businessSetup.title': 'Business Setup',
    'businessSetup.businessName': 'Business Name',
    'businessSetup.businessType': 'Business Type',
    'businessSetup.businessSize': 'Business Size',
    'businessSetup.address': 'Address',
    'businessSetup.city': 'City',
    'businessSetup.state': 'State',
    'businessSetup.postalCode': 'Postal Code',
    'businessSetup.phoneNumber': 'Business Phone',
    'businessSetup.email': 'Business Email',
    'businessSetup.monthlyRevenue': 'Monthly Revenue Range',
    'businessSetup.employees': 'Number of Employees',
    'businessSetup.description': 'Business Description',
    'businessSetup.save': 'Save Business',
    
    // Risk Levels
    'risk.low': 'Low Risk',
    'risk.medium': 'Medium Risk',
    'risk.high': 'High Risk',
    'risk.critical': 'Critical Risk',
    
    // Business Types
    'businessType.retail': 'Retail',
    'businessType.foodBeverage': 'Food & Beverage',
    'businessType.services': 'Services',
    'businessType.manufacturing': 'Manufacturing',
    'businessType.agriculture': 'Agriculture',
    'businessType.transportation': 'Transportation',
    'businessType.construction': 'Construction',
    'businessType.technology': 'Technology',
    'businessType.other': 'Other',
    
    // Malaysian States
    'state.johor': 'Johor',
    'state.kedah': 'Kedah',
    'state.kelantan': 'Kelantan',
    'state.melaka': 'Melaka',
    'state.negeriSembilan': 'Negeri Sembilan',
    'state.pahang': 'Pahang',
    'state.perak': 'Perak',
    'state.perlis': 'Perlis',
    'state.pulauPinang': 'Pulau Pinang',
    'state.sabah': 'Sabah',
    'state.sarawak': 'Sarawak',
    'state.selangor': 'Selangor',
    'state.terengganu': 'Terengganu',
    'state.kualaLumpur': 'Kuala Lumpur',
    'state.labuan': 'Labuan',
    'state.putrajaya': 'Putrajaya',
  },
  
  ms: {
    // Navigation
    'nav.home': 'Utama',
    'nav.dashboard': 'Papan Pemuka',
    'nav.riskMonitor': 'Pemantau Risiko',
    'nav.emergencyFund': 'Dana Kecemasan',
    'nav.alerts': 'Amaran',
    'nav.reports': 'Laporan',
    'nav.profile': 'Profil',
    'nav.login': 'Log Masuk',
    'nav.register': 'Daftar',
    'nav.logout': 'Log Keluar',
    
    // Common
    'common.loading': 'Memuatkan...',
    'common.error': 'Ralat',
    'common.success': 'Berjaya',
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.delete': 'Padam',
    'common.edit': 'Edit',
    'common.view': 'Lihat',
    'common.search': 'Cari',
    'common.filter': 'Tapis',
    'common.export': 'Eksport',
    'common.import': 'Import',
    'common.submit': 'Hantar',
    'common.confirm': 'Sahkan',
    'common.yes': 'Ya',
    'common.no': 'Tidak',
    'common.ok': 'OK',
    'common.close': 'Tutup',
    
    // Authentication
    'auth.login': 'Log Masuk',
    'auth.register': 'Daftar',
    'auth.phoneNumber': 'Nombor Telefon',
    'auth.password': 'Kata Laluan',
    'auth.fullName': 'Nama Penuh',
    'auth.email': 'Emel',
    'auth.forgotPassword': 'Lupa Kata Laluan?',
    'auth.rememberMe': 'Ingat Saya',
    'auth.loginSuccess': 'Log masuk berjaya!',
    'auth.loginFailed': 'Log masuk gagal',
    'auth.registerSuccess': 'Pendaftaran berjaya!',
    'auth.registerFailed': 'Pendaftaran gagal',
    'auth.phoneVerification': 'Pengesahan Telefon',
    'auth.verificationCode': 'Kod Pengesahan',
    'auth.sendCode': 'Hantar Kod',
    'auth.verify': 'Sahkan',
    'auth.resendCode': 'Hantar Semula Kod',
    
    // Dashboard
    'dashboard.welcome': 'Selamat kembali',
    'dashboard.riskLevel': 'Tahap Risiko',
    'dashboard.emergencyFund': 'Dana Kecemasan',
    'dashboard.recentAlerts': 'Amaran Terkini',
    'dashboard.quickActions': 'Tindakan Pantas',
    'dashboard.businessHealth': 'Kesihatan Perniagaan',
    'dashboard.cashRunway': 'Tempoh Tunai',
    'dashboard.days': 'hari',
    'dashboard.low': 'Rendah',
    'dashboard.medium': 'Sederhana',
    'dashboard.high': 'Tinggi',
    'dashboard.critical': 'Kritikal',
    
    // Risk Monitor
    'riskMonitor.title': 'Pemantau Risiko',
    'riskMonitor.currentRisks': 'Risiko Semasa',
    'riskMonitor.riskAssessment': 'Penilaian Risiko',
    'riskMonitor.floodRisk': 'Risiko Banjir',
    'riskMonitor.supplyChain': 'Rantaian Bekalan',
    'riskMonitor.healthEmergency': 'Kecemasan Kesihatan',
    'riskMonitor.economicDownturn': 'Kemelesetan Ekonomi',
    'riskMonitor.mitigation': 'Pengurangan',
    'riskMonitor.recommendations': 'Cadangan',
    
    // Emergency Fund
    'emergencyFund.title': 'Dana Kecemasan',
    'emergencyFund.currentBalance': 'Baki Semasa',
    'emergencyFund.targetBalance': 'Baki Sasaran',
    'emergencyFund.monthlyContribution': 'Caruman Bulanan',
    'emergencyFund.autoContribution': 'Caruman Auto',
    'emergencyFund.withdraw': 'Wang Keluar',
    'emergencyFund.contribute': 'Carum',
    'emergencyFund.history': 'Sejarah Transaksi',
    'emergencyFund.recommendations': 'Cadangan Dana',
    
    // Alerts
    'alerts.title': 'Amaran',
    'alerts.active': 'Aktif',
    'alerts.read': 'Dibaca',
    'alerts.unread': 'Belum Dibaca',
    'alerts.all': 'Semua',
    'alerts.markAsRead': 'Tandai Dibaca',
    'alerts.delete': 'Padam',
    'alerts.noAlerts': 'Tiada amaran',
    'alerts.floodWarning': 'Amaran Banjir',
    'alerts.weatherAlert': 'Amaran Cuaca',
    'alerts.emergency': 'Kecemasan',
    
    // Reports
    'reports.title': 'Laporan',
    'reports.generate': 'Jana Laporan',
    'reports.impactAssessment': 'Penilaian Impak',
    'reports.resilienceScore': 'Skor Daya Tahan',
    'reports.historicalData': 'Data Sejarah',
    'reports.exportPDF': 'Eksport PDF',
    'reports.exportExcel': 'Eksport Excel',
    
    // Business Setup
    'businessSetup.title': 'Tetapan Perniagaan',
    'businessSetup.businessName': 'Nama Perniagaan',
    'businessSetup.businessType': 'Jenis Perniagaan',
    'businessSetup.businessSize': 'Saiz Perniagaan',
    'businessSetup.address': 'Alamat',
    'businessSetup.city': 'Bandar',
    'businessSetup.state': 'Negeri',
    'businessSetup.postalCode': 'Poskod',
    'businessSetup.phoneNumber': 'Telefon Perniagaan',
    'businessSetup.email': 'Emel Perniagaan',
    'businessSetup.monthlyRevenue': 'Julat Hasil Bulanan',
    'businessSetup.employees': 'Bilangan Pekerja',
    'businessSetup.description': 'Penerangan Perniagaan',
    'businessSetup.save': 'Simpan Perniagaan',
    
    // Risk Levels
    'risk.low': 'Risiko Rendah',
    'risk.medium': 'Risiko Sederhana',
    'risk.high': 'Risiko Tinggi',
    'risk.critical': 'Risiko Kritikal',
    
    // Business Types
    'businessType.retail': 'Runcit',
    'businessType.foodBeverage': 'Makanan & Minuman',
    'businessType.services': 'Perkhidmatan',
    'businessType.manufacturing': 'Pembuatan',
    'businessType.agriculture': 'Pertanian',
    'businessType.transportation': 'Pengangkutan',
    'businessType.construction': 'Pembinaan',
    'businessType.technology': 'Teknologi',
    'businessType.other': 'Lain-lain',
    
    // Malaysian States
    'state.johor': 'Johor',
    'state.kedah': 'Kedah',
    'state.kelantan': 'Kelantan',
    'state.melaka': 'Melaka',
    'state.negeriSembilan': 'Negeri Sembilan',
    'state.pahang': 'Pahang',
    'state.perak': 'Perak',
    'state.perlis': 'Perlis',
    'state.pulauPinang': 'Pulau Pinang',
    'state.sabah': 'Sabah',
    'state.sarawak': 'Sarawak',
    'state.selangor': 'Selangor',
    'state.terengganu': 'Terengganu',
    'state.kualaLumpur': 'Kuala Lumpur',
    'state.labuan': 'Labuan',
    'state.putrajaya': 'Putrajaya',
  },
  
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.dashboard': '仪表板',
    'nav.riskMonitor': '风险监控',
    'nav.emergencyFund': '应急基金',
    'nav.alerts': '警报',
    'nav.reports': '报告',
    'nav.profile': '个人资料',
    'nav.login': '登录',
    'nav.register': '注册',
    'nav.logout': '登出',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.export': '导出',
    'common.import': '导入',
    'common.submit': '提交',
    'common.confirm': '确认',
    'common.yes': '是',
    'common.no': '否',
    'common.ok': '确定',
    'common.close': '关闭',
    
    // Authentication
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.phoneNumber': '电话号码',
    'auth.password': '密码',
    'auth.fullName': '全名',
    'auth.email': '电子邮件',
    'auth.forgotPassword': '忘记密码？',
    'auth.rememberMe': '记住我',
    'auth.loginSuccess': '登录成功！',
    'auth.loginFailed': '登录失败',
    'auth.registerSuccess': '注册成功！',
    'auth.registerFailed': '注册失败',
    'auth.phoneVerification': '电话验证',
    'auth.verificationCode': '验证码',
    'auth.sendCode': '发送验证码',
    'auth.verify': '验证',
    'auth.resendCode': '重新发送验证码',
    
    // Dashboard
    'dashboard.welcome': '欢迎回来',
    'dashboard.riskLevel': '风险等级',
    'dashboard.emergencyFund': '应急基金',
    'dashboard.recentAlerts': '最近警报',
    'dashboard.quickActions': '快速操作',
    'dashboard.businessHealth': '业务健康状况',
    'dashboard.cashRunway': '现金跑道',
    'dashboard.days': '天',
    'dashboard.low': '低',
    'dashboard.medium': '中',
    'dashboard.high': '高',
    'dashboard.critical': '严重',
    
    // Risk Monitor
    'riskMonitor.title': '风险监控',
    'riskMonitor.currentRisks': '当前风险',
    'riskMonitor.riskAssessment': '风险评估',
    'riskMonitor.floodRisk': '洪水风险',
    'riskMonitor.supplyChain': '供应链',
    'riskMonitor.healthEmergency': '健康紧急情况',
    'riskMonitor.economicDownturn': '经济衰退',
    'riskMonitor.mitigation': '缓解',
    'riskMonitor.recommendations': '建议',
    
    // Emergency Fund
    'emergencyFund.title': '应急基金',
    'emergencyFund.currentBalance': '当前余额',
    'emergencyFund.targetBalance': '目标余额',
    'emergencyFund.monthlyContribution': '月度贡献',
    'emergencyFund.autoContribution': '自动贡献',
    'emergencyFund.withdraw': '提取',
    'emergencyFund.contribute': '贡献',
    'emergencyFund.history': '交易历史',
    'emergencyFund.recommendations': '基金建议',
    
    // Alerts
    'alerts.title': '警报',
    'alerts.active': '活跃',
    'alerts.read': '已读',
    'alerts.unread': '未读',
    'alerts.all': '全部',
    'alerts.markAsRead': '标记为已读',
    'alerts.delete': '删除',
    'alerts.noAlerts': '无警报',
    'alerts.floodWarning': '洪水警告',
    'alerts.weatherAlert': '天气警报',
    'alerts.emergency': '紧急情况',
    
    // Reports
    'reports.title': '报告',
    'reports.generate': '生成报告',
    'reports.impactAssessment': '影响评估',
    'reports.resilienceScore': '韧性评分',
    'reports.historicalData': '历史数据',
    'reports.exportPDF': '导出PDF',
    'reports.exportExcel': '导出Excel',
    
    // Business Setup
    'businessSetup.title': '业务设置',
    'businessSetup.businessName': '企业名称',
    'businessSetup.businessType': '业务类型',
    'businessSetup.businessSize': '企业规模',
    'businessSetup.address': '地址',
    'businessSetup.city': '城市',
    'businessSetup.state': '州',
    'businessSetup.postalCode': '邮政编码',
    'businessSetup.phoneNumber': '企业电话',
    'businessSetup.email': '企业电子邮件',
    'businessSetup.monthlyRevenue': '月收入范围',
    'businessSetup.employees': '员工人数',
    'businessSetup.description': '业务描述',
    'businessSetup.save': '保存企业',
    
    // Risk Levels
    'risk.low': '低风险',
    'risk.medium': '中等风险',
    'risk.high': '高风险',
    'risk.critical': '严重风险',
    
    // Business Types
    'businessType.retail': '零售',
    'businessType.foodBeverage': '餐饮',
    'businessType.services': '服务',
    'businessType.manufacturing': '制造',
    'businessType.agriculture': '农业',
    'businessType.transportation': '运输',
    'businessType.construction': '建筑',
    'businessType.technology': '技术',
    'businessType.other': '其他',
    
    // Malaysian States
    'state.johor': '柔佛',
    'state.kedah': '吉打',
    'state.kelantan': '吉兰丹',
    'state.melaka': '马六甲',
    'state.negeriSembilan': '森美兰',
    'state.pahang': '彭亨',
    'state.perak': '霹雳',
    'state.perlis': '玻璃市',
    'state.pulauPinang': '槟城',
    'state.sabah': '沙巴',
    'state.sarawak': '砂拉越',
    'state.selangor': '雪兰莪',
    'state.terengganu': '登嘉楼',
    'state.kualaLumpur': '吉隆坡',
    'state.labuan': '纳闽',
    'state.putrajaya': '布城',
  },
  
  ta: {
    // Navigation
    'nav.home': 'முகப்பு',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.riskMonitor': 'ஆபத்து கண்காணிப்பு',
    'nav.emergencyFund': 'அவசர நிதி',
    'nav.alerts': 'எச்சரிக்கைகள்',
    'nav.reports': 'அறிக்கைகள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.login': 'உள்நுழைக',
    'nav.register': 'பதிவுசெய்க',
    'nav.logout': 'வெளியேறுக',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.cancel': 'ரத்துசெய்க',
    'common.save': 'சேமிக்க',
    'common.delete': 'நீக்குக',
    'common.edit': 'திருத்துக',
    'common.view': 'பார்க்க',
    'common.search': 'தேடுக',
    'common.filter': 'வடிகட்டுக',
    'common.export': 'ஏற்றுமதி',
    'common.import': 'இறக்குமதி',
    'common.submit': 'சமர்ப்பிக்க',
    'common.confirm': 'உறுதிப்படுத்துக',
    'common.yes': 'ஆம்',
    'common.no': 'இல்லை',
    'common.ok': 'சரி',
    'common.close': 'மூடுக',
    
    // Authentication
    'auth.login': 'உள்நுழைக',
    'auth.register': 'பதிவுசெய்க',
    'auth.phoneNumber': 'தொலைபேசி எண்',
    'auth.password': 'கடவுச்சொல்',
    'auth.fullName': 'முழு பெயர்',
    'auth.email': 'மின்னஞ்சல்',
    'auth.forgotPassword': 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    'auth.rememberMe': 'என்னை நினைவில் வைக்க',
    'auth.loginSuccess': 'உள்நுழைவு வெற்றிகரமாக!',
    'auth.loginFailed': 'உள்நுழைவு தோல்வியடைந்தது',
    'auth.registerSuccess': 'பதிவு வெற்றிகரமாக!',
    'auth.registerFailed': 'பதிவு தோல்வியடைந்தது',
    'auth.phoneVerification': 'தொலைபேசி சரிபார்ப்பு',
    'auth.verificationCode': 'சரிபார்ப்பு குறியீடு',
    'auth.sendCode': 'குறியீட்டை அனுப்புக',
    'auth.verify': 'சரிபார்க்க',
    'auth.resendCode': 'குறியீட்டை மீண்டும் அனுப்புக',
    
    // Dashboard
    'dashboard.welcome': 'மீண்டும் வரவேற்கிறோம்',
    'dashboard.riskLevel': 'ஆபத்து நிலை',
    'dashboard.emergencyFund': 'அவசர நிதி',
    'dashboard.recentAlerts': 'சமீபத்திய எச்சரிக்கைகள்',
    'dashboard.quickActions': 'விரைவான செயல்கள்',
    'dashboard.businessHealth': 'வணிக ஆரோக்கியம்',
    'dashboard.cashRunway': 'பண ஓடுபாதை',
    'dashboard.days': 'நாட்கள்',
    'dashboard.low': 'குறைவு',
    'dashboard.medium': 'நடுத்தரம்',
    'dashboard.high': 'அதிகம்',
    'dashboard.critical': 'மிகவும் அவசரம்',
    
    // Risk Monitor
    'riskMonitor.title': 'ஆபத்து கண்காணிப்பு',
    'riskMonitor.currentRisks': 'தற்போதைய ஆபத்துகள்',
    'riskMonitor.riskAssessment': 'ஆபத்து மதிப்பீடு',
    'riskMonitor.floodRisk': 'வெள்ளப் பெருக்கு ஆபத்து',
    'riskMonitor.supplyChain': 'வழங்கல் சங்கிலி',
    'riskMonitor.healthEmergency': 'சுகாதார அவசரநிலை',
    'riskMonitor.economicDownturn': 'பொருளாதார சரிவு',
    'riskMonitor.mitigation': 'தணிப்பு',
    'riskMonitor.recommendations': 'பரிந்துரைகள்',
    
    // Emergency Fund
    'emergencyFund.title': 'அவசர நிதி',
    'emergencyFund.currentBalance': 'தற்போதைய இருப்பு',
    'emergencyFund.targetBalance': 'இலக்கு இருப்பு',
    'emergencyFund.monthlyContribution': 'மாதாந்திர பங்களிப்பு',
    'emergencyFund.autoContribution': 'தானியங்கி பங்களிப்பு',
    'emergencyFund.withdraw': 'எடுக்க',
    'emergencyFund.contribute': 'பங்களிக்க',
    'emergencyFund.history': 'பரிவர்த்தனை வரலாறு',
    'emergencyFund.recommendations': 'நிதி பரிந்துரைகள்',
    
    // Alerts
    'alerts.title': 'எச்சரிக்கைகள்',
    'alerts.active': 'செயலில்',
    'alerts.read': 'படித்தது',
    'alerts.unread': 'படிக்காதது',
    'alerts.all': 'அனைத்தும்',
    'alerts.markAsRead': 'படித்ததாக குறிக்க',
    'alerts.delete': 'நீக்குக',
    'alerts.noAlerts': 'எச்சரிக்கைகள் இல்லை',
    'alerts.floodWarning': 'வெள்ளப் பெருக்கு எச்சரிக்கை',
    'alerts.weatherAlert': 'வானிலை எச்சரிக்கை',
    'alerts.emergency': 'அவசரநிலை',
    
    // Reports
    'reports.title': 'அறிக்கைகள்',
    'reports.generate': 'அறிக்கையை உருவாக்குக',
    'reports.impactAssessment': 'தாக்க மதிப்பீடு',
    'reports.resilienceScore': 'எதிர்த்திறன் மதிப்பெண்',
    'reports.historicalData': 'வரலாற்று தரவு',
    'reports.exportPDF': 'PDF ஏற்றுமதி',
    'reports.exportExcel': 'Excel ஏற்றுமதி',
    
    // Business Setup
    'businessSetup.title': 'வணிக அமைப்பு',
    'businessSetup.businessName': 'வணிக பெயர்',
    'businessSetup.businessType': 'வணிக வகை',
    'businessSetup.businessSize': 'வணிக அளவு',
    'businessSetup.address': 'முகவரி',
    'businessSetup.city': 'நகரம்',
    'businessSetup.state': 'மாநிலம்',
    'businessSetup.postalCode': 'அஞ்சல் குறியீடு',
    'businessSetup.phoneNumber': 'வணிக தொலைபேசி',
    'businessSetup.email': 'வணிக மின்னஞ்சல்',
    'businessSetup.monthlyRevenue': 'மாதாந்திர வருமான வரம்பு',
    'businessSetup.employees': 'ஊழியர்கள் எண்ணிக்கை',
    'businessSetup.description': 'வணிக விளக்கம்',
    'businessSetup.save': 'வணிகத்தை சேமிக்க',
    
    // Risk Levels
    'risk.low': 'குறைந்த ஆபத்து',
    'risk.medium': 'நடுத்தர ஆபத்து',
    'risk.high': 'அதிக ஆபத்து',
    'risk.critical': 'மிகவும் அவசரமான ஆபத்து',
    
    // Business Types
    'businessType.retail': 'சில்லறை வணிகம்',
    'businessType.foodBeverage': 'உணவு & பானம்',
    'businessType.services': 'சேவைகள்',
    'businessType.manufacturing': 'உற்பத்தி',
    'businessType.agriculture': 'வேளாண்மை',
    'businessType.transportation': 'போக்குவரத்து',
    'businessType.construction': 'கட்டுமானம்',
    'businessType.technology': 'தொழில்நுட்பம்',
    'businessType.other': 'மற்றவை',
    
    // Malaysian States
    'state.johor': 'ஜொகூர்',
    'state.kedah': 'கெடா',
    'state.kelantan': 'கிளாந்தான்',
    'state.melaka': 'மலாக்கா',
    'state.negeriSembilan': 'நெகிரி செம்பிலான்',
    'state.pahang': 'பகாங்',
    'state.perak': 'பேராக்',
    'state.perlis': 'பெர்லிஸ்',
    'state.pulauPinang': 'பினாங்கு',
    'state.sabah': 'சபா',
    'state.sarawak': 'சரவாக்',
    'state.selangor': 'சிலாங்கூர்',
    'state.terengganu': 'திரெங்கானு',
    'state.kualaLumpur': 'கோலாலம்பூர்',
    'state.labuan': 'லபுவான்',
    'state.putrajaya': 'புத்ராஜாயா',
  }
};

// Create context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Malay
    const savedLanguage = localStorage.getItem('tokay_language');
    return savedLanguage || 'ms';
  });

  // Change language function
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('tokay_language', lang);
    }
  };

  // Translation function
  const t = (key) => {
    return translations[language][key] || key;
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return [
      { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
    ];
  };

  // Get current language info
  const getCurrentLanguage = () => {
    const languages = getAvailableLanguages();
    return languages.find(lang => lang.code === language) || languages[0];
  };

  const value = {
    language,
    changeLanguage,
    t,
    getAvailableLanguages,
    getCurrentLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;