document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://hamaniot-3.onrender.com"; // שנה לפי כתובת השרת שלך ברנדר
  const params = new URLSearchParams(window.location.search);
  const volunteerId = params.get("id");

  if (!volunteerId) {
    alert("❌ לא נמצא מזהה מתנדב ב-URL");
    return;
  }

  const form = document.getElementById("editVolunteerForm");
  const messageBox = document.getElementById("responseMessage");

  try {
    const res = await fetch(`${BASE_URL}/api/volunteers/${volunteerId}`);
    if (!res.ok) throw new Error("שגיאה בטעינת נתונים מהשרת");

    const volunteer = await res.json();

    document.getElementById("full_name").value = volunteer.full_name || "";
    document.getElementById("age").value = volunteer.age || "";
    document.getElementById("email").value = volunteer.email || "";
    document.getElementById("phone").value = volunteer.phone || "";
    document.getElementById("area").value = volunteer.area || "";
    document.getElementById("interests").value = volunteer.interests || "";

  } catch (err) {
    console.error("⚠ שגיאה בטעינת מתנדב:", err);
    alert("לא ניתן לטעון את פרטי המתנדב");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {
      full_name: document.getElementById("full_name").value.trim(),
      age: parseInt(document.getElementById("age").value),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      area: document.getElementById("area").value.trim(),
      interests: document.getElementById("interests").value.trim()
    };

    try {
      const res = await fetch(`${BASE_URL}/api/volunteers/${volunteerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) throw new Error("עדכון נכשל");

      messageBox.textContent = "✅ הפרטים עודכנו בהצלחה!";
      messageBox.style.color = "green";

      setTimeout(() => {
        window.location.href = `view_volunteer_profile.html?id=${volunteerId}`;
      }, 1500);

    } catch (err) {
      console.error("⚠ שגיאה בעדכון מתנדב:", err);
      messageBox.textContent = "❌ שגיאה בעדכון הפרטים";
      messageBox.style.color = "red";
    }
  });
});
