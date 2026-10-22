<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: '筛选' })
</script>

<template>
  <div class="filter-bar">
    <span class="filter-bar__label">{{ label }}</span>
    <slot />
    <span v-if="$slots.extra" class="filter-spacer" />
    <slot name="extra" />
  </div>
</template>
