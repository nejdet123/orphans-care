const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { isLoggedIn } = require('./middleware/auth');

const app = express();

// إعداد القالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ملفات ثابتة
app.use(express.static(path.join(__dirname, 'public')));

// معالجات الطلبات
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// إعداد الجلسات
app.use(session({
    secret: process.env.SESSION_SECRET || 'orphans-care-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 ساعة
    }
}));

// إضافة معلومات المستخدم إلى كل الصفحات
app.use(isLoggedIn);

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb+srv://admin_orphans:Mon243253efdf@orphans-care.0i5s7pm.mongodb.net/orphans_care?retryWrites=true&w=majority')
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات'))
    .catch(err => console.error('❌ فشل الاتصال بقاعدة البيانات:', err));

// نموذج الاستبيان
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
const Survey = mongoose.model('Survey', surveySchema);

// استيراد المسارات
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const questionRoutes = require('./routes/questionRoutes');

// استخدام المسارات
app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/questions', questionRoutes);

// مسارات صفحات المصادقة
app.get('/auth/login', (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('auth/login', { title: 'تسجيل الدخول', layout: false });
});

app.get('/auth/register', (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('auth/register', { title: 'إنشاء حساب جديد', layout: false });
});

app.get('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// الصفحات العامة
app.get('/', (req, res) => res.render('index', { title: 'الصفحة الرئيسية', active: 'home' }));
app.get('/survey', (req, res) => res.render('survey', { title: 'الاستبيان', active: 'survey' }));
app.get('/research', (req, res) => res.render('research', { title: 'البحث', active: 'research' }));
app.get('/methodology', (req, res) => res.render('methodology', { title: 'منهجية التحليل', active: 'methodology' }));
app.get('/model', (req, res) => res.render('model', { title: 'النموذج التدريبي', active: 'model' }));

// الصفحات المحمية (تتطلب تسجيل الدخول)
const { protect, authorize } = require('./middleware/auth');
const { USER_ROLES } = require('./models/User');

// لوحة التحكم (متاحة لجميع المستخدمين المسجلين)
app.get('/dashboard', protect, (req, res) => {
    res.render('dashboard', { 
        title: 'لوحة التحكم', 
        active: 'dashboard',
        user: req.user
    });
});

// صفحة الشكر بعد تعبئة الاستبيان
app.get('/thank-you', (req, res) => {
    res.send('<h2 style="text-align:center; margin-top:50px;">شكرًا لمشاركتك في الاستبيان!</h2><p style="text-align:center;"><a href="/" style="color:blue;">العودة إلى الصفحة الرئيسية</a></p>');
});

// إرسال البيانات من الاستبيان
app.post('/survey', async (req, res) => {
    try {
        const surveyData = new Survey(req.body);
        await surveyData.save();
        res.redirect('/thank-you');
    } catch (error) {
        console.error('❌ خطأ أثناء حفظ بيانات الاستبيان:', error);
        res.status(500).send('حدث خطأ أثناء إرسال البيانات، يرجى المحاولة لاحقًا.');
    }
});

// API لاسترجاع البيانات (متاحة فقط للمستخدمين المسجلين)
app.get('/api/survey-data', protect, async (req, res) => {
    try {
        let query = {};
        
        // إذا كان المستخدم ليس مديرًا، يمكنه فقط رؤية بيانات منظمته
        if (!req.user.hasPermission(USER_ROLES.ADMIN)) {
            query.organizationCode = req.user.organizationCode;
        }
        
        const data = await Survey.find(query).sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء استرجاع البيانات' });
    }
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
    console.error('🔥 خطأ داخلي في السيرفر:', err.stack);
    res.status(500).send("حدث خطأ داخلي في السيرفر: " + err.message);
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
});
