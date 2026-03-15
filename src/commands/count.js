import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const count = async (args, cwd) => {
  const parsed = parseArgs(args);
  if (!parsed.input) {
    console.log('Invalid input');
    return;
  }

  const inputPath = resolvePath(parsed.input, cwd);

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
