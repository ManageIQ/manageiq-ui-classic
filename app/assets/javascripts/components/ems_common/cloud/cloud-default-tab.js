ManageIQ.angular.app.component('emsCloudDefaultTab', {
  bindings: {
    showSecurityProtocol: '<?',
    openstackSecurityProtocols: '<',
    formModel: '<',
    newRecord: '<?',
    modelCopy: '<',
    prefix: '@',
    validateClicked: '<',
    authenticationRequired: '<',
    postValidationModel: '<',
    postValidationModelRegistry: '<',
  },
  templateUrl: '/static/ems-common/tabs/default-tab.html.haml',
});
