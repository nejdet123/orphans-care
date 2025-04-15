const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Response = require('../models/Response');

// ✅ استرجاع بيانات الاستبيان (كاملة)
router.get('/survey-data', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    res.json(survey || {});
  } catch (err) {
    console.error('❌ خطأ في جلب بيانات الاستبيان:', err);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب البيانات' });
  }
});

// ✅ حفظ استبيان جديد (إدخال يدوي أو أول مرة)
router.post('/survey-data', async (req, res) => {
  try {
    const surveyData = new Survey(req.body);
    await surveyData.save();
    res.status(201).json({ success: true, message: 'تم حفظ بيانات الاستبيان بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في حفظ بيانات الاستبيان:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ البيانات' });
  }
});

// ✅ عرض الاستبيان للمستخدم (ديناميكي)
router.get('/survey', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    res.render('survey', { survey });
  } catch (err) {
    console.error('❌ خطأ في عرض صفحة الاستبيان:', err);
    res.status(500).send('فشل في عرض الاستبيان');
  }
});

// ✅ عرض صفحة إدارة الأسئلة (ديناميكية حسب البنية الجديدة)
router.get('/manage-questions', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    res.render('manage-questions', { survey });
  } catch (err) {
    console.error('❌ خطأ في عرض إدارة الأسئلة:', err);
    res.status(500).send('فشل في عرض إدارة الأسئلة');
  }
});

// ✅ حفظ إجابات الاستبيان
router.post('/submit-survey', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).send('⚠️ لم يتم استلام الإجابات بشكل صحيح');
    }

    await Response.create({ answers });
    res.redirect('/thank-you');
  } catch (err) {
    console.error('❌ خطأ في حفظ الاستجابات:', err);
    res.status(500).send('❌ فشل في حفظ الاستبيان');
  }
});

// ✅ عرض لوحة التحكم (مستقبلًا تشمل الرسوم التحليلية)
router.get('/dashboard-dark', (req, res) => {
  res.render('dashboard-dark');
});

module.exports = router;
