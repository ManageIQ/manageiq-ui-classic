import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  OverflowMenu,
  SideNavMenu,
  SideNavMenuItem,
  SideNavDivider,
  SideNavLink,
  SideNavItems,
} from 'carbon-components-react';
import { ToolbarClick } from './ToolbarClick';

const KebabListItem = (item, props) => {
  if (item.type === 'separator') {
    return <SideNavDivider key={item.id} />;
  }

  const ButtonIcon = () => (
    <i className={item.icon || ''} style={{ color: item.color || '' }} />
  );

  if (item.type === 'buttonSelect') {
    return (
      <SideNavMenu
        key={item.id}
        renderIcon={ButtonIcon}
        title={item.text || item.title}
      >
        { item.items.filter((i) => !i.hidden).map((i) => (
          <SideNavMenuItem
            key={i.id}
            onClick={props.onClick && i.enabled ? (() => props.onClick(i)) : null}
          >
            <ToolbarClick {...i} />
          </SideNavMenuItem>
        )) }

      </SideNavMenu>
    );
  }

  return (
    <SideNavLink onClick={item.onClick && item.enabled ? (() => item.onClick(item)) : null}><ToolbarClick key={item.id} {...item} /></SideNavLink>
  );
};

KebabListItem.propTypes = {
  item: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func.isRequired,
};

KebabListItem.defaultProps = {
  item: null,
};

// eslint-disable-next-line no-unused-vars
export const DropDownMenu = forwardRef((props, ref) => (
  <SideNavItems className="button_groups">
    {props.items.map((item) => KebabListItem(item, props))}
  </SideNavItems>
));

DropDownMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
};

DropDownMenu.defaultProps = {
  items: null,
};

export const ToolbarKebab = forwardRef((props, ref) => (
  <div className="btn-group kebab">
    <OverflowMenu ref={ref}>
      <DropDownMenu {...props} ref={ref} />
    </OverflowMenu>
  </div>
));

ToolbarKebab.propTypes = {
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  color: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
};

ToolbarKebab.defaultProps = {
  color: null,
  text: null,
  icon: null,
  title: null,
  items: null,
};
