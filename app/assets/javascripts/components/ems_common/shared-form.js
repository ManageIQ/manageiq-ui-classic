ManageIQ.angular.app.component('emsSharedForm', {
  bindings: {
    afterGet: '<',
    sharedFormModel: '<',
    newRecord: '<',
    showProviderRegion: '<',
    emsTypeOptions: '<',
    providerRegionOptions: '<',
    showEmsProject: '<',
    showEmsTenantId: '<',
    showSubscriptionId: '<',
    showApiVersion: '<',
    apiVersionOptions: '<',
    showKeystoneDomain: '<',
    showNuageApiVersion: '<',
    nuageApiVersionOptions: '<',
    showEmsInfraProviderId: '<',
    emsInfraProviderIdOptions: '<',
    emsZoneOptions: '<',
    showTenantMapping: '<',
    showProviderRegionInput: '<',
    showVncStartPort: '<'
  },
  templateUrl: '/static/ems-common/shared-form.html.haml',
  controller: ['$scope', function($scope) {
    this.$onInit = function() {
      console.log('init shared form component');
    }
  }]
})
