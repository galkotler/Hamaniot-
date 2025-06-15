document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://hamaniot-3.onrender.com";
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
    // ✅ שליפת מתנדב
    const volunteerRes = await fetch(`${BASE_URL}/api/volunteers/${volunteerId}`, {
      credentials: "include"
    });
    const volunteer = await volunteerRes.json();

    const groupLabel = volunteer.group?.age_category || "לא שובץ";
    volunteerNameElem.textContent = `שיבוץ עבור: ${volunteer.full_name} | קבוצת גיל: ${groupLabel}`;

    // ✅ שליפת ילדים
    const childrenRes = await fetch(`${BASE_URL}/api/children`, {
      credentials: "include"
    });
    const children = await childrenRes.json();

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

  // ✅ שליחת שיבוץ
  document.getElementById("assignForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = studentSelect.value;

    try {
      const res = await fetch(`${BASE_URL}/api/volunteers/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
