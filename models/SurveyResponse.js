const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  surveyKey: String,
  answers: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
