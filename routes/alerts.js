const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController_V3');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', (req, res, next) => alertController.createAlert(req, res, next));
router.get('/admin', protect, (req, res, next) => alertController.getAdminAlerts(req, res, next));
router.get('/department', protect, (req, res, next) => alertController.getDepartmentAlerts(req, res, next));
router.put('/update/:id', (req, res, next) => alertController.updateAlertStatus(req, res, next));
router.put('/assign', (req, res, next) => alertController.assignAlert(req, res, next));
router.get('/debug-db', alertController.debugDB);

module.exports = router;
