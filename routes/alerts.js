const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.post('/create', alertController.createAlert);
router.get('/admin', alertController.getAdminAlerts);
router.get('/department', alertController.getDepartmentAlerts);
router.put('/update/:id', alertController.updateAlertStatus);
router.put('/assign', alertController.assignAlert);
router.get('/debug-db', alertController.debugDB);

module.exports = router;
