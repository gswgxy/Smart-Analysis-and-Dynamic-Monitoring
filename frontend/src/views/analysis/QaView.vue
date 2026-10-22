<script setup lang="ts">
import {
  ChatDotRound,
  CircleCheck,
  DocumentAdd,
  Promotion,
  RefreshLeft,
  Star,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { analysisApi } from '@/api/analysis'
import DataCard from '@/components/DataCard.vue'
import EvidenceDrawer from '@/components/EvidenceDrawer.vue'
import PageHeader from '@/components/PageHeader.vue'
import TrustBadge from '@/components/TrustBadge.vue'
import { dataVersion, mockAnswer, updatedAt } from '@/mock/data'
import type { EvidenceItem, QaAnswer, TrustLevel } from '@/types'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
  trust?: TrustLevel
  evidence?: EvidenceItem[]
  pending?: boolean
  demo?: boolean
}

const router = useRouter()
const question = ref('')
const sending = ref(false)
const evidenceVisible = ref(false)
const activeEvidence = ref<EvidenceItem[]>([])
const usedDemo = ref(false)
const messageList = ref<HTMLDivElement>()
let messageId = 2

const recommendedQuestions = [
  '本月人工智能产业运行有哪些主要变化？',
  'AI 芯片供应风险会影响哪些产业链节点？',
  '对比海淀区和经开区的人工智能产业集聚度',
  '下一步应重点关注哪些高风险企业？',
]

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'assistant',
    content:
      '您好，我是产业分析助手。可以帮您查询指标、产业链关系、企业画像、政策依据和风险事件。回答会附带关键证据与可信度，便于进一步核验。',
    time: '09:41',
    trust: 'A',
  },
])

const knowledgePath = [
  '识别意图：产业运行分析 + 风险归因',
  '定位产业：人工智能 / 全市',
  '查询指标：营收、专利、融资、风险',
  '关联图谱：AI 芯片 → 智算中心 → 大模型',
  '检索政策：算力基础设施支持措施',
  '生成结论并绑定 3 条证据',
]

