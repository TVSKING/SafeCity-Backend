const express = require('express');
const router = express.Router();
const MissingPerson = require('../models/MissingPerson');

const MarketplaceItem = require('../models/MarketplaceItem');
const Volunteer = require('../models/Volunteer');

// Volunteer Routes
router.post('/volunteers/register', async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.json(volunteer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// Missing Persons
router.get('/missing-persons', async (req, res) => {
  try {
    const persons = await MissingPerson.find().sort({ createdAt: -1 });
    res.json(persons);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/missing-persons/create', async (req, res) => {
  try {
    const person = new MissingPerson(req.body);
    await person.save();
    res.json(person);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/missing-persons/:id', async (req, res) => {
  try {
    await MissingPerson.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Marketplace
router.get('/marketplace', async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'Approved' }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/marketplace/create', async (req, res) => {
  try {
    const item = new MarketplaceItem(req.body);
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/marketplace/:id', async (req, res) => {
  try {
    await MarketplaceItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
