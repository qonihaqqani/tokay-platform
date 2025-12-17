const { pool } = require('../config/database');
const logger = require('../utils/logger');
const crypto = require('crypto');

class EInvoiceService {
  constructor() {
    // LHDN e-invoicing API configuration
    this.lhdnConfig = {
      baseUrl: process.env.LHDN_API_URL || 'https://api.myinvois.hasil.gov.my',
      apiKey: process.env.LHDN_API_KEY,
      taxpayerId: process.env.LHDN_TAXPAYER_ID,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    };

    // Malaysian SST (Sales and Service Tax) configuration
    this.sstConfig = {
      standardRate: 6.00, // 6% SST
      exemptCategories: [
        'basic_food_items',
        'educational_services',
        'healthcare_services',
        'public_transport',
        'residential_rental'
      ]
    };

    // Invoice number generation pattern
    this.invoicePattern = {
      prefix: 'INV',
      year: new Date().getFullYear(),
      separator: '-',
      padding: 4
    };
  }

  /**
   * Generate unique invoice number
   */
  async generateInvoiceNumber(businessId) {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `${this.invoicePattern.prefix}${currentYear}`;
      
      // Get the last invoice number for this business
      const query = `
        SELECT invoice_number 
        FROM invoices 
        WHERE business_id = $1 AND invoice_number LIKE $2
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await pool.query(query, [businessId, `${prefix}%`]);
      
      let sequenceNumber = 1;
      if (result.rows.length > 0) {
        const lastInvoiceNumber = result.rows[0].invoice_number;
        const lastSequence = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
        sequenceNumber = lastSequence + 1;
      }
      
      const paddedSequence = sequenceNumber.toString().padStart(this.invoicePattern.padding, '0');
      return `${prefix}${this.invoicePattern.separator}${paddedSequence}`;
      
    } catch (error) {
      logger.error('Error generating invoice number:', error);
      throw new Error('Failed to generate invoice number');
    }
  }

  /**
   * Calculate SST for invoice items
   */
  calculateSST(lineItems, customerState = null) {
    let totalTax = 0;
    const taxableItems = [];
    const exemptItems = [];

    for (const item of lineItems) {
      const itemTotal = item.quantity * item.unit_price;
      let itemTax = 0;
      let isExempt = false;

      // Check if item is exempt
      if (this.sstConfig.exemptCategories.includes(item.category.toLowerCase())) {
        isExempt = true;
        exemptItems.push({
          ...item,
          total: itemTotal,
          tax: 0,
          exemptReason: 'SST exempt category'
        });
      } else {
        // Apply SST
        itemTax = itemTotal * (this.sstConfig.standardRate / 100);
        totalTax += itemTax;
        
        taxableItems.push({
          ...item,
          total: itemTotal,
          tax: itemTax,
          taxRate: this.sstConfig.standardRate
        });
      }
    }

    return {
      totalTax,
      taxableItems,
      exemptItems,
      taxRate: this.sstConfig.standardRate
    };
  }

  /**
   * Create new invoice with LHDN compliance
   */
  async createInvoice(userId, businessId, invoiceData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(businessId);

      // Calculate SST
      const sstCalculation = this.calculateSST(invoiceData.line_items, invoiceData.customer_state);
      
      // Calculate totals
      const subtotal = invoiceData.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const totalAmount = subtotal + sstCalculation.totalTax - (invoiceData.discount_amount || 0);
      const balanceDue = totalAmount - (invoiceData.paid_amount || 0);

      // Generate LHDN unique identifier
      const lhdnUniqueId = crypto.randomUUID();
      
      // Create validation hash for LHDN compliance
      const validationData = {
        invoiceNumber,
        totalAmount,
        taxAmount: sstCalculation.totalTax,
        customerName: invoiceData.customer_name,
        invoiceDate: invoiceData.invoice_date
      };
      const validationHash = crypto.createHash('sha256')
        .update(JSON.stringify(validationData))
        .digest('hex');

      // Insert invoice
      const insertQuery = `
        INSERT INTO invoices (
          user_id, business_id, invoice_number, invoice_type, status,
          invoice_date, due_date, customer_name, customer_email, customer_phone,
          customer_address, customer_state, customer_postal_code,
          subtotal, tax_amount, discount_amount, total_amount, paid_amount, balance_due,
          tax_type, tax_rate, tax_exempt, lhdn_document_type, lhdn_unique_identifier,
          lhdn_validation_hash, line_items, payment_terms, notes, is_emergency_related
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
        ) RETURNING *
      `;

      const values = [
        userId, businessId, invoiceNumber, invoiceData.invoice_type || 'standard', 'draft',
        invoiceData.invoice_date, invoiceData.due_date, invoiceData.customer_name,
        invoiceData.customer_email, invoiceData.customer_phone, invoiceData.customer_address,
        invoiceData.customer_state, invoiceData.customer_postal_code,
        subtotal, sstCalculation.totalTax, invoiceData.discount_amount || 0,
        totalAmount, invoiceData.paid_amount || 0, balanceDue,
        sstCalculation.totalTax > 0 ? 'SST' : 'EXEMPT',
        this.sstConfig.standardRate, sstCalculation.totalTax === 0,
        'INVOICE', lhdnUniqueId, validationHash,
        JSON.stringify(invoiceData.line_items), 
        JSON.stringify(invoiceData.payment_terms || {}),
        JSON.stringify(invoiceData.notes || {}),
        invoiceData.is_emergency_related || false
      ];

      const result = await client.query(insertQuery, values);
      const invoice = result.rows[0];

      // If emergency related, create link to emergency fund
      if (invoiceData.is_emergency_related && invoiceData.emergency_fund_allocation) {
        await this.createEmergencyFundLink(client, invoice.id, invoiceData.emergency_fund_allocation);
      }

      await client.query('COMMIT');

      logger.info(`Invoice created: ${invoiceNumber} for business ${businessId}`);
      
      return {
        success: true,
        invoice: {
          ...invoice,
          sstCalculation
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating invoice:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit invoice to LHDN e-invoicing system
   */
  async submitToLHDN(invoiceId) {
    try {
      // Get invoice details
      const invoiceQuery = 'SELECT * FROM invoices WHERE id = $1';
      const invoiceResult = await pool.query(invoiceQuery, [invoiceId]);
      
      if (invoiceResult.rows.length === 0) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceResult.rows[0];

      // Prepare LHDN payload
      const lhdnPayload = this.prepareLHDNPayload(invoice);

      // Submit to LHDN API (mock implementation)
      const lhdnResponse = await this.callLHDNAPI('/invoices', lhdnPayload);

      // Update invoice with LHDN response
      const updateQuery = `
        UPDATE invoices 
        SET lhdn_status = $1, lhdn_submission_id = $2, lhdn_response = $3, 
            lhdn_submitted_at = CURRENT_TIMESTAMP, status = 'sent'
        WHERE id = $4
        RETURNING *
      `;

      const updateResult = await pool.query(updateQuery, [
        lhdnResponse.success ? 'submitted' : 'error',
        lhdnResponse.submissionId,
        JSON.stringify(lhdnResponse),
        invoiceId
      ]);

      logger.info(`Invoice ${invoice.invoice_number} submitted to LHDN: ${lhdnResponse.submissionId}`);

      return {
        success: true,
        invoice: updateResult.rows[0],
        lhdnResponse
      };

    } catch (error) {
      logger.error('Error submitting invoice to LHDN:', error);
      
      // Update invoice status to error
      await pool.query(
        'UPDATE invoices SET lhdn_status = $1, lhdn_response = $2 WHERE id = $3',
        ['error', JSON.stringify({ error: error.message }), invoiceId]
      );
      
      throw error;
    }
  }

  /**
   * Prepare payload for LHDN API
   */
  prepareLHDNPayload(invoice) {
    const lineItems = JSON.parse(invoice.line_items || '[]');
    
    return {
      documentType: invoice.lhdn_document_type,
      documentNumber: invoice.invoice_number,
      documentDate: invoice.invoice_date,
      currency: invoice.currency,
      taxpayerId: this.lhdnConfig.taxpayerId,
      customer: {
        name: invoice.customer_name,
        email: invoice.customer_email,
        phone: invoice.customer_phone,
        address: invoice.customer_address,
        state: invoice.customer_state,
        postalCode: invoice.customer_postal_code,
        country: invoice.customer_country,
        registrationNumber: invoice.customer_registration_number
      },
      lineItems: lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalAmount: item.quantity * item.unit_price,
        taxType: item.tax_type || 'SST',
        taxRate: item.tax_rate || this.sstConfig.standardRate,
        taxAmount: item.tax_amount || 0
      })),
      summary: {
        subtotal: parseFloat(invoice.subtotal),
        taxAmount: parseFloat(invoice.tax_amount),
        discountAmount: parseFloat(invoice.discount_amount),
        totalAmount: parseFloat(invoice.total_amount),
        balanceDue: parseFloat(invoice.balance_due)
      },
      paymentTerms: JSON.parse(invoice.payment_terms || '{}'),
      validationHash: invoice.lhdn_validation_hash
    };
  }

  /**
   * Mock LHDN API call (replace with actual implementation)
   */
  async callLHDNAPI(endpoint, payload) {
    // In production, this would be an actual HTTP call to LHDN API
    // For now, we'll simulate the response
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const submissionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      submissionId,
      message: 'Invoice submitted successfully to LHDN',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create link between invoice and emergency fund
   */
  async createEmergencyFundLink(client, invoiceId, emergencyFundData) {
    const linkQuery = `
      INSERT INTO invoice_emergency_fund_links (invoice_id, emergency_fund_id, amount, purpose)
      VALUES ($1, $2, $3, $4)
    `;
    
    await client.query(linkQuery, [
      invoiceId,
      emergencyFundData.emergency_fund_id,
      emergencyFundData.amount,
      emergencyFundData.purpose || 'Emergency-related expense'
    ]);
  }

  /**
   * Get invoices for a business with filtering
   */
  async getInvoices(businessId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        customerEmail, 
        dateFrom, 
        dateTo,
        isEmergencyRelated 
      } = options;
      
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT i.*, 
               b.business_name,
               u.full_name as created_by_name
        FROM invoices i
        LEFT JOIN businesses b ON i.business_id = b.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.business_id = $1
      `;
      
      const params = [businessId];
      
      if (status) {
        query += ` AND i.status = $${params.length + 1}`;
        params.push(status);
      }
      
      if (customerEmail) {
        query += ` AND i.customer_email ILIKE $${params.length + 1}`;
        params.push(`%${customerEmail}%`);
      }
      
      if (dateFrom) {
        query += ` AND i.invoice_date >= $${params.length + 1}`;
        params.push(dateFrom);
      }
      
      if (dateTo) {
        query += ` AND i.invoice_date <= $${params.length + 1}`;
        params.push(dateTo);
      }
      
      if (isEmergencyRelated !== undefined) {
        query += ` AND i.is_emergency_related = $${params.length + 1}`;
        params.push(isEmergencyRelated);
      }
      
      query += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = `SELECT COUNT(*) FROM invoices WHERE business_id = $1`;
      const countParams = [businessId];
      
      if (status) {
        countQuery += ` AND status = $${countParams.length + 1}`;
        countParams.push(status);
      }
      
      if (customerEmail) {
        countQuery += ` AND customer_email ILIKE $${countParams.length + 1}`;
        countParams.push(`%${customerEmail}%`);
      }
      
      if (dateFrom) {
        countQuery += ` AND invoice_date >= $${countParams.length + 1}`;
        countParams.push(dateFrom);
      }
      
      if (dateTo) {
        countQuery += ` AND invoice_date <= $${countParams.length + 1}`;
        countParams.push(dateTo);
      }
      
      if (isEmergencyRelated !== undefined) {
        countQuery += ` AND is_emergency_related = $${countParams.length + 1}`;
        countParams.push(isEmergencyRelated);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        success: true,
        invoices: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };
      
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(invoiceId) {
    try {
      // Get invoice details
      const invoiceQuery = `
        SELECT i.*, b.business_name, b.business_registration_number, 
               b.address_line1, b.city, b.state, b.postal_code, b.phone_number as business_phone,
               b.email as business_email
        FROM invoices i
        LEFT JOIN businesses b ON i.business_id = b.id
        WHERE i.id = $1
      `;
      
      const result = await pool.query(invoiceQuery, [invoiceId]);
      
      if (result.rows.length === 0) {
        throw new Error('Invoice not found');
      }
      
      const invoice = result.rows[0];
      
      // In production, this would generate an actual PDF using a library like puppeteer
      // For now, we'll return a mock PDF path
      const pdfPath = `/invoices/pdf/${invoice.invoice_number}_${Date.now()}.pdf`;
      
      // Update invoice with PDF path
      await pool.query(
        'UPDATE invoices SET pdf_path = $1 WHERE id = $2',
        [pdfPath, invoiceId]
      );
      
      return {
        success: true,
        pdfPath,
        invoiceNumber: invoice.invoice_number
      };
      
    } catch (error) {
      logger.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceId, options = {}) {
    try {
      const { sendEmail = true, sendWhatsApp = false, customMessage } = options;
      
      // Get invoice details
      const invoiceQuery = 'SELECT * FROM invoices WHERE id = $1';
      const result = await pool.query(invoiceQuery, [invoiceId]);
      
      if (result.rows.length === 0) {
        throw new Error('Invoice not found');
      }
      
      const invoice = result.rows[0];
      
      // Generate PDF if not exists
      if (!invoice.pdf_path) {
        await this.generateInvoicePDF(invoiceId);
      }
      
      // Send email (mock implementation)
      if (sendEmail && invoice.customer_email) {
        await this.sendInvoiceEmail(invoice, customMessage);
      }
      
      // Send WhatsApp (mock implementation)
      if (sendWhatsApp && invoice.customer_phone) {
        await this.sendInvoiceWhatsApp(invoice, customMessage);
      }
      
      // Update invoice status
      await pool.query(
        'UPDATE invoices SET status = $1, sent_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['sent', invoiceId]
      );
      
      logger.info(`Invoice ${invoice.invoice_number} sent to customer`);
      
      return {
        success: true,
        message: 'Invoice sent successfully',
        sentVia: {
          email: sendEmail && invoice.customer_email,
          whatsapp: sendWhatsApp && invoice.customer_phone
        }
      };
      
    } catch (error) {
      logger.error('Error sending invoice:', error);
      throw error;
    }
  }

  /**
   * Mock email sending implementation
   */
  async sendInvoiceEmail(invoice, customMessage) {
    // In production, this would use an email service like SendGrid or Nodemailer
    logger.info(`Email sent to ${invoice.customer_email} for invoice ${invoice.invoice_number}`);
  }

  /**
   * Mock WhatsApp sending implementation
   */
  async sendInvoiceWhatsApp(invoice, customMessage) {
    // In production, this would use a WhatsApp Business API
    logger.info(`WhatsApp sent to ${invoice.customer_phone} for invoice ${invoice.invoice_number}`);
  }
}

module.exports = new EInvoiceService();