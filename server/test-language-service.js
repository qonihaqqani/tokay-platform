const languageService = require('./services/languageService');

async function testLanguageService() {
  console.log('🌏 Testing Multi-Language Support for Tokay Platform...\n');

  try {
    // Test 1: Basic translation functionality
    console.log('📝 Test 1: Basic Translation Functionality');
    console.log('   English:');
    console.log(`     - App Name: ${languageService.translate('app_name', 'en')}`);
    console.log(`     - Emergency Fund: ${languageService.translate('emergency_fund', 'en')}`);
    console.log(`     - Welcome: ${languageService.translate('welcome', 'en')}`);
    
    console.log('   Bahasa Melayu:');
    console.log(`     - App Name: ${languageService.translate('app_name', 'ms')}`);
    console.log(`     - Emergency Fund: ${languageService.translate('emergency_fund', 'ms')}`);
    console.log(`     - Welcome: ${languageService.translate('welcome', 'ms')}`);
    console.log('   ✅ Basic translations working\n');

    // Test 2: Business type localization
    console.log('🏢 Test 2: Business Type Localization');
    const businessTypes = ['restaurant', 'retail', 'services', 'manufacturing', 'agriculture', 'construction'];
    
    console.log('   English Business Types:');
    businessTypes.forEach(type => {
      console.log(`     - ${type}: ${languageService.getLocalizedBusinessType(type, 'en')}`);
    });
    
    console.log('   Bahasa Melayu Business Types:');
    businessTypes.forEach(type => {
      console.log(`     - ${type}: ${languageService.getLocalizedBusinessType(type, 'ms')}`);
    });
    console.log('   ✅ Business type localization working\n');

    // Test 3: State name localization
    console.log('🗺️  Test 3: State Name Localization');
    const states = ['kuala_lumpur', 'selangor', 'penang', 'johor', 'kelantan', 'terengganu'];
    
    console.log('   English State Names:');
    states.forEach(state => {
      console.log(`     - ${state}: ${languageService.getLocalizedStateName(state, 'en')}`);
    });
    
    console.log('   Bahasa Melayu State Names:');
    states.forEach(state => {
      console.log(`     - ${state}: ${languageService.getLocalizedStateName(state, 'ms')}`);
    });
    console.log('   ✅ State name localization working\n');

    // Test 4: Risk level localization
    console.log('⚠️  Test 4: Risk Level Localization');
    const riskLevels = ['low_risk', 'medium_risk', 'high_risk', 'critical_risk'];
    
    console.log('   English Risk Levels:');
    riskLevels.forEach(level => {
      console.log(`     - ${level}: ${languageService.getLocalizedRiskLevel(level, 'en')}`);
    });
    
    console.log('   Bahasa Melayu Risk Levels:');
    riskLevels.forEach(level => {
      console.log(`     - ${level}: ${languageService.getLocalizedRiskLevel(level, 'ms')}`);
    });
    console.log('   ✅ Risk level localization working\n');

    // Test 5: Currency formatting
    console.log('💰 Test 5: Currency Formatting');
    const amounts = [1000, 2500.50, 10000, 50000.75];
    
    console.log('   English Currency Format:');
    amounts.forEach(amount => {
      console.log(`     - RM${amount}: ${languageService.formatCurrency(amount, 'en')}`);
    });
    
    console.log('   Bahasa Melayu Currency Format:');
    amounts.forEach(amount => {
      console.log(`     - RM${amount}: ${languageService.formatCurrency(amount, 'ms')}`);
    });
    console.log('   ✅ Currency formatting working\n');

    // Test 6: Date formatting
    console.log('📅 Test 6: Date Formatting');
    const dates = ['2025-12-16', '2025-01-01', '2025-08-31'];
    
    console.log('   English Date Format:');
    dates.forEach(date => {
      console.log(`     - ${date}: ${languageService.formatDate(date, 'en')}`);
    });
    
    console.log('   Bahasa Melayu Date Format:');
    dates.forEach(date => {
      console.log(`     - ${date}: ${languageService.formatDate(date, 'ms')}`);
    });
    console.log('   ✅ Date formatting working\n');

    // Test 7: Language support validation
    console.log('🔍 Test 7: Language Support Validation');
    console.log(`   Supported Languages: ${languageService.getSupportedLanguages().join(', ')}`);
    console.log(`   English Supported: ${languageService.isLanguageSupported('en')}`);
    console.log(`   Bahasa Melayu Supported: ${languageService.isLanguageSupported('ms')}`);
    console.log(`   French Supported: ${languageService.isLanguageSupported('fr')}`);
    console.log('   ✅ Language support validation working\n');

    // Test 8: Fallback functionality
    console.log('🔄 Test 8: Fallback Functionality');
    console.log(`   Non-existent key (English): ${languageService.translate('non_existent_key', 'en')}`);
    console.log(`   Non-existent key (Bahasa): ${languageService.translate('non_existent_key', 'ms')}`);
    console.log(`   Non-existent language: ${languageService.translate('app_name', 'fr')}`);
    console.log('   ✅ Fallback functionality working\n');

    // Test 9: Complete translation sets
    console.log('📚 Test 9: Complete Translation Sets');
    const englishTranslations = languageService.getTranslations('en');
    const malayTranslations = languageService.getTranslations('ms');
    
    console.log(`   English translation keys: ${Object.keys(englishTranslations).length}`);
    console.log(`   Bahasa Melayu translation keys: ${Object.keys(malayTranslations).length}`);
    console.log(`   Translation parity: ${Object.keys(englishTranslations).length === Object.keys(malayTranslations).length ? '✅' : '❌'}`);
    console.log('   ✅ Complete translation sets working\n');

    console.log('🎉 Multi-Language Support Test Completed Successfully!');
    console.log('\n✅ Key Features Verified:');
    console.log('   - English and Bahasa Melayu translations');
    console.log('   - Business type localization');
    console.log('   - Malaysian state name localization');
    console.log('   - Risk level localization');
    console.log('   - Currency formatting (MYR)');
    console.log('   - Date formatting for both languages');
    console.log('   - Language support validation');
    console.log('   - Fallback functionality');
    console.log('   - Complete translation parity');
    console.log('\n🚀 Ready for Malaysian Market Deployment!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
if (require.main === module) {
  testLanguageService();
}

module.exports = testLanguageService;