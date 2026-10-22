<script setup lang="ts">
import type { RiskLevel } from '@/types'
import { riskLabel, riskType } from '@/utils/format'

withDefaults(
  defineProps<{
    level: RiskLevel
    compact?: boolean
  }>(),
  { compact: false },
)
</script>

<template>
  <el-tag :type="riskType(level)" effect="light" size="small" round>
    <span class="risk-tag">
      <span class="risk-tag__code">{{ level }}</span>
      <span v-if="!compact">{{ riskLabel(level) }}</span>
    </span>
  </el-tag>
</template>

<style scoped>
.risk-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.risk-tag__code {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
}
</style>
