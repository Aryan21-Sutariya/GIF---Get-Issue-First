const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

function parseGithubUrl(url) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parsed.hostname === 'github.com' && parts.length >= 2) {
      return { owner: parts[0], repo: parts[1].replace('.git', '') };
    }
    return null;
  } catch (e) {
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[parts.length-2], repo: parts[parts.length-1].replace('.git', '') };
    }
    return null;
  }
}

router.get('/public/lookup', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const repoInfo = parseGithubUrl(url);
    if (!repoInfo) return res.status(400).json({ error: 'Invalid GitHub URL' });

    const fetchOpts = {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        'User-Agent': 'GIF-Dashboard',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const repoRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, fetchOpts);
    
    if (repoRes.status === 404) return res.status(404).json({ error: 'Repository not found or GitHub API inaccessible' });
    if (!repoRes.ok) return res.status(repoRes.status).json({ error: 'GitHub API error retrieving repository' });
    
    const repoData = await repoRes.json();
    if (repoData.private) {
      return res.status(400).json({ error: 'This is a private repository. Please use the private flow.' });
    }

    const labelsRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/labels?per_page=100`, fetchOpts);
    let labels = [];
    if (labelsRes.ok) {
      const labelsData = await labelsRes.json();
      labels = labelsData.map(l => l.name);
    } else {
        return res.status(labelsRes.status).json({ error: 'GitHub API error retrieving labels' });
    }
    
    if (labels.length === 0) {
       return res.status(400).json({ error: 'Repository has no labels available.' });
    }

    return res.json({
      githubRepoId: repoData.id,
      owner: repoData.owner.login,
      name: repoData.name,
      fullName: repoData.full_name,
      url: repoData.html_url,
      description: repoData.description || '',
      labels
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error during lookup' });
  }
});

router.post('/public', async (req, res) => {
  try {
    const { url, selectedLabels } = req.body;
    if (!url || !selectedLabels || !Array.isArray(selectedLabels)) {
      return res.status(400).json({ error: 'URL and selectedLabels are required.' });
    }

    const repoInfo = parseGithubUrl(url);
    if (!repoInfo) return res.status(400).json({ error: 'Invalid GitHub URL' });

    const fetchOpts = {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        'User-Agent': 'GIF-Dashboard',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const repoRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, fetchOpts);
    if (!repoRes.ok) return res.status(400).json({ error: 'Could not verify repository with GitHub API' });
    
    const repoData = await repoRes.json();
    if (repoData.private) {
      return res.status(400).json({ error: 'Private repository detected. Use private flow.' });
    }

    const existingRepo = await prisma.repository.findUnique({
      where: {
        userId_githubRepoId: {
          userId: req.user.id,
          githubRepoId: repoData.id
        }
      }
    });

    if (existingRepo) {
      return res.status(400).json({ error: 'Repository is already added to your watchlist.' });
    }

    const createdRepo = await prisma.repository.create({
      data: {
        userId: req.user.id,
        githubRepoId: repoData.id,
        owner: repoData.owner.login,
        name: repoData.name,
        fullName: repoData.full_name,
        url: repoData.html_url,
        isPrivate: false,
        monitoringEnabled: true,
        repositoryLabels: {
          create: selectedLabels.map(label => ({ labelName: label }))
        }
      },
      include: {
        repositoryLabels: true
      }
    });

    return res.status(201).json(createdRepo);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error while saving repository' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const repos = await prisma.repository.findMany({
      where: { userId: req.user.id, isPrivate: false },
      include: { repositoryLabels: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = repos.map(r => ({
      id: r.id,
      name: r.fullName,
      description: '', 
      language: 'Unknown',
      watchedIssues: 0,
      newIssues: 0,
      labels: r.repositoryLabels.map(l => l.labelName),
      isPrivate: r.isPrivate
    }));

    return res.json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve repositories' });
  }
});

router.put('/public/:repositoryId/labels', async (req, res) => {
  try {
    const { repositoryId } = req.params;
    const { labels } = req.body;
    
    if (!Array.isArray(labels)) return res.status(400).json({ error: 'Labels must be an array' });

    const repo = await prisma.repository.findUnique({ where: { id: repositoryId } });
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    if (repo.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to modify this repository' });

    await prisma.repositoryLabel.deleteMany({
      where: { repositoryId }
    });

    if (labels.length > 0) {
      await prisma.repositoryLabel.createMany({
        data: labels.map(labelName => ({ repositoryId, labelName }))
      });
    }

    const updatedLabels = await prisma.repositoryLabel.findMany({ where: { repositoryId } });
    return res.json({ labels: updatedLabels.map(l => l.labelName) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error updating labels' });
  }
});

router.get('/public/:repositoryId/issues', async (req, res) => {
  try {
    const { repositoryId } = req.params;
    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { repositoryLabels: true }
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    if (repo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this repository' });
    }
    if (repo.isPrivate) {
      return res.status(400).json({ error: 'This is a private repository flow.' });
    }

    const watchedLabels = repo.repositoryLabels.map(rl => rl.labelName.toLowerCase());
    if (watchedLabels.length === 0) {
      return res.status(400).json({ error: 'No watched labels configured. Please configure labels in settings.' });
    }

    const fetchOpts = {
      headers: {
        Authorization: `Bearer ${req.accessToken}`,
        'User-Agent': 'GIF-Dashboard',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const issuesRes = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/issues?state=open&sort=created&direction=desc&per_page=100`, fetchOpts);
    
    if (!issuesRes.ok) {
       return res.status(issuesRes.status).json({ error: 'Failed to retrieve issues from GitHub' });
    }

    const ghIssues = await issuesRes.json();
    const matchedIssues = [];

    for (const issue of ghIssues) {
      if (issue.pull_request) continue;
      
      const issueLabels = issue.labels.map(l => l.name);
      
      const isMatch = issueLabels.some(l => watchedLabels.includes(l.toLowerCase()));
      if (isMatch) {
         matchedIssues.push({
            githubIssueId: issue.id,
            issueNumber: issue.number,
            title: issue.title,
            url: issue.html_url,
            author: issue.user.login,
            githubCreatedAt: new Date(issue.created_at),
            labels: issueLabels,
            commentCount: issue.comments || 0
         });
      }
    }

    const dbIssues = [];
    for (const match of matchedIssues) {
       const upsertedIssue = await prisma.issue.upsert({
         where: {
           repositoryId_githubIssueId: {
             repositoryId: repo.id,
             githubIssueId: BigInt(match.githubIssueId)
           }
         },
         update: {
           title: match.title,
           url: match.url,
           githubCreatedAt: match.githubCreatedAt
         },
         create: {
           repositoryId: repo.id,
           githubIssueId: BigInt(match.githubIssueId),
           issueNumber: match.issueNumber,
           title: match.title,
           url: match.url,
           author: match.author,
           githubCreatedAt: match.githubCreatedAt
         }
       });

       await prisma.issueLabel.deleteMany({
         where: { issueId: upsertedIssue.id }
       });
       
       if (match.labels.length > 0) {
         await prisma.issueLabel.createMany({
           data: match.labels.map(labelName => ({
             issueId: upsertedIssue.id,
             labelName
           }))
         });
       }

       dbIssues.push({
         id: upsertedIssue.id,
         githubIssueId: match.githubIssueId,
         number: match.issueNumber,
         title: match.title,
         url: match.url,
         author: match.author,
         createdAt: match.githubCreatedAt.toISOString(),
         labels: match.labels,
         commentCount: match.commentCount
       });
    }

    return res.json({ issues: dbIssues });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error while fetching issues' });
  }
});

module.exports = router;
