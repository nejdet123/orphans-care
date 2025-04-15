const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  surveyKey: String,         // مفتاح الاستبيان (مثلاً: orphans-training-survey)
  answers: mongoose.Schema.Types.Mixed, // تخزين الأجوبة بأي شكل
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
