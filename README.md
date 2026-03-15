# Data Processing CLI
## Description
Data Processing CLI is an interactive command-line toolkit for data processing tasks. Runs as a persistent Node.js REPL process with file system navigation and 8 data processing commands.

Node.js 24.x.x - Streams API - Worker Threads - Crypto API

## Installation & Usage
```bash
npm install
npm run start
```

```text
Welcome to Data Processing CLI!
You are currently in C:\Users\user
```

## Commands
### Navigation

```text
up                    # Go up one directory
cd path/to/dir        # Change directory  
ls                    # List files/folders (table)
.exit / Ctrl+C        # Exit
```

### Data Processing Commands
1. csv-to-json
```bash
csv-to-json --input test.csv --output test.json
```

2. json-to-csv
```bash
json-to-csv --input test.json --output test2.csv
```

3. count
```bash
count --input test.txt
```
```text
Lines: 4
Words: 12
Characters: 156
```

### Streams API (no full file loading).

4. hash

```bash
hash --input test.txt
# sha256: abc123...

hash --input test.txt --algorithm md5 --save  
# md5: d41d8cd98f00b204e9800998ecf8427e
# Creates: test.txt.md5
```

5. hash-compare
```bash
hash-compare --input test.txt --hash test.txt.sha256
# OK

hash-compare --input test.txt --hash test.txt.md5 --algorithm md5
# OK / MISMATCH
```

6. encrypt
```bash
encrypt --input secret.txt --output secret.txt.enc --password mySecret
# File encrypted (AES-256-GCM)
```

7. decrypt
```bash
decrypt --input secret.txt.enc --output secret_decrypted.txt --password mySecret
# File decrypted
```

8. log-stats
```bash
log-stats --input logs.txt --output stats.json
```