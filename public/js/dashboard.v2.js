// ملف JavaScript للوحة التحكم - نسخة v2 كاملة
alert("📢 تم تحميل ملف dashboard.v2.js بنجاح!");
document.addEventListener('DOMContentLoaded', function() {
    console.log("📥 بدء تحميل بيانات الاستبيان...");
    fetchSurveyData();

    // إضافة مستمعي الأحداث للفلاتر
    const orgFilter = document.getElementById('organizationFilter');
    if (orgFilter) {
        orgFilter.addEventListener('change', filterOrganizationData);
    }

    const codeFilter = document.getElementById('organizationCodeFilter');
    if (codeFilter) {
        codeFilter.addEventListener('input', filterOrganizationByCode);
    }
});

// استدعاء بيانات الاستبيان
async function fetchSurveyData() {
    try {
        const response = await fetch('/api/survey-data');
        if (!response.ok) {
            throw new Error('فشل في استرجاع البيانات');
        }
        
        const data = await response.json();
        console.log("✅ البيانات المستلمة:", data);
        
        if (data && data.length > 0) {
            // تحديث الإحصائيات العامة
            updateGeneralStatistics(data);
            
            // تحديث الرسوم البيانية
            createCharts(data);
            
            // تحديث الجداول
            updateTables(data);
            
            // تحديث قائمة المنظمات
            updateOrganizationsList(data);
        } else {
            showNoDataMessage();
        }
        return data;
    } catch (error) {
        console.error('❌ خطأ في استرجاع بيانات الاستبيان:', error);
        showErrorMessage();
    }
}

// تحديث الإحصائيات العامة
function updateGeneralStatistics(data) {
    console.log("✅ البيانات المستلمة:", data);
    console.log("📊 عدد العناصر:", data.length);

    const totalParticipants = document.getElementById('totalParticipants');
    if (totalParticipants) {
        totalParticipants.textContent = data.length;
    } else {
        console.warn("⚠️ لم يتم العثور على العنصر totalParticipants");
    }
}

    
    // عدد المنظمات
    const organizations = [...new Set(data.map(item => item.organization).filter(Boolean))];
    const totalOrganizations = document.getElementById('totalOrganizations');
    if (totalOrganizations) {
        totalOrganizations.textContent = organizations.length;
    }
    
    // نسبة المشاركين الذين سبق لهم الحصول على تدريب
    const previousTrainingCount = data.filter(item => item.previousTraining === 'نعم').length;
    const previousTrainingPercentage = ((previousTrainingCount / data.length) * 100).toFixed(1);
    const previousTrainingPercentageElement = document.getElementById('previousTrainingPercentage');
    if (previousTrainingPercentageElement) {
        previousTrainingPercentageElement.textContent = `${previousTrainingPercentage}%`;
    }
    
    // حساب متوسط الاحتياج لكل مجال
    const domains = {
        'النفسي والاجتماعي': calculateDomainAverage(data, ['psychologicalTrauma', 'selfConfidence', 'psychologicalCounseling', 'socialIntegration', 'effectiveCommunication']),
        'التربوي والتعليمي': calculateDomainAverage(data, ['modernTeaching', 'learningDifficulties', 'talentDevelopment', 'motivationTechniques', 'careerGuidance']),
        'الصحي والطبي': calculateDomainAverage(data, ['firstAid', 'healthCare', 'nutrition', 'commonDiseases', 'personalHygiene']),
        'الديني والروحي': calculateDomainAverage(data, ['religiousValues', 'teachingWorship', 'spiritualAwareness', 'religiousRules', 'religiousIdentity']),
        'الترفيهي والرياضي': calculateDomainAverage(data, ['recreationalActivities', 'tripsOrganization', 'eventsOrganization', 'leisureTime', 'sportsTraining'])
    };
    
    // تحديد المجال ذو الاحتياج الأعلى والأدنى
    const sortedDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]);
    
    const highestNeedDomain = document.getElementById('highestNeedDomain');
    if (highestNeedDomain) {
        highestNeedDomain.textContent = `المجال ${sortedDomains[0][0]} (${sortedDomains[0][1].toFixed(2)})`;
    }
    
    const lowestNeedDomain = document.getElementById('lowestNeedDomain');
    if (lowestNeedDomain) {
        lowestNeedDomain.textContent = `المجال ${sortedDomains[sortedDomains.length - 1][0]} (${sortedDomains[sortedDomains.length - 1][1].toFixed(2)})`;
    }
}

