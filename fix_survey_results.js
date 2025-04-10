const fs = require('fs');
const path = require('path');

// تحديد المسارات
const surveyRoutesPath = path.join(__dirname, 'routes', 'surveyRoutes.js');
const viewsSurveyPath = path.join(__dirname, 'views', 'survey.ejs');

// إصلاح ملف surveyRoutes.js
function fixSurveyRoutes() {
  console.log('🔧 جاري إصلاح ملف surveyRoutes.js...');
  
  // قراءة محتوى الملف الحالي
  let content = fs.readFileSync(surveyRoutesPath, 'utf8');
  
  // التحقق من وجود مسار لحفظ بيانات الاستبيان
  if (!content.includes('router.post')) {
    // إضافة مسار POST لحفظ بيانات الاستبيان
    const updatedContent = content.replace(
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
    
    // كتابة المحتوى المحدث إلى الملف
    fs.writeFileSync(surveyRoutesPath, updatedContent);
    console.log('✅ تم إضافة مسار POST لحفظ بيانات الاستبيان بنجاح');
  } else {
    console.log('ℹ️ مسار POST لحفظ بيانات الاستبيان موجود بالفعل');
  }
}

// إصلاح ملف survey.ejs
function fixSurveyForm() {
  console.log('🔧 جاري إصلاح ملف survey.ejs...');
  
  // قراءة محتوى الملف الحالي
  let content = fs.readFileSync(viewsSurveyPath, 'utf8');
  
  // التحقق من وجود معالج الأحداث لإرسال النموذج
  if (!content.includes('fetch(\'/api/survey-data\'')) {
    // إضافة معالج الأحداث لإرسال النموذج
    const formEndIndex = content.lastIndexOf('</form>');
    
    if (formEndIndex !== -1) {
      const updatedContent = content.slice(0, formEndIndex + 7) + `
<script>
document.addEventListener('DOMContentLoaded', function() {
  const surveyForm = document.getElementById('surveyForm');
  
  surveyForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(surveyForm);
    const formDataObj = {};
    
    formData.forEach((value, key) => {
      // التعامل مع الحقول متعددة الاختيار
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
        alert('حدث خطأ أثناء إرسال الاستبيان: ' + result.message);
      }
    } catch (error) {
      console.error('خطأ في إرسال الاستبيان:', error);
      alert('حدث خطأ أثناء إرسال الاستبيان. يرجى المحاولة مرة أخرى.');
    }
  });
});
</script>` + content.slice(formEndIndex + 7);
      
      // كتابة المحتوى المحدث إلى الملف
      fs.writeFileSync(viewsSurveyPath, updatedContent);
      console.log('✅ تم إضافة معالج الأحداث لإرسال النموذج بنجاح');
    } else {
      console.log('❌ لم يتم العثور على وسم </form> في ملف survey.ejs');
    }
  } else {
    console.log('ℹ️ معالج الأحداث لإرسال النموذج موجود بالفعل');
  }
}

// تنفيذ الإصلاحات
try {
  fixSurveyRoutes();
  fixSurveyForm();
  console.log('✅ تم إصلاح مشكلة عرض نتائج الاستبيان بنجاح');
  console.log('🔔 يرجى اتباع الخطوات التالية:');
  console.log('1. قم برفع التغييرات إلى GitHub');
  console.log('2. أعد نشر التطبيق على Railway');
  console.log('3. تأكد من إضافة متغيرات البيئة المطلوبة في إعدادات Railway');
} catch (error) {
  console.error('❌ حدث خطأ أثناء تنفيذ الإصلاحات:', error);
}
