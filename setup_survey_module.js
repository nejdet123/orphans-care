const fs = require('fs');
const path = require('path');

// تحديد المسارات
const surveyRoutesPath = path.join(__dirname, 'routes', 'surveyRoutes.js');
const viewsSurveyPath = path.join(__dirname, 'views', 'survey.ejs');
const thankYouPath = path.join(__dirname, 'views', 'thank-you.ejs');
const surveyModelPath = path.join(__dirname, 'models', 'Survey.js');

// إنشاء مجلد إن لم يكن موجودًا
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// إصلاح routes/surveyRoutes.js
function fixSurveyRoutes() {
  console.log('🔧 إصلاح أو إنشاء surveyRoutes.js...');
  ensureDir(path.dirname(surveyRoutesPath));

  let content = fs.existsSync(surveyRoutesPath)
    ? fs.readFileSync(surveyRoutesPath, 'utf8')
    : "const express = require('express');\nconst router = express.Router();\n\nmodule.exports = router;";

  if (!content.includes("const Survey = require('../models/Survey')")) {
    content = "const Survey = require('../models/Survey');\n" + content;
  }

  if (!content.includes("router.post('/survey-data'")) {
    content = content.replace(
      'module.exports = router;',
      `// حفظ بيانات الاستبيان الجديدة
router.post('/survey-data', async (req, res) => {
  try {
    const surveyData = new Survey(req.body);
    await surveyData.save();
    res.status(201).json({ success: true, message: 'تم حفظ بيانات الاستبيان بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في حفظ بيانات الاستبيان:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ البيانات' });
  }
});

module.exports = router;`
    );
  }

  fs.writeFileSync(surveyRoutesPath, content);
  console.log('✅ تم إصلاح ملف المسارات بنجاح');
}

// إصلاح views/survey.ejs
function fixSurveyForm() {
  console.log('🔧 إصلاح survey.ejs...');
  if (!fs.existsSync(viewsSurveyPath)) {
    console.log('⚠️ الملف survey.ejs غير موجود، يرجى إنشاؤه يدويًا');
    return;
  }

  let content = fs.readFileSync(viewsSurveyPath, 'utf8');

  if (!content.includes('fetch(\'/api/survey-data\'')) {
    const formEndIndex = content.lastIndexOf('</form>');
    if (formEndIndex !== -1) {
      const updatedContent = content.slice(0, formEndIndex + 7) + `
<script>
document.addEventListener('DOMContentLoaded', function() {
  const surveyForm = document.getElementById('surveyForm');
  if (!surveyForm) return;

  surveyForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(surveyForm);
    const formDataObj = {};

    formData.forEach((value, key) => {
      if (key.endsWith('[]')) {
        const actualKey = key.slice(0, -2);
        if (!formDataObj[actualKey]) {
          formDataObj[actualKey] = [];
        }
        formDataObj[actualKey].push(value);
      } else {
        formDataObj[key] = value;
      }
    });

    try {
      const response = await fetch('/api/survey-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataObj)
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = '/thank-you';
      } else {
        alert('حدث خطأ أثناء إرسال الاستبيان: ' + (result.message || 'يرجى المحاولة لاحقًا.'));
      }
    } catch (error) {
      console.error('خطأ في إرسال الاستبيان:', error);
      alert('حدث خطأ أثناء إرسال الاستبيان. يرجى المحاولة مرة أخرى.');
    }
  });
});
</script>` + content.slice(formEndIndex + 7);

      fs.writeFileSync(viewsSurveyPath, updatedContent);
      console.log('✅ تم إضافة معالج النموذج في survey.ejs');
    } else {
      console.log('❌ لم يتم العثور على وسم </form> داخل survey.ejs');
    }
  } else {
    console.log('ℹ️ معالج النموذج موجود مسبقًا');
  }
}

// إنشاء صفحة thank-you.ejs
function createThankYouPage() {
  if (!fs.existsSync(thankYouPath)) {
    const html = `<div style="text-align:center; margin-top:50px;">
  <h2>شكرًا لمشاركتك ❤️</h2>
  <p>تم إرسال استبيانك بنجاح.</p>
</div>`;
    fs.writeFileSync(thankYouPath, html);
    console.log('✅ تم إنشاء صفحة thank-you بنجاح');
  } else {
    console.log('ℹ️ صفحة thank-you موجودة مسبقًا');
  }
}

// إنشاء موديل Survey.js
function createSurveyModel() {
  if (!fs.existsSync(surveyModelPath)) {
    const modelContent = `const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Survey', surveySchema);`;

    ensureDir(path.dirname(surveyModelPath));
    fs.writeFileSync(surveyModelPath, modelContent);
    console.log('✅ تم إنشاء موديل Survey.js بنجاح');
  } else {
    console.log('ℹ️ موديل Survey موجود مسبقًا');
  }
}

// تنفيذ كل شيء
try {
  fixSurveyRoutes();
  fixSurveyForm();
  createThankYouPage();
  createSurveyModel();

   console.log('\n🎉 تم إعداد وحدة الاستبيان بنجاح!');
  console.log('📦 الآن يمكنك رفع التغييرات على GitHub ثم النشر على Railway.');
} catch (err) {
  console.error('❌ حدث خطأ أثناء تنفيذ السكريبت:', err);
}