// حساب متوسط الاحتياج لمجال معين
function calculateDomainAverage(data, fields) {
    let sum = 0;
    let count = 0;
    
    data.forEach(item => {
        fields.forEach(field => {
            if (item[field]) {
                sum += parseInt(item[field]);
                count++;
            }
        });
    });
    
    return count > 0 ? sum / count : 0;
}

// حساب متوسط الاحتياج لمهارة معينة
function calculateFieldAverage(data, field) {
    let sum = 0;
    let count = 0;
    
    data.forEach(item => {
        if (item[field]) {
            sum += parseInt(item[field]);
            count++;
        }
    });
    
    return count > 0 ? sum / count : 0;
}

// إنشاء الرسوم البيانية
function createCharts(data) {
    // رسم بياني لتوزيع المشاركين حسب المسمى الوظيفي
    if (document.getElementById('participantsChart')) {
        createJobTitleChart(data);
    }
    
    // رسم بياني لمتوسط الاحتياج التدريبي حسب المجالات
    if (document.getElementById('domainsChart')) {
        createDomainsChart(data);
    }
    
    // رسم بياني لتوزيع المشاركين حسب سنوات الخبرة
    if (document.getElementById('experienceChart')) {
        createExperienceChart(data);
    }
    
    // رسم بياني لتوزيع المشاركين حسب الدول
    if (document.getElementById('countriesChart')) {
        createCountriesChart(data);
    }
    
    // رسوم بيانية للمجالات المختلفة
    if (document.getElementById('psychologicalChart')) {
        createPsychologicalChart(data);
    }
    
    if (document.getElementById('educationalChart')) {
        createEducationalChart(data);
    }
    
    if (document.getElementById('medicalChart')) {
        createMedicalChart(data);
    }
    
    if (document.getElementById('religiousChart')) {
        createReligiousChart(data);
    }
    
    if (document.getElementById('recreationalChart')) {
        createRecreationalChart(data);
    }
}

