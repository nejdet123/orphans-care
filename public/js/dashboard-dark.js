
let allSurveys = [];

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/survey/survey-data");
    const response = await res.json();
    const data = response.data; // ✅ تصحيح هنا
    allSurveys = data;

    console.log("✅ تم تحميل البيانات:", data);

    updateFilters(data);
    updateGeneralStatistics(data);
    drawDomainsChart(data);

    document.getElementById("filterOrganization").addEventListener("change", applyFilters);
    document.getElementById("filterCode").addEventListener("input", applyFilters);
    document.getElementById("filterAge").addEventListener("change", applyFilters);
    document.getElementById("filterTraining").addEventListener("change", applyFilters);
  } catch (error) {
    console.error("❌ فشل في تحميل البيانات:", error);
  }
});
function updateFilters(data) {
  const select = document.getElementById("filterOrganization");
  const orgs = [...new Set(data.map(s => s.organization))];
  select.innerHTML = '<option value="">الكل</option>' + orgs.map(o => `<option value="${o}">${o}</option>`).join('');
}

function applyFilters() {
  const org = document.getElementById("filterOrganization").value.trim();
  const code = document.getElementById("filterCode").value.trim().toLowerCase();
  const age = document.getElementById("filterAge").value;
  const training = document.getElementById("filterTraining").value;

  const filtered = allSurveys.filter(row => {
    return (!org || row.organization === org) &&
           (!code || (row.organizationCode || '').toLowerCase().includes(code)) &&
           (!age || (row.ageGroups || []).includes(age)) &&
           (!training || row.previousTraining === training);
  });

  updateGeneralStatistics(filtered);
  drawDomainsChart(filtered);
}

function updateGeneralStatistics(surveys) {
  const total = surveys.length;
  const orgs = new Set(surveys.map(s => s.organization));
  const trained = surveys.filter(s => s.previousTraining === "نعم").length;
  const percentage = total > 0 ? Math.round((trained / total) * 100) : 0;

  document.getElementById("totalParticipants").textContent = total;
  document.getElementById("totalOrganizations").textContent = orgs.size;
  document.getElementById("previousTrainingPercentage").textContent = `${percentage}%`;
}

function drawDomainsChart(surveys) {
  const ctx = document.getElementById("domainsChart").getContext("2d");
  const domainKeys = {
    نفسي: ["psychologicalTrauma", "selfConfidence", "psychologicalCounseling", "socialIntegration", "effectiveCommunication"],
    تربوي: ["modernTeaching", "learningDifficulties", "talentDevelopment", "motivationTechniques", "careerGuidance"],
    صحي: ["firstAid", "healthCare", "nutrition", "commonDiseases", "personalHygiene"]
  };

  const labels = Object.keys(domainKeys);
  const values = labels.map(domain => {
    const total = surveys.reduce((sum, s) => {
      const domainSum = domainKeys[domain].reduce((acc, key) => acc + (s[key] || 0), 0);
      return sum + domainSum / domainKeys[domain].length;
    }, 0);
    return surveys.length ? Math.round(total / surveys.length) : 0;
  });

  if (window.domainsChartInstance) window.domainsChartInstance.destroy();
  window.domainsChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "معدل الاحتياج لكل مجال",
        data: values,
        backgroundColor: ["#0dcaf0", "#6f42c1", "#20c997"]
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

function exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(allSurveys);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "البيانات");
  XLSX.writeFile(workbook, "survey-data.xlsx");
}
