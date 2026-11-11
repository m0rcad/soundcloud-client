import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Download, MessageSquare, Share2, ArrowLeft } from 'lucide-react';
import { Track, Comment } from '@/types';
import { soundcloudApi } from '@/services/api';
import Waveform from '@/components/Waveform';
import { TrackRow } from '@/components/ui/TrackRow';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useI18n } from '@/services/i18n';

interface TrackPageViewProps {
  onPlayTrack: (track: Track, list?: Track[]) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  onLikeTrack: (track: Track) => void;
  onDownloadTrack: (track: Track) => void;
}

export const TrackPageView: React.FC<TrackPageViewProps> = ({
  onPlayTrack,
  currentTrack,
  isPlaying,
  onLikeTrack,
  onDownloadTrack,
}) => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const trackId = Number(id);

  useEffect(() => {
    if (!trackId || isNaN(trackId)) return;

    let isCancelled = false;
    const loadTrackDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trackData, commentsData] = await Promise.all([
          soundcloudApi.fetchTrack(trackId),
          soundcloudApi.getTrackComments(trackId),
        ]);
        if (!isCancelled) {
          setTrack(trackData);
          setComments(commentsData);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to load track');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadTrackDetails();
    return () => {
      isCancelled = true;
    };
  }, [trackId]);

  useEffect(() => {
    if (!track?.artist) return;
    soundcloudApi.searchTracks(track.artist, 6).then((res) => {
      setRelatedTracks(res.filter((tr) => tr.id !== track.id));
    }).catch(() => {});
  }, [track?.artist, track?.id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !track) return;
    try {
      const newComment = await soundcloudApi.postTrackComment(track.id, commentInput.trim(), 0);
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
        setCommentInput('');
      }
    } catch {}
  };

  const isCurrentPlaying = currentTrack?.id === track?.id;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <ErrorState message={error || 'Track not found'} onRetry={() => navigate(-1)} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-8 select-none">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-sc-text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        <span>{t('backToTracks')}</span>
      </button>

      <div className="relative rounded-sc overflow-hidden bg-sc-surface border border-sc-border p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative w-44 h-44 rounded-sc overflow-hidden shrink-0 bg-sc-surface-2 shadow-2xl border border-sc-border">
            <img
              src={track.artwork || '/favicon.png'}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between h-44 py-1 w-full">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => onPlayTrack(track)}
                  className="w-12 h-12 rounded-full bg-sc-accent hover:bg-sc-accent-hover flex items-center justify-center text-white shadow-lg shadow-sc-accent/25 transition-transform active:scale-95"
                >
                  {isCurrentPlaying && isPlaying ? (
                    <Pause size={22} className="fill-white" />
                  ) : (
                    <Play size={22} className="fill-white ml-0.5" />
                  )}
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                    {track.title}
                  </h1>
                  <p
                    onClick={() => navigate(`/artist/${encodeURIComponent(track.artist)}`)}
                    className="text-sm text-sc-text-secondary font-medium hover:text-white cursor-pointer hover:underline mt-0.5"
                  >
                    {track.artist}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full">
              <Waveform
                waveformUrl={track.waveform_url}
                progress={isCurrentPlaying ? 0.3 : 0}
                height={40}
                trackId={track.id}
                interactive={false}
                comments={comments}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-sc-border">
          <Button
            size="sm"
            variant="secondary"
            icon={<Heart size={15} className={track.liked ? 'fill-sc-accent text-sc-accent' : ''} />}
            onClick={() => onLikeTrack(track)}
          >
            {track.liked ? t('trackLiked') : t('like')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download size={15} />}
            onClick={() => onDownloadTrack(track)}
          >
            {t('download')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Share2 size={15} />}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
            }}
          >
            {t('shareTrack')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare size={17} className="text-sc-accent" />
            <span>{t('commentsTitle')} ({comments.length})</span>
          </h2>

          <form onSubmit={handlePostComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={t('writeComment')}
              className="flex-1 rounded-sc border border-sc-border bg-sc-surface px-3 py-2 text-xs text-white placeholder:text-sc-text-secondary focus:border-sc-accent focus:outline-none"
            />
            <Button size="sm" variant="primary" type="submit">
              {t('sendComment')}
            </Button>
          </form>

          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-sc bg-sc-surface border border-sc-border">
                <img
                  src={c.user.avatar_url || '/favicon.png'}
                  alt={c.user.username}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-sc-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{c.user.username}</span>
                  </div>
                  <p className="text-xs text-sc-text-secondary mt-1 break-words">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-white mb-3">{t('relatedTracks')}</h2>
          <div className="space-y-1">
            {relatedTracks.map((relTrack) => (
              <TrackRow
                key={relTrack.id}
                track={relTrack}
                isActive={currentTrack?.id === relTrack.id}
                isPlaying={isPlaying && currentTrack?.id === relTrack.id}
                onPlay={() => onPlayTrack(relTrack)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
