export interface MenuChild {
  title: string
  path: string
  icon: string
}

export interface MenuGroup {
  title: string
  icon: string
  path?: string
  children?: MenuChild[]
}

export const menuGroups: MenuGroup[] = [
  {
    title: '业务工作台',
    icon: 'DataBoard',
    path: '/dashboard',
  },
  {
    title: '动态监测',
    icon: 'TrendCharts',
    children: [
      { title: '产业运行总览', path: '/monitoring/overview', icon: 'Odometer' },
      { title: '综合景气指数', path: '/monitoring/index', icon: 'DataAnalysis' },
      { title: '多维指标', path: '/monitoring/indicators', icon: 'Grid' },
      { title: '趋势预测', path: '/monitoring/forecast', icon: 'TrendCharts' },
      { title: '风险预警清单', path: '/monitoring/risks', icon: 'Warning' },
      { title: '产业链风险图谱', path: '/monitoring/chain-graph', icon: 'Share' },
      { title: '企业画像', path: '/monitoring/enterprises', icon: 'OfficeBuilding' },
      { title: '区域与园区', path: '/monitoring/regions', icon: 'MapLocation' },
    ],
  },
  {
    title: '智能分析',
    icon: 'MagicStick',
    children: [
      { title: '产业智能问答', path: '/analysis/qa', icon: 'ChatDotRound' },
      { title: '产业链分析', path: '/analysis/chain', icon: 'Connection' },
      { title: '专题研判', path: '/analysis/topic', icon: 'Notebook' },
      { title: '风险研判', path: '/analysis/risk', icon: 'Aim' },
      { title: '证据中心', path: '/analysis/evidence', icon: 'DocumentChecked' },
    ],
  },
  {
    title: '报告中心',
    icon: 'Document',
    children: [
      { title: '报告生成', path: '/reports/generate', icon: 'EditPen' },
      { title: '报告管理', path: '/reports', icon: 'Files' },
      { title: '导出中心', path: '/reports/exports', icon: 'Download' },
      { title: '通知中心', path: '/notifications', icon: 'Bell' },
    ],
  },
  {
    title: '平台管理',
    icon: 'Setting',
    children: [
      { title: '数据资源管理', path: '/admin/data-sources', icon: 'Coin' },
      { title: '指标管理', path: '/admin/metrics', icon: 'Operation' },
      { title: '模型与知识', path: '/admin/models', icon: 'Cpu' },
      { title: '专题与模板', path: '/admin/templates', icon: 'Collection' },
      { title: '用户与权限', path: '/admin/users', icon: 'UserFilled' },
      { title: '系统运行监控', path: '/admin/system', icon: 'Monitor' },
      { title: '审计与日志', path: '/admin/audit', icon: 'Tickets' },
    ],
  },
  {
    title: '专家审核',
    icon: 'Stamp',
    children: [
      { title: '待审核任务', path: '/reviews/tasks', icon: 'List' },
      {
        title: '审核工作台',
        path: '/reviews/workbench/REV-20261018-003',
        icon: 'Checked',
      },
      { title: '审核记录', path: '/reviews/records', icon: 'Document' },
    ],
  },
]

export const flatMenuMap = new Map(
  menuGroups.flatMap((group) =>
    group.path
      ? [[group.path, group.title] as const]
      : (group.children || []).map((child) => [child.path, child.title] as const),
  ),
)
