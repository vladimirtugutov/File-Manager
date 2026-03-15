import { chdir } from 'node:process';
import { resolve, sep } from 'node:path';
import { readdir } from 'node:fs/promises';

export const up = () => {
  const current = global.repl.currentDir;
  const parent = resolve(current, '..');
  const root = resolve(current).split(sep)[0] + sep;
  
  if (parent !== root) {
    global.repl.currentDir = parent;
  }
};

export const cd = async (args) => {
  if (!args[0]) {
    console.log('Invalid input');
    return;
  }
  
  const targetPath = resolve(global.repl.currentDir, args[0]);
  
  try {
    chdir(targetPath);
    global.repl.currentDir = targetPath;
  } catch {
    console.log('Operation failed');
  }
};

export const ls = async () => {
  try {
    const files = await readdir(global.repl.currentDir, { withFileTypes: true });
    const dirs = [];
    const filesList = [];

    for (const file of files) {
      const entry = { Name: file.name, Type: file.isDirectory() ? 'directory' : 'file' };
      if (file.isDirectory()) {
        dirs.push(entry);
      } else {
        filesList.push(entry);
      }
    }

    dirs.sort((a, b) => a.Name.localeCompare(b.Name));
    filesList.sort((a, b) => a.Name.localeCompare(b.Name));

    console.table([...dirs, ...filesList]);
  } catch {
    console.log('Operation failed');
  }
};
