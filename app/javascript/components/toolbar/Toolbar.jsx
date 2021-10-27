/* eslint-disable react/destructuring-assignment */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ToolbarView } from './ToolbarView';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarList } from './ToolbarList';
import { ToolbarKebab } from './ToolbarKebab';
import CountContext from './ToolbarContext';

export const ButtonType = {
  BUTTON: 'button',
  BUTTON_TWO_STATE: 'buttonTwoState',
  BUTTON_SELECT: 'buttonSelect',
  SEPARATOR: 'separator',
  KEBAB: 'kebab',
};
const ref = React.createRef();
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

export const ButtonCase = forwardRef(({ item, index, onClick }, ref) => {
  if (isButton(item) || isButtonTwoState(item)) {
    return <ToolbarButton key={index} {...item} onClick={onClick} />;
  } if (isButtonSelect(item) && (item.items.length > 0)) {
    return <ToolbarList key={index} {...item} onClick={onClick} />;
  }
  if (isKebabMenu(item) && (item.items.length > 0)) {
    return <ToolbarKebab key={index} {...item} onClick={onClick} ref={ref} />;
  }
  return null;
});

ButtonCase.propTypes = {
  item: PropTypes.objectOf(PropTypes.any).isRequired,
  index: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

ButtonCase.defaultProps = {
  index: 0,
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

export const ToolbarGroup = forwardRef(({ group, onClick }, ref) => {
  const visibleItems = group.filter(isVisibleButtonOrSelect);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="miq-toolbar-group form-group">
      {visibleItems.map((i, index) => <ButtonCase item={i} key={index} index={index} onClick={onClick} ref={ref} />)}
    </div>
  );
});

ToolbarGroup.propTypes = {
  group: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func.isRequired,
};

export const Toolbar = (props) => (
  <CountContext.Provider value={props.count}>
    <div className="toolbar-pf-actions miq-toolbar-actions">
      { props.groups
        .filter(toolbarGroupHasContent)
        .map((group, index) =>
          // eslint-disable-next-line react/no-array-index-key
          <ToolbarGroup key={index} ref={ref} onClick={props.onClick} group={collapseCustomGroups(group, props.kebabLimit)} />)}
      <ToolbarView onClick={props.onViewClick} views={props.views} />
    </div>
  </CountContext.Provider>
);

Toolbar.propTypes = {
  count: PropTypes.number,
  kebabLimit: PropTypes.number,
  groups: PropTypes.arrayOf(PropTypes.any), // array of arrays of buttons
  views: PropTypes.arrayOf(PropTypes.any), // array of view buttons
  onClick: PropTypes.func.isRequired,
  onViewClick: PropTypes.func.isRequired,
};

Toolbar.defaultProps = {
  count: 0,
  kebabLimit: 3,
};
