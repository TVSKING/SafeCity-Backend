const Alert = require('../models/Alert');

exports.createAlert = async (req, res) => {
  try {
    const { reporterName, reporterPhone, type, description, location, state, triageLevel, triageResponses } = req.body;
    console.log(`🚨 NEW ALERT RECEIVED | State: ${state} | Type: ${type}`);
    let assignedDepartment = 'none';

    if (type === 'Fire') assignedDepartment = 'fire';
    else if (type === 'Medical') assignedDepartment = 'ambulance';
    else if (type === 'Crime') assignedDepartment = 'police';
    else if (type === 'Accident') assignedDepartment = 'police';
    else if (type === 'SOS') assignedDepartment = 'none'; // SOS often needs multi-dept or manual assignment

    const alert = new Alert({
      reporterName,
      reporterPhone,
      type,
      description,
      location,
      triageLevel,
      triageResponses,
      assignedDepartment,
      state, 
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
    const { deptType } = req.query;
    const userState = req.user && req.user.state ? req.user.state.trim() : null;
    
    console.log(`🔍 FETCHING ALERTS | Dept: ${deptType} | Station State: "${userState}"`);

    if (!userState) {
      console.log('⚠️ REJECTED: Station has no state assigned in profile');
      return res.json([]);
    }

    // Create a case-insensitive regex for the state to avoid mismatch
    const stateRegex = new RegExp(`^${userState}$`, 'i');

    let query = { 
      state: stateRegex,
      assignedDepartment: deptType
    };

    if (deptType === 'police') {
      query = { 
        state: stateRegex,
        $or: [{ assignedDepartment: 'police' }, { type: 'Crime' }, { type: 'Accident' }, { type: 'SOS' }] 
      };
    } else if (deptType === 'fire') {
      query = { 
        state: stateRegex,
        $or: [{ assignedDepartment: 'fire' }, { type: 'Fire' }, { type: 'SOS' }] 
      };
    } else if (deptType === 'ambulance') {
      query = { 
        state: stateRegex,
        $or: [{ assignedDepartment: 'ambulance' }, { type: 'Medical' }, { type: 'Accident' }, { type: 'SOS' }] 
      };
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
