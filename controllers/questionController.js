const Question = require('../models/Question');
const { USER_ROLES } = require('../models/User');

// الحصول على جميع الأسئلة
exports.getAllQuestions = async (req, res) => {
    try {
        // التحقق من الصلاحيات
        if (!req.user.hasPermission(USER_ROLES.SURVEYOR)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للوصول إلى هذه البيانات'
            });
        }

        // البحث عن الأسئلة وترتيبها حسب المجال والترتيب
        const questions = await Question.find().sort({ domain: 1, order: 1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            questions
        });
    } catch (error) {
        console.error('❌ خطأ في الحصول على الأسئلة:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء الحصول على الأسئلة',
            error: error.message
        });
    }
};

// الحصول على سؤال محدد
exports.getQuestion = async (req, res) => {
    try {
        // التحقق من الصلاحيات
        if (!req.user.hasPermission(USER_ROLES.SURVEYOR)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للوصول إلى هذه البيانات'
            });
        }

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        res.status(200).json({
            success: true,
            question
        });
    } catch (error) {
        console.error('❌ خطأ في الحصول على السؤال:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء الحصول على السؤال',
            error: error.message
        });
    }
};

// إنشاء سؤال جديد
exports.createQuestion = async (req, res) => {
    try {
        // التحقق من الصلاحيات
        if (!req.user.hasPermission(USER_ROLES.MANAGER)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لإنشاء أسئلة جديدة'
            });
        }

        const { text, field, domain, order, isActive } = req.body;

        // التحقق من وجود البيانات المطلوبة
        if (!text || !field || !domain) {
            return res.status(400).json({
                success: false,
                message: 'يرجى توفير جميع البيانات المطلوبة'
            });
        }

        // إنشاء السؤال الجديد
        const question = new Question({
            text,
            field,
            domain,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        await question.save();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء السؤال بنجاح',
            question
        });
    } catch (error) {
        console.error('❌ خطأ في إنشاء السؤال:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء السؤال',
            error: error.message
        });
    }
};

// تحديث سؤال
exports.updateQuestion = async (req, res) => {
    try {
        // التحقق من الصلاحيات
        if (!req.user.hasPermission(USER_ROLES.MANAGER)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لتحديث الأسئلة'
            });
        }

        const { text, field, domain, order, isActive } = req.body;

        // البحث عن السؤال وتحديثه
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { text, field, domain, order, isActive },
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        res.status(200).json({
            success: true,
            message: 'تم تحديث السؤال بنجاح',
            question
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث السؤال:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث السؤال',
            error: error.message
        });
    }
};

// حذف سؤال
exports.deleteQuestion = async (req, res) => {
    try {
        // التحقق من الصلاحيات
        if (!req.user.hasPermission(USER_ROLES.ADMIN)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لحذف الأسئلة'
            });
        }

        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        res.status(200).json({
            success: true,
            message: 'تم حذف السؤال بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في حذف السؤال:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف السؤال',
            error: error.message
        });
    }
};

// تغيير ترتيب الأسئلة
exports.reorderQuestions = async (req, res) => {
    try {
        // التحقق من الصلاحيات
        if (!req.user.hasPermission(USER_ROLES.MANAGER)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية لتغيير ترتيب الأسئلة'
            });
        }

        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'يرجى توفير قائمة الأسئلة بالترتيب الجديد'
            });
        }

        // تحديث ترتيب كل سؤال
        const updatePromises = questions.map(item => {
            return Question.findByIdAndUpdate(
                item.id,
                { order: item.order },
                { new: true }
            );
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'تم تحديث ترتيب الأسئلة بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير ترتيب الأسئلة:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تغيير ترتيب الأسئلة',
            error: error.message
        });
    }
};
