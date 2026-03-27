// Utility functions for common operations

// Format currency
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Calculate rating stars
export const getRatingStars = (rating) => {
  return "⭐".repeat(Math.floor(rating));
};

// Format dosage
export const formatDosage = (amount, unit = "kg") => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} tons`;
  }
  return `${amount} ${unit}`;
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Validate email
export const isValidEmail = (email) => {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(phone.replace(/\D/g, ""));
};

// Truncate text
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

// Storage utilities
export const storage = {
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};
