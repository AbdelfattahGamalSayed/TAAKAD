import { readFileSync } from 'node:fs';
export class AnalysisError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function readConfig() {
  const values = {};
  try {
    for (const line of readFileSync(new URL('./.env', import.meta.url), 'utf8').split(/\r?\n/)) {
      const match = line.trim().match(/^([A-Z_]+)\s*=\s*(.*)$/);
      if (match) values[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch { /* Configuration may be absent during setup. */ }
  return { key: values.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '', model: values.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini' };
}
export async function structuredCall({ instructions, text, image = null, schema, name }, { config = readConfig(), fetchImpl = fetch } = {}) {
  if (!config.key || config.key.includes('YOUR_')) throw new AnalysisError('API_NOT_CONFIGURED', 503);
  const content = [{ type: 'input_text', text }];
  if (image) content.push({ type: 'input_image', image_url: image, detail: 'high' });
  let response;
  try {
    response = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: 'Bearer ' + config.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, instructions, input: [{ role: 'user', content }], store: false, max_output_tokens: 4000,
        text: { format: { type: 'json_schema', name, strict: true, schema } } }), signal: AbortSignal.timeout(45000),
    });
  } catch (error) { throw new AnalysisError(['TimeoutError', 'AbortError'].includes(error.name) ? 'AI_TIMEOUT' : 'AI_UNREACHABLE', 503); }
  if (!response.ok) {
    if ([401, 403].includes(response.status)) throw new AnalysisError('API_AUTH_ERROR', 503);
    if (response.status === 429) throw new AnalysisError('API_LIMIT', 429);
    throw new AnalysisError('AI_UNAVAILABLE', 502);
  }
  try {
    const data = await response.json();
    if (data.status && data.status !== 'completed') throw new Error('Incomplete');
    const output = (data.output || []).flatMap(item => item.content || []).filter(item => item.type === 'output_text').map(item => item.text).join('');
    return JSON.parse(output);
  } catch { throw new AnalysisError('INVALID_AI_RESPONSE', 502); }
}
