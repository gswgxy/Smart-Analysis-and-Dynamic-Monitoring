<script setup lang="ts">
import { Download, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, updatedAt } from '@/mock/data'

interface Column {
  key: string
  label: string
  width?: number
  minWidth?: number
  kind?: 'status' | 'tag' | 'mono' | 'number'
}

interface ResourceConfig {
  title: string
  description: string
  entity: string
  readOnly?: boolean
  stats: Array<{ label: string; value: string; note: string }>
  columns: Column[]
  rows: Array<Record<string, string | number>>
}

const configs: Record<string, ResourceConfig> = {
  'admin-data-sources': {
    title: '数据资源管理',
    description: '维护数据源、同步任务、字段映射与数据质量状态，支撑监测指标的稳定更新。',
    entity: '数据源',
    stats: [
      { label: '已接入数据源', value: '12', note: '正常 11 · 异常 1' },
      { label: '今日同步任务', value: '28', note: '成功率 96.4%' },
      { label: '数据质量均分', value: '96.8', note: '核心指标完整率 99.2%' },
      { label: '最近同步', value: '06:30', note: '较计划提前 18 分钟' },
    ],
    columns: [
      { key: 'name', label: '数据源', minWidth: 190 },
      { key: 'code', label: '编码', width: 110, kind: 'mono' },
      { key: 'type', label: '类型', width: 100 },
      { key: 'frequency', label: '更新频率', width: 100 },
      { key: 'quality', label: '质量状态', width: 100, kind: 'tag' },
      { key: 'lastSync', label: '最近同步', width: 145 },
      { key: 'status', label: '状态', width: 85, kind: 'status' },
    ],
    rows: [
      { name: '企业主数据库', code: 'DS-ENT-01', type: '数据库', frequency: '每日', quality: '正常', lastSync: '2026-10-18 06:20', status: 'SUCCESS' },
      { name: '企业财报数据', code: 'DS-FIN-02', type: '文件接口', frequency: '季度', quality: '正常', lastSync: '2026-10-18 06:10', status: 'SUCCESS' },
      { name: '知识产权数据库', code: 'DS-IP-03', type: 'API', frequency: '每周', quality: '正常', lastSync: '2026-10-18 05:50', status: 'SUCCESS' },
      { name: '融资事件库', code: 'DS-MKT-04', type: 'API', frequency: '每周', quality: '部分缺失', lastSync: '2026-10-16 18:30', status: 'SUCCESS' },
      { name: '司法公开数据', code: 'DS-RSK-05', type: 'API', frequency: '每日', quality: '正常', lastSync: '2026-10-18 06:05', status: 'SUCCESS' },
      { name: '舆情数据源', code: 'DS-NEW-06', type: '消息队列', frequency: '实时', quality: '异常', lastSync: '2026-10-18 03:12', status: 'FAILED' },
    ],
  },
  'admin-metrics': {
    title: '指标管理',
    description: '维护指标定义、口径、公式、来源与权限，管理指标版本发布和历史回滚。',
    entity: '指标',
    stats: [
      { label: '指标总数', value: '268', note: '已发布 246' },
      { label: '本月新增', value: '12', note: '待审核 3' },
      { label: '口径变更', value: '4', note: '均已记录版本' },
      { label: '异常指标', value: '1', note: '融资数据缺失' },
    ],
    columns: [
      { key: 'name', label: '指标名称', minWidth: 170 },
      { key: 'code', label: '指标编码', width: 100, kind: 'mono' },
      { key: 'category', label: '分类', width: 100 },
      { key: 'unit', label: '单位', width: 75 },
      { key: 'source', label: '数据来源', width: 110 },
      { key: 'version', label: '版本', width: 80, kind: 'mono' },
      { key: 'status', label: '状态', width: 85, kind: 'status' },
    ],
    rows: [
      { name: '营业收入', code: 'SCL003', category: '产业规模', unit: '亿元', source: '企业财报', version: 'V3.2', status: 'PUBLISHED' },
      { name: '企业总数', code: 'SCL001', category: '产业规模', unit: '家', source: '企业主数据', version: 'V3.2', status: 'PUBLISHED' },
      { name: '专利申请量', code: 'INN001', category: '创新活力', unit: '件', source: '知识产权库', version: 'V3.1', status: 'PUBLISHED' },
      { name: '融资事件数量', code: 'MKT001', category: '市场活跃', unit: '起', source: '融资事件库', version: 'V2.8', status: 'REVIEWING' },
      { name: '高风险企业数', code: 'RSK010', category: '风险状况', unit: '家', source: '风险模型', version: 'V2.4', status: 'PUBLISHED' },
      { name: '产业链完整度', code: 'CHN008', category: '产业链', unit: '%', source: '知识图谱', version: 'V1.2', status: 'SUBMITTED' },
    ],
  },
  'admin-models': {
    title: '模型与知识管理',
    description: '管理预测模型、风险模型、知识库、提示词和评估版本，确保分析过程可追溯。',
    entity: '模型',
    stats: [
      { label: '已注册模型', value: '18', note: '在线 15' },
      { label: '知识库', value: '6', note: '文档 128.6 万份' },
      { label: '本月调用', value: '42.8万', note: '成功率 99.2%' },
      { label: '待评估版本', value: '2', note: '风险模型 V2.7' },
    ],
    columns: [
      { key: 'name', label: '模型/知识库', minWidth: 190 },
      { key: 'code', label: '编码', width: 105, kind: 'mono' },
      { key: 'type', label: '类型', width: 100 },
      { key: 'version', label: '版本', width: 75 },
      { key: 'metric', label: '评估指标', width: 145 },
      { key: 'updatedAt', label: '更新时间', width: 130 },
      { key: 'status', label: '状态', width: 85, kind: 'status' },
    ],
    rows: [
      { name: '综合景气指数模型', code: 'MDL-IDX-01', type: '指数模型', version: 'V3.2', metric: '专家校验通过', updatedAt: '2026-10-10', status: 'PUBLISHED' },
      { name: '产业链风险传导模型', code: 'MDL-RSK-02', type: '图算法', version: 'V2.6', metric: 'F1 0.89', updatedAt: '2026-10-08', status: 'PUBLISHED' },
      { name: '营收趋势预测模型', code: 'MDL-FST-03', type: '时序模型', version: 'V2.4', metric: 'MAPE 4.8%', updatedAt: '2026-10-18', status: 'PUBLISHED' },
      { name: '政策知识库', code: 'KB-POL-01', type: '向量知识库', version: 'V1.8', metric: '召回率 92%', updatedAt: '2026-10-17', status: 'PUBLISHED' },
      { name: '产业分析助手提示词', code: 'PRM-QA-02', type: '提示词', version: 'V2.2', metric: '人工评分 4.6', updatedAt: '2026-10-16', status: 'REVIEWING' },
    ],
  },
  'admin-templates': {
    title: '专题与模板管理',
    description: '维护专题目录、报告模板、章节结构、变量与权限，支持模板复制、预览和发布。',
    entity: '模板',
    stats: [
      { label: '专题模板', value: '14', note: '已发布 12' },
      { label: '报告模板', value: '9', note: '本月更新 3' },
      { label: '本月使用', value: '36', note: '高频模板 4 个' },
      { label: '待发布', value: '2', note: '需专家确认' },
    ],
    columns: [
      { key: 'name', label: '模板名称', minWidth: 220 },
      { key: 'type', label: '类型', width: 105 },
      { key: 'chapters', label: '章节数', width: 80, kind: 'number' },
      { key: 'owner', label: '负责人', width: 90 },
      { key: 'updatedAt', label: '更新时间', width: 130 },
      { key: 'version', label: '版本', width: 75 },
      { key: 'status', label: '状态', width: 85, kind: 'status' },
    ],
    rows: [
      { name: '人工智能产业月报', type: '报告模板', chapters: 6, owner: '张研', updatedAt: '2026-10-10', version: 'V3.2', status: 'PUBLISHED' },
      { name: '产业链风险专题', type: '专题模板', chapters: 7, owner: '李析', updatedAt: '2026-10-08', version: 'V2.6', status: 'PUBLISHED' },
      { name: '技术趋势研判', type: '专题模板', chapters: 5, owner: '陈析', updatedAt: '2026-09-26', version: 'V1.4', status: 'PUBLISHED' },
      { name: '园区招商研判', type: '专题模板', chapters: 6, owner: '王园', updatedAt: '2026-09-18', version: 'V1.3', status: 'PUBLISHED' },
      { name: '韧性评估报告', type: '报告模板', chapters: 8, owner: '赵韧', updatedAt: '2026-10-16', version: 'V0.9', status: 'REVIEWING' },
    ],
  },
  'admin-users': {
    title: '用户、角色与权限',
    description: '维护用户、角色、功能权限和数据权限，所有权限变更均写入审计日志。',
    entity: '用户',
    stats: [
      { label: '平台用户', value: '82', note: '启用 78' },
      { label: '角色', value: '5', note: '系统角色 4' },
      { label: '数据权限策略', value: '12', note: '覆盖 8 个部门' },
      { label: '近 30 天登录', value: '1,286', note: '异常登录 2' },
    ],
    columns: [
      { key: 'name', label: '用户', minWidth: 150 },
      { key: 'username', label: '账号', width: 110, kind: 'mono' },
      { key: 'department', label: '部门', width: 150 },
      { key: 'role', label: '角色', width: 110 },
      { key: 'scope', label: '数据范围', width: 130 },
      { key: 'lastLogin', label: '最近登录', width: 145 },
      { key: 'status', label: '状态', width: 85, kind: 'status' },
    ],
    rows: [
      { name: '系统管理员', username: 'admin', department: '平台管理组', role: '系统管理员', scope: '全部授权数据', lastLogin: '2026-10-18 10:20', status: 'SUCCESS' },
      { name: '张研', username: 'zhangyan', department: '产业监测一组', role: '数据管理员', scope: '人工智能产业', lastLogin: '2026-10-18 09:41', status: 'SUCCESS' },
      { name: '李析', username: 'lixi', department: '产业监测二组', role: '普通业务用户', scope: '集成电路产业', lastLogin: '2026-10-18 09:15', status: 'SUCCESS' },
      { name: '周专家', username: 'zhouexp', department: '专家委员会', role: '专家审核员', scope: '全部产业（审阅）', lastLogin: '2026-10-18 08:56', status: 'SUCCESS' },
      { name: '王园', username: 'wangyuan', department: '区域研究组', role: '普通业务用户', scope: '海淀区、经开区', lastLogin: '2026-10-17 18:30', status: 'SUCCESS' },
    ],
  },
  'admin-audit': {
    title: '审计与日志',
    description: '检索登录、查询、导出、审核和模型调用日志，支持追踪请求编号与数据范围。',
    entity: '日志',
    readOnly: true,
    stats: [
      { label: '今日日志', value: '12,860', note: '较昨日 +6.2%' },
      { label: '异常事件', value: '3', note: '已处理 2' },
      { label: '导出记录', value: '12', note: '均添加水印' },
      { label: '日志留存', value: '180天', note: '符合安全要求' },
    ],
    columns: [
      { key: 'time', label: '时间', width: 145 },
      { key: 'user', label: '用户', width: 90 },
      { key: 'action', label: '操作', width: 125 },
      { key: 'object', label: '对象', minWidth: 230 },
      { key: 'ip', label: 'IP 地址', width: 120, kind: 'mono' },
      { key: 'traceId', label: 'traceId', width: 120, kind: 'mono' },
      { key: 'result', label: '结果', width: 80, kind: 'tag' },
    ],
    rows: [
      { time: '2026-10-18 10:32', user: '张研', action: '提交审核', object: '北京市人工智能产业运行月报（2026年10月）', ip: '10.24.8.16', traceId: '8f2a...c91', result: '成功' },
      { time: '2026-10-18 10:20', user: 'admin', action: '登录', object: '统一认证', ip: '10.24.1.8', traceId: '6e1b...a42', result: '成功' },
      { time: '2026-10-18 10:16', user: '王园', action: '导出指标', object: '产业运行总览指标明细（XLSX）', ip: '10.24.9.31', traceId: '2a7c...f18', result: '成功' },
      { time: '2026-10-18 09:56', user: '系统', action: '模型调用', object: '专题生成 / mock-v0.2', ip: '127.0.0.1', traceId: '4d8e...b73', result: '成功' },
      { time: '2026-10-18 09:31', user: '李析', action: '查看证据', object: 'EVD-GPH-20261017-009', ip: '10.24.8.42', traceId: '7f3a...e21', result: '成功' },
      { time: '2026-10-18 08:42', user: '未知账号', action: '登录', object: '统一认证', ip: '172.18.2.91', traceId: '1b6d...c04', result: '失败' },
    ],
  },
}

