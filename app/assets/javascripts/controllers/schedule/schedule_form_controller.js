ManageIQ.angular.app.controller('scheduleFormController', ['$http', '$scope', 'scheduleFormId', 'oneMonthAgo', 'miqService', 'timerOptionService', function($http, $scope, scheduleFormId, oneMonthAgo, miqService, timerOptionService) {
  var vm = this;

  var init = function() {
    vm.scheduleModel = {
      action_typ: '',
      depot_name: '',
      filter_typ: '',
      log_userid: '',
      log_protocol: '',
      description: '',
      enabled: '',
      name: '',
      timer_typ: '',
      timer_value: '',
      start_date: null,
      start_hour: '',
      start_min: '',
      time_zone: '',
      uri: '',
      uri_prefix: '',
      filter_value: ''
    };
    vm.date_from = null;
    vm.formId = scheduleFormId;
    vm.afterGet = false;
    vm.validateClicked = miqService.validateWithAjax;
    vm.modelCopy = angular.copy( vm.scheduleModel );
    vm.model = "scheduleModel";
    vm.saveable = miqService.saveable;

    ManageIQ.angular.scope = vm;

    if (scheduleFormId == 'new') {
      vm.newRecord                = true;
      vm.scheduleModel.action_typ = 'vm';
      vm.scheduleModel.filter_typ = 'all';
      vm.scheduleModel.enabled    = true;
      vm.filterValuesEmpty        = true;
      vm.scheduleModel.start_date = moment(moment.utc().toDate()).format('MM/DD/YYYY');
      vm.scheduleModel.timer_typ  = 'Once';
      vm.scheduleModel.time_zone  = 'UTC';
      vm.scheduleModel.start_hour = '0';
      vm.scheduleModel.start_min  = '0';
      vm.afterGet                 = true;
      vm.modelCopy                = angular.copy( vm.scheduleModel );
      vm.setTimerType();
      vm.date_from = new Date();
    } else {
      vm.newRecord = false;

      miqService.sparkleOn();

      $http.get('/ops/schedule_form_fields/' + scheduleFormId)
        .then(getScheduleFormDataComplete)
        .catch(miqService.handleFailure);
    }

    function getScheduleFormDataComplete(response) {
      var data = response.data;

      vm.scheduleModel.action_typ   = data.action_type;
      vm.scheduleModel.depot_name   = data.depot_name;
      vm.scheduleModel.filter_typ   = data.filter_type;
      vm.scheduleModel.log_userid   = data.log_userid;
      vm.scheduleModel.log_protocol = data.protocol;
      vm.scheduleModel.description  = data.schedule_description;
      vm.scheduleModel.enabled      = data.schedule_enabled == 1 ? true : false;
      vm.scheduleModel.name         = data.schedule_name;
      vm.scheduleModel.timer_typ    = data.schedule_timer_type;
      vm.scheduleModel.timer_value  = data.schedule_timer_value;
      vm.scheduleModel.start_date   = data.schedule_start_date;
      vm.scheduleModel.start_hour   = data.schedule_start_hour.toString();
      vm.scheduleModel.start_min    = data.schedule_start_min.toString();
      vm.scheduleModel.time_zone    = data.schedule_time_zone;
      vm.scheduleModel.uri          = data.uri;
      vm.scheduleModel.uri_prefix   = data.uri_prefix;
      vm.scheduleModel.starting_object = data.starting_object;
      vm.scheduleModel.instance_names  = data.instance_names;
      vm.scheduleModel.target_classes  = data.target_classes;
      vm.scheduleModel.targets         = data.targets;
      vm.scheduleModel.instance_name   = data.instance_name;
      vm.scheduleModel.object_message  = data.object_message;
      vm.scheduleModel.object_request  = data.object_request;
      vm.scheduleModel.target_class    = data.target_class;
      vm.scheduleModel.target_id       = data.target_id;
      vm.scheduleModel.ui_attrs        = data.ui_attrs;

      vm.setTimerType();

      vm.timer_items        = timerOptionService.getOptions(vm.scheduleModel.timer_typ);

      if (data.filter_type === 'all' || (data.protocol !== undefined && data.protocol !== null)) {
        vm.filterValuesEmpty = true;
      } else {
        buildFilterList(data);

        vm.filterValuesEmpty = false;
        vm.scheduleModel.filter_value     = data.filter_value;
      }

      if (data.filter_type === null &&
        (data.protocol !== undefined && data.protocol !== null && data.protocol !== 'Samba')) {
        vm.scheduleModel.filter_typ = 'all';
      }

      vm.scheduleModel.log_password = '';
      if (vm.scheduleModel.log_userid !== '') {
        vm.scheduleModel.log_password = miqService.storedPasswordPlaceholder;
      }

      vm.afterGet = true;
      vm.modelCopy = angular.copy( vm.scheduleModel );

      miqService.sparkleOff();
    }

    miqService.buildCalendar(oneMonthAgo.year, parseInt(oneMonthAgo.month, 10) + 1, oneMonthAgo.date);
  };

  var buildFilterList = function(data) {
    vm.filterList = [];
    angular.forEach(data.filtered_item_list, function(filteredItem) {
      var tempObj = {};

      if (_.isArray(filteredItem)) {
        tempObj.text = filteredItem[1];
        tempObj.value = filteredItem[0];
      } else {
        tempObj.text = filteredItem;
        tempObj.value = filteredItem;
      }

      vm.filterList.push(tempObj);
    });
  };

  var testType = function(type) {
    return type.test(vm.scheduleModel.action_typ);
  };

  var isVmType = function() {
    return testType(/^vm/);
  };

  var isHostType = function() {
    return testType(/^host/);
  };

  var scheduleEditButtonClicked = function(buttonName, serializeFields) {
    miqService.sparkleOn();
    var url = '/ops/schedule_edit/' + scheduleFormId + '?button=' + buttonName;
    if (serializeFields === undefined) {
      miqService.miqAjaxButton(url);
    } else {
      if (vm.scheduleModel.action_typ === 'automation_request') {
        // should ignore list of targets as this list can be really long no need to send that up to server
        var moreUrlParams = $.param(miqService.serializeModelWithIgnoredFields(vm.scheduleModel, ["targets", "time_zone"]));
        if (moreUrlParams) {
          url += '&' + decodeURIComponent(moreUrlParams) + encodeURIComponent(vm.scheduleModel.time_zone);
        }
      }
      miqService.miqAjaxButton(url, serializeFields);
    }
  };

  vm.buildLegend = function() {
    var type;

    if (isVmType()) {
      type = __('VM Selection');
    } else if (isHostType()) {
      type = __('Host Selection');
    } else if (vm.scheduleModel.action_typ === 'miq_template') {
      type = __('Template Selection');
    } else if (vm.scheduleModel.action_typ === 'emscluster') {
      type = __('Cluster Selection');
    } else if (vm.scheduleModel.action_typ === 'storage') {
      type = __('Datastore Selection');
    } else if (vm.scheduleModel.action_typ === 'db_backup') {
      type = __('Database Backup Selection');
    } else if (vm.scheduleModel.action_typ === 'automation_request') {
      type = __('Automate Tasks Selection');
    }

    return type;
  };

  vm.determineActionType = function() {
    if (isVmType()) {
      return 'vm';
    } else if (isHostType()) {
      return 'host';
    } else {
      return vm.scheduleModel.action_typ;
    }
  };

  vm.dbBackup = function() {
    return vm.scheduleModel.action_typ === 'db_backup';
  };

  vm.automateRequest = function() {
    return vm.scheduleModel.action_typ === 'automation_request';
  };

  vm.sambaBackup = function() {
    return vm.dbBackup() && vm.scheduleModel.log_protocol === 'Samba';
  };

  vm.actionTypeChanged = function() {
    if (vm.dbBackup()) {
      vm.scheduleModel.log_protocol = 'Network File System';
      vm.scheduleModel.uri_prefix = 'nfs';
      vm.scheduleModel.filter_typ = null;
    } else if (vm.automateRequest()) {
      miqService.sparkleOn();

      $http.post('/ops/automate_schedules_set_vars/' + scheduleFormId)
        .then(postAutomateSchedulesSetVarsComplete)
        .catch(miqService.handleFailure);
    } else {
      vm.scheduleModel.filter_typ = 'all';
    }
    vm.scheduleModel.filter_value = '';

    vm.filterValuesEmpty = true;

    function postAutomateSchedulesSetVarsComplete(response) {
      var data = response.data;

      vm.scheduleModel.instance_names  = data.instance_names;
      vm.scheduleModel.target_classes  = data.target_classes;
      vm.scheduleModel.targets         = data.targets;
      vm.scheduleModel.starting_object = data.starting_object;
      vm.scheduleModel.instance_name   = data.instance_name;
      vm.scheduleModel.object_message  = data.object_message;
      vm.scheduleModel.object_request  = data.request;
      vm.scheduleModel.target_class    = data.target_class;
      vm.scheduleModel.target_id       = data.target_id;
      vm.scheduleModel.targets         = [];
      vm.scheduleModel.filter_typ      = null;
      vm.scheduleModel.ui_attrs        = data.ui_attrs;
      miqService.sparkleOff();
    }
  };

  vm.targetClassChanged = function() {
    miqService.sparkleOn();
    $http.post('/ops/fetch_target_ids/?target_class=' + vm.scheduleModel.target_class)
      .then(postFetchTargetIdsComplete)
      .catch(miqService.handleFailure);

    function postFetchTargetIdsComplete(response) {
      var data = response.data;

      vm.scheduleModel.target_id = data.target_id;
      vm.scheduleModel.targets = data.targets;
      miqService.sparkleOff();
    }
  };

  vm.filterTypeChanged = function() {
    if (vm.scheduleModel.filter_typ != 'all') {
      miqService.sparkleOn();
      $http.post('/ops/schedule_form_filter_type_field_changed/' + scheduleFormId,
        {filter_type: vm.scheduleModel.filter_typ,
          action_type: vm.scheduleModel.action_typ})
        .then(postScheduleFormFilterTypeComplete)
        .catch(miqService.handleFailure);
    } else {
      vm.scheduleModel.filter_value = '';
      vm.filterValuesEmpty = true;
    }

    function postScheduleFormFilterTypeComplete(response) {
      var data = response.data;

      buildFilterList(data);
      vm.filterValuesEmpty = false;
      miqService.sparkleOff();
    }
  };

  vm.logProtocolChanged = function() {
    if (vm.scheduleModel.log_protocol === "Samba") {
      vm.scheduleModel.uri_prefix = "smb";
    }

    if (vm.scheduleModel.log_protocol === "Network File System") {
      vm.scheduleModel.uri_prefix = "nfs";
      $scope.$broadcast('resetClicked');
      vm.scheduleModel.log_userid = vm.modelCopy.log_userid;
      vm.scheduleModel.log_password = vm.modelCopy.log_password;
    }
  };

  vm.filterValueChanged = function() {
  };

  vm.scheduleTimerTypeChanged = function() {
    vm.setTimerType();

    vm.timer_items = timerOptionService.getOptions(vm.scheduleModel.timer_typ);

    if (vm.timerNotOnce()) {
      vm.scheduleModel.timer_value = 1;
    } else {
      vm.scheduleModel.timer_value = 0;
    }
  };

  vm.timerNotOnce = function() {
    return vm.scheduleModel.timer_typ !== 'Once';
  };

  vm.cancelClicked = function() {
    scheduleEditButtonClicked('cancel');
    $scope.angularForm.$setPristine(true);
  };

  vm.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    vm.scheduleModel = angular.copy( vm.modelCopy );

    if (vm.dbBackup()) {
      vm.filterValuesEmpty = true;
    }

    var filter_touched = $scope.angularForm.action_typ.$touched || (typeof $scope.angularForm.filter_typ != 'undefined' && $scope.angularForm.filter_typ.$touched);
    if (!vm.dbBackup() && !vm.automateRequest() && vm.scheduleModel.filter_typ && !filter_touched) {
      // AJAX-less Reset
      vm.toggleValueForWatch('filterValuesEmpty', false);
    }

    if (!vm.dbBackup() && !!vm.automateRequest() && vm.scheduleModel.filter_typ && filter_touched) {
      vm.filterTypeChanged();
    }

    if (vm.scheduleModel.timer_typ && $scope.angularForm.timer_typ.$touched) {
      vm.setTimerType();
      vm.timer_items = timerOptionService.getOptions(vm.scheduleModel.timer_typ);
    }

    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash("warn", __("All changes have been reset"));
  };

  vm.saveClicked = function() {
    scheduleEditButtonClicked('save', true);
    $scope.angularForm.$setPristine(true);
  };

  vm.addClicked = function() {
    vm.saveClicked();
  };

  vm.filterValueRequired = function(value) {
    return !vm.filterValuesEmpty && !value;
  };

  vm.dbRequired = function(value) {
    return vm.dbBackup() && !value;
  };

  vm.sambaRequired = function(value) {
    return vm.sambaBackup() && !value;
  };

  vm.isBasicInfoValid = function() {
    return ($scope.angularForm.depot_name.$valid &&
      $scope.angularForm.uri.$valid &&
      $scope.angularForm.log_userid.$valid &&
      $scope.angularForm.log_password.$valid);
  };

  vm.setTimerType = function() {
    vm.timerTypeOnce = vm.scheduleModel.timer_typ == "Once";
  };

  vm.toggleValueForWatch = function(watchValue, initialValue) {
    if (vm[watchValue] == initialValue) {
      vm[watchValue] = "NO-OP";
    } else if (vm[watchValue] == "NO-OP") {
      vm[watchValue] = initialValue;
    }
  };

  vm.canValidate = function() {
    return vm.isBasicInfoValid() && vm.validateFieldsDirty();
  };

  vm.canValidateBasicInfo = function() {
    return vm.isBasicInfoValid();
  };

  vm.validateFieldsDirty = function() {
    return ($scope.angularForm.depot_name.$dirty ||
        $scope.angularForm.uri.$dirty ||
        $scope.angularForm.log_userid.$dirty ||
        $scope.angularForm.log_password.$dirty);
  };

  init();
}]);
