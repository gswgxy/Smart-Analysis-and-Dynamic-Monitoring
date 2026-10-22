<script setup lang="ts">
import {
  Aim,
  ArrowDown,
  Bell,
  ChatDotRound,
  Checked,
  Coin,
  Collection,
  Connection,
  Cpu,
  DataAnalysis,
  DataBoard,
  Document,
  DocumentChecked,
  Download,
  EditPen,
  Expand,
  Files,
  Fold,
  Grid,
  List,
  MagicStick,
  MapLocation,
  Monitor,
  Notebook,
  Odometer,
  OfficeBuilding,
  Operation,
  QuestionFilled,
  Search,
  Setting,
  Share,
  Stamp,
  SwitchButton,
  Tickets,
  TrendCharts,
  UserFilled,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import type { Component } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { flatMenuMap, menuGroups } from '@/config/menu'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const iconMap: Record<string, Component> = {
  Aim,
  Bell,
  ChatDotRound,
  Checked,
  Coin,
  Collection,
  Connection,
  Cpu,
  DataAnalysis,
  DataBoard,
  Document,
  DocumentChecked,
  Download,
  EditPen,
  Files,
  Grid,
  List,
  MagicStick,
  MapLocation,
  Monitor,
  Notebook,
  Odometer,
  OfficeBuilding,
  Operation,
  Setting,
  Share,
  Stamp,
  Tickets,
  TrendCharts,
  UserFilled,
  Warning,
}

const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)
const searchVisible = ref(false)
const searchKeyword = ref('')

const currentGroup = computed(() => route.meta.group || '总览')
const currentTitle = computed(() => route.meta.title || '业务工作台')

const normalizedActive = computed(() => {
  const path = route.path
  if (path.startsWith('/monitoring/risks/')) return '/monitoring/risks'
  if (path.startsWith('/monitoring/regions/park/')) return '/monitoring/regions'
  if (path.startsWith('/analysis/trust/')) return '/analysis/evidence'
  if (path.startsWith('/reports/detail/')) return '/reports'
  if (path.startsWith('/reports/editor/')) return '/reports'
  if (path.startsWith('/reviews/workbench/')) return '/reviews/tasks'
  return path
})

const openedMenus = computed(() =>
  menuGroups.filter((group) => group.children && group.title === currentGroup.value).map((group) => group.title),
)

const searchResults = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return [...flatMenuMap.entries()]
    .filter(([path, title]) => !keyword || title.toLowerCase().includes(keyword) || path.includes(keyword))
    .slice(0, 12)
})

function updateViewport() {
  isMobile.value = window.innerWidth < 820
  if (!isMobile.value) mobileOpen.value = false
}

function navigate(path: string) {
  router.push(path)
  mobileOpen.value = false
  searchVisible.value = false
  searchKeyword.value = ''
}

function toggleSidebar() {
  if (isMobile.value) {
    mobileOpen.value = !mobileOpen.value
  } else {
    collapsed.value = !collapsed.value
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('退出后需要重新登录，是否继续？', '退出登录', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    })
    auth.logout()
    router.replace('/login')
  } catch {
    // 用户取消
  }
}

