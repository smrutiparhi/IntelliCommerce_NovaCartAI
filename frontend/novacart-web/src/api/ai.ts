import { apiClient } from '../lib/api-client'

export interface AssistantCitation {
  id: string
  title: string
  source: string
}

export interface AssistantReply {
  answer: string
  citations: AssistantCitation[]
  mode: string
}

export async function askNova(message: string): Promise<AssistantReply> {
  return (await apiClient.post<AssistantReply>('/ai/chat', { message })).data
}

export interface CancellationProposal { confirmationToken: string; orderId: string; expiresAt: string; message: string }
export interface CancellationResult { orderId: string; status: string; message: string }
export async function proposeCancellation(orderId: string): Promise<CancellationProposal> {
  return (await apiClient.post<CancellationProposal>('/ai/cancel/propose', { orderId })).data
}
export async function confirmCancellation(confirmationToken: string): Promise<CancellationResult> {
  return (await apiClient.post<CancellationResult>('/ai/cancel/confirm', { confirmationToken })).data
}

export interface ComparisonReply { summary: string; products: Array<{ id: string; title: string; brand: string; priceInPaise: number; rating: number }>; citations: AssistantCitation[] }
export async function compareNovaProducts(firstProductId: string, secondProductId: string): Promise<ComparisonReply> {
  return (await apiClient.post<ComparisonReply>('/ai/compare', { firstProductId, secondProductId })).data
}

export interface AiAnalytics {
  queries: number
  groundedResponses: number
  emptyRetrievals: number
  orderTrackingCalls: number
  comparisonCalls: number
  cancellationProposals: number
  confirmedCancellations: number
  helpfulRatings: number
  unhelpfulRatings: number
  groundingRate: number
  averageRetrievedProducts: number
}

export async function getAiAnalytics(): Promise<AiAnalytics> {
  return (await apiClient.get<AiAnalytics>('/ai/analytics')).data
}

export async function submitAiFeedback(messageId: string, helpful: boolean): Promise<void> {
  await apiClient.post('/ai/feedback', { messageId, helpful })
}

export interface RagIndexStatus {
  chunks: number
  embeddingModel: string
  responseModel: string
  modelEnabled: boolean
  provider: 'local' | 'openai' | 'gemini'
  indexing: boolean
  lastIndexedAt: string | null
  lastError: string | null
}

export async function getRagStatus(): Promise<RagIndexStatus> {
  return (await apiClient.get<RagIndexStatus>('/ai/rag/status')).data
}

export async function reindexRag(): Promise<RagIndexStatus> {
  return (await apiClient.post<RagIndexStatus>('/ai/rag/reindex')).data
}
