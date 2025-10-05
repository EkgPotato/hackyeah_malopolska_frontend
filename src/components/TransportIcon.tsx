import { Train, Bus } from 'lucide-react';
import type { TransportType } from '~/lib/types';

interface TransportIconProps {
  type: TransportType;
  className?: string;
}

export function TransportIcon({ type, className = "h-5 w-5" }: TransportIconProps) {
  switch (type) {
    case 'train':
      return <Train className={className} />;
    case 'bus':
      return <Bus className={className} />;
    case 'tram':
      return <Train className={className} />;
    default:
      return <Train className={className} />;
  }
}