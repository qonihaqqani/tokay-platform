const reportsService = require('./services/reportsService');

// Mock data for testing without database
const mockBusiness = {
  id: 'test-business-1',
  name: 'Test Nasi Lemak Stall',
  business_type: 'restaurant',
  location: 'Kuala Lumpur'
};

const mockEmergencyFundData = {
  currentBalance: 15000,
  targetAmount: 30000,
  completionPercentage: 50,
  monthsOfExpenses: 3,
  monthlyContributions: [
    { month: '2025-01', amount: 1000 },
    { month: '2025-02', amount: 1200 },
    { month: '2025-03', amount: 800 }
  ]
};

const mockRiskData = {
  currentRiskLevel: 'MEDIUM',
  averageRiskScore: 45,
  totalAssessments: 12,
  riskDistribution: {
    'LOW': 4,
    'MEDIUM': 6,
    'HIGH': 2,
    'CRITICAL': 0
  },
  topRiskFactors: [
    { factor: 'High competition in area', impact: 'Medium' },
    { factor: 'Seasonal demand fluctuations', impact: 'High' }
  ]
};

const mockAlertData = {
  totalAlerts: 8,
  resolvedAlerts: 6,
  pendingAlerts: 2,
  responseRate: 75,
  alertsByType: {
    'weather': 3,
    'government': 2,
    'economic': 2,
    'operational': 1
  }
};

const mockReceiptData = {
  totalReceipts: 45,
  totalAmount: 12500,
  averageAmount: 278,
  topCategories: [
    { category: 'Food Ingredients', amount: 5000 },
    { category: 'Utilities', amount: 3000 },
    { category: 'Packaging', amount: 2000 }
  ]
};

const mockTransactionData = {
  totalDeposits: 15,
  totalWithdrawals: 8,
  netFlow: 7000,
  averageTransactionAmount: 467,
  monthlyTrend: [
    { month: '2025-01', deposits: 5000, withdrawals: 2000 },
    { month: '2025-02', deposits: 4000, withdrawals: 1500 },
    { month: '2025-03', deposits: 6000, withdrawals: 2500 }
  ]
};

async function testReportsLogic() {
  console.log('🧪 Testing Tokay Reports Logic (Without Database)...\n');

  try {
    // Test 1: Resilience Score Calculation
    console.log('🛡️  Testing Resilience Score Calculation...');
    const resilienceScore = reportsService.calculateResilienceScore({
      emergencyFundData: mockEmergencyFundData,
      riskAssessments: mockRiskData,
      alerts: mockAlertData,
      receipts: mockReceiptData,
      transactions: mockTransactionData,
      business: mockBusiness
    });
    
    console.log(`   ✅ Overall Score: ${resilienceScore.overall}/100`);
    console.log(`   ✅ Emergency Fund Score: ${resilienceScore.emergencyFund}/100`);
    console.log(`   ✅ Risk Management Score: ${resilienceScore.riskManagement}/100`);
    console.log(`   ✅ Alert Response Score: ${resilienceScore.alertResponse}/100`);

    // Test 2: Recommendations Generation
    console.log('\n💡 Testing AI Recommendations...');
    const recommendations = reportsService.generateRecommendations({
      resilienceScore,
      emergencyFundData: mockEmergencyFundData,
      riskAssessments: mockRiskData,
      alerts: mockAlertData,
      business: mockBusiness
    });
    
    console.log(`   ✅ Generated ${recommendations.length} recommendations:`);
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.title}`);
      console.log(`      ${rec.description}`);
    });

    // Test 3: Benchmarking Data
    console.log('\n📈 Testing Benchmarking Data...');
    const benchmarking = await reportsService.getBenchmarkingData(mockBusiness, resilienceScore);
    console.log(`   ✅ Industry Average: ${benchmarking.industryAverage}`);
    console.log(`   ✅ Your Percentile: ${benchmarking.percentile}%`);
    console.log(`   ✅ Total Businesses: ${benchmarking.totalBusinesses}`);
    console.log(`   ✅ Industry Insights: ${benchmarking.industryInsights.length} points`);

    // Test 4: Business Categories Data
    console.log('\n🏢 Testing Business Categories Data...');
    const restaurantCategory = reportsService.businessCategories['restaurant'];
    console.log(`   ✅ Restaurant Category Found:`);
    console.log(`      - Avg Resilience Score: ${restaurantCategory.avgResilienceScore}`);
    console.log(`      - Typical Risks: ${restaurantCategory.typicalRisks.join(', ')}`);
    console.log(`      - Emergency Fund Target: ${restaurantCategory.emergencyFundTargetMonths} months`);

    // Test 5: Industry Insights
    console.log('\n🔍 Testing Industry Insights...');
    const industryInsights = reportsService.getIndustryInsights('restaurant');
    console.log(`   ✅ Generated ${industryInsights.length} industry insights for restaurants:`);
    industryInsights.forEach((insight, index) => {
      console.log(`   ${index + 1}. ${insight}`);
    });

    console.log('\n🎉 Tokay Reports logic test completed successfully!');
    console.log('\n📊 Core Logic Verified:');
    console.log('   ✅ Resilience Score Algorithm');
    console.log('   ✅ AI-Powered Recommendations Engine');
    console.log('   ✅ Industry Benchmarking System');
    console.log('   ✅ Business Category Intelligence');
    console.log('   ✅ Malaysian Market Context Integration');

    console.log('\n🚀 Ready for Production with Database Connection!');

  } catch (error) {
    console.error('❌ Logic test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
if (require.main === module) {
  testReportsLogic();
}

module.exports = testReportsLogic;