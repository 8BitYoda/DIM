import { t } from 'app/i18next-t';
import HeaderShadowDiv from 'app/inventory/HeaderShadowDiv';
import InventoryCollapsibleTitle from 'app/inventory/InventoryCollapsibleTitle';
import StoreStats from 'app/store-stats/StoreStats';
import clsx from 'clsx';
import React from 'react';
import StoreHeading from '../character-tile/StoreHeading';
import D1ReputationSection from './D1ReputationSection';
import { InventoryBucket, InventoryBuckets } from './inventory-buckets';
import { DimStore } from './store-types';
import { StoreBuckets } from './StoreBuckets';
import { findItemsByBucket, getCurrentStore, getVault } from './stores-helpers';
import './Stores.scss';

interface Props {
  stores: DimStore[];
  buckets: InventoryBuckets;
}
/**
 * Display inventory and character headers for all characters and the vault.
 *
 * This is the desktop view only.
 */
export default function DesktopStores(this: void, { stores, buckets }: Props) {
  const vault = getVault(stores)!;
  const currentStore = getCurrentStore(stores)!;

  if (!stores.length || !buckets) {
    return null;
  }

  return (
    <div
      className={`inventory-content destiny${currentStore.destinyVersion}`}
      role="main"
      aria-label={t('Header.Inventory')}
    >
      <HeaderShadowDiv className="store-row store-header">
        {stores.map((store) => (
          <div className={clsx('store-cell', { vault: store.isVault })} key={store.id}>
            <StoreHeading store={store} />
            <StoreStats store={store} />
          </div>
        ))}
      </HeaderShadowDiv>
      <StoresInventory
        stores={stores}
        vault={vault}
        currentStore={currentStore}
        buckets={buckets}
      />
    </div>
  );
}

/** Is there any store that has an item in any of the buckets in this category? */
function categoryHasItems(
  allBuckets: InventoryBuckets,
  category: string,
  stores: DimStore[],
  currentStore: DimStore
): boolean {
  const buckets = allBuckets.byCategory[category];
  return buckets.some((bucket) => {
    const storesToSearch = bucket.accountWide && !stores[0].isVault ? [currentStore] : stores;
    return storesToSearch.some((s) => findItemsByBucket(s, bucket.hash).length > 0);
  });
}

interface InventoryContainerProps {
  buckets: InventoryBuckets;
  stores: DimStore[];
  currentStore: DimStore;
  vault: DimStore;
}

function CollapsibleContainer({
  buckets,
  category,
  stores,
  currentStore,
  inventoryBucket,
  vault,
}: {
  category: string;
  inventoryBucket: InventoryBucket[];
} & InventoryContainerProps) {
  if (!categoryHasItems(buckets, category, stores, currentStore)) {
    return null;
  }

  return (
    <InventoryCollapsibleTitle title={t(`Bucket.${category}`)} sectionId={category} stores={stores}>
      {/* t('Bucket.', { context: '', contextList: 'buckets' }) */}
      {inventoryBucket.map((bucket) => (
        <StoreBuckets
          key={bucket.hash}
          bucket={bucket}
          stores={stores}
          vault={vault}
          currentStore={currentStore}
        />
      ))}
    </InventoryCollapsibleTitle>
  );
}

function StoresInventory(props: InventoryContainerProps) {
  const { buckets, stores } = props;

  return (
    <>
      {Object.entries(buckets.byCategory).map(([category, inventoryBucket]) => (
        <CollapsibleContainer
          key={category}
          {...props}
          category={category}
          inventoryBucket={inventoryBucket}
        />
      ))}
      {stores[0].destinyVersion === 1 && <D1ReputationSection stores={stores} />}
    </>
  );
}
