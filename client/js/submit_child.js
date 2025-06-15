document.getElementById("childForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const BASE_URL = "https://hamaniot-3.onrender.com";
  // תאריך לידה וחישוב גיל
  const birthDateStr = document.querySelector('[name="birth_date"]').value;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday = (
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  );
  const finalAge = hasHadBirthday ? age : age - 1;

  // חישוב קבוצת גיל
  let group;
  if (finalAge <= 5) {
    group = "גיל רך";
  } else if (finalAge >= 6 && finalAge <= 12) {
    group = "ילדים";
  } else if (finalAge >= 13 && finalAge <= 18) {
    group = "נוער";
  } else {
    group = "לא מוגדר";
  }

  // עיבוד טלפון אפוטרופוס לפורמט +972
  let phone = document.querySelector('[name="guardian_phone"]').value.trim();
  if (!phone.startsWith("+972")) {
    if (phone.startsWith("0")) {
      phone = "+972" + phone.slice(1);
    } else {
      phone = "+972" + phone;
    }
  }

  // איסוף נתונים מהטופס
  const data = {
    first_name: document.querySelector('[name="first_name"]').value,
    last_name: document.querySelector('[name="last_name"]').value,
    birth_date: birthDateStr,
    address: document.querySelector('[name="address"]').value,
    guardian_name: document.querySelector('[name="guardian_name"]').value,
    guardian_phone: phone,
    personal_info: document.querySelector('[name="personal_info"]').value,
    group: group
  };

  try {
    const response = await fetch("${BASE_URL}/api/children", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // במקרה של session-cookie
      body: JSON.stringify(data)
    });

    const result = await response.json();
    const message = document.getElementById("responseMessage");

    if (response.ok) {
      message.style.color = "green";
      message.textContent = result.message || "✅ הפרופיל נשמר בהצלחה!";
    } else {
      message.style.color = "red";
      message.textContent = result.message || "❌ שגיאה בשמירת הפרופיל.";
    }

  } catch (err) {
    console.error(err);
    const message = document.getElementById("responseMessage");
    message.style.color = "red";
    message.textContent = "❌ שגיאה בשליחת הנתונים.";
  }
});
