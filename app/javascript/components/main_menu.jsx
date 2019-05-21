import React from 'react';
import PropTypes from 'prop-types';

/* FIXME
 *{:class => item_nav_class(menu_item)
 */

const menuItem = menuItem => (
  <li className="list-group-item" id={`menu_item_${menuItem.id}`}>
    <a {...menuItem.link_params}>
      <span className="list-group-item-value">
        {menuItem.name}
      </span>
    </a>
  </li>
);

/* FIXME
 * "data-target"="#menu-#{menu_item.id}", :class => section_nav_class(menu_item)}
 *        <a
 *          className='tertiary-collapse-toggle-pf'
 *          "data-toggle" => "collapse-tertiary-nav"}
 */
const menuItemOrSubSection = item => (
  item.leaf ? menuItem(item) : (
    <li
      className="list-group-item.tertiary-nav-item-pf"
    >
      <a {...item.link_params}>
        <span className="list-group-item-value">
          {item.name}
        </span>
      </a>
      <span className="nav-pf-tertiary-nav">
        <span className="nav-item-pf-header">
          <a href="/" className="tertiary-collapse-toggle-pf">
            <span>
              {item.name}
            </span>
          </a>
        </span>
        <ul className="list-group">
          { item.items.map(i => menuItem(i)) }
        </ul>
      </span>
    </li>
  )
);

/* FIXME
 * "data-toggle"=>'collapse-secondary-nav' />
 */

const menuSectionSubsection = props => (
  <span className="nav-pf-secondary-nav" id={`#menu-${props.id}`}>
    <span className="nav-item-pf-header">
      <a href="/" className="secondary-collapse-toggle-pf">
        <span>
          { props.name }
        </span>
      </a>
    </span>
    <ul className="list-group">
      { props.items.map(i => menuItemOrSubSection(i)) }
    </ul>
  </span>
);

menuSectionSubsection.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

/* FIXME
 * <a className='secondary-collapse-toggle-pf' "data-toggle"='collapse-secondary-nav' />
 */

const menuSectionPlain = props => (
  <span className="nav-pf-secondary-nav" id={`#menu-${props.id}`}>
    <span className="nav-item-pf-header">
      <a href="/" className="secondary-collapse-toggle-pf">
        <span>
          {props.name}
        </span>
      </a>
    </span>
    <ul className="list-group">
      { props.items.map(i => menuItem(i)) }
    </ul>
  </span>
);

menuSectionPlain.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};

/* FIXME
 * active/non-active:
 * <li className='list-group-item secondary-nav-item-pf{"data-target" => "#menu-#{menu_section.id}", :class => section_nav_class(menu_section)}
 *
 * data-target={`#menu-${props.id}`}
 *
 * FIXME: i18n in the structure
 * */
const MenuSection = props => (
  <li
    className="list-group-item secondary-nav-item-pf"
  >
    <a {...props.link_params}>
      <span className={props.icon} />
      <span className="list-group-item-value">
        {props.name}
      </span>
    </a>
    { props.items ? menuSectionSubsection(props) : menuSectionPlain(props) }
  </li>
);

MenuSection.propTypes = {
  link_params: PropTypes.shape({
    href: PropTypes.string.isRequired,
  }).isRequired,
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export const MainMenu = props => (
  <span className="nav-pf-vertical nav-pf-vertical-with-sub-menus nav-pf-vertical-collapsible-menus">
    <ul id="maintab" className="list-group">
      { props.sections.map(s => <MenuSection {...s} />) }
    </ul>
  </span>
);

MainMenu.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
