const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(data ? { data } : {}),
  });
};

export const logger = {
  error: (message, data) => {
    console.error(`[ERROR] ${formatLog(LOG_LEVELS.ERROR, message, data)}`);
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${formatLog(LOG_LEVELS.WARN, message, data)}`);
  },
  info: (message, data) => {
    console.log(`[INFO] ${formatLog(LOG_LEVELS.INFO, message, data)}`);
  },
  debug: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${formatLog(LOG_LEVELS.DEBUG, message, data)}`);
    }
  },
};

export default logger;
