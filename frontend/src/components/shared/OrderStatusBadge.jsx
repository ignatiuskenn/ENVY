import { ORDER_STATUS_STYLES } from '../../constants/orderStatuses';

export function OrderStatusBadge({ status }) {
  const style = ORDER_STATUS_STYLES[status] || 'bg-neutral-100 text-neutral-800';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${style}`}>
      {status}
    </span>
  );
}
