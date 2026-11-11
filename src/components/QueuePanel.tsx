import React, { useEffect, useState } from 'react';
import { X, Trash2, Music, Play, Pause } from 'lucide-react';
import { queueService, QueueState } from '@/services/queue';
import { Track } from '@/types';
import { TrackRow } from '@/components/ui/TrackRow';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/services/i18n';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  isOpen,
  onClose,
  onPlayTrack,
  isPlaying = false,
  onPlayPause,
}) => {
  const { t } = useI18n();
  const [state, setState] = useState<QueueState>(queueService.getState());

  useEffect(() => {
    return queueService.subscribe((updated) => setState(updated));
  }, []);

  if (!isOpen) return null;

  const currentTrack = queueService.getCurrentTrack();
  const upcomingTracks = state.items.slice(state.currentIndex + 1);

  return (
    <div className="fixed top-0 bottom-[74px] right-0 w-96 max-w-full sc-glass border-l border-sc-border z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-sc-border bg-sc-bg/80">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-sc bg-sc-accent/15">
            <Music size={16} className="text-sc-accent" />
          </div>
          <h2 className="font-extrabold text-white text-sm">{t('queue')}</h2>
          <span className="text-xs text-sc-text-tertiary font-mono">
            ({state.items.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {state.items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => queueService.clear()}
              title={t('clearQueue')}
            >
              {t('clearQueue')}
            </Button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sc-text-secondary hover:text-white hover:bg-sc-hover transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {currentTrack && (
          <div className="bg-sc-surface rounded-sc-card p-3 border border-sc-border shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-sc-accent uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sc-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sc-accent"></span>
                </span>
                {t('nowPlaying')}
              </span>
            </div>
            <TrackRow
              track={currentTrack}
              index={state.currentIndex + 1}
              isActive={true}
              isPlaying={isPlaying}
              onPlay={() => onPlayTrack(currentTrack)}
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-sc-text-secondary tracking-wider uppercase">
              {t('upNext')}
            </span>
            <span className="text-xs font-mono text-sc-text-tertiary">
              {upcomingTracks.length}
            </span>
          </div>

          {upcomingTracks.length > 0 ? (
            <div className="space-y-1">
              {upcomingTracks.map((item, idx) => {
                const actualIndex = state.currentIndex + 1 + idx;
                return (
                  <TrackRow
                    key={`${item.id}-${actualIndex}`}
                    track={item}
                    index={actualIndex + 1}
                    showIndex
                    onPlay={() => {
                      queueService.skipTo(actualIndex);
                      onPlayTrack(item);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 px-4 rounded-sc-card border border-dashed border-sc-border bg-sc-surface/40">
              <Music size={24} className="mx-auto text-sc-text-tertiary mb-2 opacity-60" />
              <p className="text-xs text-sc-text-secondary">
                {t('emptyQueue')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
