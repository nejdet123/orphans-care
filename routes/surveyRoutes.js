const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Response = require('../models/Response'); // أضف هذا في الأعلى مع الاستيرادات الأخرى

// ✅ استرجاع جميع بيانات الاستبيان
router.get('/survey-data', async (req, res) => {
    try {
        const surveys = await Survey.find();
        res.json(surveys);
    } catch (err) {
        console.error('❌ خطأ في استرجاع بيانات الاستبيان:', err);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب البيانات' });
    }
});

// ✅ حفظ بيانات الاستبيان الجديدة
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

// ✅ إضافة سؤال جديد
router.post('/api/questions', async (req, res) => {
    try {
        const { question } = req.body;
        const survey = await Survey.findOne();
        if (!survey) return res.status(404).send('Survey not found');
        survey.questions.push(question);
        await survey.save();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// ✅ حذف سؤال
router.delete('/api/questions/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const survey = await Survey.findOne();
        if (!survey || index < 0 || index >= survey.questions.length) {
            return res.status(400).send('Invalid index');
        }
        survey.questions.splice(index, 1);
        await survey.save();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// ✅ تعديل سؤال
router.put('/api/questions/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const { newQuestion } = req.body;
        const survey = await Survey.findOne();
        if (!survey || index < 0 || index >= survey.questions.length) {
            return res.status(400).send('Invalid index');
        }
        survey.questions[index] = newQuestion;
        await survey.save();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
// ✅ عرض لوحة التحكم الجديدة (الوضع الليلي)
router.get('/dashboard-dark', async (req, res) => {
  res.render('dashboard-dark');
});


module.exports = router;

// ✅ استقبال بيانات الإجابات من الاستبيان
router.post('/submit-survey', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).send('⚠️ لم يتم استلام الإجابات بشكل صحيح');
    }

    await Response.create({ answers });

    res.redirect('/thank-you'); // أو صفحة مخصصة بعد الإرسال
  } catch (err) {
    console.error('❌ خطأ في حفظ الإجابات:', err);
    res.status(500).send('❌ فشل في حفظ الاستبيان');
  }
});

