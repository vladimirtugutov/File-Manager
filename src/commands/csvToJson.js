import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { Transform } from 'node:stream';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const csvToJson = async (args, cwd) => {
  // console.log(args, cwd);

  const parsed = parseArgs(args);
  if (!parsed.input || !parsed.output) {
    console.log('Invalid input');
    return;
  }

  const inputPath = resolvePath(parsed.input, cwd);
  const outputPath = resolvePath(parsed.output, cwd);

  try {
    await access(inputPath);
  } catch {
    console.log('Operation failed');
    return;
  }

  const csvStream = createReadStream(inputPath);
  const jsonStream = createWriteStream(outputPath, 'utf8');

  let headers = null;
  const records = [];

  const csvParser = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const lines = chunk.toString('utf8').split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        const fields = trimmed.split(',');
        
        if (headers === null) {
          headers = fields.map(h => h.trim());
        } else {
          const record = {};
          for (let i = 0; i < Math.min(headers.length, fields.length); i++) {
            record[headers[i]] = fields[i].trim();
          }
          records.push(record);
        }
      }
      
      callback();
    }
  });

  try {
    await pipeline(csvStream, csvParser);
    
    await new Promise((resolve, reject) => {
      jsonStream.write(JSON.stringify(records, null, 2) + '\n');
      jsonStream.end();
      
      jsonStream.on('finish', resolve);
      jsonStream.on('error', reject);
    });
    
    console.log('CSV converted to JSON');
  } catch (error) {
    console.log('Operation failed');
  }
};
