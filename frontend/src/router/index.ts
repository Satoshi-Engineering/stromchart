import { createRouter, createWebHistory } from 'vue-router'

import { LOCALES } from '@/modules/initI18n'

const PageIndex = () => import('@/pages/PageIndex.vue')
const PageTable = () => import('@/pages/PageTable.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from) => {
    if (to.name === from.name) return {}
    return { top: 0 }
  },
  routes: [
    {
      path: `/:lang(${Object.keys(LOCALES).join('|')})?`,
      children: [
        {
          path: 'table',
          name: 'table',
          component: PageTable,
        },
        {
          path: ':electricitySupplier?',
          name: 'home',
          component: PageIndex,
        },
      ],
    },
  ],
})

export default router
