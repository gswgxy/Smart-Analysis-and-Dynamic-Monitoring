<script setup lang="ts">
import { computed } from 'vue'

import type { ChainEdge, ChainNode } from '@/types'
import { riskColor } from '@/utils/risk'

const props = defineProps<{
  nodes: ChainNode[]
  edges: ChainEdge[]
  selectedId?: string
  showRisk?: boolean
  highlightPath?: boolean
}>()

defineEmits<{
  select: [node: ChainNode]
}>()

const nodeMap = computed(() => new Map(props.nodes.map((node) => [node.id, node])))

function edgePath(edge: ChainEdge) {
  const source = nodeMap.value.get(edge.source)
  const target = nodeMap.value.get(edge.target)
  if (!source || !target) return ''
  const x1 = source.x + source.width
  const y1 = source.y + 29
  const x2 = target.x
  const y2 = target.y + 29
  const mid = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}

function nodeColor(node: ChainNode) {
  return props.showRisk === false ? '#1769e0' : riskColor(node.risk)
}
</script>

<template>
  <div class="topology-wrap">
    <svg class="topology" viewBox="0 0 1040 590" role="img" aria-label="产业链风险传导图">
      <defs>
        <marker
          id="arrow-default"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#b5c7dc" />
        </marker>
        <marker
          id="arrow-risk"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#df4f56" />
        </marker>
        <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#173f6b" flood-opacity="0.08" />
        </filter>
      </defs>

      <g class="stage-labels">
        <text x="105" y="32">上游供给</text>
        <text x="405" y="32">中游制造与模型</text>
        <text x="738" y="32">下游应用</text>
        <line x1="30" y1="45" x2="1010" y2="45" />
      </g>

      <g class="edges">
        <path
          v-for="edge in edges"
          :key="`${edge.source}-${edge.target}`"
          :d="edgePath(edge)"
          :marker-end="edge.risk ? 'url(#arrow-risk)' : 'url(#arrow-default)'"
          :class="{
            'is-risk': edge.risk,
            'is-highlighted': highlightPath && edge.risk,
          }"
          :style="{ strokeWidth: Math.max(1.2, edge.weight * 2) }"
        />
      </g>

      <g
        v-for="node in nodes"
        :key="node.id"
        class="node"
        :class="{
          'is-selected': selectedId === node.id,
          'is-risk': showRisk !== false && ['R4', 'R5'].includes(node.risk),
        }"
        :transform="`translate(${node.x}, ${node.y})`"
        role="button"
        tabindex="0"
        @click="$emit('select', node)"
        @keydown.enter="$emit('select', node)"
      >
        <rect
          :width="node.width"
          height="58"
          rx="11"
          fill="#fff"
          :stroke="nodeColor(node)"
          stroke-width="1.5"
          filter="url(#node-shadow)"
        />
        <rect :width="4" height="58" rx="2" :fill="nodeColor(node)" />
        <circle :cx="node.width - 17" cy="16" r="6" :fill="nodeColor(node)" opacity="0.16" />
        <circle :cx="node.width - 17" cy="16" r="2.6" :fill="nodeColor(node)" />
        <text class="node__stage" x="15" y="18">{{ node.stage }}</text>
        <text class="node__label" x="15" y="37">{{ node.label }}</text>
        <text class="node__sub" x="15" y="50">{{ node.sublabel }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.topology-wrap {
  width: 100%;
  overflow-x: auto;
  background:
    linear-gradient(180deg, rgba(245, 249, 255, 0.7), rgba(255, 255, 255, 0.9)),
    radial-gradient(circle at 52% 38%, rgba(23, 105, 224, 0.06), transparent 40%);
  border-radius: 12px;
}

.topology {
  display: block;
  width: 100%;
  min-width: 820px;
  height: auto;
}

.stage-labels text {
  fill: #94a0b2;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.stage-labels line {
  stroke: #e3eaf3;
  stroke-dasharray: 4 5;
}

.edges path {
  fill: none;
  stroke: #b5c7dc;
  opacity: 0.88;
  transition: opacity 0.2s ease;
}

.edges path.is-risk {
  stroke: #df7e83;
  stroke-dasharray: 5 4;
}

.edges path.is-highlighted {
  stroke: #df4f56;
  stroke-dasharray: 7 4;
  animation: flow 1.2s linear infinite;
}

@keyframes flow {
  to {
    stroke-dashoffset: -22;
  }
}

.node {
  cursor: pointer;
  outline: none;
}

.node rect,
.node circle,
.node text {
  transition: opacity 0.2s ease, stroke-width 0.2s ease;
}

.node:hover rect {
  stroke-width: 2.2;
}

.node.is-selected rect {
  stroke-width: 2.5;
  filter: drop-shadow(0 6px 13px rgba(23, 105, 224, 0.18));
}

.node__stage {
  fill: #93a0b2;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.node__label {
  fill: #1d304a;
  font-size: 12px;
  font-weight: 650;
}

.node__sub {
  fill: #8491a4;
  font-size: 9px;
}

@media (prefers-reduced-motion: reduce) {
  .edges path.is-highlighted {
    animation: none;
  }
}
</style>
