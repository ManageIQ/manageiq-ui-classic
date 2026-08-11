/**
 * Common menu type definitions used throughout the menu components
 */

/**
 * Base menu item structure used throughout the application
 */
export type MenuItemType = {
  title: string;
  href?: string;
  active?: boolean;
  items?: MenuItemType[];
  id?: string;
  type?: string;
  icon?: string;
};

/**
 * Flattened menu item with parent hierarchy
 */
export type FlatMenuItemType = {
  item: MenuItemType;
  parents: MenuItemType[];
};

/**
 * Search result type with searchable haystack
 */
export type SearchResultType = {
  haystack?: string;
  item: MenuItemType;
  parents?: MenuItemType[];
  titles: string[];
};

/**
 * Current user type
 */
export type CurrentUserType = {
  name: string;
  userid: string;
};

/**
 * Navbar props - can be used by plugins
 */
export type NavbarProps = {
  applianceName: string;
  currentUser: CurrentUserType;
  isSideNavExpanded: boolean;
  onClickSideNavExpand: () => void;
};

type MiqGroupType = {
  description: string;
  id: string;
};

/**
 * Main menu props - can be used by plugins
 */
export type MainMenuProps = {
  applianceName: string;
  currentGroup: MiqGroupType;
  currentUser: CurrentUserType;
  customBrand?: boolean;
  logoLarge: string;
  logoSmall: string;
  menu: MenuItemType[];
  miqGroups: MiqGroupType[];
  showLogo?: boolean;
  showMenuCollapse?: boolean;
  showUser?: boolean;
};
