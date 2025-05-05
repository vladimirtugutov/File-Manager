import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { resolve } from 'path';
import { handleError } from '../utils/error.js';

export const hash = async (filePath) => {
  try {
    const absPath = resolve(filePath);
    const stream = createReadStream(absPath);
    const hash = createHash('sha256');

    stream.on('error', handleError);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      const result = hash.digest('hex');
      console.log(result);
    });
  } catch {
    handleError();
  }
};