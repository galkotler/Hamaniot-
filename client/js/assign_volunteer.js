document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const volunteerId = urlParams.get("id");

  // בדיקת הרשאות
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    alert("גישה רק למנהלים.");
    window.location.href = "../index.html";
    return;
  }

  if (!volunteerId) {
    alert("❌ חסר מזהה מתנדב.");
    return;
  }

  const volunteerNameElem = document.getElementById("volunteerName");
  const studentSelect = document.getElementById("studentSelect");

  try {
    // שליפת מתנדב מהשרת
    const volunteerRes = await fetch(`http://localhost:3000/api/volunteers/${volunteerId}`);
    const volunteer = await volunteerRes.json();

    const groupLabel = volunteer.group?.age_category || "לא שובץ";
    volunteerNameElem.textContent = `שיבוץ עבור: ${volunteer.full_name} | קבוצת גיל: ${groupLabel}`;

    // שליפת כל הילדים
    const childrenRes = await fetch("http://localhost:3000/api/children");
    const children = await childrenRes.json();

    // סינון לפי קבוצת גיל ואי שיבוץ
    const filtered = children.filter(c =>
      c.group?.age_category === volunteer.group?.age_category && !c.assigned_volunteer
    );

    studentSelect.innerHTML = `<option value="">-- בחר ילד --</option>`;
    if (filtered.length === 0) {
      const option = document.createElement("option");
      option.textContent = "⚠️ אין ילדים זמינים לשיבוץ בקבוצה זו";
      studentSelect.appendChild(option);
      studentSelect.disabled = true;
      return;
    }

    filtered.forEach(child => {
      const option = document.createElement("option");
      option.value = child._id;
      option.textContent = `${child.first_name} ${child.last_name}`;
      studentSelect.appendChild(option);
    });

  } catch (err) {
    console.error("❌ שגיאה בטעינת נתונים:", err);
    studentSelect.innerHTML = `<option>⚠ שגיאה בטעינת נתונים</option>`;
  }

  // שליחת שיבוץ
  document.getElementById("assignForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = studentSelect.value;

    try {
      const res = await fetch("http://localhost:3000/api/volunteers/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteer_id: volunteerId,
          child_id: studentId
        })
      });

      if (!res.ok) throw new Error("שגיאה בביצוע השיבוץ");

      alert("✅ השיבוץ נשמר ונשלחו הודעות");
      window.location.href = "volunteer_list.html";
    } catch (err) {
      alert("❌ שגיאה בביצוע השיבוץ");
      console.error(err);
    }
  });
});
