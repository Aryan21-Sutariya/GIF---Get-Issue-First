const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const secret = 'test_secret_123';
process.env.GITHUB_WEBHOOK_SECRET = secret;

function createSignature(payload) {
  const hmac = crypto.createHmac('sha256', secret);
  return 'sha256=' + hmac.update(payload).digest('hex');
}

async function runTest() {
  const existingRepo = await prisma.repository.findFirst({
    include: { repositoryLabels: true }
  });

  const targetRepoId = existingRepo ? existingRepo.githubRepoId : 9999999;
  const targetLabel = existingRepo && existingRepo.repositoryLabels.length > 0 
      ? existingRepo.repositoryLabels[0].labelName 
      : 'some-random-label';

  console.log(`Using Repo ID: ${targetRepoId}`);
  
  // Test A: Valid signature + issues.opened + matching watched label
  console.log('\n--- Test A: Valid Match ---');
  const payloadA = JSON.stringify({
    action: 'opened',
    issue: { 
       id: 111111, number: 101, title: 'Test Webhook Issue A', html_url: 'https://github.com/a/b/issues/101', 
       labels: [{name: targetLabel}], user: {login: 'testuser'}, created_at: new Date().toISOString() 
    },
    repository: { id: targetRepoId, full_name: existingRepo ? existingRepo.fullName : 'test/repo' }
  });
  
  const resA = await fetch('http://localhost:5000/api/webhooks/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': createSignature(payloadA), 'x-github-event': 'issues' },
    body: payloadA
  });
  console.log('Test A status:', resA.status);

  // Test B: Valid signature + issues.opened + non-matching label
  console.log('\n--- Test B: Non-matching Label ---');
  const payloadB = JSON.stringify({
    action: 'opened',
    issue: { 
       id: 222222, number: 102, title: 'Test Webhook Issue B', html_url: 'https://github.com/a/b/issues/102', 
       labels: [{name: 'unmatched-label-xyz'}], user: {login: 'testuser'}, created_at: new Date().toISOString() 
    },
    repository: { id: targetRepoId, full_name: existingRepo ? existingRepo.fullName : 'test/repo' }
  });
  const resB = await fetch('http://localhost:5000/api/webhooks/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': createSignature(payloadB), 'x-github-event': 'issues' },
    body: payloadB
  });
  console.log('Test B status:', resB.status);

  // Test C: Valid signature + unknown repository
  console.log('\n--- Test C: Unknown Repository ---');
  const payloadC = JSON.stringify({
    action: 'opened',
    issue: { 
       id: 333333, number: 103, title: 'Test Webhook Issue C', html_url: 'https://github.com/a/b/issues/103', 
       labels: [{name: targetLabel}], user: {login: 'testuser'}, created_at: new Date().toISOString() 
    },
    repository: { id: 987654321, full_name: 'unknown/repo' }
  });
  const resC = await fetch('http://localhost:5000/api/webhooks/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': createSignature(payloadC), 'x-github-event': 'issues' },
    body: payloadC
  });
  console.log('Test C status:', resC.status);

  // Test D: Invalid signature
  console.log('\n--- Test D: Invalid Signature ---');
  const resD = await fetch('http://localhost:5000/api/webhooks/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': 'sha256=invalid123', 'x-github-event': 'issues' },
    body: payloadA
  });
  console.log('Test D status:', resD.status);

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  await delay(1000); // Give the database a moment to digest A
  if (existingRepo) {
     const savedIssue = await prisma.issue.findFirst({
        where: { repositoryId: existingRepo.id, githubIssueId: 111111 }
     });
     console.log('\nVerification of Test A execution - Saved Issue Exists:', !!savedIssue);
     
     const savedIssueB = await prisma.issue.findFirst({
        where: { repositoryId: existingRepo.id, githubIssueId: 222222 }
     });
     console.log('Verification of Test B execution - Should NOT Exist:', !!savedIssueB);
  }
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
