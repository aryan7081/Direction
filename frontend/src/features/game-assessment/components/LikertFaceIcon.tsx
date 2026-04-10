'use client';

/**
 * Cut-out style faces (lavender shows through holes) — matches sentiment Likert UI.
 * Four steps: strong negative → negative → neutral → strong positive.
 */
export type LikertFaceStep = 0 | 1 | 2 | 3;

function safeMaskId(base: string, step: LikertFaceStep): string {
  return `likert-face-${base.replace(/[^a-zA-Z0-9_-]/g, '_')}-${step}`;
}

/** Mask holes: black = transparent on the purple tile (background shows through). */
function FaceMaskHoles({ step }: { step: LikertFaceStep }) {
  switch (step) {
    case 0:
      return (
        <>
          {/* X eyes */}
          <rect x="14" y="20" width="8" height="2.2" rx="0.5" transform="rotate(45 18 21.1)" fill="black" />
          <rect x="14" y="20" width="8" height="2.2" rx="0.5" transform="rotate(-45 18 21.1)" fill="black" />
          <rect x="34" y="20" width="8" height="2.2" rx="0.5" transform="rotate(45 38 21.1)" fill="black" />
          <rect x="34" y="20" width="8" height="2.2" rx="0.5" transform="rotate(-45 38 21.1)" fill="black" />
          {/* Frown + tongue hint */}
          <path d="M 17 36 Q 28 30 39 36" fill="none" stroke="black" strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="30" cy="40" rx="3" ry="2.2" fill="black" />
        </>
      );
    case 1:
      return (
        <>
          <ellipse cx="18" cy="22" rx="4" ry="5" fill="black" />
          <ellipse cx="38" cy="22" rx="4" ry="5" fill="black" />
          <path d="M 17 37 Q 28 44 39 37" fill="none" stroke="black" strokeWidth="3.2" strokeLinecap="round" />
        </>
      );
    case 2:
      return (
        <>
          <ellipse cx="18" cy="22" rx="4" ry="5" fill="black" />
          <ellipse cx="38" cy="22" rx="4" ry="5" fill="black" />
          <rect x="22" y="35" width="12" height="2.4" rx="0.6" transform="rotate(-8 28 36.2)" fill="black" />
        </>
      );
    case 3:
      return (
        <>
          {/* Happy / squint eyes */}
          <path d="M 14 24 Q 18 20 22 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
          <path d="M 34 24 Q 38 20 42 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
          <path d="M 15 34 Q 28 46 41 34" fill="none" stroke="black" strokeWidth="3.4" strokeLinecap="round" />
          {/* Teeth */}
          <rect x="22" y="36" width="2.2" height="5" rx="0.4" fill="black" />
          <rect x="25.5" y="36" width="2.2" height="5.5" rx="0.4" fill="black" />
          <rect x="29" y="36" width="2.2" height="5.5" rx="0.4" fill="black" />
          <rect x="32.5" y="36" width="2.2" height="5" rx="0.4" fill="black" />
        </>
      );
    default:
      return null;
  }
}

export function LikertFaceIcon({
  step,
  maskBaseId,
  size = 52,
}: {
  step: LikertFaceStep;
  maskBaseId: string;
  size?: number;
}) {
  const maskId = safeMaskId(maskBaseId, step);
  const purple = '#3d296e';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <mask id={maskId}>
          <rect width="56" height="56" rx="14" fill="white" />
          <FaceMaskHoles step={step} />
        </mask>
      </defs>
      <rect width="56" height="56" rx="14" fill={purple} mask={`url(#${maskId})`} />
    </svg>
  );
}
