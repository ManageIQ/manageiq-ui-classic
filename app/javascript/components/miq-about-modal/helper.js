const searchString = (data) => {
  for (let i = 0; i < data.length; i += 1) {
    const dataString = data[i].string;
    const dataProp = data[i].prop;
    const versionSearchString = data[i].versionSearch || data[i].identity;

    if (dataString) {
      if (dataString.indexOf(data[i].subString) !== -1) {
        return { identity: data[i].identity, versionSearchString };
      }
    } else if (dataProp) {
      return { identity: data[i].identity, versionSearchString };
    }
  }
  return null;
};

const searchVersion = (dataString, versionSearchString) => {
  const index = dataString.indexOf(versionSearchString);
  if (index === -1) {
    return null;
  }
  return parseFloat(dataString.substring(index + versionSearchString.length + 1));
};

const dataBrowser = [
  {
    string: navigator.userAgent,
    subString: 'OmniWeb',
    versionSearch: 'OmniWeb/',
    identity: 'OmniWeb',
  },
  {
    string: navigator.vendor,
    subString: 'Apple',
    identity: 'Safari',
  },
  {
    prop: window.opera,
    identity: 'Opera',
  },
  {
    string: navigator.vendor,
    subString: 'iCab',
    identity: 'iCab',
  },
  {
    string: navigator.vendor,
    subString: 'KDE',
    identity: 'Konqueror',
  },
  {
    string: navigator.userAgent,
    subString: 'Firefox',
    identity: 'Firefox',
  },
  {
    string: navigator.vendor,
    subString: 'Camino',
    identity: 'Camino',
  },
  {
    string: navigator.userAgent,
    subString: 'Netscape',
    identity: 'Netscape',
  },
  {
    string: navigator.userAgent,
    subString: 'MSIE',
    identity: 'Explorer',
    versionSearch: 'MSIE',
  },
  {
    string: navigator.userAgent,
    subString: 'Trident',
    identity: 'Explorer',
    versionSearch: 'rv',
  },
  {
    string: navigator.vendor,
    subString: 'Google Inc.',
    identity: 'Chrome',
    versionSearch: 'Chrome',
  },
  {
    string: navigator.userAgent,
    subString: 'Gecko',
    identity: 'Mozilla',
    versionSearch: 'rv',
  },
  {
    string: navigator.userAgent,
    subString: 'Mozilla',
    identity: 'Netscape',
    versionSearch: 'Mozilla',
  },
];

const dataOS = [
  {
    string: navigator.platform,
    subString: 'Win',
    identity: 'Windows',
  },
  {
    string: navigator.platform,
    subString: 'Mac',
    identity: 'Mac',
  },
  {
    string: navigator.platform,
    subString: 'Linux',
    identity: 'Linux',
  },
];

export const detectBrowser = () => {
  const browserResult = searchString(dataBrowser);
  const browser = browserResult ? browserResult.identity : __('An unknown browser');

  const version = browserResult
    ? searchVersion(navigator.userAgent, browserResult.versionSearchString)
      || searchVersion(navigator.appVersion, browserResult.versionSearchString)
      || __('An unknown version')
    : __('An unknown version');

  const osResult = searchString(dataOS);
  const OS = osResult ? osResult.identity : __('An unknown OS');

  return {
    browser,
    version,
    OS,
  };
};
