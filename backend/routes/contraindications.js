const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.Contraindication_ID, c.Condition_Name,
             GROUP_CONCAT(d.Brand_Name SEPARATOR ', ') AS Drugs
      FROM contraindication c
      LEFT JOIN drug_contraindication dc ON c.Contraindication_ID = dc.Contraindication_ID
      LEFT JOIN drug d ON dc.Drug_ID = d.Drug_ID
      GROUP BY c.Contraindication_ID, c.Condition_Name
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { Condition_Name, Drug_ID } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO contraindication (Condition_Name) VALUES (?)',
      [Condition_Name]
    );
    const cid = result.insertId;
    if (Drug_ID) {
      await db.query(
        'INSERT INTO drug_contraindication (Drug_ID, Contraindication_ID) VALUES (?,?)',
        [Drug_ID, cid]
      );
    }
    res.json({ success: true, Contraindication_ID: cid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;