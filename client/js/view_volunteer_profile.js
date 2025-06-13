document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const volunteerId = params.get("id");

  if (!volunteerId) {
    alert("❌ לא נמצא מזהה מתנדב בכתובת הדף.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/volunteers/${volunteerId}`);
    if (!res.ok) throw new Error("שגיאה בקבלת נתוני מתנדב מהשרת");

    const volunteer = await res.json();

    // הצגת פרטי מתנדב
    document.getElementById("fullName").textContent = volunteer.full_name || volunteer.name || "לא צויין";
    document.getElementById("age").textContent = volunteer.age || "לא צויין";
    document.getElementById("email").textContent = volunteer.email || "לא צויין";
    document.getElementById("phone").textContent = volunteer.phone || "לא צויין";
    document.getElementById("area").textContent = volunteer.area || "לא צויין";
    document.getElementById("interests").textContent = volunteer.interests || "לא צויין";

    // שיבוץ לקבוצת גיל / ילדים
    const assignedGroup = document.getElementById("assignedGroup");
    if (volunteer.group?.age_category) {
      assignedGroup.textContent = volunteer.group.age_category;
    } else if (volunteer.assigned_group) {
      assignedGroup.textContent = volunteer.assigned_group;
    } else if (Array.isArray(volunteer.assigned_children) && volunteer.assigned_children.length > 0) {
      assignedGroup.textContent = "✔️ שובץ לילד";
    } else {
      assignedGroup.textContent = "לא שובץ עדיין";
    }

  } catch (err) {
    console.error("❌ שגיאה בטעינת פרופיל מתנדב:", err);
    alert("⚠️ שגיאה בטעינת פרטי המתנדב");
  }
});
