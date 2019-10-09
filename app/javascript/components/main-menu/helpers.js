export const getHrefByType = (type, href, id) => (
  {
    big_iframe: `/dashboard/iframe?id=${id}`,
    // eslint-disable-next-line no-script-url
    modal: '#',
  }
)[type] || href;

export const getTargetByType = type => (type === 'new_window' ? '_blank' : '_self');

export const handleUnsavedChanges = (e, type) => {
  window.miqCheckForChanges();
  return type === 'modal' && sendDataWithRx({ type: 'showAboutModal' });
};
