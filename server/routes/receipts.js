const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const mockOCRService = require('../services/mockOCRService');
const receiptAnalysisService = require('../services/receiptAnalysisService');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/receipts');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Upload and process receipt
router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const businessId = req.body.businessId || req.user.business_id;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    // Create receipt record
    const insertQuery = `
      INSERT INTO receipts 
      (user_id, business_id, image_filename, image_path, original_filename, mime_type, file_size, processing_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      userId,
      businessId,
      req.file.filename,
      req.file.path,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      'processing'
    ];

    const result = await pool.query(insertQuery, values);
    const receipt = result.rows[0];

    // Process with OCR service
    try {
      const ocrData = await mockOCRService.processReceipt(req.file, userId, businessId);

      // Update receipt with OCR data
      const updateQuery = `
        UPDATE receipts 
        SET 
          merchant_name = $1,
          total_amount = $2,
          receipt_date = $3,
          receipt_time = $4,
          category = $5,
          extracted_items = $6,
          tax_amount = $7,
          tax_type = $8,
          payment_method = $9,
          business_registration_number = $10,
          confidence_score = $11,
          raw_ocr_text = $12,
          processing_status = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $14
        RETURNING *
      `;

      const updateValues = [
        ocrData.merchantName,
        ocrData.totalAmount,
        ocrData.receiptDate,
        ocrData.receiptTime,
        ocrData.category,
        JSON.stringify(ocrData.items),
        ocrData.taxAmount,
        ocrData.taxType,
        ocrData.paymentMethod,
        ocrData.businessRegistrationNumber,
        ocrData.confidenceScore,
        ocrData.rawText,
        'completed',
        receipt.id
      ];

      const updatedResult = await pool.query(updateQuery, updateValues);
      const updatedReceipt = updatedResult.rows[0];

      // Analyze receipt for emergency fund contribution suggestions
      let analysisResult = null;
      try {
        analysisResult = await receiptAnalysisService.analyzeReceiptForEmergencyFund(
          updatedReceipt.id,
          userId,
          businessId
        );
      } catch (analysisError) {
        logger.warn(`Receipt analysis failed for ${updatedReceipt.id}:`, analysisError);
        // Continue without analysis - OCR was successful
      }

      logger.info(`Receipt processed successfully: ${receipt.id}`);

      res.json({
        success: true,
        receipt: updatedReceipt,
        ocrData,
        analysis: analysisResult,
        message: 'Receipt uploaded and processed successfully'
      });

    } catch (ocrError) {
      // Update receipt with error status
      await pool.query(
        'UPDATE receipts SET processing_status = $1, processing_errors = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['failed', JSON.stringify({ error: ocrError.message }), receipt.id]
      );

      logger.error(`OCR processing failed for receipt ${receipt.id}:`, ocrError);

      res.status(500).json({
        success: false,
        message: 'OCR processing failed',
        error: ocrError.message,
        receiptId: receipt.id
      });
    }

  } catch (error) {
    logger.error('Error uploading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading receipt',
      error: error.message
    });
  }
});

// Get user's receipts
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, b.name as business_name 
      FROM receipts r 
      LEFT JOIN businesses b ON r.business_id = b.id 
      WHERE r.user_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ` AND r.processing_status = $${params.length + 1}`;
      params.push(status);
    }

    if (category) {
      query += ` AND r.category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM receipts WHERE user_id = $1';
    const countParams = [userId];

    if (status) {
      countQuery += ` AND processing_status = $${countParams.length + 1}`;
      countParams.push(status);
    }

    if (category) {
      countQuery += ` AND category = $${countParams.length + 1}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      receipts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching receipts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipts',
      error: error.message
    });
  }
});

// Get single receipt
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT r.*, b.name as business_name 
      FROM receipts r 
      LEFT JOIN businesses b ON r.business_id = b.id 
      WHERE r.id = $1 AND r.user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({
      success: true,
      receipt: result.rows[0]
    });

  } catch (error) {
    logger.error('Error fetching receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipt',
      error: error.message
    });
  }
});

// Update receipt (user corrections)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      merchant_name,
      total_amount,
      receipt_date,
      category,
      extracted_items,
      notes,
      user_confirmed
    } = req.body;

    // Check if receipt belongs to user
    const checkQuery = 'SELECT id FROM receipts WHERE id = $1 AND user_id = $2';
    const checkResult = await pool.query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const updateQuery = `
      UPDATE receipts 
      SET 
        merchant_name = COALESCE($1, merchant_name),
        total_amount = COALESCE($2, total_amount),
        receipt_date = COALESCE($3, receipt_date),
        category = COALESCE($4, category),
        extracted_items = COALESCE($5, extracted_items),
        notes = COALESCE($6, notes),
        user_confirmed = COALESCE($7, user_confirmed),
        user_corrections = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      merchant_name,
      total_amount,
      receipt_date,
      category,
      extracted_items ? JSON.stringify(extracted_items) : null,
      notes,
      user_confirmed,
      JSON.stringify(req.body),
      id
    ];

    const result = await pool.query(updateQuery, values);

    res.json({
      success: true,
      receipt: result.rows[0],
      message: 'Receipt updated successfully'
    });

  } catch (error) {
    logger.error('Error updating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating receipt',
      error: error.message
    });
  }
});

// Delete receipt
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get receipt info for file deletion
    const receiptQuery = 'SELECT * FROM receipts WHERE id = $1 AND user_id = $2';
    const receiptResult = await pool.query(receiptQuery, [id, userId]);

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const receipt = receiptResult.rows[0];

    // Delete receipt from database
    const deleteQuery = 'DELETE FROM receipts WHERE id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [id, userId]);

    // Delete file from filesystem
    try {
      await fs.unlink(receipt.image_path);
    } catch (fileError) {
      logger.warn(`Failed to delete receipt file ${receipt.image_path}:`, fileError);
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting receipt',
      error: error.message
    });
  }
});

// Create auto-contribution from receipt analysis
router.post('/:id/auto-contribute', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Auto-contribution must be confirmed'
      });
    }

    // Get receipt details
    const receiptQuery = 'SELECT * FROM receipts WHERE id = $1 AND user_id = $2';
    const receiptResult = await pool.query(receiptQuery, [id, userId]);

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    const receipt = receiptResult.rows[0];
    const businessId = receipt.business_id;

    // Create auto-contribution
    const contributionResult = await receiptAnalysisService.createAutoContribution(
      userId,
      businessId,
      id,
      amount
    );

    res.json({
      success: true,
      contribution: contributionResult,
      message: 'Auto-contribution created successfully from receipt analysis'
    });

  } catch (error) {
    logger.error('Error creating auto-contribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating auto-contribution',
      error: error.message
    });
  }
});

// Get receipt analysis history
router.get('/analysis/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId, limit = 50 } = req.query;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const history = await receiptAnalysisService.getAnalysisHistory(businessId, userId, limit);

    res.json(history);

  } catch (error) {
    logger.error('Error fetching analysis history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
});

module.exports = router;