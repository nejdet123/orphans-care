const mongoose = require('mongoose');

const SurveyTemplateSchema = new mongoose.Schema({
  key: String,
  structure: {
    survey: {
      title: String,
      description: String,
      instructions: [String],
      sections: Array
    }
  }
});

module.exports = mongoose.model('SurveyTemplate', SurveyTemplateSchema);
