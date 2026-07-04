import { setupDropzone, showToast, toggleLoader } from './ui.js';
import { formatBytes, getBaseName, sanitizeFilename, escapeHTML } from './utils.js';
import { downloadTextAsFile, downloadZip } from './download.js';

// Global state for current results
let currentResults = [];
let baseFilename = '';

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    
    setupDropzone(dropzone, fileInput, handleFiles);
    
    downloadAllBtn.addEventListener('click', handleDownloadAll);
});

function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0]; // Process one file at a time
    const validExtensions = ['.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
        showToast('Format file tidak didukung. Harap unggah file .xlsx atau .xls', 'error');
        return;
    }
    
    processExcel(file);
}

function processExcel(file) {
    baseFilename = getBaseName(file.name);
    toggleLoader(true, `Membaca ${file.name}...`);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const data = e.target.result;
        
        // Initialize Web Worker
        const worker = new Worker('../js/workers/excel-worker.js');
        
        worker.onmessage = function(e) {
            const response = e.data;
            
            if (response.success) {
                currentResults = response.results;
                if (currentResults.length === 0) {
                    showToast('File Excel kosong atau tidak memiliki data yang valid.', 'error');
                    toggleLoader(false);
                    return;
                }
                renderResults();
                showToast(`Berhasil mengekstrak ${currentResults.length} sheet.`);
            } else {
                showToast(response.error, 'error');
            }
            
            toggleLoader(false);
            worker.terminate(); // Clean up worker
        };
        
        worker.onerror = function(error) {
            showToast('Terjadi kesalahan sistem saat memproses file.', 'error');
            console.error('Worker error:', error);
            toggleLoader(false);
            worker.terminate();
        };
        
        // Send data to worker
        worker.postMessage({
            data: data,
            filename: file.name
        });
    };
    
    reader.onerror = function() {
        showToast('Gagal membaca file dari sistem.', 'error');
        toggleLoader(false);
    };
    
    // Read file as ArrayBuffer for SheetJS
    reader.readAsArrayBuffer(file);
}

function renderResults() {
    const resultsContainer = document.getElementById('results');
    const fileList = document.getElementById('fileList');
    const sheetCount = document.getElementById('sheetCount');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    
    fileList.innerHTML = ''; // Clear previous
    sheetCount.textContent = currentResults.length;
    
    const isSingleSheet = currentResults.length === 1;
    
    currentResults.forEach((result, index) => {
        // Construct filename based on single vs multiple sheets
        const cleanSheetName = sanitizeFilename(result.sheetName);
        const cleanBaseName = sanitizeFilename(baseFilename);
        
        let outputFilename;
        if (isSingleSheet) {
            outputFilename = `${cleanBaseName}.csv`;
        } else {
            outputFilename = `${cleanBaseName} - ${cleanSheetName}.csv`;
        }
        
        // Store computed filename for download
        result.outputFilename = outputFilename;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'file-item';
        
        itemDiv.innerHTML = `
            <div class="file-item-header">
                <div class="file-info">
                    <span class="file-name">${escapeHTML(outputFilename)}</span>
                    <span class="file-meta">Asal sheet: ${escapeHTML(result.sheetName)} • ${result.rowCount} baris</span>
                </div>
                <button class="btn btn-secondary btn-sm download-single" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    Download CSV
                </button>
            </div>
        `;
        
        fileList.appendChild(itemDiv);
    });
    
    // Add event listeners to newly created buttons
    document.querySelectorAll('.download-single').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            const result = currentResults[index];
            downloadTextAsFile(result.csvContent, result.outputFilename, 'text/csv');
        });
    });
    
    resultsContainer.classList.add('active');
    downloadAllBtn.disabled = false;
}

async function handleDownloadAll() {
    if (currentResults.length === 0) return;
    
    // If only one file, just download it directly instead of ZIP
    if (currentResults.length === 1) {
        const result = currentResults[0];
        downloadTextAsFile(result.csvContent, result.outputFilename, 'text/csv');
        return;
    }
    
    toggleLoader(true, 'Membuat file ZIP...');
    
    try {
        const filesToZip = currentResults.map(result => ({
            name: result.outputFilename,
            content: result.csvContent
        }));
        
        const zipFilename = `${sanitizeFilename(baseFilename)}.zip`;
        await downloadZip(filesToZip, zipFilename);
        showToast('File ZIP berhasil diunduh.');
    } catch (error) {
        showToast('Gagal membuat ZIP file: ' + error.message, 'error');
    } finally {
        toggleLoader(false);
    }
}
