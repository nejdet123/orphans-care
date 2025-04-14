const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

/**
 * GET: استرجاع جميع الاستبيانات
 */
const { protect, authorize } = require('../middleware/auth');

router.get('/survey-data', protect, async (req, res) => {
  try {
    const surveys = await Survey.find();
 
    return res.status(200).json({
      success: true,
      data: surveys
    }
});

  } catch (err) {
    console.error('❌ خطأ في استرجاع بيانات الاستبيان:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات',
      error: err.message
    });
  }
});

/**
 * POST: حفظ استبيان جديد
 */
router.post('/survey-data', async (req, res) => {
  try {
    const surveyData = new Survey(req.body);
    await surveyData.save();
    return res.status(201).json({
      success: true,
      message: 'تم حفظ بيانات الاستبيان بنجاح'
    });
  } catch (err) {
    console.error('❌ خطأ في حفظ بيانات الاستبيان:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ البيانات',
      error: err.message
    });
  }
});

/**
 * POST: إضافة سؤال جديد إلى الاستبيان (نفترض وجود استبيان واحد فقط)
 * إذا كان لديك استبيانات متعددة فيجب تمرير surveyId مثلاً في المسار.
 */
router.post('/api/questions', async (req, res) => {
  try {
    const { question } = req.body;

    // تحقق أساسي من صحة السؤال
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال سؤال بشكل نصي غير فارغ'
      });
    }

    // ابحث عن أي استبيان (أول استبيان في قاعدة البيانات)
    const survey = await Survey.findOne();
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد استبيان بعد'
      });
    }

    survey.questions.push(question);
    await survey.save();

    return res.status(200).json({
      success: true,
      message: 'تمت إضافة السؤال بنجاح',
      questions: survey.questions
    });
  } catch (err) {
    console.error('❌ خطأ أثناء إضافة السؤال:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة السؤال',
      error: err.message
    });
  }
});

/**
 * DELETE: حذف سؤال من الاستبيان بالاعتماد على فهرس السؤال (index)
 */
router.delete('/api/questions/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);

    // تأكد من أن الفهرس رقم صالح
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يكون الفهرس رقمًا صحيحًا'
      });
    }

    const survey = await Survey.findOne();
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد استبيان بعد'
      });
    }

    // تحقق من أن الفهرس ضمن حدود مصفوفة الأسئلة
    if (index < 0 || index >= survey.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'الفهرس غير صالح'
      });
    }

    // احذف السؤال
    survey.questions.splice(index, 1);
    await survey.save();

    return res.status(200).json({
      success: true,
      message: 'تم حذف السؤال بنجاح',
      questions: survey.questions
    });
  } catch (err) {
    console.error('❌ خطأ أثناء حذف السؤال:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الحذف',
      error: err.message
    });
  }
});

/**
 * PUT: تعديل سؤال استنادًا إلى الفهرس (index)
 */
router.put('/api/questions/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const { newQuestion } = req.body;

    // تحقق من أن الفهرس رقم صالح
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يكون الفهرس رقمًا صحيحًا'
      });
    }

    // تحقق أساسي من صحة السؤال الجديد
    if (!newQuestion || typeof newQuestion !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال سؤال بشكل نصي غير فارغ'
      });
    }

    const survey = await Survey.findOne();
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد استبيان بعد'
      });
    }

    // تحقق من أن الفهرس ضمن حدود مصفوفة الأسئلة
    if (index < 0 || index >= survey.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'الفهرس غير صالح'
      });
    }

    // عدّل السؤال
    survey.questions[index] = newQuestion;
    await survey.save();

    return res.status(200).json({
      success: true,
      message: 'تم تعديل السؤال بنجاح',
      questions: survey.questions
    });
  } catch (err) {
    console.error('❌ خطأ أثناء تعديل السؤال:', err);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التعديل',
      error: err.message
    });
  }
});

/**
 * GET: عرض لوحة التحكم الجديدة (الوضع الليلي)
 */
router.get('/dashboard-dark', (req, res) => {
  // مجرّد عرض لواجهة (View) باسم 'dashboard-dark'
  res.render('dashboard-dark');
});

module.exports = router;
