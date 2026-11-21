import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({ value, size = 128, className = '' }) => {
  const gridSize = 21;
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderCell = (r: number, c: number): boolean | null => {
    const checkCorner = (tr: number, tc: number): boolean | null => {
      const dr = r - tr;
      const dc = c - tc;
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    };
    return (
      checkCorner(0, 0) ??
      checkCorner(0, gridSize - 7) ??
      checkCorner(gridSize - 7, 0)
    );
  };

  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const finder = isFinderCell(r, c);
      if (finder !== null) {
        if (finder) cells.push({ r, c });
        continue;
      }
      if ((r === 7 && c < 8) || (c === 7 && r < 8) || (r === 7 && c > gridSize - 9) || (c === gridSize - 8 && r < 8) || (r === gridSize - 8 && c < 8) || (c === 7 && r > gridSize - 9)) {
        continue;
      }
      const seed = (hash ^ (r * 31 + c * 97)) >>> 0;
      if ((seed % 11) < 5) {
        cells.push({ r, c });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize + 2} ${gridSize + 2}`}
      role="img"
      aria-label={`QR code for ${value}`}
      className={`rounded-lg bg-white p-1.5 border border-zinc-200 dark:border-slate-700 ${className}`}
    >
      <rect width={gridSize + 2} height={gridSize + 2} fill="#FFFFFF" />
      {cells.map((cell) => (
        <rect
          key={`${cell.r}-${cell.c}`}
          x={cell.c + 1}
          y={cell.r + 1}
          width={0.92}
          height={0.92}
          rx={0.12}
          fill="#18181B"
        />
      ))}
    </svg>
  );
};
