const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');

// Get project ID and token from vercel config
const homedir = require('os').homedir();
let token = '';
let projectId = 'prj_hDg9ngjWGOzzq8kEzZcOOWhcDqfP';
let teamId = 'team_XthZVZAHscberLJPeGRyO3hz';

try {
  const vercelConfig = JSON.parse(fs.readFileSync(`${homedir}/.local/share/com.vercel.cli/auth.json`, 'utf-8'));
  token = vercelConfig.token;
} catch(e) {
  // Try alternate path
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(`${homedir}/AppData/Roaming/com.vercel.cli/auth.json`, 'utf-8'));
    token = vercelConfig.token;
  } catch(e2) {
    // Try reading from vercel env pull output  
    console.error('Cannot find auth token:', e2.message);
    process.exit(1);
  }
}

const envVars = {
  MONGO_URI: 'mongodb+srv://codewithabdulwaheed_db_user:a0Kek370ckImjH3g@cluster0.wvmtxmm.mongodb.net/hackathon-boilerplate?appName=Cluster0',
  JWT_SECRET: 'your_jwt_secret_key_here',
  FRONTEND_URL: 'https://hackathon-project-two-omega.vercel.app',
  GEMINI_API_KEY: 'AQ.Ab8RN6JyLovThg5e61GQrFg7gYVBasikJp2n5rRs5BRv2fzXzg',
  SMTP_HOST: 'smtp-relay.brevo.com',
  SMTP_PORT: '587',
  SMTP_USER: 'b7399c001@smtp-brevo.com',
  SMTP_PASSWORD: 'xsmtpsib-c5b45150ea2f80804d3874a9af75cce9aa8336f9f83603c9b8593e59b6f15719-YkBIC2woPgxmlgxK',
  SMTP_FROM: 'b7399c001@smtp-brevo.com',
  NODE_ENV: 'production',
};

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: 'api.vercel.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

(async () => {
  console.log('Using project ID:', projectId);
  console.log('Token found:', token ? 'Yes (' + token.substring(0, 8) + '...)' : 'No');
  
  // First list existing env vars to get their IDs
  const listRes = await apiRequest('GET', `/v9/projects/${projectId}/env?teamId=${teamId}`);
  const existing = JSON.parse(listRes.body);
  console.log('\nExisting env vars:', existing.envs ? existing.envs.length : 'Error: ' + listRes.body.substring(0, 200));
  
  const existingMap = {};
  if (existing.envs) {
    for (const e of existing.envs) {
      existingMap[e.key] = e.id;
    }
  }
  
  // Update or create each env var
  for (const [key, value] of Object.entries(envVars)) {
    if (existingMap[key]) {
      // Patch existing
      const res = await apiRequest('PATCH', `/v9/projects/${projectId}/env/${existingMap[key]}?teamId=${teamId}`, {
        value,
        target: ['production'],
      });
      console.log(`  ✓ PATCH ${key}: ${res.status}`);
    } else {
      // Create new
      const res = await apiRequest('POST', `/v9/projects/${projectId}/env?teamId=${teamId}`, {
        key,
        value,
        type: 'encrypted',
        target: ['production'],
      });
      console.log(`  ✓ POST ${key}: ${res.status}`);
    }
  }
  
  console.log('\nAll env vars updated! Now redeploying...');
})();
