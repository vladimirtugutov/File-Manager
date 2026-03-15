import { createReadStream, createWriteStream } from 'node:fs';
import { access, stat, readFile } from 'node:fs/promises';
import { scrypt } from 'node:crypto';
import { createDecipheriv } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const decrypt = async (args, cwd) => {
  const parsed = parseArgs(args);
  if (!parsed.input || !parsed.output || !parsed.password) {
    console.log('Invalid input');
    return;
  }

  const inputPath = resolvePath(parsed.input, cwd);
  const outputPath = resolvePath(parsed.output, cwd);
  const password = parsed.password;

  try {
    await access(inputPath);
  } catch {
    console.log('Operation failed');
    return;
  }

  let fileBuffer;
  try {
    fileBuffer = await readFile(inputPath);
  } catch {
    console.log('Operation failed');
    return;
  }

  if (fileBuffer.length < 44) {
    console.log('Operation failed');
    return;
  }

  const salt = fileBuffer.slice(0, 16);
  const iv = fileBuffer.slice(16, 28);
  const authTag = fileBuffer.slice(-16);
  const ciphertext = fileBuffer.slice(28, -16);

  let key;
  try {
    key = await new Promise((resolveKey, rejectKey) => {
      scrypt(password, salt, 32, (err, derivedKey) => {
        if (err) rejectKey(err);
        else resolveKey(derivedKey);
      });
    });
  } catch {
    console.log('Operation failed');
    return;
  }

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const inputStream = createReadStream(inputPath, { 
    start: 28, 
    end: fileBuffer.length - 17 
  });
  const outputStream = createWriteStream(outputPath);

  try {
    await pipeline(inputStream, decipher, outputStream);
    console.log('File decrypted');
  } catch {
    console.log('Operation failed');
  }
};
