const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [active] = await db.query(`
      SELECT ai.Ingredient_Name, d.Brand_Name, dai.Strength, d.Drug_ID, ai.Ingredient_ID
      FROM active_ingredient ai
      JOIN drug_active_ingredient dai ON ai.Ingredient_ID = dai.Ingredient_ID
      JOIN drug d ON dai.Drug_ID = d.Drug_ID
    `);
    const [inactive] = await db.query(`
      SELECT ii.Excipient_Name, d.Brand_Name, d.Drug_ID, ii.Excipient_ID
      FROM inactive_ingredient ii
      JOIN drug_inactive_ingredient dii ON ii.Excipient_ID = dii.Excipient_ID
      JOIN drug d ON dii.Drug_ID = d.Drug_ID
    `);
    res.json({ active, inactive });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;