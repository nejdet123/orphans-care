
// ملف JavaScript للوحة التحكم - نسخة v2

document.addEventListener('DOMContentLoaded', function() {
    console.log("📥 بدء تحميل بيانات الاستبيان...");
    fetchSurveyData();

    const orgFilter = document.getElementById('organizationFilter');
    const codeFilter = document.getElementById('organizationCodeFilter');

    if (orgFilter) {
        orgFilter.addEventListener('change', filterOrganizationData);
    }

    if (codeFilter) {
        codeFilter.addEventListener('input', filterOrganizationByCode);
    }
});

async function fetchSurveyData() {
    try {
        const response = await fetch('/api/survey-data');
        if (!response.ok) {
            throw new Error('فشل في استرجاع البيانات');
        }

        const data = await response.json();
        console.log("🧪 البيانات المستلمة:", data);

        if (data && data.length > 0) {
            updateGeneralStatistics(data);
            createCharts(data);
            updateTables(data);
            updateOrganizationsList(data);
        } else {
            showNoDataMessage();
        }
    } catch (error) {
        console.error('❌ خطأ في استرجاع بيانات الاستبيان:', error);
        showErrorMessage();
    }
}

// ملاحظة: باقي الدوال مثل updateGeneralStatistics, createCharts, ... يجب أن تكون موجودة في الملف أو ملف آخر
// إذا كنت بحاجة للنسخة الكاملة من الملف، يمكنني تضمين كل الدوال أيضاً.
