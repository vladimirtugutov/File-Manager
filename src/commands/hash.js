import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, writeFile } from 'node:fs/promises';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const hash = async (args, cwd) => {
  const parsed = parseArgs(args);
  if (!parsed.input) {
    console.log('Invalid input');
    return;
  }

  const inputPath = resolvePath(parsed.input, cwd);
  const algorithm = parsed.algorithm || 'sha256';
  
  const supported = ['sha256', 'md5', 'sha512'];
  if (!supported.includes(algorithm)) {
    console.log('Operation failed');
    return;
  }

  try {
    await access(inputPath);
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

    const result = `${algorithm}: ${hashObj.digest('hex')}`;
    console.log(result);

    if (parsed.saveHash) {
      const hashFile = `${inputPath}.${algorithm}`;
      await writeFile(hashFile, result.split(': ')[1] + '\n', 'utf8');
    }

  } catch {
    console.log('Operation failed');
  }
};
