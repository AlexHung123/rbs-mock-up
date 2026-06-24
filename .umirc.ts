import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    { path: '/', redirect: '/booking/room' },
    { path: '/booking', redirect: '/booking/room' },
    { path: '/booking/room', component: 'booking/room' },
    { path: '/booking/details', component: 'booking/details' },
    { path: '/booking/confirm', component: 'booking/confirm' },
    { path: '/booking/success', component: 'booking/success' },
    { path: '/booking/list', component: 'booking/list' },
    { path: '/my-reservation', component: 'my-reservation/index' },
    { path: '*', component: '404' },
  ],
  layout: { name: 'BasicLayout', locale: false },
  antd: {},
  mock: {},
  npmClient: 'npm',
  define: {
    'process.env.NODE_ENV': 'development',
  },
});
