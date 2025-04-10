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

module.exports = router;
