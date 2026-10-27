export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

export const sanitizeText = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

export const toBoolean = (value) => value === true || value === 'true';
