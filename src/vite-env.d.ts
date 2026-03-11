/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_DETECTION_API_URL: string;
    readonly VITE_DETECTION_API: string;
    readonly VITE_REVENUECAT_IOS_KEY: string;
    readonly VITE_REVENUECAT_GOOGLE_KEY: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_AUTH_REDIRECT_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
