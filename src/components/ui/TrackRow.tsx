import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Download } from 'lucide-react';
import { Track } from '@/types';
import { formatTime } from '@/services/utils';
import { IconButton } from './IconButton';
import { clsx } from 'clsx';

interface TrackRowProps {
  track: Track;
  index?: number;
  isPlaying?: boolean;
  isActive?: boolean;
  onPlay: (track: Track) => void;
  onLike?: (track: Track) => void;
  onDownload?: (track: Track) => void;
  onMore?: (track: Track) => void;
  onArtistClick?: (artist: string) => void;
  showIndex?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  isPlaying = false,
  isActive = false,
  onPlay,
  onLike,
  onDownload,
  onMore,
  onArtistClick,
  showIndex = false,
}) => {
  return (
    <div
      className={clsx(
        'group flex items-center gap-3 px-3 py-2 rounded-sc transition-all duration-150 select-none text-sm',
        isActive
          ? 'bg-sc-surface border-l-2 border-sc-accent shadow-sm'
          : 'hover:bg-sc-hover'
      )}
    >
      {showIndex && typeof index === 'number' && (
        <span className="w-5 text-center text-xs text-sc-text-tertiary font-mono group-hover:hidden">
          {index + 1}
        </span>
      )}

      <div
        className="relative w-10 h-10 rounded shrink-0 overflow-hidden cursor-pointer bg-sc-surface border border-sc-border shadow-sm group/art"
        onClick={() => onPlay(track)}
      >
        <img
          src={track.artwork || '/favicon.png'}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover/art:scale-105"
          loading="lazy"
        />
        <div
          className={clsx(
            'absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-150',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {isActive && isPlaying ? (
            <Pause size={17} className="text-white fill-white" />
          ) : (
            <Play size={17} className="text-white fill-white ml-0.5" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span
          onClick={() => onPlay(track)}
          className={clsx(
            'font-semibold truncate cursor-pointer hover:underline text-xs sm:text-sm',
            isActive ? 'text-sc-accent' : 'text-white'
          )}
          title={track.title}
        >
          {track.title}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onArtistClick?.(track.artist);
          }}
          className="text-xs text-sc-text-secondary truncate hover:text-white cursor-pointer hover:underline"
        >
          {track.artist}
        </span>
      </div>

      {track.plays && (
        <span className="text-xs text-sc-text-tertiary shrink-0 hidden md:inline-flex items-center gap-1 tabular-nums font-mono">
          <Play size={10} className="fill-current text-sc-text-tertiary" />
          <span>{track.plays}</span>
        </span>
      )}

      <span className="text-xs text-sc-text-secondary shrink-0 tabular-nums font-mono px-1">
        {formatTime(track.duration)}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onLike && (
          <IconButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLike(track);
            }}
            active={track.liked}
            title={track.liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={14}
              className={track.liked ? 'fill-current text-sc-accent' : 'text-sc-text-secondary'}
            />
          </IconButton>
        )}

        {onDownload && (
          <IconButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(track);
            }}
            title="Download"
          >
            <Download size={14} className="text-sc-text-secondary hover:text-white" />
          </IconButton>
        )}

        {onMore && (
          <IconButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMore(track);
            }}
            title="More"
          >
            <MoreHorizontal size={14} className="text-sc-text-secondary hover:text-white" />
          </IconButton>
        )}
      </div>
    </div>
  );
};
