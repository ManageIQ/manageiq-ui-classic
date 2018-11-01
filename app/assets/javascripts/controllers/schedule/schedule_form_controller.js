ManageIQ.angular.app.controller('scheduleFormController', ['$http', '$scope', 'scheduleFormId', 'oneMonthAgo', 'miqService', 'timerOptionService', function($http, $scope, scheduleFormId, oneMonthAgo, miqService, timerOptionService) {
  var init = function() {
    $scope.scheduleModel = {
      action_typ: '',
      depot_name: '',
      filter_typ: '',
      log_userid: '',
      log_aws_region: '',
      openstack_region: '',
      keystone_api_version: '',
      v3_domain_ident: '',
      swift_api_port: 5000,
      security_protocol: '',
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
      filter_value: '',
    };
    $scope.date_from = new Date();
    $scope.formId = scheduleFormId;
    $scope.afterGet = false;
    $scope.validateClicked = miqService.validateWithAjax;
    $scope.modelCopy = angular.copy( $scope.scheduleModel );
    $scope.model = 'scheduleModel';

    ManageIQ.angular.scope = $scope;

    if (scheduleFormId == 'new') {
      $scope.newRecord                = true;
      $scope.scheduleModel.action_typ = 'vm';
      $scope.scheduleModel.filter_typ = 'all';
      $scope.scheduleModel.enabled    = true;
      $scope.filterValuesEmpty        = true;
      $scope.scheduleModel.start_date = moment.utc().toDate();
      $scope.scheduleModel.timer_typ  = 'Once';
      $scope.scheduleModel.time_zone  = 'UTC';
      $scope.scheduleModel.start_hour = '0';
      $scope.scheduleModel.start_min  = '0';
      $scope.afterGet                 = true;
      $scope.modelCopy                = angular.copy( $scope.scheduleModel );
      $scope.setTimerType();
    } else {
      $scope.newRecord = false;

      miqService.sparkleOn();

      $http.get('/ops/schedule_form_fields/' + scheduleFormId)
        .then(getScheduleFormDataComplete)
        .catch(miqService.handleFailure);
    }

    function getScheduleFormDataComplete(response) {
      var data = response.data;

      $scope.scheduleModel.action_typ   = data.action_type;
      $scope.scheduleModel.depot_name   = data.depot_name;
      $scope.scheduleModel.filter_typ   = data.filter_type;
      $scope.scheduleModel.log_userid   = data.log_userid;
      $scope.scheduleModel.log_protocol = data.protocol;
      $scope.scheduleModel.description  = data.schedule_description;
      $scope.scheduleModel.enabled      = data.schedule_enabled == 1 ? true : false;
      $scope.scheduleModel.name         = data.schedule_name;
      $scope.scheduleModel.timer_typ    = data.schedule_timer_type;
      $scope.scheduleModel.timer_value  = data.schedule_timer_value;
      $scope.scheduleModel.start_date   = moment(data.schedule_start_date, 'MM/DD/YYYY').utc().toDate();
      $scope.scheduleModel.start_hour   = data.schedule_start_hour.toString();
      $scope.scheduleModel.start_min    = data.schedule_start_min.toString();
      $scope.scheduleModel.time_zone    = data.schedule_time_zone;
      $scope.scheduleModel.uri          = data.uri;
      $scope.scheduleModel.uri_prefix   = data.uri_prefix;
      $scope.scheduleModel.starting_object = data.starting_object;
      $scope.scheduleModel.instance_names  = data.instance_names;
      $scope.scheduleModel.target_classes  = data.target_classes;
      $scope.scheduleModel.targets         = data.targets;
      $scope.scheduleModel.instance_name   = data.instance_name;
      $scope.scheduleModel.object_message  = data.object_message;
      $scope.scheduleModel.object_request  = data.object_request;
      $scope.scheduleModel.target_class    = data.target_class;
      $scope.scheduleModel.target_id       = data.target_id;
      $scope.scheduleModel.ui_attrs        = data.ui_attrs;
      $scope.scheduleModel.log_aws_region       = data.log_aws_region;
      $scope.scheduleModel.openstack_region     = data.openstack_region;
      $scope.scheduleModel.keystone_api_version = data.keystone_api_version;
      $scope.scheduleModel.v3_domain_ident      = data.v3_domain_ident;
      $scope.scheduleModel.swift_api_port       = data.swift_api_port;
      $scope.scheduleModel.security_protocol    = data.security_protocol;

      $scope.setTimerType();

      $scope.timer_items        = timerOptionService.getOptions($scope.scheduleModel.timer_typ);

      if (data.filter_type === 'all' || (data.protocol !== undefined && data.protocol !== null)) {
        $scope.filterValuesEmpty = true;
      } else {
        buildFilterList(data);

        $scope.filterValuesEmpty = false;
        $scope.scheduleModel.filter_value     = data.filter_value;
      }

      if (data.filter_type === null &&
        (data.protocol !== undefined && data.protocol !== null && data.protocol !== 'Samba' && data.protocol !== 'AWS S3' && data.protocol !== 'OpenStack Swift')) {
        $scope.scheduleModel.filter_typ = 'all';
      }

      $scope.scheduleModel.log_password = '';
      if ($scope.scheduleModel.log_userid !== '') {
        $scope.scheduleModel.log_password = miqService.storedPasswordPlaceholder;
      }

      $scope.afterGet = true;
      $scope.modelCopy = angular.copy( $scope.scheduleModel );

      miqService.sparkleOff();
    }

    miqService.buildCalendar(oneMonthAgo.year, parseInt(oneMonthAgo.month, 10) + 1, oneMonthAgo.date);
  };

  var buildFilterList = function(data) {
    $scope.filterList = [];
    angular.forEach(data.filtered_item_list, function(filteredItem) {
      var tempObj = {};

      if (_.isArray(filteredItem)) {
        tempObj.text = filteredItem[1];
        tempObj.value = filteredItem[0];
      } else {
        tempObj.text = filteredItem;
        tempObj.value = filteredItem;
      }

      $scope.filterList.push(tempObj);
    });
  };

  var testType = function(type) {
    return type.test($scope.scheduleModel.action_typ);
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
      if ($scope.scheduleModel.action_typ === 'automation_request') {
        // should ignore list of targets as this list can be really long no need to send that up to server
        var moreUrlParams = $.param(miqService.serializeModelWithIgnoredFields($scope.scheduleModel, ['targets', 'time_zone']));
        if (moreUrlParams) {
          url += '&' + decodeURIComponent(moreUrlParams) + '&' + encodeURIComponent($scope.scheduleModel.time_zone);
        }
      }
      miqService.miqAjaxButton(url, serializeFields);
    }
  };

  $scope.buildLegend = function() {
    var type;

    if (isVmType()) {
      type = __('VM Selection');
    } else if (isHostType()) {
      type = __('Host Selection');
    } else if ($scope.scheduleModel.action_typ === 'miq_template') {
      type = __('Template Selection');
    } else if ($scope.scheduleModel.action_typ === 'emscluster') {
      type = __('Cluster Selection');
    } else if ($scope.scheduleModel.action_typ === 'storage') {
      type = __('Datastore Selection');
    } else if ($scope.scheduleModel.action_typ === 'db_backup') {
      type = __('Database Backup Selection');
    } else if ($scope.scheduleModel.action_typ === 'automation_request') {
      type = __('Automate Tasks Selection');
    }

    return type;
  };

  $scope.determineActionType = function() {
    if (isVmType()) {
      return 'vm';
    } else if (isHostType()) {
      return 'host';
    }
    return $scope.scheduleModel.action_typ;
  };

  $scope.dbBackup = function() {
    return $scope.scheduleModel.action_typ === 'db_backup';
  };

  $scope.automateRequest = function() {
    return $scope.scheduleModel.action_typ === 'automation_request';
  };

  $scope.credsProtocol = function() {
    return $scope.dbBackup() && ($scope.scheduleModel.log_protocol === 'Samba' || $scope.scheduleModel.log_protocol === 'AWS S3' || $scope.scheduleModel.log_protocol === 'OpenStack Swift');
  };

  $scope.s3Backup = function() {
    return $scope.dbBackup() && $scope.scheduleModel.log_protocol === 'AWS S3';
  };

  $scope.swiftBackup = function() {
    return $scope.dbBackup() && $scope.scheduleModel.log_protocol === 'OpenStack Swift';
  };

  $scope.actionTypeChanged = function() {
    if ($scope.dbBackup()) {
      $scope.scheduleModel.log_protocol = 'Network File System';
      $scope.scheduleModel.uri_prefix = 'nfs';
      $scope.scheduleModel.filter_typ = null;
    } else if ($scope.automateRequest()) {
      miqService.sparkleOn();

      $http.post('/ops/automate_schedules_set_vars/' + scheduleFormId)
        .then(postAutomateSchedulesSetVarsComplete)
        .catch(miqService.handleFailure);
    } else {
      $scope.scheduleModel.filter_typ = 'all';
    }
    $scope.scheduleModel.filter_value = '';

    $scope.filterValuesEmpty = true;

    function postAutomateSchedulesSetVarsComplete(response) {
      var data = response.data;

      $scope.scheduleModel.instance_names  = data.instance_names;
      $scope.scheduleModel.target_classes  = data.target_classes;
      $scope.scheduleModel.targets         = data.targets;
      $scope.scheduleModel.starting_object = data.starting_object;
      $scope.scheduleModel.instance_name   = data.instance_name;
      $scope.scheduleModel.object_message  = data.object_message;
      $scope.scheduleModel.object_request  = data.request;
      $scope.scheduleModel.target_class    = data.target_class;
      $scope.scheduleModel.target_id       = data.target_id;
      $scope.scheduleModel.targets         = [];
      $scope.scheduleModel.filter_typ      = null;
      $scope.scheduleModel.ui_attrs        = data.ui_attrs;
      miqService.sparkleOff();
    }
  };

  $scope.targetClassChanged = function(targetClass) {
    miqService.sparkleOn();
    $scope.scheduleModel.target_class = targetClass;
    $http.post('/ops/fetch_target_ids/?target_class=' + $scope.scheduleModel.target_class)
      .then(postFetchTargetIdsComplete)
      .catch(miqService.handleFailure);

    function postFetchTargetIdsComplete(response) {
      var data = response.data;

      $scope.scheduleModel.target_id = data.target_id;
      $scope.scheduleModel.targets = data.targets;
      miqService.sparkleOff();
    }
  };

  $scope.filterTypeChanged = function() {
    if ($scope.scheduleModel.filter_typ != 'all') {
      miqService.sparkleOn();
      $http.post('/ops/schedule_form_filter_type_field_changed/' + scheduleFormId,
        {filter_type: $scope.scheduleModel.filter_typ,
          action_type: $scope.scheduleModel.action_typ})
        .then(postScheduleFormFilterTypeComplete)
        .catch(miqService.handleFailure);
    } else {
      $scope.scheduleModel.filter_value = '';
      $scope.filterValuesEmpty = true;
    }

    function postScheduleFormFilterTypeComplete(response) {
      var data = response.data;

      buildFilterList(data);
      $scope.filterValuesEmpty = false;
      miqService.sparkleOff();
    }
  };

  $scope.logProtocolChanged = function() {
    if ($scope.scheduleModel.log_protocol === 'Samba') {
      $scope.scheduleModel.uri_prefix = 'smb';
    }

    if ($scope.scheduleModel.log_protocol === 'Network File System') {
      $scope.updateLogProtocol('nfs');
    }

    if ($scope.scheduleModel.log_protocol === 'AWS S3') {
      $scope.updateLogProtocol('s3');
    }
    if ($scope.scheduleModel.log_protocol === 'OpenStack Swift') {
      $scope.updateLogProtocol('swift');
    }
  };

  $scope.updateLogProtocol = function(prefix) {
    $scope.scheduleModel.uri_prefix = prefix;
    $scope.$broadcast('resetClicked');
    $scope.scheduleModel.log_userid = $scope.modelCopy.log_userid;
    $scope.scheduleModel.log_password = $scope.modelCopy.log_password;
  };

  $scope.filterValueChanged = function() {
  };

  $scope.scheduleTimerTypeChanged = function() {
    $scope.setTimerType();

    $scope.timer_items = timerOptionService.getOptions($scope.scheduleModel.timer_typ);

    if ($scope.timerNotOnce()) {
      $scope.scheduleModel.timer_value = 1;
    } else {
      $scope.scheduleModel.timer_value = 0;
    }
  };

  $scope.timerNotOnce = function() {
    return $scope.scheduleModel.timer_typ !== 'Once';
  };

  $scope.cancelClicked = function() {
    scheduleEditButtonClicked('cancel');
  };

  $scope.resetClicked = function() {
    $scope.$broadcast('resetClicked');
    $scope.scheduleModel = angular.copy( $scope.modelCopy );

    if ($scope.dbBackup()) {
      $scope.filterValuesEmpty = true;
    }

    var filter_touched = $scope.angularForm.action_typ.$touched || (typeof $scope.angularForm.filter_typ != 'undefined' && $scope.angularForm.filter_typ.$touched);
    if (! $scope.dbBackup() && ! $scope.automateRequest() && $scope.scheduleModel.filter_typ && ! filter_touched) {
      // AJAX-less Reset
      $scope.toggleValueForWatch('filterValuesEmpty', false);
    }

    if (! $scope.dbBackup() && !! $scope.automateRequest() && $scope.scheduleModel.filter_typ && filter_touched) {
      $scope.filterTypeChanged();
    }

    if ($scope.scheduleModel.timer_typ && $scope.angularForm.timer_typ.$touched) {
      $scope.setTimerType();
      $scope.timer_items = timerOptionService.getOptions($scope.scheduleModel.timer_typ);
    }

    $scope.angularForm.$setUntouched(true);
    $scope.angularForm.$setPristine(true);
    miqService.miqFlash('warn', __('All changes have been reset'));
  };

  $scope.saveClicked = function() {
    scheduleEditButtonClicked('save', $scope.scheduleModel);
  };

  $scope.addClicked = function() {
    $scope.saveClicked();
  };

  $scope.filterValueRequired = function(value) {
    return ! $scope.filterValuesEmpty && ! value;
  };

  $scope.dbRequired = function(value) {
    return $scope.dbBackup() && ! value;
  };

  $scope.sambaRequired = function(value) {
    return $scope.sambaBackup() && ! value;
  };

  $scope.regionSelect = function() {
    return $scope.scheduleModel.log_protocol === 'AWS S3';
  };

  $scope.regionRequired = function() {
    return ($scope.s3Backup() && $scope.scheduleModel.log_aws_region === '');
  };

  $scope.swiftSecurityProtocolSelect = function() {
    return $scope.scheduleModel.action_typ === 'db_backup' && $scope.scheduleModel.log_protocol === 'OpenStack Swift';
  };

  $scope.swiftSecurityProtocolRequired = function() {
    return ($scope.swiftBackup() && $scope.scheduleModel.security_protocol === '');
  };

  $scope.s3Required = function(value) {
    return $scope.s3Backup() && ! value;
  };

  $scope.isBasicInfoValid = function() {
    return ($scope.angularForm.depot_name.$valid &&
      $scope.angularForm.uri.$valid &&
      $scope.angularForm.log_userid.$valid &&
      $scope.angularForm.log_password.$valid);
  };

  $scope.setTimerType = function() {
    $scope.timerTypeOnce = $scope.scheduleModel.timer_typ == 'Once';
  };

  $scope.toggleValueForWatch = function(watchValue, initialValue) {
    if ($scope[watchValue] == initialValue) {
      $scope[watchValue] = 'NO-OP';
    } else if ($scope[watchValue] == 'NO-OP') {
      $scope[watchValue] = initialValue;
    }
  };

  $scope.canValidate = function() {
    return $scope.isBasicInfoValid() && $scope.validateFieldsDirty();
  };

  $scope.canValidateBasicInfo = function() {
    return $scope.isBasicInfoValid();
  };

  $scope.validateFieldsDirty = function() {
    return ($scope.angularForm.depot_name.$dirty ||
        $scope.angularForm.uri.$dirty ||
        $scope.angularForm.log_userid.$dirty ||
        $scope.angularForm.log_password.$dirty);
  };

  $scope.setInstanceName = function(instanceName) {
    $scope.scheduleModel.instance_name = instanceName;
  };

  $scope.setObjectMessage = function(objectMessage) {
    $scope.scheduleModel.object_message = objectMessage;
  };

  $scope.setObjectRequest = function(objectRequest) {
    $scope.scheduleModel.object_request = objectRequest;
  };

  $scope.setTargetId = function(targetId) {
    $scope.scheduleModel.target_id = targetId;
  };

  init();
}]);
