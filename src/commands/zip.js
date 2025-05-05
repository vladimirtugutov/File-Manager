import { createReadStream, createWriteStream } from 'fs';
import { brotliCompress, brotliDecompress } from 'zlib';
import { pipeline } from 'stream/promises';
import { handleError } from '../utils/error.js';

export const compress = async (src, dest) => {
  try {
    await pipeline(
      createReadStream(src),
      brotliCompress(),
      createWriteStream(dest)
    );
  } catch {
    handleError();
  }
};

export const decompress = async (src, dest) => {
  try {
    await pipeline(
      createReadStream(src),
      brotliDecompress(),
      createWriteStream(dest)
    );
  } catch {
    handleError();
  }
};