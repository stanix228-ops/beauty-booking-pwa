/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_LLM_BASE_URL?: string;
  readonly VITE_LLM_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'liquid-gl' {
  export interface LiquidGLOptions {
    target: string | HTMLElement;
    snapshot?: string | HTMLElement;
    engine?: 'auto' | 'webgpu' | 'webgl2' | 'webgl1' | 'css';
    resolution?: number;
    zIndex?: number;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: string;
    tilt?: boolean;
    tiltFactor?: number;
    draggable?: boolean;
    interaction?: 'none' | 'fluid';
    magnify?: number;
    tint?: string;
    content?: any;
    on?: {
      init?: (instance: any) => void;
    };
  }

  export interface LiquidGLInstance {
    destroy: () => void;
    setTint: (tint: string) => void;
    setDraggable: (draggable: boolean) => void;
  }

  export default function liquidGL(options: LiquidGLOptions): LiquidGLInstance;
}
