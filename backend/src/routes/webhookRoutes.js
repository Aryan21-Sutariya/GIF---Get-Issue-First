const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/github', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      console.error('Webhook payload rejected: GITHUB_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!req.rawBody) {
      return res.status(400).json({ error: 'Missing raw request body' });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    if (signature.length !== digest.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.headers['x-github-event'];
    
    if (event === 'issues') {
      const payload = req.body;
      if (!payload || !payload.issue || !payload.repository || !payload.action) {
        console.log(`[Webhook] Malformed payload, missing issue/repository/action`);
        return res.status(400).json({ error: 'Malformed payload' });
      }

      if (payload.action === 'opened') {
        const issue = payload.issue;
        const repository = payload.repository;
        
        if (issue.pull_request) {
          console.log(`[Webhook] Pull request event handled securely as ignore`);
          return res.json({ received: true });
        }
        
        console.log(`[Webhook] GitHub webhook received -> signature verified -> event type: ${event} -> action: ${payload.action}`);
        
        const gifRepos = await prisma.repository.findMany({
          where: { githubRepoId: repository.id },
          include: { repositoryLabels: true }
        });

        if (gifRepos.length === 0) {
          console.log(`[Webhook] Repository not monitored by GIF - ignoring event`);
          return res.json({ received: true });
        }

        const rawIssueLabels = (issue.labels || []).map(l => l.name);
        const issueLabels = [...new Set(rawIssueLabels)];

        for (const gifRepo of gifRepos) {
          if (!gifRepo.monitoringEnabled) {
            console.log(`[Webhook] Repository ${gifRepo.fullName} has monitoring disabled - ignoring event`);
            continue;
          }

          const isWatchAll = gifRepo.watchAllIssues === true;
          const watchedLabels = gifRepo.repositoryLabels.map(rl => rl.labelName.toLowerCase());

          if (!isWatchAll) {
            const isMatch = issueLabels.some(l => watchedLabels.includes(l.toLowerCase()));
            if (!isMatch) {
              console.log(`[Webhook] Issue did not match watched labels for repository ${gifRepo.fullName} - ignoring event`);
              continue;
            }
          }

          const matchedLabel = isWatchAll ? '(all issues)' : issueLabels.find(l => watchedLabels.includes(l.toLowerCase()));
          console.log(`[Webhook] Issue matched`);
          console.log(`Repository: ${repository.full_name}`);
          console.log(`Issue: #${issue.number}`);
          console.log(`Matched: ${matchedLabel}`);

          const upsertedIssue = await prisma.issue.upsert({
            where: {
              repositoryId_githubIssueId: {
                repositoryId: gifRepo.id,
                githubIssueId: BigInt(issue.id)
              }
            },
            update: {
              title: issue.title,
              url: issue.html_url,
              githubCreatedAt: issue.created_at ? new Date(issue.created_at) : new Date()
            },
            create: {
              repositoryId: gifRepo.id,
              githubIssueId: BigInt(issue.id),
              issueNumber: issue.number,
              title: issue.title,
              url: issue.html_url,
              author: issue.user ? issue.user.login : 'unknown',
              githubCreatedAt: issue.created_at ? new Date(issue.created_at) : new Date()
            }
          });

          await prisma.issueLabel.deleteMany({ where: { issueId: upsertedIssue.id } });
          
          if (issueLabels.length > 0) {
            await prisma.issueLabel.createMany({
              data: issueLabels.map(labelName => ({ issueId: upsertedIssue.id, labelName }))
            });
          }

          // Create Notification for exact user (enforcing idempotency via Schema constraint mapping exception or upsert strategy/findFirst)
          try {
            await prisma.notification.upsert({
              where: {
                userId_repositoryId_issueId: {
                  userId: gifRepo.userId,
                  repositoryId: gifRepo.id,
                  issueId: upsertedIssue.id
                }
              },
              update: {}, // Do nothing if it already exists
              create: {
                userId: gifRepo.userId,
                repositoryId: gifRepo.id,
                issueId: upsertedIssue.id,
                type: "NEW_MATCHING_ISSUE"
              }
            });
          } catch (notifErr) {
            console.error(`[Webhook] Error creating notification for user ${gifRepo.userId}:`, notifErr);
            // Allow processing to continue even if notification fails (or is ignored due to concurrency)
          }
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
});

module.exports = router;
