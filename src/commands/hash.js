import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { handleError } from '../utils/error.js';

export const hash = async (filePath) => {
  return new Promise((resolvePromise, rejectPromise) => {
    try {
      const absPath = resolve(filePath);
      const stream = createReadStream(absPath);
      const hashObj = createHash('sha256');

      stream.on('error', () => {
        handleError();
        rejectPromise();
      });

      stream.on('data', (chunk) => {
        hashObj.update(chunk);
      });

      stream.on('end', () => {
        const result = hashObj.digest('hex');
        console.log(result);
        resolvePromise();
      });
    } catch {
      handleError();
      rejectPromise();
    }
  });
};
