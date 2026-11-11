export interface ThemeDefinition {
  id: string;
  name: string;
  category: string;
  colors: {
    bg: string;
    surface: string;
    hover: string;
    border: string;
    accent: string;
    accentHover: string;
    textPrimary: string;
    textSecondary: string;
    waveActive: string;
    waveInactive: string;
  };
}

export interface CustomBackground {
  type: 'none' | 'image' | 'video';
  url: string;
  opacity: number;
  blur: number;
  fit?: 'cover' | 'contain' | 'center';
  vignette?: boolean;
}

export const THEME_PRESETS: ThemeDefinition[] = [
  {
    id: 'soundcloud',
    name: 'SoundCloud Classic (Оригинал)',
    category: 'Official',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#ff5500',
      accentHover: '#ff6a00',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#ff5500',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'tokyo-crimson',
    name: 'Tokyo Crimson (Токийский Рубин)',
    category: 'Vibrant',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#f43f5e',
      accentHover: '#fb7185',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#f43f5e',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Studio (Изумрудная Волна)',
    category: 'Studio',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#10b981',
      accentHover: '#34d399',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#10b981',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'nordic',
    name: 'Nordic Frost (Северный Лед)',
    category: 'Atmospheric',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#38bdf8',
      accentHover: '#60a5fa',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#38bdf8',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'cyber-amber',
    name: 'Cyber Amber (Теплый Янтарь)',
    category: 'Vibrant',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#f59e0b',
      accentHover: '#fbbf24',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#f59e0b',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'amethyst',
    name: 'Amethyst Violet (Аметист)',
    category: 'Atmospheric',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#a855f7',
      accentHover: '#c084fc',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#a855f7',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'monochrome',
    name: 'Studio Platinum (Платина и Серебро)',
    category: 'Minimal',
    colors: {
      bg: '#101013',
      surface: '#18181d',
      hover: '#222228',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#e4e4e7',
      accentHover: '#ffffff',
      textPrimary: '#ffffff',
      textSecondary: '#9ca3af',
      waveActive: '#e4e4e7',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
  {
    id: 'oled',
    name: 'OLED Pure Black (Абсолютный Черный)',
    category: 'Minimal',
    colors: {
      bg: '#000000',
      surface: '#0d0d10',
      hover: '#16161b',
      border: 'rgba(255, 255, 255, 0.10)',
      accent: '#ffffff',
      accentHover: '#e4e4e7',
      textPrimary: '#ffffff',
      textSecondary: '#888888',
      waveActive: '#ffffff',
      waveInactive: 'rgba(255, 255, 255, 0.20)',
    },
  },
];

export const BACKGROUND_PRESETS = [
  {
    name: 'Tokyo Red Rain (Аниме дождь)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Cyberpunk Shinjuku (Неоновый Токио)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Anime Cyber City Night (Ночной мегаполис)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Purple Synthwave Sunset (Ретро закат)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Cosmic Nebula Stars (Космическая туманность)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Tokyo Alley Night Walk (Улочка Токио)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1920&q=80',
  },
];

const THEME_STORAGE_KEY = 'sc_custom_theme_id';
const BG_STORAGE_KEY = 'sc_custom_background_config';

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: ThemeDefinition = THEME_PRESETS[0];
  private customBg: CustomBackground = {
    type: 'none',
    url: '',
    opacity: 50,
    blur: 0,
    fit: 'cover',
    vignette: true,
  };
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.load();
    this.applyToDOM();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private load(): void {
    try {
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const found = THEME_PRESETS.find((t) => t.id === savedThemeId);
        if (found) this.currentTheme = found;
      }
      const savedBg = localStorage.getItem(BG_STORAGE_KEY);
      if (savedBg) {
        this.customBg = JSON.parse(savedBg);
      }
    } catch {}
  }

  public applyToDOM(): void {
    const root = document.documentElement;
    const c = this.currentTheme.colors;
    root.style.setProperty('--sc-bg', c.bg);
    root.style.setProperty('--sc-bg-elevated', c.surface);
    root.style.setProperty('--sc-surface', c.surface);
    root.style.setProperty('--sc-surface-2', c.hover);
    root.style.setProperty('--sc-surface-3', '#2a2a32');
    root.style.setProperty('--sc-hover', c.hover);
    root.style.setProperty('--sc-bg-hover', c.hover);
    root.style.setProperty('--sc-border', c.border);
    root.style.setProperty('--sc-accent', c.accent);
    root.style.setProperty('--sc-accent-hover', c.accentHover);
    root.style.setProperty('--sc-accent-soft', `${c.accent}20`);
    root.style.setProperty('--sc-text-primary', c.textPrimary);
    root.style.setProperty('--sc-text-secondary', c.textSecondary);
    root.style.setProperty('--sc-wave-active', c.waveActive);
    root.style.setProperty('--sc-wave-inactive', c.waveInactive);
  }

  public getTheme(): ThemeDefinition {
    return this.currentTheme;
  }

  public getCurrentTheme(): ThemeDefinition {
    return this.currentTheme;
  }

  public getAllThemes(): ThemeDefinition[] {
    return THEME_PRESETS;
  }

  public getBackground(): CustomBackground {
    return this.customBg;
  }

  public setTheme(themeId: string): void {
    const found = THEME_PRESETS.find((t) => t.id === themeId);
    if (found) {
      this.currentTheme = found;
      localStorage.setItem(THEME_STORAGE_KEY, found.id);
      this.applyToDOM();
      this.notify();
    }
  }

  public setBackground(bg: CustomBackground): void {
    this.customBg = bg;
    localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(bg));
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) {
      l();
    }
  }
}

export const themeService = ThemeService.getInstance();
