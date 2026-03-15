import { homedir } from 'os';
import readline from 'node:readline';
import { printCwd } from './utils/printCwd.js';

let currentDir = homedir();

console.log('Welcome to Data Processing CLI!');
printCwd(currentDir);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();

global.repl = { rl, currentDir };

import('./repl.js').catch(console.error);

rl.on('close', () => {
  console.log('Thank you for using Data Processing CLI!');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nThank you for using Data Processing CLI!');
  process.exit(0);
});
