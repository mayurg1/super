import { FoodProvider } from './FoodProvider';
import { VendorPicker } from './VendorPicker';
import { VendorChangeConfirm } from './VendorChangeConfirm';
import { MenuList } from './MenuList';
import { CartPanel } from './CartPanel';
import { OrderHistory } from './OrderHistory';

function FoodContent(): React.ReactElement {
  return (
    <section className="sc-food" aria-labelledby="food-title">
      <header className="sc-food-heading">
        <div>
          <h1 id="food-title">Food</h1>
          <p>Order from your campus kitchens and pay on delivery.</p>
        </div>
      </header>
      <VendorChangeConfirm />
      <VendorPicker />
      <div className="sc-food-main">
        <MenuList />
        <CartPanel />
      </div>
      <OrderHistory />
    </section>
  );
}

export function FoodPage(): React.ReactElement {
  return (
    <FoodProvider>
      <FoodContent />
    </FoodProvider>
  );
}
