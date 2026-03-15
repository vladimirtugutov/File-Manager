import { up, cd, ls } from './navigation.js';
import { printCwd } from './utils/printCwd.js';

const repl = global.repl;

const commands = {
  up,
  cd,
  ls
};

const parseSimple = (input) => {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  return { command, args };
};

export const handleInput = async (input) => {
  if (input.trim() === '.exit') {
    repl.rl.close();
    return;
  }

  if (!input.trim()) {
    repl.rl.prompt();
    return;
  }

  const { command, args } = parseSimple(input);

  if (!commands[command]) {
    console.log('Invalid input');
    repl.rl.prompt();
    return;
  }

  try {
    await commands[command](args);
  } catch {
    console.log('Operation failed');
  }

  printCwd(repl.currentDir);
  repl.rl.prompt();
};

repl.rl.on('line', handleInput);
