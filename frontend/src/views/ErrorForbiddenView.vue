<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="error-page__code">403</div>
    <div class="error-page__line" />
    <h1>当前账号无权访问此功能</h1>
    <p>系统未展示任何业务数据。如需开通功能或数据权限，请联系系统管理员。</p>
    <div class="error-page__actions">
      <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
      <el-button @click="router.back()">返回上一页</el-button>
    </div>
    <small>权限变更通常在 5 分钟内生效 · 操作记录将写入审计日志</small>
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

small {
  margin-top: 26px;
  color: #a0aab7;
  font-size: 10px;
}
</style>
