/**
 * Centrailzed API Service for HelloBrick.
 * Relies on Capacitor 6's automatic fetch patching (via CapacitorHttp plugin).
 */
export const apiRequest = async (url: string, options: any = {}): Promise<any> => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'No error body');
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
};

export const apiFormRequest = async (url: string, formData: FormData): Promise<any> => {
    // Patched fetch handles FormData natively in Capacitor 6
    const res = await fetch(url, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) {
        const errorText = await res.text().catch(() => 'No error body');
        throw new Error(`Form API Error ${res.status}: ${errorText}`);
    }
    return res.json();
};
