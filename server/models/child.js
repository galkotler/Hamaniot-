const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  birth_date: { type: Date, required: true },
  address: String,

  // 🧒 פרטי אפוטרופוס
  guardian_name: String,
  guardian_phone: String,

  // 📋 מידע אישי / הערות כלליות
  personal_info: String,

  // 🏷️ שדות נוספים
  family_status: String,
  health_status: String,
  special_needs: String,

  // 🔗 שיוך לקבוצה
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },

  // 🤝 מתנדב משובץ
  assigned_volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
});

const Child = mongoose.models.Child || mongoose.model('Child', childSchema);

module.exports = Child;
