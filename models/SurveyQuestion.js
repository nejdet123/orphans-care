const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },          // نص السؤال
  domain: { type: String },                        // المجال (نفسي، تربوي، إلخ)
  type: { type: String, default: 'scale' },        // نوع الإجابة (مقياس، نص...)
  order: { type: Number }                          // ترتيب السؤال
});

module.exports = mongoose.model('SurveyQuestion', questionSchema);
