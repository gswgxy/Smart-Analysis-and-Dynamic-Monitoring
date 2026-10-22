<script setup lang="ts">
import { Download, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, reviewRecords, updatedAt } from '@/mock/data'

const router = useRouter()
const keyword = ref('')
const decision = ref('全部结论')

const filtered = computed(() =>
  reviewRecords.filter((item) => {
    const query = keyword.value.trim()
    const queryMatch = !query || item.title.includes(query) || item.id.includes(query)
    const decisionMatch = decision.value === '全部结论' || item.decision === decision.value
    return queryMatch && decisionMatch
  }),
)
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="审核记录"
      description="查看历史审核结论、专家意见和版本记录。审核记录不可删除，支持导出与追踪。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Download" @click="ElMessage.success('审核记录导出任务已创建')">导出记录</el-button>
      </template>
    </PageHeader>

    <div class="record-stats">
      <div><span>本月审核</span><strong>28<small>项</small></strong><em>通过 22 · 退回 6</em></div>
      <div><span>通过率</span><strong>78.6<small>%</small></strong><em>较上月 +4.2%</em></div>
      <div><span>平均审核时长</span><strong>2.4<small>小时</small></strong><em>较上月 -0.6 小时</em></div>
      <div><span>平均意见数</span><strong>5.8<small>条</small></strong><em>逐条可追溯</em></div>
    </div>

    <FilterBar label="筛选记录">
      <el-input v-model="keyword" :prefix-icon="Search" placeholder="搜索审核对象或编号" clearable style="width: 250px" />
      <el-select v-model="decision" style="width: 130px">
        <el-option label="全部结论" value="全部结论" />
        <el-option label="审核通过" value="APPROVED" />
        <el-option label="退回修改" value="RETURNED" />
      </el-select>
      <el-date-picker model-value="2026-10" type="month" style="width: 140px" />
      <template #extra>
        <span class="status-line">共 {{ filtered.length }} 条记录</span>
      </template>
    </FilterBar>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">审核档案</h2>
          <p class="section-subtitle">审核结论与意见永久留存</p>
        </div>
      </template>
      <el-table :data="filtered">
        <el-table-column label="审核对象" min-width="330">
          <template #default="{ row }">
            <div class="record-title">
              <span>档</span>
              <div><strong>{{ row.title }}</strong><small>{{ row.id }}</small></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="reviewer" label="审核人" width="90" />
        <el-table-column label="结论" width="105">
          <template #default="{ row }"><StatusBadge :status="row.decision" /></template>
        </el-table-column>
        <el-table-column prop="decidedAt" label="审核时间" width="145" />
        <el-table-column prop="duration" label="用时" width="100" />
        <el-table-column prop="comments" label="意见数" width="80" align="right" />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column label="操作" width="130" align="right">
          <template #default="{ row }">
            <el-button text size="small" @click="router.push(`/reviews/workbench/${row.id}`)">
              查看档案
            </el-button>
            <el-button text size="small" @click="ElMessage.success('审核档案 PDF 导出任务已创建')">
              导出
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="record-note">
      审核意见、原文快照、证据版本和签名信息共同构成审核档案，正式发布报告必须绑定审核记录。
    </div>
  </div>
</template>

<style scoped>
.record-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.record-stats > div {
  padding: 14px 16px;
  background: #fff;
}

.record-stats span,
.record-stats strong,
.record-stats em {
  display: block;
}

.record-stats span {
  color: #8794a6;
  font-size: 8px;
}

.record-stats strong {
  margin: 3px 0 1px;
  color: #2e435b;
  font-size: 22px;
  font-weight: 620;
}

.record-stats small {
  margin-left: 2px;
  color: #8e9aaa;
  font-size: 8px;
}

.record-stats em {
  color: #98a3b2;
  font-size: 7px;
  font-style: normal;
}

.record-title {
  display: flex;
  align-items: center;
  gap: 9px;
}

.record-title > span {
  display: flex;
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #607d99;
  background: #eef4fa;
  border-radius: 6px;
  font-family: "Songti SC", serif;
  font-size: 9px;
}

.record-title strong,
.record-title small {
  display: block;
}

.record-title strong {
  color: #3a4e66;
  font-size: 9px;
  font-weight: 550;
}

.record-title small {
  margin-top: 2px;
  color: #99a4b2;
  font-size: 7px;
}

.record-note {
  color: #929dac;
  font-size: 7.5px;
}

@media (max-width: 650px) {
  .record-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
