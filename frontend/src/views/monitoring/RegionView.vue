<script setup lang="ts">
import { Download, MapLocation, Position, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseChart from '@/components/BaseChart.vue'
import DataCard from '@/components/DataCard.vue'
import FilterBar from '@/components/FilterBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { dataVersion, regions, updatedAt } from '@/mock/data'
import { axisLabelStyle, axisLineStyle, chartTooltip, splitLineStyle } from '@/utils/charts'
import { formatNumber } from '@/utils/format'

const router = useRouter()
const metric = ref('综合发展指数')
const layer = ref('企业分布')
const selectedDistrict = ref('海淀区')

const parks = [
  {
    id: 'park-zgc-software',
    name: '中关村软件园',
    district: '海淀区',
    enterprises: 486,
    output: 628.4,
    focus: '人工智能、软件服务',
    occupancy: '96%',
    delta: 5.8,
  },
  {
    id: 'park-ai-origin',
    name: '中关村人工智能产业园',
    district: '海淀区',
    enterprises: 312,
    output: 386.2,
    focus: '大模型、AI 芯片',
    occupancy: '92%',
    delta: 8.4,
  },
  {
    id: 'park-eda',
    name: '北京经开区信创园',
    district: '经开区',
    enterprises: 268,
    output: 412.7,
    focus: '集成电路、信创',
    occupancy: '89%',
    delta: 4.1,
  },
  {
    id: 'park-robot',
    name: '昌平未来科学城机器人产业园',
    district: '昌平区',
    enterprises: 176,
    output: 186.5,
    focus: '工业机器人、智能装备',
    occupancy: '84%',
    delta: 3.6,
  },
  {
    id: 'park-digital',
    name: '朝阳数字产业创新园',
    district: '朝阳区',
    enterprises: 243,
    output: 216.8,
    focus: '数据服务、数字内容',
    occupancy: '87%',
    delta: 2.9,
  },
]

const selected = computed(
  () => regions.find((item) => item.name === selectedDistrict.value) || regions[0],
)

const rankingOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { top: 12, left: 70, right: 32, bottom: 18 },
  xAxis: {
    type: 'value',
    axisLabel: axisLabelStyle,
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: regions.map((item) => item.name),
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: { color: '#5d6d82', fontSize: 9 },
  },
  series: [
    {
      type: 'bar',
      barWidth: 9,
      data: regions.map((item) => item.value),
      showBackground: true,
      backgroundStyle: { color: '#f0f4f8', borderRadius: 6 },
      itemStyle: {
        borderRadius: 6,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#68a9e8' },
            { offset: 1, color: '#1769e0' },
          ],
        },
      },
      label: { show: true, position: 'right', color: '#7c899b', fontSize: 8 },
    },
  ],
}))

const trendOption = computed<EChartsOption>(() => ({
  tooltip: { ...chartTooltip, trigger: 'axis' },
  grid: { top: 18, left: 34, right: 15, bottom: 25 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
    axisLine: axisLineStyle,
    axisTick: { show: false },
    axisLabel: axisLabelStyle,
  },
  yAxis: {
    type: 'value',
    min: 70,
    max: 110,
    axisLabel: axisLabelStyle,
    splitLine: splitLineStyle,
    axisLine: { show: false },
  },
  series: [
    {
      name: '海淀区',
      type: 'line',
      smooth: true,
      data: [86.4, 88.1, 89.6, 90.4, 92.7, 93.8, 95.2, 96.8],
      lineStyle: { color: '#1769e0', width: 2 },
      itemStyle: { color: '#1769e0' },
      symbolSize: 4,
    },
    {
      name: '全市均值',
      type: 'line',
      smooth: true,
      data: [70.2, 71.4, 72.1, 72.8, 73.6, 74.1, 74.9, 75.6],
      lineStyle: { color: '#9eb0c4', width: 1.3, type: 'dashed' },
      symbol: 'none',
    },
  ],
}))

