// there are 4 menu item types (used both in navbar and menu)
// * default (href) - opens href
// * big_iframe (id) - no menu, only navbar and ..a big iframe (external with our header)
// * modal () - open the About Modal (extend for any modals)
// * new_window (href) - opens href in new window (for external links)

import { history } from '../miq-component/react-history.js';
const { miqSparkleOn, miqSparkleOff } = window;

const onNextRouteChange = (callback) => {
  const unlisten = history.listen(() => {
    unlisten();
    callback();
  });
};

export const linkProps = ({ type, href, id, hideSecondary = () => null }) => ({
  href: {
    big_iframe: `/dashboard/iframe?id=${id}`,
    default: href,
    modal: undefined,
    new_window: href,
  }[type || 'default'],

  target: (type === 'new_window' ? '_blank' : '_self'),
  rel: (type === 'new_window' ? 'noreferrer noopener' : undefined),

  onClick: (event) => {
    if (type === 'modal') {
      sendDataWithRx({ type: 'showAboutModal' });
      hideSecondary();

      event.preventDefault();
      return;
    }

    if (['default', 'big_iframe'].includes(type) && miqCheckForChanges() === false) {
      // cancelled
      event.preventDefault();
      return;
    }

    if (href === '/dashboard/logout') {
      ManageIQ.logoutInProgress = true;
    }

    hideSecondary();
    miqSparkleOn();

    // react router support
    onNextRouteChange(() => miqSparkleOff());
  },
});

export const itemId = (id, section) => (section ? `menu_section_${id}` : `menu_item_${id}`);
