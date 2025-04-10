const jwt = require('jsonwebtoken');
const { User, USER_ROLES } = require('../models/User');

// سر التوقيع للـ JWT
const JWT_SECRET = process.env.JWT_SECRET || 'orphans-care-secret-key-change-in-production';

// التحقق من المصادقة
exports.protect = async (req, res, next) => {
    try {
        // ✅ التحقق من وجود جلسة فعالة
        if (req.session && req.session.user) {
            const user = await User.findById(req.session.user.id);

            if (!user || !user.isActive) {
                return res.status(401).render('auth/login', {
                    title: 'تسجيل الدخول',
                    layout: false,
                    error: 'تم تعطيل الحساب أو غير موجود'
                });
            }

            req.user = user;
            res.locals.user = {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                organization: user.organization
            };

            return next();
        }

        // ❌ لا يوجد جلسة
        return res.status(401).render('auth/login', {
            title: 'تسجيل الدخول',
            layout: false,
            error: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة'
        });

    } catch (error) {
        console.error('❌ خطأ في التحقق من الجلسة:', error);
        res.status(500).render('auth/login', {
            title: 'تسجيل الدخول',
            layout: false,
            error: 'حدث خطأ أثناء التحقق من تسجيل الدخول'
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
