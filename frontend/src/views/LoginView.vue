<script setup lang="ts">
import { Lock, Right, User } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/http'
import { REMEMBER_KEY } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const errorMessage = ref('')
const remember = ref(true)
const form = reactive({
  username: localStorage.getItem(REMEMBER_KEY) || 'admin',
  password: 'admin123',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

function useDemoAccount() {
  form.username = 'admin'
  form.password = 'admin123'
  errorMessage.value = ''
}

async function submit() {
  errorMessage.value = ''
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await auth.login(form.username.trim(), form.password)
    if (remember.value) localStorage.setItem(REMEMBER_KEY, form.username.trim())
    else localStorage.removeItem(REMEMBER_KEY)
    ElMessage.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect.startsWith('/') ? redirect : '/dashboard')
  } catch (error) {
    const traceId = error instanceof ApiError ? error.traceId : undefined
    const message =
      error instanceof Error ? error.message : '登录失败，请检查账号、密码与后端服务状态'
    errorMessage.value = traceId ? `${message}（traceId: ${traceId}）` : message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <section class="login-visual">
      <div class="visual-grid" />
      <svg class="network" viewBox="0 0 820 720" aria-hidden="true">
        <defs>
          <linearGradient id="line-glow" x1="0" x2="1">
            <stop offset="0%" stop-color="#15b8c7" stop-opacity="0" />
            <stop offset="48%" stop-color="#68dae2" stop-opacity="0.55" />
            <stop offset="100%" stop-color="#1769e0" stop-opacity="0" />
          </linearGradient>
          <radialGradient id="point-glow">
            <stop offset="0%" stop-color="#8df4f1" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#15b8c7" stop-opacity="0" />
          </radialGradient>
        </defs>
        <g stroke="url(#line-glow)" stroke-width="1">
          <path d="M92 540 C220 430, 250 320, 390 260 S610 210, 720 104" />
          <path d="M118 580 C300 520, 330 420, 450 360 S650 300, 748 224" />
          <path d="M200 640 C318 528, 420 520, 516 430 S662 392, 760 330" />
          <path d="M280 230 C350 300, 440 310, 510 260 S640 130, 730 70" />
          <path d="M170 290 C280 340, 360 380, 440 470 S600 540, 730 490" />
        </g>
        <g fill="url(#point-glow)">
          <circle cx="390" cy="260" r="38" />
          <circle cx="510" cy="260" r="52" />
          <circle cx="450" cy="360" r="45" />
          <circle cx="516" cy="430" r="40" />
          <circle cx="730" cy="70" r="32" />
        </g>
        <g fill="#7adfe6">
          <circle cx="390" cy="260" r="3.2" />
          <circle cx="510" cy="260" r="4" />
          <circle cx="450" cy="360" r="3.4" />
          <circle cx="516" cy="430" r="3" />
          <circle cx="730" cy="70" r="2.4" />
          <circle cx="170" cy="290" r="2.2" />
          <circle cx="730" cy="490" r="2.4" />
        </g>
      </svg>

      <div class="visual-content">
        <div class="visual-brand">
          <div class="visual-brand__mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>北京数字产业</strong>
            <small>BEIJING DIGITAL INDUSTRY</small>
          </div>
        </div>

        <div class="visual-copy">
          <div class="visual-kicker">
            <span />
            DYNAMIC MONITORING & INTELLIGENCE
          </div>
          <h1>洞察产业脉络<br />让每一个判断都有依据</h1>
          <p>
            汇聚运行监测、产业链图谱、智能研判与证据链，
            为产业决策提供统一、可信、可追溯的分析入口。
          </p>
        </div>

        <div class="visual-metrics">
          <div>
            <span>监测企业</span>
            <strong>4,286<small>家</small></strong>
            <em>较上月 +1.3%</em>
          </div>
          <div>
            <span>综合景气指数</span>
            <strong>128.6</strong>
            <em>景气区间</em>
          </div>
          <div>
            <span>今日新增预警</span>
            <strong>8<small>条</small></strong>
            <em class="is-risk">2 条高风险</em>
          </div>
        </div>

        <div class="visual-footer">
          <span><i class="inline-dot" /> 统一底座 V0.2 · 数据版本 2026.10.18</span>
          <span>北京市产业监测中心</span>
        </div>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-panel__top">
        <span>ONE PLATFORM · ONE SOURCE OF TRUTH</span>
        <span class="env-pill">开发环境</span>
      </div>

      <div class="login-card">
        <div class="login-card__heading">
          <span class="heading-line" />
          <h2>欢迎回来</h2>
          <p>登录北京数字产业动态监测与智能分析平台</p>
        </div>

        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          :closable="false"
          class="login-error"
        />

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="login-form"
          @keyup.enter="submit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" size="large" placeholder="请输入用户名">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              size="large"
              type="password"
              show-password
              placeholder="请输入密码"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="remember">记住用户名</el-checkbox>
            <button type="button" class="text-link" @click="useDemoAccount">
              填入测试账号
            </button>
          </div>

          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="submit"
          >
            <span>进入平台</span>
            <el-icon v-if="!loading"><Right /></el-icon>
          </el-button>
        </el-form>

        <div class="demo-account">
          <div class="demo-account__icon">D</div>
          <div>
            <strong>测试账号</strong>
            <span>admin / admin123</span>
          </div>
          <span class="demo-account__tag">系统管理员</span>
        </div>

        <p class="login-note">
          登录即代表您同意遵守平台数据安全与保密要求。账号权限由系统管理员统一分配，
          所有访问行为均记录审计日志。
        </p>
      </div>

      <div class="login-panel__footer">
        <span>© 2026 北京市产业监测中心</span>
        <span>技术支持 · 数字产业平台项目组</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.18fr) minmax(420px, 0.82fr);
  background: #f7f9fc;
}

