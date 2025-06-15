document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("childrenContainer");
  const role = localStorage.getItem("role");
  const ageCategoryFromStorage = localStorage.getItem("group"); // נשמר ב-localStorage עבור מתנדבים
  const groupSelect = document.getElementById("groupFilter");
  const searchInput = document.getElementById("searchInput");
  const BASE_URL = "https://hamaniot-3.onrender.com";

  let currentCategory = ageCategoryFromStorage || "";

  // ✅ טען סינון קבוצות רק עבור מנהלים
  if (role === "admin" && groupSelect) {
    const categories = ["", "גיל רך", "ילדים", "נוער"];
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat || "הצג הכל";
      groupSelect.appendChild(opt);
    });

    groupSelect.addEventListener("change", () => {
      currentCategory = groupSelect.value;
      loadChildren(role, currentCategory, searchInput.value);
    });
  }

  searchInput.addEventListener("input", () => {
    loadChildren(role, currentCategory, searchInput.value);
  });

  loadChildren(role, currentCategory);
});

async function loadChildren(role, category, searchTerm = "") {
  const container = document.getElementById("childrenContainer");
  container.innerHTML = "";

  try {
    const res = await fetch(`${BASE_URL}/api/children`, {
      credentials: "include"
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`שגיאת שרת: ${res.status}: ${errText}`);
    }

    const children = await res.json();
    if (!Array.isArray(children)) throw new Error("השרת החזיר פורמט לא תקין");

    const filtered = children.filter(child => {
      const fullName = `${child.first_name} ${child.last_name}`.toLowerCase();
      const matchesName = fullName.includes(searchTerm.toLowerCase());
      const matchesCategory = !category || (child.group?.age_category === category);
      return matchesName && matchesCategory;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<p style="text-align:center;">לא נמצאו ילדים</p>`;
      return;
    }

    filtered.forEach(child => {
      const card = document.createElement("div");
      card.className = "child-card";

      const age = calculateAge(new Date(child.birth_date));
      const categoryDisplay = child.group?.age_category || "לא משויך";

      card.innerHTML = `
        <h3>${child.first_name} ${child.last_name}</h3>
        <p><strong>גיל:</strong> ${age}</p>
        <p><strong>קטגוריית גיל:</strong> ${categoryDisplay}</p>
        <p><strong>טלפון אפוטרופוס:</strong> ${child.guardian_phone || "לא צויין"}</p>
        <div class="card-actions">
          <a href="profile.html?id=${child._id}" class="view-btn">צפה בפרופיל</a>
          ${role === "admin" ? `
            <a href="profile_edit.html?id=${child._id}" class="edit-btn">ערוך</a>
            <button onclick="deleteChild('${child._id}')" class="delete-btn">מחק</button>
          ` : ``}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("❌ שגיאה בטעינת ילדים:", err);
    container.innerHTML = `<p style="text-align:center;">⚠️ ${err.message}</p>`;
  }
}

function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function deleteChild(id) {
  if (!confirm("האם אתה בטוח שברצונך למחוק את הפרופיל?")) return;

  try {
    const res = await fetch(`${BASE_URL}/api/children/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("שגיאה במחיקה");
    alert("✅ הילד נמחק בהצלחה");
    location.reload();
  } catch (err) {
    alert("❌ שגיאה במחיקת הילד");
    console.error(err);
  }
}
