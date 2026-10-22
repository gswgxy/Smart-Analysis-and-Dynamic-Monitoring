<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    eyebrow?: string
    dataVersion?: string
    updatedAt?: string
  }>(),
  {
    description: '',
    eyebrow: 'DIGITAL INDUSTRY INTELLIGENCE',
    dataVersion: '',
    updatedAt: '',
  },
)
</script>

<template>
  <header class="page-header">
    <div class="page-header__copy">
      <div class="page-header__eyebrow">{{ eyebrow }}</div>
      <div class="page-header__title-row">
        <h1>{{ title }}</h1>
        <slot name="badge" />
      </div>
      <p v-if="description">{{ description }}</p>
      <div v-if="dataVersion || updatedAt" class="page-header__meta">
        <span v-if="dataVersion" class="tag-soft">
          <span class="inline-dot" />
          数据版本 {{ dataVersion }}
        </span>
        <span v-if="updatedAt">更新于 {{ updatedAt }}</span>
      </div>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  min-height: 78px;
  padding: 1px 2px 0;
}

.page-header::before {
  position: absolute;
  top: 13px;
  left: -2px;
  width: 3px;
  height: 34px;
  background: linear-gradient(180deg, var(--dip-cyan), var(--dip-blue));
  border-radius: 3px;
  content: "";
}

.page-header__copy {
  padding-left: 16px;
}

.page-header__eyebrow {
  margin-bottom: 4px;
  color: #7890ad;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.15em;
}

.page-header__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

h1 {
  margin: 0;
  color: #12213a;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.35;
}

p {
  max-width: 840px;
  margin: 7px 0 0;
  color: #6f7e94;
  font-size: 13px;
  line-height: 1.65;
}

.page-header__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 9px;
  color: #8592a6;
  font-size: 12px;
}

.page-header__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-bottom: 2px;
}

@media (max-width: 780px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .page-header__actions {
    width: 100%;
  }

  h1 {
    font-size: 21px;
  }
}
</style>
