const Alert = require('../models/Alert');
const mongoose = require('mongoose');

exports.createAlert = async (req, res) => {
  try {
    const { reporterName, reporterPhone, type, description, location, state, triageLevel, triageResponses } = req.body;
    
    if (!type) throw new Error('Alert type is required');

    if (!type) throw new Error('Alert type is required');

    // Normalize type (e.g., 'fire' -> 'Fire', but 'SOS' -> 'SOS')
    let normalizedType = type.trim();
    if (normalizedType.toUpperCase() === 'SOS') {
      normalizedType = 'SOS';
    } else {
      normalizedType = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1).toLowerCase();
    }
    
    // Ensure state is provided (required by model)
    const finalState = state || 'Gujarat';
    
    console.log(`🚨 ALERT ATTEMPT | State: ${finalState} | Type: ${normalizedType} | Payload: ${JSON.stringify(location)}`);
    let assignedDepartment = 'none';

    if (normalizedType === 'Fire') assignedDepartment = 'fire';
    else if (normalizedType === 'Medical') assignedDepartment = 'ambulance';
    else if (normalizedType === 'Crime') assignedDepartment = 'police';
    else if (normalizedType === 'Accident') assignedDepartment = 'police';
    else if (normalizedType === 'SOS') assignedDepartment = 'none';

    const alert = new Alert({
      reporterName,
      reporterPhone,
      type: normalizedType,
      description,
      location,
      triageLevel,
      triageResponses,
      assignedDepartment,
      state: finalState, 
      status: 'Pending'
    });

    await alert.save();

    if (global.io) {
      global.io.emit('newAlert', alert);
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartmentAlerts = async (req, res) => {
  try {
    const deptType = req.query.deptType ? req.query.deptType.toLowerCase() : null;
    
    console.log(`🔐 AUTH VERIFIED | User: ${req.user?.email} | State: ${req.user?.state}`);
    
    const userState = req.user && req.user.state ? req.user.state.trim() : null;
    
    if (!userState) {
      console.log(`⚠️ REJECTED | User: ${req.user ? req.user.name : 'Unknown'} | Reason: No state assigned`);
      return res.json([]);
    }

    // LOOSE MATCH (Handles hidden spaces/characters)
    let query = { 
      state: { $regex: userState, $options: 'i' }
    };

    if (deptType === 'police') {
      query.$or = [{ assignedDepartment: 'police' }, { type: 'Crime' }, { type: 'Accident' }, { type: 'SOS' }];
    } else if (deptType === 'fire') {
      query.$or = [{ assignedDepartment: 'fire' }, { type: 'Fire' }, { type: 'SOS' }];
    } else if (deptType === 'ambulance' || deptType === 'medical') {
      query.$or = [{ assignedDepartment: 'ambulance' }, { assignedDepartment: 'medical' }, { type: 'Medical' }, { type: 'Accident' }, { type: 'SOS' }];
    } else if (deptType === 'all') {
      // Do not add department filter, show everything in state
    } else {
      query.assignedDepartment = deptType;
    }

    const totalInDb = await Alert.countDocuments({});
    console.log(`📊 DATABASE STATUS | Total Alerts in DB: ${totalInDb} | Query: ${JSON.stringify(query)}`);

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    console.log(`✅ FOUND: ${alerts.length} matching alerts`);
    
    // Return both the alerts and the total count for debugging
    res.json({
      alerts,
      totalInDb,
      appliedQuery: query,
      dbHost: mongoose.connection.host,
      dbName: mongoose.connection.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.debugDB = async (req, res) => {
  try {
    const dbName = mongoose.connection.name;
    const collections = await mongoose.connection.db.listCollections().toArray();
    const userCount = await mongoose.model('User').countDocuments({});
    const alertCount = await mongoose.model('Alert').countDocuments({});
    
    res.json({
      activeDatabase: dbName,
      collections: collections.map(c => c.name),
      userCount,
      alertCount,
      connectionStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const alert = await Alert.findByIdAndUpdate(id, { status }, { new: true });

    if (global.io) {
      global.io.emit('alertUpdated', alert);
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignAlert = async (req, res) => {
  try {
    const { alertId, departmentType } = req.body;
    const alert = await Alert.findByIdAndUpdate(alertId, { assignedDepartment: departmentType }, { new: true });

    if (global.io) {
      global.io.emit('alertUpdated', alert);
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
