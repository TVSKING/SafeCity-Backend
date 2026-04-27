const Alert = require('../models/Alert');

exports.createAlert = async (req, res) => {
  try {
    const { reporterName, reporterPhone, type, description, location, state, triageLevel, triageResponses } = req.body;
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
    const userState = req.user ? req.user.state : null;
    
    let query = { assignedDepartment: deptType };
    
    if (userState) {
      query.state = userState;
    }

    if (deptType === 'police') {
      query = { ...query, $or: [{ assignedDepartment: 'police' }, { type: 'Crime' }, { type: 'Accident' }] };
    } else if (deptType === 'fire') {
      query = { ...query, $or: [{ assignedDepartment: 'fire' }, { type: 'Fire' }] };
    } else if (deptType === 'ambulance') {
      query = { ...query, $or: [{ assignedDepartment: 'ambulance' }, { type: 'Medical' }, { type: 'Accident' }] };
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
