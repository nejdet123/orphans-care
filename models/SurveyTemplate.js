const mongoose = require('mongoose');

const SurveyTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true // مثال: "orphans-training-survey"
  },
  title: {
    type: String,
    required: true
  },
  structure: {
    type: Object,
    required: true // يحتوي على surveyIntro, sections, surveyFooter...
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SurveyTemplate', SurveyTemplateSchema);
