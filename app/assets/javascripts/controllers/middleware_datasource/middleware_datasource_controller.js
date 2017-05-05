ManageIQ.angular.app.controller('mwAddDatasourceController', MwAddDatasourceCtrl);

var ADD_DATASOURCE_EVENT = 'mwAddDatasourceEvent';

MwAddDatasourceCtrl.$inject = ['$scope', '$rootScope', 'miqService', 'mwAddDatasourceService'];

function MwAddDatasourceCtrl($scope, $rootScope, miqService, mwAddDatasourceService) {
  var vm = this;
  var dsPropsHash = function(dsProps) {
    var propsHash = {};
    dsProps.forEach(function(prop) {
      propsHash[prop.name] = prop.value;
    });
    return propsHash;
  };
  var makePayload = function() {
    return {
      'id': angular.element('#server_id').val(),
      'xaDatasource': vm.chooseDsModel.xaDatasource,
      'datasourceName': vm.step1DsModel.datasourceName,
      'jndiName': vm.step1DsModel.jndiName,
      'driverName': vm.step2DsModel.jdbcDriverName,
      'driverClass': vm.step2DsModel.driverClass,
      'datasourceProperties': dsPropsHash(vm.step3DsModel.dsProps),
      'connectionUrl': vm.step3DsModel.connectionUrl,
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
    dsAddPropertyName: '',
    dsAddPropertyValue: '',
  };

  vm.chooseDsModel.datasources = mwAddDatasourceService.getDatasources(vm.chooseDsModel.xaDatasource);

  $scope.$on(ADD_DATASOURCE_EVENT, function(_event, payload) {
    if (mwAddDatasourceService.isXaDriver(vm.step2DsModel.selectedJdbcDriver)) {
      angular.extend(payload,
        {
          xaDatasource: true,
          xaDatasourceClass: vm.step2DsModel.xaDsClass,
          driverClass: '',
        });
    }
    if (vm.step3DsModel.userName !== '' && vm.step3DsModel.password !== '') {
      angular.extend(payload,
        {
          userName: vm.step3DsModel.userName,
          password: vm.step3DsModel.password,
        });
    }
    if (vm.step3DsModel.securityDomain !== '') {
      angular.extend(payload,
        {
          securityDomain: vm.step3DsModel.securityDomain,
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

  $scope.$watch('vm.step2DsModel.selectedJdbcDriver', function(driverSelection) {
    if (driverSelection) {
      vm.step1DsModel.datasourceName = driverSelection.id;
      vm.step2DsModel.jdbcDriverName = driverSelection.label;
      vm.step2DsModel.jdbcModuleName = driverSelection.moduleName;
    }
    if (mwAddDatasourceService.isXaDriver(driverSelection)) {
      vm.step2DsModel.driverClass = driverSelection.xaDsClass;
    } else {
      vm.step2DsModel.driverClass = driverSelection.driverClass;
    }
  });

  vm.onXaChange = function() {
    vm.chooseDsModel.datasources = mwAddDatasourceService.getDatasources(vm.chooseDsModel.xaDatasource);
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

    mwAddDatasourceService.getExistingJdbcDrivers(serverId).then(function(drivers) {
      vm.step2DsModel.existingJdbcDrivers = vm.filterXa(vm.chooseDsModel.xaDatasource, drivers);
    }).catch(function(errorMsg) {
      miqService.miqFlash(errorMsg.data.status, errorMsg.data.msg);
    });
  };

  vm.filterXa = function(isXa, drivers) {
    var filteredDrivers;

    if (isXa) {
      filteredDrivers = _.filter(drivers, function(driver) { return driver.xaDsClass != null; });
    } else {
      filteredDrivers = _.filter(drivers, function(driver) { return driver.driverClass != null; });
    }
    return filteredDrivers;
  };

  vm.addDatasourceStep1Back = function() {
    vm.dsModel.step = 'CHOOSE_DS';
  };

  vm.addDatasourceStep2Next = function() {
    var selectedJdbcDriver = vm.step2DsModel.selectedJdbcDriver;
    var useExistingDriver = selectedJdbcDriver !== '';
    var dsSelection;
    vm.dsModel.step = 'STEP3';

    if (useExistingDriver) {
      dsSelection = mwAddDatasourceService.findDsSelectionFromDriver(selectedJdbcDriver);
      vm.step3DsModel.connectionUrl = mwAddDatasourceService.determineConnectionUrlFromExisting(selectedJdbcDriver);
    } else {
      dsSelection = vm.chooseDsModel.selectedDatasource;
      vm.step3DsModel.connectionUrl = mwAddDatasourceService.determineConnectionUrl(dsSelection);
    }
    if (dsSelection.hasOwnProperty('properties')) {
      var i = 0;
      for (var name in dsSelection.properties) {
        vm.step3DsModel.dsProps.push({id: i++, name: name, value: dsSelection.properties[name]});
      }
    }
  };

  vm.enableAddProperty = function() {
    return !!vm.step3DsModel.dsAddPropertyName || !!vm.step3DsModel.dsAddPropertyName;
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
    vm.step3DsModel.dsProps = [];
    vm.dsModel.step = 'STEP2';
  };

  vm.deleteDsProperty = function(id) {
    _.remove(vm.step3DsModel.dsProps, function(prop) {
      return prop.id === id;
    });
  };

  vm.addDsProperty = function(name, value) {
    vm.step3DsModel.dsProps.push({id: vm.step3DsModel.dsProps.length - 1, name: name, value: value});
    vm.step3DsModel.dsAddPropertyName = '';
    vm.step3DsModel.dsAddPropertyValue = '';
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
    vm.step3DsModel.dsAddPropertyName = '';
    vm.step3DsModel.dsAddPropertyValue = '';
    vm.step3DsModel.dsProps = [];
  };
}
