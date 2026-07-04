import { escapeHTML } from './utils.js';

/**
 * UI Manipulation Functions
 */

/**
 * Shows a toast notification.
 * @param {string} message 
 * @param {string} type - 'success' or 'error'
 */
export function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const iconSvg = type === 'success' 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="#4CAF50"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="#f44336"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';

    toast.innerHTML = `${iconSvg} <span>${escapeHTML(message)}</span>`;
    
    container.appendChild(toast);

    // Trigger reflow for animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

/**
 * Shows or hides the full screen loader.
 * @param {boolean} show 
 * @param {string} text - Optional text to display
 */
export function toggleLoader(show, text = 'Memproses...') {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    if (show) {
        const textElement = loader.querySelector('.loader-text');
        if (textElement) textElement.textContent = text;
        loader.classList.add('active');
    } else {
        loader.classList.remove('active');
    }
}

/**
 * Sets up drag and drop handlers for a dropzone.
 * @param {HTMLElement} dropzone 
 * @param {HTMLInputElement} fileInput 
 * @param {Function} onFilesDropped - Callback when files are provided
 */
export function setupDropzone(dropzone, fileInput, onFilesDropped) {
    if (!dropzone || !fileInput) return;

    // Highlight on drag
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            onFilesDropped(files);
        }
    });

    // Handle click to open file dialog
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesDropped(e.target.files);
        }
        // Reset input so the same file can be selected again
        e.target.value = '';
    });
}
