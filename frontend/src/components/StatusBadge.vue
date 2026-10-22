<script setup lang="ts">
import { computed } from 'vue'

import { statusLabel } from '@/utils/format'

const props = defineProps<{ status: string }>()

const tone = computed(() => {
  if (['APPROVED', 'PUBLISHED', 'RESOLVED', 'SUCCESS', 'CLOSED'].includes(props.status)) {
    return 'success'
  }
  if (['RETURNED', 'FAILED', 'R4', 'R5'].includes(props.status)) return 'danger'
  if (['REVIEWING', 'PROCESSING', 'RUNNING', 'CONFIRMED'].includes(props.status)) return 'warning'
  if (['QUEUED', 'SUBMITTED'].includes(props.status)) return 'primary'
  return 'info'
})
</script>

<template>
  <span class="status-badge" :class="`is-${tone}`">
    <span class="status-badge__dot" />
    {{ statusLabel(status) }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  color: #5e6d82;
  background: #f2f5f9;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}

.status-badge__dot {
  width: 5px;
  height: 5px;
  background: #8b98ab;
  border-radius: 50%;
}

.is-success {
  color: #087d62;
  background: #e9f8f3;
}

.is-success .status-badge__dot {
  background: #0ba58a;
}

.is-warning {
  color: #9b6506;
  background: #fff7e8;
}

.is-warning .status-badge__dot {
  background: #e5a11a;
}

.is-danger {
  color: #b73840;
  background: #fff0f1;
}

.is-danger .status-badge__dot {
  background: #df4f56;
}

.is-primary {
  color: #1558b4;
  background: #edf4ff;
}

.is-primary .status-badge__dot {
  background: #1769e0;
}
</style>
