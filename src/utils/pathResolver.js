import { resolve } from 'node:path';

export const resolvePath = (filePath, cwd) => resolve(cwd, filePath);
