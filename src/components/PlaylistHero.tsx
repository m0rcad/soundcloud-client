import { Play, Download, Heart, Share2, Music2, Loader2 } from 'lucide-react';
import { Playlist } from '@/types';
import { formatRelativeTime } from '@/services/utils';
import { useI18n } from '@/services/i18n';

interface PlaylistHeroProps {
  playlist: Playlist;
  onPlayAll: () => void;
  onDownloadAll: () => void;
  downloadingAll?: boolean;
  liked: boolean;
  onLike: () => void;
}

export default function PlaylistHero({
  playlist,
  onPlayAll,
  onDownloadAll,
  downloadingAll = false,
  liked,
  onLike,
}: PlaylistHeroProps) {
  const { t } = useI18n();
  const totalSeconds = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const durationText = hours > 0 ? `${hours} ${t('hoursShort')} ${minutes} ${t('minShort')}` : `${minutes} ${t('minShort')}`;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 md:p-8 rounded-sc-modal sc-glass border border-sc-border mb-6 shadow-2xl">
      <div className="relative shrink-0 mx-auto md:mx-0 group">
        {playlist.artwork ? (
          <img
            src={playlist.artwork}
            alt={playlist.title}
            className="h-52 w-52 rounded-sc-card object-cover shadow-2xl shadow-black/80 border border-sc-border-strong group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="h-52 w-52 rounded-sc-card bg-sc-surface border border-sc-border flex items-center justify-center text-sc-text-secondary shadow-2xl shadow-black/80">
            <Music2 size={64} className="opacity-40" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-end gap-3 text-center md:text-left">
        <span className="text-xs font-bold tracking-widest text-sc-accent uppercase">{t('playlistUpper')}</span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">{playlist.title}</h1>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-sc-text-secondary">
          <span className="font-semibold text-white hover:text-sc-accent hover:underline cursor-pointer">{playlist.artist}</span>
          <span>•</span>
          <span>{playlist.updated_at ? `${t('updated')} ${formatRelativeTime(playlist.updated_at)}` : `${t('updated')} ${playlist.updatedDaysAgo} ${t('daysAgo')}`}</span>
          <span>•</span>
          <span className="font-mono">{playlist.tracks.length} {t('tracksCount')}</span>
          <span>•</span>
          <span className="font-mono">{durationText}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
          <button
            onClick={onPlayAll}
            className="flex items-center gap-2 rounded-full bg-sc-accent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-sc-accent-hover active:scale-95 shadow-lg shadow-sc-accent/25"
          >
            <Play size={18} fill="white" />
            {t('playAll')}
          </button>
          <button
            onClick={onDownloadAll}
            disabled={downloadingAll}
            className="flex items-center gap-2 rounded-full border border-sc-border bg-sc-surface px-4.5 py-2.5 text-sm font-medium transition-all hover:bg-sc-hover hover:border-sc-border-strong active:scale-95 disabled:opacity-50"
          >
            {downloadingAll ? <Loader2 size={16} className="animate-spin text-sc-accent" /> : <Download size={16} />}
            {t('downloadPlaylistFree')}
          </button>
          <button
            onClick={onLike}
            className={`flex items-center gap-2 rounded-full border border-sc-border bg-sc-surface px-4 py-2.5 text-sm font-medium transition-all hover:bg-sc-hover active:scale-95 ${
              liked ? 'text-sc-accent border-sc-accent/40' : 'text-white'
            }`}
          >
            <Heart size={16} fill={liked ? 'var(--sc-accent)' : 'none'} />
            {t('like')}
          </button>
          <button className="flex items-center gap-2 rounded-full border border-sc-border bg-sc-surface px-4 py-2.5 text-sm font-medium transition-all hover:bg-sc-hover active:scale-95 text-sc-text-secondary hover:text-white">
            <Share2 size={16} />
            {t('shareTrack')}
          </button>
        </div>
      </div>
    </div>
  );
}
