const express = require('express');
const router = express.Router();
const languageService = require('../services/languageService');
const logger = require('../utils/logger');

// Get supported languages
router.get('/supported', (req, res) => {
  try {
    const supportedLanguages = languageService.getSupportedLanguages();
    
    res.json({
      success: true,
      languages: supportedLanguages.map(lang => ({
        code: lang,
        name: lang === 'en' ? 'English' : 'Bahasa Melayu',
        nativeName: lang === 'en' ? 'English' : 'Bahasa Melayu'
      })),
      defaultLanguage: languageService.defaultLanguage
    });
  } catch (error) {
    logger.error('Error fetching supported languages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supported languages',
      error: error.message
    });
  }
});

// Get all translations for a specific language
router.get('/translations/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    
    if (!languageService.isLanguageSupported(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const translations = languageService.getTranslations(lang);
    
    res.json({
      success: true,
      language: lang,
      translations
    });
  } catch (error) {
    logger.error('Error fetching translations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching translations',
      error: error.message
    });
  }
});

// Translate a specific key
router.post('/translate', (req, res) => {
  try {
    const { key, language = 'en' } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Translation key is required'
      });
    }
    
    if (!languageService.isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const translation = languageService.translate(key, language);
    
    res.json({
      success: true,
      key,
      language,
      translation
    });
  } catch (error) {
    logger.error('Error translating key:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating key',
      error: error.message
    });
  }
});

// Format currency
router.post('/format-currency', (req, res) => {
  try {
    const { amount, language = 'en' } = req.body;
    
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }
    
    if (!languageService.isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const formattedCurrency = languageService.formatCurrency(parseFloat(amount), language);
    
    res.json({
      success: true,
      amount,
      language,
      formattedCurrency
    });
  } catch (error) {
    logger.error('Error formatting currency:', error);
    res.status(500).json({
      success: false,
      message: 'Error formatting currency',
      error: error.message
    });
  }
});

// Format date
router.post('/format-date', (req, res) => {
  try {
    const { date, language = 'en' } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    if (!languageService.isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const formattedDate = languageService.formatDate(date, language);
    
    res.json({
      success: true,
      date,
      language,
      formattedDate
    });
  } catch (error) {
    logger.error('Error formatting date:', error);
    res.status(500).json({
      success: false,
      message: 'Error formatting date',
      error: error.message
    });
  }
});

// Get localized business types
router.get('/business-types/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    
    if (!languageService.isLanguageSupported(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const businessTypes = [
      'restaurant',
      'retail',
      'services',
      'manufacturing',
      'agriculture',
      'construction'
    ];
    
    const localizedBusinessTypes = businessTypes.map(type => ({
      key: type,
      name: languageService.getLocalizedBusinessType(type, lang)
    }));
    
    res.json({
      success: true,
      language: lang,
      businessTypes: localizedBusinessTypes
    });
  } catch (error) {
    logger.error('Error fetching localized business types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching localized business types',
      error: error.message
    });
  }
});

// Get localized states
router.get('/states/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    
    if (!languageService.isLanguageSupported(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const states = [
      'kuala_lumpur',
      'selangor',
      'penang',
      'johor',
      'kelantan',
      'terengganu',
      'pahang',
      'perak',
      'kedah',
      'perlis',
      'negeri_sembilan',
      'melaka',
      'sabah',
      'sarawak'
    ];
    
    const localizedStates = states.map(state => ({
      key: state,
      name: languageService.getLocalizedStateName(state, lang)
    }));
    
    res.json({
      success: true,
      language: lang,
      states: localizedStates
    });
  } catch (error) {
    logger.error('Error fetching localized states:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching localized states',
      error: error.message
    });
  }
});

// Get localized risk levels
router.get('/risk-levels/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    
    if (!languageService.isLanguageSupported(lang)) {
      return res.status(400).json({
        success: false,
        message: 'Language not supported',
        supportedLanguages: languageService.getSupportedLanguages()
      });
    }
    
    const riskLevels = [
      'low_risk',
      'medium_risk',
      'high_risk',
      'critical_risk'
    ];
    
    const localizedRiskLevels = riskLevels.map(level => ({
      key: level,
      name: languageService.getLocalizedRiskLevel(level, lang)
    }));
    
    res.json({
      success: true,
      language: lang,
      riskLevels: localizedRiskLevels
    });
  } catch (error) {
    logger.error('Error fetching localized risk levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching localized risk levels',
      error: error.message
    });
  }
});

module.exports = router;