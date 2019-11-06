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

export const getTargetByType = type => (type === 'new_window' ? '_blank' : '_self');

export const getItemId = id => `menu_item_${id}`;

export const getSectionId = id => `menu_section_${id}`;

export const getIdByCategory = (isSection, id) => (isSection ? getSectionId(id) : getItemId(id));

export const handleUnsavedChanges = (type) => {
  if (type === 'modal') {
    return sendDataWithRx({ type: 'showAboutModal' });
  }
  return window.miqCheckForChanges();
};