const route = useRoute()
const keyword = ref('')
const createVisible = ref(false)
const createForm = reactive({ name: '', code: '', owner: '' })
const rows = ref<Array<Record<string, string | number>>>([])

const config = computed(() => configs[String(route.name)] || configs['admin-data-sources'])
const filteredRows = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(query)),
  )
})

watch(
  () => route.name,
  () => {
    rows.value = config.value.rows.map((row) => ({ ...row }))
    keyword.value = ''
  },
  { immediate: true },
)

function createResource() {
  if (!createForm.name.trim()) {
    ElMessage.warning(`请输入${config.value.entity}名称`)
    return
  }
  const row: Record<string, string | number> = {}
  config.value.columns.forEach((column) => {
    if (column.key === 'name') row[column.key] = createForm.name
    else if (column.key === 'code') row[column.key] = createForm.code || `NEW-${Date.now().toString().slice(-4)}`
    else if (column.key === 'status') row[column.key] = 'SUBMITTED'
    else if (column.key === 'quality' || column.key === 'result') row[column.key] = '待校验'
    else if (column.key === 'version') row[column.key] = 'V0.1'
    else if (column.key === 'owner') row[column.key] = createForm.owner || '当前用户'
    else if (column.key === 'updatedAt') row[column.key] = '2026-10-18'
    else row[column.key] = '—'
  })
  rows.value.unshift(row)
  createVisible.value = false
  createForm.name = ''
  createForm.code = ''
  createForm.owner = ''
  ElMessage.success(`${config.value.entity}已创建为草稿`)
}

