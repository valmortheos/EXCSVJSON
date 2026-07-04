/**
 * Utility Functions
 */

/**
 * Format bytes to human readable format (KB, MB, etc.)
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Escapes HTML characters in a string to prevent XSS.
 * @param {string} unsafe 
 * @returns {string}
 */
export function escapeHTML(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

/**
 * Generate a clean filename from original filename
 * @param {string} filename 
 * @param {string} extension (e.g., '.csv', '.json')
 * @returns {string}
 */
export function getBaseName(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
}

/**
 * Strip invalid characters for file naming
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeFilename(str) {
    return str.replace(/[\\/:"*?<>|]+/g, '_');
}
