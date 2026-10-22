export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  traceId: string
  timestamp: string
}

export interface PlatformUser {
  id: number | string
  username: string
  display_name: string
  role: string
}

export interface LoginResult {
  access_token: string
  token_type: string
  user: PlatformUser
}

export interface OverviewPayload {
  message: string
  currentUser: string
  metrics: {
    enterpriseCount: number
    riskCount: number
  }
}

export interface EvidenceItem {
  id: string
  title: string
  sourceType: string
  source: string
  snippet: string
  publishedAt: string
  trustLevel: TrustLevel
}

export type RiskLevel = 'R1' | 'R2' | 'R3' | 'R4' | 'R5'
export type TrustLevel = 'A' | 'B' | 'C' | 'D'

export interface RiskRecord {
  id: string
  title: string
  type: string
  level: RiskLevel
  score: number
  enterprise: string
  region: string
  chainNode: string
  status: string
  detectedAt: string
  owner: string
  trend: 'up' | 'down' | 'flat'
  summary: string
}

export interface ChainNode {
  id: string
  label: string
  sublabel: string
  stage: '上游' | '中游' | '下游'
  risk: RiskLevel
  score: number
  enterprises: number
  x: number
  y: number
  width: number
}

export interface ChainEdge {
  source: string
  target: string
  weight: number
  risk: boolean
}

export interface QaAnswer {
  answer: string
  evidence: EvidenceItem[]
  trustLevel: TrustLevel
  sessionId: string
  algorithmVersion: string
}
