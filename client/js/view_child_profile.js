document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const childId = params.get("id");
  const BASE_URL = "https://hamaniot-3.onrender.com";


  if (!childId) {
    alert("❌ לא נמצא מזהה בפרמטרים של ה-URL");
    return;
  }

  try {
    // בדיקת התחברות
    const sessionRes = await fetch("/api/auth/check", { credentials: "include" });
    if (!sessionRes.ok) {
      alert("⚠️ לא מחובר למערכת");
      window.location.href = "../index.html";
      return;
    }

    const user = await sessionRes.json();
    const role = user.role;
    const userEmail = user.email;
    const userGroup = user.group?.age_category;

    // שליפת פרטי ילד
    const res = await fetch(`${BASE_URL}/api/children/${childId}`);
    if (!res.ok) throw new Error("שגיאה בטעינת פרטי הילד");

    const child = await res.json();

    // בדיקת הרשאה למתנדב לפי מייל או קבוצת גיל
    if (role === "volunteer") {
      const assignedVolunteer = child.assigned_volunteer;

      const allowedByEmail = assignedVolunteer?.email === userEmail;
      const allowedByGroup = child.group?.age_category === userGroup;

      if (!allowedByEmail && !allowedByGroup) {
        alert("❌ אין לך הרשאה לצפות בפרופיל זה");
        window.location.href = "profile_list.html";
        return;
      }
    }

    // מילוי פרטים בפרופיל
    document.getElementById("fullName").textContent = `${child.first_name} ${child.last_name}`;
    document.getElementById("birthDate").textContent = new Date(child.birth_date).toLocaleDateString("he-IL");
    document.getElementById("address").textContent = child.address || "לא צויין";
    document.getElementById("guardianName").textContent = child.guardian_name || "לא צויין";
    document.getElementById("guardianPhone").textContent = child.guardian_phone || "לא צויין";
    document.getElementById("personalInfo").textContent = child.personal_info || "לא צויין";
    document.getElementById("group").textContent = child.group?.age_category || "לא שויך";

    // מנהל – הצגת כפתורי עריכה, מחיקה, שיבוץ
    if (role === "admin") {
      document.getElementById("editBtn").href = `profile_edit.html?id=${childId}`;
      document.getElementById("editBtn").style.display = "inline-block";

      // כפתור מחיקה
      const deleteBtn = document.createElement("a");
      deleteBtn.id = "deleteBtn";
      deleteBtn.href = "#";
      deleteBtn.className = "delete-button";
      deleteBtn.textContent = "❌ מחיקת פרופיל";
      deleteBtn.style.marginRight = "10px";
      deleteBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (confirm("האם אתה בטוח שברצונך למחוק את פרופיל הילד?")) {
          try {
            const delRes = await fetch(`/api/children/${childId}`, { method: "DELETE" });
            if (!delRes.ok) throw new Error("שגיאה במחיקה");
            alert("✅ הילד נמחק בהצלחה");
            window.location.href = "profile_list.html";
          } catch (err) {
            alert("❌ שגיאה במחיקת הפרופיל");
            console.error(err);
          }
        }
      });
      document.querySelector(".action-buttons").appendChild(deleteBtn);

      // שיבוץ קבוצה
      document.getElementById("groupAssignmentSection").style.display = "block";
      const groupSelect = document.getElementById("groupSelect");

      const groupRes = await fetch("/api/groups");
      const groups = await groupRes.json();

      groups.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g._id;
        opt.textContent = `${g.age_category}`;
        if (child.group?._id === g._id) opt.selected = true;
        groupSelect.appendChild(opt);
      });

      document.getElementById("assignGroupBtn").addEventListener("click", async () => {
        const selectedGroup = groupSelect.value;
        if (!selectedGroup) return alert("יש לבחור קבוצה");

        try {
          const assignRes = await fetch(`/api/groups/${selectedGroup}/assign-child`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ child_id: childId })
          });
          if (!assignRes.ok) throw new Error("שגיאה בשיבוץ");
          alert("✅ הילד שובץ לקבוצה בהצלחה");
          location.reload();
        } catch (err) {
          alert("⚠️ שגיאה בשיבוץ לקבוצה");
          console.error(err);
        }
      });
    }

    // כפתור דוח למתנדב
    if (role === "volunteer") {
      const statusReportBtn = document.getElementById("statusReportBtn");
      statusReportBtn.href = `child_status_report.html?id=${childId}`;
      statusReportBtn.style.display = "inline-block";
    }

  } catch (error) {
    console.error("⚠️ שגיאה בטעינת פרופיל הילד:", error);
    alert("⚠️ שגיאה בטעינת פרטי הילד");
  }
});
