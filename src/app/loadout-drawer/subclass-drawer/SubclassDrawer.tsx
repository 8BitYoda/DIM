import { bungieNetPath } from 'app/dim-ui/BungieImage';
import ClassIcon from 'app/dim-ui/ClassIcon';
import Sheet from 'app/dim-ui/Sheet';
import ConnectedInventoryItem from 'app/inventory/ConnectedInventoryItem';
import { DimItem, PluggableInventoryItemDefinition } from 'app/inventory/item-types';
import { allItemsSelector } from 'app/inventory/selectors';
import { useD2Definitions } from 'app/manifest/selectors';
import { useIsPhonePortrait } from 'app/shell/selectors';
import { DestinyClass } from 'bungie-api-ts/destiny2';
import clsx from 'clsx';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import styles from './SubclassDrawer.m.scss';
import SubclassOptions from './SubclassOptions';
import { SelectedPlugs } from './types';

export default function SubclassDrawer({
  classType,
  initialSubclass,
  initialPlugs = [],
  onClose,
}: {
  classType: DestinyClass;
  initialSubclass?: DimItem;
  initialPlugs?: PluggableInventoryItemDefinition[];
  onClose(): void;
}) {
  const defs = useD2Definitions();
  const isPhonePortrait = useIsPhonePortrait();
  const allItems = useSelector(allItemsSelector, shallowEqual);
  const [selectedSubclass, setSelectedSubclass] = useState<DimItem | undefined>(initialSubclass);
  const [selectedPlugs, setSelectedPlugs] = useState<SelectedPlugs>(() =>
    _.groupBy(initialPlugs, (item) => item.plug.plugCategoryHash)
  );

  const subclasses = useMemo(() => {
    if (!defs) {
      return [];
    }
    return allItems
      .filter((item) => item.bucket.type === 'Class' && item.classType === classType)
      .map((item) => item);
  }, [allItems, classType, defs]);

  const screenshot =
    !isPhonePortrait &&
    selectedSubclass &&
    defs?.InventoryItem.get(selectedSubclass.hash).screenshot;

  const title =
    subclasses.length && defs?.InventoryItem.get(subclasses[0].hash).itemTypeDisplayName;

  return (
    <Sheet
      header={<div className={styles.title}>{title}</div>}
      fillScreen={Boolean(screenshot)}
      onClose={onClose}
    >
      <div
        className={styles.container}
        style={
          screenshot && !isPhonePortrait
            ? {
                backgroundImage: `url("${bungieNetPath(screenshot)}")`,
              }
            : undefined
        }
      >
        <div className={styles.subclasses}>
          {subclasses.map((subclass) => (
            <div
              key={subclass.id}
              onClick={() => setSelectedSubclass(subclass)}
              className={clsx('loadout-item', styles.subclass, {
                [styles.selected]: subclass.id === selectedSubclass?.id,
              })}
            >
              <ConnectedInventoryItem item={subclass} ignoreSelectedPerks={true} />
              {subclass.type === 'Class' && (
                <ClassIcon classType={subclass.classType} className="loadout-item-class-icon" />
              )}
            </div>
          ))}
        </div>
        {selectedSubclass && defs && (
          <SubclassOptions
            selectedSubclass={selectedSubclass}
            defs={defs}
            selectedPlugs={selectedPlugs}
            setSelectedPlugs={setSelectedPlugs}
          />
        )}
      </div>
    </Sheet>
  );
}