function nowTime() {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function scrollToBottom() {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

async function send(text?: string) {
  const content = (text ?? question.value).trim()
  if (!content || sending.value) return

  question.value = ''
  sending.value = true
  messages.value.push({
    id: messageId++,
    role: 'user',
    content,
    time: nowTime(),
  })
  const pendingId = messageId++
  messages.value.push({
    id: pendingId,
    role: 'assistant',
    content: '',
    time: nowTime(),
    pending: true,
  })
  scrollToBottom()

  let answer: QaAnswer = mockAnswer
  let demo = false
  try {
    answer = await analysisApi.ask(content, {
      industry: '人工智能',
      region: '北京市',
      period: '2026-10',
    })
  } catch {
    demo = true
    await new Promise((resolve) => setTimeout(resolve, 650))
  }

  const target = messages.value.find((item) => item.id === pendingId)
  if (target) {
    target.content = answer.answer
    target.trust = answer.trustLevel
    target.evidence = answer.evidence
    target.pending = false
    target.demo = demo
    target.time = nowTime()
  }
  usedDemo.value = usedDemo.value || demo
  sending.value = false
  scrollToBottom()

  if (demo && messages.value.filter((item) => item.demo).length === 1) {
    ElMessage.info('问答后端尚未接入，当前展示演示结果；C 同学完成接口后会自动切换为真实回答。')
  }
}

function openEvidence(evidence?: EvidenceItem[]) {
  if (!evidence?.length) {
    ElMessage.warning('该回答暂无可查看证据')
    return
  }
  activeEvidence.value = evidence
  evidenceVisible.value = true
}

function feedback(message: ChatMessage, useful: boolean) {
  ElMessage.success(useful ? '感谢反馈，已记录为“有帮助”' : '已记录反馈，将转交分析团队复核')
  if (!useful) {
    router.push('/reviews/tasks')
  }
}

function saveAnalysis() {
  ElMessage.success('当前对话已保存到分析结果库')
}

onMounted(scrollToBottom)
</script>

<template>
  <div class="page-shell qa-page">
    <PageHeader
      title="产业智能问答"
      description="用自然语言查询产业指标、企业关系、产业链结构和风险依据；结果包含证据、可信度和算法记录。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="RefreshLeft" @click="messages = messages.slice(0, 1)">
          新会话
        </el-button>
        <el-button :icon="Star" @click="saveAnalysis">保存结果</el-button>
        <el-button type="primary" :icon="DocumentAdd" @click="router.push('/analysis/topic')">
          生成专题
        </el-button>
      </template>
    </PageHeader>

    <div class="qa-shell">
      <section class="chat-panel">
        <div class="chat-panel__head">
          <div>
            <strong>产业分析助手</strong>
            <span><i class="inline-dot" />在线 · 已接入 12 个数据源</span>
          </div>
          <div class="chat-panel__meta">
            <span>会话 SESSION-20261018-001</span>
            <span v-if="usedDemo" class="demo-pill">演示回答</span>
          </div>
        </div>

        <div ref="messageList" class="message-list">
          <article
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="`is-${message.role}`"
          >
            <div class="message-avatar">
              {{ message.role === 'assistant' ? 'AI' : 'D' }}
            </div>
            <div class="message-content">
              <div class="message-meta">
                <strong>{{ message.role === 'assistant' ? '产业分析助手' : '我' }}</strong>
                <span>{{ message.time }}</span>
                <TrustBadge v-if="message.trust" :level="message.trust" :show-label="false" />
                <span v-if="message.demo" class="demo-tag">演示</span>
              </div>
              <div v-if="message.pending" class="thinking">
                <span />
                <span />
                <span />
                正在检索指标、图谱和政策证据
              </div>
              <template v-else>
                <p class="message-text">{{ message.content }}</p>
                <div v-if="message.evidence?.length" class="message-evidence">
                  <button
                    v-for="item in message.evidence"
                    :key="item.id"
                    type="button"
                    @click="openEvidence(message.evidence)"
                  >
                    <span>{{ item.sourceType }}</span>
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.trustLevel }} 级证据</small>
                  </button>
                </div>
                <div v-if="message.role === 'assistant' && !message.pending && message.id !== 1" class="message-actions">
                  <el-button text size="small" @click="openEvidence(message.evidence)">
                    查看证据
                  </el-button>
                  <el-button text size="small" @click="feedback(message, true)">
                    <el-icon><CircleCheck /></el-icon>
                    有帮助
                  </el-button>
                  <el-button text size="small" @click="feedback(message, false)">转人工复核</el-button>
                  <el-button text size="small">复制</el-button>
                </div>
              </template>
            </div>
          </article>

          <div v-if="messages.length === 1" class="recommend-block">
            <span>你可以这样问</span>
            <button
              v-for="item in recommendedQuestions"
              :key="item"
              type="button"
              @click="send(item)"
            >
              <el-icon><ChatDotRound /></el-icon>
              {{ item }}
            </button>
          </div>
        </div>

        <div class="chat-composer">
          <div class="composer-tools">
            <span>产业：人工智能</span>
            <span>地区：全市</span>
            <span>数据期：2026-10</span>
            <span class="composer-tools__clear">清除上下文</span>
          </div>
          <el-input
            v-model="question"
            type="textarea"
            :rows="2"
            resize="none"
            placeholder="输入你的问题，例如：本月人工智能产业有哪些主要风险？"
            @keydown.enter.exact.prevent="send()"
          />
          <div class="composer-bottom">
            <span>Enter 发送 · Shift + Enter 换行</span>
            <el-button
              type="primary"
              :icon="Promotion"
              :loading="sending"
              :disabled="!question.trim()"
              @click="send()"
            >
              发送
            </el-button>
          </div>
        </div>
      </section>

      <aside class="qa-side">
        <DataCard title="语义解析" subtitle="当前问题的意图与实体">
          <div class="intent-block">
            <span>意图</span>
            <div>
              <em>产业运行分析</em>
              <em>风险归因</em>
            </div>
          </div>
          <div class="entity-list">
            <div><span>产业</span><strong>人工智能</strong></div>
            <div><span>地区</span><strong>北京市</strong></div>
            <div><span>时间</span><strong>2026 年 10 月</strong></div>
            <div><span>实体</span><strong>AI 芯片、智算中心</strong></div>
          </div>
          <div class="confidence-line">
            <span>意图识别置信度</span>
            <i><b style="width: 94%" /></i>
            <strong>94%</strong>
          </div>
        </DataCard>

        <DataCard title="知识路径" subtitle="本次分析的检索与推理过程">
          <div class="knowledge-path">
            <div v-for="(item, index) in knowledgePath" :key="item">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <p>{{ item }}</p>
            </div>
          </div>
          <template #footer>
            <div class="path-footer">
              <span>算法版本 mock-v0.2</span>
              <el-button text size="small">查看调用记录</el-button>
            </div>
          </template>
        </DataCard>

        <DataCard title="可信度" subtitle="结论可解释、可复核">
          <div class="trust-panel">
            <TrustBadge :level="mockAnswer.trustLevel" />
            <p>结论基于 3 项核心指标和 2 条图谱关系，政策证据完整；融资数据存在 2 个工作日滞后。</p>
          </div>
          <div class="trust-factors">
            <div><span>数据完整性</span><strong>96%</strong></div>
            <div><span>证据一致性</span><strong>92%</strong></div>
            <div><span>模型置信度</span><strong>88%</strong></div>
          </div>
          <el-button plain size="small" class="trust-button" @click="router.push('/analysis/trust/TRUST-20261018-01')">
            查看可信度详情
          </el-button>
        </DataCard>
      </aside>
    </div>

    <EvidenceDrawer v-model="evidenceVisible" :evidence="activeEvidence" title="回答证据与原文" />
  </div>
