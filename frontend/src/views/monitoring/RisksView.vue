<script setup lang="ts">
import { Download, Operation, Refresh, Search, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import RiskTag from '@/components/RiskTag.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, riskRecords, updatedAt } from '@/mock/data'
import type { RiskRecord } from '@/types'
import { riskLabel } from '@/utils/format'

const router = useRouter()
const level = ref('全部等级')
const status = ref('全部状态')
const region = ref('全部区域')
const keyword = ref('')
const page = ref(1)
const pageSize = 6
const selectedRows = ref<RiskRecord[]>([])
const loading = ref(false)

const filteredRisks = computed(() =>
  riskRecords.filter((item) => {
    const levelMatch = level.value === '全部等级' || riskLabel(item.level) === level.value
    const statusMatch = status.value === '全部状态' ||
      (status.value === '待处置' && ['NEW', 'CONFIRMED'].includes(item.status)) ||
      (status.value === '处置中' && item.status === 'PROCESSING') ||
      (status.value === '已闭合' && ['RESOLVED', 'IGNORED', 'CLOSED'].includes(item.status))
    const regionMatch = region.value === '全部区域' || item.region === region.value
    const query = keyword.value.trim()
    const queryMatch =
      !query ||
      item.title.includes(query) ||
      item.enterprise.includes(query) ||
      item.id.toLowerCase().includes(query.toLowerCase())
    return levelMatch && statusMatch && regionMatch && queryMatch
  }),
)

const pagedRisks = computed(() =>
  filteredRisks.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)

function refresh() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('风险清单已刷新')
  }, 500)
}

function batchHandle() {
  if (!selectedRows.value.length) {
    ElMessage.warning('请先选择需要处置的风险')
    return
  }
  ElMessage.success(`已创建 ${selectedRows.value.length} 条风险的批量处置任务`)
}

function exportRisks() {
  ElMessage.success('风险清单导出任务已创建')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="风险预警清单"
      description="按风险类型、等级、区域与处置状态检索风险事件，支持分级筛选、批量处置与转风险研判。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="refresh">刷新</el-button>
        <el-button :icon="Download" @click="exportRisks">导出清单</el-button>
        <el-button type="primary" :icon="Operation" @click="batchHandle">批量处置</el-button>
      </template>
    </PageHeader>

    <div class="risk-kpis">
      <div class="risk-kpi is-critical">
        <span>重大风险</span>
        <strong>1</strong>
        <em>需 4 小时内确认</em>
      </div>
      <div class="risk-kpi is-high">
        <span>高风险</span>
        <strong>2</strong>
        <em>较上周 +1</em>
      </div>
      <div class="risk-kpi is-mid">
        <span>处置中</span>
        <strong>3</strong>
        <em>平均处置 18 小时</em>
      </div>
      <div class="risk-kpi is-closed">
        <span>本月已闭合</span>
        <strong>27</strong>
        <em>闭环率 87.1%</em>
      </div>
      <div class="risk-kpi-note">
        <el-icon><Warning /></el-icon>
        <div>
          <strong>风险变化提示</strong>
          <span>供应链与技术依赖类风险连续两周上升，建议优先开展重点节点排查。</span>
        </div>
      </div>
    </div>

    <FilterBar label="筛选条件">
      <el-select v-model="level" style="width: 122px">
        <el-option label="全部等级" value="全部等级" />
        <el-option label="重大" value="重大" />
        <el-option label="高风险" value="高风险" />
        <el-option label="较高" value="较高" />
        <el-option label="一般" value="一般" />
      </el-select>
      <el-select v-model="status" style="width: 120px">
        <el-option label="全部状态" value="全部状态" />
        <el-option label="待处置" value="待处置" />
        <el-option label="处置中" value="处置中" />
        <el-option label="已闭合" value="已闭合" />
      </el-select>
      <el-select v-model="region" style="width: 120px">
        <el-option label="全部区域" value="全部区域" />
        <el-option label="海淀区" value="海淀区" />
        <el-option label="经开区" value="经开区" />
        <el-option label="朝阳区" value="朝阳区" />
        <el-option label="大兴区" value="大兴区" />
        <el-option label="昌平区" value="昌平区" />
      </el-select>
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        placeholder="搜索风险、企业或编号"
        clearable
        style="width: 230px"
      />
      <template #extra>
        <span class="status-line">已筛选 {{ filteredRisks.length }} 条</span>
      </template>
    </FilterBar>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">风险事件</h2>
          <p class="section-subtitle">按风险等级、发现时间及业务影响排序</p>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="pagedRisks"
        row-key="id"
        @selection-change="(rows) => (selectedRows = rows)"
        @row-click="(row) => router.push(`/monitoring/risks/${row.id}`)"
      >
        <el-table-column type="selection" width="46" />
        <el-table-column label="风险事件" min-width="290">
          <template #default="{ row }">
            <div class="risk-title-cell">
              <RiskTag :level="row.level" />
              <div>
                <strong>{{ row.title }}</strong>
                <span>{{ row.id }} · {{ row.type }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="enterprise" label="关联企业" min-width="180" />
        <el-table-column prop="region" label="区域" width="82" />
        <el-table-column prop="chainNode" label="产业链节点" width="110" />
        <el-table-column label="风险评分" width="105" align="center">
          <template #default="{ row }">
            <div class="score-cell">
              <strong :class="{ 'is-high': row.score >= 80 }">{{ row.score }}</strong>
              <span><i :style="{ width: `${row.score}%` }" /></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="变化" width="72" align="center">
          <template #default="{ row }">
            <span :class="row.trend === 'up' ? 'text-down' : row.trend === 'down' ? 'text-up' : 'text-muted'">
              {{ row.trend === 'up' ? '↑ 上升' : row.trend === 'down' ? '↓ 下降' : '— 平稳' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="detectedAt" label="发现时间" width="135" />
        <el-table-column label="操作" width="90" fixed="right" align="right">
          <template #default="{ row }">
            <el-button text size="small" @click.stop="router.push(`/monitoring/risks/${row.id}`)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <PaginationBar
          :page="page"
          :size="pageSize"
          :total="filteredRisks.length"
          @update:page="page = $event"
        />
      </template>
    </DataCard>

    <div class="risk-footer-grid">
      <DataCard title="处置效率" subtitle="近 30 天风险响应与闭环">
        <div class="response-grid">
          <div><span>平均首次响应</span><strong>2.4<small>小时</small></strong></div>
          <div><span>平均闭环耗时</span><strong>18.6<small>小时</small></strong></div>
          <div><span>超时任务</span><strong>1<small>条</small></strong></div>
          <div><span>闭环率</span><strong>87.1<small>%</small></strong></div>
        </div>
      </DataCard>
      <DataCard title="风险类型分布" subtitle="本月未关闭风险">
        <div class="risk-type-list">
          <div><span>供应链风险</span><i><b style="width: 78%" /></i><em>4</em></div>
          <div><span>技术依赖</span><i><b style="width: 54%" /></i><em>3</em></div>
          <div><span>经营/财务</span><i><b style="width: 42%" /></i><em>2</em></div>
          <div><span>合规与项目</span><i><b style="width: 28%" /></i><em>1</em></div>
        </div>
      </DataCard>
    </div>

    <div class="data-footnote">
      <span>风险等级：R1 低、R2 一般、R3 较高、R4 高、R5 重大。</span>
      <span>处置操作全部记录操作人、时间与审计追踪号。</span>
    </div>
  </div>
</template>

<style scoped>
.risk-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 0.6fr)) minmax(280px, 1.45fr);
  gap: 1px;
  overflow: hidden;
  background: #e5ebf3;
  border: 1px solid #e5ebf3;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.risk-kpi {
  padding: 15px 17px;
  background: #fff;
}

.risk-kpi span,
.risk-kpi strong,
.risk-kpi em {
  display: block;
}

.risk-kpi span {
  color: #7c899c;
  font-size: 9px;
}

.risk-kpi strong {
  margin: 4px 0 2px;
  color: #263a53;
  font-size: 25px;
  font-weight: 620;
}

.risk-kpi em {
  color: #929dac;
  font-size: 8px;
  font-style: normal;
}

.risk-kpi.is-critical strong {
  color: #c63d45;
}

.risk-kpi.is-high strong {
  color: #d36c2f;
}

.risk-kpi.is-mid strong {
  color: #c18a17;
}

.risk-kpi.is-closed strong {
  color: #0a9275;
}

.risk-kpi-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 17px;
  color: #6b7e94;
  background: #f8fbfe;
}

