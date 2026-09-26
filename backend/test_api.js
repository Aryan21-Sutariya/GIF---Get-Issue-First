const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const repos = await prisma.repository.findMany({
    include: { repositoryLabels: true, user: { include: { githubAccount: true } } }
  });
  console.log('Repos in DB limit 1:', JSON.stringify(repos[0], null, 2));

  if (!repos[0]) {
    console.log('No repos found in database. The user might not have successfully saved facebook/react if the browser subagent test did not complete.');
    return;
  }

  const repo = repos[0];
  const watchedLabels = repo.repositoryLabels.map(rl => rl.labelName.toLowerCase());
  console.log('Watched Labels:', watchedLabels);

  const fetchOpts = {
    headers: {
      Authorization: `Bearer ${repo.user.githubAccount.accessToken}`,
      'User-Agent': 'GIF-Dashboard',
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  const issuesRes = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/issues?state=open&sort=created&direction=desc&per_page=100`, fetchOpts);
  console.log('Github API Status:', issuesRes.status);
  
  if (!issuesRes.ok) {
     const er = await issuesRes.text();
     console.log('Error hitting Github:', er);
     return;
  }

  const ghIssues = await issuesRes.json();
  console.log('Fetched', ghIssues.length, 'issues');
  if (ghIssues.length > 0) {
     console.log('Sample issue object mapping check:', {
         title: ghIssues[0].title,
         labels: ghIssues[0].labels.map(l => l.name),
         pull_request: ghIssues[0].pull_request ? true : false,
         user: ghIssues[0].user.login
     });
     
     // Test Upsert Logic!
     try {
       const issue = ghIssues[0]; // Force match for test!
       if (issue) {
         console.log('Found forced matching issue:', issue.number);
         const upsertedIssue = await prisma.issue.upsert({
           where: {
             repositoryId_githubIssueId: {
               repositoryId: repo.id,
               githubIssueId: issue.id
             }
           },
           update: {
             title: issue.title,
             url: issue.html_url,
             githubCreatedAt: new Date(issue.created_at)
           },
           create: {
             repositoryId: repo.id,
             githubIssueId: issue.id,
             issueNumber: issue.number,
             title: issue.title,
             url: issue.html_url,
             author: issue.user.login,
             githubCreatedAt: new Date(issue.created_at)
           }
         });
         console.log('Upserted successfully:', upsertedIssue.id);
       }
     } catch (err) {
       console.error('UPSERT FAILED:', err);
     }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
