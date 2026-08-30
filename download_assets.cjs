const https = require('https');
const fs = require('fs');

const download = (url, path) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, path).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(path);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
};

fs.mkdirSync('public/assets/ob', { recursive: true });

Promise.all([
  download('https://images.pokemontcg.io/swsh7/215_hires.png', 'public/assets/ob/card1.png'),
  download('https://cdn.rebrickable.com/media/sets/75192-1/1.jpg', 'public/assets/ob/lego1.jpg')
]).then(() => console.log('Done')).catch(console.error);
