import React, { useRef, useState } from 'react';
import { Loader2, Move } from 'lucide-react';
import { MockupPlacement, MockupTextOverlay } from '../../utils/mockupCompositor';

interface LiveMockupStageProps {
  blankSrc: string;
  blankAlt: string;
  artworkSrc?: string;
  textOverlay?: MockupTextOverlay | null;
  placement: MockupPlacement;
  onChangePlacement: (next: MockupPlacement) => void;
  loadingBlank?: boolean;
  showGuides?: boolean;
  compact?: boolean;
}

export const LiveMockupStage: React.FC<LiveMockupStageProps> = ({
  blankSrc,
  blankAlt,
  artworkSrc,
  textOverlay,
  placement,
  onChangePlacement,
  loadingBlank = false,
  showGuides = true,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const hasDesign = Boolean(artworkSrc || (textOverlay && textOverlay.text.trim()));

  const updateFromPointer = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100));
    onChangePlacement({
      ...placement,
      xPct: Math.round(xPct * 10) / 10,
      yPct: Math.round(yPct * 10) / 10,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasDesign) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative aspect-square w-full bg-zinc-50 border border-zinc-200 rounded-md overflow-hidden select-none touch-none ${
        hasDesign ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {loadingBlank && (
        <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-1.5 text-xs text-zinc-600 z-30">
          <Loader2 className="w-5 h-5 animate-spin text-[#BC1F2F]" />
          <span>Loading live blank variant...</span>
        </div>
      )}

      {/* Base Blank Photo */}
      <img
        src={blankSrc}
        alt={blankAlt}
        referrerPolicy="no-referrer"
        draggable={false}
        className="w-full h-full object-contain p-[4%] pointer-events-none"
      />

      {/* Subtle Center Alignment Guides while dragging or when guides active */}
      {hasDesign && (showGuides || dragging) && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity ${
            dragging ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-[#BC1F2F]/40" />
          <div className="absolute left-0 right-0 top-[42%] border-t border-dashed border-zinc-400/35" />
        </div>
      )}

      {/* Real-Time Design Layer Overlay */}
      {hasDesign && (
        <div
          style={{
            left: `${placement.xPct}%`,
            top: `${placement.yPct}%`,
            width: `${placement.scalePct}%`,
            transform: `translate(-50%, -50%) rotate(${placement.rotationDeg}deg)`,
            opacity: placement.opacity,
            mixBlendMode: placement.blendMode,
          }}
          className={`pointer-events-none absolute z-10 flex flex-col items-center justify-center ${
            dragging
              ? 'ring-2 ring-[#BC1F2F] ring-offset-2 ring-offset-transparent rounded-xs'
              : showGuides
              ? 'ring-1 ring-dashed ring-[#BC1F2F]/55 rounded-xs'
              : ''
          }`}
        >
          {artworkSrc && (
            <img
              src={artworkSrc}
              alt="Mockup artwork overlay"
              draggable={false}
              className="w-full h-auto object-contain block"
            />
          )}
          {textOverlay && textOverlay.text.trim() && (
            <span
              style={{
                color: textOverlay.color,
                fontSize: compact
                  ? `${Math.max(10, textOverlay.sizePct * 3.1)}px`
                  : `${Math.max(12, textOverlay.sizePct * 4.6)}px`,
              }}
              className={`font-black tracking-tight text-center leading-none whitespace-nowrap ${
                textOverlay.uppercase ? 'uppercase' : ''
              } ${artworkSrc ? 'mt-1.5' : ''}`}
            >
              {textOverlay.text.trim()}
            </span>
          )}
        </div>
      )}

      {/* Corner Live Status Hint */}
      {hasDesign && (
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 z-20">
          <span className="inline-flex items-center gap-1 bg-zinc-900/80 text-white text-[10px] px-2 py-1 rounded-xs">
            <Move className="w-3 h-3 text-amber-300" />
            <span>Drag anywhere on garment to position · Real-time preview</span>
          </span>
          <span className="font-mono-tabular bg-white/90 border border-zinc-200 text-zinc-800 text-[10px] px-2 py-0.5 rounded-xs">
            X {Math.round(placement.xPct)}% · Y {Math.round(placement.yPct)}% · {placement.scalePct}%
          </span>
        </div>
      )}
    </div>
  );
};