</template>

<style scoped>
.qa-page {
  height: calc(100vh - 104px);
  min-height: 650px;
}

.qa-shell {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(0, 1fr) 315px;
  gap: 16px;
}

.chat-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--dip-line);
  border-radius: var(--dip-radius);
  box-shadow: var(--dip-shadow);
}

.chat-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 13px 17px;
  border-bottom: 1px solid #edf1f6;
}

.chat-panel__head strong,
.chat-panel__head span {
  display: block;
}

.chat-panel__head strong {
  color: #30445c;
  font-size: 11px;
  font-weight: 600;
}

.chat-panel__head span {
  margin-top: 3px;
  color: #8e9aaa;
  font-size: 7.5px;
}

.chat-panel__meta {
  display: flex;
  align-items: center;
  gap: 7px;
}

.chat-panel__meta > span:first-child {
  color: #a0aab8;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 7px;
}

.demo-pill {
  padding: 2px 5px !important;
  margin: 0 !important;
  color: #a5710d !important;
  background: #fff6e5;
  border-radius: 4px;
}

.message-list {
  min-height: 0;
  flex: 1;
  padding: 20px 20px 8px;
  overflow-y: auto;
  background:
    radial-gradient(circle at 50% 0%, rgba(23, 105, 224, 0.025), transparent 35%),
    #fff;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 880px;
  margin-bottom: 20px;
}

.message.is-user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-avatar {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1769e0, #15a7b4);
  border-radius: 8px;
  font-family: Georgia, serif;
  font-size: 8px;
}

.is-user .message-avatar {
  background: #254a70;
}

.message-content {
  min-width: 0;
  max-width: 86%;
}

.is-user .message-content {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
}

.message-meta strong {
  color: #3a4d65;
  font-size: 8.5px;
  font-weight: 580;
}

.message-meta span {
  color: #9aa5b3;
  font-size: 7px;
}

.demo-tag {
  padding: 1px 4px;
  color: #98701c !important;
  background: #fff7e7;
  border-radius: 3px;
}

.message-text {
  margin: 0;
  padding: 11px 13px;
  color: #4e5f74;
  background: #f6f9fc;
  border: 1px solid #edf2f7;
  border-radius: 2px 10px 10px 10px;
  font-size: 10px;
  line-height: 1.85;
  white-space: pre-line;
}

.is-user .message-text {
  color: #fff;
  background: linear-gradient(135deg, #1769e0, #1760c5);
  border: 0;
  border-radius: 10px 2px 10px 10px;
}

.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 11px 13px;
  color: #8090a4;
  background: #f6f9fc;
  border-radius: 2px 10px 10px 10px;
  font-size: 8.5px;
}

.thinking span {
  width: 4px;
  height: 4px;
  background: #6b9ed7;
  border-radius: 50%;
  animation: bounce 1s infinite;
}

.thinking span:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking span:nth-child(3) {
  margin-right: 4px;
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%,
  70%,
  100% {
    transform: translateY(0);
  }
  35% {
    transform: translateY(-3px);
  }
}

.message-evidence {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
}

.message-evidence button {
  padding: 8px;
  text-align: left;
  background: #fff;
  border: 1px solid #e3eaf2;
  border-radius: 6px;
  cursor: pointer;
}

.message-evidence button:hover {
  border-color: #b7cde7;
}

.message-evidence span {
  display: inline-block;
  padding: 1px 4px;
  margin-bottom: 4px;
  color: #607b98;
  background: #f0f5f9;
  border-radius: 3px;
  font-size: 6.5px;
}

