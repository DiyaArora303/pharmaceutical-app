const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.Compound_ID, c.Compound_Name, c.Chemical_Formula,
             GROUP_CONCAT(d.Brand_Name SEPARATOR ', ') AS Drugs
      FROM compound c
      LEFT JOIN drug_compound dc ON c.Compound_ID = dc.Compound_ID
      LEFT JOIN drug d ON dc.Drug_ID = d.Drug_ID
      GROUP BY c.Compound_ID, c.Compound_Name, c.Chemical_Formula
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { Compound_Name, Chemical_Formula } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO compound (Compound_Name, Chemical_Formula) VALUES (?,?)',
      [Compound_Name, Chemical_Formula]
    );
    res.json({ success: true, Compound_ID: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;