// Fix for import.meta.dirname in ESM context
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Add support for __dirname and __filename in ES modules
if (typeof global.__dirname === 'undefined') {
  Object.defineProperty(global, '__dirname', {
    get() {
      const fileUrl = import.meta.url;
      return dirname(fileURLToPath(fileUrl));
    }
  });
}

if (typeof global.__filename === 'undefined') {
  Object.defineProperty(global, '__filename', {
    get() {
      return fileURLToPath(import.meta.url);
    }
  });
}

// Add support for require in ES modules
if (typeof global.require === 'undefined') {
  Object.defineProperty(global, 'require', {
    get() {
      return createRequire(import.meta.url);
    }
  });
}

// Define import.meta.dirname if not defined
if (typeof import.meta.dirname === 'undefined') {
  Object.defineProperty(import.meta, 'dirname', {
    get() {
      return dirname(fileURLToPath(import.meta.url));
    }
  });
}

console.log('Path polyfills initialized for ESM modules');