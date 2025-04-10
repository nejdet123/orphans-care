// هذا ملف لإصلاح مشكلة المصادقة في التطبيق
// يقوم بتعديل ملف authController.js وملف middleware/auth.js

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// تعديل ملف authController.js
function fixAuthController() {
  try {
    const authControllerPath = path.join(__dirname, 'controllers', 'authController.js');
    
    // التحقق من وجود الملف
    if (!fs.existsSync(authControllerPath)) {
      console.error('ملف authController.js غير موجود في المسار المتوقع');
      return false;
    }
    
    // قراءة محتوى الملف
    let content = fs.readFileSync(authControllerPath, 'utf8');
    
    // تعديل دالة تسجيل الدخول
    const loginFunctionOld = `exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { 
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        email
      });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', { 
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        email
      });
    }

    // إنشاء رمز JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // تخزين الرمز في الكوكيز
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // يوم واحد
    });

    // تخزين معلومات المستخدم في الجلسة
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // توجيه المستخدم إلى لوحة التحكم
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('auth/login', { error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};`;

    const loginFunctionNew = `exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { 
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        email
      });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('auth/login', { 
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        email
      });
    }

    // إنشاء رمز JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'orphans-care-secret-key',
      { expiresIn: '1d' }
    );

    // تخزين الرمز في الكوكيز
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // يوم واحد
    });

    // تخزين معلومات المستخدم في الجلسة
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // حفظ الجلسة
    req.session.save(err => {
      if (err) {
        console.error('خطأ في حفظ الجلسة:', err);
      }
      
      // توجيه المستخدم إلى لوحة التحكم
      res.redirect('/dashboard');
    });
  } catch (error) {
    console.error(error);
    res.render('auth/login', { error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};`;

    // استبدال دالة تسجيل الدخول
    content = content.replace(loginFunctionOld, loginFunctionNew);
    
    // حفظ التغييرات
    fs.writeFileSync(authControllerPath, content, 'utf8');
    console.log('تم تعديل ملف authController.js بنجاح');
    
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء تعديل ملف authController.js:', error);
    return false;
  }
}

// تعديل ملف middleware/auth.js
function fixAuthMiddleware() {
  try {
    const authMiddlewarePath = path.join(__dirname, 'middleware', 'auth.js');
    
    // التحقق من وجود الملف
    if (!fs.existsSync(authMiddlewarePath)) {
      console.error('ملف auth.js غير موجود في المسار المتوقع');
      return false;
    }
    
    // قراءة محتوى الملف
    let content = fs.readFileSync(authMiddlewarePath, 'utf8');
    
    // تعديل دالة التحقق من المصادقة
    const authMiddlewareOld = `exports.isAuthenticated = (req, res, next) => {
  // التحقق من وجود الرمز في الكوكيز
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة' });
  }

  try {
    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // إضافة معلومات المستخدم إلى الطلب
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة' });
  }
};`;

    const authMiddlewareNew = `exports.isAuthenticated = (req, res, next) => {
  // التحقق من وجود الرمز في الكوكيز
  const token = req.cookies.token;
  
  if (!token) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة' });
    } else {
      return res.redirect('/auth/login');
    }
  }

  try {
    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'orphans-care-secret-key');
    
    // إضافة معلومات المستخدم إلى الطلب
    req.user = decoded;
    
    // التحقق من وجود معلومات المستخدم في الجلسة
    if (!req.session.user) {
      req.session.user = {
        id: decoded.id,
        role: decoded.role
      };
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.clearCookie('token');
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ success: false, message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' });
    } else {
      return res.redirect('/auth/login');
    }
  }
};`;

    // استبدال دالة التحقق من المصادقة
    content = content.replace(authMiddlewareOld, authMiddlewareNew);
    
    // حفظ التغييرات
    fs.writeFileSync(authMiddlewarePath, content, 'utf8');
    console.log('تم تعديل ملف auth.js بنجاح');
    
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء تعديل ملف auth.js:', error);
    return false;
  }
}

// تعديل ملف app.js لإضافة إعدادات الجلسات
function fixAppJs() {
  try {
    const appJsPath = path.join(__dirname, 'app.js');
    
    // التحقق من وجود الملف
    if (!fs.existsSync(appJsPath)) {
      console.error('ملف app.js غير موجود في المسار المتوقع');
      return false;
    }
    
    // قراءة محتوى الملف
    let content = fs.readFileSync(appJsPath, 'utf8');
    
    // البحث عن إعدادات الجلسات
    if (content.includes('app.use(session({')) {
      // تعديل إعدادات الجلسات
      const sessionConfigOld = /app\.use\(session\(\{[\s\S]*?\}\)\);/;
      const sessionConfigNew = `app.use(session({
  secret: process.env.SESSION_SECRET || 'orphans-care-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // يوم واحد
  }
}));`;
      
      content = content.replace(sessionConfigOld, sessionConfigNew);
    } else {
      // إضافة إعدادات الجلسات إذا لم تكن موجودة
      const expressImport = "const express = require('express');";
      const sessionImport = "const express = require('express');\nconst session = require('express-session');";
      
      content = content.replace(expressImport, sessionImport);
      
      // إضافة إعدادات الجلسات بعد إعدادات الكوكيز
      const cookieParserConfig = "app.use(cookieParser());";
      const sessionConfig = `app.use(cookieParser());

// إعدادات الجلسات
app.use(session({
  secret: process.env.SESSION_SECRET || 'orphans-care-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // يوم واحد
  }
}));`;
      
      content = content.replace(cookieParserConfig, sessionConfig);
    }
    
    // حفظ التغييرات
    fs.writeFileSync(appJsPath, content, 'utf8');
    console.log('تم تعديل ملف app.js بنجاح');
    
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء تعديل ملف app.js:', error);
    return false;
  }
}

// تنفيذ التعديلات
console.log('=== بدء إصلاح مشكلة المصادقة ===');
const authControllerFixed = fixAuthController();
const authMiddlewareFixed = fixAuthMiddleware();
const appJsFixed = fixAppJs();

if (authControllerFixed && authMiddlewareFixed && appJsFixed) {
  console.log('\n✅ تم إصلاح مشكلة المصادقة بنجاح!');
  console.log('\nالخطوات التالية:');
  console.log('1. قم برفع الملفات المعدلة إلى GitHub');
  console.log('2. أعد نشر التطبيق على Railway');
  console.log('3. تأكد من إضافة متغيرات البيئة التالية في إعدادات Railway:');
  console.log('   - JWT_SECRET=orphans-care-secret-key');
  console.log('   - SESSION_SECRET=orphans-care-session-secret-key');
  console.log('\nملاحظة مهمة: يرجى حذف هذا الملف بعد استخدامه لأسباب أمنية');
} else {
  console.log('\n❌ حدث خطأ أثناء إصلاح مشكلة المصادقة');
  console.log('يرجى التحقق من المسارات والملفات المذكورة أعلاه');
}
