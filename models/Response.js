// models/Response.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  answers: [String], // أو [Number] إذا بدك تخزن أرقام فقط
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', responseSchema);
