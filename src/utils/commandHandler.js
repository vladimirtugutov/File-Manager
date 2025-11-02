import { up, cd, ls } from '../commands/nwd.js';
import { cat, add, rn, cp, mv, rm, mkdir, write } from '../commands/fs.js';
import { osCommand } from '../commands/os.js';
import { hash } from '../commands/hash.js';
import { compress, decompress } from '../commands/zip.js';

export const handleCommand = async (command, args) => {
  switch (command) {
    case 'up':
      up();
      break;
    case 'cd':
      await cd(args[0]);
      break;
    case 'ls':
      await ls();
      break;
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
    case 'os':
      osCommand(args[0]);
      break;
    case 'hash':
      await hash(args[0]);
      break;
    case 'compress':
      await compress(args[0], args[1]);
      break;
    case 'decompress':
      await decompress(args[0], args[1]);
      break;
    case 'write':
      await write(args[0], args.slice(1).join(' '));
      break;
    default:
      console.log('Invalid input');
  }
};
