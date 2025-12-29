declare global {
  interface ImportMetaEnv {
    readonly NG_APP_API_URL?: string;
    readonly NG_APP_ENV?: string;
    readonly NG_APP_RECAPTCHA_KEY?: string;
    readonly MODE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
