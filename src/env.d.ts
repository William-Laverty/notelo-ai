/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_STRIPE_PRICE_ID: string
  readonly VITE_STRIPE_WEBHOOK_SECRET: string
  readonly VITE_STRIPE_ENTERPRISE_PRICE_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 