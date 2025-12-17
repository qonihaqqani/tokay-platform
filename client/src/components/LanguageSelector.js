import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

const LanguageSelector = ({ variant = 'outlined', size = 'small', showLabel = true }) => {
  const { language, supportedLanguages, changeLanguage, loading, translate } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    changeLanguage(newLanguage);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (loading && supportedLanguages.length === 0) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <LanguageIcon fontSize="small" />
        <CircularProgress size={16} />
      </Box>
    );
  }

  return (
    <FormControl variant={variant} size={size}>
      {showLabel && (
        <InputLabel id="language-select-label">
          {translate('settings', 'Settings')}
        </InputLabel>
      )}
      <Select
        labelId="language-select-label"
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        onOpen={handleOpen}
        onClose={handleClose}
        label={showLabel ? translate('settings', 'Settings') : undefined}
        startAdornment={<LanguageIcon fontSize="small" sx={{ mr: 1 }} />}
        sx={{ minWidth: 120 }}
      >
        {supportedLanguages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                {lang.nativeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({lang.name})
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;