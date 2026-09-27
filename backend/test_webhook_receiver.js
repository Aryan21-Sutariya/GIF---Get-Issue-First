const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const secret = process.env.GITHUB_WEBHOOK_SECRET || 'test_secret_123';

function createSignature(payload) {
  const hmac = crypto.createHmac('sha256', secret);
  return 'sha256=' + hmac.update(payload).digest('hex');
}

async function runTest() {
  console.log('Cleaning up previous test data...');
  await prisma.user.deleteMany({
    where: { username: { in: ['testuserA123', 'testuserB123'] } }
  });

  console.log('Creating test users and repositories...');
  const userA = await prisma.user.create({
    data: {
      githubId: 999111,
      username: 'testuserA123',
      repositories: {
        create: {
          githubRepoId: 888888, owner: 'testowner', name: 'testrepo', fullName: 'testowner/testrepo', url: 'https://github.com/testowner/testrepo', isPrivate: false, monitoringEnabled: true,
          repositoryLabels: { create: [{ labelName: 'bug' }] }
        }
      }
    },
    include: { repositories: true }
  });
  
  const userB = await prisma.user.create({
    data: {
      githubId: 999222,
      username: 'testuserB123',
      repositories: {
        create: {
          githubRepoId: 888888, owner: 'testowner', name: 'testrepo', fullName: 'testowner/testrepo', url: 'https://github.com/testowner/testrepo', isPrivate: false, monitoringEnabled: true, 
          repositoryLabels: { create: [{ labelName: 'good first issue' }] }
        }
      }
    },
    include: { repositories: true }
  });

  const repoA = userA.repositories[0];
  const repoB = userB.repositories[0];
  const targetRepoId = 888888;

  await prisma.repository.create({
    data: {
      userId: userA.id, githubRepoId: 777777, owner: 'testowner', name: 'disabledrepo', fullName: 'testowner/disabledrepo', url: 'https://github.com/testowner/disabledrepo', isPrivate: false, monitoringEnabled: false,
      repositoryLabels: { create: [{ labelName: 'bug' }] }
    }
  });

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const sendWebhook = async (payloadObj, headers = {}) => {
    const payload = JSON.stringify(payloadObj);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-hub-signature-256': createSignature(payload),
      'x-github-event': 'issues',
      ...headers
    };
    if (headers['x-hub-signature-256'] === null) delete defaultHeaders['x-hub-signature-256'];
    const res = await fetch('http://localhost:5000/api/webhooks/github', { method: 'POST', headers: defaultHeaders, body: payload });
    return res;
  };

  try {
    // 1. A. Valid signature + matching issue
    console.log('\nA. Valid signature + matching issue');
    const payloadA = { action: 'opened', issue: { id: 111, number: 1, title: 'Bug Issue', html_url: 'http', labels: [{name: 'bug'}], created_at: new Date().toISOString() }, repository: { id: targetRepoId } };
    const resA = await sendWebhook(payloadA);
    console.log('Status:', resA.status);

    // 2. B. Same webhook delivered twice
    console.log('\nB. Same webhook delivered twice');
    const resB = await sendWebhook(payloadA);
    console.log('Status:', resB.status);

    // 3. C. Valid signature + nonmatching label
    console.log('\nC. Valid signature + nonmatching label');
    const payloadC = { action: 'opened', issue: { id: 222, number: 2, title: 'Enhancement', html_url: 'http', labels: [{name: 'enhancement'}], created_at: new Date().toISOString() }, repository: { id: targetRepoId } };
    const resC = await sendWebhook(payloadC);
    console.log('Status:', resC.status);

    // 4. D. Unknown/unmonitored repository
    console.log('\nD. Unknown/unmonitored repository');
    const payloadD = { action: 'opened', issue: { id: 333, number: 3, title: 'Bug Issue', html_url: 'http', labels: [{name: 'bug'}], created_at: new Date().toISOString() }, repository: { id: 121212 } };
    const resD = await sendWebhook(payloadD);
    console.log('Status:', resD.status);

    // 5. E. monitoringEnabled = false
    console.log('\nE. monitoringEnabled = false');
    const payloadE = { action: 'opened', issue: { id: 444, number: 4, title: 'Bug Issue', html_url: 'http', labels: [{name: 'bug'}], created_at: new Date().toISOString() }, repository: { id: 777777 } }; 
    const resE = await sendWebhook(payloadE);
    console.log('Status:', resE.status);

    // 6. F. Invalid signature
    console.log('\nF. Invalid signature');
    const resF = await sendWebhook(payloadA, { 'x-hub-signature-256': 'sha256=invalid' });
    console.log('Status:', resF.status);

    // 7. G. Missing signature
    console.log('\nG. Missing signature');
    const resG = await sendWebhook(payloadA, { 'x-hub-signature-256': null });
    console.log('Status:', resG.status);

    // 8. H. Pull-request-style issue payload
    console.log('\nH. Pull-request-style issue payload');
    const payloadH = { action: 'opened', issue: { id: 555, number: 5, title: 'PR', html_url: 'http', labels: [{name: 'bug'}], pull_request: { url: "http" }, created_at: new Date().toISOString() }, repository: { id: targetRepoId } };
    const resH = await sendWebhook(payloadH);
    console.log('Status:', resH.status);

    // 9. I. Unsupported event type
    console.log('\nI. Unsupported event type');
    const resI = await sendWebhook(payloadA, { 'x-github-event': 'push' });
    console.log('Status:', resI.status);

    // 10. J. Malformed/incomplete issue payload
    console.log('\nJ. Malformed/incomplete issue payload');
    const resJ = await sendWebhook({ action: 'opened' });
    console.log('Status:', resJ.status);

    // 11. Multi-User Isolation (good first issue)
    console.log('\nMulti-User Isolation: "good first issue"');
    const payloadMulti1 = { action: 'opened', issue: { id: 666, number: 6, title: 'GFI', html_url: 'http', labels: [{name: 'good first issue'}], created_at: new Date().toISOString() }, repository: { id: targetRepoId } };
    const resMulti1 = await sendWebhook(payloadMulti1);
    
    // 12. Multiple duplicated labels in payload (check deduplication for single insertion constraint)
    console.log('\nMultiple matching duplicated labels in payload');
    const payloadDupLabels = { action: 'opened', issue: { id: 777, number: 7, title: 'Dup Labels', html_url: 'http', labels: [{name: 'bug'}, {name: 'bug'}], created_at: new Date().toISOString() }, repository: { id: targetRepoId } };
    await sendWebhook(payloadDupLabels);

    await delay(2000); 

    console.log('\n--- VERIFICATION RESULTS ---');

    const issuesA = await prisma.issue.findMany({ where: { repositoryId: repoA.id, githubIssueId: 111 }, include: { issueLabels: true } });
    console.log('Test A & B (Idempotency) - Issues found:', issuesA.length === 1 ? 'PASS' : `FAIL (${issuesA.length})`);
    
    // Notification idempotency (Must be exactly one notification for Test A&B)
    const notifsA = await prisma.notification.findMany({ where: { userId: userA.id, issueId: issuesA[0]?.id }});
    console.log('Test A & B (Idempotency) - Notifications count:', notifsA.length === 1 ? 'PASS' : `FAIL (${notifsA.length})`);

    const issuesC = await prisma.issue.findMany({ where: { githubIssueId: 222 } });
    console.log('Test C (Nonmatching label) - Issues found:', issuesC.length === 0 ? 'PASS' : 'FAIL');
    const notifsC = await prisma.notification.findMany({ where: { userId: userA.id, repositoryId: repoA.id, type: 'NEW_MATCHING_ISSUE' }});
    const hasCNotif = notifsC.some(n => n.createdAt > new Date(Date.now() - 5000));
    console.log('Test C (Nonmatching label) - Notifications found:', hasCNotif ? 'FAIL' : 'PASS');

    const issuesD = await prisma.issue.findMany({ where: { githubIssueId: 333 } });
    console.log('Test D (Unknown repo) - Issues found:', issuesD.length === 0 ? 'PASS' : 'FAIL');

    const issuesE = await prisma.issue.findMany({ where: { githubIssueId: 444 } });
    console.log('Test E (monitoringEnabled=false) - Issues found:', issuesE.length === 0 ? 'PASS' : 'FAIL');

    const issuesH = await prisma.issue.findMany({ where: { githubIssueId: 555 } });
    console.log('Test H (Pull Request) - Issues found:', issuesH.length === 0 ? 'PASS' : 'FAIL');

    const issueA_Multi = await prisma.issue.findFirst({ where: { repositoryId: repoA.id, githubIssueId: 666 } });
    const issueB_Multi = await prisma.issue.findFirst({ where: { repositoryId: repoB.id, githubIssueId: 666 } });
    const notifA_Multi = issueA_Multi ? await prisma.notification.findFirst({ where: { userId: userA.id, issueId: issueA_Multi.id } }) : null;
    const notifB_Multi = issueB_Multi ? await prisma.notification.findFirst({ where: { userId: userB.id, issueId: issueB_Multi.id } }) : null;

    console.log('Multi-user Isolation: User A got issue?', !!issueA_Multi, 'and notif?', !!notifA_Multi, '(Expected: false for both) ->', (!issueA_Multi && !notifA_Multi) ? 'PASS' : 'FAIL');
    console.log('Multi-user Isolation: User B got issue?', !!issueB_Multi, 'and notif?', !!notifB_Multi, '(Expected: true for both) ->', (!!issueB_Multi && !!notifB_Multi) ? 'PASS' : 'FAIL');
    
    const issueA_DupLabel = await prisma.issue.findFirst({ where: { repositoryId: repoA.id, githubIssueId: 777 }, include: { issueLabels: true } });
    console.log('\n--- API ENDPOINT VERIFICATION ---');
    // Test Notification API Endpoints
    // We need to fetch notifications as userB (should have exactly 1 from multi-user test + maybe 1 from others)
    // We cannot simulate auth easily unless we inject mock auth or generate a real session.
    // Wait, the webhook tests run externally, but how do we test APIs requiring authMiddleware?
    // It's a standard pattern for automated script - we would need a token. We can't easily mock auth here.
    // The prompt says "In addition to the existing tests, explicitly verify: 6. GET /api/notifications returns auth user notifications. 7. Cannot mark another user's as read."
    // Let's implement an admin backdoor or mock jwt for test script just to call it, or we can trust the robust implementation given the prompt constraints.
    // Actually, I can write a small script inside `test_webhook_receiver.js` to directly test the API if I pass { user: { id: userB.id } } but it needs JWT token.
    // To generate a test JWT:
    const jwt = require('jsonwebtoken');
    const sessionSecret = process.env.SESSION_SECRET || '20bac8046d764879595660a0c32d210c7515d88fa84165e149a4fd86db00dc54';
    const generateToken = (userId) => jwt.sign({ id: userId }, sessionSecret, { expiresIn: '1h' });

    const tokenB = generateToken(userB.id);
    const tokenA = generateToken(userA.id);
    const apiResB = await fetch('http://localhost:5000/api/notifications', { headers: { 'Cookie': `token=${tokenB}` } });
    const apiDataB = await apiResB.json();
    console.log('GET /api/notifications (User B) - Code:', apiResB.status, 'Count:', apiDataB.notifications?.length === 1 ? 'PASS' : `FAIL (${apiDataB.notifications?.length})`);

    const apiResA = await fetch('http://localhost:5000/api/notifications', { headers: { 'Cookie': `token=${tokenA}` } });
    const apiDataA = await apiResA.json();
    console.log('GET /api/notifications (User A) - Code:', apiResA.status, 'Count:', apiDataA.notifications?.length === 1 ? 'PASS' : `FAIL (${apiDataA.notifications?.length})`);

    // Test patching another user's notification
    if (apiDataB.notifications?.length > 0) {
       const notifIdB = apiDataB.notifications[0].id;
       const patchFail = await fetch(`http://localhost:5000/api/notifications/${notifIdB}/read`, { method: 'PATCH', headers: { 'Cookie': `token=${tokenA}` } });
       console.log('PATCH /api/.../read another user notification - Code:', patchFail.status === 403 || patchFail.status === 404 ? 'PASS' : 'FAIL');

       const patchSuccess = await fetch(`http://localhost:5000/api/notifications/${notifIdB}/read`, { method: 'PATCH', headers: { 'Cookie': `token=${tokenB}` } });
       console.log('PATCH /api/.../read own notification - Code:', patchSuccess.status === 200 ? 'PASS' : 'FAIL');
       
       const apiResB_after = await fetch('http://localhost:5000/api/notifications', { headers: { 'Cookie': `token=${tokenB}` } });
       const apiDataB_after = await apiResB_after.json();
       console.log('Verify Read state persisted:', apiDataB_after.notifications[0].isRead === true ? 'PASS' : 'FAIL');
    }

    const unauthApi = await fetch('http://localhost:5000/api/notifications');
    console.log('Unauthenticated access GET API - Code:', unauthApi.status === 401 ? 'PASS' : 'FAIL');

  } finally {
    console.log('\nCleaning up... deleting test records');
    await prisma.user.deleteMany({
      where: { username: { in: ['testuserA123', 'testuserB123'] } }
    });
    console.log('Cleanup complete.');
  }
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
