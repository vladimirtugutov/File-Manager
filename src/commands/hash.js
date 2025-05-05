import { createReadStream } from 'fs';
import { createHash } from 'crypto';
import { handleError } from '../utils/error.js';

export const hash = async (path) => {
  try {
    const stream = createReadStream(path);
    const hash = createHash('sha256');
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => {
      console.log(hash.digest('hex'));
    });
  } catch {
    handleError();
  }
};