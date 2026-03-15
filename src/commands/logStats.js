import { Worker } from 'node:worker_threads';
import { access } from 'node:fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { parseArgs } from '../utils/argParser.js';
import { resolvePath } from '../utils/pathResolver.js';

export const logStats = async (args, cwd) => {
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

  const numWorkers = cpus().length;
  const chunks = await splitFileByLines(inputPath, numWorkers);

  const workers = chunks.map(chunk =>
    new Worker(new URL('../workers/logWorker.js', import.meta.url), {
      workerData: { 
        inputPath: inputPath, 
        startLine: chunk.startLine, 
        endLine: chunk.endLine 
      }
    })
  );

  const partialStats = await Promise.all(
    workers.map(worker =>
      new Promise((resolve, reject) => {
        worker.once('message', resolve);
        worker.once('error', reject);
        worker.once('exit', code => {
          if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
        });
      })
    )
  );

  const mergedStats = mergeStats(partialStats);
  await writeFile(outputPath, JSON.stringify(mergedStats, null, 2), 'utf8');
  
  console.log('Log stats generated');
};

const splitFileByLines = async (filePath, numChunks) => {
  const content = await readFile(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const chunks = [];
  const chunkSize = Math.ceil(lines.length / numChunks);
  
  for (let i = 0; i < numChunks && i * chunkSize < lines.length; i++) {
    const startLine = i * chunkSize;
    const endLine = Math.min((i + 1) * chunkSize, lines.length);
    
    if (startLine < endLine) {
      chunks.push({ startLine, endLine });
    }
  }
  
  return chunks;
};

const mergeStats = (partials) => {
  const levels = {};
  const status = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
  const paths = {};
  let total = 0;
  let responseTimeSum = 0;

  partials.forEach(partial => {
    if (partial.error) throw new Error(partial.error);
    
    Object.entries(partial.levels || {}).forEach(([level, count]) => {
      levels[level] = (levels[level] || 0) + count;
    });

    Object.entries(partial.status || {}).forEach(([code, count]) => {
      status[code] = (status[code] || 0) + count;
    });

    Object.entries(partial.paths || {}).forEach(([path, count]) => {
      paths[path] = (paths[path] || 0) + count;
    });

    total += partial.total || 0;
    responseTimeSum += partial.responseTimeSum || 0;
  });

  const topPaths = Object.entries(paths)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return {
    total,
    levels,
    status,
    topPaths,
    avgResponseTimeMs: total > 0 ? (responseTimeSum / total).toFixed(2) : 0
  };
};
