import { createReadStream, createWriteStream } from 'fs';
import { resolve } from 'path';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { pipeline } from 'stream';
import { handleError } from '../utils/error.js';
import { promisify } from 'util';

const pipe = promisify(pipeline);

export const compress = async (source, destination) => {
  try {
    const src = resolve(source);
    const dest = resolve(destination);

    const readStream = createReadStream(src);
    const writeStream = createWriteStream(dest);
    const brotli = createBrotliCompress();

    await pipe(readStream, brotli, writeStream);
  } catch {
    handleError();
  }
};

export const decompress = async (source, destination) => {
    try {
      const src = resolve(source);
      const dest = resolve(destination);
  
      const readStream = createReadStream(src);
      const writeStream = createWriteStream(dest);
      const brotli = createBrotliDecompress();
  
      await pipe(readStream, brotli, writeStream);
    } catch {
      handleError();
    }
};