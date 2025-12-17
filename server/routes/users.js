const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const logger = require('../utils/logger');

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT id, full_name, email, phone_number, role, preferred_language, 
             is_active, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  body('full_name').optional().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('preferred_language').optional().isIn(['en', 'ms', 'zh', 'ta']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { full_name, email, preferred_language } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (full_name) {
      updateFields.push(`full_name = $${paramIndex++}`);
      updateValues.push(full_name);
    }
    if (email) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (preferred_language) {
      updateFields.push(`preferred_language = $${paramIndex++}`);
      updateValues.push(preferred_language);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, full_name, email, phone_number, preferred_language, updated_at
    `;
    
    const result = await db.query(query, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Soft delete - set is_active to false
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await db.query(query, [userId]);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;