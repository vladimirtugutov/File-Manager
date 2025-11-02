import { chdir, cwd } from 'process';
import { resolve, sep } from 'path';
import { handleError } from '../utils/error.js';
import { printCwd } from '../utils/printCwd.js';
import fs from 'fs/promises';

export const up = () => {
  try {
    const current = cwd();
    const root = resolve(current).split(sep)[0] + sep;
    if (resolve(current) !== root) {
      chdir(resolve(current, '..'));
    }
  } catch {
    handleError();
  }
};

export const cd = async (path) => {
  try {
    chdir(path);
  } catch {
    handleError();
  }
};

export const ls = async () => {
  try {
    const files = await fs.readdir(cwd(), { withFileTypes: true });
    const dirs = [];
    const regulars = [];

    for (const file of files) {
      const entry = { Name: file.name, Type: file.isDirectory() ? 'directory' : 'file' };
      file.isDirectory() ? dirs.push(entry) : regulars.push(entry);
    }

    const result = [...dirs.sort((a, b) => a.Name.localeCompare(b.Name)),
                    ...regulars.sort((a, b) => a.Name.localeCompare(b.Name))];

    console.table(result);
    printCwd(cwd());
  } catch {
    handleError();
  }
};