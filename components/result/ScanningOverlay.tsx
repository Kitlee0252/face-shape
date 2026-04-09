'use client';

interface ScanningOverlayProps {
  active: boolean;
  statusText: string;
}

export default function ScanningOverlay({ active, statusText }: ScanningOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-10 overflow-hidden transition-opacity duration-500 pointer-events-none ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 rounded-2xl" />

      {/* Scanning line */}
      {active && (
        <div
          className="absolute left-0 right-0 h-[3px] rounded-2xl animate-[scanLine_2s_ease-in-out_infinite]"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(232,133,108,0.1) 30%, #E8856C 50%, rgba(232,133,108,0.1) 70%, transparent 100%)',
            boxShadow: '0 0 20px 4px rgba(232,133,108,0.4), 0 0 60px 8px rgba(232,133,108,0.15)',
          }}
        />
      )}

      {/* Status text */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="inline-flex items-center gap-2 bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          {statusText}
        </span>
      </div>

    </div>
  );
}
