,
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
