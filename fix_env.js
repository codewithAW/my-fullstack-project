const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Write sensitive value to a temp file to avoid shell escaping issues
const mongoUri = 'mongodb+srv://codewithabdulwaheed_db_user:a0Kek370ckImjH3g@cluster0.wvmtxmm.mongodb.net/hackathon-boilerplate?appName=Cluster0';

const tmpFile = path.join(os.tmpdir(), 'mongo_uri.txt');
fs.writeFileSync(tmpFile, mongoUri, 'utf-8');

console.log('Removing old MONGO_URI...');
try {
  execSync('npx vercel env rm MONGO_URI production --yes', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('Removed.');
} catch(e) {
  console.log('Could not remove (may not exist):', e.message.substring(0, 100));
}

console.log('Adding fresh MONGO_URI from file...');
try {
  // Read from the temp file directly via stdin redirect
  const output = execSync(`type "${tmpFile}" | npx vercel env add MONGO_URI production`, {
    encoding: 'utf-8',
    shell: 'cmd.exe',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: mongoUri,
  });
  console.log('Added:', output.substring(0, 200));
} catch (e) {
  console.log('Error:', e.message.substring(0, 300));
}

fs.unlinkSync(tmpFile);
