const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const HazardZone = require('../models/HazardZone');

// Get all resources for a department
router.get('/:deptType', async (req, res) => {
  try {
    let query = {};
    if (req.params.deptType !== 'all') {
       query = { departmentType: req.params.deptType };
    }
    const resources = await Resource.find(query);
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update resource quantity
router.put('/update/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const resource = await Resource.findByIdAndUpdate(
      req.params.id, 
      { quantity, lastUpdated: Date.now() }, 
      { new: true }
    );
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new resource type or update if it exists
router.post('/', async (req, res) => {
  try {
    const { name, departmentType, quantity, unit } = req.body;
    
    // Check if it already exists
    let existing = await Resource.findOne({ name, departmentType });
    
    if (existing) {
      existing.quantity += parseInt(quantity);
      existing.lastUpdated = Date.now();
      await existing.save();
      return res.json(existing);
    }

    const resource = new Resource(req.body);
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a resource type completely
router.delete('/:id', async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Broadcast a deployment to all connected clients and log it
router.post('/deploy', async (req, res) => {
  try {
    if (req.body.hazardId && req.body.resourceId) {
      await HazardZone.findByIdAndUpdate(req.body.hazardId, {
        $push: { deployedResources: { resourceId: req.body.resourceId, quantity: req.body.qty } }
      });
    }

    global.io.emit('newDeployment', req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
