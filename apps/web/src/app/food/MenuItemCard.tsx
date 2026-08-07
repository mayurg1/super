import { Button, Card, Input } from '@supercampus/shared';
import { useFood } from './FoodContext';
import { formatPrice } from './foodUtils';
import { FOOD_CART_CONFIG } from './foodUtils';
import type { FoodMenuItem } from '@supercampus/supabase';

export function MenuItemCard({ item }: { item: FoodMenuItem }): React.ReactElement {
  const { addToCart, cartLines, removeFromCart, setCartQuantity } = useFood();
  const existing = cartLines.find((line) => line.menuItemId === item.id);
  const quantity = existing ? existing.quantity : 0;

  if (!item.isAvailable) {
    return (
      <Card padding="sm" className="sc-food-item sc-food-item--unavailable">
        <div className="sc-food-item-head">
          <h4>{item.name}</h4>
          <span className="sc-food-price">{formatPrice(item.price, item.currency)}</span>
        </div>
        <p className="sc-food-meta" aria-label="Unavailable">
          Unavailable
        </p>
      </Card>
    );
  }

  return (
    <Card padding="sm" className="sc-food-item">
      <div className="sc-food-item-head">
        <h4>{item.name}</h4>
        <span className="sc-food-price">{formatPrice(item.price, item.currency)}</span>
      </div>
      {item.description ? <p className="sc-food-meta">{item.description}</p> : null}
      <div className="sc-food-item-actions">
        {quantity > 0 ? (
          <>
            <Input
              id={`food-qty-${item.id}`}
              type="number"
              min={1}
              max={FOOD_CART_CONFIG.maxQuantityPerItem}
              value={quantity}
              onChange={(event) => setCartQuantity(item.id, Number(event.target.value))}
              aria-label={`Quantity of ${item.name}`}
            />
            <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>
              Remove
            </Button>
          </>
        ) : (
          <Button size="sm" variant="primary" onClick={() => addToCart(item, 1)}>
            Add
          </Button>
        )}
      </div>
    </Card>
  );
}
