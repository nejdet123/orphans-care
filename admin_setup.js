// هذا ملف مؤقت لإنشاء حساب مدير
// يجب تشغيله مرة واحدة فقط ثم حذفه لأسباب أمنية

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// نموذج المستخدم - يجب أن يكون متطابقاً مع نموذج المستخدم في التطبيق
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'supervisor', 'admin'],
    default: 'user'
  },
  organization: {
    type: String,
    required: true
  },
  country: String,
  jobTitle: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// بيانات المستخدم المدير
const adminUser = {
  name: 'مدير النظام',
  email: 'admin@orphans-care.com',
  password: 'Admin123456',
  role: 'admin',
  organization: 'منظمة رعاية الأيتام',
  country: 'المملكة العربية السعودية',
  jobTitle: 'مدير النظام'
};

// الاتصال بقاعدة البيانات وإنشاء المستخدم المدير
async function createAdminUser() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('تم الاتصال بقاعدة البيانات بنجاح');

    // التحقق من وجود مستخدم بنفس البريد الإلكتروني
    const existingUser = await User.findOne({ email: adminUser.email });
    if (existingUser) {
      console.log('المستخدم موجود بالفعل، جاري تحديث دوره إلى مدير');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('تم تحديث دور المستخدم إلى مدير بنجاح');
    } else {
      // تشفير كلمة المرور
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);

      // إنشاء مستخدم جديد
      const newUser = new User({
        ...adminUser,
        password: hashedPassword
      });

      // حفظ المستخدم في قاعدة البيانات
      await newUser.save();
      console.log('تم إنشاء المستخدم المدير بنجاح');
    }

    // إغلاق الاتصال بقاعدة البيانات
    await mongoose.connection.close();
    console.log('تم إغلاق الاتصال بقاعدة البيانات');
    
    console.log('\nبيانات تسجيل الدخول للمدير:');
    console.log('البريد الإلكتروني:', adminUser.email);
    console.log('كلمة المرور:', adminUser.password);
    console.log('\nملاحظة مهمة: يرجى حذف هذا الملف بعد استخدامه لأسباب أمنية');
  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء المستخدم المدير:', error);
  }
}

// تنفيذ الدالة
createAdminUser();
