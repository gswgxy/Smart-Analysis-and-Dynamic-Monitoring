<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    compact?: boolean
  }>(),
  {
    title: '暂无可展示的数据',
    description: '可以调整筛选条件后重试，或稍后再来查看。',
    compact: false,
  },
)
</script>

<template>
  <div class="empty-state" :class="{ 'is-compact': compact }">
    <div class="empty-state__mark">
      <el-icon><DocumentRemove /></el-icon>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  min-height: 250px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 32px 20px;
  text-align: center;
}

.empty-state.is-compact {
  min-height: 160px;
}

.empty-state__mark {
  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  color: #9aabc1;
  background: #f4f7fb;
  border-radius: 16px;
  font-size: 24px;
}

h3 {
  margin: 14px 0 5px;
  color: #394a63;
  font-size: 14px;
  font-weight: 600;
}

p {
  max-width: 380px;
  margin: 0;
  color: #8a96a8;
  font-size: 12px;
  line-height: 1.6;
}
</style>