function openNotifications() {
  router.push('/notifications')
}

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  auth.fetchCurrentUser().catch(() => {
    // 401 由请求层统一处理；其他错误保留本地用户信息。
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <div class="app-layout" :class="{ 'is-collapsed': collapsed }">
    <div v-if="mobileOpen" class="sidebar-mask" @click="mobileOpen = false" />

    <aside class="sidebar" :class="{ 'is-mobile-open': mobileOpen }">
      <div class="brand" @click="router.push('/dashboard')">
        <div class="brand__mark">
          <span />
          <span />
          <span />
        </div>
        <div v-show="!collapsed || isMobile" class="brand__text">
          <strong>数字产业 · 北京</strong>
          <small>DYNAMIC INTELLIGENCE</small>
        </div>
      </div>

      <div v-show="!collapsed || isMobile" class="workspace-chip">
        <span class="workspace-chip__dot" />
        <div>
          <strong>北京市产业监测中心</strong>
          <small>统一分析工作空间</small>
        </div>
      </div>

      <el-scrollbar class="sidebar__scroll">
        <el-menu
          :default-active="normalizedActive"
          :default-openeds="openedMenus"
          :collapse="collapsed && !isMobile"
          :collapse-transition="false"
          unique-opened
          class="side-menu"
          @select="navigate"
        >
          <template v-for="group in menuGroups" :key="group.title">
            <el-menu-item v-if="group.path" :index="group.path">
              <el-icon>
                <component :is="iconMap[group.icon]" />
              </el-icon>
              <template #title>{{ group.title }}</template>
            </el-menu-item>
            <el-sub-menu v-else :index="group.title">
              <template #title>
                <el-icon>
                  <component :is="iconMap[group.icon]" />
                </el-icon>
                <span>{{ group.title }}</span>
              </template>
              <el-menu-item
                v-for="child in group.children"
                :key="child.path"
                :index="child.path"
              >
                <el-icon>
                  <component :is="iconMap[child.icon]" />
                </el-icon>
                <template #title>{{ child.title }}</template>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-scrollbar>

      <div class="sidebar__footer">
        <div v-show="!collapsed || isMobile" class="system-health">
          <div class="system-health__line">
            <span><i class="inline-dot" />服务运行正常</span>
            <strong>99.9%</strong>
          </div>
          <div class="system-health__bar"><span /></div>
          <small>数据版本 V2026.10.18</small>
        </div>
        <button class="collapse-button" type="button" @click="toggleSidebar">
          <el-icon>
            <Expand v-if="collapsed && !isMobile" />
            <Fold v-else />
          </el-icon>
        </button>
      </div>
    </aside>

    <div class="app-main">
      <header class="topbar">
        <div class="topbar__left">
          <button class="icon-button mobile-toggle" type="button" @click="toggleSidebar">
            <el-icon><Expand /></el-icon>
          </button>
          <div class="breadcrumb">
            <span>北京数字产业平台</span>
            <i>/</i>
            <span>{{ currentGroup }}</span>
            <i>/</i>
            <strong>{{ currentTitle }}</strong>
          </div>
        </div>

        <div class="topbar__right">
          <button class="search-trigger" type="button" @click="searchVisible = true">
            <el-icon><Search /></el-icon>
            <span>搜索功能、指标或企业</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div class="data-status">
            <span class="data-status__pulse" />
            <span>数据更新至 10-18</span>
          </div>
          <button class="icon-button notification-button" type="button" @click="openNotifications">
            <el-icon><Bell /></el-icon>
            <span class="notification-dot" />
          </button>
          <el-dropdown trigger="click">
            <div class="user-menu">
              <div class="user-avatar">{{ auth.initials }}</div>
              <div class="user-copy">
                <strong>{{ auth.displayName }}</strong>
                <small>{{ auth.role || '授权用户' }}</small>
              </div>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <el-icon><UserFilled /></el-icon>
                  {{ auth.user?.username || 'admin' }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="route-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>

    <el-dialog v-model="searchVisible" width="min(620px, 92vw)" class="command-dialog" :show-close="false">
      <div class="command-input">
        <el-icon><Search /></el-icon>
        <input
          v-model="searchKeyword"
          autofocus
          type="text"
          placeholder="输入功能名称，例如“风险”“企业画像”"
        />
        <kbd>ESC</kbd>
      </div>
      <div class="command-results">
        <div class="command-results__label">功能导航</div>
        <button
          v-for="[path, title] in searchResults"
          :key="path"
          type="button"
          @click="navigate(path)"
        >
          <span>{{ title }}</span>
          <small>{{ path }}</small>
          <el-icon><ArrowDown class="result-arrow" /></el-icon>
        </button>
        <div v-if="!searchResults.length" class="command-empty">没有匹配的功能</div>
      </div>
      <div class="command-help">
        <span><el-icon><QuestionFilled /></el-icon> 支持按功能名称快速定位</span>
        <span>数据访问受账号权限控制</span>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #f3f6fa;
}

.sidebar {
  position: fixed;
  z-index: 50;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  width: 244px;
  flex-direction: column;
  overflow: hidden;
  color: #dfe9f7;
  background:
    radial-gradient(circle at 16% 2%, rgba(21, 184, 199, 0.14), transparent 27%),
    linear-gradient(180deg, #0a1f39 0%, #07182d 100%);
  box-shadow: 8px 0 30px rgba(4, 21, 41, 0.12);
  transition: width 0.24s ease, transform 0.24s ease;
}

.sidebar::after {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 180px;
  height: 180px;
  background-image:
    linear-gradient(rgba(100, 148, 195, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 148, 195, 0.045) 1px, transparent 1px);
  background-size: 18px 18px;
  content: "";
  pointer-events: none;
  mask-image: linear-gradient(135deg, transparent 18%, #000 100%);
}

.is-collapsed .sidebar {
  width: 74px;
}

.brand {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 76px;
  align-items: center;
  gap: 11px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(158, 191, 226, 0.1);
  cursor: pointer;
}

.brand__mark {
  position: relative;
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  padding: 8px 7px;
  background: linear-gradient(145deg, rgba(21, 184, 199, 0.22), rgba(23, 105, 224, 0.32));
  border: 1px solid rgba(116, 205, 228, 0.3);
  border-radius: 10px;
}

.brand__mark span {
  width: 4px;
  background: linear-gradient(180deg, #7de4ed, #48a5ff);
  border-radius: 2px 2px 0 0;
}

.brand__mark span:nth-child(1) {
  height: 9px;
}

.brand__mark span:nth-child(2) {
  height: 16px;
}

.brand__mark span:nth-child(3) {
  height: 12px;
}

.brand__text {
  min-width: 0;
}

.brand__text strong {
  display: block;
  overflow: hidden;
  color: #f7fbff;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand__text small {
  display: block;
  margin-top: 3px;
  color: #6483a7;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.workspace-chip {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 14px 12px 8px;
  padding: 9px 10px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(144, 180, 219, 0.1);
  border-radius: 9px;
}

.workspace-chip__dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  background: #5ed9c3;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(94, 217, 195, 0.09);
}

.workspace-chip strong,
.workspace-chip small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-chip strong {
  color: #c5d7ea;
  font-size: 11px;
  font-weight: 500;
}

.workspace-chip small {
  margin-top: 2px;
  color: #5f7897;
  font-size: 9px;
}

.sidebar__scroll {
  position: relative;
  z-index: 1;
  flex: 1;
}

.side-menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #91a8c2;
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.045);
  --el-menu-active-color: #ffffff;
  padding: 5px 7px 60px;
  border-right: 0;
}

.side-menu :deep(.el-sub-menu__title),
.side-menu :deep(.el-menu-item) {
  height: 41px;
  margin: 2px 0;
  padding-right: 12px;
  padding-left: 13px !important;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 41px;
}

.side-menu :deep(.el-sub-menu__title) {
  font-weight: 500;
}

.side-menu :deep(.el-sub-menu__title .el-icon),
.side-menu :deep(.el-menu-item .el-icon) {
  margin-right: 9px;
  font-size: 16px;
}

.side-menu :deep(.el-sub-menu .el-menu-item) {
  min-width: 0;
  height: 38px;
  padding-left: 42px !important;
  color: #839bb7;
  font-size: 12px;
  line-height: 38px;
}

.side-menu :deep(.el-sub-menu .el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 14px;
}

.side-menu :deep(.el-menu-item:hover),
.side-menu :deep(.el-sub-menu__title:hover) {
  color: #e8f3ff;
}

.side-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: linear-gradient(90deg, rgba(23, 105, 224, 0.76), rgba(21, 143, 173, 0.35));
  box-shadow: inset 3px 0 0 #6fe1e6;
}

.side-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #dcecff;
}

