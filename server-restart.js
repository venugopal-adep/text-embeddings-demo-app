// server-restart.js - Script to restart the Express server
const { exec } = require('child_process');
const path = require('path');

console.log('Stopping any running node processes...');

// Kill any existing node processes
const killCommand = process.platform === 'win32' ? 'taskkill /F /IM node.exe' : 'pkill -f node';

exec(killCommand, (error) => {
  // Ignore errors from kill command as there might not be any processes running
  console.log('Starting server...');
  
  // Start the server with nodemon if available
  const startCommand = 'node index.js';
  
  const child = exec(startCommand, {
    cwd: __dirname
  });
  
  child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  child.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
  
  console.log('Server is starting. Please check the console for errors.');
});