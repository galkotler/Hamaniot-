document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // חובה! אחרת session לא נשמר
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      // ✅ אם ההתחברות נכשלה
      if (!res.ok) {
        document.getElementById("error-message").style.display = "block";
        document.getElementById("error-message").textContent = data.message || "אימייל או סיסמה שגויים";
        return;
      }

      // ✅ התחברות הצליחה – שמירת פרטי משתמש ב-localStorage
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      console.log("✅ התחברות הצליחה:", data);

      // ✅ מעבר לדף הבית (ודא שהוא נמצא בשורש!)
      window.location.href = "/index.html";

    } catch (err) {
      console.error("❌ שגיאה בהתחברות:", err);
      document.getElementById("error-message").style.display = "block";
      document.getElementById("error-message").textContent = "שגיאה בעת התחברות לשרת";
    }
  });
});
