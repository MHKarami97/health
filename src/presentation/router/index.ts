import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: () => import('@presentation/components/layout/AppShell.vue'),
      children: [
        { path: '', name: 'dashboard', component: () => import('@presentation/views/DashboardView.vue') },
        { path: 'nutrition', name: 'nutrition', component: () => import('@presentation/views/NutritionView.vue') },
        { path: 'activity', name: 'activity', component: () => import('@presentation/views/ActivityView.vue') },
        { path: 'medical', name: 'medical', component: () => import('@presentation/views/MedicalView.vue') },
        { path: 'habits', name: 'habits', component: () => import('@presentation/views/HabitsView.vue') },
        { path: 'together', name: 'together', component: () => import('@presentation/views/TogetherView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@presentation/views/SettingsView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
