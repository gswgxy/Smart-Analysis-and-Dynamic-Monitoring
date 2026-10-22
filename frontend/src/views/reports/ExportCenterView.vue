<script setup lang="ts">
import { Delete, Download, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'

import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { dataVersion, updatedAt } from '@/mock/data'

interface ExportTask {
  id: string
  name: string
  type: string
  format: string
  size: string
  status: string
  progress: number
  createdBy: string
  createdAt: string
  expiresAt: string
}

const tasks = ref<ExportTask[]>([
  {
    id: 'EXP-20261018-012',
    name: '北京市人工智能产业运行月报（2026年10月）',
    type: '报告',
    format: 'PDF',
    size: '4.8 MB',
    status: 'SUCCESS',
    progress: 100,
    createdBy: '张研',
    createdAt: '2026-10-18 10:38',
    expiresAt: '2026-10-25 10:38',
  },
  {
    id: 'EXP-20261018-009',
    name: '产业运行总览指标明细',
    type: '指标数据',
    format: 'XLSX',
    size: '12.6 MB',
    status: 'RUNNING',
    progress: 68,
    createdBy: '王园',
    createdAt: '2026-10-18 10:16',
    expiresAt: '—',
  },
  {
    id: 'EXP-20261018-004',
    name: 'AI 芯片供应链风险图谱',
    type: '图谱',
    format: 'PNG',
    size: '8.2 MB',
    status: 'SUCCESS',
    progress: 100,
    createdBy: '李析',
    createdAt: '2026-10-18 09:31',
    expiresAt: '2026-10-25 09:31',
  },
  {
    id: 'EXP-20261017-018',
    name: '中关村人工智能产业集聚区发展观察',
    type: '报告',
    format: 'DOCX',
    size: '2.1 MB',
    status: 'SUCCESS',
    progress: 100,
    createdBy: '王园',
    createdAt: '2026-10-17 18:12',
    expiresAt: '2026-10-24 18:12',
  },
  {
    id: 'EXP-20261017-006',
    name: '风险预警清单全量数据',
    type: '风险数据',
    format: 'CSV',
    size: '—',
    status: 'FAILED',
    progress: 0,
    createdBy: '张研',
    createdAt: '2026-10-17 15:40',
    expiresAt: '—',
  },
])

function download(task: ExportTask) {
  if (task.status !== 'SUCCESS') {
    ElMessage.warning('文件尚未生成完成')
    return
  }
  ElMessage.success(`开始下载：${task.name}.${task.format.toLowerCase()}`)
}

function retry(task: ExportTask) {
  task.status = 'RUNNING'
  task.progress = 12
  ElMessage.success('导出任务已重新提交')
}

async function removeTask(task: ExportTask) {
  try {
    await ElMessageBox.confirm(`确认删除“${task.name}”导出文件？删除后不可恢复。`, '删除导出文件', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    tasks.value = tasks.value.filter((item) => item.id !== task.id)
    ElMessage.success('导出文件已删除')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="导出中心"
      description="统一跟踪报告、指标、图表和风险数据的导出任务，支持下载、重试与文件清理。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="RefreshRight" @click="ElMessage.success('任务状态已刷新')">刷新状态</el-button>
      </template>
    </PageHeader>

    <div class="export-stats">
      <div><span>今日导出</span><strong>12<small>次</small></strong><em>较昨日 +3</em></div>
      <div><span>进行中</span><strong>1<small>个</small></strong><em>预计 20 秒完成</em></div>
      <div><span>已完成</span><strong>10<small>个</small></strong><em>成功率 91.7%</em></div>
      <div><span>存储占用</span><strong>286<small>MB</small></strong><em>有效期 7 天</em></div>
    </div>

    <FilterBar label="筛选任务">
      <el-input :prefix-icon="Search" placeholder="搜索文件名或任务编号" style="width: 240px" />
      <el-select model-value="全部类型" style="width: 120px">
        <el-option label="全部类型" value="全部类型" />
        <el-option label="报告" value="报告" />
        <el-option label="指标数据" value="指标数据" />
        <el-option label="图谱" value="图谱" />
      </el-select>
      <el-select model-value="全部状态" style="width: 120px">
        <el-option label="全部状态" value="全部状态" />
        <el-option label="已完成" value="SUCCESS" />
        <el-option label="进行中" value="RUNNING" />
        <el-option label="失败" value="FAILED" />
      </el-select>
      <template #extra>
        <span class="status-line">文件默认保留 7 天</span>
      </template>
    </FilterBar>

    <DataCard :padded="false">
      <template #header>
        <div>
          <h2 class="section-title">导出任务</h2>
          <p class="section-subtitle">按创建时间倒序排列</p>
        </div>
      </template>
      <el-table :data="tasks">
        <el-table-column label="文件" min-width="290">
          <template #default="{ row }">
            <div class="file-cell">
              <span class="file-format">{{ row.format }}</span>
              <div><strong>{{ row.name }}</strong><small>{{ row.id }} · {{ row.type }}</small></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="90" />
        <el-table-column label="状态" width="145">
          <template #default="{ row }">
            <div class="export-status">
              <StatusBadge :status="row.status" />
              <el-progress
                v-if="row.status === 'RUNNING'"
                :percentage="row.progress"
                :show-text="false"
                :stroke-width="3"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" width="85" />
        <el-table-column prop="createdAt" label="创建时间" width="145" />
        <el-table-column prop="expiresAt" label="有效期至" width="145" />
        <el-table-column label="操作" width="170" align="right">
          <template #default="{ row }">
            <el-button
              text
              size="small"
              :icon="Download"
              :disabled="row.status !== 'SUCCESS'"
              @click="download(row)"
            >
              下载
            </el-button>
            <el-button v-if="row.status === 'FAILED'" text size="small" @click="retry(row)">
              重试
            </el-button>
            <el-button text size="small" :icon="Delete" @click="removeTask(row)" />
          </template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="export-note">
      导出文件包含敏感业务数据，系统将添加用户水印并记录下载行为。文件超过有效期后自动清理。
    </div>
  </div>
</template>

<style scoped>
.export-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  background: #e7edf4;
  border: 1px solid #e7edf4;
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.export-stats > div {
  padding: 14px 16px;
  background: #fff;
}

.export-stats span,
.export-stats strong,
.export-stats em {
  display: block;
}

.export-stats span {
  color: #8794a6;
  font-size: 8px;
}

.export-stats strong {
  margin: 3px 0 1px;
  color: #2f445c;
  font-size: 22px;
  font-weight: 620;
}

.export-stats small {
  margin-left: 2px;
  color: #8e9aaa;
  font-size: 8px;
}

.export-stats em {
  color: #98a3b2;
  font-size: 7px;
  font-style: normal;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.file-format {
  display: flex;
  width: 36px;
  height: 33px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #4f76a0;
  background: #edf4fb;
  border: 1px solid #dce8f4;
  border-radius: 5px;
  font-size: 6.5px;
  font-weight: 600;
}

.file-cell strong,
.file-cell small {
  display: block;
}

.file-cell strong {
  color: #3c5067;
  font-size: 9px;
  font-weight: 550;
}

.file-cell small {
  margin-top: 2px;
  color: #98a3b2;
  font-size: 7px;
}

.export-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.export-status :deep(.el-progress) {
  width: 92px;
}

.export-note {
  color: #8e9aaa;
  font-size: 7.5px;
}

@media (max-width: 700px) {
  .export-stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
