const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// ✅ جلب كل الأسئلة
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
    res.sendStatus(201);
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
    res.sendStatus(200);
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
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'فشل في الحذف' });
  }
});
router.get('/admin/questions', async (req, res) => {
  const survey = await Survey.findOne();
  res.render('admin/questions', { questions: survey?.questions || [] });
});

module.exports = router;
