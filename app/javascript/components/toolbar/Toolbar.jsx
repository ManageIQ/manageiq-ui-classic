/* eslint-disable react/destructuring-assignment */
import * as React from 'react';
import PropTypes from 'prop-types';

import { ToolbarView } from './ToolbarView';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarList } from './ToolbarList';
import CountContext from './ToolbarContext';

export const ButtonType = {
  BUTTON: 'button',
  BUTTON_TWO_STATE: 'buttonTwoState',
  BUTTON_SELECT: 'buttonSelect',
  SEPARATOR: 'separator',
  KEBAB: 'kebab',
};

const isButton = (item) => (item.type === ButtonType.BUTTON);
const isButtonTwoState = (item) => (item.type === ButtonType.BUTTON_TWO_STATE);
const isButtonSelect = (item) => (item.type === ButtonType.BUTTON_SELECT);
const isKebabMenu = (item) => (item.type === ButtonType.KEBAB);

const isButtonSelectVisible = (props) => props.items.filter((i) => !i.hidden).length !== 0;

const isVisibleButtonOrSelect = (item) => (
  item.type && (
    (isButtonSelect(item) && isButtonSelectVisible(item))
    || (isButton(item) && !item.hidden)
    || (isButtonTwoState(item) && !item.hidden)
    || (isKebabMenu(item) && !item.hidden)
  )
);

const toolbarGroupHasContent = (group) =>
  group
    && group.filter((item) => item
      && isVisibleButtonOrSelect(item)).length !== 0;

const buttonCase = (item, index, onClick) => {
  if (isButton(item) || isButtonTwoState(item)) {
    return <ToolbarButton key={index} {...item} onClick={onClick} />;
  } if (isButtonSelect(item) && (item.items.length > 0)) {
    return <ToolbarList key={index} {...item} onClick={onClick} />;
  }
  return null;
};

/* custom buttons have ID's starting with this: */
const CUSTOM_ID = 'custom_';

const collapseOverlimit = (itemsGroup, kebabLimit) => {
  let numItems = 0;

  return itemsGroup.reduce((acc, i) => {
    if (i.id.includes(CUSTOM_ID)) {
      if (numItems >= kebabLimit) {
        acc[acc.length - 1].items.push(i);
      } else {
        numItems += 1;
        acc.splice(acc.length - 1, 0, i);
      }
    } else {
      acc.splice(acc.length - 1, 0, i);
    }
    return acc;
  }, [{ type: ButtonType.KEBAB, items: [] }]);
};

/*
 * kebabLimit === -1 means no compacting
 * kebabLimit === 0 means always compact into kebab
 * other values of kebabLimit give number of items to keep, before the rest is kebabized
*/
const collapseCustomGroups = (itemsGroup, kebabLimit) => (
  (kebabLimit === -1) || (itemsGroup.length < kebabLimit)
    ? itemsGroup
    : collapseOverlimit(itemsGroup, kebabLimit)
);

export const ToolbarGroup = ({ group, onClick }) => {
  const visibleItems = group.filter(isVisibleButtonOrSelect);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="miq-toolbar-group form-group">
      {visibleItems.map((i, index) => buttonCase(i, index, onClick))}
    </div>
  );
};

ToolbarGroup.propTypes = {
  group: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};

export const Toolbar = (props) => (
  <CountContext.Provider value={props.count}>
    <div className="toolbar-pf-actions miq-toolbar-actions">
      { props.groups
        .filter(toolbarGroupHasContent)
        .map((group, index) =>
          /* eslint react/no-array-index-key: "off" */
          <ToolbarGroup key={index} onClick={props.onClick} group={collapseCustomGroups(group, props.kebabLimit)} />)}
      <ToolbarView onClick={props.onViewClick} views={props.views} />
    </div>
  </CountContext.Provider>
);

Toolbar.propTypes = {
  count: PropTypes.number,
  kebabLimit: PropTypes.number,
  groups: PropTypes.arrayOf(PropTypes.any).isRequired, // array of arrays of buttons
  views: PropTypes.arrayOf(PropTypes.any).isRequired, // array of view buttons
  onClick: PropTypes.func.isRequired,
  onViewClick: PropTypes.func.isRequired,
};

Toolbar.defaultProps = {
  count: 0,
  kebabLimit: 3,
};
