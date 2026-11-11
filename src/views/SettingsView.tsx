import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Network,
  Download,
  User,
  ShieldCheck,
  Check,
  Folder,
  RefreshCw,
  LogOut,
  Zap,
  Globe,
  CheckCircle2,
  Languages,
  MonitorPlay,
  Sliders,
  Sparkles,
  ImageIcon,
  Upload,
  Search,
  Film,
  Compass,
  Link2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { themeService, ThemeDefinition, CustomBackground } from '@/services/theme';
import { authService } from '@/services/auth';
import { ALL_WALLPAPERS } from '@/data/wallpapers';
import { pinterestService, PinterestWallpaperItem, AESTHETIC_SEARCH_TAGS } from '@/services/pinterest';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/services/i18n';
import { TelegramIcon } from '@/components/icons/TelegramIcon';

interface SettingsViewProps {
  onOpenLogin: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenLogin }) => {
  const { lang, t, setLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState('appearance');
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(themeService.getTheme());
  const [themes] = useState<ThemeDefinition[]>(themeService.getAllThemes());
  const [bgConfig, setBgConfig] = useState<CustomBackground>(themeService.getBackground());
  const [customUrl, setCustomUrl] = useState(bgConfig.url || '');
  const [dohEnabled, setDohEnabled] = useState(true);
  const [currentProxy, setCurrentProxy] = useState<string | null>(null);
  const [proxyInput, setProxyInput] = useState('');
  const [detectedProxies, setDetectedProxies] = useState<any[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [proxyStatus, setProxyStatus] = useState<string | null>(null);
  const [downloadFolder, setDownloadFolder] = useState<string>('Default (Downloads/SoundCloud)');
  const [syncingSession, setSyncingSession] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Wallpaper Sub-Tab & Pinterest Search State
  const [bgSubTab, setBgSubTab] = useState<'pinterest' | 'curated' | 'adjust'>('pinterest');
  const [pinterestQuery, setPinterestQuery] = useState('Dark Aesthetic');
  const [pinterestAnimated, setPinterestAnimated] = useState(false);
  const [pinterestResults, setPinterestResults] = useState<PinterestWallpaperItem[]>([]);
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [pinterestError, setPinterestError] = useState<string | null>(null);
  const [pinLinkInput, setPinLinkInput] = useState('');
  const [pinLinkResolving, setPinLinkResolving] = useState(false);
  const [pinLinkStatus, setPinLinkStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [wallpaperFilter, setWallpaperFilter] = useState<'all' | 'live' | 'static'>('all');
  const [wallpaperGenre, setWallpaperGenre] = useState<string>('All');
  const [wallpaperSearch, setWallpaperSearch] = useState('');
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const filteredWallpapers = useMemo(() => {
    return ALL_WALLPAPERS.filter((w) => {
      const isLive = w.type === 'video' || /\.(gif|mp4|webm)(\?.*)?$/i.test(w.url);
      if (wallpaperFilter === 'live' && !isLive) return false;
      if (wallpaperFilter === 'static' && isLive) return false;
      if (wallpaperGenre !== 'All' && w.category !== wallpaperGenre) return false;
      if (wallpaperSearch.trim()) {
        const q = wallpaperSearch.toLowerCase();
        return w.name.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [wallpaperFilter, wallpaperGenre, wallpaperSearch]);

  const handleSearchPinterest = async (forcedQuery?: string, forcedAnimated?: boolean) => {
    const query = (forcedQuery !== undefined ? forcedQuery : pinterestQuery).trim();
    const isAnim = forcedAnimated !== undefined ? forcedAnimated : pinterestAnimated;
    if (!query) return;

    setPinterestLoading(true);
    setPinterestError(null);
    try {
      const results = await pinterestService.search(query, isAnim);
      setPinterestResults(results);
      if (results.length === 0) {
        setPinterestError('Ничего не найдено по данному запросу. Попробуйте другой тег.');
      }
    } catch (err: any) {
      setPinterestError(err.message || 'Ошибка поиска в Pinterest');
    } finally {
      setPinterestLoading(false);
    }
  };

  const handleResolvePinterestLink = async () => {
    const raw = pinLinkInput.trim();
    if (!raw) return;

    setPinLinkResolving(true);
    setPinLinkStatus(null);
    try {
      const res = await pinterestService.resolveUrl(raw);
      if (res.success && res.url) {
        const isVideo = res.type === 'video';
        const updated: CustomBackground = {
          ...bgConfig,
          type: isVideo ? 'video' : 'image',
          url: res.url,
        };
        setCustomUrl(res.url);
        handleApplyBackground(updated);
        setPinLinkStatus({
          success: true,
          msg: isVideo ? 'Оригинал видео (MP4) применен как живой фон!' : 'Оригинал высокого разрешения установлен как фон!',
        });
        setPinLinkInput('');
      } else {
        setPinLinkStatus({
          success: false,
          msg: res.error || 'Не удалось извлечь файл из ссылки Pinterest.',
        });
      }
    } catch (err: any) {
      setPinLinkStatus({
        success: false,
        msg: err.message || 'Сбой обработки ссылки Pinterest.',
      });
    } finally {
      setPinLinkResolving(false);
      setTimeout(() => setPinLinkStatus(null), 5000);
    }
  };

  useEffect(() => {
    if (activeTab === 'background' && pinterestResults.length === 0) {
      handleSearchPinterest('Dark Aesthetic');
    }
  }, [activeTab]);

  const isAuth = authService.isAuthenticated();
  const session = authService.getSession();

  useEffect(() => {
    if ((window as any).electronAPI?.getNetworkSettings) {
      (window as any).electronAPI.getNetworkSettings().then((ns: any) => {
        if (ns) {
          setDohEnabled(ns.dohEnabled !== false);
        }
      });
    }
    if ((window as any).electronAPI?.detectLocalProxy) {
      handleAutoDetectProxy();
    }
  }, []);

  const handleSelectTheme = (id: string) => {
    themeService.setTheme(id);
    setCurrentTheme(themeService.getTheme());
  };

  const handleApplyBackground = (newBg: CustomBackground) => {
    setBgConfig(newBg);
    themeService.setBackground(newBg);
  };

  const handleNativeFileSelect = async () => {
    if ((window as any).electronAPI?.selectBackgroundFile) {
      try {
        const result = await (window as any).electronAPI.selectBackgroundFile();
        if (result && result.url) {
          const updated: CustomBackground = {
            ...bgConfig,
            type: result.type,
            url: result.url,
          };
          setCustomUrl(result.url);
          handleApplyBackground(updated);
        }
      } catch (err) {
        console.error('Failed to select local background file:', err);
      }
    }
  };

  const handleRemoveBackground = () => {
    const cleared: CustomBackground = {
      type: 'none',
      url: '',
      opacity: 50,
      blur: 0,
      fit: 'cover',
      vignette: true,
    };
    setCustomUrl('');
    handleApplyBackground(cleared);
  };

  const handleToggleDoh = async () => {
    const next = !dohEnabled;
    setDohEnabled(next);
    if ((window as any).electronAPI?.setDoh) {
      await (window as any).electronAPI.setDoh(next);
    }
  };

  const handleAutoDetectProxy = async () => {
    if (!(window as any).electronAPI?.detectLocalProxy) return;
    setDetecting(true);
    try {
      const res = await (window as any).electronAPI.detectLocalProxy();
      if (res && res.success && res.candidates) {
        setDetectedProxies(res.candidates);
        setCurrentProxy(res.proxy);
        setProxyInput(res.proxy);
      } else if (res && res.success && res.proxy) {
        setDetectedProxies([res]);
        setCurrentProxy(res.proxy);
        setProxyInput(res.proxy);
      } else {
        setDetectedProxies([]);
      }
    } catch {
      setDetectedProxies([]);
    } finally {
      setDetecting(false);
    }
  };

  const handleApplyProxy = async (proxyStr: string) => {
    if (!(window as any).electronAPI?.setProxy) return;
    const rule = proxyStr ? proxyStr.trim() : null;
    const res = await (window as any).electronAPI.setProxy(rule);
    if (res && res.success) {
      setCurrentProxy(rule);
      setProxyStatus(rule ? `${t('connected')}: ${rule}` : t('directConnectionMode'));
      setTimeout(() => setProxyStatus(null), 4000);
    } else {
      setProxyStatus('Error applying proxy');
    }
  };

  const handleToggleOverlay = async () => {
    if ((window as any).electronAPI?.toggleOverlay) {
      try {
        await (window as any).electronAPI.toggleOverlay();
      } catch {}
    }
  };

  const handleSyncSession = async () => {
    setSyncingSession(true);
    setSyncStatus(null);
    try {
      const res = await authService.syncSessionFromCookies();
      if (res.success) {
        setSyncStatus(t('loginSuccess'));
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setSyncStatus(res.error || 'No active session found.');
      }
    } catch (err: any) {
      setSyncStatus(err?.message || 'Sync error');
    } finally {
      setSyncingSession(false);
    }
  };

  const handleChooseFolder = async () => {
    if (!(window as any).electronAPI?.selectDownloadFolder) return;
    const folder = await (window as any).electronAPI.selectDownloadFolder();
    if (folder) {
      setDownloadFolder(folder);
    }
  };

  const handleOpenFolder = () => {
    if ((window as any).electronAPI?.openDownloadsFolder) {
      (window as any).electronAPI.openDownloadsFolder();
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Оформление и темы', icon: <Palette size={14} /> },
    { id: 'background', label: 'Обои и фон', icon: <ImageIcon size={14} /> },
    { id: 'overlay', label: 'Десктопный Оверлей', icon: <MonitorPlay size={14} /> },
    { id: 'language', label: 'Язык (Language)', icon: <Languages size={14} /> },
    { id: 'network', label: 'Сеть и DNS', icon: <Network size={14} /> },
    { id: 'downloads', label: t('downloads'), icon: <Download size={14} /> },
    { id: 'account', label: t('profile'), icon: <User size={14} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 select-none">
      {/* Title Header */}
      <div className="border-b border-sc-border pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sliders className="text-sc-accent" size={24} />
          <span>{t('themeAndSettings')}</span>
        </h1>
        <p className="text-xs text-sc-text-secondary mt-1">
          {t('appearanceSubtitle')}
        </p>
      </div>

      {/* Segmented Tab Bar - Structured Grid Panel (No sideways scroll) */}
      <Tabs items={tabs} activeId={activeTab} onChange={setActiveTab} variant="grid" />

      {/* APPEARANCE / THEMES TAB */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette size={16} className="text-sc-accent" />
              <span>Палитра оформления</span>
            </h2>
            <p className="text-xs text-sc-text-secondary mt-1">
              Комфортные спокойные темные поверхности с индивидуальным акцентным цветом
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-4">
              {themes.map((th) => {
                const isSelected = currentTheme.id === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => handleSelectTheme(th.id)}
                    className={`flex items-center justify-between p-3.5 rounded-sc-card border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-sc-border-strong bg-sc-surface-2 ring-1 ring-white/20 shadow-md'
                        : 'border-sc-border bg-sc-surface-2/60 hover:border-sc-border-strong hover:bg-sc-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-white/20"
                        style={{ backgroundColor: th.colors.accent }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">
                          {th.name}
                        </span>
                        <span className="text-[10px] text-sc-text-tertiary block mt-0.5">
                          {th.category}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-sc-accent text-white flex items-center justify-center shrink-0">
                        <Check size={10} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WALLPAPER & BACKGROUND TAB */}
      {activeTab === 'background' && (
        <div className="space-y-6 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-sc-border">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon size={16} className="text-sc-accent" />
                <span>{t('customBackground')}</span>
              </h2>
              <p className="text-xs text-sc-text-secondary mt-0.5">
                Поиск обоев в Pinterest, живые MP4/GIF циклы, 4K обои и тонкая настройка резкости
              </p>
            </div>
            {bgConfig.type !== 'none' && (
              <button
                onClick={handleRemoveBackground}
                className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1 rounded-sc border border-red-500/30 bg-red-500/10 transition-colors"
              >
                {t('resetToDefault')}
              </button>
            )}
          </div>

          {/* Active Wallpaper Status Bar */}
          {bgConfig.type !== 'none' && bgConfig.url && (
            <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-10 rounded-sc bg-black border border-sc-border overflow-hidden shrink-0">
                  {bgConfig.type === 'video' ? (
                    <video src={bgConfig.url} autoPlay loop muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={bgConfig.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white block truncate">Активный фон установлен</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-sc-accent/20 text-sc-accent border border-sc-accent/30">
                      {bgConfig.type === 'video' ? 'Live Video' : 'Image'}
                    </span>
                  </div>
                  <span className="text-[10px] text-sc-text-tertiary font-mono block truncate max-w-md mt-0.5">
                    {bgConfig.url}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRemoveBackground}
                className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-sc border border-red-500/20 hover:bg-red-500/10 transition-colors shrink-0"
              >
                Удалить фон
              </button>
            </div>
          )}

          {/* Sub-Navigation Grid Panel (Normalized Buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-sc-card bg-sc-surface-2/60 border border-sc-border">
            <button
              type="button"
              onClick={() => setBgSubTab('pinterest')}
              className={`py-2 px-3 text-xs font-semibold rounded-sc border flex items-center justify-center gap-2 transition-all ${
                bgSubTab === 'pinterest'
                  ? 'bg-sc-surface-2 border-sc-border-strong text-white shadow-sm ring-1 ring-white/10'
                  : 'bg-transparent border-transparent text-sc-text-secondary hover:text-white hover:bg-sc-surface-2/50'
              }`}
            >
              <Search size={14} className={bgSubTab === 'pinterest' ? 'text-red-400' : 'text-sc-text-tertiary'} />
              <span>Pinterest Поиск</span>
            </button>

            <button
              type="button"
              onClick={() => setBgSubTab('curated')}
              className={`py-2 px-3 text-xs font-semibold rounded-sc border flex items-center justify-center gap-2 transition-all ${
                bgSubTab === 'curated'
                  ? 'bg-sc-surface-2 border-sc-border-strong text-white shadow-sm ring-1 ring-white/10'
                  : 'bg-transparent border-transparent text-sc-text-secondary hover:text-white hover:bg-sc-surface-2/50'
              }`}
            >
              <Sparkles size={14} className={bgSubTab === 'curated' ? 'text-sc-accent' : 'text-sc-text-tertiary'} />
              <span>Обои галереи (57+)</span>
            </button>

            <button
              type="button"
              onClick={() => setBgSubTab('adjust')}
              className={`py-2 px-3 text-xs font-semibold rounded-sc border flex items-center justify-center gap-2 transition-all ${
                bgSubTab === 'adjust'
                  ? 'bg-sc-surface-2 border-sc-border-strong text-white shadow-sm ring-1 ring-white/10'
                  : 'bg-transparent border-transparent text-sc-text-secondary hover:text-white hover:bg-sc-surface-2/50'
              }`}
            >
              <Sliders size={14} className={bgSubTab === 'adjust' ? 'text-sc-accent' : 'text-sc-text-tertiary'} />
              <span>Параметры и резкость</span>
            </button>

            <button
              type="button"
              onClick={handleNativeFileSelect}
              className="py-2 px-3 text-xs font-semibold rounded-sc border border-sc-border bg-sc-surface-2/80 text-sc-text-secondary hover:text-white hover:border-sc-border-strong flex items-center justify-center gap-2 transition-all"
            >
              <Upload size={14} className="text-sc-accent" />
              <span>Файл с ПК</span>
            </button>
          </div>

          {/* SUBTAB 1: PINTEREST SEARCH */}
          {bgSubTab === 'pinterest' && (
            <div className="space-y-4 pt-1">
              {/* Search Bar + Controls */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sc-text-tertiary" />
                    <input
                      type="text"
                      value={pinterestQuery}
                      onChange={(e) => setPinterestQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchPinterest();
                      }}
                      placeholder="Поиск обоев: anime lofi, dark cyberpunk, rain aesthetic..."
                      className="w-full rounded-sc border border-sc-border bg-[#141418] py-2 pl-9 pr-3 text-xs text-white placeholder:text-sc-text-tertiary focus:border-red-500 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextAnim = !pinterestAnimated;
                        setPinterestAnimated(nextAnim);
                        if (pinterestQuery.trim()) {
                          handleSearchPinterest(pinterestQuery, nextAnim);
                        }
                      }}
                      className={`px-3 py-2 rounded-sc border text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                        pinterestAnimated
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-sc-surface-2 border-sc-border text-sc-text-secondary hover:text-white'
                      }`}
                      title="Фильтровать только живые/анимированные циклы (GIF / Video)"
                    >
                      <Film size={14} />
                      <span>Live / GIF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSearchPinterest()}
                      disabled={pinterestLoading}
                      className="px-4 py-2 rounded-sc bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-md shadow-red-600/20 active:scale-95"
                    >
                      {pinterestLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Search size={14} />
                      )}
                      <span>Найти в Pinterest</span>
                    </button>
                  </div>
                </div>

                {/* Aesthetic Fast-Tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {AESTHETIC_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setPinterestQuery(tag);
                        handleSearchPinterest(tag);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-sc whitespace-nowrap bg-sc-surface-2/80 border border-sc-border text-sc-text-secondary hover:text-white hover:border-red-500/50 hover:bg-sc-surface-2 transition-all shrink-0"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Pin Link Resolver */}
              <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/40 space-y-2">
                <span className="text-xs font-semibold text-white block">
                  Или вставьте прямую ссылку на Pin из Pinterest:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pinLinkInput}
                    onChange={(e) => setPinLinkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleResolvePinterestLink();
                    }}
                    placeholder="https://pinterest.com/pin/123456789/ или https://pin.it/..."
                    className="flex-1 rounded-sc border border-sc-border bg-[#141418] px-3 py-1.5 text-xs text-white placeholder:text-sc-text-tertiary focus:border-red-500 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={pinLinkResolving ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                    onClick={handleResolvePinterestLink}
                    disabled={pinLinkResolving || !pinLinkInput.trim()}
                  >
                    Применить оригинал
                  </Button>
                </div>
                {pinLinkStatus && (
                  <p className={`text-[11px] font-medium ${pinLinkStatus.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pinLinkStatus.msg}
                  </p>
                )}
              </div>

              {/* Pinterest Results Grid */}
              {pinterestLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-sc-text-secondary">
                  <Loader2 size={28} className="animate-spin text-red-500" />
                  <span className="text-xs font-medium">Поиск оригиналов с Pinterest в высоком разрешении...</span>
                </div>
              ) : pinterestError ? (
                <div className="p-6 rounded-sc-card bg-sc-surface-2 border border-sc-border text-center space-y-2">
                  <p className="text-xs text-sc-text-secondary">{pinterestError}</p>
                  <button
                    onClick={() => handleSearchPinterest('Cyberpunk Neon 4K')}
                    className="text-xs text-red-400 hover:underline font-semibold"
                  >
                    Попробовать популярный тег: #Cyberpunk Neon 4K
                  </button>
                </div>
              ) : pinterestResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
                  {pinterestResults.map((item) => {
                    const isSelected = bgConfig.url === item.url;
                    const isHovered = hoveredVideoId === item.id;
                    const isVideo = item.type === 'video' || /\.(mp4|webm)(\?.*)?$/i.test(item.url);
                    const isGif = /\.(gif)(\?.*)?$/i.test(item.url);
                    const isLive = isVideo || isGif;

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          handleApplyBackground({
                            ...bgConfig,
                            type: isVideo ? 'video' : 'image',
                            url: item.url,
                          })
                        }
                        onMouseEnter={() => setHoveredVideoId(item.id)}
                        onMouseLeave={() => setHoveredVideoId(null)}
                        className={`group cursor-pointer rounded-sc border overflow-hidden relative aspect-video transition-all hover:scale-[1.02] shadow-md ${
                          isSelected
                            ? 'border-red-500 ring-2 ring-red-500 shadow-red-500/25'
                            : 'border-sc-border hover:border-red-500/60'
                        }`}
                      >
                        <img
                          src={isGif && isHovered ? item.url : (item.thumbnail || item.url)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isVideo && isHovered && (
                          <video
                            src={item.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover z-0"
                          />
                        )}

                        {/* Top Badge */}
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                              isLive
                                ? 'bg-emerald-500/90 text-white shadow-sm'
                                : 'bg-black/70 text-zinc-300 border border-white/10'
                            }`}
                          >
                            {isVideo ? 'MP4 LIVE' : isGif ? 'GIF LIVE' : item.width ? `${item.width}x${item.height}` : '4K'}
                          </span>

                          {isSelected && (
                            <span className="h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                              <Check size={12} />
                            </span>
                          )}
                        </div>

                        {/* Bottom Title */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 flex flex-col justify-end pointer-events-none">
                          <span className="text-[11px] font-bold text-white leading-tight truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-red-400 font-bold mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Sparkles size={9} /> Установить как фон
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-sc-card border border-dashed border-sc-border bg-sc-surface-2/30 space-y-2">
                  <Compass size={24} className="mx-auto text-sc-text-secondary" />
                  <p className="text-xs text-sc-text-secondary">
                    Выберите любой эстетичный тег выше или введите поисковый запрос для загрузки обоев из Pinterest
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: CURATED WALLPAPERS GALLERY */}
          {bgSubTab === 'curated' && (
            <div className="space-y-4 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setWallpaperFilter('all')}
                    className={`px-3 py-1.5 rounded-sc text-xs font-semibold border transition-all ${
                      wallpaperFilter === 'all'
                        ? 'bg-sc-surface-2 border-sc-border-strong text-white'
                        : 'bg-transparent border-sc-border text-sc-text-secondary hover:text-white'
                    }`}
                  >
                    Все ({ALL_WALLPAPERS.length})
                  </button>
                  <button
                    onClick={() => setWallpaperFilter('live')}
                    className={`px-3 py-1.5 rounded-sc text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      wallpaperFilter === 'live'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-transparent border-sc-border text-sc-text-secondary hover:text-white'
                    }`}
                  >
                    <Film size={13} />
                    Live MP4 / GIF
                  </button>
                  <button
                    onClick={() => setWallpaperFilter('static')}
                    className={`px-3 py-1.5 rounded-sc text-xs font-semibold border transition-all ${
                      wallpaperFilter === 'static'
                        ? 'bg-sc-surface-2 border-sc-border-strong text-white'
                        : 'bg-transparent border-sc-border text-sc-text-secondary hover:text-white'
                    }`}
                  >
                    4K Статичные
                  </button>
                </div>

                <div className="relative w-48">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sc-text-tertiary" />
                  <input
                    type="text"
                    value={wallpaperSearch}
                    onChange={(e) => setWallpaperSearch(e.target.value)}
                    placeholder="Фильтр по названию..."
                    className="w-full rounded-sc border border-sc-border bg-[#141418] py-1 pl-8 pr-2.5 text-xs text-white placeholder:text-sc-text-tertiary focus:border-sc-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredWallpapers.map((w) => {
                  const isSelected = bgConfig.url === w.url;
                  const isHovered = hoveredVideoId === w.id;
                  const isVideo = w.type === 'video' || /\.(mp4|webm)(\?.*)?$/i.test(w.url);
                  const isGif = /\.(gif)(\?.*)?$/i.test(w.url);
                  const isLive = isVideo || isGif;

                  return (
                    <div
                      key={w.id}
                      onClick={() =>
                        handleApplyBackground({
                          ...bgConfig,
                          type: isVideo ? 'video' : 'image',
                          url: w.url,
                        })
                      }
                      onMouseEnter={() => setHoveredVideoId(w.id)}
                      onMouseLeave={() => setHoveredVideoId(null)}
                      className={`group cursor-pointer rounded-sc border overflow-hidden relative aspect-video transition-all hover:scale-[1.02] shadow-md ${
                        isSelected
                          ? 'border-sc-accent ring-2 ring-sc-accent shadow-sc-accent/25'
                          : 'border-sc-border hover:border-sc-accent/60'
                      }`}
                    >
                      <img
                        src={isGif && isHovered ? w.url : w.thumbnail}
                        alt={w.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {isVideo && isHovered && (
                        <video
                          src={w.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                      )}

                      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                            isLive
                              ? 'bg-emerald-500/90 text-white shadow-sm'
                              : 'bg-black/70 text-zinc-300 border border-white/10'
                          }`}
                        >
                          {isVideo ? 'MP4 LIVE' : isGif ? 'GIF LIVE' : '4K'}
                        </span>

                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-sc-accent text-white flex items-center justify-center shadow-md">
                            <Check size={12} />
                          </span>
                        )}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 flex flex-col justify-end pointer-events-none">
                        <span className="text-[11px] font-bold text-white leading-tight truncate">
                          {w.name}
                        </span>
                        <span className="text-[9px] text-sc-text-secondary/90 truncate mt-0.5">
                          {w.category} &bull; {w.author || 'SoundCloud'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUBTAB 3: DISPLAY MODE, VIGNETTE & SHARPNESS */}
          {bgSubTab === 'adjust' && (
            <div className="space-y-6 pt-1">
              {/* Display Mode (Prevents pixelation!) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white block">
                  Режим масштабирования (Display Mode)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleApplyBackground({ ...bgConfig, fit: 'cover' })}
                    className={`p-3 rounded-sc-card border text-left transition-all ${
                      (bgConfig.fit || 'cover') === 'cover'
                        ? 'border-sc-border-strong bg-sc-surface-2 ring-1 ring-white/20'
                        : 'border-sc-border bg-sc-surface-2/60 text-sc-text-secondary hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-white">Cover (Заполнение)</span>
                    <span className="block text-[11px] text-sc-text-tertiary mt-0.5">Растягивание на весь экран</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBackground({ ...bgConfig, fit: 'contain' })}
                    className={`p-3 rounded-sc-card border text-left transition-all ${
                      bgConfig.fit === 'contain'
                        ? 'border-sc-border-strong bg-sc-surface-2 ring-1 ring-white/20'
                        : 'border-sc-border bg-sc-surface-2/60 text-sc-text-secondary hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-white">Ambient Glow (Мягкое свечение)</span>
                    <span className="block text-[11px] text-sc-text-tertiary mt-0.5">Без растяжения пикселей</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyBackground({ ...bgConfig, fit: 'center' })}
                    className={`p-3 rounded-sc-card border text-left transition-all ${
                      bgConfig.fit === 'center'
                        ? 'border-sc-border-strong bg-sc-surface-2 ring-1 ring-white/20'
                        : 'border-sc-border bg-sc-surface-2/60 text-sc-text-secondary hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-white">Center (100% масштаб)</span>
                    <span className="block text-[11px] text-sc-text-tertiary mt-0.5">Оригинальное четкое разрешение</span>
                  </button>
                </div>
              </div>

              {/* Vignette Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/60">
                <div>
                  <span className="text-xs font-semibold text-white block">Мягкая виньетка (Vignette)</span>
                  <span className="text-[11px] text-sc-text-secondary block">
                    Затеняет края экрана для идеального контраста списков треков
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyBackground({ ...bgConfig, vignette: bgConfig.vignette === false ? true : false })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    bgConfig.vignette !== false
                      ? 'bg-sc-accent text-white'
                      : 'bg-sc-surface-3 text-sc-text-tertiary'
                  }`}
                >
                  {bgConfig.vignette !== false ? 'Включена' : 'Выключена'}
                </button>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/60 space-y-2">
                  <div className="flex justify-between text-xs text-sc-text-secondary">
                    <span>{t('backgroundDimming')}</span>
                    <span className="font-mono text-white">{bgConfig.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    value={bgConfig.opacity}
                    onChange={(e) => handleApplyBackground({ ...bgConfig, opacity: Number(e.target.value) })}
                    className="w-full accent-sc-accent h-1.5 bg-sc-surface-3 rounded-full cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/60 space-y-2">
                  <div className="flex justify-between text-xs text-sc-text-secondary">
                    <span>{t('backgroundBlur')}</span>
                    <span className="font-mono text-white">{bgConfig.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={bgConfig.blur}
                    onChange={(e) => handleApplyBackground({ ...bgConfig, blur: Number(e.target.value) })}
                    className="w-full accent-sc-accent h-1.5 bg-sc-surface-3 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              {/* Local File / URL selection */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Upload size={14} />}
                  onClick={handleNativeFileSelect}
                >
                  {t('chooseFileFromPc')} (MP4 / GIF / WebM / JPG)
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DESKTOP OVERLAY TAB */}
      {activeTab === 'overlay' && (
        <div className="space-y-6 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MonitorPlay size={16} className="text-sc-accent" />
              <span>SoundCloud Desktop Island (Оверлей)</span>
            </h2>
            <p className="text-xs text-sc-text-secondary mt-1">
              Компактный плавающий виджет поверх рабочего стола и любых полноэкранных игр с текстом песен и системными часами
            </p>
          </div>

          <div className="p-4 rounded-sc-card border border-sc-border bg-sc-surface-2/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white block">Статус острова на рабочем столе</span>
              <p className="text-[11px] text-sc-text-secondary">
                Оверлей зафиксирован и не сворачивается при клике в главное окно приложения.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={<MonitorPlay size={14} />}
              onClick={handleToggleOverlay}
            >
              Запустить оверлей
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/40 space-y-1">
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <Sparkles size={13} className="text-sc-accent" />
                Синхронный караоке-текст
              </span>
              <p className="text-[11px] text-sc-text-tertiary leading-relaxed">
                В расширенном режиме отображается караоке-строка в реальном времени.
              </p>
            </div>

            <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/40 space-y-1">
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <Sliders size={13} className="text-sc-accent" />
                Шторка настроек звука
              </span>
              <p className="text-[11px] text-sc-text-tertiary leading-relaxed">
                Настройка формы (Pill / Squircle) и быстрая регулировка звука.
              </p>
            </div>

            <div className="p-3.5 rounded-sc-card border border-sc-border bg-sc-surface-2/40 space-y-1">
              <span className="text-xs font-semibold text-white block flex items-center gap-1.5">
                <Zap size={13} className="text-sc-accent" />
                Интерактивная ширина
              </span>
              <p className="text-[11px] text-sc-text-tertiary leading-relaxed">
                Потяните за левый или правый край оверлея, чтобы растянуть карточку.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LANGUAGE TAB */}
      {activeTab === 'language' && (
        <div className="space-y-6 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Languages size={16} className="text-sc-accent" />
              <span>{t('chooseLanguage')}</span>
            </h2>
            <p className="text-xs text-sc-text-secondary mt-1">
              {t('languageHint')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setLanguage('ru')}
              className={`cursor-pointer rounded-sc-card border p-4 transition-all flex flex-col justify-between ${
                lang === 'ru'
                  ? 'border-sc-border-strong bg-sc-surface-2 ring-1 ring-white/20'
                  : 'border-sc-border bg-sc-surface-2/60 hover:bg-sc-surface-2'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🇷🇺</span>
                  <span className="text-xs font-bold text-white">Русский</span>
                </div>
                {lang === 'ru' && <CheckCircle2 size={16} className="text-sc-accent" />}
              </div>
              <p className="text-[11px] text-sc-text-secondary">
                Полный русскоязычный интерфейс и оверлей
              </p>
            </div>

            <div
              onClick={() => setLanguage('en')}
              className={`cursor-pointer rounded-sc-card border p-4 transition-all flex flex-col justify-between ${
                lang === 'en'
                  ? 'border-sc-border-strong bg-sc-surface-2 ring-1 ring-white/20'
                  : 'border-sc-border bg-sc-surface-2/60 hover:bg-sc-surface-2'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🇺🇸</span>
                  <span className="text-xs font-bold text-white">English</span>
                </div>
                {lang === 'en' && <CheckCircle2 size={16} className="text-sc-accent" />}
              </div>
              <p className="text-[11px] text-sc-text-secondary">
                Complete English interface and desktop overlay
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NETWORK / PROXY TAB */}
      {activeTab === 'network' && (
        <div className="space-y-6 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <div className="flex items-start justify-between pb-4 border-b border-sc-border gap-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-sc-accent" />
                <span>DNS over HTTPS (DoH)</span>
              </h2>
              <p className="text-xs text-sc-text-secondary mt-1 leading-relaxed">
                Шифрование DNS-запросов через защищенные серверы Cloudflare и AdGuard для обхода блокировок.
              </p>
            </div>
            <Button
              size="sm"
              variant={dohEnabled ? 'primary' : 'secondary'}
              onClick={handleToggleDoh}
            >
              {dohEnabled ? t('connected') : t('cancel')}
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Network size={16} className="text-sc-accent" />
                  <span>{t('bypassTitle')}</span>
                </h3>
                <p className="text-xs text-sc-text-secondary mt-0.5">
                  {t('bypassSubtitle')}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                icon={<RefreshCw size={13} className={detecting ? 'animate-spin' : ''} />}
                onClick={handleAutoDetectProxy}
              >
                {detecting ? t('searchingProxy') : t('autoDetect')}
              </Button>
            </div>

            {detectedProxies.length > 0 && (
              <div className="space-y-2 mb-4">
                {detectedProxies.map((p, idx) => {
                  const isCurrent = currentProxy === p.proxy;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-sc-card border transition-all ${
                        isCurrent
                          ? 'border-emerald-500/50 bg-emerald-950/20'
                          : 'border-sc-border bg-sc-surface-2'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCurrent ? 'bg-emerald-400' : 'bg-zinc-600'
                          }`}
                        />
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {p.name || 'Local Proxy'}
                          </span>
                          <span className="text-[11px] text-sc-text-secondary font-mono">{p.proxy}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isCurrent ? 'primary' : 'secondary'}
                        onClick={() => handleApplyProxy(p.proxy)}
                      >
                        {isCurrent ? t('connected') : t('connectToProxy')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
                placeholder="http://127.0.0.1:39706"
                className="flex-1 rounded-sc-card border border-sc-border bg-sc-surface-2 px-3.5 py-1.5 text-xs text-white placeholder:text-sc-text-tertiary font-mono focus:border-sc-border-strong focus:outline-none"
              />
              <Button size="sm" variant="primary" onClick={() => handleApplyProxy(proxyInput)}>
                {t('save')}
              </Button>
              {currentProxy && (
                <Button size="sm" variant="danger" onClick={() => handleApplyProxy('')}>
                  {t('resetProxy')}
                </Button>
              )}
            </div>

            {proxyStatus && (
              <p className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>{proxyStatus}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* DOWNLOADS TAB */}
      {activeTab === 'downloads' && (
        <div className="space-y-4 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Download size={16} className="text-sc-accent" />
            <span>{t('downloadsTitle')}</span>
          </h2>
          <p className="text-xs text-sc-text-secondary">
            {t('downloadsSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-sc-card bg-sc-surface-2 border border-sc-border">
            <Folder size={18} className="text-sc-accent shrink-0" />
            <span className="text-xs font-mono text-sc-text-secondary truncate flex-1 w-full sm:w-auto">
              {downloadFolder}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="secondary" onClick={handleChooseFolder}>
                {t('changeFolder')}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleOpenFolder}>
                {t('openFolder')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT / PROFILE TAB */}
      {activeTab === 'account' && (
        <div className="space-y-5 bg-sc-surface border border-sc-border p-6 rounded-sc-card shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-sc-border">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User size={16} className="text-sc-accent" />
                <span>{t('profile')}</span>
              </h2>
            </div>
            <Button
              size="sm"
              variant="primary"
              disabled={syncingSession}
              icon={<RefreshCw size={12} className={syncingSession ? 'animate-spin' : ''} />}
              onClick={handleSyncSession}
            >
              {t('cookiesSync')}
            </Button>
          </div>

          {syncStatus && (
            <p className="text-xs font-semibold text-sc-accent bg-sc-accent/10 p-3 rounded-sc border border-sc-accent/30">
              {syncStatus}
            </p>
          )}

          {isAuth ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                {session.user?.avatar_url ? (
                  <img
                    src={session.user.avatar_url}
                    alt={session.user?.username}
                    className="w-12 h-12 rounded-full object-cover border border-sc-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-sc-surface-2 border border-sc-border flex items-center justify-center text-white font-bold">
                    {session.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">{session.user?.username}</h3>
                  <p className="text-xs text-sc-text-secondary">{session.user?.city || 'SoundCloud Member'}</p>
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onOpenLogin}
                >
                  {t('switchAccount')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<LogOut size={13} />}
                  onClick={() => {
                    authService.logout();
                    window.location.reload();
                  }}
                >
                  {t('logout')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-sc-text-secondary">
                {t('loginNotice')}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={onOpenLogin}>
                  {t('loginToSoundCloud')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Author & Community Info Footer Card */}
      <div className="p-4 rounded-sc-card border border-sc-border bg-sc-surface flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shrink-0">
            <TelegramIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">SoundCloud Desktop</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sc-surface-2 text-sc-text-secondary border border-sc-border">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-sc-text-secondary mt-0.5">
              Автор: <strong className="text-white">morcad</strong> &bull; Официальный канал: <strong className="text-[#229ED9]">@mortdusk</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.open('https://t.me/mortdusk', '_blank')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-sc border border-[#229ED9]/40 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-xs font-semibold transition-all shadow-sm shrink-0 active:scale-95"
        >
          <TelegramIcon size={14} />
          <span>Перейти в Telegram @mortdusk</span>
          <ExternalLink size={12} className="opacity-70" />
        </button>
      </div>
    </div>
  );
};
