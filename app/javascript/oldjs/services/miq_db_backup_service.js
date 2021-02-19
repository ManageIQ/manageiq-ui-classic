ManageIQ.angular.app.service('miqDBBackupService', function() {
  this.logProtocolNotSelected = function(model) {
    return model.log_protocol === '' || model.log_protocol === undefined;
  };

  this.logProtocolSelected = function(model) {
    return model.log_protocol !== '' && model.log_protocol !== undefined;
  };

  this.credsProtocol = function(model) {
    return (model.log_protocol === 'FileDepotSmb' || model.log_protocol === 'FileDepotS3' ||
            model.log_protocol === 'FileDepotFtp' || model.log_protocol === 'FileDepotSwift');
  };

  this.s3Backup = function(model) {
    return (model.log_protocol === 'FileDepotS3');
  };

  this.swiftBackup = function(model) {
    return (model.log_protocol === 'FileDepotSwift');
  };

  this.dbRequired = function(model, value) {
    if (model.log_protocol === '') { return false; }
    return this.logProtocolSelected(model) && this.isModelValueNil(value);
  };

  this.credsRequired = function(model, value) {
    return this.credsProtocol(model) &&
           (this.isModelValueNil(value));
  };

  this.awsRegionNotSelected = function(model) {
    return model.aws_region === '' || model.aws_region === undefined;
  };

  this.awsRegionSelected = function(model) {
    return model.aws_region !== '' && model.aws_region !== undefined;
  };

  this.badAwsRegionRequired = function(model, value) {
    return this.s3Backup(model) &&
           (this.isModelValueNil(value));
  };

  this.awsRegionRequired = function(model, value) {
    return model.log_protocol === 'FileDepotS3' &&
           (this.isModelValueNil(value));
  };

  this.swiftSecurityProtocolRequired = function(model, value) {
    return model.log_protocol === 'FileDepotSwift' &&
           (this.isModelValueNil(value));
  };

  this.isModelValueNil = function(value) {
    return value === undefined || value === null || value === '';
  };

  this.resetAll = function(model) {
    model.log_userid = null;
    model.log_password = null;
    model.uri_prefix = null;
    model.depot_name = null;
    model.uri = null;
    model.aws_region = null;
    model.openstack_region = null;
    model.keystone_api_version = null;
    model.security_protocol = null;
    model.v3_domain_ident = null;
  };
});
