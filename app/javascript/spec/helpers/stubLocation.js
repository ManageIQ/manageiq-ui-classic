import { getLocation } from '../../helpers/window-location';

export const stubLocation = (pathname) => {
  const url = `${window.location.origin}${pathname}`;
  window.history.pushState(window.history.state, '', url);

  getLocation.mockReturnValue({
    pathname,
  });
};
