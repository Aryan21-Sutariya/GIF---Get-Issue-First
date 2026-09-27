require('dotenv').config();
const SmeeClient = require('smee-client');

const source = process.env.SMEE_WEBHOOK_URL;
const target = 'http://localhost:5000/api/webhooks/github';

if (!source) {
  console.error('Error: SMEE_WEBHOOK_URL is not defined in .env');
  process.exit(1);
}

const smee = new SmeeClient({
  source,
  target,
  logger: console
});

const events = smee.start();
console.log(`[Smee] Forwarding webhooks from ${source} to ${target}`);

process.on('SIGINT', () => {
  events.close();
  process.exit();
});
