import JdrReport from './jdr-component';
miqHttpInject(
  angular
    .module('ManageIQ.middleware', ['miqStaticAssets', 'patternfly.views'])
    .component('jdrReport', new JdrReport)
);
