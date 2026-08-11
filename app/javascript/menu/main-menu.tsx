import React, { useEffect, useState, useRef } from 'react';
import { SideNav } from '@carbon/react';

import FirstLevel from './first-level';
import GroupSwitcher from './group-switcher';
import MenuCollapse from './menu-collapse';
import MenuSearch from './search';
import MiqLogo from './miq-logo';
import SearchResults from './search-results';
import SecondLevel from './second-level';
import Username from './username';
import { updateActiveItem } from './history';
import type {
  MenuItemType,
  SearchResultType,
  MainMenuProps,
  NavbarProps,
} from './menu-common-types';

const initialExpanded = window.localStorage.getItem('patternfly-navigation-primary') !== 'collapsed';

type ActiveSectionType = {
  id?: string;
  items?: MenuItemType[];
};

export const MainMenu: React.FC<MainMenuProps> = ({
  applianceName,
  currentGroup,
  currentUser,
  customBrand,
  logoLarge,
  logoSmall,
  menu: initialMenu,
  miqGroups,
  showLogo = true,
  showMenuCollapse = true,
  showUser = true,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [menu, setMenu] = useState(initialMenu);
  const [searchResults, setSearch] = useState<SearchResultType[] | null>(null);
  const [activeSection, setSection] = useState<ActiveSectionType | null>(null);
  const [openMenu, setOpen] = useState(false);
  // code to override navbar in plugins
  const Navbar = ManageIQ.component.getReact(
    'menu.Navbar'
  ) as React.ComponentType<NavbarProps>;

  const appearExpanded = expanded || !!activeSection || !!searchResults;
  const hideSecondary = () => setSection(null);
  const hideSecondaryEscape = (e: React.KeyboardEvent) =>
    e.key === 'Escape' && hideSecondary();

  const secondLevelFirst = useRef<HTMLAnchorElement>(null);
  const firstLevelNext = useRef<HTMLAnchorElement>(null);
  const firstLevelPrev = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // persist expanded state
    window.localStorage.setItem(
      'patternfly-navigation-primary',
      expanded ? 'expanded' : 'collapsed'
    );
  }, [expanded]);

  useEffect(() => {
    // set body class - for content offset
    const expandedClass = 'miq-main-menu-expanded';
    const collapsedClass = 'miq-main-menu-collapsed';
    document.body.classList.remove(
      appearExpanded ? collapsedClass : expandedClass
    );
    document.body.classList.add(
      appearExpanded ? expandedClass : collapsedClass
    );
  }, [appearExpanded]);

  useEffect(() => {
    // cypress, debugging
    ManageIQ.menu = menu;
  }, [menu]);

  useEffect(() => {
    // allow history changes to update the menu, and run on load
    updateActiveItem.setMenu = setMenu;
    updateActiveItem();
  }, []);

  const showMenu = (event: React.KeyboardEvent) => {
    // when focus/tab is in leftnav, if menu is not expanded, open menu
    if (!expanded) {
      setExpanded(true);
      // To understand if we are opening it manually on tab
      setOpen(true);
    }
    if (event.key === 'Escape') {
      hideSecondary();
    }
  };

  const hideMenu = (event: React.FocusEvent) => {
    // if we open it manually, collapse menu on blur
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

  const onSelect = (item: ActiveSectionType) => {
    if (activeSection && item.id === activeSection.id) {
      hideSecondary();
    } else {
      setSection(item);
    }
    // The first menu item in the second level can be focused only after second level is actually displayed
    if (item) {
      setTimeout(() => {
        if (secondLevelFirst.current) {
          secondLevelFirst.current.focus();
        }
      });
    }
  };

  const unFocusSecondary = (forward: boolean) => () => {
    hideSecondary();

    const { current } = forward ? firstLevelNext : firstLevelPrev;
    // Focus the prev/next element in the first level if available
    if (current) {
      current.focus();
      if (!expanded) {
        setExpanded(true);
        setOpen(true);
      }
    }
  };

  return (
    <>
      <Navbar
        isSideNavExpanded={expanded}
        onClickSideNavExpand={() => {
          if (expanded) {
            setSection(null);
          }
          setExpanded(!expanded);
        }}
        applianceName={applianceName}
        currentUser={currentUser}
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

          <hr className="cds--side-nav__hr" />

          {searchResults && <SearchResults results={searchResults} />}
          {!searchResults && (
            <FirstLevel
              menu={menu}
              onSelect={onSelect}
              activeSection={activeSection?.id}
              expanded={appearExpanded}
              refObject={{ prevRef: firstLevelPrev, nextRef: firstLevelNext }}
            />
          )}

          {showMenuCollapse && (
            <MenuCollapse
              expanded={expanded /* not appearExpanded */}
              toggle={toggleMenu}
              onFocus={hideSecondary}
              open={openMenu}
            />
          )}
        </SideNav>
      </div>
      {activeSection && (
        <>
          <SideNav
            aria-label={__('Secondary Menu')}
            className="secondary"
            isChildOfHeader={false}
            expanded
          >
            <div onKeyDown={hideSecondaryEscape} role="presentation">
              <span
                onFocus={unFocusSecondary(false)}
                role="presentation"
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
              />
              <SecondLevel
                menu={activeSection.items || []}
                hideSecondary={hideSecondary}
                ref={secondLevelFirst}
              />
              <span
                onFocus={unFocusSecondary(true)}
                role="presentation"
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
              />
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
