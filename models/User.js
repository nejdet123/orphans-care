const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// تعريف مستويات المستخدمين
const USER_ROLES = {
    ADMIN: 'admin',           // مدير النظام (صلاحيات كاملة)
    MANAGER: 'manager',       // مدير (صلاحيات إدارية محدودة)
    RESEARCHER: 'researcher', // باحث (عرض النتائج والتقارير فقط)
    SURVEYOR: 'surveyor'      // مسؤول استبيانات (إدارة الاستبيانات فقط)
};

// نموذج المستخدم
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'اسم المستخدم مطلوب'],
        unique: true,
        trim: true,
        minlength: [3, 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل']
    },
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'الرجاء إدخال بريد إلكتروني صحيح']
    },
    password: {
        type: String,
        required: [true, 'كلمة المرور مطلوبة'],
        minlength: [6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'],
        select: false // لا يتم استرجاع كلمة المرور في الاستعلامات
    },
    fullName: {
        type: String,
        required: [true, 'الاسم الكامل مطلوب']
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.RESEARCHER
    },
    organization: {
        type: String,
        required: [true, 'اسم المنظمة مطلوب']
    },
    organizationCode: {
        type: String,
        required: [true, 'كود المنظمة مطلوب']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
    // فقط إذا تم تعديل كلمة المرور
    if (!this.isModified('password')) return next();
    
    try {
        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// دالة للتحقق من صحة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// دالة للتحقق من صلاحيات المستخدم
userSchema.methods.hasPermission = function(requiredRole) {
    const roleHierarchy = {
        [USER_ROLES.ADMIN]: 4,
        [USER_ROLES.MANAGER]: 3,
        [USER_ROLES.RESEARCHER]: 2,
        [USER_ROLES.SURVEYOR]: 1
    };
    
    return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// تصدير النموذج والأدوار
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    USER_ROLES
};
