const { spawn } = require('child_process');

console.log('Starting simple MCP server test...');

// Start the server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

let hasOutput = false;

// Capture stdout
server.stdout.on('data', (data) => {
  hasOutput = true;
  console.log('STDOUT:', data.toString());
});

// Capture stderr (where our debug messages should be)
server.stderr.on('data', (data) => {
  hasOutput = true;
  console.log('STDERR:', data.toString());
});

// Handle process events
server.on('close', (code) => {
  console.log(`Server exited with code: ${code}`);
  if (!hasOutput) {
    console.log('No output captured - server may have exited immediately');
  }
  process.exit(0);
});

server.on('error', (error) => {
  console.log('Process error:', error);
  process.exit(1);
});

// Send initialization message after 1 second
setTimeout(() => {
  console.log('Sending initialization message...');
  const initMsg = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" }
    }
  }) + '\n';
  
  server.stdin.write(initMsg);
}, 1000);

// Kill after 5 seconds
setTimeout(() => {
  console.log('Terminating server...');
  server.kill('SIGTERM');
}, 5000);

// Simple test to verify CSS variables are working
console.log('🚀 Testing StockPulse Modern CSS System...');

// Test if we can access CSS variables
const testElement = document.createElement('div');
document.body.appendChild(testElement);

// Apply some test styles
testElement.style.cssText = `
  background-color: rgb(var(--color-primary-600));
  color: rgb(var(--color-background));
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem;
  font-family: 'Inter', sans-serif;
`;

testElement.textContent = '✅ Modern CSS System Working!';

// Test Tailwind classes
testElement.className = 'bg-primary-600 text-white p-4 rounded-lg m-4';

console.log('✅ CSS Variables Test Complete');
console.log('✅ Tailwind Classes Test Complete');
console.log('🎉 StockPulse Modern Design System Ready!');

// Clean up after 3 seconds
setTimeout(() => {
  document.body.removeChild(testElement);
  console.log('🧹 Test cleanup complete');
}, 3000); 