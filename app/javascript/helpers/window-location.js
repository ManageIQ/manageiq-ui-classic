export const getLocation = () => window.location;

export const locationAssign = (url) => getLocation().assign(url);

export const locationReplace = (url) => getLocation().replace(url);

export const locationReload = () => getLocation().reload();

export const setLocationHref = (url) => {
  getLocation().href = url;
};
