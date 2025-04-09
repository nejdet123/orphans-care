// ملف JavaScript للوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    // استدعاء بيانات الاستبيان من الخادم
    fetchSurveyData();
    
    // إضافة مستمعي الأحداث للفلاتر
    document.getElementById('organizationFilter').addEventListener('change', filterOrganizationData);
    document.getElementById('organizationCodeFilter').addEventListener('input', filterOrganizationByCode);
});

// استدعاء بيانات الاستبيان
async function fetchSurveyData() {
    try {
        const response = await fetch('/api/survey-data');
        if (!response.ok) {
            throw new Error('فشل في استرجاع البيانات');
        }
        
        const data = await response.json();
        console.log("🧪 البيانات المستلمة:", data);
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
    } catch (error) {
        console.error('خطأ في استرجاع بيانات الاستبيان:', error);
        showErrorMessage();
    }
}

// تحديث الإحصائيات العامة
function updateGeneralStatistics(data) {
    // عدد المشاركين
    document.getElementById('totalParticipants').textContent = data.length;
    
    // عدد المنظمات
    const organizations = [...new Set(data.map(item => item.organization))];
    document.getElementById('totalOrganizations').textContent = organizations.length;
    
    // نسبة المشاركين الذين سبق لهم الحصول على تدريب
    const previousTrainingCount = data.filter(item => item.previousTraining === 'نعم').length;
    const previousTrainingPercentage = ((previousTrainingCount / data.length) * 100).toFixed(1);
    document.getElementById('previousTrainingPercentage').textContent = `${previousTrainingPercentage}%`;
    
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
    document.getElementById('highestNeedDomain').textContent = `المجال ${sortedDomains[0][0]} (${sortedDomains[0][1].toFixed(2)})`;
    document.getElementById('lowestNeedDomain').textContent = `المجال ${sortedDomains[sortedDomains.length - 1][0]} (${sortedDomains[sortedDomains.length - 1][1].toFixed(2)})`;
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

// إنشاء الرسوم البيانية
function createCharts(data) {
    // رسم بياني لتوزيع المشاركين حسب المسمى الوظيفي
    createJobTitleChart(data);
    
    // رسم بياني لمتوسط الاحتياج التدريبي حسب المجالات
    createDomainsChart(data);
    
    // رسم بياني لتوزيع المشاركين حسب سنوات الخبرة
    createExperienceChart(data);
    
    // رسم بياني لتوزيع المشاركين حسب الدول
    createCountriesChart(data);
    
    // رسوم بيانية للمجالات المختلفة
    createPsychologicalChart(data);
    createEducationalChart(data);
    createMedicalChart(data);
    createReligiousChart(data);
    createRecreationalChart(data);
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
        'مهارات تصميم الأنشطة الترفيهية': calculateFieldAverage(data, 'recreationalActivities'),
        'أساليب تنظيم الرحلات والمعسكرات': calculateFieldAverage(data, 'tripsOrganization'),
        'مهارات تنظيم المسابقات والفعاليات': calculateFieldAverage(data, 'eventsOrganization'),
        'أساليب استثمار أوقات الفراغ': calculateFieldAverage(data, 'leisureTime'),
        'مهارات تدريب الألعاب الرياضية': calculateFieldAverage(data, 'sportsTraining')
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

// حساب متوسط الاحتياج لحقل معين
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

// تحديث قائمة أعلى المهارات احتياجاً
function updateTopSkillsList(elementId, skills) {
    const sortedSkills = Object.entries(skills).sort((a, b) => b[1] - a[1]);
    const topSkillsList = document.getElementById(elementId);
    
    topSkillsList.innerHTML = '';
    
    for (let i = 0; i < Math.min(3, sortedSkills.length); i++) {
        const li = document.createElement('li');
        li.textContent = `${sortedSkills[i][0]} (${sortedSkills[i][1].toFixed(2)})`;
        topSkillsList.appendChild(li);
    }
}

// تحديث الجداول
function updateTables(data) {
    // تحديث جداول المجالات المختلفة
    updateDomainTable(data, 'psychologicalTable', [
        { field: 'psychologicalTrauma', label: 'مهارات التعامل مع الصدمات النفسية' },
        { field: 'selfConfidence', label: 'أساليب بناء الثقة بالنفس وتقدير الذات' },
        { field: 'psychologicalCounseling', label: 'مهارات الإرشاد النفسي' },
        { field: 'socialIntegration', label: 'استراتيجيات دمج الأيتام في المجتمع' },
        { field: 'effectiveCommunication', label: 'مهارات التواصل الفعال' }
    ]);
    
    updateDomainTable(data, 'educationalTable', [
        { field: 'modernTeaching', label: 'أساليب التعليم الحديثة' },
        { field: 'learningDifficulties', label: 'استراتيجيات التعامل مع صعوبات التعلم' },
        { field: 'talentDevelopment', label: 'مهارات اكتشاف وتنمية المواهب' },
        { field: 'motivationTechniques', label: 'أساليب التحفيز وتعزيز الدافعية' },
        { field: 'careerGuidance', label: 'مهارات التوجيه المهني' }
    ]);
    
    updateDomainTable(data, 'medicalTable', [
        { field: 'firstAid', label: 'أساسيات الإسعافات الأولية' },
        { field: 'healthCare', label: 'مهارات الرعاية الصحية الأساسية' },
        { field: 'nutrition', label: 'أساليب التغذية السليمة' },
        { field: 'commonDiseases', label: 'مهارات التعامل مع الأمراض الشائعة' },
        { field: 'personalHygiene', label: 'أساليب تعزيز النظافة الشخصية' }
    ]);
    
    updateDomainTable(data, 'religiousTable', [
        { field: 'religiousValues', label: 'أساليب غرس القيم الدينية' },
        { field: 'teachingWorship', label: 'مهارات تعليم العبادات بطريقة محببة' },
        { field: 'spiritualAwareness', label: 'أساليب تنمية الوازع الديني' },
        { field: 'religiousRules', label: 'مهارات ربط الأحكام الشرعية بالحياة' },
        { field: 'religiousIdentity', label: 'أساليب تعزيز الهوية الدينية' }
    ]);
    
    updateDomainTable(data, 'recreationalTable', [
        { field: 'recreationalActivities', label: 'مهارات تصميم الأنشطة الترفيهية' },
        { field: 'tripsOrganization', label: 'أساليب تنظيم الرحلات والمعسكرات' },
        { field: 'eventsOrganization', label: 'مهارات تنظيم المسابقات والفعاليات' },
        { field: 'leisureTime', label: 'أساليب استثمار أوقات الفراغ' },
        { field: 'sportsTraining', label: 'مهارات تدريب الألعاب الرياضية' }
    ]);
    
    // تحديث جداول الاقتراحات والملاحظات
    updateSuggestionsTable(data);
}

// تحديث جدول مجال معين
function updateDomainTable(data, tableId, fields) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    table.innerHTML = '';
    
    // تصنيف البيانات حسب المسمى الوظيفي
    const jobTitles = ['مدير', 'أخصائي نفسي', 'أخصائي اجتماعي', 'معلم', 'مقدم رعاية'];
    
    fields.forEach(field => {
        const row = document.createElement('tr');
        
        // إضافة اسم المهارة
        const skillCell = document.createElement('td');
        skillCell.textContent = field.label;
        row.appendChild(skillCell);
        
        // حساب متوسط الاحتياج لكل مسمى وظيفي
        jobTitles.forEach(jobTitle => {
            const jobData = data.filter(item => item.jobTitle === jobTitle);
            const average = calculateFieldAverage(jobData, field.field);
            
            const cell = document.createElement('td');
            cell.textContent = average.toFixed(2);
            row.appendChild(cell);
        });
        
        // إضافة المتوسط العام
        const averageCell = document.createElement('td');
        const average = calculateFieldAverage(data, field.field);
        averageCell.textContent = average.toFixed(2);
        row.appendChild(averageCell);
        
        table.appendChild(row);
    });
}

// تحديث جداول الاقتراحات والملاحظات
function updateSuggestionsTable(data) {
    // تحليل المجالات التدريبية المقترحة
    const otherAreas = {};
    data.forEach(item => {
        if (item.otherTrainingAreas && item.otherTrainingAreas.trim() !== '') {
            const areas = item.otherTrainingAreas.split('\n');
            areas.forEach(area => {
                const trimmedArea = area.trim();
                if (trimmedArea) {
                    otherAreas[trimmedArea] = (otherAreas[trimmedArea] || 0) + 1;
                }
            });
        }
    });
    
    // تحليل اقتراحات تطوير البرامج التدريبية
    const suggestions = {};
    data.forEach(item => {
        if (item.suggestions && item.suggestions.trim() !== '') {
            const suggestionsList = item.suggestions.split('\n');
            suggestionsList.forEach(suggestion => {
                const trimmedSuggestion = suggestion.trim();
                if (trimmedSuggestion) {
                    suggestions[trimmedSuggestion] = (suggestions[trimmedSuggestion] || 0) + 1;
                }
            });
        }
    });
    
    // تحديث جدول المجالات المقترحة
    updateFrequencyTable('otherAreasTable', otherAreas);
    
    // تحديث جدول الاقتراحات
    updateFrequencyTable('suggestionsTable', suggestions);
    
    // تحديث جدول تفاصيل الاقتراحات والملاحظات
    updateDetailedSuggestionsTable(data);
}

// تحديث جدول التكرارات
function updateFrequencyTable(tableId, data) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    table.innerHTML = '';
    
    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
    
    sortedData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);
        
        const itemCell = document.createElement('td');
        itemCell.textContent = item[0];
        row.appendChild(itemCell);
        
        const frequencyCell = document.createElement('td');
        frequencyCell.textContent = item[1];
        row.appendChild(frequencyCell);
        
        table.appendChild(row);
    });
}

