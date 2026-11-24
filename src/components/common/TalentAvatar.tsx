import React, { useEffect, useState } from 'react';
import { TalentProfileRecord } from '../../types/commerce';
import { fetchWikipediaPortrait } from '../../utils/wikipediaPortrait';

interface TalentAvatarProps {
  talent: Pick<
    TalentProfileRecord,
    'name' | 'portraitUrl' | 'monogramInitials' | 'monogramAccent'
  > & {
    id?: string;
    identityCheckRequired?: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  autoResolveWiki?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<TalentAvatarProps['size']>, string> = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

export const TalentAvatar: React.FC<TalentAvatarProps> = ({
  talent,
  size = 'md',
  className = '',
  autoResolveWiki = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [wikiFallbackUrl, setWikiFallbackUrl] = useState<string | null>(null);
  const [wikiAttempted, setWikiAttempted] = useState(false);

  // Reset image failure state whenever switching to a different talent or updating portraitUrl
  useEffect(() => {
    setImgFailed(false);
    setWikiFallbackUrl(null);
    setWikiAttempted(false);
  }, [talent.id, talent.portraitUrl, talent.name]);

  // If no static portraitUrl exists (or if the primary portraitUrl errored) and identity is not flagged,
  // attempt one live Wikipedia REST lookup fallback.
  useEffect(() => {
    if (!autoResolveWiki || talent.identityCheckRequired || wikiAttempted) return;
    if (talent.portraitUrl && !imgFailed) return;

    let active = true;
    setWikiAttempted(true);
    fetchWikipediaPortrait(talent.name).then((res) => {
      if (active && res?.url) {
        setWikiFallbackUrl(res.url);
        setImgFailed(false);
      }
    });
    return () => {
      active = false;
    };
  }, [
    autoResolveWiki,
    talent.identityCheckRequired,
    talent.portraitUrl,
    talent.name,
    imgFailed,
    wikiAttempted,
  ]);

  const effectiveSrc = !imgFailed && talent.portraitUrl
    ? talent.portraitUrl
    : wikiFallbackUrl;

  if (effectiveSrc) {
    return (
      <img
        src={effectiveSrc}
        alt={talent.name}
        referrerPolicy="no-referrer"
        onError={() => {
          if (effectiveSrc === talent.portraitUrl && wikiFallbackUrl) {
            setImgFailed(true);
          } else if (effectiveSrc === wikiFallbackUrl) {
            setWikiFallbackUrl(null);
            setImgFailed(true);
          } else {
            setImgFailed(true);
          }
        }}
        className={`${SIZE_CLASSES[size]} rounded object-cover object-top border border-zinc-200 bg-zinc-100 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={talent.name}
      style={{ backgroundColor: talent.monogramAccent || '#18181B' }}
      className={`${SIZE_CLASSES[size]} rounded flex items-center justify-center font-display font-bold tracking-tight text-white border border-black/15 shrink-0 select-none ${className}`}
    >
      {talent.monogramInitials}
    </div>
  );
};
