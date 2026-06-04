const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.Drug_ID, d.Brand_Name, g.Generic_Name,
             t.Class_Name, df.Form_Name, r.Status_Name
      FROM drug d
      JOIN generic_drug g ON d.Generic_ID = g.Generic_ID
      JOIN therapeutic_class t ON d.Therapeutic_Class_ID = t.Therapeutic_Class_ID
      JOIN dosage_form df ON d.Dosage_Form_ID = df.Dosage_Form_ID
      JOIN regulatory_status r ON d.Regulatory_Status_ID = r.Regulatory_Status_ID
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/meta', async (req, res) => {
  try {
    const [generics]    = await db.query('SELECT * FROM generic_drug');
    const [classes]     = await db.query('SELECT * FROM therapeutic_class');
    const [forms]       = await db.query('SELECT * FROM dosage_form');
    const [statuses]    = await db.query('SELECT * FROM regulatory_status');
    const [ingredients] = await db.query('SELECT * FROM active_ingredient');
    const [compounds]   = await db.query('SELECT * FROM compound');
    res.json({ generics, classes, forms, statuses, ingredients, compounds });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { Brand_Name, Generic_ID, Therapeutic_Class_ID, Dosage_Form_ID, Regulatory_Status_ID, Ingredient_ID, Strength, Compound_ID } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO drug (Brand_Name, Generic_ID, Therapeutic_Class_ID, Dosage_Form_ID, Regulatory_Status_ID) VALUES (?,?,?,?,?)',
      [Brand_Name, Generic_ID, Therapeutic_Class_ID, Dosage_Form_ID, Regulatory_Status_ID]
    );
    const drugId = result.insertId;
    if (Ingredient_ID && Strength) {
      await db.query('INSERT INTO drug_active_ingredient (Drug_ID, Ingredient_ID, Strength) VALUES (?,?,?)', [drugId, Ingredient_ID, Strength]);
    }
    if (Compound_ID) {
      await db.query('INSERT INTO drug_compound (Drug_ID, Compound_ID) VALUES (?,?)', [drugId, Compound_ID]);
    }
    res.json({ success: true, Drug_ID: drugId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/details', async (req, res) => {
  const drugId = req.params.id;
  try {
    const [[baseInfo]] = await db.query(`
      SELECT d.Drug_ID, d.Brand_Name, g.Generic_Name,
             t.Class_Name, df.Form_Name, r.Status_Name,
             d.Generic_ID, d.Therapeutic_Class_ID, d.Dosage_Form_ID, d.Regulatory_Status_ID
      FROM drug d
      JOIN generic_drug g ON d.Generic_ID = g.Generic_ID
      JOIN therapeutic_class t ON d.Therapeutic_Class_ID = t.Therapeutic_Class_ID
      JOIN dosage_form df ON d.Dosage_Form_ID = df.Dosage_Form_ID
      JOIN regulatory_status r ON d.Regulatory_Status_ID = r.Regulatory_Status_ID
      WHERE d.Drug_ID = ?
    `, [drugId]);

    if (!baseInfo) return res.status(404).json({ error: 'Drug not found' });

    const [ingredients] = await db.query(`
      SELECT ai.Ingredient_ID, ai.Ingredient_Name, dai.Strength
      FROM active_ingredient ai
      JOIN drug_active_ingredient dai ON ai.Ingredient_ID = dai.Ingredient_ID
      WHERE dai.Drug_ID = ?
    `, [drugId]);

    const [excipients] = await db.query(`
      SELECT ii.Excipient_ID, ii.Excipient_Name
      FROM inactive_ingredient ii
      JOIN drug_inactive_ingredient dii ON ii.Excipient_ID = dii.Excipient_ID
      WHERE dii.Drug_ID = ?
    `, [drugId]);

    const [compounds] = await db.query(`
      SELECT c.Compound_ID, c.Compound_Name, c.Chemical_Formula
      FROM compound c
      JOIN drug_compound dc ON c.Compound_ID = dc.Compound_ID
      WHERE dc.Drug_ID = ?
    `, [drugId]);

    const [sideEffects] = await db.query(`
      SELECT se.SideEffect_ID, se.Description, se.Severity
      FROM side_effect se
      JOIN drug_side_effect dse ON se.SideEffect_ID = dse.SideEffect_ID
      WHERE dse.Drug_ID = ?
    `, [drugId]);

    const [contraindications] = await db.query(`
      SELECT c.Contraindication_ID, c.Condition_Name
      FROM contraindication c
      JOIN drug_contraindication dc ON c.Contraindication_ID = dc.Contraindication_ID
      WHERE dc.Drug_ID = ?
    `, [drugId]);

    res.json({
      ...baseInfo,
      ingredients,
      excipients,
      compounds,
      sideEffects,
      contraindications
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const drugId = req.params.id;
  const { Brand_Name, Generic_ID, Therapeutic_Class_ID, Dosage_Form_ID, Regulatory_Status_ID, Ingredient_ID, Strength, Compound_ID } = req.body;
  try {
    // 1. Update main drug record
    await db.query(
      'UPDATE drug SET Brand_Name = ?, Generic_ID = ?, Therapeutic_Class_ID = ?, Dosage_Form_ID = ?, Regulatory_Status_ID = ? WHERE Drug_ID = ?',
      [Brand_Name, Generic_ID, Therapeutic_Class_ID, Dosage_Form_ID, Regulatory_Status_ID, drugId]
    );

    // 2. Update active ingredients association
    await db.query('DELETE FROM drug_active_ingredient WHERE Drug_ID = ?', [drugId]);
    if (Ingredient_ID && Strength) {
      await db.query('INSERT INTO drug_active_ingredient (Drug_ID, Ingredient_ID, Strength) VALUES (?,?,?)', [drugId, Ingredient_ID, Strength]);
    }

    // 3. Update compounds association
    await db.query('DELETE FROM drug_compound WHERE Drug_ID = ?', [drugId]);
    if (Compound_ID) {
      await db.query('INSERT INTO drug_compound (Drug_ID, Compound_ID) VALUES (?,?)', [drugId, Compound_ID]);
    }

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM drug_active_ingredient WHERE Drug_ID = ?', [req.params.id]);
    await db.query('DELETE FROM drug_inactive_ingredient WHERE Drug_ID = ?', [req.params.id]);
    await db.query('DELETE FROM drug_compound WHERE Drug_ID = ?', [req.params.id]);
    await db.query('DELETE FROM drug_side_effect WHERE Drug_ID = ?', [req.params.id]);
    await db.query('DELETE FROM drug_contraindication WHERE Drug_ID = ?', [req.params.id]);
    await db.query('DELETE FROM drug_interaction WHERE Drug1_ID = ? OR Drug2_ID = ?', [req.params.id, req.params.id]);
    await db.query('DELETE FROM drug WHERE Drug_ID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;