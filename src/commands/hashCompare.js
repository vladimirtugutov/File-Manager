import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, access } from 'node:fs/promises';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const hashCompare = async (args, cwd) => {
  const parsed = parseArgs(args);
  if (!parsed.input || !parsed.hashFile) {
    console.log('Invalid input');
    return;
  }

  const inputPath = resolvePath(parsed.input, cwd);
  const hashPath = resolvePath(parsed.hashFile, cwd);
  
  const algorithm = parsed.algorithm || 'sha256';

  const supported = ['sha256', 'md5', 'sha512'];
  if (!supported.includes(algorithm)) {
    console.log('Operation failed');
    return;
  }

  try {
    await access(inputPath);
    await access(hashPath);
  } catch {
    console.log('Operation failed');
    return;
  }

  let expectedHash;
  try {
    expectedHash = (await readFile(hashPath, 'utf8')).trim().toLowerCase();
  } catch {
    console.log('Operation failed');
    return;
  }

  const hashObj = createHash(algorithm);
  const fileStream = createReadStream(inputPath);

  fileStream.on('data', (chunk) => hashObj.update(chunk));
  
  try {
    await new Promise((resolve, reject) => {
      fileStream.on('end', () => resolve());
      fileStream.on('error', reject);
    });

    const actualHash = hashObj.digest('hex').toLowerCase();
    
    if (actualHash === expectedHash) {
      console.log('OK');
    } else {
      console.log('MISMATCH');
    }

  } catch {
    console.log('Operation failed');
  }
};
