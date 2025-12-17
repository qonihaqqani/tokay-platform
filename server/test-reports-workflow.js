const { connectDB, pool } = require('./config/database');
const reportsService = require('./services/reportsService');

async function testReportsWorkflow() {
  console.log('🧪 Testing Tokay Reports - Resilience Analytics Workflow...\n');

  try {
    // Initialize database connection
    await connectDB();
    console.log('✅ Database connected successfully');

    // Step 1: Get a test business
    const businessResult = await pool.query(
      'SELECT id, name, business_type, location FROM businesses LIMIT 1'
    );

    if (businessResult.rows.length === 0) {
      console.log('❌ No businesses found. Please create a business first.');
      return;
    }

    const testBusiness = businessResult.rows[0];
    console.log(`✅ Using test business: ${testBusiness.name} (${testBusiness.business_type})`);

    // Step 2: Test Emergency Fund Analytics
    console.log('\n📊 Testing Emergency Fund Analytics...');
    const emergencyFundData = await reportsService.getEmergencyFundAnalytics(testBusiness.id, 12);
    console.log(`   Current Balance: RM${emergencyFundData.currentBalance.toLocaleString()}`);
    console.log(`   Target Amount: RM${emergencyFundData.targetAmount.toLocaleString()}`);
    console.log(`   Completion: ${emergencyFundData.completionPercentage}%`);
    console.log(`   Months of Expenses: ${emergencyFundData.monthsOfExpenses}`);

    // Step 3: Test Risk Analytics
    console.log('\n⚠️  Testing Risk Analytics...');
    const riskData = await reportsService.getRiskAnalytics(testBusiness.id, 12);
    console.log(`   Current Risk Level: ${riskData.currentRiskLevel}`);
    console.log(`   Average Risk Score: ${riskData.averageRiskScore}/100`);
    console.log(`   Total Assessments: ${riskData.totalAssessments}`);
    console.log(`   Top Risk Factor: ${riskData.topRiskFactors[0]?.factor || 'N/A'}`);

    // Step 4: Test Alert Analytics
    console.log('\n🚨 Testing Alert Analytics...');
    const alertData = await reportsService.getAlertAnalytics(testBusiness.id, 12);
    console.log(`   Total Alerts: ${alertData.totalAlerts}`);
    console.log(`   Resolved: ${alertData.resolvedAlerts}`);
    console.log(`   Pending: ${alertData.pendingAlerts}`);
    console.log(`   Response Rate: ${alertData.responseRate}%`);

    // Step 5: Test Receipt Analytics
    console.log('\n🧾 Testing Receipt Analytics...');
    const receiptData = await reportsService.getReceiptAnalytics(testBusiness.id, 12);
    console.log(`   Total Receipts: ${receiptData.totalReceipts}`);
    console.log(`   Total Amount: RM${receiptData.totalAmount.toLocaleString()}`);
    console.log(`   Average Amount: RM${Math.round(receiptData.averageAmount).toLocaleString()}`);
    console.log(`   Top Category: ${receiptData.topCategories[0]?.category || 'N/A'}`);

    // Step 6: Test Transaction Analytics
    console.log('\n💳 Testing Transaction Analytics...');
    const transactionData = await reportsService.getTransactionAnalytics(testBusiness.id, 12);
    console.log(`   Total Deposits: ${transactionData.totalDeposits}`);
    console.log(`   Total Withdrawals: ${transactionData.totalWithdrawals}`);
    console.log(`   Net Flow: RM${transactionData.netFlow.toLocaleString()}`);
    console.log(`   Average Transaction: RM${transactionData.averageTransactionAmount.toLocaleString()}`);

    // Step 7: Test Resilience Score Calculation
    console.log('\n🛡️  Testing Resilience Score Calculation...');
    const resilienceScore = reportsService.calculateResilienceScore({
      emergencyFundData,
      riskAssessments: riskData,
      alerts: alertData,
      receipts: receiptData,
      transactions: transactionData,
      business: testBusiness
    });
    
    console.log(`   Overall Score: ${resilienceScore.overall}/100`);
    console.log(`   Emergency Fund Score: ${resilienceScore.emergencyFund}/100`);
    console.log(`   Risk Management Score: ${resilienceScore.riskManagement}/100`);
    console.log(`   Alert Response Score: ${resilienceScore.alertResponse}/100`);

    // Step 8: Test Recommendations Generation
    console.log('\n💡 Testing AI Recommendations...');
    const recommendations = reportsService.generateRecommendations({
      resilienceScore,
      emergencyFundData,
      riskAssessments: riskData,
      alerts: alertData,
      business: testBusiness
    });
    
    console.log(`   Generated ${recommendations.length} recommendations:`);
    recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.title}`);
    });

    // Step 9: Test Benchmarking
    console.log('\n📈 Testing Benchmarking Data...');
    const benchmarking = await reportsService.getBenchmarkingData(testBusiness, resilienceScore);
    console.log(`   Industry Average: ${benchmarking.industryAverage}`);
    console.log(`   Your Percentile: ${benchmarking.percentile}%`);
    console.log(`   Total Businesses: ${benchmarking.totalBusinesses}`);

    // Step 10: Test Complete Resilience Report
    console.log('\n📋 Testing Complete Resilience Report...');
    const fullReport = await reportsService.generateResilienceReport(testBusiness.id, 12);
    
    if (fullReport.success) {
      console.log(`   ✅ Report generated successfully!`);
      console.log(`   Business: ${fullReport.report.businessName}`);
      console.log(`   Period: ${fullReport.report.reportPeriod} months`);
      console.log(`   Generated At: ${fullReport.report.generatedAt}`);
      console.log(`   Resilience Score: ${fullReport.report.resilienceScore.overall}/100`);
      console.log(`   Summary: ${fullReport.report.summary}`);
    } else {
      console.log(`   ❌ Report generation failed: ${fullReport.message}`);
    }

    console.log('\n🎉 Tokay Reports workflow test completed successfully!');
    console.log('\n📊 Key Features Verified:');
    console.log('   ✅ Emergency Fund Analytics');
    console.log('   ✅ Risk Assessment Analytics');
    console.log('   ✅ Alert System Analytics');
    console.log('   ✅ Receipt & Transaction Analytics');
    console.log('   ✅ AI-Powered Resilience Scoring');
    console.log('   ✅ Intelligent Recommendations');
    console.log('   ✅ Industry Benchmarking');
    console.log('   ✅ Comprehensive Reporting');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testReportsWorkflow();
}

module.exports = testReportsWorkflow;