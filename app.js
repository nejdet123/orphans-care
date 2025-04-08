const express = require('express');
const path = require('path');
const app = express();

// تحديد مسارات الملفات الثابتة ومحرك العرض EJS
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// تعريف الصفحات الأساسية
app.get('/', (req, res) => res.render('index'));
app.get('/survey', (req, res) => res.render('survey'));
app.get('/methodology', (req, res) => res.render('methodology'));
app.get('/research', (req, res) => res.render('research'));
app.get('/model', (req, res) => res.render('model'));
app.get('/dashboard', (req, res) => res.render('dashboard'));

// صفحة الخطأ العامة
app.use((req, res) => {
  res.status(404).render('error');
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});