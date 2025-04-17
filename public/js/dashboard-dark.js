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

    const list = document.getElementById("organizationList");
    list.innerHTML = "";
    uniqueOrgs.forEach(org => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = org;
      list.appendChild(li);
    });

    document.getElementById("filterCode").addEventListener("input", (e) => {
      const code = e.target.value.trim().toLowerCase();
      const filtered = allSurveys.filter(s => (s.q1 || '').toLowerCase().includes(code));
      drawDomainsChart(filtered);
      updateSummary(filtered);
      updateOrgTable(filtered);
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

function updateSummary(filtered) {
  const summary = document.getElementById("orgSummary");
  if (!filtered.length) return summary.style.display = "none";

  summary.style.display = "flex";
  document.getElementById("orgParticipants").textContent = filtered.length;

  const ageText = filtered.map(s => s.q5 || "");
  const estimateAge = ageText.map(val => {
    if (val.includes("18") || val.includes("أقل")) return 17;
    if (val.includes("25")) return 22;
    if (val.includes("35")) return 30;
    if (val.includes("45")) return 40;
    if (val.includes("أكثر")) return 50;
    return 0;
  }).filter(age => age > 0);

  const avg = estimateAge.length ? Math.round(estimateAge.reduce((a,b) => a+b, 0) / estimateAge.length) : '--';
  document.getElementById("orgAvgAge").textContent = avg + ' سنة';
}

function updateOrgTable(filtered) {
  const tbody = document.querySelector("#orgDataTable tbody");
  tbody.innerHTML = "";
  filtered.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.q1 || ""}</td>
      <td>${row.q2 || ""}</td>
      <td>${row.q5 || ""}</td>
      <td>${row.q8 || ""}</td>
      <td>${new Date(row.submittedAt).toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(allSurveys);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "كل البيانات");
  XLSX.writeFile(workbook, "survey-all-data.xlsx");
}

function exportOrgTable() {
  const code = document.getElementById("filterCode").value.trim().toLowerCase();
  const filtered = allSurveys.filter(s => (s.q1 || '').toLowerCase().includes(code));
  const exportData = filtered.map(row => ({
    "رمز": row.q1 || "",
    "المؤسسة": row.q2 || "",
    "العمر": row.q5 || "",
    "سبق له تدريب": row.q8 || "",
    "تاريخ المشاركة": new Date(row.submittedAt).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات المؤسسة");
  XLSX.writeFile(workbook, `survey-${code}.xlsx`);
}
