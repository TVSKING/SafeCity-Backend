const Alert = require('../models/Alert');
const { classifyEmergency } = require('../utils/triage');

exports.createAlert = async (req, res) => {
  try {
    const { reporterName, reporterPhone, type, description, location, state, triageLevel, triageResponses, media } = req.body;
    
    // AI Triage Integration
    const triage = classifyEmergency(description || "");
    const finalType = type || triage.type;
    const finalPriority = triage.priority;

    console.log(`🚨 NEW ALERT RECEIVED | State: ${state} | Type: ${finalType} | Priority: ${finalPriority}`);
    
    let assignedDepartment = 'none';
    const normalizedType = finalType.toLowerCase();
    if (normalizedType === 'fire') assignedDepartment = 'fire';
    else if (normalizedType === 'medical') assignedDepartment = 'ambulance';
    else if (normalizedType === 'crime') assignedDepartment = 'police';
    else if (normalizedType === 'accident') assignedDepartment = 'police';
    else if (normalizedType === 'sos') assignedDepartment = 'none';

    const alert = new Alert({
      reporterName,
      reporterPhone,
      type: finalType,
      priority: finalPriority,
      description,
      location,
      triageLevel,
      triageResponses,
      assignedDepartment,
      state, 
      media: media || [],
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

exports.getAlertAnalytics = async (req, res) => {
  try {
    const typeDistribution = await Alert.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    const statusDistribution = await Alert.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Simple response time calculation (Mocked logic based on resolved alerts)
    const resolvedAlerts = await Alert.find({ status: 'Resolved' }).limit(100);
    const avgResponseTime = resolvedAlerts.length > 0 ? 12 : 0; // In minutes

    res.json({
      typeDistribution,
      statusDistribution,
      avgResponseTime
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminAlerts = async (req, res) => {
// ... rest of the file ...

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
