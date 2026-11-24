// A real deadline also covers response bodies and native fetch implementations
// that do not finish promptly when an AbortSignal is cancelled.
export async function fetchJson<T = unknown>(url: string, init: RequestInit = {}, options: {
  timeoutMs?: number; timeoutCode?: string; fetchImpl?: typeof fetch;
} = {}): Promise<T> {
  const { timeoutMs = 12000, timeoutCode = 'NETWORK', fetchImpl = fetch } = options;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  const stopped = new Promise<never>((_, reject) => {
    onAbort = () => { reject(new Error('REQUEST_CANCELLED')); controller.abort(); };
    if (init.signal?.aborted) { onAbort(); return; }
    init.signal?.addEventListener('abort', onAbort, { once: true });
    timer = setTimeout(() => { reject(new Error(timeoutCode)); controller.abort(); }, timeoutMs);
  });
  try {
    if (init.signal?.aborted) return await stopped;
    const operation = (async () => {
      let response: Response;
      try { response = await fetchImpl(url, { ...init, signal: controller.signal }); }
      catch { throw new Error('NETWORK'); }
      let data;
      try { data = await response.json(); } catch { throw new Error('NETWORK'); }
      if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'NETWORK');
      return data as T;
    })();
    return await Promise.race([operation, stopped]);
  } finally {
    clearTimeout(timer);
    if (onAbort) init.signal?.removeEventListener('abort', onAbort);
  }
}
