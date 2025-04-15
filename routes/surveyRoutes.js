const express = require('express');
const router = express.Router();
const SurveyTemplate = require('../models/SurveyTemplate');
const Response = require('../models/Response');

// ✅ API: استرجاع جميع بيانات الاستبيان (من قالب)
router.get('/survey-data', async (req, res) => {
  try {
    const template = await SurveyTemplate.findOne({ key: "orphans-training-survey" });
    if (!template) return res.status(404).json({ message: 'قالب الاستبيان غير موجود' });

    res.json(template.structure);
  } catch (err) {
    console.error('❌ خطأ في استرجاع بيانات الاستبيان:', err);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب البيانات' });
  }
});

// ✅ API: حفظ أو تحديث قالب الاستبيان
router.post('/survey-data', async (req, res) => {
  try {
    const { structure } = req.body;
    if (!structure) return res.status(400).json({ message: "البيانات غير مكتملة" });

    const existing = await SurveyTemplate.findOne({ key: "orphans-training-survey" });

    if (existing) {
      existing.structure = structure;
      existing.updatedAt = new Date();
      await existing.save();
    } else {
      await SurveyTemplate.create({
        key: "orphans-training-survey",
        title: "استبيان تقييم احتياجات العاملين مع الأيتام",
        structure,
        updatedAt: new Date()
      });
    }

    res.status(200).json({ message: "✅ تم حفظ الاستبيان بنجاح" });
  } catch (err) {
    console.error('❌ خطأ في حفظ بيانات الاستبيان:', err);
    res.status(500).json({ message: 'حدث خطأ أثناء حفظ البيانات' });
  }
});

// ✅ API: حفظ إجابات الاستبيان
router.post('/submit-survey', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).send('⚠️ لم يتم استلام الإجابات بشكل صحيح');
    }

    await Response.create({ answers });
    res.redirect('/thank-you');
  } catch (err) {
    console.error('❌ خطأ في حفظ الإجابات:', err);
    res.status(500).send('❌ فشل في حفظ الاستبيان');
  }
});

// ✅ عرض صفحة الاستبيان بشكل ديناميكي
router.get('/survey', async (req, res) => {
  try {
    const template = await SurveyTemplate.findOne({ key: "orphans-training-survey" });

    if (!template || !template.structure || !template.structure.survey) {
      return res.status(404).send("❌ لم يتم العثور على قالب الاستبيان");
    }

    const survey = template.structure.survey;

    res.render('survey', {
      surveyIntro: {
        title: survey.title,
        description: survey.description,
        instructions: survey.instructions || []
      },
      sections: survey.sections || []
    });
  } catch (err) {
    console.error('❌ خطأ في عرض الاستبيان:', err);
    res.status(500).send('فشل في عرض الاستبيان');
  }
});

// ✅ عرض لوحة التحكم (الوضع الليلي)
router.get('/dashboard-dark', async (req, res) => {
  res.render('dashboard-dark');
});

module.exports = router;
