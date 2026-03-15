import { createReadStream } from 'node:fs';
import { Transform } from 'node:stream';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

export const count = async (args, cwd) => {
  console.log(args, cwd);
  
  const inputIndex = args.indexOf('--input');
  
  if (inputIndex === -1 || inputIndex + 1 >= args.length) {
    console.log('Invalid input');
    return;
  }

  const inputFile = args[inputIndex + 1];
  const inputPath = resolve(cwd, inputFile);

  try {
    await access(inputPath);
  } catch {
    console.log('Operation failed');
    return;
  }

  const fileStream = createReadStream(inputPath, 'utf8');
  
  let lines = 0;
  let words = 0;
  let chars = 0;

  fileStream.on('data', (chunk) => {
    chars += chunk.length;
    
    const lineBreaks = (chunk.match(/\n/g) || []).length;
    lines += lineBreaks;
    if (!chunk.endsWith('\n')) lines += 1;
    
    const trimmed = chunk.trim();
    if (trimmed) {
      const wordMatches = trimmed.match(/\S+/g) || [];
      words += wordMatches.length;
    }
  });

  try {
    await new Promise((resolve, reject) => {
      fileStream.on('end', () => resolve());
      fileStream.on('error', reject);
    });
    
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${chars}`);
    
  } catch {
    console.log('Operation failed');
  }
};
