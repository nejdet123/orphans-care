const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../models/User');

// مسارات المصادقة العامة
router.post('/register', authController.register);
router.post('/login', authController.login);

// مسارات تتطلب المصادقة
router.use(protect);

// مسارات المستخدم الحالي
router.get('/me', authController.getMe);
router.put('/update-profile', authController.updateUser);
router.put('/change-password', authController.changePassword);

// مسارات إدارة المستخدمين (للمدير فقط)
router.get('/users', authorize(USER_ROLES.ADMIN), authController.getAllUsers);
router.put('/users/role', authorize(USER_ROLES.ADMIN), authController.updateUserRole);
router.delete('/users/:userId', authorize(USER_ROLES.ADMIN), authController.deleteUser);

module.exports = router;