const districtTiles = computed(() =>
  regions.map((item, index) => ({
    ...item,
    span: index === 0 ? 2 : 1,
    tone: item.value > 90 ? 'high' : item.value > 70 ? 'mid' : 'low',
  })),
)

function refresh() {
  ElMessage.success('区域数据已刷新')
}

function exportRegion() {
  ElMessage.success('区域分析结果导出任务已创建')
}
</script>

<template>
  <div class="page-shell">
    <PageHeader
      title="区域与园区监测"
      description="观察产业在区域和园区中的空间集聚、企业密度与创新分布，支持区域对比和园区画像下钻。"
      :data-version="dataVersion"
      :updated-at="updatedAt"
    >
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
        <el-button :icon="Download" @click="exportRegion">导出分析</el-button>
      </template>
    </PageHeader>

    <FilterBar label="空间条件">
      <el-select model-value="人工智能" style="width: 140px">
        <el-option label="人工智能" value="人工智能" />
        <el-option label="集成电路" value="集成电路" />
      </el-select>
      <el-select v-model="metric" style="width: 145px">
        <el-option label="综合发展指数" value="综合发展指数" />
        <el-option label="企业密度" value="企业密度" />
        <el-option label="产业产值密度" value="产业产值密度" />
        <el-option label="专利密度" value="专利密度" />
      </el-select>
      <el-select v-model="layer" style="width: 125px">
        <el-option label="企业分布" value="企业分布" />
        <el-option label="风险分布" value="风险分布" />
        <el-option label="创新分布" value="创新分布" />
      </el-select>
      <el-date-picker model-value="2026-10" type="month" style="width: 140px" />
      <el-select model-value="街道级" style="width: 115px">
        <el-option label="街道级" value="街道级" />
        <el-option label="区级" value="区级" />
        <el-option label="园区级" value="园区级" />
      </el-select>
      <template #extra>
        <span class="status-line"><span class="inline-dot" />空间索引 2026-10-18</span>
      </template>
    </FilterBar>

    <div class="region-layout">
      <DataCard title="区域产业集聚" subtitle="示意布局，点击区县查看指标与园区">
        <div class="district-grid">
          <button
            v-for="item in districtTiles"
            :key="item.name"
            type="button"
            class="district-tile"
            :class="[`is-${item.tone}`, { 'is-selected': selectedDistrict === item.name }]"
            :style="{ gridColumn: `span ${item.span}` }"
            @click="selectedDistrict = item.name"
          >
            <div class="district-tile__head">
              <strong>{{ item.name }}</strong>
              <span>{{ item.value.toFixed(1) }}</span>
            </div>
            <div class="district-tile__meta">
              <span>{{ formatNumber(item.enterprises) }} 家企业</span>
              <span>{{ item.parks }} 个园区</span>
            </div>
            <div class="district-tile__bar"><i :style="{ width: `${item.value}%` }" /></div>
          </button>
        </div>
        <template #footer>
          <div class="region-legend">
            <span><i class="high" /> 高集聚</span>
            <span><i class="mid" /> 中集聚</span>
            <span><i class="low" /> 一般</span>
            <em>示意图 · 非 GIS 精确边界</em>
          </div>
        </template>
      </DataCard>

      <div class="region-side">
        <DataCard :title="selected.name" subtitle="区域产业概览">
          <div class="selected-region-head">
            <span>综合发展指数</span>
            <strong>{{ selected.value.toFixed(1) }}</strong>
            <em class="text-up">同比 +{{ selected.delta.toFixed(1) }}%</em>
          </div>
          <div class="selected-region-metrics">
            <div><span>企业数量</span><strong>{{ formatNumber(selected.enterprises) }}</strong></div>
            <div><span>营业收入</span><strong>{{ selected.revenue }} 亿元</strong></div>
            <div><span>园区数量</span><strong>{{ selected.parks }} 个</strong></div>
            <div><span>全市排名</span><strong>第 1 位</strong></div>
          </div>
          <div class="selected-region-tags">
            <span>人工智能核心区</span>
            <span>高校资源密集</span>
            <span>创新活力领先</span>
          </div>
        </DataCard>
        <DataCard title="指标趋势" subtitle="近 8 个月与全市均值对比">
          <BaseChart :option="trendOption" height="235px" />
        </DataCard>
      </div>
    </div>

    <div class="region-charts">
      <DataCard :title="`区县${metric}排名`" subtitle="按当前产业与统计口径">
        <BaseChart :option="rankingOption" height="315px" />
      </DataCard>
      <DataCard title="集聚特征" subtitle="区域产业结构与空间效率">
        <div class="cluster-features">
          <div><span>产业集聚度 LQ</span><strong>2.46</strong><i><b style="width: 82%" /></i></div>
          <div><span>重点企业占比</span><strong>18.7%</strong><i><b style="width: 64%" /></i></div>
          <div><span>产业链完整度</span><strong>76.4%</strong><i><b style="width: 76%" /></i></div>
          <div><span>园区土地产出</span><strong>28.6 亿/km²</strong><i><b style="width: 71%" /></i></div>
          <div><span>研发投入强度</span><strong>17.8%</strong><i><b style="width: 88%" /></i></div>
        </div>
        <div class="cluster-note">
          <el-icon><Position /></el-icon>
          海淀区在研发强度、产业链完整度和重点企业占比方面领先，但产业空间载体利用率已接近上限。
        </div>
      </DataCard>
    </div>

    <DataCard title="重点园区" subtitle="园区产出、企业集聚与招商方向">
      <template #actions>
        <el-button text size="small">查看全部园区</el-button>
      </template>
      <el-table :data="parks">
        <el-table-column label="园区" min-width="215">
          <template #default="{ row }">
            <button class="park-link" type="button" @click="router.push(`/monitoring/regions/park/${row.id}`)">
              <span><el-icon><MapLocation /></el-icon></span>
              <div><strong>{{ row.name }}</strong><small>{{ row.focus }}</small></div>
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="district" label="所在区" width="90" />
        <el-table-column label="企业数" width="90" align="right">
          <template #default="{ row }">{{ formatNumber(row.enterprises) }}</template>
        </el-table-column>
        <el-table-column label="产业产值" width="110" align="right">
          <template #default="{ row }">{{ row.output.toFixed(1) }} 亿元</template>
        </el-table-column>
        <el-table-column label="同比" width="80" align="right">
          <template #default="{ row }"><span class="text-up">+{{ row.delta }}%</span></template>
        </el-table-column>
        <el-table-column prop="occupancy" label="载体利用率" width="100" align="right" />
        <el-table-column label="操作" width="85" align="right">
          <template #default="{ row }">
            <el-button text size="small" @click="router.push(`/monitoring/regions/park/${row.id}`)">
              画像
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </DataCard>

    <div class="data-footnote">
      <span>区域数据按企业注册地聚合，园区范围来自园区边界配置。</span>
      <span>当前页面地图为布局示意，正式版接入 GIS 边界服务。</span>
    </div>
  </div>
