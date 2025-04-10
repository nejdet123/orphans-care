const jwt = require('jsonwebtoken');
const { User, USER_ROLES } = require('../models/User');

// سر التوقيع للـ JWT
const JWT_SECRET = process.env.JWT_SECRET || 'orphans-care-secret-key-change-in-production';

// التحقق من المصادقة
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // التحقق من وجود التوكن في الهيدر
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            // أو في الكوكيز
            token = req.cookies.token;
        }
        
        // إذا لم يوجد توكن
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة'
            });
        }
        
        // التحقق من صحة التوكن
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // البحث عن المستخدم
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        // التحقق من أن الحساب نشط
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'تم تعطيل هذا الحساب، يرجى التواصل مع المسؤول'
            });
        }
        
        // إضافة المستخدم إلى الطلب
        req.user = user;
        next();
    } catch (error) {
        console.error('❌ خطأ في التحقق من المصادقة:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'توكن غير صالح، يرجى تسجيل الدخول مرة أخرى'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التحقق من المصادقة',
            error: error.message
        });
    }
};

// التحقق من الصلاحيات
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // التحقق من وجود المستخدم ودوره
        if (!req.user || !roles.some(role => req.user.hasPermission(role))) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة'
            });
        }
        
        next();
    };
};

// وسيط لإضافة معلومات المستخدم إلى الصفحات
exports.isLoggedIn = async (req, res, next) => {
    try {
        let token;
        
        // التحقق من وجود التوكن في الكوكيز
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            
            // التحقق من صحة التوكن
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // البحث عن المستخدم
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive) {
                // إضافة المستخدم إلى الطلب والمتغيرات المحلية
                req.user = user;
                res.locals.user = {
                    id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                    organization: user.organization
                };
            }
        }
        
        next();
    } catch (error) {
        // في حالة وجود خطأ، نستمر بدون تسجيل دخول
        console.error('❌ خطأ في التحقق من تسجيل الدخول:', error);
        next();
    }
};
