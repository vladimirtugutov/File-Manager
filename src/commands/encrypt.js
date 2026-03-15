import { createReadStream, createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes, scrypt } from 'node:crypto';
import { createCipheriv } from 'node:crypto';
import { pipeline } from 'node:stream/promises';

export const encrypt = async (args, cwd) => {
  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');
  const passwordIndex = args.indexOf('--password');

  if (
    inputIndex === -1 || outputIndex === -1 || passwordIndex === -1 ||
    inputIndex + 1 >= args.length ||
    outputIndex + 1 >= args.length ||
    passwordIndex + 1 >= args.length
  ) {
    console.log('Invalid input');
    return;
  }

  const inputFile = args[inputIndex + 1];
  const outputFile = args[outputIndex + 1];
  const password = args[passwordIndex + 1];

  const inputPath = resolve(cwd, inputFile);
  const outputPath = resolve(cwd, outputFile);

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
