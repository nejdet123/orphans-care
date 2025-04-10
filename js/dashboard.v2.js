// ملف JavaScript للوحة التحكم - نسخة v2
alert("📢 تم تحميل ملف dashboard.v2.js بنجاح!");
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


// ==================== الدوال المساعدة ====================

function updateGeneralStatistics(data) {
    const total = data.length;
    document.getElementById('totalSurveys').textContent = total;
}

function createCharts(data) {
    // مثال مبسط لرسم مخطط باستخدام Chart.js (تأكد من تحميل المكتبة)
    const ctx = document.getElementById('surveyChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['مثال 1', 'مثال 2'],
            datasets: [{
                label: 'عدد المشاركات',
                data: [data.length / 2, data.length / 2],
            }]
        }
    });
}

function updateTables(data) {
    const tableBody = document.getElementById('surveyTableBody');
    tableBody.innerHTML = '';
    data.forEach((item, index) => {
        const row = `<tr><td>${index + 1}</td><td>${item.organization || 'غير معروف'}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

function updateOrganizationsList(data) {
    const orgs = [...new Set(data.map(item => item.organization))];
    const select = document.getElementById('organizationFilter');
    if (!select) return;
    select.innerHTML = '<option value="">الكل</option>';
    orgs.forEach(org => {
        const opt = document.createElement('option');
        opt.value = org;
        opt.textContent = org;
        select.appendChild(opt);
    });
}

function showNoDataMessage() {
    document.getElementById('noDataMessage').style.display = 'block';
}

function showErrorMessage() {
    alert('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.');
}

function filterOrganizationData() {
    const selected = document.getElementById('organizationFilter').value;
    const rows = document.querySelectorAll('#surveyTableBody tr');
    rows.forEach(row => {
        row.style.display = selected && !row.textContent.includes(selected) ? 'none' : '';
    });
}

function filterOrganizationByCode() {
    const code = document.getElementById('organizationCodeFilter').value.toLowerCase();
    const rows = document.querySelectorAll('#surveyTableBody tr');
    rows.forEach(row => {
        row.style.display = code && !row.textContent.toLowerCase().includes(code) ? 'none' : '';
    });
}
