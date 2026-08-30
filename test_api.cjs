const fs = require('fs');
const image = fs.readFileSync('./ios_simulator_screenshot.png', {encoding: 'base64'});
fetch('http://67.205.172.107:3003/api/detect', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ image: 'data:image/png;base64,' + image })
}).then(async r => console.log(r.status, await r.text())).catch(e => console.error(e));