// رسم بياني لتوزيع المشاركين حسب المسمى الوظيفي
function createJobTitleChart(data) {
    const jobTitles = {};
    data.forEach(item => {
        if (item.jobTitle) {
            jobTitles[item.jobTitle] = (jobTitles[item.jobTitle] || 0) + 1;
        }
    });
    
    const labels = Object.keys(jobTitles);
    const values = Object.values(jobTitles);
    
    const ctx = document.getElementById('participantsChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    '#f6c23e',
                    '#e74a3b',
                    '#858796'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// رسم بياني لمتوسط الاحتياج التدريبي حسب المجالات
function createDomainsChart(data) {
    const domains = {
        'النفسي والاجتماعي': calculateDomainAverage(data, ['psychologicalTrauma', 'selfConfidence', 'psychologicalCounseling', 'socialIntegration', 'effectiveCommunication']),
        'التربوي والتعليمي': calculateDomainAverage(data, ['modernTeaching', 'learningDifficulties', 'talentDevelopment', 'motivationTechniques', 'careerGuidance']),
        'الصحي والطبي': calculateDomainAverage(data, ['firstAid', 'healthCare', 'nutrition', 'commonDiseases', 'personalHygiene']),
        'الديني والروحي': calculateDomainAverage(data, ['religiousValues', 'teachingWorship', 'spiritualAwareness', 'religiousRules', 'religiousIdentity']),
        'الترفيهي والرياضي': calculateDomainAverage(data, ['recreationalActivities', 'tripsOrganization', 'eventsOrganization', 'leisureTime', 'sportsTraining'])
    };
    
    const labels = Object.keys(domains);
    const values = Object.values(domains);
    
    const ctx = document.getElementById('domainsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الاحتياج التدريبي',
                data: values,
                backgroundColor: [
                    '#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    '#f6c23e',
                    '#e74a3b'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
}

// رسم بياني لتوزيع المشاركين حسب سنوات الخبرة
function createExperienceChart(data) {
    const experience = {};
    data.forEach(item => {
        if (item.experience) {
            experience[item.experience] = (experience[item.experience] || 0) + 1;
        }
    });
    
    const labels = Object.keys(experience);
    const values = Object.values(experience);
    
    const ctx = document.getElementById('experienceChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    '#f6c23e',
                    '#e74a3b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// رسم بياني لتوزيع المشاركين حسب الدول
function createCountriesChart(data) {
    const countries = {};
    data.forEach(item => {
        if (item.country) {
            countries[item.country] = (countries[item.country] || 0) + 1;
        }
    });
    
    const labels = Object.keys(countries);
    const values = Object.values(countries);
    
    const ctx = document.getElementById('countriesChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#4e73df',
                    '#1cc88a',
                    '#36b9cc',
                    '#f6c23e',
                    '#e74a3b',
                    '#858796'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// رسم بياني للمجال النفسي والاجتماعي
function createPsychologicalChart(data) {
    const skills = {
        'مهارات التعامل مع الصدمات النفسية': calculateFieldAverage(data, 'psychologicalTrauma'),
        'أساليب بناء الثقة بالنفس وتقدير الذات': calculateFieldAverage(data, 'selfConfidence'),
        'مهارات الإرشاد النفسي': calculateFieldAverage(data, 'psychologicalCounseling'),
        'استراتيجيات دمج الأيتام في المجتمع': calculateFieldAverage(data, 'socialIntegration'),
        'مهارات التواصل الفعال': calculateFieldAverage(data, 'effectiveCommunication')
    };
    
    const labels = Object.keys(skills);
    const values = Object.values(skills);
    
    const ctx = document.getElementById('psychologicalChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الاحتياج التدريبي',
                data: values,
                backgroundColor: '#4e73df',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
    
    // تحديث قائمة أعلى المهارات احتياجاً
    updateTopSkillsList('topPsychologicalSkills', skills);
}

// رسم بياني للمجال التربوي والتعليمي
function createEducationalChart(data) {
    const skills = {
        'أساليب التعليم الحديثة': calculateFieldAverage(data, 'modernTeaching'),
        'استراتيجيات التعامل مع صعوبات التعلم': calculateFieldAverage(data, 'learningDifficulties'),
        'مهارات اكتشاف وتنمية المواهب': calculateFieldAverage(data, 'talentDevelopment'),
        'أساليب التحفيز وتعزيز الدافعية': calculateFieldAverage(data, 'motivationTechniques'),
        'مهارات التوجيه المهني': calculateFieldAverage(data, 'careerGuidance')
    };
    
    const labels = Object.keys(skills);
    const values = Object.values(skills);
    
    const ctx = document.getElementById('educationalChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الاحتياج التدريبي',
                data: values,
                backgroundColor: '#1cc88a',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
    
    // تحديث قائمة أعلى المهارات احتياجاً
    updateTopSkillsList('topEducationalSkills', skills);
}

// رسم بياني للمجال الصحي والطبي
function createMedicalChart(data) {
    const skills = {
        'أساسيات الإسعافات الأولية': calculateFieldAverage(data, 'firstAid'),
        'مهارات الرعاية الصحية الأساسية': calculateFieldAverage(data, 'healthCare'),
        'أساليب التغذية السليمة': calculateFieldAverage(data, 'nutrition'),
        'مهارات التعامل مع الأمراض الشائعة': calculateFieldAverage(data, 'commonDiseases'),
        'أساليب تعزيز النظافة الشخصية': calculateFieldAverage(data, 'personalHygiene')
    };
    
    const labels = Object.keys(skills);
    const values = Object.values(skills);
    
    const ctx = document.getElementById('medicalChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الاحتياج التدريبي',
                data: values,
                backgroundColor: '#36b9cc',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
    
    // تحديث قائمة أعلى المهارات احتياجاً
    updateTopSkillsList('topMedicalSkills', skills);
}

// رسم بياني للمجال الديني والروحي
function createReligiousChart(data) {
    const skills = {
        'أساليب غرس القيم الدينية': calculateFieldAverage(data, 'religiousValues'),
        'مهارات تعليم العبادات بطريقة محببة': calculateFieldAverage(data, 'teachingWorship'),
        'أساليب تنمية الوازع الديني': calculateFieldAverage(data, 'spiritualAwareness'),
        'مهارات ربط الأحكام الشرعية بالحياة': calculateFieldAverage(data, 'religiousRules'),
        'أساليب تعزيز الهوية الدينية': calculateFieldAverage(data, 'religiousIdentity')
    };
    
    const labels = Object.keys(skills);
    const values = Object.values(skills);
    
    const ctx = document.getElementById('religiousChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الاحتياج التدريبي',
                data: values,
                backgroundColor: '#f6c23e',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
    
    // تحديث قائمة أعلى المهارات احتياجاً
    updateTopSkillsList('topReligiousSkills', skills);
}

// رسم بياني للمجال الترفيهي والرياضي
function createRecreationalChart(data) {
    const skills = {
        'تنظيم الأنشطة الترفيهية': calculateFieldAverage(data, 'recreationalActivities'),
        'مهارات تنظيم الرحلات': calculateFieldAverage(data, 'tripsOrganization'),
        'تنظيم الفعاليات والمناسبات': calculateFieldAverage(data, 'eventsOrganization'),
        'استثمار أوقات الفراغ': calculateFieldAverage(data, 'leisureTime'),
        'أساسيات التدريب الرياضي': calculateFieldAverage(data, 'sportsTraining')
    };
    
    const labels = Object.keys(skills);
    const values = Object.values(skills);
    
    const ctx = document.getElementById('recreationalChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'متوسط الاحتياج التدريبي',
                data: values,
                backgroundColor: '#e74a3b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });
    
    // تحديث قائمة أعلى المهارات احتياجاً
    updateTopSkillsList('topRecreationalSkills', skills);
}

// تحديث قائمة أعلى المهارات احتياجاً
function updateTopSkillsList(elementId, skills) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // ترتيب المهارات حسب المتوسط (تنازلياً)
    const sortedSkills = Object.entries(skills).sort((a, b) => b[1] - a[1]);
    
    // إنشاء قائمة المهارات
    let html = '<ul class="list-group">';
    sortedSkills.forEach(([skill, average]) => {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            ${skill}
            <span class="badge bg-primary rounded-pill">${average.toFixed(2)}</span>
        </li>`;
    });
    html += '</ul>';
    
    element.innerHTML = html;
}

// تحديث الجداول
function updateTables(data) {
    // تحديث جدول الاقتراحات والملاحظات
    updateSuggestionsTable(data);
    
    // تحديث جدول المشاركين من المنظمة
    updateOrganizationParticipantsTable(data);
}

// تحديث جدول الاقتراحات والملاحظات
function updateSuggestionsTable(data) {
    const suggestionsTable = document.getElementById('suggestionsTable');
    if (!suggestionsTable) return;
    
    let html = '';
    data.forEach(item => {
        if (item.suggestions && item.suggestions.trim() !== '') {
            html += `<tr>
                <td>${item.fullName || 'غير محدد'}</td>
                <td>${item.organization || 'غير محدد'}</td>
                <td>${item.suggestions}</td>
            </tr>`;
        }
    });
    
    suggestionsTable.innerHTML = html;
}

// تحديث جدول المشاركين من المنظمة
function updateOrganizationParticipantsTable(data, organization = null) {
    const organizationParticipantsTable = document.getElementById('organizationParticipantsTable');
    if (!organizationParticipantsTable) return;
    
    let filteredData = data;
    if (organization) {
        filteredData = data.filter(item => item.organization === organization);
    }
    
    let html = '';
    filteredData.forEach(item => {
        html += `<tr>
            <td>${item.fullName || 'غير محدد'}</td>
            <td>${item.jobTitle || 'غير محدد'}</td>
            <td>${item.experience || 'غير محدد'}</td>
            <td>${item.ageGroups ? item.ageGroups.join(', ') : 'غير محدد'}</td>
            <td>${item.careTypes ? item.careTypes.join(', ') : 'غير محدد'}</td>
        </tr>`;
    });
    
    organizationParticipantsTable.innerHTML = html;
}

// تحديث قائمة المنظمات
function updateOrganizationsList(data) {
    const organizationFilter = document.getElementById('organizationFilter');
    if (!organizationFilter) return;
    
    // الحصول على قائمة المنظمات الفريدة
    const organizations = [...new Set(data.map(item => item.organization).filter(Boolean))];
    
    // إضافة خيار "جميع المنظمات"
    let html = '<option value="">جميع المنظمات</option>';
    
    // إضافة خيارات المنظمات
    organizations.forEach(org => {
        html += `<option value="${org}">${org}</option>`;
    });
    
    organizationFilter.innerHTML = html;
}

// تصفية البيانات حسب المنظمة
function filterOrganizationData() {
    const organizationFilter = document.getElementById('organizationFilter');
    if (!organizationFilter) return;
    
    const selectedOrganization = organizationFilter.value;
    
    // إعادة تحميل البيانات مع تطبيق الفلتر
    fetchSurveyData().then(data => {
        if (selectedOrganization) {
            const filteredData = data.filter(item => item.organization === selectedOrganization);
            
            // تحديث الرسوم البيانية والجداول بالبيانات المصفاة
            createOrganizationCharts(filteredData);
            updateOrganizationParticipantsTable(filteredData);
            updateOrganizationDetailsTable(filteredData);
        }
    });
}

// تصفية البيانات حسب رمز المنظمة
function filterOrganizationByCode() {
    const organizationCodeFilter = document.getElementById('organizationCodeFilter');
    if (!organizationCodeFilter) return;
    
    const code = organizationCodeFilter.value.trim();
    
    // إعادة تحميل البيانات مع تطبيق الفلتر
    fetchSurveyData().then(data => {
        if (code) {
            const filteredData = data.filter(item => item.organizationCode === code);
            
            // تحديث الرسوم البيانية والجداول بالبيانات المصفاة
            createOrganizationCharts(filteredData);
            updateOrganizationParticipantsTable(filteredData);
            updateOrganizationDetailsTable(filteredData);
        }
    });
}

// إنشاء رسوم بيانية للمنظمة
function createOrganizationCharts(data) {
    // رسم بياني لمتوسط الاحتياج التدريبي حسب المجالات للمنظمة
    const organizationDomainsChart = document.getElementById('organizationDomainsChart');
    if (organizationDomainsChart) {
        const ctx = organizationDomainsChart.getContext('2d');
        
        const domains = {
            'النفسي والاجتماعي': calculateDomainAverage(data, ['psychologicalTrauma', 'selfConfidence', 'psychologicalCounseling', 'socialIntegration', 'effectiveCommunication']),
            'التربوي والتعليمي': calculateDomainAverage(data, ['modernTeaching', 'learningDifficulties', 'talentDevelopment', 'motivationTechniques', 'careerGuidance']),
            'الصحي والطبي': calculateDomainAverage(data, ['firstAid', 'healthCare', 'nutrition', 'commonDiseases', 'personalHygiene']),
            'الديني والروحي': calculateDomainAverage(data, ['religiousValues', 'teachingWorship', 'spiritualAwareness', 'religiousRules', 'religiousIdentity']),
            'الترفيهي والرياضي': calculateDomainAverage(data, ['recreationalActivities', 'tripsOrganization', 'eventsOrganization', 'leisureTime', 'sportsTraining'])
        };
        
        const labels = Object.keys(domains);
        const values = Object.values(domains);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'متوسط الاحتياج التدريبي',
                    data: values,
                    backgroundColor: [
                        '#4e73df',
                        '#1cc88a',
                        '#36b9cc',
                        '#f6c23e',
                        '#e74a3b'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }
    
    // رسم بياني لتوزيع المشاركين حسب المسمى الوظيفي للمنظمة
    const organizationJobsChart = document.getElementById('organizationJobsChart');
    if (organizationJobsChart) {
        const ctx = organizationJobsChart.getContext('2d');
        
        const jobTitles = {};
        data.forEach(item => {
            if (item.jobTitle) {
                jobTitles[item.jobTitle] = (jobTitles[item.jobTitle] || 0) + 1;
            }
        });
        
        const labels = Object.keys(jobTitles);
        const values = Object.values(jobTitles);
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#4e73df',
                        '#1cc88a',
                        '#36b9cc',
                        '#f6c23e',
                        '#e74a3b',
                        '#858796'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
}

// تحديث جدول تفاصيل المنظمة
function updateOrganizationDetailsTable(data) {
    const organizationDetailsTable = document.getElementById('organizationDetailsTable');
    if (!organizationDetailsTable) return;
    
    // تجميع جميع المهارات حسب المجال
    const allSkills = {
        'النفسي والاجتماعي': {
            'مهارات التعامل مع الصدمات النفسية': calculateFieldAverage(data, 'psychologicalTrauma'),
            'أساليب بناء الثقة بالنفس وتقدير الذات': calculateFieldAverage(data, 'selfConfidence'),
            'مهارات الإرشاد النفسي': calculateFieldAverage(data, 'psychologicalCounseling'),
            'استراتيجيات دمج الأيتام في المجتمع': calculateFieldAverage(data, 'socialIntegration'),
            'مهارات التواصل الفعال': calculateFieldAverage(data, 'effectiveCommunication')
        },
        'التربوي والتعليمي': {
            'أساليب التعليم الحديثة': calculateFieldAverage(data, 'modernTeaching'),
            'استراتيجيات التعامل مع صعوبات التعلم': calculateFieldAverage(data, 'learningDifficulties'),
            'مهارات اكتشاف وتنمية المواهب': calculateFieldAverage(data, 'talentDevelopment'),
            'أساليب التحفيز وتعزيز الدافعية': calculateFieldAverage(data, 'motivationTechniques'),
            'مهارات التوجيه المهني': calculateFieldAverage(data, 'careerGuidance')
        },
        'الصحي والطبي': {
            'أساسيات الإسعافات الأولية': calculateFieldAverage(data, 'firstAid'),
            'مهارات الرعاية الصحية الأساسية': calculateFieldAverage(data, 'healthCare'),
            'أساليب التغذية السليمة': calculateFieldAverage(data, 'nutrition'),
            'مهارات التعامل مع الأمراض الشائعة': calculateFieldAverage(data, 'commonDiseases'),
            'أساليب تعزيز النظافة الشخصية': calculateFieldAverage(data, 'personalHygiene')
        },
        'الديني والروحي': {
            'أساليب غرس القيم الدينية': calculateFieldAverage(data, 'religiousValues'),
            'مهارات تعليم العبادات بطريقة محببة': calculateFieldAverage(data, 'teachingWorship'),
            'أساليب تنمية الوازع الديني': calculateFieldAverage(data, 'spiritualAwareness'),
            'مهارات ربط الأحكام الشرعية بالحياة': calculateFieldAverage(data, 'religiousRules'),
            'أساليب تعزيز الهوية الدينية': calculateFieldAverage(data, 'religiousIdentity')
        },
        'الترفيهي والرياضي': {
            'تنظيم الأنشطة الترفيهية': calculateFieldAverage(data, 'recreationalActivities'),
            'مهارات تنظيم الرحلات': calculateFieldAverage(data, 'tripsOrganization'),
            'تنظيم الفعاليات والمناسبات': calculateFieldAverage(data, 'eventsOrganization'),
            'استثمار أوقات الفراغ': calculateFieldAverage(data, 'leisureTime'),
            'أساسيات التدريب الرياضي': calculateFieldAverage(data, 'sportsTraining')
        }
    };
    
    // تجميع جميع المهارات في مصفوفة واحدة
    let allSkillsArray = [];
    for (const domain in allSkills) {
        for (const skill in allSkills[domain]) {
            allSkillsArray.push({
                domain: domain,
                skill: skill,
                average: allSkills[domain][skill]
            });
        }
    }
    
    // ترتيب المهارات حسب المتوسط (تنازلياً)
    allSkillsArray.sort((a, b) => b.average - a.average);
    
    // إنشاء جدول المهارات
    let html = '';
    allSkillsArray.forEach((item, index) => {
        html += `<tr>
            <td>${item.domain}</td>
            <td>${item.skill}</td>
            <td>${item.average.toFixed(2)}</td>
            <td>${index + 1}</td>
        </tr>`;
    });
    
    organizationDetailsTable.innerHTML = html;
}

// عرض رسالة عدم وجود بيانات
function showNoDataMessage() {
    console.log("⚠️ لا توجد بيانات استبيانات متاحة");
    
    const mainContent = document.querySelector('.card');
    if (mainContent) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-info';
        alertDiv.textContent = 'لا توجد بيانات استبيانات متاحة حالياً.';
        
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
    }
}

// عرض رسالة خطأ
function showErrorMessage() {
    console.log("❌ حدث خطأ أثناء تحميل البيانات");
    
    const mainContent = document.querySelector('.card');
    if (mainContent) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
        
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
    }
    
}
// ✅ تحميل الأسئلة الحالية
async function loadQuestions() {
    const res = await fetch('/api/survey-data');
    const data = await res.json();
    const questions = data[0]?.questions || [];
    const container = document.getElementById('questionsList');
    container.innerHTML = '';

    questions.forEach((q, index) => {
        container.innerHTML += `
            <div class="input-group mb-2">
                <input value="${q}" class="form-control" id="q-${index}">
                <button class="btn btn-primary" onclick="editQuestion(${index})">تعديل</button>
                <button class="btn btn-danger" onclick="deleteQuestion(${index})">حذف</button>
            </div>
        `;
    });
}

// ✅ إضافة سؤال جديد
async function addNewQuestion() {
    const question = document.getElementById('newQuestionText').value;
    if (!question) return;
    await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
    });
    document.getElementById('newQuestionText').value = '';
    loadQuestions();
}

// ✅ حذف سؤال
async function deleteQuestion(index) {
    await fetch(`/api/questions/${index}`, { method: 'DELETE' });
    loadQuestions();
}

// ✅ تعديل سؤال
async function editQuestion(index) {
    const newQuestion = document.getElementById(`q-${index}`).value;
    await fetch(`/api/questions/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newQuestion })
    });
    loadQuestions();
}

// ✅ تحميل الأسئلة تلقائيًا عند الدخول إلى التبويب
document.addEventListener('DOMContentLoaded', () => {
    const editTab = document.getElementById('edit-tab');
    if (editTab) {
        editTab.addEventListener('click', () => {
            setTimeout(() => loadQuestions(), 100); // انتظار بسيط بعد فتح التبويب
        });
    }
});
