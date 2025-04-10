const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../models/User');

// مسارات لوحة التحكم (تتطلب المصادقة)
router.use(protect);

// الصفحة الرئيسية للوحة التحكم
router.get('/', (req, res) => {
    res.render('admin/dashboard', {
        title: 'لوحة التحكم',
        active: 'dashboard',
        user: req.user
    });
});

// إدارة الاستبيانات
router.get('/surveys', (req, res) => {
    res.render('admin/surveys', {
        title: 'إدارة الاستبيانات',
        active: 'surveys',
        user: req.user
    });
});

// إدارة الأسئلة
router.get('/questions', (req, res) => {
    res.render('admin/questions', {
        title: 'إدارة الأسئلة',
        active: 'questions',
        user: req.user
    });
});

// إدارة المستخدمين (للمدير فقط)
router.get('/users', authorize(USER_ROLES.ADMIN), (req, res) => {
    res.render('admin/users', {
        title: 'إدارة المستخدمين',
        active: 'users',
        user: req.user
    });
});

// إدارة المنظمات (للمدير فقط)
router.get('/organizations', authorize(USER_ROLES.ADMIN), (req, res) => {
    res.render('admin/organizations', {
        title: 'إدارة المنظمات',
        active: 'organizations',
        user: req.user
    });
});

// التقارير
router.get('/reports', (req, res) => {
    res.render('admin/reports', {
        title: 'التقارير',
        active: 'reports',
        user: req.user
    });
});

// عرض استبيان محدد
router.get('/surveys/:id', (req, res) => {
    res.render('admin/survey-details', {
        title: 'تفاصيل الاستبيان',
        active: 'surveys',
        surveyId: req.params.id,
        user: req.user
    });
});

module.exports = router;
