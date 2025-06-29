document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const BASE_URL = "https://hamaniot-3.onrender.com";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${BASE_URL}/api/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("רישום נכשל");

      const result = await response.json();
      alert("המתנדב נרשם בהצלחה!");

      // הפניה לשיבוץ עם id ו־full_name
      const volunteerId = result.volunteer_id;
      const volunteerName = data.full_name;
      window.location.href = `assign_student.html?id=${volunteerId}&name=${encodeURIComponent(volunteerName)}`;

    } catch (err) {
      alert("⚠ שגיאה ברישום המתנדב");
      console.error(err);
    }
  });
});
