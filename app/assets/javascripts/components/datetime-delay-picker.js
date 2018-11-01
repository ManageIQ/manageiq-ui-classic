ManageIQ.angular.app.component('datetimeDelayPicker', {
  bindings: {
    model: '=',
    start_date: '<',
  },

  controllerAs: 'vm',

  controller: ['$scope', '$element', function($scope, $element) {
    $scope.__ = __;

    this.months = 0;
    this.weeks = 0;
    this.days = 0;
    this.hours = 0;

    this.setRetirementDate = function() {
      this.model = moment.utc(this.start_date)
        .add(this.months, 'month')
        .add(this.weeks, 'week')
        .add(this.days, 'day')
        .add(this.hours, 'hour')
        .toDate();
    };

    this.$onInit = function() {
      if (! this.start_date) {
        this.start_date = new Date();
      }
    };

    this.$postLink = function() {
      var commonAttrs = {min: 0, verticalbuttons: true, buttondown_class: 'btn btn-link', buttonup_class: 'btn btn-link'};
      var attrs = {months: __('Months'), weeks: __('Weeks'), days: __('Days'), hours: __('Hours')};

      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          $element.find('input[name=' + key + ']').TouchSpin(Object.assign({}, commonAttrs, {'prefix': attrs[key]}));
        }
      }
    };
  }],

  template: [
    '<div class="form-group">',
    '  <label class="control-label col-md-3">{{ __("Time Delay:") }}</label>',
    '  <div class="col-md-2">',
    '    <input class="form-control" name="months" type="text" ng-model="vm.months" ng-change="vm.setRetirementDate()">',
    '  </div>',
    '  <div class="col-md-2">',
    '    <input class="form-control" name="weeks" type="text" ng-model="vm.weeks" ng-change="vm.setRetirementDate()">',
    '  </div>',
    '  <div class="col-md-2">',
    '    <input class="form-control" name="days" type="text" ng-model="vm.days" ng-change="vm.setRetirementDate()">',
    '  </div>',
    '  <div class="col-md-2">',
    '    <input class="form-control" name="hours" type="text" ng-model="vm.hours" ng-change="vm.setRetirementDate()">',
    '  </div>',
    '</div>',
  ].join('\n'),
});
