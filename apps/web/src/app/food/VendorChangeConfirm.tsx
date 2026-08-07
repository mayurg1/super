import { useFood } from './FoodContext';

export function VendorChangeConfirm(): React.ReactElement | null {
  const {
    pendingVendorChangeId,
    confirmVendorChange,
    cancelVendorChange,
    vendors,
  } = useFood();

  if (!pendingVendorChangeId) return null;
  const pendingName = vendors.find((vendor) => vendor.id === pendingVendorChangeId)?.name;

  return (
    <div className="sc-food-confirmation-backdrop" role="dialog" aria-modal="true" aria-label="Confirm vendor change">
      <div className="sc-food-confirmation">
        <h3>Your cart is not empty</h3>
        <p>
          Switching to{pendingName ? ` ${pendingName}` : ' another vendor'} will discard your current cart. Are you
          sure?
        </p>
        <div className="sc-food-confirmation-actions">
          <button className="sc-btn sc-btn-outline" type="button" onClick={cancelVendorChange}>
            Keep my cart
          </button>
          <button className="sc-btn sc-btn-primary" type="button" onClick={confirmVendorChange}>
            Switch and clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
