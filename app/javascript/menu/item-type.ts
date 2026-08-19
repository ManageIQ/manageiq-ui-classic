// there are 4 menu item types (used both in navbar and menu)
// * default (href) - opens href
// * big_iframe (id) - no menu, only navbar and ..a big iframe (external with our header)
// * modal () - open the About Modal (extend for any modals)
// * new_window (href) - opens href in new window (for external links)
import React from 'react';

type LinkPropsParams = {
  type?: string;
  href?: string;
  id?: string;
  hideSecondary?: () => void;
};

export const linkProps = ({
  type, href, id, hideSecondary = () => null,
}: LinkPropsParams) => ({
  href: {
    big_iframe: `/dashboard/iframe?id=${id}`,
    default: href,
    modal: '#',
    new_window: href,
  }[type || 'default'],

  target: (type === 'new_window' ? '_blank' : '_self'),
  rel: (type === 'new_window' ? 'noreferrer noopener' : undefined),

  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (type === 'modal') {
      sendDataWithRx({ type: 'showAboutModal' });
      hideSecondary();

      event.preventDefault();
      return;
    }

    if (['default', 'big_iframe'].includes(type || 'default') && miqCheckForChanges() === false) {
      // cancelled
      event.preventDefault();
      return;
    }

    if (href === '/dashboard/logout') {
      ManageIQ.logoutInProgress = true;
    }

    hideSecondary();
    miqSparkleOn();

    if (type === 'new_window') {
      miqSparkleOff();
    }
  },
});

export const itemId = (id: string, section?: boolean): string => (section ? `menu_section_${id}` : `menu_item_${id}`);
