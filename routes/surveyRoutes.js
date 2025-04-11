const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

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

module.exports = router;