.risk-kpi-note > .el-icon {
  flex-shrink: 0;
  color: #d69022;
  font-size: 21px;
}

.risk-kpi-note strong,
.risk-kpi-note span {
  display: block;
}

.risk-kpi-note strong {
  margin-bottom: 3px;
  color: #4b6079;
  font-size: 9.5px;
  font-weight: 580;
}

.risk-kpi-note span {
  color: #8592a4;
  font-size: 8.5px;
  line-height: 1.55;
}

.risk-title-cell {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  cursor: pointer;
}

.risk-title-cell > div {
  min-width: 0;
}

.risk-title-cell strong,
.risk-title-cell span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-title-cell strong {
  color: #33445b;
  font-size: 10.5px;
  font-weight: 550;
}

.risk-title-cell span {
  margin-top: 3px;
  color: #929dad;
  font-size: 8px;
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-cell strong {
  min-width: 20px;
  color: #607187;
  font-size: 9px;
}

.score-cell strong.is-high {
  color: #c64249;
}

.score-cell span {
  width: 38px;
  height: 4px;
  overflow: hidden;
  background: #edf1f6;
  border-radius: 4px;
}

.score-cell i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #e6a34d, #df4f56);
  border-radius: 4px;
}

.risk-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.response-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e9eef5;
  border: 1px solid #e9eef5;
  border-radius: 8px;
}

.response-grid > div {
  padding: 12px;
  background: #f9fbfd;
}

.response-grid span,
.response-grid strong {
  display: block;
}

.response-grid span {
  color: #8794a5;
  font-size: 8px;
}

.response-grid strong {
  margin-top: 4px;
  color: #33495f;
  font-size: 19px;
  font-weight: 620;
}

.response-grid small {
  margin-left: 2px;
  color: #8f9baa;
  font-size: 8px;
}

.risk-type-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.risk-type-list > div {
  display: grid;
  grid-template-columns: 82px 1fr 20px;
  align-items: center;
  gap: 9px;
}

.risk-type-list span {
  color: #5f6f84;
  font-size: 9px;
}

.risk-type-list i {
  height: 5px;
  overflow: hidden;
  background: #eef2f7;
  border-radius: 5px;
}

.risk-type-list b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #5a94db, #1769e0);
  border-radius: 5px;
}

.risk-type-list em {
  color: #7e8b9d;
  font-size: 9px;
  font-style: normal;
  text-align: right;
}

@media (max-width: 1050px) {
  .risk-kpis {
    grid-template-columns: repeat(4, 1fr);
  }

  .risk-kpi-note {
    display: none;
  }
}

@media (max-width: 800px) {
  .risk-kpis {
    grid-template-columns: 1fr 1fr;
  }

  .risk-footer-grid {
    grid-template-columns: 1fr;
  }

  .response-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
