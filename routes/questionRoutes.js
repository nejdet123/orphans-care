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
const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// ✅ جلب كل الأسئلة
router.get('/', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    res.json(survey.questions || []);
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب الأسئلة' });
  }
});

// ✅ إضافة سؤال
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    const survey = await Survey.findOne();
    survey.questions.push(question);
    await survey.save();
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ message: 'فشل في الإضافة' });
  }
});

// ✅ تعديل سؤال
router.put('/:index', async (req, res) => {
  try {
    const { newQuestion } = req.body;
    const { index } = req.params;
    const survey = await Survey.findOne();
    survey.questions[index] = newQuestion;
    await survey.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'فشل في التعديل' });
  }
});

// ✅ حذف سؤال
router.delete('/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const survey = await Survey.findOne();
    survey.questions.splice(index, 1);
    await survey.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'فشل في الحذف' });
  }
});

module.exports = router;
