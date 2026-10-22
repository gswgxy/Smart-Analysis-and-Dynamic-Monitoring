<script setup lang="ts">
import { Bell, Check, Delete, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import DataCard from '@/components/DataCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { notifications as notificationData } from '@/mock/data'

const router = useRouter()
const items = ref(notificationData.map((item) => ({ ...item })))
const activeType = ref('全部')
const showUnread = ref(false)

const filtered = computed(() =>
  items.value.filter((item) => {
    const typeMatch = activeType.value === '全部' || item.type === activeType.value
    const readMatch = !showUnread.value || !item.read
    return typeMatch && readMatch
  }),
)

const unreadCount = computed(() => items.value.filter((item) => !item.read).length)

function markAllRead() {
  items.value.forEach((item) => (item.read = true))
  ElMessage.success('全部通知已标记为已读')
}

function remove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
  ElMessage.success('通知已删除')
}

function openNotification(item: (typeof items.value)[number]) {
  item.read = true
  if (item.type === '风险') router.push('/monitoring/risks')
  else if (item.type === '审核') router.push('/reviews/tasks')
  else if (item.type === '报告') router.push('/reports')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="通知中心"
      description="汇集风险、审核、报告、任务与系统通知，支持按类型筛选、已读管理和订阅设置。"
    >
      <template #badge>
        <span class="unread-badge">{{ unreadCount }} 条未读</span>
      </template>
      <template #actions>
        <el-button :icon="Check" @click="markAllRead">全部已读</el-button>
        <el-button :icon="Setting">通知设置</el-button>
      </template>
    </PageHeader>

    <div class="notification-layout">
      <aside class="notification-filter">
        <div class="notification-filter__head">
          <strong>通知分类</strong>
          <span>{{ items.length }} 条</span>
        </div>
        <button
          v-for="item in ['全部', '风险', '审核', '报告', '系统']"
          :key="item"
          type="button"
          :class="{ 'is-active': activeType === item }"
          @click="activeType = item"
        >
          <el-icon><Bell /></el-icon>
          <span>{{ item }}</span>
          <em>{{ item === '全部' ? items.length : items.filter((x) => x.type === item).length }}</em>
        </button>
        <div class="filter-divider" />
        <el-checkbox v-model="showUnread">仅看未读</el-checkbox>
      </aside>

      <DataCard :padded="false">
        <template #header>
          <div>
            <h2 class="section-title">{{ activeType === '全部' ? '全部通知' : `${activeType}通知` }}</h2>
            <p class="section-subtitle">{{ showUnread ? '仅显示未读通知' : '按时间倒序排列' }}</p>
          </div>
        </template>
        <div class="notification-list">
          <button
            v-for="item in filtered"
            :key="item.id"
            type="button"
            class="notification-item"
            :class="{ 'is-unread': !item.read }"
            @click="openNotification(item)"
          >
            <span class="notification-icon" :class="`is-${item.tone}`">
              <el-icon><Bell /></el-icon>
            </span>
            <div class="notification-copy">
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.type }}</span>
              </div>
              <p>{{ item.content }}</p>
              <small>{{ item.time }}</small>
            </div>
            <el-button
              text
              size="small"
              :icon="Delete"
              @click.stop="remove(item.id)"
            />
          </button>
          <div v-if="!filtered.length" class="notification-empty">暂无符合条件的通知</div>
        </div>
      </DataCard>

      <aside class="notification-side">
        <DataCard title="订阅设置" subtitle="选择需要接收的通知">
          <div class="subscription-list">
            <div><span>高风险预警</span><el-switch :model-value="true" size="small" /></div>
            <div><span>审核任务</span><el-switch :model-value="true" size="small" /></div>
            <div><span>报告状态</span><el-switch :model-value="true" size="small" /></div>
            <div><span>系统任务</span><el-switch :model-value="false" size="small" /></div>
            <div><span>数据更新</span><el-switch :model-value="false" size="small" /></div>
          </div>
        </DataCard>
        <DataCard title="通知渠道" subtitle="当前账号已启用">
          <div class="channel-list">
            <div><span>站内消息</span><strong>已启用</strong></div>
            <div><span>邮件通知</span><strong>已启用</strong></div>
            <div><span>短信通知</span><strong class="text-muted">未配置</strong></div>
          </div>
        </DataCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.unread-badge {
  padding: 3px 7px;
  color: #b43c43;
  background: #fff0f1;
  border-radius: 999px;
  font-size: 8px;
}

