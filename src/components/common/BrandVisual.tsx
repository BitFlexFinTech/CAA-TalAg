import React, { useEffect, useState } from 'react';
import { BrandRecord, DiscoveredProduct } from '../../types/commerce';
import { resolveBrandMedia } from '../../data/brandProductMedia';

interface BrandVisualProps {
  brand?: Pick<BrandRecord, 'id' | 'name' | 'normalizedName' | 'logoUrl' | 'imageUrl' | 'imageCredit'>;
  nameFallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  mode?: 'logo' | 'hero';
  className?: string;
}

const SIZE_MAP: Record<NonNullable<BrandVisualProps['size']>, string> = {
  xs: 'w-7 h-7 rounded',
  sm: 'w-9 h-9 rounded',
  md: 'w-12 h-12 rounded-md',
  lg: 'w-16 h-16 rounded-md',
  xl: 'w-20 h-20 rounded-md',
};

export const BrandVisual: React.FC<BrandVisualProps> = ({
  brand,
  nameFallback = 'Brand',
  size = 'sm',
  mode = 'logo',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  const resolved = brand ? resolveBrandMedia(brand) : undefined;
  const src =
    mode === 'hero'
      ? brand?.imageUrl || resolved?.imageUrl || brand?.logoUrl || resolved?.logoUrl
      : brand?.logoUrl || resolved?.logoUrl || brand?.imageUrl || resolved?.imageUrl;

  const isLogoMark =
    mode === 'logo' &&
    Boolean(
      resolved?.isLogoMark ||
        src?.endsWith('.png') ||
        src?.includes('logo')
    );

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const label = brand?.name || nameFallback;
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || 'BR';

  if (src && !failed) {
    return (
      <div
        className={`${SIZE_MAP[size]} shrink-0 overflow-hidden bg-white border border-zinc-200 flex items-center justify-center ${className}`}
      >
        <img
          src={src}
          alt={label}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className={`w-full h-full ${isLogoMark ? 'object-contain p-1' : 'object-cover'}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} shrink-0 bg-zinc-900 text-white border border-zinc-200 flex items-center justify-center font-mono-tabular text-[11px] font-bold tracking-tight ${className}`}
      aria-label={label}
    >
      {initials}
    </div>
  );
};

interface ProductVisualProps {
  product: Pick<DiscoveredProduct, 'id' | 'brandId' | 'title' | 'image' | 'imageCredit'>;
  brand?: Pick<BrandRecord, 'id' | 'name' | 'normalizedName' | 'logoUrl' | 'imageUrl' | 'imageCredit'>;
  aspect?: 'square' | '4:3' | 'thumb';
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  product,
  brand,
  aspect = '4:3',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  const brandMedia = brand ? resolveBrandMedia(brand) : undefined;
  const src = product.image || brandMedia?.imageUrl || brandMedia?.logoUrl;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const frameClass =
    aspect === 'thumb'
      ? 'w-14 h-14 rounded'
      : aspect === 'square'
      ? 'w-full aspect-square rounded'
      : 'w-full aspect-[4/3] rounded';

  if (src && !failed) {
    return (
      <div
        className={`${frameClass} overflow-hidden bg-zinc-50 border border-zinc-200 flex items-center justify-center ${className}`}
      >
        <img
          src={src}
          alt={product.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-contain p-1.5 bg-white"
        />
      </div>
    );
  }

  return (
    <div
      className={`${frameClass} bg-zinc-100 border border-zinc-200 flex items-center justify-center px-2 text-center text-[10px] font-medium text-zinc-500 ${className}`}
    >
      {product.title.slice(0, 24)}
    </div>
  );
};