.message-evidence strong,
.message-evidence small {
  display: block;
}

.message-evidence strong {
  overflow: hidden;
  color: #41546c;
  font-size: 7.5px;
  font-weight: 520;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-evidence small {
  margin-top: 3px;
  color: #98a3b2;
  font-size: 6.5px;
}

.message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
}

.message-actions :deep(.el-button) {
  margin-left: 0;
  color: #75849a;
  font-size: 8px;
}

.recommend-block {
  display: flex;
  max-width: 660px;
  flex-direction: column;
  gap: 7px;
  margin: 24px 0 10px 41px;
}

.recommend-block > span {
  color: #96a1b0;
  font-size: 8px;
}

.recommend-block button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  color: #536a84;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #e8eef5;
  border-radius: 6px;
  font-size: 8.5px;
  cursor: pointer;
}

.recommend-block button:hover {
  color: #1769e0;
  background: #f4f8fd;
  border-color: #c9dcf1;
}

.chat-composer {
  padding: 12px 17px 14px;
  background: #fff;
  border-top: 1px solid #e9eef5;
}

.composer-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 7px;
}

.composer-tools span {
  padding: 2px 5px;
  color: #72869d;
  background: #f2f6fa;
  border-radius: 3px;
  font-size: 7px;
}

.composer-tools__clear {
  margin-left: auto;
  color: #9aa5b3 !important;
  background: transparent !important;
  cursor: pointer;
}

.chat-composer :deep(.el-textarea__inner) {
  padding: 9px 11px;
  color: #34495f;
  background: #f9fbfd;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dfe7f0 inset;
  font-size: 10px;
  line-height: 1.6;
}

.composer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 7px;
}

.composer-bottom > span {
  color: #9ca6b3;
  font-size: 7px;
}

.qa-side {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 13px;
  overflow-y: auto;
}

.qa-side :deep(.data-card__body) {
  padding: 13px 14px;
}

.intent-block {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.intent-block > span {
  padding-top: 2px;
  color: #8995a6;
  font-size: 8px;
}

.intent-block div {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.intent-block em {
  padding: 3px 6px;
  color: #1769e0;
  background: #edf4ff;
  border-radius: 4px;
  font-size: 7.5px;
  font-style: normal;
}

.entity-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 11px 0;
}

.entity-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.entity-list span {
  color: #8b97a8;
  font-size: 8px;
}

.entity-list strong {
  color: #42556d;
  font-size: 8.5px;
  font-weight: 520;
}

.confidence-line {
  display: grid;
  grid-template-columns: 1fr 75px 28px;
  align-items: center;
  gap: 6px;
  padding-top: 9px;
  border-top: 1px solid #edf1f6;
}

.confidence-line span {
  color: #8995a6;
  font-size: 7.5px;
}

.confidence-line i {
  height: 4px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 4px;
}

.confidence-line b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #4d9ce2, #0ba58a);
  border-radius: 4px;
}

.confidence-line strong {
  color: #0a8c73;
  font-size: 7.5px;
  text-align: right;
}

.knowledge-path {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.knowledge-path > div {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}

.knowledge-path span {
  color: #a1b4c8;
  font-family: Georgia, serif;
  font-size: 10px;
}

.knowledge-path p {
  margin: 0;
  color: #66768b;
  font-size: 7.8px;
  line-height: 1.5;
}

.path-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #9aa5b3;
  font-size: 7px;
}

.trust-panel {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.trust-panel p {
  margin: 0;
  color: #708095;
  font-size: 7.8px;
  line-height: 1.6;
}

.trust-factors {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 11px 0;
}

.trust-factors > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 7px;
  background: #f8fafc;
  border-radius: 4px;
}

.trust-factors span {
  color: #8995a6;
  font-size: 7.5px;
}

.trust-factors strong {
  color: #456078;
  font-size: 7.5px;
  font-weight: 550;
}

.trust-button {
  width: 100%;
}

@media (max-width: 1080px) {
  .qa-page {
    height: auto;
  }

  .qa-shell {
    grid-template-columns: 1fr;
  }

  .chat-panel {
    min-height: 700px;
  }

  .qa-side {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    overflow: visible;
  }
}

@media (max-width: 760px) {
  .qa-side {
    grid-template-columns: 1fr;
  }

  .message-evidence {
    grid-template-columns: 1fr;
  }

  .message-content {
    max-width: calc(100% - 41px);
  }
}
</style>
