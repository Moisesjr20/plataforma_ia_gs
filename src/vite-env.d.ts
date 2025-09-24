/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_N8N_WEBHOOK_SOFIA: string
  readonly VITE_N8N_WEBHOOK_CAROL: string
  readonly VITE_WEBHOOK_AUGUSTO: string
  readonly VITE_WEBHOOK_SOFIA: string
  readonly VITE_WEBHOOK_CAROL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}