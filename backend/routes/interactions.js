// interactions.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT di.Interaction_ID, d1.Brand_Name AS Drug_One,
             d2.Brand_Name AS Drug_Two, di.Interaction_Description
      FROM drug_interaction di
      JOIN drug d1 ON di.Drug1_ID = d1.Drug_ID
      JOIN drug d2 ON di.Drug2_ID = d2.Drug_ID
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { Drug1_ID, Drug2_ID, Interaction_Description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO drug_interaction (Drug1_ID, Drug2_ID, Interaction_Description) VALUES (?,?,?)',
      [Drug1_ID, Drug2_ID, Interaction_Description]
    );
    res.json({ success: true, Interaction_ID: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM drug_interaction WHERE Interaction_ID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;