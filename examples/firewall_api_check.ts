import { KallipolisFirewall } from '@kallipolis/sdk';

// Initialize SDK
const firewall = new KallipolisFirewall({
  apiKey: process.env.KALLIPOLIS_API_KEY || 'dev_key',
  environment: 'development'
});

async function runExample() {
  console.log('--- Analyzing Transaction ---');
  const result = await firewall.analyzeTransaction({
    from: '0x123...',
    to: '0x456...',
    data: '0x789...',
    value: '0'
  });

  console.log('Safe to proceed:', result.isSafe);
}

runExample().catch(console.error);
