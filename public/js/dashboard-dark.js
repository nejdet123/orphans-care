document.addEventListener("DOMContentLoaded", function () {
  console.log("📊 تم تحميل لوحة التحكم الداكنة");
  fetchSurveyStats();
  window.exportToExcel = exportToExcel;
});

async function fetchSurveyStats() {
  try {
    const res = await fetch('/api/survey-data');
    const result = await res.json();
    const surveys = result.data;

    console.log("📦 البيانات:", surveys);

    if (!surveys || surveys.length === 0) return;

    const orgs = new Set();
    let previousTrainingCount = 0;
    const domainSums = {
      psychological: 0,
      educational: 0,
      health: 0
    };

    surveys.forEach(s => {
      if (s.organization) orgs.add(s.organization);
      if (s.previousTraining === 'نعم') previousTrainingCount++;

      domainSums.psychological += averageDomain(s, ["psychologicalTrauma", "selfConfidence", "psychologicalCounseling", "socialIntegration", "effectiveCommunication"]);
      domainSums.educational += averageDomain(s, ["modernTeaching", "learningDifficulties", "talentDevelopment", "motivationTechniques", "careerGuidance"]);
      domainSums.health       += averageDomain(s, ["firstAid", "healthCare", "nutrition", "commonDiseases", "personalHygiene"]);
    });

    const total = surveys.length;
    const orgCount = orgs.size;
    const trainingPercentage = Math.round((previousTrainingCount / total) * 100);

    document.getElementById('totalParticipants').textContent = total;
    document.getElementById('totalOrganizations').textContent = orgCount;
    document.getElementById('previousTrainingPercentage').textContent = `${trainingPercentage}%`;

    // أعلى مجال احتياجًا
    const maxDomain = Object.entries(domainSums).sort((a,b) => b[1] - a[1])[0][0];
    const domainLabels = { psychological: 'نفسي', educational: 'تربوي', health: 'صحي' };
    document.getElementById('highestNeedDomain').textContent = domainLabels[maxDomain];

    drawDomainsChart(domainSums);
    drawExperienceChart(surveys);
  } catch (error) {
    console.error("❌ فشل في تحميل بيانات الإحصاء:", error);
  }
}

function averageDomain(entry, keys) {
  let sum = 0;
  keys.forEach(k => sum += entry[k] || 0);
  return sum / keys.length;
}

function drawDomainsChart(domainSums) {
  const ctx = document.getElementById('domainsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['نفسي', 'تربوي', 'صحي'],
      datasets: [{
        label: 'معدل الاحتياج',
        data: [domainSums.psychological, domainSums.educational, domainSums.health],
        backgroundColor: ['#6f42c1', '#0d6efd', '#20c997']
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
  });
}

function drawExperienceChart(surveys) {
  const groups = {};
  surveys.forEach(s => {
    if (!groups[s.experience]) groups[s.experience] = 0;
    groups[s.experience]++;
  });

  const labels = Object.keys(groups);
  const data = Object.values(groups);

  const ctx = document.getElementById('experienceChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'سنوات الخبرة',
        data: data,
        backgroundColor: ['#ffc107', '#17a2b8', '#dc3545', '#6610f2', '#198754']
      }]
    },
    options: { responsive: true }
  });
}

function exportToExcel() {
  fetch('/api/survey-data')
    .then(res => res.json())
    .then(result => {
      const data = result.data;
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "البيانات");
      XLSX.writeFile(workbook, "survey-data.xlsx");
    })
    .catch(err => {
      console.error("❌ فشل في تصدير Excel:", err);
      alert("حدث خطأ أثناء التصدير");
    });
}
