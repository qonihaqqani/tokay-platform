const logger = require('../utils/logger');

class MockOCRService {
  constructor() {
    // Malaysian business templates for realistic mock data
    this.malaysianBusinesses = [
      {
        name: "Restoran Nasi Lemak Mak Cik",
        category: "Food Supplies",
        regNo: "002345678-K",
        typicalItems: ["Nasi Lemak", "Teh Tarik", "Roti Canai", "Kopi O"],
        priceRange: { min: 15, max: 200 }
      },
      {
        name: "Kedai Runcit Ahmad",
        category: "Groceries",
        regNo: "003456789-K",
        typicalItems: ["Beras", "Gula", "Minyak Masak", "Susu"],
        priceRange: { min: 25, max: 500 }
      },
      {
        name: "Jaya Electrical Supplies",
        category: "Utilities",
        regNo: "004567890-K",
        typicalItems: ["Pelek Lampu", "Kabel", "Soket", "Fuse"],
        priceRange: { min: 10, max: 1000 }
      },
      {
        name: "Fresh Market Supplier",
        category: "Raw Materials",
        regNo: "005678901-K",
        typicalItems: ["Ayam", "Ikan", "Sayur", "Rempah"],
        priceRange: { min: 50, max: 800 }
      },
      {
        name: "Office Stationery Sdn Bhd",
        category: "Office Supplies",
        regNo: "006789012-K",
        typicalItems: ["Kertas A4", "Pen", "Stapler", "Printer Ink"],
        priceRange: { min: 20, max: 300 }
      }
    ];

    this.paymentMethods = ["Cash", "FPX", "Touch 'n Go", "GrabPay", "Credit Card", "Debit Card"];
    this.taxTypes = ["SST", "GST", "Tax Exempt"];
  }

  async processReceipt(imageFile, userId, businessId) {
    try {
      logger.info(`Processing receipt for user ${userId}, business ${businessId}`);
      
      // Simulate processing delay (2-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      // Generate realistic mock data
      const business = this.malaysianBusinesses[Math.floor(Math.random() * this.malaysianBusinesses.length)];
      const totalAmount = this.generateRandomAmount(business.priceRange);
      const receiptDate = this.generateRecentDate();
      const items = this.generateItems(business.typicalItems, totalAmount);

      const extractedData = {
        merchantName: business.name,
        businessRegistrationNumber: business.regNo,
        totalAmount: totalAmount,
        receiptDate: receiptDate,
        receiptTime: this.generateRandomTime(),
        category: business.category,
        items: items,
        taxAmount: this.calculateTax(totalAmount),
        taxType: this.taxTypes[Math.floor(Math.random() * this.taxTypes.length)],
        paymentMethod: this.paymentMethods[Math.floor(Math.random() * this.paymentMethods.length)],
        confidenceScore: 0.85 + Math.random() * 0.14, // 0.85-0.99
        rawText: this.generateRawText(business, items, totalAmount)
      };

      logger.info(`Mock OCR processing completed for ${imageFile.originalname}`);
      return extractedData;

    } catch (error) {
      logger.error('Error in mock OCR processing:', error);
      throw new Error('OCR processing failed');
    }
  }

  generateRandomAmount(range) {
    const amount = Math.random() * (range.max - range.min) + range.min;
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  }

  generateRecentDate() {
    const daysAgo = Math.floor(Math.random() * 30); // Within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  generateRandomTime() {
    const hours = Math.floor(Math.random() * 14) + 8; // 8 AM - 10 PM
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  generateItems(typicalItems, totalAmount) {
    const numItems = Math.min(Math.floor(Math.random() * 5) + 1, typicalItems.length);
    const selectedItems = [];
    let remainingAmount = totalAmount * 0.9; // 90% for items, 10% for tax/tips

    for (let i = 0; i < numItems; i++) {
      const item = typicalItems[i];
      const maxItemPrice = remainingAmount / (numItems - i);
      const quantity = Math.floor(Math.random() * 3) + 1;
      const unitPrice = Math.min(maxItemPrice / quantity, this.generateRandomAmount({ min: 5, max: 50 }));
      const totalPrice = unitPrice * quantity;

      selectedItems.push({
        name: item,
        quantity: quantity,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100
      });

      remainingAmount -= totalPrice;
    }

    return selectedItems;
  }

  calculateTax(totalAmount) {
    const taxRate = 0.06; // 6% SST
    return Math.round(totalAmount * taxRate * 100) / 100;
  }

  generateRawText(business, items, totalAmount) {
    const taxAmount = this.calculateTax(totalAmount);
    const lines = [
      business.name,
      `No. Perniagaan: ${business.regNo}`,
      `Date: ${this.generateRecentDate()}`,
      `Time: ${this.generateRandomTime()}`,
      "--------------------------------",
      ...items.map(item => 
        `${item.name.padEnd(20)} ${item.quantity}x${item.unitPrice.toFixed(2).padStart(8)} ${item.totalPrice.toFixed(2).padStart(8)}`
      ),
      "--------------------------------",
      `Subtotal:${(totalAmount - taxAmount).toFixed(2).padStart(35)}`,
      `SST (6%):${taxAmount.toFixed(2).padStart(32)}`,
      `TOTAL:${totalAmount.toFixed(2).padStart(36)}`,
      "--------------------------------",
      `Payment: ${this.paymentMethods[Math.floor(Math.random() * this.paymentMethods.length)]}`,
      "Thank you, please come again!"
    ];

    return lines.join('\n');
  }

  // Simulate processing errors for testing
  simulateProcessingError() {
    const errorRate = 0.05; // 5% chance of error
    if (Math.random() < errorRate) {
      throw new Error('Unable to read receipt image. Please ensure the image is clear and well-lit.');
    }
  }
}

module.exports = new MockOCRService();