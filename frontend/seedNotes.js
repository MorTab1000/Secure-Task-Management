import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const N = parseInt(process.argv[2], 10); // get N from command-line args
if (isNaN(N) || N <= 0) {
  console.error('Please provide a valid positive number for N.');
  process.exit(1);
}

const notes = [];

for (let i = 1; i <= N; i++) {
  notes.push({
    id: i,
    title: `Note ${i}`,
    author: {
      name: `Author ${i}`,
      email: `mail_${i}@gmail.com`
    },
    content: `Content for note ${i}`
  });
}

const outputDir = path.join(__dirname, 'data');
const outputFile = path.join(outputDir, 'notes.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(outputFile, JSON.stringify({ notes }, null, 2));

console.log(`✅ Created ${N} notes in ${outputFile}`);
