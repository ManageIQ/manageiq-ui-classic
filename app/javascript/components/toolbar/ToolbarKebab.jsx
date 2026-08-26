import PropTypes from 'prop-types';
import {
  OverflowMenu,
  SideNavMenu,
  SideNavMenuItem,
  SideNavDivider,
  SideNavLink,
  SideNavItems,
} from '@carbon/react';
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

export const DropDownMenu = (props) => {
  const { items = null } = props;
  
  return (
    <SideNavItems className="button_groups">
      {items.map((item) => KebabListItem(item, props))}
    </SideNavItems>
  );
};

DropDownMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any),
};

export const ToolbarKebab = (props) => (
  <div className="btn-group kebab">
    <OverflowMenu>
      <DropDownMenu {...props} />
    </OverflowMenu>
  </div>
);

ToolbarKebab.propTypes = {
  id: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any),
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  color: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
};
