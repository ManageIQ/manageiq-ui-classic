import { flatten } from './search';

const unsetActive = (menu) => menu.map((item) => ({
  ...item,
  active: false,
  items: item.items && unsetActive(item.items),
}));

export const updateActiveItem = (_location) => {
  const { menu } = window.ManageIQ;
  const { setMenu } = updateActiveItem;

  const deactivated = unsetActive(menu);

  const flat = flatten(deactivated).map(({ item, parents }) => ({
    href: item.href,
    item,
    parents,
  }));

  // FIXME: we should be using _location.pathname but that requires BrowserRouter, not HashRouter
  const currentUrl = `${document.location.pathname}${document.location.hash}`;

  const current = _.find(flat, { href: currentUrl });

  if (! current) {
    return;
  }

  current.item.active = true;
  current.parents.forEach((p) => p.active = true);

  setMenu(deactivated);
};

// listen for history changes
ManageIQ.redux.history.listen(updateActiveItem);
