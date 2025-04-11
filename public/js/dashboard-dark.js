document.addEventListener("DOMContentLoaded", function () {
  console.log("📊 تم تحميل لوحة التحكم الداكنة");
  fetchSurveyStats();

  document.getElementById("filterOrganization").addEventListener("change", applyFilters);
  document.getElementById("filterCode").addEventListener("input", applyFilters);
  document.getElementById("filterAge").addEventListener("change", applyFilters);
  document.getElementById("filterTraining").addEventListener("change", applyFilters);
});

async function fetchSurveyStats() {
  try {
    const res = await fetch('/api/survey-data');
    const data = await res.json();
    console.log("📦 البيانات:", data);
    window.fullSurveyData = data;
    updateFilters(data);
    updateGeneralStatistics(data);
    drawDomainsChart(data);
  } catch (error) {
    console.error("❌ فشل في تحميل بيانات الإحصاء:", error);
  }
}

function updateFilters(data) {
  const orgSelect = document.getElementById("filterOrganization");
  const uniqueOrgs = [...new Set(data.map(s => s.organization))];
  orgSelect.innerHTML = '<option value="">الكل</option>' + uniqueOrgs.map(org => `<option value="${org}">${org}</option>`).join('');
}

function applyFilters() {
  const org = document.getElementById("filterOrganization").value.trim();
  const code = document.getElementById("filterCode").value.trim();
  const age = document.getElementById("filterAge").value.trim();
  const training = document.getElementById("filterTraining").value.trim();

  let filtered = window.fullSurveyData.filter(s => {
    const matchOrg = !org || s.organization === org;
    const matchCode = !code || (s.organizationCode && s.organizationCode.toLowerCase().includes(code.toLowerCase()));
    const matchAge = !age || (s.ageGroups && s.ageGroups.includes(age));
    const matchTraining = !training || s.previousTraining === training;
    return matchOrg && matchCode && matchAge && matchTraining;
  });

  console.log("🎯 بعد التصفية:", filtered);
  updateGeneralStatistics(filtered);
  drawDomainsChart(filtered);
}

function updateGeneralStatistics(data) {
  const surveys = data;
  const orgs = new Set();
  let previousTrainingCount = 0;

  surveys.forEach(s => {
    if (s.organization) orgs.add(s.organization);
    if (s.previousTraining === 'نعم') previousTrainingCount++;
  });

  const total = surveys.length;
  const orgCount = orgs.size;
  const trainingPercentage = total > 0 ? Math.round((previousTrainingCount / total) * 100) : 0;

  document.getElementById('totalParticipants').textContent = total;
  document.getElementById('totalOrganizations').textContent = orgCount;
  document.getElementById('previousTrainingPercentage').textContent = `${trainingPercentage}%`;
}

function drawDomainsChart(surveys) {
  const domainKeys = {
    psychological: ["psychologicalTrauma", "selfConfidence", "psychologicalCounseling", "socialIntegration", "effectiveCommunication"],
    educational: ["modernTeaching", "learningDifficulties", "talentDevelopment", "motivationTechniques", "careerGuidance"],
    health: ["firstAid", "healthCare", "nutrition", "commonDiseases", "personalHygiene"]
  };

  const labels = ["نفسي", "تربوي", "صحي"];
  const averages = [0, 0, 0];

  surveys.forEach(s => {
    Object.entries(domainKeys).forEach(([key, questions], i) => {
      questions.forEach(q => {
        if (typeof s[q] === "number") {
          averages[i] += s[q];
        }
      });
    });
  });

  const counts = surveys.length;
  averages.forEach((_, i) => {
    averages[i] = counts > 0 ? Math.round(averages[i] / (counts * 5) * 100) : 0;
  });

  const ctx = document.getElementById('domainsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'متوسط نسبة الاحتياج',
        data: averages,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

function exportToExcel() {
  fetch('/api/survey-data')
    .then(res => res.json())
    .then(data => {
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
