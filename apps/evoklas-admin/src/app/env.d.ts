interface ImportMetaEnv {
  readonly NG_APP_API_URL?: string;
  readonly NG_APP_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