</template>

<style scoped>
.region-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(310px, 0.55fr);
  gap: 16px;
}

.district-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 104px;
  gap: 9px;
}

.district-tile {
  position: relative;
  display: flex;
  min-width: 0;
  justify-content: center;
  flex-direction: column;
  padding: 13px;
  text-align: left;
  background: #f6faff;
  border: 1px solid #dfebf7;
  border-radius: 9px;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.district-tile:hover,
.district-tile.is-selected {
  border-color: #8bb8e8;
  transform: translateY(-2px);
}

.district-tile.is-mid {
  background: #f8fbfe;
}

.district-tile.is-low {
  background: #fbfcfd;
}

.district-tile__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 5px;
}

.district-tile__head strong {
  color: #2e4762;
  font-size: 11px;
  font-weight: 600;
}

.district-tile__head span {
  color: #1769e0;
  font-family: Georgia, serif;
  font-size: 20px;
}

.district-tile.is-mid .district-tile__head span {
  color: #4f86c1;
}

.district-tile.is-low .district-tile__head span {
  color: #7c93ab;
}

.district-tile__meta {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin: 7px 0 8px;
  color: #905e9a;
  font-size: 7px;
}

.district-tile__meta span {
  color: #8d99a9;
}

.district-tile__bar {
  height: 3px;
  overflow: hidden;
  background: #e8eff7;
  border-radius: 3px;
}

