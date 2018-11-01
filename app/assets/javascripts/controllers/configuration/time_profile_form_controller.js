ManageIQ.angular.app.controller('timeProfileFormController', ['$http', 'timeProfileFormId', 'timeProfileFormAction', 'miqService', function($http, timeProfileFormId, timeProfileFormAction, miqService) {
  var vm = this;

  var init = function() {
    vm.timeProfileModel = {
      description: '',
      admin_user: false,
      restricted_time_profile: false,
      profile_type: '',
      profile_tz: '',
      rollup_daily: false,
      all_days: false,
      days: [],
      dayValues: [],
      hours: [],
      hourValuesAMFirstHalf: [],
      hourValuesAMSecondHalf: [],
      hourValuesPMFirstHalf: [],
      hourValuesPMSecondHalf: [],
      hourValues: [],
      some_days_checked: true,
      some_hours_checked: true,
    };
    vm.dayNames = [__('Sunday'), __('Monday'), __('Tuesday'), __('Wednesday'), __('Thursday'), __('Friday'), __('Saturday')];
    vm.hourNamesFirstHalf = [__('12-1'), __('1-2'), __('2-3'), __('3-4'), __('4-5'), __('5-6')];
    vm.hourNamesSecondHalf = [__('6-7'), __('7-8'), __('8-9'), __('9-10'), __('10-11'), __('11-12')];
    vm.afterGet = false;
    vm.modelCopy = angular.copy( vm.timeProfileModel );
    vm.model = 'timeProfileModel';

    ManageIQ.angular.scope = vm;

    vm.saveable = miqService.saveable;

    miqService.sparkleOn();
    $http.get('/configuration/time_profile_form_fields/' + timeProfileFormId)
      .then(getTimeProfileFormData)
      .catch(miqService.handleFailure);

    if (timeProfileFormAction === 'timeprofile_edit') {
      vm.newRecord = false;
      vm.formId = timeProfileFormId;
    } else {
      vm.newRecord = true;
      vm.formId = 'new';
    }
  };

  vm.getDaysValues = function() {
    for (var i = 0; i < 7; i++) {
      if (vm.timeProfileModel.days.indexOf(i) > -1) {
        vm.timeProfileModel.dayValues.push(true);
      } else {
        vm.timeProfileModel.dayValues.push(false);
      }
    }
  };

  vm.dayValuesChanged = function() {
    var tempDays = [];

    for (var i = 0; i < 7; i++) {
      if (vm.timeProfileModel.dayValues[i] === true) {
        tempDays.push(i);
      }
    }
    vm.timeProfileModel.days = tempDays;
  };

  vm.getHoursValues = function() {
    for (var i = 0; i < 6; i++) {
      if (vm.timeProfileModel.hours.indexOf(i) > -1) {
        vm.timeProfileModel.hourValuesAMFirstHalf.push(true);
      } else {
        vm.timeProfileModel.hourValuesAMFirstHalf.push(false);
      }
    }
    for (var i = 6; i < 12; i++) {
      if (vm.timeProfileModel.hours.indexOf(i) > -1) {
        vm.timeProfileModel.hourValuesAMSecondHalf.push(true);
      } else {
        vm.timeProfileModel.hourValuesAMSecondHalf.push(false);
      }
    }
    for  (var i = 12; i < 18; i++) {
      if (vm.timeProfileModel.hours.indexOf(i) > -1) {
        vm.timeProfileModel.hourValuesPMFirstHalf.push(true);
      } else {
        vm.timeProfileModel.hourValuesPMFirstHalf.push(false);
      }
    }
    for (var i = 18; i < 24; i++) {
      if (vm.timeProfileModel.hours.indexOf(i) > -1) {
        vm.timeProfileModel.hourValuesPMSecondHalf.push(true);
      } else {
        vm.timeProfileModel.hourValuesPMSecondHalf.push(false);
      }
    }
    vm.calculateTimeProfileHourValues();
  };

  vm.hourValuesChanged = function() {
    var tempHours = [];

    for (var i = 0; i < 6; i++) {
      if (vm.timeProfileModel.hourValuesAMFirstHalf[i] === true) {
        tempHours.push(i);
      }
    }
    for (var i = 0, j = 6; i < 6, j < 12; i++, j++) {
      if (vm.timeProfileModel.hourValuesAMSecondHalf[i] === true) {
        tempHours.push(j);
      }
    }
    for (var i = 0, j = 12; i < 6, j < 18; i++, j++) {
      if (vm.timeProfileModel.hourValuesPMFirstHalf[i] === true) {
        tempHours.push(j);
      }
    }
    for (var i = 0, j = 18; i < 6, j < 24; i++, j++) {
      if (vm.timeProfileModel.hourValuesPMSecondHalf[i] === true) {
        tempHours.push(j);
      }
    }
    vm.timeProfileModel.hours = tempHours;
    vm.calculateTimeProfileHourValues();
  };

  vm.calculateTimeProfileHourValues = function() {
    vm.timeProfileModel.hourValues = [];
    vm.timeProfileModel.hourValues.push(vm.timeProfileModel.hourValuesAMFirstHalf);
    vm.timeProfileModel.hourValues.push(vm.timeProfileModel.hourValuesAMSecondHalf);
    vm.timeProfileModel.hourValues.push(vm.timeProfileModel.hourValuesPMFirstHalf);
    vm.timeProfileModel.hourValues.push(vm.timeProfileModel.hourValuesPMSecondHalf);
    vm.timeProfileModel.hourValues = _.flattenDeep(vm.timeProfileModel.hourValues);
  };

  vm.allDaysClicked = function() {
    if (vm.timeProfileModel.all_days) {
      vm.timeProfileModel.dayValues = _.times(7, _.constant(true));
      vm.timeProfileModel.days = _.times(7, i);
      vm.timeProfileModel.some_days_checked = true;
    } else {
      vm.timeProfileModel.dayValues = _.times(7, _.constant(false));
      vm.timeProfileModel.days = [];
      vm.timeProfileModel.some_days_checked = false;
    }
  };

  vm.allHoursClicked = function() {
    if (vm.timeProfileModel.all_hours) {
      vm.timeProfileModel.hourValuesAMFirstHalf = _.times(6, _.constant(true));
      vm.timeProfileModel.hourValuesAMSecondHalf = _.times(6, _.constant(true));
      vm.timeProfileModel.hourValuesPMFirstHalf = _.times(6, _.constant(true));
      vm.timeProfileModel.hourValuesPMSecondHalf = _.times(6, _.constant(true));
      vm.timeProfileModel.hours = _.times(24, i);
      vm.timeProfileModel.some_hours_checked = true;
    } else {
      vm.timeProfileModel.hourValuesAMFirstHalf = _.times(6, _.constant(false));
      vm.timeProfileModel.hourValuesAMSecondHalf = _.times(6, _.constant(false));
      vm.timeProfileModel.hourValuesPMFirstHalf = _.times(6, _.constant(false));
      vm.timeProfileModel.hourValuesPMSecondHalf = _.times(6, _.constant(false));
      vm.timeProfileModel.some_hours_checked = false;
      vm.timeProfileModel.hours = [];
    }
    vm.calculateTimeProfileHourValues();
  };

  var timeProfileEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/configuration/timeprofile_update/' + vm.formId + '?button=' + buttonName;
    var timeProfileModelObj = angular.copy(vm.timeProfileModel);
    miqService.miqAjaxButton(url, timeProfileModelObj);
  };
  // $scope preserved because it's used by x_edit_buttons_angular
  vm.cancelClicked = function() {
    timeProfileEditButtonClicked('cancel');
  };

  vm.resetClicked = function(angularForm) {
    vm.timeProfileModel = angular.copy( vm.modelCopy );
    angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  vm.saveClicked = function() {
    timeProfileEditButtonClicked('save', true);
  };

  vm.addClicked = vm.saveClicked;

  function getTimeProfileFormData(response) {
    var data = response.data;

    Object.assign(vm.timeProfileModel, data);

    vm.getDaysValues();
    vm.getHoursValues();

    vm.note = sprintf(__('In use by %s reports, cannot be disabled'), vm.timeProfileModel.miq_reports_count);

    vm.afterGet = true;
    vm.modelCopy = angular.copy( vm.timeProfileModel );

    miqService.sparkleOff();
  }

  init();
}]);