.sidebar__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px 13px;
  border-top: 1px solid rgba(147, 179, 213, 0.09);
}

.system-health {
  min-width: 0;
  flex: 1;
}

.system-health__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7e97b4;
  font-size: 9px;
}

.system-health__line strong {
  color: #73d9c5;
  font-size: 9px;
  font-weight: 600;
}

.system-health__bar {
  height: 3px;
  margin: 6px 0 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
}

.system-health__bar span {
  display: block;
  width: 89%;
  height: 100%;
  background: linear-gradient(90deg, #15b8c7, #5dd7c1);
}

.system-health small {
  color: #506886;
  font-size: 8.5px;
}

.collapse-button {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #7993b2;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(147, 179, 213, 0.1);
  border-radius: 7px;
  cursor: pointer;
}

.collapse-button:hover {
  color: #d9e9fa;
}

.app-main {
  min-height: 100vh;
  margin-left: 244px;
  transition: margin-left 0.24s ease;
}

.is-collapsed .app-main {
  margin-left: 74px;
}

.topbar {
  position: sticky;
  z-index: 40;
  top: 0;
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 25px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(221, 229, 239, 0.88);
  backdrop-filter: blur(14px);
}

.topbar__left,
.topbar__right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b97a8;
  font-size: 11px;
  white-space: nowrap;
}

.breadcrumb i {
  color: #c5ceda;
  font-style: normal;
}

.breadcrumb strong {
  color: #3d4d63;
  font-weight: 550;
}

.mobile-toggle {
  display: none !important;
}

