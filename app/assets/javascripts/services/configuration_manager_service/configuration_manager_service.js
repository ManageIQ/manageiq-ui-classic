ManageIQ.angular.app.service('configurationManagerService', configurationManagerService);

configurationManagerService.$inject = ['miqService'];

function configurationManagerService(miqService) {
  this.managerModel = {
    name: '',
    url: '',
    zone: '',
    verify_ssl: '',
    default_userid: '',
    default_password: '',
    default_auth_status: false,
  };

  this.validateClicked = function($event, _authType, formSubmit, angularForm, url) {
    miqService.validateClicked($event, 'default', formSubmit, angularForm, url);
  };

  this.postValidationModelRegistry = function(prefix, newRecord, postValidationModel, formModel) {
    if (prefix === "default") {
      var defaulPassword;
      if (newRecord) {
        defaulPassword = formModel.default_password;
      } else {
        defaulPassword = formModel.default_password === "" ? "" : miqService.storedPasswordPlaceholder;
      }
      postValidationModel.default = {
        url: formModel.url,
        verify_ssl: formModel.verify_ssl,
        default_userid: formModel.default_userid,
        default_password: defaulPassword,
      };
    }
  };
}
