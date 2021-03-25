export const quads = [
  {
    topLeft: {
      fonticon: 'fa fa-cog',
      color: '#0099cc',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      text: '42',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fileicon: '/assets/manageiq.svg',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
  {
    topLeft: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
    },
    topRight: {
      fonticon: 'fa fa-cog',
    },
    bottomLeft: {
      fileicon: '/assets/manageiq.svg',
    },
    bottomRight: {
      text: '42',
    },
  },
  {
    topLeft: {
      fileicon: '/assets/manageiq.svg',
    },
    topRight: {
      text: '42',
    },
    bottomLeft: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
    },
    bottomRight: {
      fonticon: 'fa fa-cog',
    },
  },
  {
    topLeft: {
      text: '42',
    },
    topRight: {
      fileicon: '/assets/manageiq.svg',
    },
    bottomLeft: {
      fonticon: 'fa fa-cog',
    },
    bottomRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
    },
  },
  {
    fonticon: 'pficon pficon-server',
    color: '#0099cc',
    tooltip: 'Hello, I am a very useful tooltip!',
  },
  {
    fileicon: '/assets/manageiq.svg',
  },
  {
    text: '42',
  },
  {
    topLeft: {
      fonticon: 'fa fa-cog',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
    },
    bottomLeft: {
      text: '42',
    },
    bottomRight: {
      fileicon: '/assets/manageiq.svg',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      fonticon: 'fa fa-cog',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
    },
    bottomLeft: {
      text: '42',
    },
    bottomRight: {
      fonticon: 'fa fa-shield',
    },
    middle: {
      fonticon: 'fa fa-shield',
      color: '#ffcc33',
    },
  },
];

export const numbers = ((function () {
  const examples = [
    42,
    420,
    4200,
    42000,
    112081, // this is an edge case
    420000,
    4200000,
    42000000,
    420000000,
    'small',
    'tiny',
  ].map(item => ({ text: item }));

  return examples.concat(examples.map(item => ({
    topLeft: item,
    topRight: item,
    bottomLeft: item,
    bottomRight: item,
  })));
})());

export const piecharts = (function () {
  const examples = [];

  for (let i = 0; i < 5; i += 1) {
    examples.push(i);
  }

  return [{ piechart: 0 }, { piechart: 10 }, { piechart: 20 }].concat(examples.map(item => ({
    topLeft: { piechart: item * 4 },
    topRight: { piechart: item * 4 + 1 },
    bottomLeft: { piechart: item * 4 + 2 },
    bottomRight: { piechart: item * 4 + 3 },
  })));
})();

export const hosts = [
  {
    topLeft: {
      text: '17',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-redhat.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'pficon pficon-ok',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
  {
    topLeft: {
      text: '120000',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-vmware.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'pficon pficon-ok',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      text: '1990',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-stop',
      background: '#CC0000',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-vmware.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'fa fa-exclamation',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
];

export const vms = [
  {
    topLeft: {
      fileicon: '/assets/vendor-redhat.svg',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-redhat.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      text: '12',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      fileicon: '/assets/vendor-chrome.svg',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      text: 'R',
      background: '#336699',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-vmware.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      text: '0',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      text: '?',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-stop',
      background: '#CC0000',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-vmware.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      text: '3',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
  {
    topLeft: {
      fileicon: '/assets/vendor-centos.svg',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      text: 'T',
      background: '#336699',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-vmware.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      text: '0',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
  {
    topLeft: {
      fileicon: '/assets/vendor-ubuntu.svg',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      text: 'A',
      background: '#336699',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-redhat.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      text: '0',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
];

export const containerproviders = [
  {
    topLeft: {
      text: '9',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-openshift.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      text: '12',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      text: '99',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-openshift.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'pficon pficon-ok',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      text: '999',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-play',
      background: '#3F9C35',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-openshift.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'pficon pficon-ok',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
    middle: {
      fileicon: '/assets/protected.svg',
    },
  },
  {
    topLeft: {
      text: '9999',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-pause-circle-o',
      background: '#FF9900',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-openshift.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'fa fa-exclamation',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
  {
    topLeft: {
      text: '99999',
      tooltip: 'Hello, I am a very useful tooltip in the first quadrant!',
    },
    topRight: {
      fonticon: 'fa fa-pause-circle-o',
      background: '#FF9900',
      tooltip: 'Hello, I am a very useful tooltip in the second quadrant!',
    },
    bottomLeft: {
      fileicon: '/assets/vendor-openshift.svg',
      tooltip: 'Hello, I am a very useful tooltip in the third quadrant!',
    },
    bottomRight: {
      fonticon: 'fa fa-exclamation',
      tooltip: 'Hello, I am a very useful tooltip in the fourth quadrant!',
    },
  },
];

