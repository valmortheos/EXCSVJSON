// CSV to JSON processing web worker
importScripts('../../vendor/papaparse.min.js');

self.addEventListener('message', (e) => {
    const { content, filename } = e.data;
    
    try {
        // Parse CSV using PapaParse
        Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // Auto convert numbers and booleans
            complete: function(results) {
                if (results.errors && results.errors.length > 0) {
                    // Extract meaningful error messages
                    const errMsgs = results.errors.map(err => `Baris ${err.row}: ${err.message}`).join('; ');
                    self.postMessage({
                        success: false,
                        error: `Kesalahan parsing CSV: ${errMsgs}`,
                        filename
                    });
                    return;
                }
                
                // Pretty print JSON with 2 spaces
                const jsonString = JSON.stringify(results.data, null, 2);
                
                self.postMessage({
                    success: true,
                    jsonContent: jsonString,
                    filename: filename,
                    rowCount: results.data.length
                });
            },
            error: function(error) {
                self.postMessage({
                    success: false,
                    error: error.message,
                    filename
                });
            }
        });
    } catch (error) {
        self.postMessage({
            success: false,
            error: error.message || 'Gagal memproses file CSV.',
            filename
        });
    }
});
