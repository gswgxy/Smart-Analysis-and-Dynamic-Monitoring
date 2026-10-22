<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="error-page__code">404</div>
    <div class="error-page__line" />
    <h1>没有找到这个页面</h1>
    <p>页面地址可能已变更，或者您使用了过期的链接。请返回工作台继续操作。</p>
    <div class="error-page__actions">
      <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
      <el-button @click="router.back()">返回上一页</el-button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px;
  color: #2b3c54;
  background:
    radial-gradient(circle at 50% 15%, rgba(23, 105, 224, 0.06), transparent 28%),
    #f5f8fc;
  text-align: center;
}

.error-page__code {
  color: #c8d6e8;
  font-family: Georgia, serif;
  font-size: clamp(84px, 12vw, 150px);
  line-height: 1;
}

.error-page__line {
  width: 36px;
  height: 3px;
  margin: 22px 0;
  background: linear-gradient(90deg, var(--dip-blue), var(--dip-cyan));
}

h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 650;
}

p {
  max-width: 480px;
  margin: 10px 0 24px;
  color: #76859a;
  font-size: 13px;
  line-height: 1.8;
}

.error-page__actions {
  display: flex;
  gap: 8px;
}
</style>
