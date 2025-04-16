const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  answers: {
    type: Object, // جميع الإجابات يتم حفظها ككائن JSON
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
