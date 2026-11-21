import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface MediaFrameProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  caption?: string;
  aspectClass?: string;
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  src,
  alt,
  className = '',
  imgClassName = 'object-cover',
  caption,
  aspectClass = 'aspect-[4/3]',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-zinc-100 border border-zinc-200 ${aspectClass} ${className}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`block w-full h-full ${imgClassName}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-zinc-100 text-zinc-500">
          <ImageOff className="w-5 h-5 mb-1.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-600 line-clamp-2">{alt}</span>
          <span className="text-[11px] text-zinc-400 mt-0.5">Illustrative Placeholder</span>
        </div>
      )}
      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 py-2">
          <p className="text-[11px] leading-snug text-white/95 font-medium truncate">{caption}</p>
        </div>
      )}
    </div>
  );
};
