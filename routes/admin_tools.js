const express = require('express');
const router = express.Router();
const HazardZone = require('../models/HazardZone');
const Broadcast = require('../models/Broadcast');
const SafetyCheck = require('../models/SafetyCheck');
const MarketplaceItem = require('../models/MarketplaceItem');
const Volunteer = require('../models/Volunteer');
const Resource = require('../models/Resource');

// Safety Check Routes
router.get('/safety-checks', async (req, res) => {
  try {
    const checks = await SafetyCheck.find().sort({ createdAt: -1 });
    res.json(checks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/safety-checks/create', async (req, res) => {
  try {
    const check = new SafetyCheck(req.body);
    await check.save();
    global.io.emit('newSafetyCheck', check);
    res.json(check);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/safety-checks/:id/respond', async (req, res) => {
  try {
    const { name, age, status } = req.body;
    const check = await SafetyCheck.findById(req.params.id);
    if (!check) return res.status(404).json({ message: 'Safety check not found' });
    
    check.responses.push({ name, age, status, userId: Date.now().toString() });
    await check.save();
    global.io.emit('safetyCheckUpdated', check);
    res.json(check);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/safety-checks/:id/close', async (req, res) => {
  try {
    const check = await SafetyCheck.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    global.io.emit('safetyCheckUpdated', check);
    res.json(check);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// Hazard Zone Routes
router.get('/hazards', async (req, res) => {
  try {
    const hazards = await HazardZone.find({ isActive: true });
    res.json(hazards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/hazards/create', async (req, res) => {
  try {
    const hazard = new HazardZone(req.body);
    await hazard.save();
    global.io.emit('newHazard', hazard);
    res.json(hazard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/hazards/:id', async (req, res) => {
  try {
    const hazard = await HazardZone.findByIdAndUpdate(req.params.id, { isActive: false });
    
    // Return deployed resources to their respective departments
    if (hazard && hazard.deployedResources && hazard.deployedResources.length > 0) {
      for (const item of hazard.deployedResources) {
        if (item.resourceId) {
          await Resource.findByIdAndUpdate(item.resourceId, {
            $inc: { quantity: item.quantity }
          });
        }
      }
    }

    global.io.emit('hazardRemoved', req.params.id);
    res.json({ message: 'Hazard zone deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Broadcast Routes
router.get('/broadcasts', async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({ isActive: true }).sort({ sentAt: -1 }).limit(5);
    res.json(broadcasts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/broadcast/send', async (req, res) => {
  try {
    const broadcast = new Broadcast(req.body);
    await broadcast.save();
    global.io.emit('broadcastAlert', broadcast);
    res.json(broadcast);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/broadcast/:id/close', async (req, res) => {
  try {
    await Broadcast.findByIdAndUpdate(req.params.id, { isActive: false });
    global.io.emit('broadcastClosed', req.params.id);
    res.json({ message: 'Broadcast closed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Marketplace Approval Routes
router.get('/marketplace/pending', async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/marketplace/:id/approve', async (req, res) => {
  try {
    const item = await MarketplaceItem.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/marketplace/:id/reject', async (req, res) => {
  try {
    const item = await MarketplaceItem.findByIdAndUpdate(req.params.id, { status: 'Rejected' }, { new: true });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Volunteer Verification Routes
router.put('/volunteers/:id/verify', async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, { status: 'Verified' }, { new: true });
    res.json(volunteer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
