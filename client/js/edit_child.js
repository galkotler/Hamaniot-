document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://hamaniot-3.onrender.com"; // שנה לכתובת שלך ברנדר
  const params = new URLSearchParams(window.location.search);
  const childId = params.get("id");

  // טוען נתוני הילד
  fetch(`${BASE_URL}/api/children/${childId}`)
    .then(res => res.json())
    .then(child => {
      document.getElementById("child_id").value = child._id;
      document.getElementById("first_name").value = child.first_name || "";
      document.getElementById("last_name").value = child.last_name || "";
      document.getElementById("birth_date").value = child.birth_date ? child.birth_date.substring(0, 10) : "";
      document.getElementById("address").value = child.address || "";
      document.getElementById("guardian_name").value = child.guardian_name || "";
      document.getElementById("guardian_phone").value = child.guardian_phone || "";
      document.getElementById("personal_info").value = child.personal_info || "";
    })
    .catch(err => {
      console.error("❌ שגיאה בטעינת נתוני הילד:", err);
    });

  // שליחת עדכון
  document.getElementById("editChildForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const birthDate = document.getElementById("birth_date").value;
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    let group = "";
    if (age <= 5) group = "גיל רך";
    else if (age <= 12) group = "ילדים";
    else if (age <= 18) group = "נוער";

    const data = {
      first_name: document.getElementById("first_name").value,
      last_name: document.getElementById("last_name").value,
      birth_date: birthDate,
      address: document.getElementById("address").value,
      guardian_name: document.getElementById("guardian_name").value,
      guardian_phone: document.getElementById("guardian_phone").value,
      personal_info: document.getElementById("personal_info").value,
      group: group
    };

    try {
      const response = await fetch(`${BASE_URL}/api/children/${childId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      const messageElement = document.getElementById("responseMessage");
      messageElement.style.color = "green";
      messageElement.textContent = "✅ הפרופיל עודכן בהצלחה!";

      setTimeout(() => {
        window.location.href = `profile.html?id=${childId}`;
      }, 2000);
    } catch (err) {
      console.error(err);
      const messageElement = document.getElementById("responseMessage");
      messageElement.style.color = "red";
      messageElement.textContent = "❌ שגיאה בעדכון הנתונים.";
    }
  });
});
