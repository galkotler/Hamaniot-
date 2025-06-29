document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://hamaniot-3.onrender.com"; 
  const container = document.getElementById("cardsContainer");
  const role = localStorage.getItem("role") || "volunteer";

  try {
    const response = await fetch(`${BASE_URL}/api/contents`);
    const contents = await response.json();

    contents.forEach(content => {
      const card = document.createElement("div");
      card.className = "content-card";
      card.setAttribute("data-category", content.category);
      card.setAttribute("data-audience", content.audience);

      const fileUrl = `${BASE_URL}/uploads/${content.filename}`;

      card.innerHTML = `
        <h3>${content.title}</h3>
        <p><strong>קטגוריה:</strong> ${content.category}</p>
        <p><strong>קהל יעד:</strong> ${content.audience}</p>
        <p><strong>תיאור:</strong> ${content.description || "אין תיאור"}</p>
        <p><strong>סוג קובץ:</strong> ${content.file_type}</p>
        <a href="${fileUrl}" class="download-link" download>📥 הורד</a>
        <div class="admin-controls"></div>
      `;

      if (role === "admin") {
        const controls = card.querySelector(".admin-controls");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑️ מחק";
        deleteBtn.style.marginTop = "10px";
        deleteBtn.onclick = async () => {
          const confirmDelete = confirm(`האם למחוק את "${content.title}"?`);
          if (!confirmDelete) return;

          try {
            const res = await fetch(`${BASE_URL}/api/contents/${content._id}`, {
              method: "DELETE"
            });

            const data = await res.json();
            if (res.ok) {
              card.remove();
              alert(data.message);
            } else {
              alert("❌ שגיאה במחיקה: " + data.message);
            }
          } catch (err) {
            alert("❌ שגיאת רשת במחיקה");
            console.error(err);
          }
        };

        controls.appendChild(deleteBtn);
      }

      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = "<p>⚠ שגיאה בטעינת התכנים.</p>";
    console.error("Error loading contents:", error);
  }
});

function filterCards() {
  const category = document.getElementById("categoryFilter").value;
  const audience = document.getElementById("audienceFilter").value;
  const cards = document.querySelectorAll(".content-card");

  cards.forEach(card => {
    const matchesCategory = !category || card.dataset.category === category;
    const matchesAudience = !audience || card.dataset.audience === audience;
    card.style.display = (matchesCategory && matchesAudience) ? "flex" : "none";
  });
}
