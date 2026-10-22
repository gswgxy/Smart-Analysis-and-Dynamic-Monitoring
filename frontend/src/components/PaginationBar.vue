<script setup lang="ts">
defineProps<{
  page: number
  size: number
  total: number
}>()

defineEmits<{
  'update:page': [value: number]
}>()
</script>

<template>
  <div class="pagination-bar">
    <span>共 {{ total }} 条记录</span>
    <el-pagination
      :current-page="page"
      :page-size="size"
      :total="total"
      layout="prev, pager, next"
      background
      small
      @current-change="$emit('update:page', $event)"
    />
  </div>
</template>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #8390a3;
  font-size: 12px;
}
</style>
