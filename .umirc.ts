import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', redirect: '/booking/room' },
    { path: '/booking', redirect: '/booking/room' },
    { path: '/booking/room', component: 'booking/room', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/details', component: 'booking/details', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/confirm', component: 'booking/confirm', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/success', component: 'booking/success', wrappers: ['@/wrappers/BookingFlow'] },
    { path: '/booking/list', component: 'booking/list' },
    { path: '/my-reservation', component: 'my-reservation/index' },
    { path: '*', component: '404' },
  ],
  mock: {},
  npmClient: 'npm',
});
