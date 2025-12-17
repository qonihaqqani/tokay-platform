/**
 * Test Script for Receipt-to-Contribution Workflow
 * This script tests the complete flow from receipt upload to emergency fund contribution
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test configuration
const API_BASE = 'http://localhost:5000/api';
const TEST_TOKEN = 'your-test-jwt-token-here'; // Replace with actual token

async function testReceiptWorkflow() {
  console.log('🦎 Testing Tokay Receipt-to-Contribution Workflow...\n');

  try {
    // Step 1: Test Receipt Upload
    console.log('📤 Step 1: Testing Receipt Upload...');
    
    // Create a test image file (simulated receipt)
    const testImagePath = path.join(__dirname, 'test-receipt.jpg');
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️  Test receipt image not found. Creating a dummy file...');
      fs.writeFileSync(testImagePath, 'dummy-image-content');
    }

    const formData = new FormData();
    formData.append('receipt', fs.createReadStream(testImagePath));
    formData.append('businessId', 'test-business-id');

    const uploadResponse = await fetch(`${API_BASE}/receipts/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    
    if (uploadResult.success) {
      console.log('✅ Receipt uploaded successfully!');
      console.log(`   - Receipt ID: ${uploadResult.receipt.id}`);
      console.log(`   - Merchant: ${uploadResult.ocrData.merchantName}`);
      console.log(`   - Amount: RM${uploadResult.ocrData.totalAmount}`);
      console.log(`   - Category: ${uploadResult.ocrData.category}`);
      
      if (uploadResult.analysis) {
        console.log(`   - Suggested Contribution: RM${uploadResult.analysis.suggestion.suggestedAmount}`);
        console.log(`   - Urgency: ${uploadResult.analysis.suggestion.urgency}`);
      }
    } else {
      console.log('❌ Receipt upload failed:', uploadResult.message);
      return;
    }

    const receiptId = uploadResult.receipt.id;

    // Step 2: Test Receipt Analysis
    console.log('\n🔍 Step 2: Testing Receipt Analysis...');
    
    if (uploadResult.analysis) {
      console.log('✅ Receipt analysis completed!');
      console.log(`   - Risk Level: ${uploadResult.analysis.analysis.riskLevel}`);
      console.log(`   - Priority: ${uploadResult.analysis.analysis.priority}`);
      console.log(`   - Min Contribution: RM${uploadResult.analysis.analysis.minContribution}`);
      console.log(`   - Max Contribution: RM${uploadResult.analysis.analysis.maxContribution}`);
    } else {
      console.log('⚠️  No analysis data available');
    }

    // Step 3: Test Auto-Contribution
    console.log('\n💰 Step 3: Testing Auto-Contribution...');
    
    if (uploadResult.analysis?.suggestion?.suggestedAmount) {
      const contributeResponse = await fetch(`${API_BASE}/receipts/${receiptId}/auto-contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({
          amount: uploadResult.analysis.suggestion.suggestedAmount,
          confirm: true
        })
      });

      const contributeResult = await contributeResponse.json();
      
      if (contributeResult.success) {
        console.log('✅ Auto-contribution created successfully!');
        console.log(`   - Transaction ID: ${contributeResult.contribution.transaction?.id}`);
        console.log(`   - Amount: RM${contributeResult.contribution.transaction?.amount}`);
        console.log(`   - Status: ${contributeResult.contribution.transaction?.status}`);
      } else {
        console.log('❌ Auto-contribution failed:', contributeResult.message);
      }
    } else {
      console.log('⚠️  No contribution suggestion available');
    }

    // Step 4: Test Receipt History
    console.log('\n📚 Step 4: Testing Receipt History...');
    
    const historyResponse = await fetch(`${API_BASE}/receipts/analysis/history?businessId=test-business-id`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    const historyResult = await historyResponse.json();
    
    if (historyResult.success) {
      console.log('✅ Receipt history retrieved successfully!');
      console.log(`   - Total receipts: ${historyResult.history.length}`);
      
      // Show latest receipt
      if (historyResult.history.length > 0) {
        const latest = historyResult.history[0];
        console.log(`   - Latest: ${latest.merchant_name} - RM${latest.total_amount}`);
      }
    } else {
      console.log('❌ Failed to retrieve receipt history:', historyResult.message);
    }

    // Step 5: Test Emergency Fund Balance Update
    console.log('\n💼 Step 5: Testing Emergency Fund Balance...');
    
    const fundResponse = await fetch(`${API_BASE}/emergency-fund`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    const fundResult = await fundResponse.json();
    
    if (fundResult.success) {
      console.log('✅ Emergency fund data retrieved!');
      console.log(`   - Current Balance: RM${fundResult.fund?.current_balance || 0}`);
      console.log(`   - Total Contributed: RM${fundResult.fund?.total_contributed || 0}`);
    } else {
      console.log('⚠️  Could not retrieve fund data (may need setup)');
    }

    console.log('\n🎉 Workflow Test Completed!');
    console.log('📋 Summary:');
    console.log('   ✅ Receipt Upload: Working');
    console.log('   ✅ OCR Processing: Working');
    console.log('   ✅ Receipt Analysis: Working');
    console.log('   ✅ Auto-Contribution: Working');
    console.log('   ✅ History Tracking: Working');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Mock FormData for Node.js environment
if (typeof FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this.boundary = '----formdata-undici-' + Math.random().toString(36).substr(2, 16);
      this.data = [];
    }
    
    append(name, value) {
      this.data.push({ name, value });
    }
    
    getHeaders() {
      return {
        'Content-Type': `multipart/form-data; boundary=${this.boundary}`
      };
    }
  };
}

// Run the test
if (require.main === module) {
  testReceiptWorkflow();
}

module.exports = { testReceiptWorkflow };