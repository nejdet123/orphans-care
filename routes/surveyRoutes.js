const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

/**
 * GET: استرجاع جميع الاستبيانات
 */
router.get('/survey-data', async (req, res) => {
  try {
    const surveys = await Survey.find();
    return res.status(200).json({
      success: true,
      data: surveys
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
 * POST: إضافة سؤال جديد إلى استبيان محدد
 * يتم تحديد الاستبيان باستخدام surveyId
 */
router.post('/survey-data/:surveyId/questions', async (req, res) => {
  try {
    const { questionText } = req.body;

    // تحقق أساسي من صحة السؤال
    if (!questionText || typeof questionText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال سؤال بشكل نصي غير فارغ'
      });
    }

    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'الاستبيان غير موجود'
      });
    }

    survey.questions.push({ text: questionText });
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
 * DELETE: حذف سؤال من استبيان باستخدام questionId
 */
router.delete('/survey-data/:surveyId/questions/:questionId', async (req, res) => {
  try {
    const { surveyId, questionId } = req.params;

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'الاستبيان غير موجود'
      });
    }

    const questionIndex = survey.questions.findIndex(q => q._id.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'السؤال غير موجود'
      });
    }

    survey.questions.splice(questionIndex, 1);
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
 * PUT: تعديل سؤال في استبيان باستخدام questionId
 */
router.put('/survey-data/:surveyId/questions/:questionId', async (req, res) => {
  try {
    const { surveyId, questionId } = req.params;
    const { newQuestionText } = req.body;

    if (!newQuestionText || typeof newQuestionText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال سؤال جديد بشكل نصي غير فارغ'
      });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'الاستبيان غير موجود'
      });
    }

    const question = survey.questions.id(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'السؤال غير موجود'
      });
    }

    question.text = newQuestionText;
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
  res.render('dashboard-dark');
});

module.exports = router;
