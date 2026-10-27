#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const frontendDir = path.join(projectRoot, 'frontend', 'Poddar-Yogis-frontend', 'Poddar-Yogis-frontend');
const buildDir = path.join(frontendDir, 'build');

console.log('\n========================================================');
console.log('            🧘 Starting Yoga AI (Poddar Yogis) 🧘         ');
console.log('========================================================\n');

if (fs.existsSync(buildDir) && fs.existsSync(path.join(buildDir, 'index.html'))) {
  const PORT = process.env.PORT || 3000;
  
  const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.bin': 'application/octet-stream',
    '.ico': 'image/x-icon',
  };

  const server = http.createServer((req, res) => {
    let safePath = path.normalize(req.url.split('?')[0]);
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    
    let filePath = path.join(buildDir, safePath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(buildDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      }
    });
  });

  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`✅ Yoga AI is running at: ${url}`);
    console.log('Press Ctrl+C to stop.\n');

    const opener = process.platform === 'win32' ? `start ${url}` :
                   process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(opener);
  });
} else {
  console.log('Starting frontend development server...');
  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['start'], {
    cwd: frontendDir,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}
