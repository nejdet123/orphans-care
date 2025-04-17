// dashboard-dark.js
let allSurveys = [];

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/survey/survey-data");
    const response = await res.json();
    const data = response.data;
    allSurveys = data;

    document.getElementById("totalParticipants").textContent = data.length;

    const uniqueOrgs = [...new Set(data.map(item => item.q2))];
    document.getElementById("totalOrganizations").textContent = uniqueOrgs.length;

    // عرض قائمة المؤسسات
    const list = document.getElementById("organizationList");
    list.innerHTML = "";
    uniqueOrgs.forEach(org => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = org;
      list.appendChild(li);
    });

    // التحقق عند إدخال رمز المؤسسة
    document.getElementById("filterCode").addEventListener("input", (e) => {
      const code = e.target.value.trim().toLowerCase();
      const filtered = allSurveys.filter(s => (s.q1 || '').toLowerCase().includes(code));
      drawDomainsChart(filtered);
    });
  } catch (error) {
    console.error("❌ فشل في تحميل البيانات:", error);
  }
});

function drawDomainsChart(surveys) {
  const ctx = document.getElementById("domainsChart").getContext("2d");
  const domainKeys = {
    "نفسي": ["q10", "q11", "q12", "q13", "q14"],
    "تربوي": ["q15", "q16", "q17", "q18", "q19"],
    "صحي": ["q20", "q21", "q22", "q23", "q24"]
  };

  const labels = Object.keys(domainKeys);
  const values = labels.map(domain => {
    const total = surveys.reduce((sum, s) => {
      const domainSum = domainKeys[domain].reduce((acc, key) => acc + parseInt(s[key] || 0), 0);
      return sum + (domainSum / domainKeys[domain].length);
    }, 0);
    return surveys.length ? Math.round(total / surveys.length) : 0;
  });

  if (window.domainsChartInstance) window.domainsChartInstance.destroy();
  window.domainsChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "معدل الاحتياج",
        data: values,
        backgroundColor: ["#0dcaf0", "#6f42c1", "#20c997"]
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

function exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(allSurveys);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات المشاركين");
  XLSX.writeFile(workbook, "survey-data.xlsx");
}
