const util = require('util');

const formatMessage = (message, meta) => {
  let formattedMeta = '';
  if (meta) {
    if (meta instanceof Error) {
      // For Error objects, we want to see the stack trace.
      // util.inspect provides a much better output than JSON.stringify for errors.
      formattedMeta = util.inspect(meta, { showHidden: false, depth: null, colors: false });
    } else if (typeof meta === 'object' && meta !== null) {
      try {
        // Handle circular references safely
        const cache = new Set();
        formattedMeta = JSON.stringify(meta, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
              return '[Circular]';
            }
            cache.add(value);
          }
          return value;
        }, 2);
      } catch (e) {
        formattedMeta = util.inspect(meta, { showHidden: false, depth: null, colors: false });
      }
    } else {
      formattedMeta = String(meta);
    }
    return `${message} ${formattedMeta}`;
  }
  return message;
};

const logger = {
  info: (message, meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${formatMessage(message, meta)}`);
  },
  
  error: (message, meta) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${formatMessage(message, meta)}`);
  },
  
  warn: (message, meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${formatMessage(message, meta)}`);
  },
  
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${formatMessage(message, meta)}`);
    }
  },
  
  success: (message, meta) => {
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${formatMessage(message, meta)}`);
  }
};

module.exports = logger;
