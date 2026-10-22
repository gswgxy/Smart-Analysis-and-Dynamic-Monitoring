<script setup lang="ts">
import { Refresh, Right, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import RiskTag from '@/components/RiskTag.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, reviewTasks, updatedAt } from '@/mock/data'

const router = useRouter()
const keyword = ref('')
const priority = ref('全部优先级')
const status = ref('全部状态')
const tasks = ref(reviewTasks.map((item) => ({ ...item })))

const filtered = computed(() =>
  tasks.value.filter((item) => {
    const query = keyword.value.trim()
    const queryMatch = !query || item.title.includes(query) || item.id.includes(query)
    const priorityMatch = priority.value === '全部优先级' || item.priority === priority.value
    const statusMatch = status.value === '全部状态' || item.status === status.value
    return queryMatch && priorityMatch && statusMatch
  }),
)

function claim(id: string) {
  const task = tasks.value.find((item) => item.id === id)
  if (task) task.status = 'REVIEWING'
  ElMessage.success('任务已领取，正在打开审核工作台')
  router.push(`/reviews/workbench/${id}`)
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="待审核任务"
      description="查看分配给本人或可领取的审核任务，按优先级、截止时间和风险等级安排审核工作。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh" @click="ElMessage.success('待审核任务已刷新')">刷新</el-button>
      </template>
    </PageHeader>

    <div class="review-summary">
      <div class="is-urgent"><span>紧急任务</span><strong>1</strong><em>需今日 20:00 前完成</em></div>
      <div><span>待领取</span><strong>2</strong><em>可自行领取</em></div>
      <div><span>审核中</span><strong>2</strong><em>已分配给我</em></div>
      <div><span>今日已完成</span><strong>3</strong><em>平均用时 1.8 小时</em></div>
      <div class="review-summary-note">
        <strong>审核提示</strong>
        <span>高风险和低可信度结果必须逐条核对证据，并在审核意见中说明限制。</span>
      </div>
    </div>

    <FilterBar label="筛选任务">
      <el-input v-model="keyword" :prefix-icon="Search" placeholder="搜索任务或报告名称" clearable style="width: 250px" />
      <el-select v-model="priority" style="width: 125px">
        <el-option label="全部优先级" value="全部优先级" />
        <el-option label="紧急" value="紧急" />
        <el-option label="高" value="高" />
        <el-option label="中" value="中" />
        <el-option label="低" value="低" />
      </el-select>
      <el-select v-model="status" style="width: 125px">
        <el-option label="全部状态" value="全部状态" />
        <el-option label="已提交" value="SUBMITTED" />
        <el-option label="审核中" value="REVIEWING" />
      </el-select>
      <template #extra>
        <span class="status-line">共 {{ filtered.length }} 个任务</span>
      </template>
    </FilterBar>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">审核任务列表</h2>
          <p class="section-subtitle">按优先级与截止时间排序</p>
        </div>
      </template>
      <el-table :data="filtered">
        <el-table-column label="任务" min-width="310">
          <template #default="{ row }">
            <button class="task-title" type="button" @click="router.push(`/reviews/workbench/${row.id}`)">
              <span class="task-icon">审</span>
              <div><strong>{{ row.title }}</strong><small>{{ row.id }} · {{ row.type }}</small></div>
            </button>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="95" align="center">
          <template #default="{ row }"><RiskTag :level="row.risk" compact /></template>
        </el-table-column>
        <el-table-column label="优先级" width="85" align="center">
          <template #default="{ row }">
            <span class="priority-tag" :class="{ 'is-urgent': ['紧急', '高'].includes(row.priority) }">
              {{ row.priority }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="可信度" width="75">
          <template #default="{ row }"><TrustBadge :level="row.trust" :show-label="false" /></template>
        </el-table-column>
        <el-table-column prop="evidenceCount" label="证据" width="65" align="right" />
        <el-table-column prop="submitter" label="提交人" width="80" />
        <el-table-column prop="submittedAt" label="提交时间" width="140" />
        <el-table-column label="截止时间" width="140">
          <template #default="{ row }">
            <span :class="{ 'text-down': row.priority === '紧急' }">{{ row.deadline }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" width="125" fixed="right" align="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'SUBMITTED'" type="primary" plain size="small" @click="claim(row.id)">
              领取
            </el-button>
            <el-button v-else text size="small" @click="router.push(`/reviews/workbench/${row.id}`)">
              继续审核
              <el-icon><Right /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="review-footnote">
      <span>审核任务领取后锁定 2 小时，超时自动释放。</span>
      <span>所有审核意见、证据查看和操作时间均记录在审核档案中。</span>
    </div>
  </div>
</template>

<style scoped>
.review-summary {
  display: grid;
  grid-template-columns: repeat(4, 0.62fr) minmax(260px, 1.3fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.review-summary > div {
  padding: 14px 16px;
  background: #fff;
}

.review-summary span,
.review-summary strong,
.review-summary em {
  display: block;
}

.review-summary > div > span {
  color: #8794a6;
  font-size: 8px;
}

.review-summary > div > strong {
  margin: 3px 0 1px;
  color: #2e435b;
  font-size: 22px;
  font-weight: 620;
}

.review-summary em {
  color: #98a3b2;
  font-size: 7px;
  font-style: normal;
}

.review-summary .is-urgent > strong {
  color: #c3474e;
}

.review-summary-note {
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: #f8fbfe !important;
}

.review-summary-note strong {
  color: #48637f !important;
  font-size: 8.5px !important;
}

.review-summary-note span {
  margin-top: 4px;
  color: #8391a3;
  font-size: 7.5px;
  line-height: 1.5;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.task-icon {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #54789e;
  background: #edf4fb;
  border-radius: 7px;
  font-family: "Songti SC", serif;
  font-size: 10px;
}

.task-title strong,
.task-title small {
  display: block;
}

.task-title strong {
  color: #3a4e66;
  font-size: 9.5px;
  font-weight: 550;
}

.task-title small {
  margin-top: 2px;
  color: #98a3b2;
  font-size: 7px;
}

.priority-tag {
  padding: 2px 6px;
  color: #64758a;
  background: #f1f4f8;
  border-radius: 4px;
  font-size: 7px;
}

.priority-tag.is-urgent {
  color: #b33c43;
  background: #fff0f1;
}

.review-footnote {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  color: #929dac;
  font-size: 7px;
}

@media (max-width: 1000px) {
  .review-summary {
    grid-template-columns: repeat(4, 1fr);
  }

  .review-summary-note {
    display: none;
  }
}

@media (max-width: 650px) {
  .review-summary {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
