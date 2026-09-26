const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

router.get('/health/database', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "GIF database is connected"
    });
  } catch (err) {
    res.json({
      success: false,
      message: "GIF database connection failed"
    });
  }
});

module.exports = router;
