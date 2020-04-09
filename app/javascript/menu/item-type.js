// there are 4 menu item types (used both in navbar and menu)
// * default (href) - opens href
// * big_iframe (id) - no menu, only navbar and ..a big iframe (external with our header)
// * modal () - open the About Modal (extend for any modals)
// * new_window (href) - opens href in new window (for external links)

export const linkProps = ({type, href, id}) => ({
  href: {
    big_iframe: `/dashboard/iframe?id=${id}`,
    default: href,
    modal: undefined,
    new_window: href,
  }[type],

  target: (type === 'new_window' ? '_blank' : '_self'),

  onClick: (event) => {
    if (type === 'modal') {
      sendDataWithRx({ type: 'showAboutModal' });
      event.preventDefault();
      return;
    }

    if (['default', 'big_iframe'].includes(type) && miqCheckForChanges() === false) {
      event.preventDefault();
      return;
    }
  },
});

export const itemId = (id, section) => (section ? `menu_section_${id}` : `menu_item_${id}`);
