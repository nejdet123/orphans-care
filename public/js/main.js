// ملف JavaScript الرئيسي
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود نموذج الاستبيان
    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        surveyForm.addEventListener('submit', handleSurveySubmit);
    }
});

// معالجة إرسال نموذج الاستبيان
async function handleSurveySubmit(event) {
    event.preventDefault();
    
    // عرض رسالة التحميل
    showLoadingMessage();
    
    // جمع بيانات النموذج
    const formData = new FormData(event.target);
    const formDataObj = {};
    
    // تحويل FormData إلى كائن JavaScript
    formData.forEach((value, key) => {
        // التعامل مع الحقول متعددة الاختيار
        if (key.endsWith('[]')) {
            const actualKey = key.slice(0, -2);
            if (!formDataObj[actualKey]) {
                formDataObj[actualKey] = [];
            }
            formDataObj[actualKey].push(value);
        } else {
            formDataObj[key] = value;
        }
    });
    
    try {
        // إرسال البيانات إلى الخادم
        const response = await fetch('/api/survey/submit-survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObj)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // عرض رسالة النجاح
            showSuccessMessage();
            // إعادة تعيين النموذج
            event.target.reset();
        } else {
            // عرض رسالة الخطأ
            showErrorMessage(result.message);
        }
    } catch (error) {
        console.error('خطأ في إرسال البيانات:', error);
        showErrorMessage('حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.');
    }
}

// عرض رسالة التحميل
function showLoadingMessage() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-spinner fa-spin me-2"></i> جاري إرسال البيانات...
            </div>
        `;
        messageContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// عرض رسالة النجاح
function showSuccessMessage() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i> تم إرسال الاستبيان بنجاح. شكراً لمشاركتك!
            </div>
        `;
        messageContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// عرض رسالة الخطأ
function showErrorMessage(message) {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i> ${message}
            </div>
        `;
        messageContainer.scrollIntoView({ behavior: 'smooth' });
    }
}
