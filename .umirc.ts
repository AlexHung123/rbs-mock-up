import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', redirect: '/booking/room' },
    {
      path: '/booking',
      wrappers: ['@/wrappers/BookingFlow'],
      routes: [
        { path: '', redirect: '/booking/room' },
        { path: 'room', component: 'booking/room' },
        { path: 'details', component: 'booking/details' },
        { path: 'confirm', component: 'booking/confirm' },
        { path: 'success', component: 'booking/success' },
      ]
    },
    { path: '/booking/list', component: 'booking/list' },
    { path: '/my-reservation', component: 'my-reservation/index' },
    { path: '*', component: '404' },
  ],
  mock: {},
  npmClient: 'npm',
});
