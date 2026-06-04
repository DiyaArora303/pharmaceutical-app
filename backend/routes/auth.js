const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid username or password' });
    const user = rows[0];
    res.json({ user_id: user.user_id, username: user.username, role: user.role, full_name: user.full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;