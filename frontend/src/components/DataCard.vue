<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    padded?: boolean
    loading?: boolean
    flat?: boolean
  }>(),
  {
    title: '',
    subtitle: '',
    padded: true,
    loading: false,
    flat: false,
  },
)
</script>

<template>
  <section class="data-card" :class="{ 'is-flat': flat, 'is-padded': padded }">
    <header v-if="title || $slots.header || $slots.actions" class="data-card__header">
      <slot name="header">
        <div>
          <h2 class="section-title">{{ title }}</h2>
          <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="data-card__actions">
        <slot name="actions" />
      </div>
    </header>
    <div v-loading="loading" class="data-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="data-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.data-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--dip-card);
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.data-card.is-flat {
  box-shadow: none;
}

.data-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px 0;
}

.data-card__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.data-card__body {
  min-width: 0;
  flex: 1;
}

.data-card.is-padded > .data-card__body {
  padding: 16px 18px 18px;
}

.data-card__footer {
  padding: 12px 18px;
  background: #fbfcfe;
  border-top: 1px solid #edf1f6;
}
</style>
