'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';

interface ScannerControlsProps {
  module: string;
  lastScan?: string;
  onScan?: () => void;
}

export function ScannerControls({ module, lastScan, onScan }: ScannerControlsProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    onScan?.();
    // Simulate scan
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsScanning(false);
  };

  return (
    <div className="flex items-center gap-3">
      {lastScan && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Último scan: {lastScan}</span>
        </div>
      )}
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={handleScan}
        disabled={isScanning}
      >
        <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
        {isScanning ? 'Escaneando...' : `Escanear ${module}`}
      </Button>
    </div>
  );
}
