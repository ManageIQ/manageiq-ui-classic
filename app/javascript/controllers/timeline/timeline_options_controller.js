ManageIQ.angular.app.controller('timelineOptionsController', ['$http', '$scope', 'miqService', 'url', 'categories', function($http, $scope, miqService, url, categories) {
  let vm = this;

  const init = () => {
    vm.reportModel = {
      tl_show: 'timeline',
      tl_categories: ['Power Activity'],
      tl_timerange: 'weeks',
      tl_timepivot: 'ending',
      tl_result: 'success',
      tl_range_count: 1,
      tl_date: new Date(ManageIQ.calendar.calDateTo),
    };

    vm.afterGet  = true;
    vm.dateOptions = {
      autoclose: true,
      todayHighlight: true,
      orientation: 'bottom',
    };
    ManageIQ.angular.scope = vm;
    vm.availableCategories = categories;
  };

  vm.eventTypeUpdated = () => {
    vm.reportModel.tl_categories = [];
  };

  vm.countDecrement = () => {
    if (vm.reportModel.tl_range_count > 1) {
      vm.reportModel.tl_range_count--;
    }
  };

  vm.countIncrement = () => {
    vm.reportModel.tl_range_count++;
  };

  vm.applyButtonClicked = () => {
    if (vm.reportModel.tl_categories.length === 0) {
      return;
    }

    // NOTE: process selection
    if (vm.reportModel.tl_timerange === 'days') {
      vm.reportModel.tl_typ = 'Hourly';
      vm.reportModel.tl_days = vm.reportModel.tl_range_count;
    } else {
      vm.reportModel.tl_typ = 'Daily';
      if (vm.reportModel.tl_timerange === 'weeks') {
        vm.reportModel.tl_days = vm.reportModel.tl_range_count * 7;
      } else {
        vm.reportModel.tl_days = vm.reportModel.tl_range_count * 30;
      }
    }
    // NOTE: moment is not immutable yet
    let selectedDay = moment(vm.reportModel.tl_date);
    let startDay = selectedDay.clone();
    let endDay = selectedDay.clone();

    if (vm.reportModel.tl_timepivot === 'starting') {
      endDay.add(vm.reportModel.tl_days, 'days').toDate();
      vm.reportModel.miq_date = endDay.format('MM/DD/YYYY');
    } else if (vm.reportModel.tl_timepivot === 'centered') {
      let enddays = Math.ceil(vm.reportModel.tl_days / 2);
      startDay.subtract(enddays, 'days').toDate();
      endDay.add(enddays, 'days').toDate();
      vm.reportModel.miq_date = endDay.format('MM/DD/YYYY');
    }  else if (vm.reportModel.tl_timepivot === 'ending') {
      startDay.subtract(vm.reportModel.tl_days, 'days');
      vm.reportModel.miq_date = endDay.format('MM/DD/YYYY');
    }
    ManageIQ.calendar.calDateFrom = startDay.toDate();
    ManageIQ.calendar.calDateTo = endDay.toDate();
    if (vm.reportModel.tl_show === 'timeline') {
      if (vm.reportModel.showDetailedEvents) {
        vm.reportModel.tl_fl_typ = 'detail';
      } else {
        vm.reportModel.tl_fl_typ = 'critical';
      }
    }
    miqService.sparkleOn();
    miqService.miqAsyncAjaxButton(url, miqService.serializeModel(vm.reportModel));
  };

  init();
}]);
