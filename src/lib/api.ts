import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Locale } from './copy';
import type { CheckContext } from './checkFlow';
import { fetchJson } from './http';

export type Assessment = {
  status: 'assessed' | 'insufficient_information'; riskLevel: number | null;
  summary: string; observedSignals: string[]; recommendedActions: string[]; limitations: string[];
  extractedText: string; detectedUrls: string[];
  messageRiskLevel: number | null;
  evidenceQuality: 'limited' | 'moderate' | 'strong'; evidence: { quote: string; reason: string }[];
  urlEvidence: { url: string; hostname: string; unicodeHostname: string; signals: string[]; reputation: { status: 'listed' | 'not_listed' | 'unavailable'; source: string; fetchedAt: string | null; stale: boolean } }[];
  analysisMode: 'ai'; analyzedAt: string; locale: Locale;
};
export function apiOrigin() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.origin;
  const previewApi = Constants.expoConfig?.extra?.previewApiUrl;
  if (typeof previewApi === 'string' && /^https?:\/\//.test(previewApi)) return previewApi.replace(/\/$/, '');
  const host = Constants.expoConfig?.hostUri || 'localhost:8081';
  return `${host.includes('exp.direct') || host.includes('ngrok') ? 'https' : 'http'}://${host}`;
}
export async function health() {
  return fetchJson<{ ok: boolean; configured: boolean }>(`${apiOrigin()}/api/health`, {}, { timeoutMs: 6000 });
}
type Request = { text: string; sender: string; image: string | null; locale: Locale; consent: boolean; source?: 'text' | 'reviewed_screenshot' | 'transcribed_screenshot'; reviewConfirmed?: boolean; prepared?: boolean; context?: CheckContext };
export type Extraction = { status: 'readable' | 'unclear'; text: string; sender: string; warnings: string[] };
export async function requestExtraction(body: Request, signal: AbortSignal): Promise<Extraction> { return request<Extraction>('/api/extract', body, signal); }
export async function requestAssessment(body: Request, signal: AbortSignal): Promise<Assessment> { return request<Assessment>('/api/analyze', body, signal); }
async function request<T>(path: string, body: Request, signal: AbortSignal): Promise<T> {
    return fetchJson<T>(`${apiOrigin()}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Constants.expoConfig?.extra?.developmentToken || ''}` },
      body: JSON.stringify(body), signal,
    }, { timeoutMs: 50000, timeoutCode: 'AI_TIMEOUT' });
}
