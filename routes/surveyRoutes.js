const express = require('express');
const router = express.Router();
const SurveyTemplate = require('../models/SurveyTemplate');
const SurveyResponse = require('../models/SurveyResponse');

// ✅ عرض الاستبيان ديناميكياً
router.get('/survey', async (req, res) => {
  try {
    const template = await SurveyTemplate.findOne({ key: "orphans-training-survey" });
    if (!template) return res.status(404).send("الاستبيان غير موجود");

    res.render('survey', {
      surveyIntro: template.structure?.survey || {}
    });
  } catch (err) {
    console.error("❌ خطأ في تحميل الاستبيان:", err);
    res.status(500).send("خطأ في تحميل الاستبيان");
  }
});

// ✅ حفظ بيانات الاستبيان بعد الإرسال (استجابة JSON)
router.post('/submit-survey', async (req, res) => {
  try {
    const response = new SurveyResponse({
      surveyKey: "orphans-training-survey",
      answers: req.body,
      submittedAt: new Date()
    });

    await response.save();
    res.json({ success: true, message: "تم حفظ البيانات بنجاح" });
  } catch (err) {
    console.error("❌ خطأ في حفظ الإجابات:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء حفظ البيانات" });
  }
});

// ✅ صفحة الشكر بعد الإرسال
router.get('/thank-you', (req, res) => {
  res.send(`
    <div style="text-align:center; margin-top:100px;">
      <h2>شكرًا لمشاركتك في الاستبيان ❤️</h2>
      <p>تم استلام بياناتك بنجاح.</p>
      <a href="/" style="color: blue;">العودة إلى الصفحة الرئيسية</a>
    </div>
  `);
});

// ✅ API: عرض كل الإجابات (نسخة قديمة - غير مستخدمة حاليًا)
router.get('/api/survey-results', async (req, res) => {
  try {
    const results = await SurveyResponse.find({ surveyKey: "orphans-training-survey" });
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ خطأ في تحميل النتائج:", err);
    res.status(500).json({ success: false, message: "فشل في تحميل النتائج" });
  }
});

// ✅ API: عرض كل بيانات المشاركين للوحة التحكم (المستخدم حاليًا)
router.get('/survey-data', async (req, res) => {
  try {
    const results = await SurveyResponse.find({ surveyKey: "orphans-training-survey" });
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ خطأ في تحميل بيانات الاستبيان:", err);
    res.status(500).json({ success: false, message: "فشل في تحميل البيانات" });
  }
});

module.exports = router;
