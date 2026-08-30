const fs = require('fs');
fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'apikey': 'helloworld' },
    body: new URLSearchParams({
        base64Image: 'data:image/png;base64,' + Buffer.from('hello').toString('base64'),
        language: 'eng'
    })
}).then(r => r.json()).then(console.log).catch(console.error);
