const mongoose = require('mongoose');

const surveyTemplateSchema = new mongoose.Schema({
  title: String,
  structure: {
    survey: {
      title: String,
      description: String,
      instructions: [String]
    },
    sections: Array
  }
});

module.exports = mongoose.model('SurveyTemplate', surveyTemplateSchema);
