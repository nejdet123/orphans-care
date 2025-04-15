// routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const SurveyTemplate = require('../models/SurveyTemplate'); // تأكد من وجود هذا الموديل

// عرض الاستبيان ديناميكياً
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

module.exports = router;
