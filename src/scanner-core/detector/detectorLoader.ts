/**
 * 🔒 DETECTOR LOADER
 * This module is the absolute single source of truth for loading the YOLO backend
 * or local model across the entire application. 
 */
export const DETECTOR_LOADER_LOCKED = true;

export type LoaderType = 'remote_backend' | 'bundled_model' | 'onnx' | 'tfjs';

export interface LoaderDiagnostic {
  loaderType: LoaderType;
  source: string;
  status?: number;
  responseText?: string;
  fileExists?: boolean;
  expectedFormat?: string;
  actualFormat?: string;
}

// Centralized API resolution for the entire app
export const getDetectionAPIUrl = (): string => {
  // 1. Explicit Environment Variable (dev overrides)
  // Phase 25: Support both names, prioritizing the user's preferred "SCANNER_BACKEND_URL" (with VITE_ prefix)
  if (import.meta.env.VITE_SCANNER_BACKEND_URL) {
    return import.meta.env.VITE_SCANNER_BACKEND_URL;
  }
  if (import.meta.env.VITE_DETECTION_API) {
    return import.meta.env.VITE_DETECTION_API;
  }

  const isNative = !!(window as any).Capacitor?.isNativePlatform?.() ||
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:';

  let url = '/api';
  if (isNative) {
    url = 'https://api.keydesignmedia.xyz/api'; // Primary production fallback
  }

  console.log(`[ScannerCore:Loader] Detection API URL resolved to: ${url} (isNative: ${isNative})`);
  return url;
};

/**
 * Perform the raw fetch against the YOLO detection server, meticulously catching 
 * and logging the exact failure mode (CORS, 502, 404, TCP timeout, etc.).
 * 
 * Phase 25: Implements 3 attempts with exponential backoff for production stability.
 */
export const fetchDetectorBackend = async (
  formData: FormData,
  signal?: AbortSignal
): Promise<{ data: any, diagnostic: LoaderDiagnostic }> => {
  const apiUrl = getDetectionAPIUrl();
  const endpoint = `${apiUrl}/detect`;

  const diagnostic: LoaderDiagnostic = {
    loaderType: 'remote_backend',
    source: endpoint,
    expectedFormat: 'json',
  };

  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        signal
      });

      diagnostic.status = response.status;
      
      if (!response.ok) {
        diagnostic.responseText = await response.text().catch(() => 'no text returned');
        const httpError = new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        throw { error: httpError, diagnostic };
      }

      let data: any;
      try {
        data = await response.json();
        diagnostic.actualFormat = 'json';
        return { data, diagnostic }; // Success!
      } catch (jsonError: any) {
        diagnostic.responseText = await response.text().catch(() => 'unparseable body');
        diagnostic.actualFormat = 'text/unknown';
        const parseError = new Error(`JSON Parse Error: ${jsonError.message}`);
        parseError.cause = jsonError;
        throw { error: parseError, diagnostic };
      }

    } catch (err: any) {
      lastError = err;
      
      // Don't retry if aborted by user/timeout
      if (err.name === 'AbortError' || err.error?.name === 'AbortError' || err.message?.includes('The user aborted')) {
        throw err;
      }

      const isRetryable = attempt < MAX_RETRIES && (
        !diagnostic.status || // Network failure
        diagnostic.status >= 500 // Server error
      );

      if (isRetryable) {
        const delay = Math.pow(2, attempt) * 200; // 400ms, 800ms
        console.warn(`[ScannerCore:Loader] Attempt ${attempt} failed. Retrying in ${delay}ms...`, err.message || err);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not retryable or max attempts reached, wrap and throw
      if (err.diagnostic) throw err;
      
      const errorDetails = new Error(`Network Request Failed after ${attempt} attempts: ${err.message || String(err)}`);
      errorDetails.cause = err;
      throw { error: errorDetails, diagnostic };
    }
  }

  throw lastError; // Should not be reachable
};
