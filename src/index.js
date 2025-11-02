import { homedir } from 'os';
import { parseCommand } from './utils/parseInput.js';
import { handleCommand } from './utils/commandHandler.js';
import { printCwd } from './utils/printCwd.js';
import { handleError } from './utils/error.js';

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const username = usernameArg?.split('=')[1] || 'Anonymous';

process.chdir(homedir());

console.log(`Welcome to the File Manager, ${username}!`);
printCwd(process.cwd());

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', async (data) => {
  const input = data.toString().trim();

  if (input === '.exit') {
    exit();
    return;
  }

  const { command, args: cmdArgs } = parseCommand(input);

  try {
    await handleCommand(command, cmdArgs);
  } catch {
    handleError();
  }

  printCwd(process.cwd());
});

process.on('SIGINT', () => {
  exit();
});

function exit() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
}
