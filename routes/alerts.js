const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController_V3');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, alertController.createAlert);
router.get('/admin', protect, alertController.getAdminAlerts);
router.get('/department', protect, alertController.getDepartmentAlerts);
router.put('/update/:id', alertController.updateAlertStatus);
router.put('/assign', alertController.assignAlert);
router.get('/debug-db', alertController.debugDB);

module.exports = router;