.district-tile__bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #75b6e3, #1769e0);
  border-radius: 3px;
}

.region-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8592a4;
  font-size: 8px;
}

.region-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.region-legend i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.region-legend .high {
  background: #1769e0;
}

.region-legend .mid {
  background: #76a6d6;
}

.region-legend .low {
  background: #aec1d4;
}

.region-legend em {
  margin-left: auto;
  color: #a1abba;
  font-size: 7px;
  font-style: normal;
}

.region-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-region-head {
  text-align: center;
}

.selected-region-head span,
.selected-region-head strong,
.selected-region-head em {
  display: block;
}

.selected-region-head span {
  color: #8794a5;
  font-size: 8px;
}

.selected-region-head strong {
  margin: 3px 0;
  color: #1769e0;
  font-family: Georgia, serif;
  font-size: 35px;
  font-weight: 500;
}

.selected-region-head em {
  font-size: 8px;
  font-style: normal;
}

.selected-region-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin-top: 12px;
  overflow: hidden;
  background: #e8eef5;
  border: 1px solid #e8eef5;
  border-radius: 7px;
}

.selected-region-metrics > div {
  padding: 9px;
  background: #fafbfd;
}

.selected-region-metrics span,
.selected-region-metrics strong {
  display: block;
}

.selected-region-metrics span {
  color: #8c98a8;
  font-size: 7px;
}

.selected-region-metrics strong {
  margin-top: 2px;
  color: #3a4e66;
  font-size: 10px;
  font-weight: 580;
}

.selected-region-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.selected-region-tags span {
  padding: 3px 6px;
  color: #5e7792;
  background: #f2f6fa;
  border-radius: 4px;
  font-size: 7px;
}

.region-charts {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
  gap: 16px;
}

.cluster-features {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.cluster-features > div {
  display: grid;
  grid-template-columns: 112px 92px 1fr;
  align-items: center;
  gap: 9px;
}

.cluster-features span {
  color: #607086;
  font-size: 8.5px;
}

.cluster-features strong {
  color: #33495f;
  font-size: 9px;
  font-weight: 580;
  text-align: right;
}

.cluster-features i {
  height: 5px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 5px;
}

.cluster-features b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #6fb2e3, #1769e0);
  border-radius: 5px;
}

.cluster-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 10px;
  margin-top: 15px;
  color: #738398;
  background: #f7fafd;
  border-radius: 6px;
  font-size: 8px;
  line-height: 1.6;
}

.cluster-note .el-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #5d93c7;
}

.park-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.park-link > span {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #4b7faf;
  background: #edf4fb;
  border-radius: 7px;
}

.park-link strong,
.park-link small {
  display: block;
}

.park-link strong {
  color: #3d5068;
  font-size: 9.5px;
  font-weight: 550;
}

.park-link small {
  margin-top: 2px;
  color: #929dad;
  font-size: 7.5px;
}

@media (max-width: 1080px) {
  .region-layout,
  .region-charts {
    grid-template-columns: 1fr;
  }

  .region-side {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 700px) {
  .district-grid {
    grid-template-columns: 1fr 1fr;
  }

  .district-tile {
    grid-column: span 1 !important;
  }

  .region-side {
    grid-template-columns: 1fr;
  }
}
</style>
