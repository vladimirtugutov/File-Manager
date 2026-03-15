import { readFile, access, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const jsonToCsv = async (args, cwd) => {
  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');
  
  if (inputIndex === -1 || outputIndex === -1 || 
      inputIndex + 1 >= args.length || outputIndex + 1 >= args.length) {
    console.log('Invalid input');
    return;
  }

  const inputFile = args[inputIndex + 1];
  const outputFile = args[outputIndex + 1];

  const inputPath = resolve(cwd, inputFile);
  const outputPath = resolve(cwd, outputFile);

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
        const value = record[header] ?? '';
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
