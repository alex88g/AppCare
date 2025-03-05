<template>
  <div class="booking-container">
    <h1 class="booking-container__title">📅 Boka ett möte</h1>

    <div class="booking-container__input-group">
      <label for="date">📆 Välj datum</label>
      <input type="date" id="date" v-model="selectedDate" class="booking-container__input" @change="validateBookingDate" />
    </div>

    <div class="booking-container__input-group">
      <label for="time">⏰ Välj tid</label>
      <select id="time" v-model="selectedTime" class="booking-container__input" :disabled="isWeekend || availableHours.length === 0">
        <option v-for="hour in availableHours" :key="hour" :value="hour">{{ hour }}</option>
      </select>
    </div>

    <p v-if="isWeekend" class="booking-container__warning">📞 Endast akut samtal möjligt på helger.</p>

    <div class="booking-container__input-group">
      <label for="name">👤 Ditt namn</label>
      <input type="text" id="name" v-model="name" placeholder="Ange ditt namn" class="booking-container__input" />
    </div>

    <div class="booking-container__input-group">
      <label for="phone">📞 Mobilnummer</label>
      <input type="tel" id="phone" v-model="phone" placeholder="Ange ditt mobilnummer" class="booking-container__input" />
    </div>

    <div class="booking-container__input-group">
      <label for="email">✉️ E-postadress</label>
      <input type="email" id="email" v-model="email" placeholder="Ange din e-post" class="booking-container__input" />
    </div>

    <button @click="generateMeetingLink" class="booking-container__button" :disabled="isLoading || isWeekend || availableHours.length === 0">
      {{ isLoading ? '⏳ Skapar länk...' : '📩 Skapa möteslänk' }}
    </button>

    <div v-if="meetingLink" class="booking-container__meeting-info">
      <p>✅ Din möteslänk:</p>
      <a :href="meetingLink" target="_blank">{{ meetingLink }}</a>
    </div>

    <div v-if="bookingStatus" class="booking-container__status">
      <p>{{ bookingStatus }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const selectedDate = ref("");
    const selectedTime = ref("");
    const name = ref("");
    const phone = ref("");
    const email = ref("");
    const meetingLink = ref("");
    const bookingStatus = ref("");
    const isLoading = ref(false);
    const bookedSlots = ref([]); 

    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    console.log("🔑 API Key:", apiKey || "❌ API-nyckeln är undefined!");

    function fetchBookedSlots() {
      const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      bookedSlots.value = bookings.filter(booking => booking.date === selectedDate.value).map(booking => booking.time);
    }

    onMounted(fetchBookedSlots);

    const availableHours = computed(() => {
      if (!selectedDate.value) return [];

      const now = new Date();
      const selectedDay = new Date(selectedDate.value);

      return [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00"
      ].filter(hour => {
        const [hh, mm] = hour.split(":").map(Number);
        const timeToCheck = new Date(selectedDay);
        timeToCheck.setHours(hh, mm, 0, 0);

        if (selectedDay.toDateString() === now.toDateString() && timeToCheck < now) {
          return false;
        }

        return !bookedSlots.value.includes(hour);
      });
    });

    const isWeekend = computed(() => {
      if (!selectedDate.value) return false;
      const day = new Date(selectedDate.value).getDay();
      return day === 6 || day === 0;
    });

    function validateBookingDate() {
      bookingStatus.value = isWeekend.value ? "📞 Endast akut samtal möjligt på lördagar och söndagar." : "";
      fetchBookedSlots();
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async function generateMeetingLink() {
      if (!selectedDate.value || !selectedTime.value || !name.value || !phone.value || !email.value) {
        bookingStatus.value = "⚠️ Fyll i alla fält för att boka ett möte.";
        return;
      }

      if (!isValidEmail(email.value)) {
        bookingStatus.value = "❌ Ange en giltig e-postadress.";
        console.error("❌ Ogiltig e-post:", email.value);
        return;
      }

      isLoading.value = true;
      // meetingLink.value = `${window.location.origin}/video-call/${encodeURIComponent(selectedDate.value)}-${encodeURIComponent(selectedTime.value.replace(":", ""))}`;
      meetingLink.value = `https://meet.jit.si/${encodeURIComponent(selectedDate.value)}-${encodeURIComponent(selectedTime.value.replace(":", ""))}`;

      console.log("✅ Generated Meeting Link:", meetingLink.value);

      const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      bookings.push({
        id: Date.now(),
        date: selectedDate.value,
        time: selectedTime.value,
        name: name.value,
        phone: phone.value,
        email: email.value,
        meetingLink: meetingLink.value,
      });
      localStorage.setItem("bookings", JSON.stringify(bookings));

      try {
        console.log("📧 Sending email via Brevo...");
        console.log("Email recipient:", email.value);

        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: { name: "Support", email: "alexander.gallorini@gmail.com" },
            to: [{ email: email.value.trim(), name: name.value.trim() || "Gäst" }],
            subject: "Ditt möte är bokat!",
            htmlContent: `
              <h2>Hej ${name.value},</h2>
              <p>Du har bokat ett möte den <strong>${selectedDate.value}</strong> klockan <strong>${selectedTime.value}</strong>.</p>
              <p>Här är din möteslänk: <br>
                <a href="${meetingLink.value}" target="_blank">${meetingLink.value}</a>
              </p>
            `,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "api-key": apiKey,
            },
          }
        );

        bookingStatus.value = "✅ Möteslänk skickad till din e-post!";
        fetchBookedSlots();
      } catch (error) {
        console.error("❌ Brevo API Error:", error.response?.data || error.message);
        bookingStatus.value = "❌ Misslyckades med att skicka e-post: " + (error.response?.data?.message || "Okänt fel");
      }

      isLoading.value = false;
    }

    return { 
      selectedDate, 
      selectedTime, 
      name, 
      phone, 
      email, 
      meetingLink, 
      bookingStatus, 
      isLoading, 
      availableHours, 
      isWeekend, 
      validateBookingDate, 
      generateMeetingLink 
    };
  },
};
</script>


<style scoped>
.booking-container {
  max-width: 500px;
  width: 90%;
  padding: 25px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}


.booking-container__title {
  color: #3498db;
  font-size: 24px;
}

.booking-container__input-group {
  margin-bottom: 15px;
  text-align: left;
}

.booking-container__input-group label {
  font-weight: bold;
  color: #555;
}

.booking-container__input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border 0.3s ease-in-out;
}

.booking-container__input:focus {
  border-color: #3498db;
  outline: none;
}

.booking-container__button {
  width: 100%;
  background: #27ae60;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease-in-out;
}

.booking-container__button:hover {
  background: #2ecc71;
}

.booking-container__button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.booking-container__meeting-info {
  margin-top: 20px;
  font-size: 16px;
  text-align: center;
}

.booking-container__status {
  margin-top: 10px;
  font-size: 16px;
  color: green;
}

.booking-container__warning {
  color: red;
  font-weight: bold;
}
</style>
