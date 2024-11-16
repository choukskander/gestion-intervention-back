const express = require('express');
const router = express.Router();
const Intervention = require('../models/Intervention');

// Route pour créer une nouvelle intervention
router.post('/', async (req, res) => {
  const { title, description, date, location, status } = req.body;
  
  try {
    const newIntervention = new Intervention({
      title,
      description,
      date,
      location,
      status
    });

    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la création de l\'intervention' });
  }
});

module.exports = router;
