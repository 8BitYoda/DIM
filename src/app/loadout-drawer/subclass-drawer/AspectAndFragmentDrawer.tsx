import { languageSelector } from 'app/dim-api/selectors';
import { PluggableInventoryItemDefinition } from 'app/inventory/item-types';
import { isPluggableItem } from 'app/inventory/store/sockets';
import PlugDrawer from 'app/loadout/plug-drawer/PlugDrawer';
import _ from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { SelectedPlugs, SocketWithOptions } from './types';

export default function AspectAndFragmentDrawer({
  aspects,
  fragments,
  selectedPlugs,
  onAccept,
  onClose,
}: {
  aspects: SocketWithOptions[];
  fragments: SocketWithOptions[];
  selectedPlugs: SelectedPlugs;
  onAccept(selected: PluggableInventoryItemDefinition[]): void;
  onClose(): void;
}) {
  const language = useSelector(languageSelector);

  const { selected: initiallySelectedAspects, plugs: aspectPlugs } = getPlugsAndSelected(
    aspects,
    selectedPlugs
  );

  const { selected: initiallySelectedFragments, plugs: fragmentPlugs } = getPlugsAndSelected(
    fragments,
    selectedPlugs
  );

  const isPlugSelectable = (
    plug: PluggableInventoryItemDefinition,
    selected: PluggableInventoryItemDefinition[]
  ) => {
    if (aspectPlugs.includes(plug)) {
      const selectedAspects = selected.filter(
        (s) => s.plug.plugCategoryHash === plug.plug.plugCategoryHash
      );
      return selectedAspects.length < 2;
    } else {
      const selectedAspects = selected.filter(
        (s) => s.plug.plugCategoryHash !== plug.plug.plugCategoryHash
      );
      const selectedFragments = selected.filter(
        (s) => s.plug.plugCategoryHash === plug.plug.plugCategoryHash
      );
      const maximumFragments = _.sumBy(
        selectedAspects,
        (aspect) => aspect.plug.energyCapacity?.capacityValue || 0
      );
      return selectedFragments.length < maximumFragments;
    }
  };

  return (
    <PlugDrawer
      title="Aspects and Fragments"
      searchPlaceholder="Search"
      acceptButtonTitle="Confirm"
      language={language}
      plugs={[...aspectPlugs, ...fragmentPlugs]}
      onAccept={onAccept}
      onClose={onClose}
      isPlugSelectable={isPlugSelectable}
      initiallySelected={[...initiallySelectedAspects, ...initiallySelectedFragments]}
    />
  );
}

function getPlugsAndSelected(
  socketWithOptionsList: SocketWithOptions[],
  selectedPlugs: SelectedPlugs
) {
  const first = (socketWithOptionsList.length && socketWithOptionsList[0]) || undefined;
  const emptySockets = _.compact(
    socketWithOptionsList.map(({ socket, options }) =>
      options.find((option) => option.hash === socket.socketDefinition.singleInitialItemHash)
    )
  );
  const empty = emptySockets.length ? emptySockets[0] : undefined;

  const plugs =
    first?.options.filter(
      (plug): plug is PluggableInventoryItemDefinition =>
        empty?.hash !== plug.hash && isPluggableItem(plug)
    ) || [];

  const plugCategoryHash = first?.options.length
    ? first.options[0].plug?.plugCategoryHash
    : undefined;

  const selected =
    (plugCategoryHash !== undefined &&
      selectedPlugs[plugCategoryHash]?.filter(
        (plug) => empty?.hash !== plug.hash && isPluggableItem(plug)
      )) ||
    [];

  return { plugs, selected };
}
