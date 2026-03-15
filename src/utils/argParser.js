export const parseArgs = (args) => {
  const result = {};
  
  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');
  const passwordIndex = args.indexOf('--password');
  const algorithmIndex = args.indexOf('--algorithm');
  const hashIndex = args.indexOf('--hash');
  
  if (inputIndex !== -1 && inputIndex + 1 < args.length) {
    result.input = args[inputIndex + 1];
  }
  
  if (outputIndex !== -1 && outputIndex + 1 < args.length) {
    result.output = args[outputIndex + 1];
  }
  
  if (passwordIndex !== -1 && passwordIndex + 1 < args.length) {
    result.password = args[passwordIndex + 1];
  }
  
  if (algorithmIndex !== -1 && algorithmIndex + 1 < args.length) {
    result.algorithm = args[algorithmIndex + 1];
  }
  
  if (hashIndex !== -1 && hashIndex + 1 < args.length) {
    result.hashFile = args[hashIndex + 1];
  }
  
  result.saveHash = args.includes('--save');
  
  return result;
};
