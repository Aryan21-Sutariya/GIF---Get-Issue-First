CREATE UNIQUE INDEX "Notification_userId_repositoryId_issueId_key"
ON "Notification"("userId", "repositoryId", "issueId");
