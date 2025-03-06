<script setup>
import { ref, onMounted, nextTick } from 'vue';

const chatMessages = ref([]);
const newMessage = ref("");
const chatBox = ref(null);

const sendMessage = async () => {
  if (newMessage.value.trim() === "") return;

  chatMessages.value.push({ sender: 'user', text: newMessage.value });
  await nextTick();
  chatBox.value.scrollTop = chatBox.value.scrollHeight;

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: newMessage.value }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    chatMessages.value.push({ sender: 'chatgpt', text: data.response });
  } catch (error) {
    chatMessages.value.push({ sender: 'chatgpt', text: "Ett fel uppstod. Försök igen senare." });
  }

  await nextTick();
  chatBox.value.scrollTop = chatBox.value.scrollHeight;

  newMessage.value = "";
};
</script>

<template>
  <div class="support">
    <div class="chat-container">
      <h1>Kund Support</h1>
      <p>Hur kan vi hjälpa dig idag? Fråga oss vad som helst!</p>

      <div class="chat-box" ref="chatBox">
        <div v-for="message in chatMessages" :key="message.text" class="message" :class="message.sender">
          <p>{{ message.text }}</p>
        </div>
      </div>

      <div class="chat-input-container">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage" 
          placeholder="Skriv ditt meddelande..." 
          class="chat-input" 
        />
        <button @click="sendMessage" class="chat-send-button">&#9658;</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.support {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}

.chat-container {
  width: 100%;
  width: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
}

h1 {
  color: #333;
  font-size: 22px;
  margin-bottom: 5px;
}

p {
  color: #ffff;
  font-size: 14px;
  margin-bottom: 15px;
}

.chat-box {
  height: 500px;
  overflow-y: auto;
  padding: 15px;
  border-radius: 8px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 75%;
  padding: 10px;
  border-radius: 10px;
  word-wrap: break-word;
}

.user {
  align-self: flex-end;
  background: #2ecc71;
  color: white;
}

.chatgpt {
  align-self: flex-start;
  background: #ddd;
  color: #333;
}

.chat-input-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.chat-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
}

.chat-send-button {
  background: #000000;
  border: none;
  padding: 10px 15px;
  margin-left: 10px;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.chat-send-button:hover {
  background: #333;
}
</style>