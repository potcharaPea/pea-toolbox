// เซิร์ฟเวอร์ไฟล์นิ่งสำหรับทดสอบ: node serve.js <โฟลเดอร์> <พอร์ต>
const http = require('http'), fs = require('fs'), path = require('path');
const [root, port = 5500] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };
http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(path.resolve(root))) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p).toLowerCase()] || 'application/octet-stream' }); res.end(data); });
}).listen(port, '127.0.0.1', () => console.log('ready http://localhost:' + port));
