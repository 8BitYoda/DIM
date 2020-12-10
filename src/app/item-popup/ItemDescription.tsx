import { D1ManifestDefinitions } from 'app/destiny1/d1-definitions';
import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import { ExpandableTextBlock } from 'app/dim-ui/ExpandableTextBlock';
import ExternalLink from 'app/dim-ui/ExternalLink';
import RichDestinyText from 'app/dim-ui/RichDestinyText';
import { t } from 'app/i18next-t';
import { DimItem } from 'app/inventory/item-types';
import { RootState } from 'app/store/types';
import { inventoryWishListsSelector } from 'app/wishlists/selectors';
import { InventoryWishListRoll } from 'app/wishlists/wishlists';
import React from 'react';
import { connect } from 'react-redux';
import ishtarLogo from '../../images/ishtar-collective.svg';
import styles from './ItemDescription.m.scss';
import NotesArea from './NotesArea';

interface ProvidedProps {
  item: DimItem;
  defs?: D2ManifestDefinitions | D1ManifestDefinitions;
}

interface StoreProps {
  inventoryWishListRoll?: InventoryWishListRoll;
}

function mapStateToProps(state: RootState, props: ProvidedProps): StoreProps {
  return {
    inventoryWishListRoll: inventoryWishListsSelector(state)[props.item.id],
  };
}

type Props = ProvidedProps & StoreProps;

function ItemDescription({ item, inventoryWishListRoll, defs }: Props) {
  // suppressing some unnecessary information for weapons and armor,
  // to make room for all that other delicious info
  const showFlavor = !item.bucket.inWeapons && !item.bucket.inArmor;

  const loreLink = item.loreHash
    ? `http://www.ishtar-collective.net/entries/${item.loreHash}`
    : undefined;

  return (
    <>
      {showFlavor && (
        <>
          {Boolean(item.description?.length) && (
            <div className={styles.officialDescription}>
              <RichDestinyText text={item.description} defs={defs} />
              {loreLink && (
                <ExternalLink
                  className={styles.loreLink}
                  href={loreLink}
                  title={t('MovePopup.ReadLore')}
                  onClick={() => ga('send', 'event', 'Item Popup', 'Read Lore')}
                >
                  <img src={ishtarLogo} height="16" width="16" />
                  {t('MovePopup.ReadLoreLink')}
                </ExternalLink>
              )}
            </div>
          )}
          {Boolean(item.displaySource?.length) && (
            <div className={styles.officialDescription}>{item.displaySource}</div>
          )}
        </>
      )}
      {inventoryWishListRoll?.notes && inventoryWishListRoll.notes.length > 0 && (
        <ExpandableTextBlock linesWhenClosed={3} className={styles.description}>
          <span className={styles.wishListLabel}>
            {t('WishListRoll.WishListNotes', { notes: '' })}
          </span>
          <span className={styles.wishListTextContent}>{inventoryWishListRoll.notes}</span>
        </ExpandableTextBlock>
      )}
      <NotesArea item={item} className={styles.description} />
    </>
  );
}

export default connect<StoreProps>(mapStateToProps)(ItemDescription);
