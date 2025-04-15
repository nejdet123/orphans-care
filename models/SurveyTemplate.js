// models/SurveyTemplate.js

const mongoose = require('mongoose');

const SurveyTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  structure: {
    type: Object,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SurveyTemplate', SurveyTemplateSchema);
