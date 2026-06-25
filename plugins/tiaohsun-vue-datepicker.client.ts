import { defineNuxtPlugin } from "#app";
import VueDatepicker from "@tiaohsun/vue-datepicker";
import "@tiaohsun/vue-datepicker/style";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDatepicker);
});
