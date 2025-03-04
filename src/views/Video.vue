<template>
  <div class="video-container">
    <h1 class="video-title">📹 Videosamtal</h1>
    <div id="jitsi-container"></div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const jitsiLoaded = ref(false);

    function loadJitsiScript() {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          console.log("Jitsi API redan laddat.");
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;

        script.onload = () => {
          console.log("Jitsi API laddat framgångsrikt!");
          jitsiLoaded.value = true;
          resolve();
        };
        script.onerror = (error) => {
          console.error("Fel vid laddning av Jitsi API:", error);
          reject(error);
        };

        document.head.appendChild(script);
      });
    }

    function initializeJitsi() {
      if (!window.JitsiMeetExternalAPI) {
        console.error("JitsiMeetExternalAPI saknas. Kan inte starta videosamtal.");
        return;
      }

      const container = document.querySelector("#jitsi-container");
      if (!container) {
        console.error("Kunde inte hitta #jitsi-container i DOM.");
        return;
      }

      const domain = "meet.jit.si";
      const roomName = route.params.roomName || "VardApp-VideoCall";

      const options = {
        roomName: roomName,
        parentNode: container,
        width: "100%",
        height: "500px",
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup"],
        },
      };

      new window.JitsiMeetExternalAPI(domain, options);
      console.log(`Videosamtal startat i rum: ${roomName}`);
    }

    onMounted(async () => {
      try {
        await loadJitsiScript();
        initializeJitsi();
      } catch (error) {
        console.error("Ett fel uppstod vid laddning av Jitsi:", error);
      }
    });
  },
};
</script>

<style scoped>
.video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  background: #2c3e50;
}

.video-title {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

#jitsi-container {
  width: 100%;
  max-width: 800px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

@media (max-width: 768px) {
  #jitsi-container {
    height: 400px;
  }
  .video-title {
    font-size: 24px;
  }
}
</style>
