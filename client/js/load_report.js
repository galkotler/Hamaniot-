document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("reportTableBody");

  try {
    const response = await fetch("http://localhost:3000/api/children");
    if (!response.ok) throw new Error("שגיאה בטעינת הילדים");

    const children = await response.json();

    if (!Array.isArray(children) || children.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6">לא נמצאו ילדים להצגה</td></tr>`;
      return;
    }

    children.forEach(child => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${child._id}</td>
        <td>${child.first_name || ""} ${child.last_name || ""}</td>
        <td>${getAge(child.birth_date)}</td>
        <td>${child.health_status || '-'}</td>
        <td>${child.special_needs || '-'}</td>
        <td class="support-suggestion">${generateSupportSuggestion(child)}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("❌ שגיאה בטעינת הדוחות:", error);
    tableBody.innerHTML = `<tr><td colspan="6">❌ שגיאה בטעינת הדוחות</td></tr>`;
  }
});

// חישוב גיל על פי תאריך לידה
function getAge(birthDateStr) {
  if (!birthDateStr) return "-";
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// המלצות תמיכה מבוססות על מידע
function generateSupportSuggestion(child) {
  const specialNeeds = (child.special_needs || "").toLowerCase();
  const healthStatus = (child.health_status || "").toLowerCase();

  if (specialNeeds.includes("קשב") || specialNeeds.includes("ריכוז")) {
    return "הפחתת גירויים סביבתיים וליווי רגשי";
  }

  if (healthStatus.includes("אלרגי") || healthStatus.includes("אלרגיה")) {
    return "התאמות תזונתיות והימנעות מחשיפה לאלרגנים";
  }

  if (specialNeeds.includes("שפה") || specialNeeds.includes("תקשורת")) {
    return "תמיכה של קלינאית תקשורת";
  }

  return "מעקב חודשי על ידי מדריך אישי";
}
