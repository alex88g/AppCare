<template>
    <div class="booking-container">
      <h1 class="booking-title">📅 Bokningshantering</h1>
  
      <p v-if="isLoading" class="loading-text">🔄 Laddar bokningar...</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  
      <div v-if="bookings.length">
        <div v-for="(booking, index) in bookings" :key="booking.id" class="booking-card">
          <template v-if="!booking.isEditing">
            <p><strong>👤 Namn:</strong> {{ booking.name }}</p>
            <p><strong>📞 Mobilnummer:</strong> {{ booking.phone }}</p>
            <p><strong>✉️ E-post:</strong> {{ booking.email }}</p>
            <p><strong>📆 Datum:</strong> {{ booking.date }} kl. {{ booking.time }}</p>
            <p><strong>🔗 Möteslänk:</strong> 
              <a :href="booking.meetingLink" target="_blank">{{ booking.meetingLink }}</a>
            </p>
            <div class="button-group">
              <button @click="editBooking(index)" class="button edit-button">✏️ Redigera</button>
              <button @click="deleteBooking(index)" class="button delete-button">🗑 Radera</button>
            </div>
          </template>
          
          <template v-else>
            <input v-model="booking.name" class="edit-input" placeholder="Namn" />
            <input v-model="booking.phone" class="edit-input" placeholder="Mobilnummer" />
            <input v-model="booking.email" class="edit-input" placeholder="E-post" />
            <input type="date" v-model="booking.date" class="edit-input" />
            <select v-model="booking.time" class="edit-input">
              <option v-for="hour in availableHours" :key="hour" :value="hour">{{ hour }}</option>
            </select>
            <div class="button-group">
              <button @click="saveBooking(index)" class="button save-button">💾 Spara</button>
              <button @click="cancelEdit(index)" class="button cancel-button">❌ Avbryt</button>
            </div>
          </template>
        </div>
      </div>
  
      <p v-else-if="!isLoading && !errorMessage" class="no-bookings-text">🚫 Inga bokningar tillgängliga.</p>
    </div>
  </template>
  
  <script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const bookings = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref("");
    const availableHours = ref(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]);

    function fetchBookings() {
      isLoading.value = true;
      errorMessage.value = "";

      try {
        const storedBookings = localStorage.getItem("bookings");
        bookings.value = storedBookings ? JSON.parse(storedBookings).map(booking => ({
          ...booking,
          isEditing: false
        })) : [];
      } catch (error) {
        errorMessage.value = "Fel vid hämtning av bokningar.";
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    }

    function editBooking(index) {
      bookings.value[index].isEditing = true;
    }

    function saveBooking(index) {
      bookings.value[index].isEditing = false;
      localStorage.setItem("bookings", JSON.stringify(bookings.value));
    }

    function cancelEdit() {
      fetchBookings(); // Reload data from localStorage to reset changes
    }

    function deleteBooking(index) {
      if (confirm("Är du säker på att du vill radera denna bokning?")) {
        bookings.value.splice(index, 1);
        localStorage.setItem("bookings", JSON.stringify(bookings.value));
      }
    }

    onMounted(fetchBookings);
    return { bookings, isLoading, errorMessage, editBooking, saveBooking, cancelEdit, deleteBooking, availableHours };
  },
};
</script>

  
  <style scoped>
.booking-container {
  max-width: 650px;
  width: 90%;
  padding: 25px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
  
  .booking-title {
    color: #2c3e50;
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  .loading-text {
    color: #3498db;
    font-weight: bold;
  }
  
  .error-text {
    color: red;
    font-weight: bold;
  }
  
  .no-bookings-text {
    color: #bdc3c7;
    font-size: 16px;
  }
  
  .booking-card {
    background: #f9f9f9;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
  }
  
  .booking-card:hover {
    transform: scale(1.02);
  }
  
  .booking-card p {
    font-size: 16px;
    margin: 8px 0;
  }
  
  .booking-card a {
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
  }
  
  .booking-card a:hover {
    text-decoration: underline;
  }
  
  .button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }
  
  .button {
    padding: 10px 16px;
    border-radius: 5px;
    cursor: pointer;
    border: none;
    font-size: 14px;
    font-weight: bold;
    transition: background 0.3s ease-in-out;
  }
  
  .edit-button {
    background-color: #f39c12;
    color: white;
  }
  
  .edit-button:hover {
    background-color: #e67e22;
  }
  
  .delete-button {
    background-color: #e74c3c;
    color: white;
  }
  
  .delete-button:hover {
    background-color: #c0392b;
  }
  
  .save-button {
    background-color: #2ecc71;
    color: white;
  }
  
  .save-button:hover {
    background-color: #27ae60;
  }
  
  .cancel-button {
    background-color: #bdc3c7;
    color: white;
  }
  
  .cancel-button:hover {
    background-color: #95a5a6;
  }
  
  .edit-input {
    width: 100%;
    padding: 10px;
    margin-top: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  </style>
  