.search-trigger {
  display: flex;
  width: min(270px, 22vw);
  height: 34px;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  color: #8a96a7;
  background: #f6f8fb;
  border: 1px solid #e5ebf2;
  border-radius: 8px;
  cursor: pointer;
}

.search-trigger span {
  overflow: hidden;
  flex: 1;
  font-size: 11px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

kbd {
  padding: 2px 5px;
  color: #8793a4;
  background: #fff;
  border: 1px solid #e1e7ee;
  border-radius: 4px;
  font-family: inherit;
  font-size: 9px;
}

.data-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #748297;
  font-size: 10px;
  white-space: nowrap;
}

.data-status__pulse {
  width: 6px;
  height: 6px;
  background: #0ba58a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(11, 165, 138, 0.1);
}

.icon-button {
  position: relative;
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  color: #637187;
  background: #fff;
  border: 1px solid #e4eaf1;
  border-radius: 8px;
  cursor: pointer;
}

.icon-button:hover {
  color: var(--dip-blue);
  border-color: #c9daf2;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 5px;
  height: 5px;
  background: #df4f56;
  border: 1px solid #fff;
  border-radius: 50%;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 4px 3px 3px;
  border-radius: 9px;
  cursor: pointer;
}

.user-menu:hover {
  background: #f5f8fc;
}

.user-avatar {
  display: flex;
  width: 33px;
  height: 33px;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #1a78df, #14a6ad);
  border-radius: 9px;
  font-size: 10px;
  font-weight: 600;
}

.user-copy strong,
.user-copy small {
  display: block;
  line-height: 1.35;
  white-space: nowrap;
}

.user-copy strong {
  color: #2d3c52;
  font-size: 11px;
  font-weight: 600;
}

.user-copy small {
  margin-top: 1px;
  color: #8a96a8;
  font-size: 9px;
}

.user-arrow {
  color: #a1acbb;
  font-size: 10px;
}

.content-area {
  min-height: calc(100vh - 64px);
  padding: 20px 25px 30px;
  background:
    radial-gradient(circle at 82% 3%, rgba(40, 122, 214, 0.045), transparent 24%),
    #f3f6fa;
}

.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.route-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.route-fade-leave-to {
  opacity: 0;
}

.command-dialog :deep(.el-dialog__header) {
  display: none;
}

.command-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.command-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--dip-line);
}

.command-input .el-icon {
  color: #8190a4;
  font-size: 18px;
}

.command-input input {
  min-width: 0;
  flex: 1;
  color: #24344c;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 14px;
}

.command-results {
  max-height: 360px;
  padding: 10px;
  overflow-y: auto;
}

.command-results__label {
  padding: 5px 8px 7px;
  color: #9aa5b4;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.command-results button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px 9px;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 7px;
  cursor: pointer;
}

.command-results button:hover {
  background: #f3f7fd;
}

.command-results button span {
  color: #2f4058;
  font-size: 12px;
  font-weight: 500;
}

.command-results button small {
  flex: 1;
  color: #a0aab8;
  font-size: 9px;
}

.result-arrow {
  color: #a1afc1;
  transform: rotate(-90deg);
}

.command-empty {
  padding: 32px;
  color: #8c98a9;
  font-size: 12px;
  text-align: center;
}

.command-help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 18px;
  color: #919cac;
  background: #f8fafc;
  border-top: 1px solid var(--dip-line);
  border-radius: 0 0 14px 14px;
  font-size: 9px;
}

.command-help span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sidebar-mask {
  position: fixed;
  z-index: 49;
  inset: 0;
  background: rgba(4, 17, 31, 0.45);
  backdrop-filter: blur(2px);
}

@media (max-width: 1080px) {
  .search-trigger {
    width: 36px;
    justify-content: center;
    padding: 0;
  }

  .search-trigger span,
  .search-trigger kbd {
    display: none;
  }

  .data-status {
    display: none;
  }
}

@media (max-width: 820px) {
  .sidebar {
    width: 244px;
    transform: translateX(-104%);
  }

  .sidebar.is-mobile-open {
    transform: translateX(0);
  }

  .is-collapsed .sidebar {
    width: 244px;
  }

  .app-main,
  .is-collapsed .app-main {
    margin-left: 0;
  }

  .mobile-toggle {
    display: flex !important;
  }

  .topbar {
    padding: 0 15px;
  }

  .breadcrumb span:first-child,
  .breadcrumb i:first-of-type {
    display: none;
  }

  .user-copy,
  .user-arrow {
    display: none;
  }

  .content-area {
    padding: 16px 14px 24px;
  }
}
</style>