// تحديث جدول تفاصيل الاقتراحات والملاحظات
function updateDetailedSuggestionsTable(data) {
    const table = document.getElementById('detailedSuggestionsTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    // فلترة البيانات للحصول على السجلات التي تحتوي على اقتراحات أو مجالات مقترحة
    const filteredData = data.filter(item => 
        (item.otherTrainingAreas && item.otherTrainingAreas.trim() !== '') || 
        (item.suggestions && item.suggestions.trim() !== '')
    );
    
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        
        const organizationCell = document.createElement('td');
        organizationCell.textContent = item.organization || '-';
        row.appendChild(organizationCell);
        
        const jobTitleCell = document.createElement('td');
        jobTitleCell.textContent = item.jobTitle || '-';
        row.appendChild(jobTitleCell);
        
        const areasCell = document.createElement('td');
        areasCell.textContent = item.otherTrainingAreas || '-';
        row.appendChild(areasCell);
        
        const suggestionsCell = document.createElement('td');
        suggestionsCell.textContent = item.suggestions || '-';
        row.appendChild(suggestionsCell);
        
        table.appendChild(row);
    });
}

// تحديث قائمة المنظمات
function updateOrganizationsList(data) {
    const organizations = [...new Set(data.map(item => item.organization))];
    const select = document.getElementById('organizationFilter');
    
    if (!select) return;
    
    // إضافة خيار "جميع المنظمات"
    select.innerHTML = '<option value="all">جميع المنظمات</option>';
    
    // إضافة المنظمات
    organizations.forEach(org => {
        if (org) {
            const option = document.createElement('option');
            option.value = org;
            option.textContent = org;
            select.appendChild(option);
        }
    });
    
    // إضافة مستمع الحدث
    select.addEventListener('change', () => filterOrganizationData(data));
}

