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
  currentGroup,
  currentUser,
  customBrand,
  logoLarge,
  logoSmall,
  logoUrl,
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
  // code to override navbar in plugins
  const Navbar = ManageIQ.component.getReact('menu.Navbar');

  const appearExpanded = expanded || !!activeSection || !!searchResults;
  const hideSecondary = () => setSection(null);

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

  return (
    <>
      <div onClick={hideSecondary}>
        <Navbar
          isSideNavExpanded={expanded}
          onClickSideNavExpand={() => setExpanded(!expanded)}
          applianceName={applianceName}
          currentUser={currentUser}
          logoUrl={logoUrl}
        />
        <SideNav
          aria-label={__('Main Menu')}
          className="primary"
          expanded={appearExpanded}
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
          />

          <hr className="bx--side-nav__hr" />

          {searchResults && <SearchResults results={searchResults} />}
          {!searchResults && (
            <FirstLevel
              menu={menu}
              setSection={setSection}
              activeSection={activeSection && activeSection.id}
            />
          )}

          {showMenuCollapse && (
            <MenuCollapse
              expanded={expanded /* not appearExpanded */}
              toggle={() => setExpanded(!expanded)}
            />
          )}
        </SideNav>
      </div>
      { activeSection && (
        <>
          <SideNav aria-label={__('Secondary Menu')} className="secondary" isChildOfHeader={false} expanded>
            <SecondLevel menu={activeSection.items} hideSecondary={hideSecondary} />
          </SideNav>
          <div className="miq-main-menu-overlay" onClick={hideSecondary} />
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
