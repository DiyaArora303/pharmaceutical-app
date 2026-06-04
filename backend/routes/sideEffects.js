const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.Brand_Name, se.Description, se.Severity, se.SideEffect_ID, d.Drug_ID
      FROM drug d
      JOIN drug_side_effect dse ON d.Drug_ID = dse.Drug_ID
      JOIN side_effect se ON dse.SideEffect_ID = se.SideEffect_ID
      ORDER BY FIELD(se.Severity,'Severe','Moderate','Mild')
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { Drug_ID, Description, Severity } = req.body;
  try {
    const [se] = await db.query('INSERT INTO side_effect (Description, Severity) VALUES (?,?)', [Description, Severity]);
    await db.query('INSERT INTO drug_side_effect (Drug_ID, SideEffect_ID) VALUES (?,?)', [Drug_ID, se.insertId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;