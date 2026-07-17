/**
 * Stylized car silhouette used when a vehicle has no photo yet.
 * Shape varies slightly by category so cards don't look identical.
 */
export default function CarSilhouette({ category }: { category: string }) {
  const isSuv = category === "SUV";
  const body = isSuv
    ? "M30 118 L38 84 Q42 70 60 66 L96 58 Q112 44 140 42 L210 42 Q240 44 256 60 L282 66 Q300 70 304 86 L310 118 Z"
    : "M22 118 L36 92 Q44 78 66 74 L104 66 Q126 46 158 44 L212 46 Q246 50 268 72 L296 80 Q312 84 316 98 L318 118 Z";

  return (
    <svg
      viewBox="0 0 340 140"
      className="h-full w-full"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="carbody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2439" />
          <stop offset="55%" stopColor="#0f1626" />
          <stop offset="100%" stopColor="#0a0f1b" />
        </linearGradient>
        <linearGradient id="carline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f6bff" stopOpacity="0" />
          <stop offset="50%" stopColor="#5b8cff" />
          <stop offset="100%" stopColor="#2f6bff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={body} fill="url(#carbody)" stroke="#26334f" strokeWidth="1.5" />
      <path d={body} fill="none" stroke="url(#carline)" strokeWidth="1" opacity="0.7" />
      <circle cx={isSuv ? 92 : 96} cy="118" r="17" fill="#0a0f1b" stroke="#2c3a58" strokeWidth="3" />
      <circle cx={isSuv ? 250 : 254} cy="118" r="17" fill="#0a0f1b" stroke="#2c3a58" strokeWidth="3" />
      <circle cx={isSuv ? 92 : 96} cy="118" r="6" fill="#1c2740" />
      <circle cx={isSuv ? 250 : 254} cy="118" r="6" fill="#1c2740" />
      <line x1="30" y1="132" x2="310" y2="132" stroke="#1c2740" strokeWidth="1" />
    </svg>
  );
}
