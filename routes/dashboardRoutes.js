const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

router.get('/dashboard', async (req, res) => {
  try {
    const surveys = await Survey.find().lean();
    res.render('dashboard', { surveys });
  } catch (err) {
    console.error('❌ خطأ في جلب البيانات:', err);
    res.status(500).send('حدث خطأ أثناء جلب النتائج');
  }
});

module.exports = router;