.login-visual {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(circle at 76% 14%, rgba(23, 105, 224, 0.28), transparent 32%),
    radial-gradient(circle at 18% 78%, rgba(21, 184, 199, 0.18), transparent 32%),
    linear-gradient(145deg, #07182d 0%, #0b2443 54%, #0e3154 100%);
}

.visual-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(128, 172, 214, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(128, 172, 214, 0.055) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: linear-gradient(160deg, #000, transparent 76%);
}

.network {
  position: absolute;
  top: 12%;
  right: -5%;
  width: 72%;
  opacity: 0.82;
}

.visual-content {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 42px clamp(34px, 5vw, 78px) 32px;
}

.visual-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.visual-brand__mark {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  background: linear-gradient(145deg, rgba(21, 184, 199, 0.22), rgba(23, 105, 224, 0.3));
  border: 1px solid rgba(116, 205, 228, 0.3);
  border-radius: 11px;
}

.visual-brand__mark span {
  width: 4px;
  background: linear-gradient(180deg, #9ff3f1, #48a5ff);
  border-radius: 2px 2px 0 0;
}

.visual-brand__mark span:nth-child(1) {
  height: 10px;
}

.visual-brand__mark span:nth-child(2) {
  height: 19px;
}

.visual-brand__mark span:nth-child(3) {
  height: 14px;
}

.visual-brand strong,
.visual-brand small {
  display: block;
}

.visual-brand strong {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.visual-brand small {
  margin-top: 4px;
  color: #6384a7;
  font-size: 8px;
  letter-spacing: 0.16em;
}

.visual-copy {
  max-width: 610px;
  margin: auto 0;
}

.visual-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  color: #6fb6d6;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.visual-kicker span {
  width: 32px;
  height: 1px;
  background: #2f95b7;
}

.visual-copy h1 {
  margin: 0;
  color: #f5fbff;
  font-size: clamp(36px, 4.5vw, 62px);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1.22;
}

.visual-copy p {
  max-width: 520px;
  margin: 24px 0 0;
  color: #8ea9c3;
  font-size: 14px;
  line-height: 2;
}

.visual-metrics {
  display: grid;
  max-width: 700px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin-bottom: 28px;
  overflow: hidden;
  background: rgba(141, 178, 214, 0.13);
  border: 1px solid rgba(141, 178, 214, 0.13);
  border-radius: 12px;
}

.visual-metrics > div {
  padding: 16px 17px;
  background: rgba(8, 29, 52, 0.56);
  backdrop-filter: blur(9px);
}

.visual-metrics span,
.visual-metrics em {
  display: block;
  font-style: normal;
}

.visual-metrics span {
  color: #7694b2;
  font-size: 9px;
}

.visual-metrics strong {
  display: block;
  margin: 5px 0 3px;
  color: #f2f9ff;
  font-size: 23px;
  font-weight: 620;
  letter-spacing: -0.02em;
}

.visual-metrics strong small {
  margin-left: 3px;
  color: #7c9bb8;
  font-size: 10px;
}

.visual-metrics em {
  color: #66cfbd;
  font-size: 9px;
}

.visual-metrics em.is-risk {
  color: #ef8d91;
}

.visual-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #557491;
  font-size: 9px;
}

.login-panel {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 30px clamp(28px, 4vw, 58px) 24px;
  background:
    radial-gradient(circle at 100% 0%, rgba(23, 105, 224, 0.055), transparent 30%),
    #f9fbfd;
}

.login-panel__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #9aa5b3;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.13em;
}

.env-pill {
  padding: 4px 7px;
  color: #6985a4;
  background: #eef3f9;
  border-radius: 5px;
  letter-spacing: 0;
}

.login-card {
  width: 100%;
  max-width: 410px;
  margin: auto;
}

.login-card__heading {
  position: relative;
  margin-bottom: 26px;
}

.heading-line {
  display: block;
  width: 30px;
  height: 3px;
  margin-bottom: 18px;
  background: linear-gradient(90deg, var(--dip-blue), var(--dip-cyan));
  border-radius: 3px;
}

.login-card__heading h2 {
  margin: 0;
  color: #13233b;
  font-size: 29px;
  font-weight: 680;
  letter-spacing: -0.03em;
}

.login-card__heading p {
  margin: 8px 0 0;
  color: #7b899c;
  font-size: 12px;
}

.login-error {
  margin-bottom: 16px;
  border-radius: 8px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.login-form :deep(.el-form-item__label) {
  padding-bottom: 7px;
  color: #526178;
  font-size: 11px;
  font-weight: 550;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 45px;
  padding: 1px 12px;
  background: #fff;
  border-radius: 9px;
  box-shadow: 0 0 0 1px #dfe6ef inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--dip-blue) inset, 0 0 0 3px rgba(23, 105, 224, 0.08);
}

.login-form :deep(.el-input__prefix) {
  color: #94a2b4;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 1px 0 19px;
}

.form-options :deep(.el-checkbox__label) {
  color: #718096;
  font-size: 11px;
}

.text-link {
  padding: 0;
  color: var(--dip-blue);
  background: transparent;
  border: 0;
  font-size: 11px;
  cursor: pointer;
}

.login-button {
  width: 100%;
  height: 46px;
  background: linear-gradient(90deg, #135ecb, #188aca);
  border: 0;
  border-radius: 9px;
  box-shadow: 0 10px 22px rgba(23, 105, 224, 0.18);
  font-size: 13px;
  font-weight: 550;
}

.login-button :deep(span) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.demo-account {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  margin-top: 18px;
  background: #f3f7fc;
  border: 1px solid #e5ecf5;
  border-radius: 9px;
}

.demo-account__icon {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: #3f76ad;
  background: #e3edf9;
  border-radius: 7px;
  font-family: Georgia, serif;
  font-size: 13px;
}

.demo-account strong,
.demo-account span {
  display: block;
}

.demo-account strong {
  color: #5b6a7f;
  font-size: 10px;
  font-weight: 500;
}

.demo-account span {
  margin-top: 2px;
  color: #32465e;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
}

.demo-account__tag {
  padding: 3px 6px !important;
  margin: 0 0 0 auto !important;
  color: #63809f !important;
  background: #fff;
  border-radius: 4px;
  font-family: inherit !important;
  font-size: 9px !important;
}

.login-note {
  margin: 19px 0 0;
  color: #a0aab7;
  font-size: 9px;
  line-height: 1.75;
}

.login-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #a0aab7;
  font-size: 8.5px;
}

@media (max-width: 980px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-visual {
    display: none;
  }

  .login-panel {
    padding: 28px;
  }

  .login-card {
    padding: 30px 26px;
    background: #fff;
    border: 1px solid #e6edf5;
    border-radius: 16px;
    box-shadow: 0 18px 50px rgba(19, 45, 76, 0.07);
  }
}
</style>
