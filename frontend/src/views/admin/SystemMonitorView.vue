<script setup lang="ts">
import { Refresh, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, updatedAt } from '@/mock/data'
import { axisLabelStyle, axisLineStyle, chartTooltip, splitLineStyle } from '@/utils/charts'

const refreshTime = ref('10:42:18')
const jobs = ref([
  { id: 'JOB-20261018-026', name: '产业指标日聚合', type: '指标计算', startedAt: '10:40:02', duration: '2分16秒', status: 'RUNNING', progress: 72 },
  { id: 'JOB-20261018-025', name: '舆情数据增量同步', type: '数据同步', startedAt: '10:38:20', duration: '—', status: 'FAILED', progress: 0 },
  { id: 'JOB-20261018-024', name: '产业链图谱快照', type: '图谱构建', startedAt: '10:30:00', duration: '6分42秒', status: 'SUCCESS', progress: 100 },
  { id: 'JOB-20261018-023', name: '风险模型批量评分', type: '模型计算', startedAt: '10:20:05', duration: '8分12秒', status: 'SUCCESS', progress: 100 },
])

const services = [
  { name: 'API 网关', value: '42ms', status: '正常', uptime: '99.98%' },
  { name: 'PostgreSQL', value: '18ms', status: '正常', uptime: '99.99%' },
  { name: 'Redis', value: '4ms', status: '正常', uptime: '99.99%' },
  { name: '消息队列', value: '23 条积压', status: '关注', uptime: '99.92%' },
  { name: '对象存储', value: '62%', status: '正常', uptime: '99.97%' },
  { name: '模型服务', value: '1.8s', status: '正常', uptime: '99.81%' },
]

const resourceOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  legend: {
    top: 0,
    right: 0,
    icon: 'circle',
    itemWidth: 7,
    itemHeight: 7,
    textStyle: { color: '#768398', fontSize: 8 },
  },
  grid: { top: 35, left: 35, right: 18, bottom: 24 },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLabel: { ...axisLabelStyle, formatter: '{value}%' },
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      name: 'CPU',
      type: 'line',
      smooth: true,
      data: [22, 20, 31, 46, 52, 39, 36],
      symbol: 'none',
      lineStyle: { color: '#1769e0', width: 2 },
    },
    {
      name: '内存',
      type: 'line',
      smooth: true,
      data: [38, 36, 44, 58, 63, 55, 52],
      symbol: 'none',
      lineStyle: { color: '#15b8c7', width: 2 },
    },
  ],
}))

function refresh() {
  refreshTime.value = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
  ElMessage.success('运行状态已刷新')
}

