const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret';

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.gif_token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const decoded = jwt.verify(token, SESSION_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { githubAccount: true }
    });
    if (!user || !user.githubAccount) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    req.user = user;
    req.accessToken = user.githubAccount.accessToken;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
};

module.exports = authenticate;
