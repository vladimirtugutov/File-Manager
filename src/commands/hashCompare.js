import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

export const hashCompare = async (args, cwd) => {
  const inputIndex = args.indexOf('--input');
  const hashIndex = args.indexOf('--hash');
  
  if (inputIndex === -1 || hashIndex === -1 || 
      inputIndex + 1 >= args.length || hashIndex + 1 >= args.length) {
    console.log('Invalid input');
    return;
  }

  const inputFile = args[inputIndex + 1];
  const hashFile = args[hashIndex + 1];
  const inputPath = resolve(cwd, inputFile);
  const hashPath = resolve(cwd, hashFile);
  
  const algorithm = args.includes('--algorithm') 
    ? args[args.indexOf('--algorithm') + 1] 
    : 'sha256';

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
