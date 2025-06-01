const { spawn } = require('child_process');

console.log('Starting MCP server test...');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  console.log('Final output:', output);
  console.log('Final error output:', errorOutput);
  process.exit(0);
});

server.on('error', (error) => {
  console.log('Process error:', error);
  process.exit(1);
});

// Send a simple initialization message after a short delay
setTimeout(() => {
  console.log('Sending initialization message...');
  const initMessage = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  }) + '\n';
  
  server.stdin.write(initMessage);
}, 1000);

// Kill after 5 seconds
setTimeout(() => {
  console.log('Killing server after timeout...');
  server.kill();
}, 5000); 