document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("https://hamaniot-3.onrender.com/api/content", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById("uploadStatus").textContent = "✅ הקובץ הועלה בהצלחה!";
      form.reset();
    } else {
      document.getElementById("uploadStatus").textContent = `❌ שגיאה: ${result.message || 'אירעה תקלה'}`;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("uploadStatus").textContent = "❌ שגיאת תקשורת עם השרת";
  }
});