// فلترة البيانات حسب المنظمة
function filterOrganizationData() {
    const organizationFilter = document.getElementById('organizationFilter').value;
    
    // إعادة استدعاء البيانات وتطبيق الفلتر
    fetch('/api/survey-data')
        .then(response => response.json())
        .then(data => {
            let filteredData = data;
            
            if (organizationFilter !== 'all') {
                filteredData = data.filter(item => item.organization === organizationFilter);
            }
            
            // تحديث الرسوم البيانية والجداول للمنظمة المحددة
            updateOrganizationCharts(filteredData);
            updateOrganizationTables(filteredData);
        })
        .catch(error => {
            console.error('خطأ في استرجاع بيانات الاستبيان:', error);
        });
}

// فلترة البيانات حسب كود المنظمة
function filterOrganizationByCode() {
    const organizationCode = document.getElementById('organizationCodeFilter').value;
    
    // إعادة استدعاء البيانات وتطبيق الفلتر
    fetch('/api/survey-data')
        .then(response => response.json())
        .then(data => {
            let filteredData = data;
            
            if (organizationCode) {
                filteredData = data.filter(item => item.organizationCode === organizationCode);
            }
            
            // تحديث الرسوم البيانية والجداول للمنظمة المحددة
            updateOrganizationCharts(filteredData);
            updateOrganizationTables(filteredData);
        })
        .catch(error => {
            console.error('خطأ في استرجاع بيانات الاستبيان:', error);
        });
}

