ManageIQ.angular.app.component('editLogDepotSettings', {
  bindings: {
    depotNameRequired: "<",
    depotName: '<',
    readonly: '<',
    depotNameChanged: '&',
    depotUriRequired: '<',
    depotUri: '<',
    depotUriPrefix: '<',
    depotUriPrefixDisplay: '<',
    depotUriChanged: '&',
  },
  templateUrl: '/static/edit_log_depot_settings/edit-log-depot-settings-component.html.haml',
});
