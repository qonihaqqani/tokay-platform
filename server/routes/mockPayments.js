const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

// Get available payment methods
router.get('/methods', async (req, res) => {
  try {
    const methods = await paymentService.getPaymentMethods();
    res.json({
      success: true,
      methods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods'
    });
  }
});

// Initiate mock payment
router.post('/initiate', async (req, res) => {
  try {
    const { amount, paymentMethod, description } = req.body;
    const userId = req.user.id; // From auth middleware
    
    if (!amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, paymentMethod'
      });
    }

    if (!paymentService.validatePaymentMethod(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    const result = await paymentService.initiatePayment(userId, amount, paymentMethod, description);
    
    res.json({
      success: true,
      ...result,
      message: 'Mock payment initiated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initiating payment'
    });
  }
});

// Mock checkout page (returns HTML for demo)
router.get('/checkout/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const status = await paymentService.getTransactionStatus(transactionId);
    
    if (!status.success) {
      return res.status(404).send(`
        <html>
          <head><title>Payment Not Found</title></head>
          <body>
            <h1>Transaction Not Found</h1>
            <p>The transaction ${transactionId} was not found.</p>
            <a href="/javascript:history.back()">Go Back</a>
          </body>
        </html>
      `);
    }

    // Generate mock checkout HTML
    const checkoutHtml = generateMockCheckoutHTML(transactionId, status);
    res.send(checkoutHtml);
  } catch (error) {
    res.status(500).send('Error loading checkout page');
  }
});

// Process mock payment (simulated success)
router.post('/process/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { paymentDetails } = req.body;
    
    const result = await paymentService.processMockPayment(transactionId, paymentDetails);
    
    res.json({
      success: true,
      ...result,
      message: 'Mock payment processed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payment'
    });
  }
});

// Check payment status
router.get('/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const status = await paymentService.getTransactionStatus(transactionId);
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking payment status'
    });
  }
});

// Helper function to generate mock checkout HTML
function generateMockCheckoutHTML(transactionId, transaction) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tokay - Mock Payment Checkout</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2E7D32; }
            .amount { font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; color: #333; }
            .payment-method { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .btn { width: 100%; padding: 15px; background: #2E7D32; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px 0; }
            .btn:hover { background: #1B5E20; }
            .btn-cancel { background: #6c757d; }
            .btn-cancel:hover { background: #545b62; }
            .test-credentials { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .test-credentials h4 { margin: 0 0 10px 0; color: #856404; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🦎 Tokay Resilience Platform</div>
                <h2>Mock Payment Checkout</h2>
            </div>
            
            <div class="amount">RM ${transaction.amount}</div>
            
            <div class="payment-method">
                <strong>Payment Method:</strong> ${transaction.paymentMethod?.toUpperCase() || 'FPX'}
            </div>
            
            <div class="payment-method">
                <strong>Transaction ID:</strong> ${transactionId}
            </div>
            
            <div class="test-credentials">
                <h4>🧪 Test Mode</h4>
                <p>This is a mock payment for demonstration purposes. No actual money will be charged.</p>
                <p><strong>Test Credentials:</strong> Use any username/password to proceed.</p>
            </div>
            
            <button class="btn" onclick="processPayment()">Complete Mock Payment</button>
            <button class="btn btn-cancel" onclick="cancelPayment()">Cancel Payment</button>
        </div>
        
        <script>
            function processPayment() {
                fetch('/api/payments/mock/process/${transactionId}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentDetails: {
                            mockUser: 'test_user',
                            mockPassword: 'test_password'
                        }
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Payment completed successfully! You will be redirected back.');
                        window.close();
                    } else {
                        alert('Payment failed: ' + data.message);
                    }
                })
                .catch(error => {
                    alert('Error processing payment: ' + error.message);
                });
            }
            
            function cancelPayment() {
                if (confirm('Are you sure you want to cancel this payment?')) {
                    window.close();
                }
            }
        </script>
    </body>
    </html>
  `;
}

module.exports = router;