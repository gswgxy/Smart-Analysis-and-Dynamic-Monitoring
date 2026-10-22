<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    unit?: string
    delta?: number
    deltaLabel?: string
    hint?: string
    accent?: string
    loading?: boolean
    risk?: boolean
  }>(),
  {
    unit: '',
    delta: undefined,
    deltaLabel: '较上期',
    hint: '',
    accent: '#1769e0',
    loading: false,
    risk: false,
  },
)

const positive = computed(() => (props.delta ?? 0) >= 0)
</script>

<template>
  <article class="metric-card" :style="{ '--accent': accent }">
    <div class="metric-card__top">
      <div class="metric-card__label">{{ label }}</div>
      <div class="metric-card__icon">
        <slot name="icon">
          <el-icon><DataLine /></el-icon>
        </slot>
      </div>
    </div>
    <el-skeleton v-if="loading" :rows="1" animated class="metric-card__skeleton" />
    <template v-else>
      <div class="metric-card__value">
        <span>{{ value }}</span>
        <small v-if="unit">{{ unit }}</small>
      </div>
      <div class="metric-card__bottom">
        <span
          v-if="delta !== undefined"
          class="metric-card__delta"
          :class="risk ? (positive ? 'is-bad' : 'is-good') : positive ? 'is-good' : 'is-bad'"
        >
          <el-icon>
            <Top v-if="positive" />
            <Bottom v-else />
          </el-icon>
          {{ Math.abs(delta).toFixed(1) }}%
        </span>
        <span v-if="delta !== undefined" class="metric-card__delta-label">{{ deltaLabel }}</span>
        <span v-if="hint" class="metric-card__hint">{{ hint }}</span>
      </div>
    </template>
    <span class="metric-card__accent" />
  </article>
</template>

<style scoped>
.metric-card {
  position: relative;
  min-width: 0;
  padding: 16px 17px 15px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.metric-card::after {
  position: absolute;
  right: -32px;
  bottom: -42px;
  width: 110px;
  height: 110px;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 10%, transparent), transparent 68%);
  border-radius: 50%;
  content: "";
  pointer-events: none;
}

.metric-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-card__label {
  overflow: hidden;
  color: #617086;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__icon {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 9%, white);
  border-radius: 9px;
  font-size: 16px;
}

.metric-card__value {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 10px;
  color: #15253f;
}

.metric-card__value span {
  overflow: hidden;
  font-size: clamp(24px, 2.2vw, 30px);
  font-weight: 680;
  letter-spacing: -0.03em;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__value small {
  color: #7b889c;
  font-size: 12px;
}

.metric-card__bottom {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 20px;
  margin-top: 7px;
  font-size: 11px;
}

.metric-card__delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 650;
}

.metric-card__delta .el-icon {
  font-size: 11px;
}

.metric-card__delta.is-good {
  color: #0a9b76;
}

.metric-card__delta.is-bad {
  color: #d94e56;
}

.metric-card__delta-label,
.metric-card__hint {
  color: #8b97a9;
}

.metric-card__hint {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 20%, transparent));
}

.metric-card__skeleton {
  padding-top: 15px;
}
</style>
