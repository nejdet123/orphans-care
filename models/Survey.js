const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  country: String,
  organization: String,
  organizationCode: String,
  jobTitle: String,
  experience: String,
  ageGroups: [String],
  careTypes: [String],
  previousTraining: String,

  psychologicalTrauma: Number,
  selfConfidence: Number,
  psychologicalCounseling: Number,
  socialIntegration: Number,
  effectiveCommunication: Number,

  modernTeaching: Number,
  learningDifficulties: Number,
  talentDevelopment: Number,
  motivationTechniques: Number,
  careerGuidance: Number,

  firstAid: Number,
  healthCare: Number,
  nutrition: Number,
  commonDiseases: Number,
  personalHygiene: Number,

  religiousValues: Number,
  teachingWorship: Number,
  spiritualAwareness: Number,
  religiousRules: Number,
  religiousIdentity: Number,

  recreationalActivities: Number,
  tripsOrganization: Number,
  eventsOrganization: Number,
  leisureTime: Number,
  sportsTraining: Number,

  otherTrainingAreas: String,
  suggestions: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Survey', surveySchema);
module.exports = mongoose.models.Survey || mongoose.model('Survey', surveySchema);