function exportRows() {
  ElMessage.success(`${config.value.title}数据导出任务已创建`)
}

function rowAction(row: Record<string, string | number>, action: string) {
  ElMessage.success(`已对“${row.name || row.title || row.object || '当前记录'}”执行${action}`)
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      :title="config.title"
      :description="config.description"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Download" @click="exportRows">导出</el-button>
        <el-button v-if="!config.readOnly" type="primary" :icon="Plus" @click="createVisible = true">
          新增{{ config.entity }}
        </el-button>
      </template>
    </PageHeader>

    <div class="resource-stats">
      <div v-for="stat in config.stats" :key="stat.label">
        <span>{{ stat.label }}</span>
        <strong>{{ stat.value }}</strong>
        <em>{{ stat.note }}</em>
      </div>
    </div>

    <FilterBar label="筛选">
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        :placeholder="`搜索${config.entity}名称或编码`"
        clearable
        style="width: 260px"
      />
      <el-select model-value="全部状态" style="width: 120px">
        <el-option label="全部状态" value="全部状态" />
        <el-option label="已发布" value="PUBLISHED" />
        <el-option label="审核中" value="REVIEWING" />
      </el-select>
      <el-select v-if="route.name === 'admin-data-sources'" model-value="全部类型" style="width: 120px">
        <el-option label="全部类型" value="全部类型" />
        <el-option label="数据库" value="数据库" />
        <el-option label="API" value="API" />
      </el-select>
      <template #extra>
        <span class="status-line">共 {{ filteredRows.length }} 条记录</span>
      </template>
    </FilterBar>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">{{ config.entity }}列表</h2>
          <p class="section-subtitle">所有变更均记录操作人和版本</p>
        </div>
      </template>
      <el-table :data="filteredRows">
        <el-table-column
          v-for="column in config.columns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
        >
          <template #default="{ row }">
            <StatusBadge v-if="column.kind === 'status'" :status="String(row[column.key])" />
            <span v-else-if="column.kind === 'tag'" class="resource-tag" :class="{ 'is-warn': ['异常', '部分缺失', '失败', '待校验'].includes(String(row[column.key])) }">
              {{ row[column.key] }}
            </span>
            <span v-else-if="column.kind === 'mono'" class="mono resource-code">{{ row[column.key] }}</span>
            <strong v-else-if="column.kind === 'number'">{{ row[column.key] }}</strong>
            <span v-else>{{ row[column.key] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="right">
          <template #default="{ row }">
            <template v-if="config.readOnly">
              <el-button text size="small" @click="rowAction(row, '查看详情')">详情</el-button>
              <el-button text size="small" @click="rowAction(row, '追踪')">追踪</el-button>
            </template>
            <template v-else>
              <el-button text size="small" @click="rowAction(row, '编辑')">编辑</el-button>
              <el-button text size="small" @click="rowAction(row, '查看版本')">版本</el-button>
              <el-button v-if="route.name === 'admin-data-sources'" text size="small" @click="rowAction(row, '连接测试')">
                测试
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="resource-footnote">
      <span>公共字段：id、created_at、updated_at、created_by、updated_by、is_deleted。</span>
      <span>生产环境中的增删改操作需二次确认并写入审计日志。</span>
    </div>

    <el-dialog v-model="createVisible" :title="`新增${config.entity}`" width="min(480px, 92vw)">
      <el-form label-position="top">
        <el-form-item :label="`${config.entity}名称`" required>
          <el-input v-model="createForm.name" :placeholder="`请输入${config.entity}名称`" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="createForm.code" placeholder="留空则自动生成" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="createForm.owner" placeholder="默认当前用户" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createResource">创建草稿</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.resource-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.resource-stats > div {
  padding: 14px 16px;
  background: #fff;
}

.resource-stats span,
.resource-stats strong,
.resource-stats em {
  display: block;
}

.resource-stats span {
  color: #8794a6;
  font-size: 8px;
}

.resource-stats strong {
  margin: 3px 0 1px;
  color: #2e435b;
  font-size: 22px;
  font-weight: 620;
}

.resource-stats em {
  color: #98a3b2;
  font-size: 7px;
  font-style: normal;
}

.resource-tag {
  padding: 2px 6px;
  color: #0a8a71;
  background: #eaf8f4;
  border-radius: 4px;
  font-size: 7px;
}

.resource-tag.is-warn {
  color: #aa7310;
  background: #fff7e7;
}

.resource-code {
  color: #4f7194;
  font-size: 7.5px;
}

.resource-footnote {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  color: #929dac;
  font-size: 7px;
}

@media (max-width: 700px) {
  .resource-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