function retry(job: (typeof jobs.value)[number]) {
  job.status = 'RUNNING'
  job.progress = 10
  ElMessage.success(`${job.name}已重新提交`)
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="系统运行监控"
      description="监控任务、服务、接口、队列和资源使用情况，支持失败任务重试与异常告警跟踪。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <span class="refresh-time">刷新于 {{ refreshTime }}</span>
        <el-button :icon="Refresh" @click="refresh">刷新状态</el-button>
      </template>
    </PageHeader>

    <div class="system-summary">
      <div class="is-ok"><span>系统状态</span><strong>运行正常</strong><em>核心服务可用性 99.9%</em></div>
      <div><span>今日任务</span><strong>286<small>个</small></strong><em>失败 2 · 成功率 99.3%</em></div>
      <div><span>平均响应</span><strong>126<small>ms</small></strong><em>P95 284 ms</em></div>
      <div><span>活跃用户</span><strong>42<small>人</small></strong><em>在线会话 58</em></div>
      <div class="is-warn"><span>待处理告警</span><strong>2<small>条</small></strong><em>1 条高优先级</em></div>
    </div>

    <div class="system-main">
      <DataCard title="资源使用趋势" subtitle="近 24 小时 CPU 与内存使用率">
        <BaseChart :option="resourceOption" height="310px" />
      </DataCard>
      <DataCard title="服务状态" subtitle="关键服务健康检查">
        <div class="service-list">
          <div v-for="item in services" :key="item.name">
            <span :class="{ 'is-warn': item.status !== '正常' }" />
            <strong>{{ item.name }}</strong>
            <em>{{ item.value }}</em>
            <small>{{ item.uptime }}</small>
          </div>
        </div>
        <template #footer>
          <div class="service-footer">
            <span><i class="inline-dot" />健康检查每 30 秒执行</span>
            <el-button text size="small">查看告警</el-button>
          </div>
        </template>
      </DataCard>
    </div>

    <DataCard title="任务运行" subtitle="最近运行任务与失败重试">
      <template #actions>
        <el-button text size="small">任务历史</el-button>
        <el-button text size="small">任务调度配置</el-button>
      </template>
      <el-table :data="jobs">
        <el-table-column prop="id" label="任务编号" width="145">
          <template #default="{ row }"><span class="mono job-id">{{ row.id }}</span></template>
        </el-table-column>
        <el-table-column prop="name" label="任务名称" min-width="220" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="startedAt" label="开始时间" width="100" />
        <el-table-column prop="duration" label="耗时" width="100" />
        <el-table-column label="进度" width="160">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.status === 'FAILED' ? 'exception' : undefined"
              :stroke-width="4"
              :show-text="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'FAILED'" text size="small" @click="retry(row)">重试</el-button>
            <el-button text size="small">日志</el-button>
            <el-button text size="small">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="alerts">
      <div class="alert-icon"><el-icon><Warning /></el-icon></div>
      <div>
        <span>当前告警</span>
        <strong>舆情数据源同步连续失败 2 次</strong>
        <p>消息队列存在 23 条积压，可能影响舆情数据时效性，建议检查第三方接口凭据。</p>
      </div>
      <el-button size="small" type="warning" plain>查看处理</el-button>
    </div>
  </div>
</template>

<style scoped>
.refresh-time {
  color: #8e9aaa;
  font-size: 8px;
}

.system-summary {
  display: grid;
  grid-template-columns: 1.2fr repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.system-summary > div {
  padding: 14px 16px;
  background: #fff;
}

.system-summary span,
.system-summary strong,
.system-summary em {
  display: block;
}

.system-summary span {
  color: #8794a6;
  font-size: 8px;
}

.system-summary strong {
  margin: 3px 0 1px;
  color: #2e435b;
  font-size: 20px;
  font-weight: 620;
}

.system-summary small {
  margin-left: 2px;
  color: #8e9aaa;
  font-size: 8px;
}

.system-summary em {
  color: #98a3b2;
  font-size: 7px;
  font-style: normal;
}

.system-summary .is-ok strong {
  color: #0a9275;
  font-size: 15px;
}

.system-summary .is-warn strong {
  color: #c3474e;
}

.system-main {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(310px, 0.75fr);
  gap: 16px;
}

.service-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.service-list > div {
  display: grid;
  grid-template-columns: 7px 1fr 55px;
  align-items: center;
  gap: 5px;
  padding: 9px;
  background: #f9fbfd;
  border-radius: 6px;
}

.service-list > div > span {
  width: 6px;
  height: 6px;
  background: #0ba58a;
  border-radius: 50%;
}

.service-list > div > span.is-warn {
  background: #e5a11a;
}

.service-list strong {
  color: #4b5e75;
  font-size: 7.5px;
  font-weight: 520;
}

.service-list em {
  color: #7e8b9d;
  font-size: 6.5px;
  font-style: normal;
  text-align: right;
}

.service-list small {
  grid-column: 2 / 4;
  color: #9ba5b3;
  font-size: 6px;
}

.service-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8d99a9;
  font-size: 7px;
}

.job-id {
  color: #557496;
  font-size: 7px;
}

.alerts {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  background: #fffaf0;
  border: 1px solid #f1e4c9;
  border-radius: 9px;
}

.alert-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #c98e24;
  background: #fff2d8;
  border-radius: 8px;
}

.alerts > div:nth-child(2) {
  flex: 1;
}

.alerts span {
  color: #a47b2f;
  font-size: 7px;
}

.alerts strong {
  display: block;
  margin: 3px 0;
  color: #654f2f;
  font-size: 9px;
  font-weight: 570;
}

.alerts p {
  margin: 0;
  color: #8a7753;
  font-size: 7.5px;
}

@media (max-width: 1000px) {
  .system-summary {
    grid-template-columns: 1fr 1fr;
  }

  .system-main {
    grid-template-columns: 1fr;
  }
}
</style>
