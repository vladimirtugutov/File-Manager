import { homedir } from 'os';

const args = process.argv.slice(2);
const usernameArg = args.find(arg => arg.startsWith('--username='));

const username = usernameArg?.split('=')[1] || 'Anonymous';

console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${homedir()}`);

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (data) => {
  const input = data.trim();

  if (input === '.exit') {
    exit();
  } else {
    console.log('Invalid input');
    console.log(`You are currently in ${process.cwd()}`);
  }
});

process.on('SIGINT', () => {
  exit();
});

function exit() {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
}