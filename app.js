// استيراد الحزم والمسارات
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { isLoggedIn, protect } = require('./middleware/auth');

// اتصال قاعدة البيانات
mongoose.connect(
  'mongodb+srv://admin_orphans:Mon243253efdf@orphans-care.0i5s7pm.mongodb.net/orphans_care?retryWrites=true&w=majority&appName=orphans-care',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => {
  console.log('✅ تم الاتصال بقاعدة البيانات MongoDB Atlas بنجاح');
}).catch((err) => {
  console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
});

// استيراد النماذج والمسارات
const SurveyTemplate = require('./models/SurveyTemplate');
const SurveyResponse = require('./models/SurveyResponse');
const surveyRoutes = require('./routes/surveyRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const questionRoutes = require('./routes/questionRoutes');

// إنشاء التطبيق
const app = express();
app.set('trust proxy', 1);
app.use(methodOverride('_method'));

// إعدادات EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ملفات ثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد CORS
app.use(cors({
  origin: 'https://orphans-care-production.up.railway.app',
  credentials: true
}));

// تحليل البيانات
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// إعداد الجلسات
app.use(session({
  secret: process.env.SESSION_SECRET || 'orphans-care-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// إضافة معلومات المستخدم لجميع الطلبات
app.use(isLoggedIn);

// ربط المسارات
app.use('/api/survey', surveyRoutes);
app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/questions', questionRoutes);

// الصفحات العامة
app.get('/', (req, res) => res.render('index', { title: 'الصفحة الرئيسية', active: 'home' }));

app.get('/survey', async (req, res) => {
  try {
    const survey = await SurveyTemplate.findOne({ key: 'orphans-training-survey' });
    if (!survey) return res.send('⚠️ لا يوجد استبيان متاح حالياً.');
    res.render('survey', {
      title: 'الاستبيان',
      active: 'survey',
      surveyIntro: survey.structure?.survey || {}
    });
  } catch (err) {
    console.error("❌ خطأ في تحميل الاستبيان:", err);
    res.status(500).send("فشل في تحميل الاستبيان");
  }
});

app.get('/research', (req, res) => res.render('research', { title: 'البحث', active: 'research' }));
app.get('/methodology', (req, res) => res.render('methodology', { title: 'منهجية التحليل', active: 'methodology' }));
app.get('/model', (req, res) => res.render('model', { title: 'النموذج التدريبي', active: 'model' }));

// لوحة التحكم
app.get('/dashboard', (req, res) => res.redirect('/dashboard-dark'));
app.get('/dashboard-dark', protect, (req, res) => {
  res.render('dashboard-dark', { title: 'لوحة التحكم الليلية', layout: false });
});

// صفحة الشكر بعد الإرسال
app.get('/thank-you', (req, res) => {
  res.send(`
    <h2 style="text-align:center; margin-top:50px;">شكرًا لمشاركتك في الاستبيان!</h2>
    <p style="text-align:center;"><a href="/" style="color:blue;">العودة إلى الصفحة الرئيسية</a></p>
  `);
});

// تسجيل الدخول والتسجيل
app.get('/auth/login', (req, res) => {
  if (req.user) return res.redirect('/dashboard-dark');
  res.render('auth/login', { title: 'تسجيل الدخول', layout: false });
});

app.get('/auth/register', (req, res) => {
  if (req.user) return res.redirect('/dashboard-dark');
  res.render('auth/register', { title: 'إنشاء حساب جديد', layout: false });
});

app.get('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
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
