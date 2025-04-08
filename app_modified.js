const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// إنشاء تطبيق Express
const app = express();

// إعداد المحرك للقوالب
app.set('view engine', 'ejs');

// إعداد الوسائط الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد معالج الطلبات
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// بيانات تجريبية للاستبيان
const mockSurveyData = [
  {
    fullName: "محمد أحمد",
    organization: "جمعية رعاية الأيتام",
    organizationCode: "ORG001",
    country: "مصر",
    jobTitle: "أخصائي نفسي",
    experience: "4-7 سنوات",
    previousTraining: "نعم",
    psychologicalTrauma: 4,
    selfConfidence: 3,
    psychologicalCounseling: 5,
    socialIntegration: 4,
    effectiveCommunication: 3,
    modernTeaching: 2,
    learningDifficulties: 4,
    talentDevelopment: 5,
    motivationTechniques: 3,
    careerGuidance: 4,
    firstAid: 3,
    healthCare: 2,
    nutrition: 4,
    commonDiseases: 3,
    personalHygiene: 2,
    religiousValues: 5,
    teachingWorship: 4,
    spiritualAwareness: 3,
    religiousRules: 4,
    religiousIdentity: 5,
    recreationalActivities: 3,
    tripsOrganization: 2,
    eventsOrganization: 4,
    leisureTime: 3,
    sportsTraining: 2,
    createdAt: new Date()
  },
  {
    fullName: "فاطمة محمود",
    organization: "دار الأمل",
    organizationCode: "ORG002",
    country: "الأردن",
    jobTitle: "معلم",
    experience: "1-3 سنوات",
    previousTraining: "لا",
    psychologicalTrauma: 5,
    selfConfidence: 4,
    psychologicalCounseling: 3,
    socialIntegration: 5,
    effectiveCommunication: 4,
    modernTeaching: 5,
    learningDifficulties: 5,
    talentDevelopment: 4,
    motivationTechniques: 5,
    careerGuidance: 3,
    firstAid: 4,
    healthCare: 3,
    nutrition: 2,
    commonDiseases: 4,
    personalHygiene: 3,
    religiousValues: 4,
    teachingWorship: 3,
    spiritualAwareness: 5,
    religiousRules: 3,
    religiousIdentity: 4,
    recreationalActivities: 5,
    tripsOrganization: 4,
    eventsOrganization: 3,
    leisureTime: 5,
    sportsTraining: 4,
    createdAt: new Date()
  }
];

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.render('index');
});

// صفحة الاستبيان
app.get('/survey', (req, res) => {
    res.render('survey');
});

// صفحة البحث
app.get('/research', (req, res) => {
    res.render('research');
});

// صفحة منهجية التحليل
app.get('/methodology', (req, res) => {
    res.render('methodology');
});

// صفحة النموذج التدريبي
app.get('/model', (req, res) => {
    res.render('model');
});

// صفحة لوحة التحكم
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// إرسال بيانات الاستبيان
app.post('/api/submit-survey', (req, res) => {
    try {
        // في النسخة بدون قاعدة بيانات، نعيد رسالة نجاح فقط
        res.status(200).json({ success: true, message: 'تم إرسال الاستبيان بنجاح (وضع العرض التجريبي)' });
    } catch (error) {
        console.error('خطأ في معالجة بيانات الاستبيان:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء معالجة البيانات' });
    }
});

// الحصول على بيانات الاستبيان
app.get('/api/survey-data', (req, res) => {
    try {
        // إرجاع بيانات تجريبية
        res.status(200).json(mockSurveyData);
    } catch (error) {
        console.error('خطأ في استرجاع بيانات الاستبيان:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء استرجاع البيانات' });
    }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`تم تشغيل الخادم على المنفذ ${PORT} (وضع العرض التجريبي بدون قاعدة بيانات)`);
});
