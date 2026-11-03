/// <reference types="vite/client" />

//? import.meta.env.VITE_API_URL'e tip veriyoruz; yoksa TypeScript bunu "any" sayar ve yazım hatalarını yakalamaz.
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
