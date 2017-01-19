ManageIQ.angular.app.controller('mwAddDatasourceController', MwAddDatasourceCtrl);

var ADD_DATASOURCE_EVENT = 'mwAddDatasourceEvent';

MwAddDatasourceCtrl.$inject = ['$scope', '$rootScope', 'miqService', 'mwAddDatasourceService'];

function MwAddDatasourceCtrl($scope, $rootScope, miqService, mwAddDatasourceService) {
  var vm = this;
  var makePayload = function() {
    return {
      'id': angular.element('#server_id').val(),
      'xaDatasource': vm.chooseDsModel.xaDatasource,
      'datasourceName': vm.step1DsModel.datasourceName,
      'jndiName': vm.step1DsModel.jndiName,
      'driverName': vm.step2DsModel.jdbcDriverName,
      'driverClass': vm.step2DsModel.driverClass,
      'datasourceProperties': vm.step3DsModel.dsProps,
      'connectionUrl': vm.step3DsModel.connectionUrl,
      'userName': vm.step3DsModel.userName,
      'password': vm.step3DsModel.password,
      'securityDomain': vm.step3DsModel.securityDomain,
    };
  };

  vm.dsModel = {};
  vm.dsModel.step = 'CHOOSE_DS';

  vm.chooseDsModel = {
    xaDatasource: true,
    selectedDatasource: undefined,
    datasources: undefined,
  };

  vm.step1DsModel = {
    datasourceName: '',
    jndiName: '',
  };

  vm.step2DsModel = {
    jdbcDriverName: '',
    jdbcModuleName: '',
    driverClass: '',
    xaDsClass: '',
    selectedJdbcDriver: '',
    existingJdbcDrivers: [],
  };

  vm.step3DsModel = {
    validationRegex: /^jdbc:\S+$/,
    connectionUrl: '',
    userName: '',
    password: '',
    securityDomain: '',
    dsProps: [],
  };

  vm.chooseDsModel.datasources = mwAddDatasourceService.getXaDatasources();

  $scope.$on(ADD_DATASOURCE_EVENT, function(_event, payload) {
    if (mwAddDatasourceService.isXaDriver(vm.step2DsModel.selectedJdbcDriver)) {
      angular.extend(payload,
        {
          xaDatasource: true,
          xaDatasourceClass: vm.step2DsModel.xaDsClass,
          driverClass: '',
        });
    }

    mwAddDatasourceService.sendAddDatasource(payload).then(
      function(result) { // success
        miqService.miqFlash(result.data.status, result.data.msg);
      },
      function(_error) { // error
        miqService.miqFlash('error', __('Unable to install the Datasource on this server.'));
      });
    angular.element('#modal_ds_div').modal('hide');
    miqService.sparkleOff();
  });

  $scope.$watch(angular.bind(this, function() {
    return vm.step2DsModel.selectedJdbcDriver;
  }), function(driverSelection) {
    var dsSelection = mwAddDatasourceService.findDsSelectionFromDriver(driverSelection);
    if (dsSelection) {
      vm.step1DsModel.datasourceName = dsSelection.name;
      vm.step1DsModel.jndiName = dsSelection.jndiName;
      vm.step2DsModel.jdbcDriverName = dsSelection.driverName;
      vm.step3DsModel.connectionUrl = '';
    }
    if (mwAddDatasourceService.isXaDriver(driverSelection)) {
      vm.step2DsModel.xaDsClass = driverSelection.xaDsClass;
    } else {
      vm.step2DsModel.driverClass = driverSelection.driverClass;
    }
  });

  vm.onXaChange = function() {
    if (vm.chooseDsModel.xaDatasource) {
      vm.chooseDsModel.datasources = mwAddDatasourceService.getXaDatasources();
    } else {
      vm.chooseDsModel.datasources = mwAddDatasourceService.getDatasources();
    }
  };

  vm.addDatasourceChooseNext = function() {
    var dsSelection = vm.chooseDsModel.selectedDatasource;
    vm.dsModel.step = 'STEP1';
    vm.step1DsModel.datasourceName = dsSelection.name;
    vm.step1DsModel.jndiName = dsSelection.jndiName;
  };

  vm.addDatasourceStep1Next = function() {
    var dsSelection = vm.chooseDsModel.selectedDatasource;
    var serverId = angular.element('#server_id').val();
    vm.dsModel.step = 'STEP2';

    vm.step2DsModel.jdbcDriverName = dsSelection.driverName;
    vm.step2DsModel.jdbcModuleName = dsSelection.driverModuleName;
    vm.step2DsModel.driverClass = dsSelection.driverClass;

    mwAddDatasourceService.getExistingJdbcDrivers(serverId).then(function(result) {
      var filteredResult;
      if(vm.chooseDsModel.xaDatasource){
        filteredResult = _.filter(result, function(item) {
          return item.xaDsClass != null;
        });
      } else {
        filteredResult = _.filter(result, function(item) {
          return item.driverClass != null;
        });
      }
      vm.step2DsModel.existingJdbcDrivers = filteredResult;
    }).catch(function(errorMsg) {
      miqService.miqFlash(errorMsg.data.status, errorMsg.data.msg);
    });
  };

  vm.addDatasourceStep1Back = function() {
    vm.dsModel.step = 'CHOOSE_DS';
  };

  vm.addDatasourceStep2Next = function() {
    var useExistingDriver = vm.step2DsModel.selectedJdbcDriver !== '';
    var i = 0;
    vm.dsModel.step = 'STEP3';

    for(var name in vm.chooseDsModel.selectedDatasource.properties){
      vm.step3DsModel.dsProps.push({id: i, name: name, value: vm.chooseDsModel.selectedDatasource.properties[name]});
      i = i + 1;
    }

    if (useExistingDriver) {
      vm.step3DsModel.connectionUrl = mwAddDatasourceService.determineConnectionUrlFromExisting(vm.step2DsModel.selectedJdbcDriver);
    } else {
      vm.step3DsModel.connectionUrl = mwAddDatasourceService.determineConnectionUrl(vm.chooseDsModel.selectedDatasource);
    }
  };

  vm.addDatasourceStep2Back = function() {
    vm.dsModel.step = 'STEP1';
  };

  vm.finishAddDatasource = function() {
    var payload = Object.assign({}, makePayload());
    $rootScope.$broadcast(ADD_DATASOURCE_EVENT, payload);
    vm.reset();
  };

  vm.finishAddDatasourceBack = function() {
    vm.dsModel.step = 'STEP2';
  };

  vm.deleteDsProperty = function(id) {
    _.remove(vm.step3DsModel.dsProps, function(prop) {
      return prop.id === id;
    });
  };

  vm.reset = function() {
    angular.element('#modal_ds_div').modal('hide');
    $scope.dsAddForm.$setPristine();

    vm.dsModel.step = 'CHOOSE_DS';

    vm.chooseDsModel.selectedDatasource = '';
    vm.chooseDsModel.xaDatasource = true;

    vm.step1DsModel.datasourceName = '';
    vm.step1DsModel.jndiName = '';

    vm.step2DsModel.jdbcDriverName = '';
    vm.step2DsModel.jdbcModuleName = '';
    vm.step2DsModel.driverClass = '';
    vm.step2DsModel.xaDsClass = '';
    vm.step2DsModel.selectedJdbcDriver = '';

    vm.step3DsModel.connectionUrl = '';
    vm.step3DsModel.userName = '';
    vm.step3DsModel.password = '';
    vm.step3DsModel.securityDomain = '';
    vm.step3DsModel.dsProps = [];
  };
}
