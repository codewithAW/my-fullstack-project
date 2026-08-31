const { execSync } = require('child_process');

const VERCEL_PROD_URL = 'https://hackathon-project-two-omega.vercel.app';

const envVars = {
  MONGO_URI: 'mongodb+srv://codewithabdulwaheed_db_user:a0Kek370ckImjH3g@cluster0.wvmtxmm.mongodb.net/hackathon-boilerplate?appName=Cluster0',
  JWT_SECRET: 'your_jwt_secret_key_here',
  FRONTEND_URL: VERCEL_PROD_URL,
  GEMINI_API_KEY: 'AQ.Ab8RN6JyLovThg5e61GQrFg7gYVBasikJp2n5rRs5BRv2fzXzg',
  SMTP_HOST: 'smtp-relay.brevo.com',
  SMTP_PORT: '587',
  SMTP_USER: 'b7399c001@smtp-brevo.com',
  SMTP_PASSWORD: 'xsmtpsib-c5b45150ea2f80804d3874a9af75cce9aa8336f9f83603c9b8593e59b6f15719-YkBIC2woPgxmlgxK',
  SMTP_FROM: 'b7399c001@smtp-brevo.com',
  NODE_ENV: 'production',
};

console.log('Pushing environment variables to Vercel...');
for (const [key, value] of Object.entries(envVars)) {
  try {
    // Use echo to pipe value in non-interactively
    const escapedValue = value.replace(/"/g, '\\"');
    execSync(`echo "${escapedValue}" | npx vercel env add ${key} production`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`  ✓ ${key}`);
  } catch (e) {
    // Variable might already exist - try removing and re-adding
    try {
      execSync(`npx vercel env rm ${key} production --yes`, { encoding: 'utf-8', stdio: 'pipe' });
      const escapedValue = value.replace(/"/g, '\\"');
      execSync(`echo "${escapedValue}" | npx vercel env add ${key} production`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`  ✓ ${key} (updated)`);
    } catch (e2) {
      console.log(`  ⚠ ${key} - manual set required: ${e2.message.substring(0, 100)}`);
    }
  }
}

console.log('\nRedeploying with updated config...');
try {
  const output = execSync('npx vercel --prod --yes', { encoding: 'utf-8', stdio: 'inherit' });
  console.log('Redeployment successful!');
} catch (error) {
  console.error('Redeployment failed:', error.message);
  process.exit(1);
}
