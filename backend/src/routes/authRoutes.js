const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const crypto = require('crypto');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret';

router.get('/github', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 10 * 60 * 1000 });
  const encodedCallback = GITHUB_CALLBACK_URL ? encodeURIComponent(GITHUB_CALLBACK_URL) : '';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodedCallback}&state=${state}&scope=read:user`;
  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const originalState = req.cookies.oauth_state;

  if (!state || state !== originalState) {
    return res.status(403).send('Invalid state. CSRF protection triggered.');
  }
  res.clearCookie('oauth_state');

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL
      })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      return res.status(400).send('Authentication failed: No access token');
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GIF-Dashboard'
      }
    });
    const ghUser = await userRes.json();

    if (!ghUser || !ghUser.id) {
       return res.status(400).send('Authentication failed: Unable to retrieve GitHub user info.');
    }

    const user = await prisma.user.upsert({
      where: { githubId: ghUser.id },
      update: {
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url,
      },
      create: {
        githubId: ghUser.id,
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url,
      }
    });

    await prisma.gitHubAccount.upsert({
      where: { userId: user.id },
      update: {
        githubId: ghUser.id,
        username: ghUser.login,
        accessToken: accessToken,
      },
      create: {
        userId: user.id,
        githubId: ghUser.id,
        username: ghUser.login,
        accessToken: accessToken,
      }
    });

    const token = jwt.sign({ userId: user.id }, SESSION_SECRET, { expiresIn: '7d' });
    res.cookie('gif_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.FRONTEND_URL}/account`);
  } catch (err) {
    console.error('OAuth Error:', err);
    res.status(500).send('Internal Server Error during GitHub OAuth.');
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.gif_token;
    if (!token) return res.status(401).json({ authenticated: false });

    const decoded = jwt.verify(token, SESSION_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }});

    if (!user) return res.status(401).json({ authenticated: false });

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        githubId: user.githubId,
        username: user.username,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('gif_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
