#!/usr/bin/env node

console.log('DEBUG: import.meta.url:', import.meta.url);
console.log('DEBUG: process.argv[1]:', process.argv[1]);
console.log('DEBUG: file:// + process.argv[1]:', `file://${process.argv[1]}`);
console.log('DEBUG: Are they equal?', import.meta.url === `file://${process.argv[1]}`);

// Import and run the server
import('./dist/server.js');