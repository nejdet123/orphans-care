// كود استيراد الاستبيان من ملف JSON إلى MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const surveyTemplateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: String,
  structure: Object,
  updatedAt: { type: Date, default: Date.now }
});

const SurveyTemplate = mongoose.model('SurveyTemplate', surveyTemplateSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orphans_care', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ تم الاتصال بقاعدة البيانات');
  importTemplate();
}).catch(err => {
  console.error('❌ فشل الاتصال:', err);
});

async function importTemplate() {
  try {
    const filePath = path.join(__dirname, 'survey_questions_full.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const key = "orphans-training-survey";

    const existing = await SurveyTemplate.findOne({ key });

    if (existing) {
      existing.structure = data;
      existing.updatedAt = new Date();
      await existing.save();
      console.log('🔄 تم تحديث الاستبيان الموجود بنجاح');
    } else {
      await SurveyTemplate.create({
        key,
        title: "استبيان تقييم الاحتياجات التدريبية للعاملين مع الأيتام",
        structure: data
      });
      console.log('✅ تم إنشاء استبيان جديد بنجاح');
    }

    process.exit();
  } catch (err) {
    console.error('❌ خطأ أثناء إدخال الاستبيان:', err);
    process.exit(1);
  }
}
