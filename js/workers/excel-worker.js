// Excel processing web worker
// Ensure path resolves correctly relative to where worker is instantiated
importScripts('../../vendor/xlsx.full.min.js');

self.addEventListener('message', (e) => {
    const { data, filename } = e.data;
    
    try {
        // Read the ArrayBuffer using SheetJS
        const workbook = XLSX.read(data, { type: 'array' });
        
        const results = [];
        
        // Iterate through all sheets
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to CSV string
            const csv = XLSX.utils.sheet_to_csv(worksheet, {
                blankrows: false
            });
            
            // Only add if there is data
            if (csv.trim().length > 0) {
                // Calculate rough row count
                const rowCount = (csv.match(/\n/g) || []).length;
                
                results.push({
                    sheetName,
                    csvContent: csv,
                    rowCount
                });
            }
        });
        
        self.postMessage({
            success: true,
            results: results,
            originalFilename: filename
        });
    } catch (error) {
        self.postMessage({
            success: false,
            error: error.message || 'Gagal memproses file Excel.'
        });
    }
});
