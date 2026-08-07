import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import { useFood } from './FoodContext';
import { formatPrice, FOOD_CART_CONFIG } from './foodUtils';

export function CartPanel(): React.ReactElement {
  const {
    cartLines,
    cartItemCount,
    cartSubtotal,
    cartTax,
    cartDeliveryFee,
    cartGrandTotal,
    isCartEmpty,
    canCheckout,
    setCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    placing,
        error,
  } = useFood();
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [submittedLocation, setSubmittedLocation] = useState('');

  async function handleCheckout(): Promise<void> {
    if (!canCheckout) return;
    setSubmittedLocation(deliveryLocation);
    const ok = await placeOrder(deliveryLocation);
    if (ok) setDeliveryLocation('');
  }

  return (
    <Card padding="md" className="sc-food-cart">
      <h2>Cart ({cartItemCount})</h2>
      {error ? <p className="sc-food-inline-error">{error}</p> : null}
      {isCartEmpty ? (
        <p className="sc-food-subtle">Your cart is empty.</p>
      ) : (
        <ul className="sc-food-cart-list">
          {cartLines.map((line) => (
            <li key={line.menuItemId} className="sc-food-cart-item">
              <span className="sc-food-cart-item-name">{line.title}</span>
              <div className="sc-food-cart-item-controls">
                <Input
                  id={`food-cart-qty-${line.menuItemId}`}
                  type="number"
                  min={1}
                  max={FOOD_CART_CONFIG.maxQuantityPerItem}
                  value={line.quantity}
                  onChange={(event) => setCartQuantity(line.menuItemId, Number(event.target.value))}
                  aria-label={`Quantity of ${line.title}`}
                />
                <Button size="sm" variant="ghost" onClick={() => removeFromCart(line.menuItemId)}>
                  Remove
                </Button>
              </div>
              <span className="sc-food-cart-item-price">{formatPrice(line.unitPrice * line.quantity, line.currency)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="sc-food-cart-totals">
        <dl>
          <dt>Subtotal</dt>
          <dd>{formatPrice(cartSubtotal, 'INR')}</dd>
          <dt>Tax</dt>
          <dd>{formatPrice(cartTax, 'INR')}</dd>
          <dt>Delivery</dt>
          <dd>{formatPrice(cartDeliveryFee, 'INR')}</dd>
          <dt>Total</dt>
          <dd className="sc-food-cart-total">{formatPrice(cartGrandTotal, 'INR')}</dd>
        </dl>
      </div>
      {!isCartEmpty && (
        <Input
          id="food-delivery-location"
          label="Delivery location"
          value={deliveryLocation}
          onChange={(event) => setDeliveryLocation(event.target.value)}
          aria-describedby="food-checkout-help"
        />
      )}
      {!isCartEmpty && submittedLocation === '' && deliveryLocation === '' && (
        <p id="food-checkout-help" className="sc-food-subtle">
          Enter a delivery location to check out.
        </p>
      )}
      <div className="sc-food-cart-actions">
        {!isCartEmpty && (
          <Button variant="ghost" size="sm" onClick={clearCart} disabled={placing}>
            Clear cart
          </Button>
        )}
        <Button variant="primary" onClick={() => void handleCheckout()} disabled={!canCheckout || placing}>
          {placing ? 'Placing…' : 'Place order'}
        </Button>
      </div>
    </Card>
  );
}
