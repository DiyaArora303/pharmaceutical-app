const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT tc.Class_Name, COUNT(d.Drug_ID) AS Drug_Count
      FROM therapeutic_class tc
      LEFT JOIN drug d ON tc.Therapeutic_Class_ID = d.Therapeutic_Class_ID
      GROUP BY tc.Therapeutic_Class_ID, tc.Class_Name
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