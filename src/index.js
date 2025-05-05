import { homedir } from 'os';
import { up, cd, ls } from './commands/nwd.js';
import { cat, add, rn, cp, mv, rm, mkdir } from './commands/fs.js';
import { osCommand } from './commands/os.js';
import { hash } from './commands/hash.js';
import { compress, decompress } from './commands/zip.js';
import { printCwd } from './utils/printCwd.js';
import { handleError } from './utils/error.js';

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));
const username = usernameArg?.split('=')[1] || 'Anonymous';

// Start in user's home dir
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

  const [command, ...args] = input.split(' ');

  try {
    switch (command) {
      // Navigation
      case 'up':
        up();
        break;
      case 'cd':
        await cd(args[0]);
        break;
      case 'ls':
        await ls();
        break;

      // File operations
      case 'cat':
        await cat(args[0]);
        break;
      case 'add':
        await add(args[0]);
        break;
      case 'rn':
        await rn(args[0], args[1]);
        break;
      case 'cp':
        await cp(args[0], args[1]);
        break;
      case 'mv':
        await mv(args[0], args[1]);
        break;
      case 'rm':
        await rm(args[0]);
        break;
      case 'mkdir':
        await mkdir(args[0]);
        break;

      // OS info
      case 'os':
        osCommand(args[0]);
        break;

      // Hashing
      case 'hash':
        await hash(args[0]);
        break;

      // Compression
      case 'compress':
        await compress(args[0], args[1]);
        break;
      case 'decompress':
        await decompress(args[0], args[1]);
        break;

      default:
        console.log('Invalid input');
    }
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