import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Support from "./views/Support.vue";
import Video from "./views/Video.vue";
import DoctorView from "./views/DoctorView.vue";
import BookingView from "./views/BookingView.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/support", component: Support },
  { path: "/video-call/:roomName", component: Video },
  { path: "/doctor", component: DoctorView },
  { path: "/bookings", component: BookingView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
