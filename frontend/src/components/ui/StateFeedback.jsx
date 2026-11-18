import { AlertCircle, PackageOpen } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      <p className="mt-3 text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing found',
  description = 'Try adjusting your search or filter.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
      <PackageOpen className="h-10 w-10 text-neutral-400" />
      <h3 className="mt-3 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong while loading data.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertCircle className="h-9 w-9 text-red-600" />
      <p className="mt-3 text-sm font-medium text-red-900">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}
