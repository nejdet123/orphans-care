document.addEventListener("DOMContentLoaded", function () {
  console.log("📊 تم تحميل لوحة التحكم الداكنة");
  fetchSurveyStats();
  window.exportToExcel = exportToExcel;
});

async function fetchSurveyStats() {
  try {
    const res = await fetch('/api/survey-data');
    const result = await res.json();

    console.log("📦 البيانات:", result);

    const surveys = result.data;

    if (surveys && surveys.length > 0) {
      const orgs = new Set();
      let previousTrainingCount = 0;

      surveys.forEach(s => {
        if (s.organization) orgs.add(s.organization);
        if (s.previousTraining === 'نعم') previousTrainingCount++;
      });

      const total = surveys.length;
      const orgCount = orgs.size;
      const trainingPercentage = Math.round((previousTrainingCount / total) * 100);

      document.getElementById('totalParticipants').textContent = total;
      document.getElementById('totalOrganizations').textContent = orgCount;
      document.getElementById('previousTrainingPercentage').textContent = `${trainingPercentage}%`;

      drawDomainsChart(surveys);
    }
  } catch (error) {
    console.error("❌ فشل في تحميل بيانات الإحصاء:", error);
  }
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
    averages[i] = Math.round(averages[i] / (counts * 5) * 100);
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
