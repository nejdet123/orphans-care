
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../models/User');
const SurveyTemplate = require('../models/SurveyTemplate');

// 🔒 كل المسارات التالية تتطلب تسجيل الدخول
router.use(protect);

// 🏠 لوحة التحكم الرئيسية
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'لوحة التحكم',
    active: 'dashboard',
    user: req.user
  });
});

// 📝 إدارة الأسئلة (قديمة)
router.get('/questions', (req, res) => {
  res.render('admin/questions', {
    title: 'إدارة الأسئلة',
    active: 'questions',
    user: req.user
  });
});

// 👥 إدارة المستخدمين (للمشرفين فقط)
router.get('/users', authorize(USER_ROLES.ADMIN), (req, res) => {
  res.render('admin/users', {
    title: 'إدارة المستخدمين',
    active: 'users',
    user: req.user
  });
});

// 🏢 إدارة المنظمات (للمشرفين فقط)
router.get('/organizations', authorize(USER_ROLES.ADMIN), (req, res) => {
  res.render('admin/organizations', {
    title: 'إدارة المنظمات',
    active: 'organizations',
    user: req.user
  });
});
router.get('/survey-editor-new', (req, res) => {
  res.render('admin/survey-editor-new', {
    title: 'إدارة الاستبيان الجديدة',
    active: 'survey-editor',
    user: req.user
  });
});

// 📊 صفحة التقارير
router.get('/reports', (req, res) => {
  res.render('admin/reports', {
    title: 'التقارير',
    active: 'reports',
    user: req.user
  });
});

// 🔍 عرض استبيان محدد
router.get('/surveys/:id', (req, res) => {
  res.render('admin/survey-details', {
    title: 'تفاصيل الاستبيان',
    active: 'surveys',
    surveyId: req.params.id,
    user: req.user
  });
});

// 🆕 واجهة إدارة الاستبيان الجديدة
router.get('/survey-editor', (req, res) => {
  res.render('admin/survey-editor', {
    title: 'إدارة الاستبيان',
    active: 'survey-editor',
    user: req.user
  });
});
router.get('/api/survey-template', async (req, res) => {
  try {
    const template = await SurveyTemplate.findOne({ key: 'orphans-training-survey' });
    if (!template) return res.status(404).json({ success: false, message: 'القالب غير موجود' });
    res.json({ success: true, data: template });
  } catch (err) {
    console.error('❌ خطأ في تحميل القالب:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

router.get('/survey-template', async (req, res) => {
  try {
    const template = await SurveyTemplate.findOne({ key: "orphans-training-survey" });
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: 'فشل في تحميل القالب' });
  }
});

router.post('/survey-template', async (req, res) => {
  try {
    const updated = await SurveyTemplate.findOneAndUpdate(
      { key: "orphans-training-survey" },
      { $set: { "structure.survey.sections": req.body.sections } },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'فشل في الحفظ' });
  }
});

module.exports = router;
