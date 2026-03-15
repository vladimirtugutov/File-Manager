import { createReadStream, createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { randomBytes, scrypt } from 'node:crypto';
import { createCipheriv } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const encrypt = async (args, cwd) => {
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

  const salt = randomBytes(16);
  const iv = randomBytes(12);

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

  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const inputStream = createReadStream(inputPath);
  const outputStream = createWriteStream(outputPath);

  outputStream.write(salt);
  outputStream.write(iv);

  try {
    await pipeline(inputStream, cipher, outputStream);

    const authTag = cipher.getAuthTag();

    const tagStream = createWriteStream(outputPath, { flags: 'a' });
    await new Promise((resolveAppend, rejectAppend) => {
      tagStream.write(authTag, (err) => {
        if (err) rejectAppend(err);
        else {
          tagStream.end();
        }
      });
      tagStream.on('finish', resolveAppend);
      tagStream.on('error', rejectAppend);
    });

    console.log('File encrypted');
  } catch {
    console.log('Operation failed');
  }
};
