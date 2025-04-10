const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../models/User');

// جميع المسارات تتطلب المصادقة
router.use(protect);

// الحصول على جميع الأسئلة
router.get('/', questionController.getAllQuestions);

// الحصول على سؤال محدد
router.get('/:id', questionController.getQuestion);

// إنشاء سؤال جديد (للمدير والمشرف فقط)
router.post('/', authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN), questionController.createQuestion);

// تحديث سؤال (للمدير والمشرف فقط)
router.put('/:id', authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN), questionController.updateQuestion);

// حذف سؤال (للمدير فقط)
router.delete('/:id', authorize(USER_ROLES.ADMIN), questionController.deleteQuestion);

// تغيير ترتيب الأسئلة (للمدير والمشرف فقط)
router.put('/reorder', authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN), questionController.reorderQuestions);

module.exports = router;
