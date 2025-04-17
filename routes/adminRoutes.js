const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../models/User');
const SurveyTemplate = require('../models/SurveyTemplate');

// 🔒 مسارات لوحة التحكم (تتطلب تسجيل الدخول)
router.use(protect);

// 🏠 الصفحة الرئيسية للوحة التحكم
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'لوحة التحكم',
    active: 'dashboard',
    user: req.user
  });
});

// 🧩 إدارة الاستبيانات
router.get('/surveys', (req, res) => {
  res.render('admin/surveys', {
    title: 'إدارة الاستبيانات',
    active: 'surveys',
    user: req.user
  });
});

// 📝 إدارة الأسئلة (القديمة)
router.get('/questions', (req, res) => {
  res.render('admin/questions', {
    title: 'إدارة الأسئلة',
    active: 'questions',
    user: req.user
  });
});

// 👥 إدارة المستخدمين (فقط للمشرفين)
router.get('/users', authorize(USER_ROLES.ADMIN), (req, res) => {
  res.render('admin/users', {
    title: 'إدارة المستخدمين',
    active: 'users',
    user: req.user
  });
});

// 🏢 إدارة المنظمات (فقط للمشرفين)
router.get('/organizations', authorize(USER_ROLES.ADMIN), (req, res) => {
  res.render('admin/organizations', {
    title: 'إدارة المنظمات',
    active: 'organizations',
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
  res.render('survey-editor');
});

// 🔄 API: جلب بيانات الاستبيان
router.get('/api/survey-template', async (req, res) => {
  try {
    const template = await SurveyTemplate.findOne({ key: "orphans-training-survey" });
    res.json({ success: true, data: template });
  } catch (err) {
    console.error("❌ خطأ في جلب القالب:", err);
    res.status(500).json({ success: false, message: "فشل في جلب القالب" });
  }
});

// 💾 API: حفظ التعديلات على الاستبيان
router.post('/api/survey-template', async (req, res) => {
  try {
    const updated = await SurveyTemplate.findOneAndUpdate(
      { key: "orphans-training-survey" },
      { $set: { "structure.survey.sections": req.body.sections } },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ فشل في حفظ التعديلات:", err);
    res.status(500).json({ success: false, message: "فشل في الحفظ" });
  }
});

module.exports = router;
