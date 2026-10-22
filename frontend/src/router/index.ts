import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    group?: string
    requiresAuth?: boolean
    roles?: string[]
    hidden?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '业务工作台', group: '总览', requiresAuth: true },
      },
      {
        path: 'monitoring/overview',
        name: 'monitoring-overview',
        component: () => import('@/views/monitoring/OverviewView.vue'),
        meta: { title: '产业运行总览', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/index',
        name: 'monitoring-index',
        component: () => import('@/views/monitoring/IndexView.vue'),
        meta: { title: '综合景气指数', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/indicators',
        name: 'monitoring-indicators',
        component: () => import('@/views/monitoring/IndicatorsView.vue'),
        meta: { title: '多维指标', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/forecast',
        name: 'monitoring-forecast',
        component: () => import('@/views/monitoring/ForecastView.vue'),
        meta: { title: '趋势预测', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/risks',
        name: 'monitoring-risks',
        component: () => import('@/views/monitoring/RisksView.vue'),
        meta: { title: '风险预警清单', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/risks/:id',
        name: 'monitoring-risk-detail',
        component: () => import('@/views/monitoring/RiskDetailView.vue'),
        meta: {
          title: '风险详情',
          group: '动态监测',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'monitoring/chain-graph',
        name: 'monitoring-chain-graph',
        component: () => import('@/views/monitoring/ChainGraphView.vue'),
        meta: { title: '产业链风险图谱', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/enterprises',
        name: 'monitoring-enterprises',
        component: () => import('@/views/monitoring/EnterpriseProfileView.vue'),
        meta: { title: '企业画像', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/regions',
        name: 'monitoring-regions',
        component: () => import('@/views/monitoring/RegionView.vue'),
        meta: { title: '区域与园区', group: '动态监测', requiresAuth: true },
      },
      {
        path: 'monitoring/regions/park/:id',
        name: 'monitoring-park',
        component: () => import('@/views/monitoring/ParkProfileView.vue'),
        meta: {
          title: '园区画像',
          group: '动态监测',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'analysis/qa',
        name: 'analysis-qa',
        component: () => import('@/views/analysis/QaView.vue'),
        meta: { title: '产业智能问答', group: '智能分析', requiresAuth: true },
      },
      {
        path: 'analysis/chain',
        name: 'analysis-chain',
        component: () => import('@/views/analysis/ChainAnalysisView.vue'),
        meta: { title: '产业链分析', group: '智能分析', requiresAuth: true },
      },
      {
        path: 'analysis/topic',
        name: 'analysis-topic',
        component: () => import('@/views/analysis/TopicView.vue'),
        meta: { title: '专题研判', group: '智能分析', requiresAuth: true },
      },
      {
        path: 'analysis/risk',
        name: 'analysis-risk',
        component: () => import('@/views/analysis/RiskAnalysisView.vue'),
        meta: { title: '风险研判', group: '智能分析', requiresAuth: true },
      },
      {
        path: 'analysis/evidence',
        name: 'analysis-evidence',
        component: () => import('@/views/analysis/EvidenceCenterView.vue'),
        meta: { title: '证据中心', group: '智能分析', requiresAuth: true },
      },
      {
        path: 'analysis/trust/:id',
        name: 'analysis-trust',
        component: () => import('@/views/analysis/TrustDetailView.vue'),
        meta: {
          title: '分析可信度',
          group: '智能分析',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'reports',
        name: 'reports-list',
        component: () => import('@/views/reports/ReportListView.vue'),
        meta: { title: '报告管理', group: '报告中心', requiresAuth: true },
      },
      {
        path: 'reports/generate',
        name: 'reports-generate',
        component: () => import('@/views/reports/ReportGenerateView.vue'),
        meta: { title: '报告生成', group: '报告中心', requiresAuth: true },
      },
      {
        path: 'reports/editor/:id?',
        name: 'reports-editor',
        component: () => import('@/views/reports/ReportEditorView.vue'),
        meta: { title: '报告编辑', group: '报告中心', requiresAuth: true },
      },
      {
        path: 'reports/detail/:id',
        name: 'reports-detail',
        component: () => import('@/views/reports/ReportDetailView.vue'),
        meta: {
          title: '报告详情',
          group: '报告中心',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'reports/exports',
        name: 'reports-exports',
        component: () => import('@/views/reports/ExportCenterView.vue'),
        meta: { title: '导出中心', group: '报告中心', requiresAuth: true },
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/NotificationsView.vue'),
        meta: { title: '通知中心', group: '报告中心', requiresAuth: true },
      },
      {
        path: 'admin/data-sources',
        name: 'admin-data-sources',
        component: () => import('@/views/admin/AdminResourceView.vue'),
        meta: { title: '数据资源管理', group: '平台管理', requiresAuth: true },
      },
      {
        path: 'admin/metrics',
        name: 'admin-metrics',
        component: () => import('@/views/admin/AdminResourceView.vue'),
        meta: { title: '指标管理', group: '平台管理', requiresAuth: true },
      },
      {
        path: 'admin/models',
        name: 'admin-models',
        component: () => import('@/views/admin/AdminResourceView.vue'),
        meta: { title: '模型与知识', group: '平台管理', requiresAuth: true },
      },
      {
        path: 'admin/templates',
        name: 'admin-templates',
        component: () => import('@/views/admin/AdminResourceView.vue'),
        meta: { title: '专题与模板', group: '平台管理', requiresAuth: true },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/AdminResourceView.vue'),
        meta: {
          title: '用户与权限',
          group: '平台管理',
          requiresAuth: true,
          roles: ['系统管理员'],
        },
      },
      {
        path: 'admin/system',
        name: 'admin-system',
        component: () => import('@/views/admin/SystemMonitorView.vue'),
        meta: { title: '系统运行监控', group: '平台管理', requiresAuth: true },
      },
      {
        path: 'admin/audit',
        name: 'admin-audit',
        component: () => import('@/views/admin/AdminResourceView.vue'),
        meta: {
          title: '审计与日志',
          group: '平台管理',
          requiresAuth: true,
          roles: ['系统管理员'],
        },
      },
      {
        path: 'reviews/tasks',
        name: 'reviews-tasks',
        component: () => import('@/views/reviews/ReviewTasksView.vue'),
        meta: {
          title: '待审核任务',
          group: '专家审核',
          requiresAuth: true,
          roles: ['系统管理员', '专家审核员'],
        },
      },
      {
        path: 'reviews/workbench/:id?',
        name: 'reviews-workbench',
        component: () => import('@/views/reviews/ReviewWorkbenchView.vue'),
        meta: {
          title: '审核工作台',
          group: '专家审核',
          requiresAuth: true,
          roles: ['系统管理员', '专家审核员'],
        },
      },
      {
        path: 'reviews/records',
        name: 'reviews-records',
        component: () => import('@/views/reviews/ReviewRecordsView.vue'),
        meta: {
          title: '审核记录',
          group: '专家审核',
          requiresAuth: true,
          roles: ['系统管理员', '专家审核员'],
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/ErrorForbiddenView.vue'),
    meta: { title: '无访问权限', requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/ErrorNotFoundView.vue'),
    meta: { title: '页面不存在', requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  document.title = `${to.meta.title || '数字产业平台'} · 北京数字产业动态监测`

  if (to.name === 'login' && auth.isAuthenticated) {
    return '/dashboard'
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.roles?.length && !auth.hasAnyRole(to.meta.roles)) {
    return '/403'
  }

  return true
})

export default router
