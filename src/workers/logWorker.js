import { parentPort, workerData } from 'node:worker_threads';
import { readFile } from 'node:fs/promises';

const parseChunk = async (inputPath, startLine, endLine) => {
  const content = await readFile(inputPath, 'utf8');
  const lines = content.split('\n').slice(startLine, endLine);
  
  const levels = {};
  const status = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 };
  const paths = {};
  let total = 0;
  let responseTimeSum = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.trim().split(/\s+/);
    if (parts.length < 7) continue;

    const [, level, , statusCode, responseTimeMs, , path] = parts;
    
    levels[level] = (levels[level] || 0) + 1;
    
    const statusClass = statusCode[0];
    status[`${statusClass}xx`] = (status[`${statusClass}xx`] || 0) + 1;
    
    paths[path] = (paths[path] || 0) + 1;
    
    const rt = parseFloat(responseTimeMs);
    if (!isNaN(rt)) responseTimeSum += rt;
    
    total++;
  }

  return { levels, status, paths, total, responseTimeSum };
};

parseChunk(workerData.inputPath, workerData.startLine, workerData.endLine)
  .then(stats => parentPort.postMessage(stats))
  .catch(err => parentPort.postMessage({ error: err.message }));
