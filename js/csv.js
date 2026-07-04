import { setupDropzone, showToast, toggleLoader } from './ui.js';
import { getBaseName, sanitizeFilename, escapeHTML } from './utils.js';
import { downloadTextAsFile, downloadZip } from './download.js';

// Global state for processed files
let processedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    
    setupDropzone(dropzone, fileInput, handleFiles);
    
    downloadAllBtn.addEventListener('click', handleDownloadAll);
});

async function handleFiles(files) {
    if (files.length === 0) return;
    
    const validFiles = Array.from(files).filter(file => {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return ext === '.csv';
    });
    
    if (validFiles.length !== files.length) {
        showToast('Beberapa file diabaikan karena bukan format .csv', 'error');
    }
    
    if (validFiles.length === 0) return;
    
    toggleLoader(true, `Memproses ${validFiles.length} file CSV...`);
    
    // Clear previous results when new files are added
    processedFiles = [];
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('fileCount').textContent = '0';
    document.getElementById('results').classList.remove('active');
    document.getElementById('downloadAllBtn').disabled = true;
    
    // Process files sequentially to maintain order and not overwhelm memory/worker
    let successCount = 0;
    
    for (const file of validFiles) {
        try {
            const result = await processCsvFile(file);
            processedFiles.push(result);
            successCount++;
        } catch (error) {
            showToast(`Gagal memproses ${file.name}: ${error}`, 'error');
        }
    }
    
    if (processedFiles.length > 0) {
        renderResults();
        showToast(`Berhasil memproses ${successCount} file CSV.`);
    }
    
    toggleLoader(false);
}

function processCsvFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            
            const worker = new Worker('../js/workers/csv-worker.js');
            
            worker.onmessage = function(event) {
                const response = event.data;
                worker.terminate();
                
                if (response.success) {
                    const cleanBaseName = sanitizeFilename(getBaseName(file.name));
                    resolve({
                        originalFilename: file.name,
                        outputFilename: `${cleanBaseName}.json`,
                        jsonContent: response.jsonContent,
                        rowCount: response.rowCount
                    });
                } else {
                    reject(response.error);
                }
            };
            
            worker.onerror = function(error) {
                worker.terminate();
                reject('Worker runtime error');
            };
            
            // Send to worker
            worker.postMessage({
                content: content,
                filename: file.name
            });
        };
        
        reader.onerror = function() {
            reject('Gagal membaca file dari sistem');
        };
        
        // Read as Text since it's CSV
        reader.readAsText(file);
    });
}

function renderResults() {
    const resultsContainer = document.getElementById('results');
    const fileList = document.getElementById('fileList');
    const fileCount = document.getElementById('fileCount');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    
    fileCount.textContent = processedFiles.length;
    
    processedFiles.forEach((result, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'file-item';
        
        // Preview: Truncate JSON string if it's too long to prevent UI freezing on render
        const maxPreviewLength = 1000;
        let previewStr = result.jsonContent;
        if (previewStr.length > maxPreviewLength) {
            previewStr = previewStr.substring(0, maxPreviewLength) + '\n\n... (Terpotong, unduh file untuk melihat keseluruhan)';
        }
        
        itemDiv.innerHTML = `
            <div class="file-item-header">
                <div class="file-info">
                    <span class="file-name">${escapeHTML(result.outputFilename)}</span>
                    <span class="file-meta">Dari: ${escapeHTML(result.originalFilename)} • ${result.rowCount} item</span>
                </div>
                <button class="btn btn-secondary btn-sm download-single" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    Download JSON
                </button>
            </div>
            <pre class="json-preview">${escapeHTML(previewStr)}</pre>
        `;
        
        fileList.appendChild(itemDiv);
    });
    
    // Add event listeners
    document.querySelectorAll('.download-single').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            const result = processedFiles[index];
            downloadTextAsFile(result.jsonContent, result.outputFilename, 'application/json');
        });
    });
    
    resultsContainer.classList.add('active');
    downloadAllBtn.disabled = false;
}

async function handleDownloadAll() {
    if (processedFiles.length === 0) return;
    
    if (processedFiles.length === 1) {
        const result = processedFiles[0];
        downloadTextAsFile(result.jsonContent, result.outputFilename, 'application/json');
        return;
    }
    
    toggleLoader(true, 'Membuat file ZIP...');
    
    try {
        const filesToZip = processedFiles.map(result => ({
            name: result.outputFilename,
            content: result.jsonContent
        }));
        
        const zipFilename = `json_results_${Date.now()}.zip`;
        await downloadZip(filesToZip, zipFilename);
        showToast('File ZIP berhasil diunduh.');
    } catch (error) {
        showToast('Gagal membuat ZIP file: ' + error.message, 'error');
    } finally {
        toggleLoader(false);
    }
}
