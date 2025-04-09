const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // إضافة مهمة

// إنشاء تطبيق Express
const app = express();

// إعداد محرك العرض والقالب العام
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// إعداد الوسائط الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد معالجات الطلبات
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// إعداد قاعدة البيانات
mongoose.connect('mongodb+srv://admin_orphans:Mon243253efdf@orphans-care.0i5s7pm.mongodb.net/orphans_care?retryWrites=true&w=majority')
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح'))
    .catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// تعريف نموذج الاستبيان
const surveySchema = new mongoose.Schema({
    // معلومات المشارك
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

    // المجال النفسي والاجتماعي
    psychologicalTrauma: Number,
    selfConfidence: Number,
    psychologicalCounseling: Number,
    socialIntegration: Number,
    effectiveCommunication: Number,

    // المجال التربوي والتعليمي
    modernTeaching: Number,
    learningDifficulties: Number,
    talentDevelopment: Number,
    motivationTechniques: Number,
    careerGuidance: Number,

    // المجال الصحي والطبي
    firstAid: Number,
    healthCare: Number,
    nutrition: Number,
    commonDiseases: Number,
    personalHygiene: Number,

    // المجال الديني والروحي
    religiousValues: Number,
    teachingWorship: Number,
    spiritualAwareness: Number,
    religiousRules: Number,
    religiousIdentity: Number,

    // المجال الترفيهي والرياضي
    recreationalActivities: Number,
    tripsOrganization: Number,
    eventsOrganization: Number,
    leisureTime: Number,
    sportsTraining: Number,

    // اقتراحات وملاحظات
    otherTrainingAreas: String,
    suggestions: String,

    // تاريخ الإنشاء
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Survey = mongoose.model('Survey', surveySchema);

// الصفحات
app.get('/', (req, res) => {
    res.render('index', { title: 'الرئيسية', active: 'home' });
});

app.get('/survey', (req, res) => {
    res.render('survey', { title: 'الاستبيان', active: 'survey' });
});

app.get('/research', (req, res) => {
    res.render('research', { title: 'البحث', active: 'research' });
});

app.get('/methodology', (req, res) => {
    res.render('methodology', { title: 'منهجية التحليل', active: 'methodology' });
});

app.get('/model', (req, res) => {
    res.render('model', { title: 'النموذج التدريبي', active: 'model' });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'لوحة التحكم', active: 'dashboard' });
});

// إرسال بيانات الاستبيان
app.post('/api/submit-survey', async (req, res) => {
    try {
        const surveyData = new Survey(req.body);
        await surveyData.save();
        res.status(200).json({ success: true, message: '✅ تم إرسال الاستبيان بنجاح' });
    } catch (error) {
        console.error('❌ خطأ في حفظ بيانات الاستبيان:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ البيانات' });
    }
});

// الحصول على بيانات الاستبيان
app.get('/api/survey-data', async (req, res) => {
    try {
        const data = await Survey.find().sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ خطأ في استرجاع بيانات الاستبيان:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء استرجاع البيانات' });
    }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
});