.notification-layout {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr) 240px;
  align-items: start;
  gap: 16px;
}

.notification-filter {
  padding: 12px;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.notification-filter__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 9px;
  border-bottom: 1px solid #edf1f6;
}

.notification-filter__head strong {
  color: #3e5168;
  font-size: 9px;
  font-weight: 600;
}

.notification-filter__head span {
  color: #9ba5b3;
  font-size: 6.5px;
}

.notification-filter > button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 7px;
  padding: 8px;
  margin-top: 3px;
  color: #607086;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 5px;
  font-size: 8px;
  cursor: pointer;
}

.notification-filter > button:hover,
.notification-filter > button.is-active {
  color: #1769e0;
  background: #f1f6fd;
}

.notification-filter button span {
  flex: 1;
}

.notification-filter button em {
  color: #99a4b2;
  font-size: 6.5px;
  font-style: normal;
}

.filter-divider {
  height: 1px;
  margin: 10px 0;
  background: #edf1f6;
}

.notification-filter :deep(.el-checkbox__label) {
  color: #7a889b;
  font-size: 7.5px;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  text-align: left;
  background: #fff;
  border: 0;
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
}

.notification-item:hover,
.notification-item.is-unread {
  background: #f8fbff;
}

.notification-item.is-unread {
  box-shadow: inset 3px 0 0 #1769e0;
}

.notification-icon {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #607c99;
  background: #eff4f9;
  border-radius: 8px;
  font-size: 13px;
}

.notification-icon.is-danger {
  color: #c2464d;
  background: #fff0f1;
}

.notification-icon.is-primary {
  color: #1769e0;
  background: #edf4ff;
}

.notification-icon.is-success {
  color: #0a9275;
  background: #eaf8f4;
}

.notification-copy {
  min-width: 0;
  flex: 1;
}

.notification-copy > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.notification-copy strong {
  color: #364a62;
  font-size: 9px;
  font-weight: 560;
}

.notification-copy div span {
  padding: 1px 4px;
  color: #667f9a;
  background: #f0f4f8;
  border-radius: 3px;
  font-size: 6px;
}

.notification-copy p {
  margin: 4px 0;
  color: #7b899b;
  font-size: 8px;
  line-height: 1.55;
}

.notification-copy small {
  color: #9ba5b3;
  font-size: 6.5px;
}

.notification-empty {
  padding: 50px;
  color: #98a3b1;
  font-size: 8px;
  text-align: center;
}

.notification-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.subscription-list,
.channel-list {
  display: flex;
  flex-direction: column;
}

.subscription-list > div,
.channel-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #edf1f6;
}

.subscription-list > div:last-child,
.channel-list > div:last-child {
  border-bottom: 0;
}

.subscription-list span,
.channel-list span {
  color: #617187;
  font-size: 8px;
}

.channel-list strong {
  color: #0a8a71;
  font-size: 7px;
  font-weight: 520;
}

@media (max-width: 1050px) {
  .notification-layout {
    grid-template-columns: 160px minmax(0, 1fr);
  }

  .notification-side {
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .notification-layout {
    grid-template-columns: 1fr;
  }

  .notification-filter,
  .notification-side {
    grid-column: auto;
  }

  .notification-side {
    grid-template-columns: 1fr;
  }
}
</style>
