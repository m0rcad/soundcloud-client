import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Cloud,
  User,
  Minus,
  Square,
  X,
  Send,
  Sliders,
  LogOut,
  Upload,
  Settings,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Globe,
  MonitorPlay,
  Layers,
} from 'lucide-react';
import { TelegramIcon } from '@/components/icons/TelegramIcon';
import { authService } from '@/services/auth';
import { useI18n } from '@/services/i18n';

interface HeaderProps {
  onOpenLogin: () => void;
  onOpenThemeSettings?: () => void;
}

export default function Header({
  onOpenLogin,
  onOpenThemeSettings,
}: HeaderProps) {
  const { lang, t, toggleLanguage } = useI18n();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [proxyInfo, setProxyInfo] = useState<{ active: boolean; name: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const navigate = useNavigate();
  const isAuth = authService.isAuthenticated();
  const session = authService.getSession();

  useEffect(() => {
    // Check proxy status
    const updateProxyStatus = async () => {
      if ((window as any).electronAPI?.detectLocalProxy) {
        try {
          const res = await (window as any).electronAPI.detectLocalProxy();
          if (res && res.success) {
            setProxyInfo({ active: true, name: res.name || 'Clash/VPN' });
          } else {
            setProxyInfo({ active: false, name: 'Direct' });
          }
        } catch {
          setProxyInfo({ active: false, name: 'Direct' });
        }
      }
    };
    updateProxyStatus();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  const username = session.user?.username || 'User';
  const avatar = session.user?.avatar_url;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleUploadClick = () => {
    window.open('https://soundcloud.com/upload', '_blank');
  };

  const handleToggleOverlay = async () => {
    if ((window as any).electronAPI?.toggleOverlay) {
      try {
        const nextState = await (window as any).electronAPI.toggleOverlay();
        setOverlayActive(Boolean(nextState));
      } catch (err) {
        console.error('Failed to toggle desktop overlay:', err);
      }
    }
  };

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      const res = await authService.syncSessionFromCookies();
      if (res.success) {
        window.location.reload();
      } else {
        onOpenLogin();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMinimize = () => {
    if ((window as any).electronAPI?.minimizeWindow) {
      (window as any).electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if ((window as any).electronAPI?.maximizeWindow) {
      (window as any).electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if ((window as any).electronAPI?.closeWindow) {
      (window as any).electronAPI.closeWindow();
    }
  };

  const isElectron = Boolean((window as any).electronAPI);

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/feed', label: t('feed') },
    { to: '/library', label: t('library') },
  ];

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-sc-border bg-sc-bg px-4 select-none transition-colors"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Brand Cloud Icon & Name */}
      <div
        className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
        style={{ WebkitAppRegion: 'no-drag' } as any}
        onClick={() => navigate('/')}
      >
        <div className="p-1 rounded-sc bg-sc-accent/15 group-hover:bg-sc-accent/25 transition-colors">
          <Cloud size={24} className="text-sc-accent fill-current" />
        </div>
        <span className="text-sm font-extrabold tracking-tight text-white hidden sm:inline">
          SoundCloud
        </span>
      </div>

      {/* Navigation Pills */}
      <nav
        className="flex items-center gap-1 shrink-0 ml-1"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'text-white bg-sc-surface border border-sc-border-strong shadow-sm'
                  : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Search Bar with Input and Clear Button */}
      <div
        className="relative flex-1 min-w-[170px] max-w-sm mx-3 shrink"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sc-text-tertiary pointer-events-none"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-full border border-sc-border bg-[#141418] py-1.5 pl-8 pr-16 text-xs text-white placeholder:text-sc-text-tertiary focus:border-sc-accent focus:bg-[#1a1a22] focus:outline-none transition-all shadow-sm"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="p-0.5 text-sc-text-tertiary hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
          )}
          <kbd className="rounded border border-sc-border bg-sc-surface-2 px-1 py-0.2 text-[9px] font-mono font-medium text-sc-text-secondary">
            ↵
          </kbd>
        </div>
      </div>

      {/* Right Action Bar */}
      <div
        className="flex items-center gap-1.5 ml-auto shrink-0"
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {/* Desktop Island Overlay Trigger */}
        {isElectron && (
          <button
            onClick={handleToggleOverlay}
            className={`h-8 flex items-center justify-center gap-1.5 rounded-full border px-2.5 xl:px-3 text-xs font-semibold transition-all shadow-sm shrink-0 active:scale-95 ${
              overlayActive
                ? 'bg-sc-accent/20 border-sc-accent text-sc-accent'
                : 'border-sc-border bg-sc-surface text-sc-text-secondary hover:text-white hover:border-sc-border-strong'
            }`}
            title="Плавающий оверлей на рабочем столе (Desktop Island HUD)"
          >
            <MonitorPlay size={13} className="text-sc-accent shrink-0" />
            <span className="hidden xl:inline">Оверлей</span>
          </button>
        )}

        {/* Official Telegram Channel Link */}
        <button
          onClick={() => window.open('https://t.me/mortdusk', '_blank')}
          className="h-8 flex items-center justify-center gap-1.5 rounded-full border border-sc-border bg-sc-surface px-2.5 xl:px-3 text-xs font-semibold text-sc-text-secondary hover:text-white hover:border-[#229ED9] hover:bg-[#229ED9]/10 transition-all shadow-sm shrink-0 active:scale-95"
          title="Официальный Telegram канал: @mortdusk (morcad)"
        >
          <TelegramIcon size={14} className="text-[#229ED9] shrink-0" />
          <span className="hidden xl:inline text-[11px] font-medium text-zinc-300">@mortdusk</span>
        </button>

        {/* Language Switcher (RU / EN) */}
        <button
          onClick={toggleLanguage}
          className="h-8 flex items-center justify-center gap-1.5 rounded-full border border-sc-border bg-sc-surface px-2.5 text-xs font-bold text-sc-text-secondary hover:text-white hover:border-sc-accent transition-all shadow-sm shrink-0 active:scale-95"
          title={lang === 'ru' ? 'Сменить язык на English' : 'Switch language to Русский'}
        >
          <Globe size={13} className="text-sc-accent shrink-0" />
          <span className="text-[11px] font-bold uppercase">{lang}</span>
        </button>

        {/* Proxy Route Chip */}
        {proxyInfo && (
          <button
            onClick={() => {
              if (onOpenThemeSettings) {
                onOpenThemeSettings();
              } else {
                navigate('/settings');
              }
            }}
            className={`h-8 hidden xl:flex items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-all border shrink-0 ${
              proxyInfo.active
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40'
                : 'bg-sc-surface text-sc-text-tertiary border-sc-border hover:text-white'
            }`}
            title="Сетевой маршрут / Прокси"
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                proxyInfo.active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span className="truncate max-w-[100px]">{proxyInfo.name}</span>
          </button>
        )}

        {/* Settings & Themes Button */}
        <button
          onClick={() => navigate('/settings')}
          className="h-8 flex items-center justify-center gap-1.5 rounded-full border border-sc-border bg-sc-surface px-2.5 xl:px-3 text-xs font-semibold text-white hover:border-sc-border-strong hover:bg-sc-surface-2 transition-all shadow-sm shrink-0 active:scale-95"
          title={t('themeAndSettings')}
        >
          <Sliders size={13} className="text-sc-accent shrink-0" />
          <span className="hidden xl:inline">{t('settings')}</span>
        </button>

        {/* User Account / Auth Dropdown */}
        {isAuth ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-8 flex items-center gap-2 rounded-full border border-sc-border bg-sc-surface py-0.5 pl-1 pr-1.5 md:pr-2.5 transition-colors hover:border-sc-border-strong active:scale-95 shrink-0"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={username}
                  className="h-6 w-6 rounded-full object-cover border border-sc-border shrink-0"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-sc-surface-2 border border-sc-border flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold max-w-[80px] truncate text-white hidden md:inline">
                {username}
              </span>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-10 w-48 rounded-sc-card border border-sc-border-strong bg-sc-surface/95 backdrop-blur-2xl py-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-sc-text-secondary hover:bg-sc-hover hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <User size={14} className="text-sc-accent" />
                    {t('profile')}
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onOpenThemeSettings) {
                        onOpenThemeSettings();
                      } else {
                        navigate('/settings');
                      }
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-sc-text-secondary hover:bg-sc-hover hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Settings size={14} className="text-sc-accent" />
                    {t('settings')}
                  </button>
                  <div className="my-1 border-t border-sc-border" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      authService.logout();
                      window.location.reload();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut size={14} />
                    {t('logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleQuickSync}
              disabled={isSyncing}
              className="h-8 hidden md:flex items-center gap-1.5 rounded-full border border-sc-border bg-sc-surface px-3 text-xs font-semibold text-sc-text-secondary hover:text-white hover:border-sc-accent transition-colors shrink-0"
              title={t('syncBrowserCookies')}
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin text-sc-accent' : ''} />
              <span>{t('syncCookies')}</span>
            </button>
            <button
              onClick={onOpenLogin}
              className="h-8 rounded-full bg-sc-accent px-4 text-xs font-bold text-white hover:bg-sc-accent-hover active:bg-sc-accent-active transition-all shadow-md shadow-sc-accent/25 shrink-0 flex items-center justify-center"
            >
              {t('login')}
            </button>
          </div>
        )}
      </div>

      {/* Windows Native Controls */}
      {isElectron && (
        <div
          className="flex items-center border-l border-sc-border pl-2 -mr-2 gap-0.5 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <button
            onClick={handleMinimize}
            className="flex h-8 w-8 items-center justify-center rounded text-sc-text-secondary hover:bg-sc-hover hover:text-white transition-colors"
            title={t('minimize')}
          >
            <Minus size={13} />
          </button>
          <button
            onClick={handleMaximize}
            className="flex h-8 w-8 items-center justify-center rounded text-sc-text-secondary hover:bg-sc-hover hover:text-white transition-colors"
            title={t('maximize')}
          >
            <Square size={11} />
          </button>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded text-sc-text-secondary hover:bg-[#e81123] hover:text-white transition-colors"
            title={t('close')}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </header>
  );
}
