const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

// User Authentication Middleware is applied in app.js globally for this route

router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      include: {
        repository: true,
        issue: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = notifications.map(n => ({
      id: n.id,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      repository: {
        fullName: n.repository.fullName,
        isPrivate: n.repository.isPrivate
      },
      issue: {
        title: n.issue.title,
        number: n.issue.issueNumber,
        url: n.issue.url
      }
    }));

    return res.json({ notifications: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    if (notification.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.notification.delete({ where: { id } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

module.exports = router;
