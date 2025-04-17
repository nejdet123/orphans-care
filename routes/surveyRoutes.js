const express = require('express');
const router = express.Router();
const SurveyResponse = require('../models/SurveyResponse');
const SurveyTemplate = require('../models/SurveyTemplate');

// عرض الاستبيان
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

// حفظ البيانات
router.post('/submit-survey', async (req, res) => {
  try {
    const response = new SurveyResponse({
      answers: req.body,
      submittedAt: new Date()
    });
    await response.save();
    res.json({ success: true, message: "تم حفظ البيانات بنجاح" });
  } catch (err) {
    console.error("❌ خطأ في حفظ البيانات:", err);
    res.status(500).json({ success: false, message: "فشل في حفظ البيانات" });
  }
});

// صفحة الشكر
router.get('/thank-you', (req, res) => {
  res.send(`<h2 style="text-align:center;margin-top:100px;">شكرًا لمشاركتك ❤️</h2>`);
});

// ✅ هذا هو المهم: عرض البيانات بدون شرط surveyKey
router.get('/survey-data', async (req, res) => {
  try {
    const results = await SurveyResponse.find();

    const flattened = results.map(doc => ({
      ...doc.answers,
      _id: doc._id,
      submittedAt: doc.submittedAt || doc.createdAt
    }));

    res.json({ success: true, data: flattened });
  } catch (err) {
    console.error("❌ خطأ في تحميل البيانات:", err);
    res.status(500).json({ success: false, message: "فشل في تحميل البيانات" });
  }
});

module.exports = router;
