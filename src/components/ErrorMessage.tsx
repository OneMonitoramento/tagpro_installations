// Path: ./src/components/ErrorMessage.tsx
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

const ErrorMessage = ({ 
  message, 
  onRetry, 
  retryText = 'Tentar Novamente' 
}: ErrorMessageProps) => {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <span className="font-medium text-red-800">Ops! Algo deu errado</span>
      </div>
      <p className="text-red-700 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          {retryText}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;