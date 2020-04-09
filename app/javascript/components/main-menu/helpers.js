export const getItemId = id => `menu_item_${id}`;

export const getSectionId = id => `menu_section_${id}`;

export const getIdByCategory = (isSection, id) => (isSection ? getSectionId(id) : getItemId(id));

export const saveVerticalMenuState = (isVerticalMenuCollapsed) => {
  window.localStorage.setItem('patternfly-navigation-primary', isVerticalMenuCollapsed ? 'collapsed' : 'expanded');
};

export const adaptContentWidth = (isVerticalMenuCollapsed) => {
  const content = window.document.getElementsByClassName('container-pf-nav-pf-vertical-with-sub-menus')[0];
  if (content) {
    if (isVerticalMenuCollapsed) {
      content.classList.add('collapsed-nav');
    } else {
      content.classList.remove('collapsed-nav');
    }
  }
};
