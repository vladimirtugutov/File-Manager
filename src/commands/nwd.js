import { dirname, resolve, sep } from 'path';
import { chdir, cwd } from 'process';
import { handleError } from '../utils/error.js';
import { printCwd } from '../utils/printCwd.js';

export const up = () => {
  try {
    const current = cwd();
    const root = resolve(current).split(sep)[0] + sep;

    if (resolve(current) !== root) {
      chdir(resolve(current, '..'));
    }
    printCwd(cwd());
  } catch {
    handleError();
  }
};

export const cd = (path) => {
  try {
    chdir(path);
    printCwd(cwd());
  } catch {
    handleError();
  }
};

export const ls = () => {
  console.log('ls command called');
};