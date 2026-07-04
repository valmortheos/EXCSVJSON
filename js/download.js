/**
 * Download functionality
 */

/**
 * Triggers a download of a Blob.
 * @param {Blob} blob 
 * @param {string} filename 
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Triggers download of text content as a file.
 * @param {string} content 
 * @param {string} filename 
 * @param {string} mimeType 
 */
export function downloadTextAsFile(content, filename, mimeType = 'text/plain') {
    // Add BOM for CSV to ensure proper UTF-8 handling in Excel
    const dataArray = [];
    if (mimeType.includes('csv')) {
        dataArray.push(new Uint8Array([0xEF, 0xBB, 0xBF])); // UTF-8 BOM
    }
    dataArray.push(content);
    
    const blob = new Blob(dataArray, { type: `${mimeType};charset=utf-8;` });
    downloadBlob(blob, filename);
}

/**
 * Creates and downloads a ZIP file containing multiple files.
 * Uses JSZip (must be loaded globally).
 * @param {Array<{name: string, content: string}>} files 
 * @param {string} zipFilename 
 */
export async function downloadZip(files, zipFilename) {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library not found');
    }

    const zip = new JSZip();
    
    files.forEach(file => {
        zip.file(file.name, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    downloadBlob(content, zipFilename);
}
