const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// ✅ إنشاء استبيان جديد إن لم يكن موجوداً (تشغيل لمرة واحدة فقط)
router.get('/admin/init-survey', async (req, res) => {
  try {
    const existing = await Survey.findOne();
    if (existing) {
      return res.send('✅ الاستبيان موجود مسبقاً');
    }
    await Survey.create({ questions: [] });
    res.send('✅ تم إنشاء استبيان جديد بنجاح');
  } catch (err) {
    console.error('❌ خطأ في إنشاء الاستبيان:', err);
    res.status(500).send('❌ فشل في الإنشاء: ' + err.message);
  }
});

// ✅ صفحة إدارة الأسئلة
router.get('/admin/questions', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    const questions = survey?.questions || [];

    console.log("📦 الأسئلة:", questions); // ✅ للتأكد في الكونسول

    res.render('admin/questions', {
      questions,
      layout: false
    });
  } catch (err) {
    console.error('❌ فشل في عرض واجهة الأسئلة:', err);
    res.status(500).send("فشل في عرض الصفحة");
  }
});

// ✅ API: جلب الأسئلة
router.get('/', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    res.json(survey?.questions || []);
  } catch (err) {
    res.status(500).json({ message: 'فشل في جلب الأسئلة' });
  }
});

// ✅ API: إضافة سؤال
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    const survey = await Survey.findOne();
    survey.questions.push(question);
    await survey.save();
    res.redirect('/admin/questions');
  } catch (err) {
    res.status(500).json({ message: 'فشل في الإضافة' });
  }
});

// ✅ API: تعديل سؤال
router.put('/:index', async (req, res) => {
  try {
    const { newQuestion } = req.body;
    const { index } = req.params;
    const survey = await Survey.findOne();
    survey.questions[index] = newQuestion;
    await survey.save();
    res.redirect('/admin/questions');
  } catch (err) {
    res.status(500).json({ message: 'فشل في التعديل' });
  }
});

// ✅ API: حذف سؤال
router.delete('/:index', async (req, res) => {
  try {
    const { index } = req.params;
    const survey = await Survey.findOne();
    survey.questions.splice(index, 1);
    await survey.save();
    res.redirect('/admin/questions');
  } catch (err) {
    res.status(500).json({ message: 'فشل في الحذف' });
  }
});

module.exports = router;