// تحديث الرسوم البيانية للمنظمة
function updateOrganizationCharts(data) {
    // رسم بياني لمتوسط الاحتياج التدريبي حسب المجالات
    const domains = {
        'النفسي والاجتماعي': calculateDomainAverage(data, ['psychologicalTrauma', 'selfConfidence', 'psychologicalCounseling', 'socialIntegration', 'effectiveCommunication']),
        'التربوي والتعليمي': calculateDomainAverage(data, ['modernTeaching', 'learningDifficulties', 'talentDevelopment', 'motivationTechniques', 'careerGuidance']),
        'الصحي والطبي': calculateDomainAverage(data, ['firstAid', 'healthCare', 'nutrition', 'commonDiseases', 'personalHygiene']),
        'الديني والروحي': calculateDomainAverage(data, ['religiousValues', 'teachingWorship', 'spiritualAwareness', 'religiousRules', 'religiousIdentity']),
        'الترفيهي والرياضي': calculateDomainAverage(data, ['recreationalActivities', 'tripsOrganization', 'eventsOrganization', 'leisureTime', 'sportsTraining'])
    };
    
    const labels = Object.keys(domains);
    const values = Object.values(domains);
    
    // تدمير الرسم البياني السابق إذا وجد
    const chartElement = document.getElementById('organizationDomainsChart');
    if (chartElement && chartElement.chart) {
        chartElement.chart.destroy();
    }
    
    const ctx = chartElement.getContext('2d');
    chartElement.chart = new Chart(ctx, {
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
    
    // رسم بياني لتوزيع المشاركين حسب المسمى الوظيفي
    const jobTitles = {};
    data.forEach(item => {
        if (item.jobTitle) {
            jobTitles[item.jobTitle] = (jobTitles[item.jobTitle] || 0) + 1;
        }
    });
    
    const jobLabels = Object.keys(jobTitles);
    const jobValues = Object.values(jobTitles);
    
    // تدمير الرسم البياني السابق إذا وجد
    const jobsChartElement = document.getElementById('organizationJobsChart');
    if (jobsChartElement && jobsChartElement.chart) {
        jobsChartElement.chart.destroy();
    }
    
    const jobsCtx = jobsChartElement.getContext('2d');
    jobsChartElement.chart = new Chart(jobsCtx, {
        type: 'pie',
        data: {
            labels: jobLabels,
            datasets: [{
                data: jobValues,
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

// تحديث جداول المنظمة
function updateOrganizationTables(data) {
    // تحديث جدول تفاصيل الاحتياجات التدريبية للمنظمة
    const detailsTable = document.getElementById('organizationDetailsTable');
    if (detailsTable) {
        detailsTable.innerHTML = '';
        
        // جمع جميع المهارات وحساب متوسطاتها
        const skills = [
            { domain: 'النفسي والاجتماعي', field: 'psychologicalTrauma', label: 'مهارات التعامل مع الصدمات النفسية' },
            { domain: 'النفسي والاجتماعي', field: 'selfConfidence', label: 'أساليب بناء الثقة بالنفس وتقدير الذات' },
            { domain: 'النفسي والاجتماعي', field: 'psychologicalCounseling', label: 'مهارات الإرشاد النفسي' },
            { domain: 'النفسي والاجتماعي', field: 'socialIntegration', label: 'استراتيجيات دمج الأيتام في المجتمع' },
            { domain: 'النفسي والاجتماعي', field: 'effectiveCommunication', label: 'مهارات التواصل الفعال' },
            
            { domain: 'التربوي والتعليمي', field: 'modernTeaching', label: 'أساليب التعليم الحديثة' },
            { domain: 'التربوي والتعليمي', field: 'learningDifficulties', label: 'استراتيجيات التعامل مع صعوبات التعلم' },
            { domain: 'التربوي والتعليمي', field: 'talentDevelopment', label: 'مهارات اكتشاف وتنمية المواهب' },
            { domain: 'التربوي والتعليمي', field: 'motivationTechniques', label: 'أساليب التحفيز وتعزيز الدافعية' },
            { domain: 'التربوي والتعليمي', field: 'careerGuidance', label: 'مهارات التوجيه المهني' },
            
            { domain: 'الصحي والطبي', field: 'firstAid', label: 'أساسيات الإسعافات الأولية' },
            { domain: 'الصحي والطبي', field: 'healthCare', label: 'مهارات الرعاية الصحية الأساسية' },
            { domain: 'الصحي والطبي', field: 'nutrition', label: 'أساليب التغذية السليمة' },
            { domain: 'الصحي والطبي', field: 'commonDiseases', label: 'مهارات التعامل مع الأمراض الشائعة' },
            { domain: 'الصحي والطبي', field: 'personalHygiene', label: 'أساليب تعزيز النظافة الشخصية' },
            
            { domain: 'الديني والروحي', field: 'religiousValues', label: 'أساليب غرس القيم الدينية' },
            { domain: 'الديني والروحي', field: 'teachingWorship', label: 'مهارات تعليم العبادات بطريقة محببة' },
            { domain: 'الديني والروحي', field: 'spiritualAwareness', label: 'أساليب تنمية الوازع الديني' },
            { domain: 'الديني والروحي', field: 'religiousRules', label: 'مهارات ربط الأحكام الشرعية بالحياة' },
            { domain: 'الديني والروحي', field: 'religiousIdentity', label: 'أساليب تعزيز الهوية الدينية' },
            
            { domain: 'الترفيهي والرياضي', field: 'recreationalActivities', label: 'مهارات تصميم الأنشطة الترفيهية' },
            { domain: 'الترفيهي والرياضي', field: 'tripsOrganization', label: 'أساليب تنظيم الرحلات والمعسكرات' },
            { domain: 'الترفيهي والرياضي', field: 'eventsOrganization', label: 'مهارات تنظيم المسابقات والفعاليات' },
            { domain: 'الترفيهي والرياضي', field: 'leisureTime', label: 'أساليب استثمار أوقات الفراغ' },
            { domain: 'الترفيهي والرياضي', field: 'sportsTraining', label: 'مهارات تدريب الألعاب الرياضية' }
        ];
        
        // حساب متوسط الاحتياج لكل مهارة
        const skillsWithAverage = skills.map(skill => ({
            ...skill,
            average: calculateFieldAverage(data, skill.field)
        }));
        
        // ترتيب المهارات حسب متوسط الاحتياج
        const sortedSkills = skillsWithAverage.sort((a, b) => b.average - a.average);
        
        // إضافة الصفوف إلى الجدول
        sortedSkills.forEach((skill, index) => {
            const row = document.createElement('tr');
            
            const domainCell = document.createElement('td');
            domainCell.textContent = skill.domain;
            row.appendChild(domainCell);
            
            const skillCell = document.createElement('td');
            skillCell.textContent = skill.label;
            row.appendChild(skillCell);
            
            const averageCell = document.createElement('td');
            averageCell.textContent = skill.average.toFixed(2);
            row.appendChild(averageCell);
            
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);
            
            detailsTable.appendChild(row);
        });
    }
    
    // تحديث جدول المشاركين من المنظمة
    const participantsTable = document.getElementById('organizationParticipantsTable');
    if (participantsTable) {
        participantsTable.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = item.fullName || '-';
            row.appendChild(nameCell);
            
            const jobTitleCell = document.createElement('td');
            jobTitleCell.textContent = item.jobTitle || '-';
            row.appendChild(jobTitleCell);
            
            const experienceCell = document.createElement('td');
            experienceCell.textContent = item.experience || '-';
            row.appendChild(experienceCell);
            
            const ageGroupsCell = document.createElement('td');
            ageGroupsCell.textContent = Array.isArray(item.ageGroups) ? item.ageGroups.join(', ') : '-';
            row.appendChild(ageGroupsCell);
            
            const careTypesCell = document.createElement('td');
            careTypesCell.textContent = Array.isArray(item.careTypes) ? item.careTypes.join(', ') : '-';
            row.appendChild(careTypesCell);
            
            participantsTable.appendChild(row);
        });
    }
}

// عرض رسالة عدم وجود بيانات
function showNoDataMessage() {
    const containers = document.querySelectorAll('.chart-container');
    containers.forEach(container => {
        container.innerHTML = '<div class="alert alert-info">لا توجد بيانات متاحة</div>';
    });
}

// عرض رسالة خطأ
function showErrorMessage() {
    const containers = document.querySelectorAll('.chart-container');
    containers.forEach(container => {
        container.innerHTML = '<div class="alert alert-danger">حدث خطأ أثناء استرجاع البيانات</div>';
    });
}
fetchSurveyData();
