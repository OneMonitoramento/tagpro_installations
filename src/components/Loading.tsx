// Path: ./src/components/Loading.tsx
import { RefreshCw } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading = ({ message = 'Carregando...', size = 'md' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
};

export default Loading;