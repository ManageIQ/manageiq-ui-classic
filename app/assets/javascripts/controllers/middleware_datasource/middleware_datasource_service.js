ManageIQ.angular.app.service('mwAddDatasourceService', MwAddDatasourceService);

MwAddDatasourceService.$inject = ['$http', '$q'];

function MwAddDatasourceService($http, $q) {
  var JDBC_PREFIX = 'jdbc:';
  var self = this;
  // NOTE: these are config objects that will basically never change
  var datasources = [
    {id: 'H2', label: 'H2', name: 'H2DS', jndiName: 'java:jboss/datasources/H2DS',
      driverName: 'h2', driverModuleName: 'com.h2database.h2', driverClass: 'org.h2.Driver',
      connectionUrl: ':mem:test;DB_CLOSE_DELAY=-1'},
    {id: 'POSTGRES', label: 'Postgres', name: 'PostgresDS', jndiName: 'java:jboss/datasources/PostgresDS',
      driverName: 'postresql', driverModuleName: 'org.postgresql', driverClass: 'org.postgresql.Driver',
      connectionUrl: '://localhost:5432/postgresdb', alias: 'POSTGRESQL'},
    {id: 'MSSQL', label: 'Microsoft SQL Server', name: 'MSSQLDS', jndiName: 'java:jboss/datasources/MSSQLDS',
      driverName: 'sqlserver', driverModuleName: 'com.microsoft',
      driverClass: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
      connectionUrl: '://localhost:1433;DatabaseName=MyDatabase'},
    {id: 'ORACLE', label: 'Oracle', name: 'OracleDS', jndiName: 'java:jboss/datasources/OracleDS',
      driverName: 'oracle', driverModuleName: 'com.oracle', driverClass: 'oracle.jdbc.driver.OracleDriver',
      connectionUrl: ':thin:@localhost:1521:oraclesid'},
    {id: 'DB2', label: 'IBM DB2', name: 'DB2DS', jndiName: 'java:jboss/datasources/DB2DS',
      driverName: 'ibmdb2', driverModuleName: 'com.ibm', driverClass: 'COM.ibm.db2.jdbc.app.DB2Driver',
      connectionUrl: '://db2'},
    {id: 'SYBASE', label: 'Sybase', name: 'SybaseDS', jndiName: 'java:jboss/datasources/SybaseDB',
      driverName: 'sybase', driverModuleName: 'com.sybase', driverClass: 'com.sybase.jdbc.SybDriver',
      connectionUrl: ':Tds:localhost:5000/mydatabase?JCONNECT_VERSION=6'},
    {id: 'MARIADB', label: 'MariaDB', name: 'MariaDBDS', jndiName: 'java:jboss/datasources/MariaDBDS',
       driverName: 'mariadb', driverModuleName: 'org.mariadb', driverClass: 'org.mariadb.jdbc.Driver',
       connectionUrl: '://localhost:3306/db_name'},
    {id: 'MYSQL', label: 'MySql', name: 'MySqlDS', jndiName: 'java:jboss/datasources/MySqlDS',
      driverName: 'mysql', driverModuleName: 'com.mysql', driverClass: 'com.mysql.jdbc.Driver',
      connectionUrl: '://localhost:3306/db_name'},
  ];
  var xaDatasources = [
    {id: 'H2', label: 'H2 XA', name: 'H2XADS', jndiName: 'java:/H2XADS',
      driverName: 'h2', driverModuleName: 'com.h2database.h2',
      driverClass: 'org.h2.jdbcx.JdbcDataSource',
      properties: {
        URL: 'jdbc:h2:mem:test',
      },
      connectionUrl: ':mem:test;DB_CLOSE_DELAY=-1'},
    {id: 'POSTGRES', label: 'Postgres XA', name: 'PostgresXADS',
      jndiName: 'java:/PostgresXADS',
      driverName: 'postresql',
      driverModuleName: 'org.postgresql',
      driverClass: 'org.postgresql.xa.PGXADataSource',
      properties: {
        DatabaseName: 'postgresdb',
        PortNumber: 5432,
        ServerName: 'servername',
      },
      connectionUrl: '://localhost:5432/postgresdb', alias: 'POSTGRESQL'},
    {id: 'MSSQL', label: 'Microsoft SQL Server XA', name: 'MSSQLXADS',
      jndiName: 'java:/MSSQLXADS',
      driverName: 'sqlserver', driverModuleName: 'com.microsoft',
      driverClass: 'com.microsoft.sqlserver.jdbc.SQLServerXADataSource',
      properties: {
        DatabaseName: 'MyDatabase',
        SelectMethod: 'cursor',
        ServerName: 'localhost',
      },
      connectionUrl: '://localhost:1433;DatabaseName=MyDatabase'},
    {id: 'ORACLE', label: 'Oracle XA', name: 'XAOracleDS',
      jndiName: 'java:/XAOracleDS',
      driverName: 'oracle', driverModuleName: 'com.oracle',
      driverClass: 'oracle.jdbc.xa.client.OracleXADataSource',
      properties: {
        URL: 'jdbc:oracle:oci8',
      },
      connectionUrl: ':thin:@localhost:1521:oraclesid'},
    {id: 'DB2', label: 'IBM DB2 XA', name: 'DB2XADS',
      jndiName: 'java:/DB2XADS',
      driverName: 'ibmdb2', driverModuleName: 'com.ibm',
      driverClass: 'COM.ibm.db2.jdbc.DB2XADataSource',
      properties: {
        DatabaseName: 'ibmdb2db',
        PortNumber: 446,
        ServerName: 'localhost',
      },
      connectionUrl: '://db2'},
    {id: 'SYBASE', label: 'Sybase XA', name: 'SybaseXADS',
      jndiName: 'java:/SybaseXADS',
      driverName: 'sybase', driverModuleName: 'com.sybase',
      driverClass: 'com.sybase.jdbc4.jdbc.SybXADataSource',
      properties: {
        DatabaseName: 'mydatabase',
        NetworkProtocol: 'Tds',
        PortNumber: 4100,
        ServerName: 'localhost',
      },
      connectionUrl: ':Tds:localhost:4100/mydatabase?JCONNECT_VERSION=6'},
    {id: 'MARIADB', label: 'MariaDB XA', name: 'MariaDBDS',
      jndiName: 'java:jboss/datasources/MariaDBDS',
      driverName: 'mariadb', driverModuleName: 'org.mariadb',
      driverClass: '??',
      connectionUrl: '://localhost:3306/db_name'},
    {id: 'MYSQL', label: 'MySql XA', name: 'MySqlDS',
      jndiName: 'java:/MysqlXADS',
      driverName: 'mysql', driverModuleName: 'com.mysql',
      driverClass: 'com.mysql.jdbc.jdbc2.optional.MysqlXADataSource',
      properties: {
        DatabaseName: 'mydatabase',
        NetworkProtocol: 'Tds',
        PortNumber: 4100,
        ServerName: 'localhost',
      },
      connectionUrl: '://localhost:4100/db_name'},
  ];

  self.getExistingJdbcDrivers = function(serverId) {
    var deferred = $q.defer();
    var BASE_URL = '/middleware_server/jdbc_drivers';
    var parameterizedUrl = BASE_URL + '?server_id=' + serverId;

    $http.get(parameterizedUrl).then(function(driverData) {
      var transformedData = _.chain(driverData.data.data)
        .map(function(driver) {
          return {'id': driver.properties['Driver Name'].toUpperCase(),
                  'label': driver.properties['Driver Name'],
                  'xaDsClass': driver.properties['XA DS Class'],
                  'driverClass': driver.properties['Driver Class']};
      })
      .value();

      deferred.resolve(transformedData);
    }).catch(function(errorMsg) {
      deferred.reject(errorMsg);
    });
    return deferred.promise;
  };

  self.getDatasources = function() {
    return Object.freeze(datasources);
  };

  self.getXaDatasources = function() {
    return Object.freeze(xaDatasources);
  };

  self.isXaDriver = function(driver) {
    return driver.hasOwnProperty('xaDsClass') && !!driver.xaDsClass;
  };

  self.determineConnectionUrl = function(dsSelection) {
    var driverName = dsSelection.driverName;
    return JDBC_PREFIX + driverName + dsSelection.connectionUrl;
  };

  self.isValidDatasourceName = function(dsName, isXa) {
    var dsContainer = isXa ? xaDatasources : datasources;
    var dsDriverNames = _.pluck(dsContainer, 'driverName');
    if (dsName) {
      return _.contains(dsDriverNames, dsName.toLowerCase());
    } else {
      return null;
    }
  };

  self.findDatasourceById = function(id, isXa) {
    var aDatasources = isXa ? xaDatasources : datasources;
    return _.find(aDatasources, function(datasource) {
      // handle special case when JDBC Driver Name doesn't match naming of Datasource
      // For instance, 'POSTGRES' vs 'POSTGRESQL'
      // in this case an 'alias' in the datasource configuration is used
      if (datasource.hasOwnProperty('alias')) {
        return datasource.alias === id;
      } else {
        return datasource.driverName.toUpperCase() === id;
      }
    });
  };

  self.findDatasourceByDriverClass = function(driverClass, isXa) {
    var dsContainer = isXa ? xaDatasources : datasources;

    if (isXa) {
      return _.find(dsContainer, function(datasource) {
        return datasource.driverClass === driverClass;
      });
    } else {
      return _.find(dsContainer, function(datasource) {
        return datasource.driverClass === driverClass;
      });
    }
  };

  self.findDsSelectionFromDriver = function(driverSelection) {
    var datasourceSelection = {};
    var isXa = self.isXaDriver(driverSelection);

    if (self.isValidDatasourceName(driverSelection.id, isXa)) {
      datasourceSelection = self.findDatasourceById(driverSelection.id, isXa);
    } else {
      var driverClass = isXa ? driverSelection.xaDsClass : driverSelection.driverClass;
      datasourceSelection = self.findDatasourceByDriverClass(driverClass, isXa);
    }
    return datasourceSelection;
  };

  self.determineConnectionUrlFromExisting = function(driverSelection) {
    var dsSelection = self.findDsSelectionFromDriver(driverSelection);
    return JDBC_PREFIX + dsSelection.driverName + dsSelection.connectionUrl;
  };

  self.sendAddDatasource = function(payload) {
    return $http.post('/middleware_server/add_datasource', angular.toJson(payload));
  };
}

