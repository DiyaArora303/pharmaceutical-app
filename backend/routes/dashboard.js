const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [[drugs]]        = await db.query('SELECT COUNT(*) AS count FROM drug');
    const [[interactions]] = await db.query('SELECT COUNT(*) AS count FROM drug_interaction');
    const [[sideEffects]]  = await db.query('SELECT COUNT(*) AS count FROM side_effect');
    const [[ingredients]]  = await db.query('SELECT COUNT(*) AS count FROM active_ingredient');
    const [[compounds]]    = await db.query('SELECT COUNT(*) AS count FROM compound');
    const [[contraind]]    = await db.query('SELECT COUNT(*) AS count FROM contraindication');
    res.json({
      totalDrugs:             drugs.count,
      totalInteractions:      interactions.count,
      totalSideEffects:       sideEffects.count,
      totalIngredients:       ingredients.count,
      totalCompounds:         compounds.count,
      totalContraindications: contraind.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;