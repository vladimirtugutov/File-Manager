import { readFile, access, writeFile } from 'node:fs/promises';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const jsonToCsv = async (args, cwd) => {
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

  let records;
  try {
    const jsonData = await readFile(inputPath, 'utf8');
    records = JSON.parse(jsonData);
    
    if (!Array.isArray(records) || records.length === 0) {
      console.log('Operation failed');
      return;
    }
  } catch {
    console.log('Operation failed');
    return;
  }

  const headers = Object.keys(records[0]);
  
  const csvLines = [
    headers.join(','),
    ...records.map(record => 
      headers.map(header => {
        let value = record[header] ?? '';
        
        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];

  try {
    await writeFile(outputPath, csvLines.join('\n') + '\n', 'utf8');
    console.log('JSON converted to CSV');
  } catch {
    console.log('Operation failed');
  }
};
