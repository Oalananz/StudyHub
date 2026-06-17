/**
 * Study Hub brand mark — an open book whose pages fan out into a knowledge
 * network. Recreated as a transparent vector so it reads cleanly on the dark UI.
 * Pass a width/height via `className` (e.g. "h-9 w-9").
 */
export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  const book = "#cdd3f7"; // light indigo — visible on dark backgrounds
  const node = "#2ec4dd"; // cyan accent, from the brand image

  return (
    <svg
      viewBox="0 0 104 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Study Hub"
    >
      {/* Spine */}
      <path d="M40 16 V70" stroke={book} strokeWidth="3.5" strokeLinecap="round" />

      {/* Left cover / pages */}
      <path
        d="M40 16 C30 12 18 12 10 16 V64 C18 60 30 60 40 64 Z"
        fill={book}
        fillOpacity="0.16"
        stroke={book}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Right pages fanning toward the network */}
      <path d="M40 18 C50 14 60 15 70 21" stroke={book} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 30 C50 26 60 27 70 33" stroke={book} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 64 C50 60 60 61 70 67" stroke={book} strokeWidth="3" strokeLinecap="round" />

      {/* Connector from the page hub out to the network */}
      <path d="M40 47 H62" stroke={node} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 47 L86 32 M70 47 L88 50 M70 47 L82 66" stroke={node} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M88 50 L99 40 M88 50 L98 62" stroke={node} strokeWidth="2.2" strokeLinecap="round" />

      {/* Network nodes */}
      <circle cx="70" cy="47" r="4.6" fill={node} />
      <circle cx="86" cy="32" r="3.4" fill={node} />
      <circle cx="88" cy="50" r="4" fill={node} />
      <circle cx="82" cy="66" r="3.2" fill={node} />
      <circle cx="99" cy="40" r="2.6" fill={node} />
      <circle cx="98" cy="62" r="2.6" fill={node} />
    </svg>
  );
}
