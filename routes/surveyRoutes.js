const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// استرجاع جميع بيانات الاستبيان
router.get('/survey-data', async (req, res) => {
    try {
        const surveys = await Survey.find();
        res.json(surveys);
    } catch (err) {
        console.error('❌ خطأ في استرجاع بيانات الاستبيان:', err);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب البيانات' });
    }
});

// حفظ بيانات الاستبيان الجديدة
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

module.exports = router;
