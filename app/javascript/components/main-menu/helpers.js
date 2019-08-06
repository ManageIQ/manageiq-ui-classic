export const getHrefByType = (type, href, id) => (
  {
    big_iframe: `/dashboard/iframe?id=${id}`,
    // eslint-disable-next-line no-script-url
    modal: 'javascript:void(0);',
  }
)[type] || href;
