<script setup lang="ts">
import type { EvidenceItem } from '@/types'

defineProps<{
  modelValue: boolean
  evidence: EvidenceItem[]
  title?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="title || '证据与数据来源'"
    size="min(520px, 92vw)"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="evidence-intro">
      <el-icon><DocumentChecked /></el-icon>
      <span>关键结论已绑定证据。证据访问受数据权限控制，支持回溯原始来源。</span>
    </div>
    <div v-if="evidence.length" class="evidence-list">
      <article v-for="item in evidence" :key="item.id" class="evidence-item">
        <div class="evidence-item__top">
          <div>
            <span class="evidence-item__type">{{ item.sourceType }}</span>
            <h3>{{ item.title }}</h3>
          </div>
          <TrustBadge :level="item.trustLevel" :show-label="false" />
        </div>
        <blockquote>{{ item.snippet }}</blockquote>
        <div class="evidence-item__meta">
          <span>{{ item.source }}</span>
          <span>{{ item.publishedAt }}</span>
          <span class="mono">{{ item.id }}</span>
        </div>
        <div class="evidence-item__actions">
          <el-button size="small" plain>
            <el-icon><Link /></el-icon>
            打开原始来源
          </el-button>
          <el-button size="small" text>复制引用</el-button>
        </div>
      </article>
    </div>
    <EmptyState v-else compact title="暂无证据" description="该结论尚未关联可展示的证据来源。" />
    <template #footer>
      <div class="drawer-footer">
        <span>共 {{ evidence.length }} 条证据</span>
        <el-button @click="$emit('update:modelValue', false)">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.evidence-intro {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px;
  margin-bottom: 16px;
  color: #52708f;
  background: #f3f8fe;
  border: 1px solid #dfeafa;
  border-radius: 9px;
  font-size: 12px;
  line-height: 1.6;
}

.evidence-intro .el-icon {
  margin-top: 2px;
  color: var(--dip-blue);
  font-size: 16px;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-item {
  padding: 15px;
  border: 1px solid var(--dip-line);
  border-radius: 11px;
}

.evidence-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.evidence-item__type {
  display: inline-block;
  margin-bottom: 5px;
  padding: 2px 6px;
  color: #52677f;
  background: #f0f4f8;
  border-radius: 4px;
  font-size: 10px;
}

.evidence-item h3 {
  margin: 0;
  color: #25364e;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

blockquote {
  padding: 10px 12px;
  margin: 11px 0;
  color: #617186;
  background: #f8fafc;
  border-left: 3px solid #b5c9e6;
  font-size: 12px;
  line-height: 1.7;
}

.evidence-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  color: #8995a6;
  font-size: 11px;
}

.evidence-item__actions {
  display: flex;
  gap: 4px;
  margin-top: 11px;
}

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8793a5;
  font-size: 12px;
}
</style>
