<script setup lang="ts">
import { DocumentAdd, Download, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, reports, updatedAt } from '@/mock/data'

const router = useRouter()
const keyword = ref('')
const type = ref('全部类型')
const status = ref('全部状态')
const page = ref(1)
const pageSize = 8

const filteredReports = computed(() =>
  reports.filter((item) => {
    const typeMatch = type.value === '全部类型' || item.type === type.value
    const statusMatch = status.value === '全部状态' || item.status === status.value
    const query = keyword.value.trim()
    const queryMatch = !query || item.title.includes(query) || item.id.includes(query)
    return typeMatch && statusMatch && queryMatch
  }),
)

const pagedReports = computed(() =>
  filteredReports.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)

function exportList() {
  ElMessage.success('报告清单导出任务已创建')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="报告管理"
      description="统一管理历史报告、版本、审核状态和导出记录，支持按类型、产业、创建人检索。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Download" @click="exportList">导出清单</el-button>
        <el-button type="primary" :icon="DocumentAdd" @click="router.push('/reports/generate')">
          新建报告
        </el-button>
      </template>
    </PageHeader>

    <div class="report-stats">
      <div><span>报告总数</span><strong>36</strong><em>本月新增 8 份</em></div>
      <div><span>审核中</span><strong>4</strong><em>其中 1 份即将超时</em></div>
      <div><span>已发布</span><strong>27</strong><em>发布率 75%</em></div>
      <div><span>平均审核时长</span><strong>18.6<small>小时</small></strong><em>较上月 -3.2 小时</em></div>
      <div class="report-stats-note">
        <strong>报告质量提示</strong>
        <span>本周 2 份报告因证据不足被退回，请在生成前确认分析结果可信度。</span>
      </div>
    </div>

    <FilterBar label="检索条件">
      <el-input v-model="keyword" :prefix-icon="Search" placeholder="搜索报告名称或编号" clearable style="width: 240px" />
      <el-select v-model="type" style="width: 130px">
        <el-option label="全部类型" value="全部类型" />
        <el-option label="产业月报" value="产业月报" />
        <el-option label="风险专题" value="风险专题" />
        <el-option label="区域分析" value="区域分析" />
        <el-option label="韧性评估" value="韧性评估" />
      </el-select>
      <el-select v-model="status" style="width: 130px">
        <el-option label="全部状态" value="全部状态" />
        <el-option label="审核中" value="REVIEWING" />
        <el-option label="已提交" value="SUBMITTED" />
        <el-option label="已发布" value="PUBLISHED" />
        <el-option label="审核通过" value="APPROVED" />
        <el-option label="退回修改" value="RETURNED" />
      </el-select>
      <el-date-picker model-value="近30天" type="daterange" style="width: 210px" />
      <template #extra>
        <span class="status-line">共 {{ filteredReports.length }} 份报告</span>
      </template>
    </FilterBar>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">报告列表</h2>
          <p class="section-subtitle">按最近更新时间排序</p>
        </div>
      </template>
      <el-table :data="pagedReports">
        <el-table-column label="报告名称" min-width="300">
          <template #default="{ row }">
            <button class="report-name" type="button" @click="router.push(`/reports/detail/${row.id}`)">
              <span class="report-doc">R</span>
              <div>
                <strong>{{ row.title }}</strong>
                <small>{{ row.id }} · {{ row.industry }}</small>
              </div>
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="version" label="版本" width="75" />
        <el-table-column label="可信度" width="85">
          <template #default="{ row }"><TrustBadge :level="row.trust" :show-label="false" /></template>
        </el-table-column>
        <el-table-column label="状态" width="105">
          <template #default="{ row }"><StatusBadge :status="row.status" /></template>
        </el-table-column>
        <el-table-column prop="author" label="创建人" width="85" />
        <el-table-column prop="updatedAt" label="更新时间" width="145" />
        <el-table-column label="操作" width="130" align="right">
          <template #default="{ row }">
            <el-button text size="small" @click="router.push(`/reports/detail/${row.id}`)">查看</el-button>
            <el-button text size="small" @click="router.push(`/reports/editor/${row.id}`)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <PaginationBar
          :page="page"
          :size="pageSize"
          :total="filteredReports.length"
          @update:page="page = $event"
        />
      </template>
    </DataCard>
  </div>
</template>

<style scoped>
.report-stats {
  display: grid;
  grid-template-columns: repeat(4, 0.62fr) minmax(260px, 1.3fr);
  gap: 1px;
  overflow: hidden;
  background: #e6edf4;
  border: 1px solid #e6edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.report-stats > div {
  padding: 14px 16px;
  background: #fff;
}

.report-stats span,
.report-stats strong,
.report-stats em {
  display: block;
}

.report-stats > div > span {
  color: #8693a5;
  font-size: 8px;
}

.report-stats > div > strong {
  margin: 3px 0 1px;
  color: #2f445c;
  font-size: 22px;
  font-weight: 620;
}

.report-stats small {
  margin-left: 2px;
  color: #8c98a8;
  font-size: 8px;
}

.report-stats em {
  color: #96a1b0;
  font-size: 7px;
  font-style: normal;
}

.report-stats-note {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #f8fbfe !important;
}

.report-stats-note strong {
  color: #48637f !important;
  font-size: 8.5px !important;
}

.report-stats-note span {
  margin-top: 4px;
  color: #8391a3;
  font-size: 7.5px;
  line-height: 1.5;
}

.report-name {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.report-doc {
  display: flex;
  width: 29px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #4c79a5;
  background: #edf4fb;
  border: 1px solid #dce8f4;
  border-radius: 4px;
  font-family: Georgia, serif;
  font-size: 10px;
}

.report-name strong,
.report-name small {
  display: block;
}

.report-name strong {
  color: #3b4e65;
  font-size: 9.5px;
  font-weight: 550;
}

.report-name small {
  margin-top: 2px;
  color: #98a3b2;
  font-size: 7px;
}

@media (max-width: 1000px) {
  .report-stats {
    grid-template-columns: repeat(4, 1fr);
  }

  .report-stats-note {
    display: none;
  }
}

@media (max-width: 650px) {
  .report-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
