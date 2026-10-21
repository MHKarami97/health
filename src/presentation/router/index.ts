import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@presentation/views/DashboardView.vue') },
    { path: '/nutrition', name: 'nutrition', component: () => import('@presentation/views/NutritionView.vue') },
    { path: '/activity', name: 'activity', component: () => import('@presentation/views/ActivityView.vue') },
    { path: '/checkups', name: 'checkups', component: () => import('@presentation/views/CheckupsView.vue') },
    { path: '/habits', name: 'habits', component: () => import('@presentation/views/HabitsView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@presentation/views/SettingsView.vue') },
  ],
})
