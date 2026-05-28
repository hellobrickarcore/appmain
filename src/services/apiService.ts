/**
 * Centrailzed API Service for HelloBrick.
 * Relies on Capacitor 6's automatic fetch patching (via CapacitorHttp plugin).
 */
export const apiRequest = async (url: string, options: any = {}): Promise<any> => {
  const timeoutMs = options.timeoutMs || 5000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error body');
      throw new Error(`API Error ${res.status}: ${errorText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
};

export const apiFormRequest = async (url: string, formData: FormData, timeoutMs = 5000): Promise<any> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        if (!res.ok) {
            const errorText = await res.text().catch(() => 'No error body');
            throw new Error(`Form API Error ${res.status}: ${errorText}`);
        }
        return await res.json();
    } finally {
        clearTimeout(id);
    }
};
