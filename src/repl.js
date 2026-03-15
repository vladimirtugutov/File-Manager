import { up, cd, ls } from './navigation.js';
import { printCwd } from './utils/printCwd.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';
import { count } from './commands/count.js';
import { hash } from './commands/hash.js';
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';
import { decrypt } from './commands/decrypt.js';

const repl = global.repl;

const commands = {
  up,
  cd,
  ls,
  'csv-to-json': csvToJson,
  'json-to-csv': jsonToCsv,
  count,
  hash,
  'hash-compare': hashCompare,  
  encrypt,
  decrypt
};

const parseSimple = (input) => {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  return { command, args };
};

const handleInput = async (input) => {
  // console.log('Input:', input);
  
  if (input.trim() === '.exit') {
    repl.rl.close();
    return;
  }

  if (!input.trim()) {
    repl.rl.prompt();
    return;
  }

  const { command, args } = parseSimple(input);
  // console.log('Parsed:', command, args); // debug

  const cmdHandler = commands[command];
  if (!cmdHandler) {
    console.log('Invalid input');
    repl.rl.prompt();
    return;
  }

  try {
    await cmdHandler(args, repl.currentDir);
  } catch {
    console.log('Operation failed');
  }

  printCwd(repl.currentDir);
  repl.rl.prompt();
};

repl.rl.on('line', handleInput);
