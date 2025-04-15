const mongoose = require('mongoose');
const Survey = require('./models/Survey');

mongoose.connect('mongodb://127.0.0.1:27017/orphans_care', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ تم الاتصال بقاعدة البيانات");

  const survey = await Survey.findOne();
  if (survey) {
    console.log("📄 النموذج موجود، وهذه عينة منه:");
    console.log("العنوان:", survey.surveyIntro?.title);
    console.log("عدد الأقسام:", survey.sections?.length);
  } else {
    console.log("⚠️ لا يوجد استبيان محفوظ في القاعدة.");
  }

  process.exit();
})
.catch((err) => {
  console.error("❌ فشل الاتصال بقاعدة البيانات:", err);
  process.exit(1);
});
