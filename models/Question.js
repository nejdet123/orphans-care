const mongoose = require('mongoose');

// نموذج سؤال الاستبيان
const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'نص السؤال مطلوب']
    },
    field: {
        type: String,
        required: [true, 'مجال السؤال مطلوب'],
        enum: [
            'psychologicalTrauma', 'selfConfidence', 'psychologicalCounseling', 'socialIntegration', 'effectiveCommunication',
            'modernTeaching', 'learningDifficulties', 'talentDevelopment', 'motivationTechniques', 'careerGuidance',
            'firstAid', 'healthCare', 'nutrition', 'commonDiseases', 'personalHygiene',
            'religiousValues', 'teachingWorship', 'spiritualAwareness', 'religiousRules', 'religiousIdentity',
            'recreationalActivities', 'tripsOrganization', 'eventsOrganization', 'leisureTime', 'sportsTraining'
        ]
    },
    domain: {
        type: String,
        required: [true, 'مجال السؤال الرئيسي مطلوب'],
        enum: [
            'psychological', // المجال النفسي والاجتماعي
            'educational',   // المجال التربوي والتعليمي
            'medical',       // المجال الصحي والطبي
            'religious',     // المجال الديني والروحي
            'recreational'   // المجال الترفيهي والرياضي
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// تحديث تاريخ التعديل قبل الحفظ
questionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// تصدير النموذج
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
