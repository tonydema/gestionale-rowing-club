import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/public/workouts',
    name: 'PublicWorkouts',
    component: () => import('@/views/public/PublicWorkoutsView.vue'),
    meta: { requiresAuth: false, isPublic: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/members/MembersListView.vue'),
        meta: { roles: ['ADMIN', 'SEGRETERIA', 'ALLENATORE'] },
      },
      {
        path: 'members/:id',
        name: 'MemberDetail',
        component: () => import('@/views/members/MemberDetailView.vue'),
        meta: { roles: ['ADMIN', 'SEGRETERIA', 'ALLENATORE'] },
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/groups/GroupsListView.vue'),
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/views/calendar/CalendarView.vue'),
      },
      {
        path: 'reporting',
        name: 'Reporting',
        component: () => import('@/views/reporting/ReportingView.vue'),
        meta: { roles: ['ADMIN', 'SEGRETERIA', 'ALLENATORE'] },
      },
      {
        path: 'reporting/types',
        name: 'ReportTypes',
        component: () => import('@/views/reporting/ReportTypesView.vue'),
        meta: { roles: ['ADMIN', 'SEGRETERIA'] },
      },
      {
        path: 'billing',
        name: 'Billing',
        component: () => import('@/views/billing/PaymentsView.vue'),
        meta: { roles: ['ADMIN', 'SEGRETERIA'] },
      },
      {
        path: 'workouts',
        name: 'Workouts',
        component: () => import('@/views/workouts/WorkoutsView.vue'),
      },
      {
        path: 'trainings',
        name: 'Trainings',
        component: () => import('@/views/trainings/TrainingsListView.vue'),
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/equipment/BoatsListView.vue'),
      },
      {
        path: 'races',
        name: 'Races',
        component: () => import('@/views/races/RacesListView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Inizializza auth store da localStorage se necessario
  if (!authStore.user && localStorage.getItem('accessToken')) {
    authStore.initializeFromStorage()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)
  const requiredRoles = to.meta.roles as string[] | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect al login se non autenticato
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // Redirect alla dashboard se già loggato
    next({ name: 'Dashboard' })
  } else if (requiredRoles && authStore.userRole && !requiredRoles.includes(authStore.userRole)) {
    // Redirect se non ha i permessi
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
