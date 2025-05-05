import fs from 'fs';
import { stat, access, constants } from 'fs/promises';
import { join, basename, dirname, resolve } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { handleError } from '../utils/error.js';
import { printCwd } from '../utils/printCwd.js';

export const cat = async (filePath) => {
    try {
      const absPath = resolve(filePath);
      const stream = createReadStream(absPath, { encoding: 'utf-8' });
  
      stream.pipe(process.stdout);
  
      stream.on('end', () => {
        console.log();
      });
  
      stream.on('error', () => {
        handleError();
      });
    } catch {
      handleError();
    }
  };

export const add = async (filename) => {
  try {
    await fs.promises.writeFile(join(process.cwd(), filename), '');
    printCwd(process.cwd());
  } catch {
    handleError();
  }
};

export const mkdir = async (dirname) => {
  try {
    await fs.promises.mkdir(join(process.cwd(), dirname));
    printCwd(process.cwd());
  } catch {
    handleError();
  }
};

export const rn = async (path, newName) => {
  try {
    const dir = dirname(path);
    const newPath = join(dir, newName);
    await fs.promises.rename(path, newPath);
    printCwd(process.cwd());
  } catch {
    handleError();
  }
};

export const cp = async (source, target) => {
    try {
      const sourcePath = resolve(source);
      let targetPath = resolve(target);
  
      try {
        const targetStats = await stat(targetPath);
        if (targetStats.isDirectory()) {
          targetPath = join(targetPath, basename(sourcePath));
        }
      } catch {
      }
  
      await access(sourcePath, constants.F_OK);
  
      const readStream = createReadStream(sourcePath);
      const writeStream = createWriteStream(targetPath);
  
      readStream.on('error', handleError);
      writeStream.on('error', handleError);
  
      readStream.pipe(writeStream);
    } catch {
      handleError();
    }
};

export const mv = async (src, dest) => {
    try {
      const sourcePath = resolve(src);
      let destinationPath = resolve(dest);
  
      try {
        const destStat = await stat(destinationPath);
        if (destStat.isDirectory()) {
          destinationPath = join(destinationPath, basename(sourcePath));
        }
      } catch {
      }
  
      await fs.promises.copyFile(sourcePath, destinationPath);
      await fs.promises.unlink(sourcePath);
      printCwd(process.cwd());
    } catch {
      handleError();
    }
};

export const rm = async (path) => {
  try {
    await fs.promises.rm(path);
    printCwd(process.cwd());
  } catch {
    handleError();
  }
};