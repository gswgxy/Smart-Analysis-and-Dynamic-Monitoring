<script setup lang="ts">
import type { TrustLevel } from '@/types'
import { trustColor, trustLabel } from '@/utils/format'

withDefaults(
  defineProps<{
    level: TrustLevel
    showLabel?: boolean
  }>(),
  { showLabel: true },
)
</script>

<template>
  <el-tooltip :content="`可信度 ${level}：${trustLabel(level)}`" placement="top">
    <span class="trust-badge" :style="{ '--trust-color': trustColor(level) }">
      <span class="trust-badge__mark">{{ level }}</span>
      <span v-if="showLabel">{{ trustLabel(level) }}</span>
    </span>
  </el-tooltip>
</template>

<style scoped>
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 160px;
  color: var(--trust-color);
  font-size: 12px;
  font-weight: 550;
  line-height: 1.4;
}

.trust-badge__mark {
  display: inline-flex;
  width: 21px;
  height: 21px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--trust-color);
  border-radius: 50%;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
  font-weight: 700;
}
</style>
