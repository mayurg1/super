import { Button, Card, Spinner } from '@supercampus/shared';
import { useFood } from './FoodContext';
import { formatPrice } from './foodUtils';
import type { FoodOrder } from '@supercampus/supabase';

function OrderCard({ order }: { order: FoodOrder }): React.ReactElement {
  const { cancelOrder, ordersLoading } = useFood();
  const isCancelling = ordersLoading;
  const canCancel = order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled';
  return (
    <Card padding="sm" className="sc-food-order">
      <header className="sc-food-order-head">
        <h4>Order #{order.id.slice(0, 8)}</h4>
        <span className="sc-food-order-status">{order.orderStatus}</span>
      </header>
      <p>
        <strong>Vendor:</strong> {order.vendorName} · <strong>Items:</strong> {order.items.length}
      </p>
      <p>
        <strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()} ·{' '}
        <strong>Total:</strong> {formatPrice(order.totalAmount, order.currency)}
      </p>
      {canCancel && (
        <Button
          size="sm"
          variant="outline"
          disabled={isCancelling}
          onClick={() => void cancelOrder(order.id)}
        >
          {isCancelling ? 'Cancelling…' : 'Cancel order'}
        </Button>
      )}
    </Card>
    );
}

export function OrderHistory(): React.ReactElement {
  const { activeOrders, completedOrders, cancelledOrders, ordersLoading, ordersError } = useFood();

      if (ordersLoading) {
    return (
      <div className="sc-food-orders">
        <Spinner label="Loading your orders" />
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="sc-food-error" role="alert">
        <p className="sc-food-subtle">{ordersError}</p>
      </div>
    );
  }

  const renderGroup = (title: string, orders: readonly FoodOrder[]) => (
    <section className="sc-food-order-group">
      <h2 className="sc-food-order-group-title">{title}</h2>
      {orders.length === 0 ? (
        <p className="sc-food-subtle">Nothing here yet.</p>
      ) : (
        <div className="sc-food-order-grid">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </section>
  );

  if (activeOrders.length === 0 && completedOrders.length === 0 && cancelledOrders.length === 0) {
    return <p className="sc-food-subtle">You have no orders yet. Add something to your cart to get started.</p>;
  }

  return (
    <section className="sc-food-orders" aria-label="Your orders">
      {renderGroup('Active orders', activeOrders)}
      {renderGroup('Completed', completedOrders)}
      {renderGroup('Cancelled', cancelledOrders)}
    </section>
  );
}
