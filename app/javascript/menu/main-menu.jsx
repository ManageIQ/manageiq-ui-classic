import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SideNav } from 'carbon-components-react/es/components/UIShell';

import FirstLevel from './first-level';
import GroupSwitcher from './group-switcher';
import MenuCollapse from './menu-collapse';
import MenuSearch from './search';
import MiqLogo from './miq-logo';
import SearchResults from './search-results';
import SecondLevel from './second-level';
import Username from './username';
import { updateActiveItem } from './history';


const initialExpanded = window.localStorage.getItem('patternfly-navigation-primary') !== 'collapsed';

export const MainMenu = ({
  applianceName,
  brandUrl,
  currentGroup,
  currentUser,
  customBrand,
  logoLarge,
  logoSmall,
  menu: initialMenu,
  miqGroups,
  showLogo,
  showMenuCollapse,
  showUser,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [menu, setMenu] = useState(initialMenu);
  const [searchResults, setSearch] = useState(null);
  const [activeSection, setSection] = useState(null);
  const [openMenu, setOpen] = useState(false);
  // code to override navbar in plugins
  const Navbar = ManageIQ.component.getReact('menu.Navbar');

  const appearExpanded = expanded || !!activeSection || !!searchResults;
  const hideSecondary = () => setSection(null);
  const hideSecondaryEscape = e => e.keyCode === 27 && hideSecondary();

  useEffect(() => {
    // persist expanded state
    window.localStorage.setItem('patternfly-navigation-primary', expanded ? 'expanded' : 'collapsed');
  }, [expanded]);

  useEffect(() => {
    // set body class - for content offset
    const classNames = {
      true: 'miq-main-menu-expanded',
      false: 'miq-main-menu-collapsed',
    };
    document.body.classList.remove(classNames[!appearExpanded]);
    document.body.classList.add(classNames[appearExpanded]);
  }, [appearExpanded]);

  useEffect(() => {
    // cypress, debugging
    window.ManageIQ.menu = menu;
  }, [menu]);

  useEffect(() => {
    // react router support - allow history changes to update the menu .. and try on load
    updateActiveItem.setMenu = setMenu;
    updateActiveItem(ManageIQ.redux.store.getState().router.location);
  }, []);

  const showMenu = (event) => {
    // when focus/tab is in leftnav, if menu is not expanded, open menu
    if (!expanded) {
      setExpanded(true);
      // To understand if we are opening it manually on tab
      setOpen(true);
    }
    if (event.keyCode === 27) hideSecondary();
  };
  const hideMenu = (event) => {
    // if we open it manually, collpase menu on blur
    if (!event.currentTarget.contains(event.relatedTarget) && openMenu) {
      setExpanded(false);
      setOpen(false);
    }
  };
  const toggleMenu = () => {
    // if it is already open on tabbing, keep it open
    if (expanded && openMenu) {
      setOpen(false);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <>
      <Navbar
        isSideNavExpanded={expanded}
        open={openMenu}
        onClickSideNavExpand={() => setExpanded(!expanded)}
        applianceName={applianceName}
        currentUser={currentUser}
        brandUrl={brandUrl}
      />
      <div
        onClick={hideSecondary}
        onKeyDown={showMenu}
        onBlur={hideMenu}
        role="presentation"
        id="main-menu-primary"
      >
        <SideNav
          aria-label={__('Main Menu')}
          className="primary"
          expanded={appearExpanded}
          addFocusListeners={false}
          isChildOfHeader={false}
        >
          {showLogo && (
            <MiqLogo
              expanded={appearExpanded}
              customBrand={customBrand}
              logoLarge={logoLarge}
              logoSmall={logoSmall}
            />
          )}

          {showUser && (
            <Username
              applianceName={applianceName}
              currentUser={currentUser}
              expanded={appearExpanded}
            />
          )}

          <GroupSwitcher
            currentGroup={currentGroup}
            expanded={appearExpanded}
            miqGroups={miqGroups}
          />

          <MenuSearch
            menu={menu}
            expanded={appearExpanded}
            onSearch={setSearch}
            toggle={() => setExpanded(!expanded)}
          />

          <hr className="bx--side-nav__hr" />

          {searchResults && <SearchResults results={searchResults} />}
          {!searchResults && (
            <FirstLevel
              menu={menu}
              setSection={setSection}
              activeSection={activeSection && activeSection.id}
              expanded={appearExpanded}
            />
          )}

          {showMenuCollapse && (
            <MenuCollapse
              expanded={expanded/* not appearExpanded */}
              toggle={toggleMenu}
              onFocus={hideSecondary}
              open={openMenu}
            />
          )}
        </SideNav>
      </div>
      { activeSection && (
        <>
          <SideNav aria-label={__('Secondary Menu')} className="secondary" isChildOfHeader={false} expanded>
            <div onKeyDown={hideSecondaryEscape} role="presentation">
              <SecondLevel menu={activeSection.items} hideSecondary={hideSecondary} />
            </div>
          </SideNav>
          <div
            className="miq-main-menu-overlay"
            role="presentation"
            onClick={hideSecondary}
            onFocus={hideSecondary}
            onKeyDown={hideSecondary}
          />
        </>
      )}
    </>
  );
};

const propGroup = PropTypes.shape({
  description: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
});

const propUser = PropTypes.shape({
  name: PropTypes.string.isRequired,
  userid: PropTypes.string.isRequired,
});

MainMenu.propTypes = {
  applianceName: PropTypes.string.isRequired,
  currentGroup: propGroup.isRequired,
  currentUser: propUser.isRequired,
  customBrand: PropTypes.bool,
  logoLarge: PropTypes.string,
  logoSmall: PropTypes.string,
  menu: PropTypes.arrayOf(PropTypes.any).isRequired,
  miqGroups: PropTypes.arrayOf(propGroup).isRequired,
  showLogo: PropTypes.bool,
  showMenuCollapse: PropTypes.bool,
  showUser: PropTypes.bool,
};

MainMenu.defaultProps = {
  showLogo: true,
  showMenuCollapse: true,
  showUser: true,
};
