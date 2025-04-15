const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// ✅ صفحة إدارة الأسئلة (واجهة)
router.get('/admin/questions', async (req, res) => {
  try {
    const survey = await Survey.findOne();
    const questions = survey?.questions || [];
    res.render('admin/questions', {
      questions,
      layout: false // ✅ عرض الصفحة بدون layout لحل مشكلة "questions is not defined"
    });
  } catch (err) {
    console.error('❌ فشل في عرض واجهة الأسئلة:', err);
    res.status(500).send("فشل في عرض الصفحة");
  }
});

// ✅ جلب كل الأسئلة (API)
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
    res.redirect('/admin/questions');
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
    res.redirect('/admin/questions');
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
    res.redirect('/admin/questions');
  } catch (err) {
    res.status(500).json({ message: 'فشل في الحذف' });
  }
});

module.exports = router;
