interface AdPlaceholderProps {
  size: '728x90' | '300x250' | '320x100' | '160x600';
  position?: string;
  label?: string;
}

export function AdPlaceholder({ size, position, label }: AdPlaceholderProps) {
  const dimensions: Record<string, { width: string; height: string }> = {
    '728x90': { width: '728px', height: '90px' },
    '300x250': { width: '300px', height: '250px' },
    '320x100': { width: '320px', height: '100px' },
    '160x600': { width: '160px', height: '600px' },
  };

  const { width, height } = dimensions[size];

  return (
    <div
      className="flex items-center justify-center bg-gray-800/30 border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 transition-colors"
      style={{
        minWidth: width,
        minHeight: height,
        maxWidth: '100%',
      }}
    >
      <div className="text-center p-4">
        <div className="text-2xl mb-2">🎯</div>
        <div className="text-xs text-gray-400">
          {label || `Reklam Alanı - ${size}`}
        </div>
        <div className="text-xs text-gray-500 mt-1">AdSense</div>
      </div>
    </div>
  );
}
