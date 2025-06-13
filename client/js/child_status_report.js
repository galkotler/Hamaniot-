document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const childId = params.get("id");
  const form = document.getElementById("statusReportForm");
  const message = document.getElementById("responseMessage");

  // הגדרת תאריך ברירת מחדל להיום
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("reportDate").value = today;

  // 🛡️ בדיקת התחברות
  try {
    const authRes = await fetch("/api/auth/check", { credentials: "include" });
    if (!authRes.ok) throw new Error("לא מחובר");
    const user = await authRes.json();

    if (user.role !== "volunteer") {
      alert("⛔ רק מתנדבים רשאים לשלוח דוח");
      window.location.href = "../index.html";
      return;
    }

  } catch (err) {
    console.error("❌ שגיאת אימות:", err);
    alert("⛔ יש להתחבר למערכת");
    window.location.href = "../login.html";
    return;
  }

  // 📝 שליחת דוח
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!childId) {
      alert("❌ לא נמצא מזהה ילד");
      return;
    }

    const date = document.getElementById("reportDate").value;
    const content = document.getElementById("content").value;

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: "עדכון מצב",
          child: childId,
          content,
          date
        })
      });

      if (res.ok) {
        message.style.color = "green";
        message.textContent = "✅ הדוח נשלח בהצלחה!";
        form.reset();
        document.getElementById("reportDate").value = today;
      } else {
        const result = await res.json();
        message.style.color = "red";
        message.textContent = "❌ שגיאה: " + (result.message || "שליחת הדוח נכשלה");
      }

    } catch (err) {
      console.error("❌ שגיאה:", err);
      message.style.color = "red";
      message.textContent = "❌ שגיאה בשרת או ברשת";
    }
  });
});
