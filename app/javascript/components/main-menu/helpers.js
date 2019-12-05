export const getHrefByType = (type, href, id) => {
  switch (type) {
    case 'big_iframe':
      return `/dashboard/iframe?id=${id}`;
    case 'modal':
      return undefined;
    default:
      return href;
  }
};

export const getItemId = id => `menu_item_${id}`;

export const getSectionId = id => `menu_section_${id}`;

export const getIdByCategory = (isSection, id) => (isSection ? getSectionId(id) : getItemId(id));

export const handleUnsavedChanges = (type) => {
  if (type === 'modal') {
    return sendDataWithRx({ type: 'showAboutModal' });
  }
  return window.miqCheckForChanges();
};

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
