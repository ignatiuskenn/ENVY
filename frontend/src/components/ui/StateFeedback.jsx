import { AlertCircle, PackageOpen } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#8A99AD]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#262E36] border-t-[#24FF6A]" />
      <p className="mt-3 font-mono text-xs uppercase tracking-wider">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing found',
  description = 'Try adjusting your search or filter.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#262E36] bg-[#171C21] px-6 py-14 text-center">
      <PackageOpen className="h-10 w-10 text-[#8A99AD]" />
      <h3 className="mt-3 text-base font-bold text-[#F3F6F8]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[#8A99AD]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong while loading data.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-500/40 bg-red-950/30 px-6 py-12 text-center">
      <AlertCircle className="h-9 w-9 text-red-400" />
      <p className="mt-3 text-sm font-medium text-red-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 cursor-pointer rounded-sm bg-[#24FF6A] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
