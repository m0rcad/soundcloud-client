import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Download,
  Volume2,
  VolumeX,
  ListMusic,
  Loader2,
  MessageSquare,
  Mic2,
  SlidersHorizontal,
  Clock,
  Gauge,
  Zap,
  Sparkles,
  Mic,
  Radio,
  LucideIcon,
  MonitorPlay,
} from 'lucide-react';
import { Track, Comment } from '@/types';
import { formatTime } from '@/services/utils';
import { audioService, EqualizerPreset } from '@/services/audio';
import { useI18n } from '@/services/i18n';
import Waveform from './Waveform';

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  liked: boolean;
  downloading: boolean;
  queueCount?: number;
  isQueueOpen?: boolean;
  comments?: Comment[];
  speed?: number;
  sleepTimerSeconds?: number | null;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (progress: number) => void;
  onVolume: (vol: number) => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onLike: () => void;
  onDownload: () => void;
  onToggleQueue?: () => void;
  onOpenComments?: () => void;
  onOpenLyrics?: () => void;
  onTrackTitleClick?: () => void;
  onArtistClick?: (artist: string) => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  progress,
  currentTime,
  duration,
  volume,
  shuffle,
  repeatMode,
  liked,
  downloading,
  queueCount = 0,
  isQueueOpen = false,
  comments = [],
  speed = 1.0,
  sleepTimerSeconds = null,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolume,
  onShuffle,
  onRepeat,
  onLike,
  onDownload,
  onToggleQueue,
  onOpenComments,
  onOpenLyrics,
  onTrackTitleClick,
  onArtistClick,
}) => {
  const { t } = useI18n();
  const [eqOpen, setEqOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [currentEq, setCurrentEq] = useState<EqualizerPreset>(audioService.getEqualizerPreset());
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEqOpen(false);
        setSpeedOpen(false);
        setTimerOpen(false);
      }
    };
    if (eqOpen || speedOpen || timerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [eqOpen, speedOpen, timerOpen]);

  if (!track) return null;

  const handleSelectEq = (preset: EqualizerPreset) => {
    audioService.setEqualizerPreset(preset);
    setCurrentEq(preset);
    setEqOpen(false);
  };

  const handleSelectSpeed = (s: number) => {
    audioService.setSpeed(s);
    setSpeedOpen(false);
  };

  const handleSelectTimer = (min: number | null) => {
    audioService.setSleepTimer(min);
    setTimerOpen(false);
  };

  const handleToggleMute = () => {
    const next = audioService.toggleMute();
    onVolume(next);
  };

  const handleToggleOverlay = () => {
    if ((window as any).electronAPI?.toggleOverlay) {
      (window as any).electronAPI.toggleOverlay();
    }
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const timers = [
    { label: t('timerOff'), val: null },
    { label: `15 ${t('minShort')}`, val: 15 },
    { label: `30 ${t('minShort')}`, val: 30 },
    { label: `45 ${t('minShort')}`, val: 45 },
    { label: `60 ${t('minShort')}`, val: 60 },
  ];
  const eqPresets: { id: EqualizerPreset; label: string; icon: LucideIcon }[] = [
    { id: 'flat', label: t('equalizerFlat'), icon: SlidersHorizontal },
    { id: 'bass_boost', label: t('equalizerBass'), icon: Volume2 },
    { id: 'phonk', label: t('equalizerPhonk'), icon: Zap },
    { id: 'treble_boost', label: t('equalizerTreble'), icon: Sparkles },
    { id: 'vocal', label: t('equalizerVocal'), icon: Mic },
    { id: 'rock', label: t('equalizerRock'), icon: Radio },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[74px] items-center gap-4 border-t border-sc-border bg-sc-bg px-5 select-none transition-colors shadow-2xl">
      {/* Track metadata block */}
      <div className="flex w-72 shrink-0 items-center gap-3 overflow-hidden">
        <div
          className="relative h-12 w-12 shrink-0 rounded-sc overflow-hidden bg-sc-surface border border-sc-border cursor-pointer group shadow-md"
          onClick={onTrackTitleClick}
        >
          <img
            src={track.artwork || '/favicon.png'}
            alt={track.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <p
            onClick={onTrackTitleClick}
            className="truncate text-sm font-bold text-white hover:underline cursor-pointer"
            title={track.title}
          >
            {track.title}
          </p>
          <p
            onClick={() => onArtistClick?.(track.artist)}
            className="truncate text-xs text-sc-text-secondary hover:text-white cursor-pointer hover:underline"
          >
            {track.artist}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onLike}
            className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 hover:bg-sc-hover shrink-0 ${
              liked ? 'text-sc-accent' : 'text-sc-text-secondary hover:text-white'
            }`}
            title={liked ? t('unlike') : t('like')}
          >
            <Heart size={16} fill={liked ? 'var(--sc-accent)' : 'none'} />
          </button>
          <button
            onClick={onOpenComments}
            className="h-8 w-8 flex items-center justify-center rounded-full text-sc-text-secondary hover:text-white hover:bg-sc-hover transition-all duration-150 active:scale-95 shrink-0"
            title={t('comments')}
          >
            <MessageSquare size={16} />
          </button>
          {onOpenLyrics && (
            <button
              onClick={onOpenLyrics}
              className="h-8 w-8 flex items-center justify-center rounded-full text-sc-text-secondary hover:text-white hover:bg-sc-hover transition-all duration-150 active:scale-95 shrink-0"
              title={t('lyrics')}
            >
              <Mic2 size={16} />
            </button>
          )}
          <button
            onClick={onDownload}
            disabled={downloading}
            className="h-8 w-8 flex items-center justify-center rounded-full text-sc-text-secondary hover:text-white hover:bg-sc-hover transition-all duration-150 active:scale-95 disabled:opacity-50 shrink-0"
            title={t('download')}
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin text-sc-accent" />
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Main playback controls */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onShuffle}
            className={`h-8 w-8 flex items-center justify-center transition-all duration-150 rounded-full active:scale-90 shrink-0 ${
              shuffle ? 'text-sc-accent bg-sc-accent/15' : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
            }`}
            title={t('shuffle')}
          >
            <Shuffle size={15} />
          </button>
          <button
            onClick={onPrev}
            className="h-8 w-8 flex items-center justify-center text-sc-text-secondary hover:text-white transition-all duration-150 rounded-full hover:bg-sc-hover active:scale-90 shrink-0"
            title={t('previous')}
          >
            <SkipBack size={17} fill="currentColor" />
          </button>
          <button
            onClick={onPlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sc-accent text-white hover:bg-sc-accent-hover active:bg-sc-accent-active transition-all duration-150 active:scale-95 shadow-md shadow-sc-accent/30 shrink-0"
            title={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying ? (
              <Pause size={18} fill="white" />
            ) : (
              <Play size={18} fill="white" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={onNext}
            className="h-8 w-8 flex items-center justify-center text-sc-text-secondary hover:text-white transition-all duration-150 rounded-full hover:bg-sc-hover active:scale-90 shrink-0"
            title={t('next')}
          >
            <SkipForward size={17} fill="currentColor" />
          </button>
          <button
            onClick={onRepeat}
            className={`h-8 w-8 flex items-center justify-center transition-all duration-150 rounded-full active:scale-90 shrink-0 ${
              repeatMode !== 'off'
                ? 'text-sc-accent bg-sc-accent/15'
                : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
            }`}
            title={repeatMode === 'one' ? t('repeatOne') : repeatMode === 'all' ? t('repeatAll') : t('repeatOff')}
          >
            {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>
        </div>

        <div className="flex w-full max-w-2xl items-center gap-2.5">
          <span className="w-10 text-right text-[11px] tabular-nums font-mono text-sc-text-secondary">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1">
            <Waveform
              waveformUrl={track.waveform_url}
              progress={progress}
              height={22}
              interactive
              isPlaying={isPlaying}
              trackId={track.id}
              duration={duration}
              comments={comments}
              onSeek={onSeek}
            />
          </div>
          <span className="w-10 text-[11px] tabular-nums font-mono text-sc-text-secondary">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Audio FX, speed, sleep timer & volume controls */}
      <div ref={popoverRef} className="flex min-w-[320px] shrink-0 items-center justify-end gap-1.5 relative">
        {/* Equalizer Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setEqOpen(!eqOpen);
              setSpeedOpen(false);
              setTimerOpen(false);
            }}
            className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 shrink-0 ${
              currentEq !== 'flat'
                ? 'text-sc-accent bg-sc-accent/15 shadow-sm'
                : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
            }`}
            title={t('equalizer')}
          >
            <SlidersHorizontal size={15} />
          </button>

          {eqOpen && (
            <div className="absolute bottom-12 right-0 w-52 rounded-sc-card border border-sc-border-strong bg-sc-surface/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[11px] font-bold text-white mb-2 px-2.5 pt-1 uppercase tracking-wider">{t('equalizerPresets')}</p>
              <div className="space-y-1">
                {eqPresets.map((p) => {
                  const Icon = p.icon;
                  const isCur = currentEq === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectEq(p.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-sc text-xs transition-colors flex items-center justify-between ${
                        isCur
                          ? 'bg-sc-accent text-white font-bold shadow-sm'
                          : 'text-sc-text-secondary hover:bg-sc-hover hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={14} className={isCur ? 'text-white' : 'text-sc-text-tertiary'} />
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Playback Speed Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setSpeedOpen(!speedOpen);
              setEqOpen(false);
              setTimerOpen(false);
            }}
            className={`h-8 px-2 flex items-center justify-center rounded-full transition-all duration-150 text-xs font-bold active:scale-95 shrink-0 ${
              speed !== 1.0
                ? 'text-sc-accent bg-sc-accent/15'
                : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
            }`}
            title={`${t('speed')}: ${speed}x`}
          >
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Gauge size={13} />
              {speed}x
            </span>
          </button>

          {speedOpen && (
            <div className="absolute bottom-12 right-0 w-32 rounded-sc-card border border-sc-border-strong bg-sc-surface/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[10px] font-bold text-white mb-1.5 px-2 uppercase tracking-wider">{t('speed')}</p>
              <div className="space-y-0.5">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectSpeed(s)}
                    className={`w-full text-left px-2 py-1.5 rounded-sc text-xs font-mono transition-colors ${
                      speed === s
                        ? 'bg-sc-accent text-white font-bold shadow-sm'
                        : 'text-sc-text-secondary hover:bg-sc-hover hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sleep Timer Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setTimerOpen(!timerOpen);
              setEqOpen(false);
              setSpeedOpen(false);
            }}
            className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 shrink-0 ${
              sleepTimerSeconds
                ? 'text-emerald-400 bg-emerald-950/40 shadow-sm'
                : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
            }`}
            title={
              sleepTimerSeconds
                ? `${t('sleepTimer')}: ${Math.floor(sleepTimerSeconds / 60)}${t('minShort')}`
                : t('sleepTimer')
            }
          >
            <Clock size={15} />
          </button>

          {timerOpen && (
            <div className="absolute bottom-12 right-0 w-40 rounded-sc-card border border-sc-border-strong bg-sc-surface/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[10px] font-bold text-white mb-1.5 px-2 uppercase tracking-wider">{t('sleepTimer')}</p>
              <div className="space-y-0.5">
                {timers.map((timerItem, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTimer(timerItem.val)}
                    className="w-full text-left px-2 py-1.5 rounded-sc text-xs text-sc-text-secondary hover:bg-sc-hover hover:text-white transition-colors"
                  >
                    {timerItem.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Island Overlay Quick Launch */}
        <button
          onClick={handleToggleOverlay}
          className="h-8 w-8 flex items-center justify-center rounded-full text-sc-text-secondary hover:text-white hover:bg-sc-hover transition-all duration-150 active:scale-95 shrink-0"
          title="Запустить десктопный оверлей (Desktop Island)"
        >
          <MonitorPlay size={15} />
        </button>

        {/* Volume Slider with Accent Gradient */}
        <div className="flex items-center gap-1.5 group shrink-0">
          <button
            onClick={handleToggleMute}
            className="h-8 w-8 flex items-center justify-center rounded-full text-sc-text-secondary hover:text-white hover:bg-sc-hover transition-colors shrink-0"
            title={volume === 0 ? t('unmute') : t('mute')}
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-sc-surface-2 accent-sc-accent transition-all"
            style={{
              background: `linear-gradient(to right, var(--sc-accent) ${volume}%, var(--sc-surface-2) ${volume}%)`,
            }}
          />
        </div>

        {/* Queue panel button */}
        {onToggleQueue && (
          <button
            onClick={onToggleQueue}
            className={`relative h-8 w-8 flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 shrink-0 ${
              isQueueOpen
                ? 'text-sc-accent bg-sc-accent/15 shadow-sm'
                : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover'
            }`}
            title={t('queue')}
          >
            <ListMusic size={17} />
            {queueCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sc-accent text-white shadow-sm">
                {queueCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
