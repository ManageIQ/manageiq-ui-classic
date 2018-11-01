/* global add_flash */
ManageIQ.angular.app.component('miqRequestOptions', {
  bindings: {
    options: '<',
  },
  templateUrl: '/static/miq-request-options.html.haml',
  controller: ['$http', 'miqService', function($http, miqService) {
    this.$onInit = function() {
      this.initValues = _.cloneDeep(this.options);
    };

    this.appliedStatesBlank = function() {
      return ! this.options.states.find(function(state) { return state.checked; });
    };

    this.applyClick = function() {
      if (this.appliedStatesBlank()) {
        // fixme should we rather enable/disable the Apply button?
        add_flash(__('At least one status must be selected'), 'warn');
        return;
      }
      $http.post('/miq_request/filter/', this.options)
        .then(this.applyNewScope)
        .catch(miqService.handleFailure);
    };

    this.applyNewScope = function(response) {
      var data = response.data;
      sendDataWithRx({setScope: {name: 'reportDataController'}, data: data.data.scope});
    };

    this.resetClick = function() {
      this.options = _.cloneDeep(this.initValues);
    };
  }],
});
