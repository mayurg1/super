import { Spinner } from '@supercampus/shared';
import { useFood } from './FoodContext';

export function VendorPicker(): React.ReactElement {
  const { vendors, vendorsLoading, vendorsError, selectedVendorId, changeVendor, retryVendors } =
    useFood();

  if (vendorsLoading) {
    return (
      <div className="sc-food-vendors">
        <Spinner label="Loading vendors" size="sm" />
      </div>
    );
  }

  if (vendorsError) {
    return (
      <div className="sc-food-vendors" role="alert">
        <p className="sc-food-subtle">{vendorsError}</p>
        <button className="sc-link" type="button" onClick={() => void retryVendors()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="sc-food-vendors" role="radiogroup" aria-label="Choose a vendor">
      {vendors.map((vendor) => {
        const selected = vendor.id === selectedVendorId;
        return (
                    <button
            key={vendor.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'sc-chip sc-chip-active' : 'sc-chip'}
            onClick={() => changeVendor(vendor.id)}
            disabled={vendor.status !== 'active'}
          >
            {vendor.name}
          </button>
        );
      })}
      {vendors.length === 0 && <p className="sc-food-subtle">No vendors are open right now.</p>}
    </div>
  );
}
