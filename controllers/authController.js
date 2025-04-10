const { User, USER_ROLES } = require('../models/User');
const jwt = require('jsonwebtoken');

// سر التوقيع للـ JWT
const JWT_SECRET = process.env.JWT_SECRET || 'orphans-care-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // صلاحية التوكن 7 أيام

// إنشاء توكن JWT
const createToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
    try {
        const { username, email, password, fullName, organization, organizationCode, role } = req.body;

        // التحقق من عدم وجود مستخدم بنفس اسم المستخدم أو البريد الإلكتروني
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل'
            });
        }

        // التحقق من صلاحية إنشاء مستخدم بدور معين
        // فقط المدير يمكنه إنشاء مستخدمين بأدوار أخرى
        if (role && role !== USER_ROLES.RESEARCHER) {
            // التحقق من أن المستخدم الحالي هو مدير
            if (!req.user || !req.user.hasPermission(USER_ROLES.ADMIN)) {
                return res.status(403).json({
                    success: false,
                    message: 'ليس لديك صلاحية لإنشاء مستخدم بهذا الدور'
                });
            }
        }

        // إنشاء المستخدم الجديد
        const newUser = new User({
            username,
            email,
            password,
            fullName,
            organization,
            organizationCode,
            role: role || USER_ROLES.RESEARCHER // الدور الافتراضي هو باحث
        });

        await newUser.save();

        // إنشاء توكن JWT
        const token = createToken(newUser._id);

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                role: newUser.role,
                organization: newUser.organization
            }
        });
    } catch (error) {
        console.error('❌ خطأ في تسجيل مستخدم جديد:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء الحساب',
            error: error.message
        });
    }
};

// تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // التحقق من وجود اسم المستخدم وكلمة المرور
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
            });
        }

        // البحث عن المستخدم
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من أن الحساب نشط
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'تم تعطيل هذا الحساب، يرجى التواصل مع المسؤول'
            });
        }

        // تحديث تاريخ آخر تسجيل دخول
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // إنشاء توكن JWT
        const token = createToken(user._id);

        res.status(200).json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                organization: user.organization
            }
        });
    } catch (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول',
            error: error.message
        });
    }
};

// الحصول على معلومات المستخدم الحالي
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                organization: user.organization,
                organizationCode: user.organizationCode,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('❌ خطأ في الحصول على معلومات المستخدم:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء الحصول على معلومات المستخدم',
            error: error.message
        });
    }
};

// تحديث معلومات المستخدم
exports.updateUser = async (req, res) => {
    try {
        const { fullName, email, organization, organizationCode } = req.body;
        
        // البحث عن المستخدم وتحديث بياناته
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, email, organization, organizationCode },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.status(200).json({
            success: true,
            message: 'تم تحديث المعلومات بنجاح',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                organization: user.organization,
                organizationCode: user.organizationCode
            }
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث معلومات المستخدم:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث معلومات المستخدم',
            error: error.message
        });
    }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // التحقق من وجود كلمة المرور الحالية والجديدة
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال كلمة المرور الحالية والجديدة'
            });
        }
        
        // البحث عن المستخدم
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        // التحقق من كلمة المرور الحالية
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }
        
        // تحديث كلمة المرور
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير كلمة المرور:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تغيير كلمة المرور',
            error: error.message
        });
    }
};

// الحصول على قائمة المستخدمين (للمدير فقط)
exports.getAllUsers = async (req, res) => {
    try {
        // التحقق من أن المستخدم الحالي هو مدير
        if (!req.user.hasPermission(USER_ROLES.ADMIN)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للوصول إلى هذه البيانات'
            });
        }
        
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('❌ خطأ في الحصول على قائمة المستخدمين:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء الحصول على قائمة المستخدمين',
            error: error.message
        });
    }
};

// تحديث دور المستخدم (للمدير فقط)
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role, isActive } = req.body;
        
        // التحقق من أن المستخدم الحالي هو مدير
        if (!req.user.hasPermission(USER_ROLES.ADMIN)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لتعديل أدوار المستخدمين'
            });
        }
        
        // التحقق من صحة الدور
        if (role && !Object.values(USER_ROLES).includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'دور المستخدم غير صالح'
            });
        }
        
        // البحث عن المستخدم وتحديث دوره
        const updateData = {};
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'تم تحديث دور المستخدم بنجاح',
            user
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث دور المستخدم:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث دور المستخدم',
            error: error.message
        });
    }
};

// حذف مستخدم (للمدير فقط)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // التحقق من أن المستخدم الحالي هو مدير
        if (!req.user.hasPermission(USER_ROLES.ADMIN)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لحذف المستخدمين'
            });
        }
        
        // البحث عن المستخدم وحذفه
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'تم حذف المستخدم بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في حذف المستخدم:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف المستخدم',
            error: error.message
        });
    }
};
