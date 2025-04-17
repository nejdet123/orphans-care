// File: models/SurveyTemplate.js
const mongoose = require('mongoose');

const SurveyTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String
  },
  structure: {
    survey: {
      title: String,
      description: String,
      instructions: [String],
      sections: [mongoose.Schema.Types.Mixed],
      footer: mongoose.Schema.Types.Mixed
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SurveyTemplate', SurveyTemplateSchema);
