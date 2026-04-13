import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function AlertBanner({ message, type = 'warning' }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const styles = {
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400'
    }
  };

  const style = styles[type] || styles.warning;
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
        <p className={`flex-1 text-sm font-medium ${style.text}`}>
          {message}
        </p>
        <button
          onClick={() => setIsDismissed(true)}
          className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${style.text}`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
